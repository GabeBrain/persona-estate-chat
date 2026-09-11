import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import brainLogo from "@/assets/logo-brain.png";
import {
  ArrowLeft,
  Bug,
  Download,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Plus,
  RotateCcw,
  Send,
  StopCircle,
  Trash2,
  X,
} from "lucide-react";
import {
  getPersona,
  normalizeInteresse,
  PERSONAS,
  type InterestLevel,
  type PersonaContext,
} from "@/lib/personas";
import {
  deleteThread,
  fileToBase64,
  isValidAttachment,
  loadThreads,
  messageText,
  newThreadId,
  titleFromMessages,
  toApiMessages,
  upsertThread,
  type ChatMessage,
  type Thread,
} from "@/lib/chat-storage";

export const Route = createFileRoute("/persona/$personaId/$threadId")({
  component: ChatPage,
});

const MAX_ATTACHMENTS = 5;

function friendlyApiError(msg: string): string {
  if (msg === "HTTP 413") {
    return "Os anexos desta conversa ficaram grandes demais para a API. Remova algum anexo ou envie as imagens em mensagens separadas.";
  }
  return msg;
}

const CONTEXT_LABELS: Record<PersonaContext, string> = {
  plaenge: "PLAENGE — Gov. Celso Ramos/SC",
  aquiraz: "Novo Mandara — Porto das Dunas/CE",
  prudente: "Presidente Prudente — Horizontal",
  campo_alegre: "Monte Sereno — Campo Alegre/SC",
  alta_floresta: "Grupo Almeida Prado — Alta Floresta/MT",
};
const CONTEXT_ORDER: PersonaContext[] = [
  "plaenge",
  "aquiraz",
  "prudente",
  "campo_alegre",
  "alta_floresta",
];

// --- JSON parsing helpers (mirror POC) -----------------------------

function stripCodeFences(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function extractProgressiveFala(raw: string): string | null {
  const match = raw.match(/"fala"\s*:\s*"([\s\S]*)/);
  if (!match) return null;
  const content = match[1];
  const endMatch = content.match(/^([\s\S]*?)"\s*,?\s*"interesse"/);
  const slice = endMatch ? endMatch[1] : content.replace(/\\$/, "");
  return slice
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function parseModelResponse(raw: string): { fala: string; interesse: InterestLevel } {
  const cleaned = stripCodeFences(raw);
  try {
    const parsed = JSON.parse(cleaned) as { fala?: string; interesse?: string };
    return {
      fala: parsed.fala ?? cleaned,
      interesse: normalizeInteresse(parsed.interesse),
    };
  } catch {
    const falaMatch = cleaned.match(/"fala"\s*:\s*"([\s\S]*?)"\s*,?\s*(?:"interesse"|$)/);
    const interesseMatch = cleaned.match(/"interesse"\s*:\s*"([^"]+)"/i);
    const fala = falaMatch
      ? falaMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\")
      : cleaned;
    return { fala, interesse: normalizeInteresse(interesseMatch?.[1]) };
  }
}

// --- SSE streaming -------------------------------------------------

type StreamOpts = {
  messages: ChatMessage[];
  personaId: string;
  forcedInterest: InterestLevel | null;
  signal?: AbortSignal;
  onChunk: (text: string) => void;
  onDone: (info: { inputTokens: number; outputTokens: number }) => void;
  onError: (msg: string) => void;
};

function apiHeaders(): HeadersInit {
  const token = import.meta.env.VITE_PERSONA_API_TOKEN;
  return token
    ? { "Content-Type": "application/json", "X-Persona-Api-Token": token }
    : { "Content-Type": "application/json" };
}

async function streamChat({
  messages,
  personaId,
  forcedInterest,
  signal,
  onChunk,
  onDone,
  onError,
}: StreamOpts) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        messages: toApiMessages(messages),
        personaId,
        forcedInterest,
      }),
      signal,
    });
    if (!res.ok || !res.body) {
      onError(`HTTP ${res.status}`);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const payload = JSON.parse(line.slice(6));
          if (payload.type === "text") onChunk(payload.text);
          else if (payload.type === "done")
            onDone({ inputTokens: payload.inputTokens, outputTokens: payload.outputTokens });
          else if (payload.type === "error") onError(payload.message);
        } catch {
          /* ignore */
        }
      }
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") return;
    onError((e as Error).message);
  }
}

// --- Evaluation result --------------------------------------------

type Evaluation = {
  resumo: string;
  nivel_interesse_final: string;
  principais_objecoes: string[];
  pontos_positivos: string[];
  proximos_passos: string[];
};

// --- Component -----------------------------------------------------

function ChatPage() {
  const { personaId, threadId } = Route.useParams();
  const persona = getPersona(personaId);
  const navigate = useNavigate();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState("");
  const [tokenInfo, setTokenInfo] = useState({ input: 0, output: 0 });
  const [debugMode, setDebugMode] = useState(false);

  const [interestLevel, setInterestLevel] = useState<InterestLevel>(
    persona?.initialInterest ?? "MÉDIO",
  );
  const [forcedInterest, setForcedInterest] = useState<InterestLevel | null>(null);
  const [isManualInterest, setIsManualInterest] = useState(false);

  const [attachedFiles, setAttachedFiles] = useState<
    { name: string; type: string; base64: string }[]
  >([]);
  const [dragOver, setDragOver] = useState(false);

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [showFullPersona, setShowFullPersona] = useState(false);
  const [personaMd, setPersonaMd] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load threads + messages for current thread
  useEffect(() => {
    if (!persona) return;
    const all = loadThreads(personaId);
    setThreads(all);
    const current = all.find((t) => t.id === threadId);
    setMessages(current?.messages ?? []);
    setStreamingContent("");
    setEvaluation(null);
    setError("");
    setForcedInterest(null);
    setIsManualInterest(false);
    setInterestLevel(persona.initialInterest);
    setAttachedFiles([]);
  }, [personaId, threadId, persona]);

  // Load persona markdown
  useEffect(() => {
    if (!persona) return;
    fetch(persona.markdownPath)
      .then((r) => (r.ok ? r.text() : ""))
      .then(setPersonaMd)
      .catch(() => setPersonaMd(""));
  }, [persona]);

  // Persist when not streaming
  useEffect(() => {
    if (messages.length === 0 || streaming) return;
    const thread: Thread = {
      id: threadId,
      title: titleFromMessages(messages),
      updatedAt: Date.now(),
      messages,
    };
    const { threads: updated, saved } = upsertThread(personaId, thread);
    setThreads(updated);
    if (!saved)
      setError(
        "Armazenamento local cheio mesmo após remover anexos antigos. Exporte a conversa ou apague threads antigas.",
      );
  }, [messages, streaming, personaId, threadId]);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streamingContent]);

  // Focus input on thread change
  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  const handleFilesAttach = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const invalid = files.some((f) => !isValidAttachment(f));
    if (invalid) setError("Apenas imagens ou PDFs.");
    const valid = files.filter(isValidAttachment);
    if (valid.length === 0) return;

    let attachErr: string | null = null;
    const converted: { name: string; type: string; base64: string }[] = [];
    for (const file of valid) {
      try {
        const { base64, mediaType } = await fileToBase64(file);
        converted.push({ name: file.name, type: mediaType, base64 });
      } catch (e) {
        attachErr = "Erro ao processar arquivo: " + (e as Error).message;
      }
    }

    setAttachedFiles((prev) => {
      const room = MAX_ATTACHMENTS - prev.length;
      if (room <= 0) {
        setError(`Máximo de ${MAX_ATTACHMENTS} anexos por mensagem.`);
        return prev;
      }
      if (converted.length > room) {
        setError(`Máximo de ${MAX_ATTACHMENTS} anexos por mensagem.`);
      }
      return [...prev, ...converted.slice(0, room)];
    });
    if (attachErr) setError(attachErr);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFilesAttach(Array.from(e.dataTransfer.files));
  };

  // Paste image(s) from clipboard
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (!e.clipboardData) return;
      const files = Array.from(e.clipboardData.items)
        .filter((i) => i.type.startsWith("image/"))
        .map((i) => i.getAsFile())
        .filter((f): f is File => f !== null);
      if (files.length > 0) handleFilesAttach(files);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFilesAttach]);

  const runEvaluation = useCallback(async () => {
    if (messages.length === 0) {
      setError("Inicie a entrevista antes de encerrá-la.");
      return;
    }
    setEvaluating(true);
    setError("");
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ messages: toApiMessages(messages), personaId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as Evaluation;
      setEvaluation(json);
    } catch (e) {
      setError("Erro ao gerar avaliação: " + friendlyApiError((e as Error).message));
    } finally {
      setEvaluating(false);
    }
  }, [messages, personaId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!persona) return;
      if ((!text.trim() && attachedFiles.length === 0) || streaming) return;

      if (text.trim().toLowerCase() === "/encerrar") {
        setInput("");
        await runEvaluation();
        return;
      }

      let userContent: ChatMessage["content"];
      if (attachedFiles.length > 0) {
        const blocks: ChatMessage["content"] = attachedFiles.map((f) =>
          f.type === "application/pdf"
            ? {
                type: "document" as const,
                source: {
                  type: "base64" as const,
                  media_type: "application/pdf" as const,
                  data: f.base64,
                },
              }
            : {
                type: "image" as const,
                source: {
                  type: "base64" as const,
                  media_type: f.type,
                  data: f.base64,
                },
              },
        );
        if (text.trim()) blocks.push({ type: "text", text: text.trim() });
        userContent = blocks;
      } else {
        userContent = text.trim();
      }

      const userMessage: ChatMessage = {
        role: "user",
        content: userContent,
        ...(attachedFiles.length > 0 ? { _attachmentNames: attachedFiles.map((f) => f.name) } : {}),
      };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setAttachedFiles([]);
      setError("");
      setStreaming(true);
      setStreamingContent("");

      let accumulated = "";
      const controller = new AbortController();
      abortRef.current = controller;

      await streamChat({
        messages: newMessages,
        personaId,
        forcedInterest,
        signal: controller.signal,
        onChunk: (chunk) => {
          accumulated += chunk;
          const partial = extractProgressiveFala(accumulated);
          if (partial !== null) setStreamingContent(partial);
        },
        onDone: ({ inputTokens, outputTokens }) => {
          setTokenInfo({ input: inputTokens, output: outputTokens });
          const { fala, interesse } = parseModelResponse(accumulated);
          if (!forcedInterest) setInterestLevel(interesse);
          setMessages((prev) => [...prev, { role: "assistant", content: fala }]);
          setStreamingContent("");
          setStreaming(false);
          abortRef.current = null;
          inputRef.current?.focus();
        },
        onError: (msg) => {
          setError("Erro na API: " + friendlyApiError(msg));
          setStreamingContent("");
          setStreaming(false);
          abortRef.current = null;
        },
      });
    },
    [persona, attachedFiles, streaming, messages, personaId, forcedInterest, runEvaluation],
  );

  const stopStreaming = () => abortRef.current?.abort();

  const resetInterview = () => {
    if (!persona) return;
    setMessages([]);
    setStreamingContent("");
    setInterestLevel(persona.initialInterest);
    setForcedInterest(null);
    setIsManualInterest(false);
    setEvaluation(null);
    setError("");
    setTokenInfo({ input: 0, output: 0 });
    setAttachedFiles([]);
    // Also wipe persisted thread
    const { threads: updated } = upsertThread(personaId, {
      id: threadId,
      title: "Nova conversa",
      updatedAt: Date.now(),
      messages: [],
    });
    setThreads(updated);
    inputRef.current?.focus();
  };

  const exportTranscript = () => {
    if (!persona) return;
    const lines = messages.map((m) => {
      const role = m.role === "user" ? "ENTREVISTADOR" : persona.name.toUpperCase();
      let contentStr: string;
      if (typeof m.content === "string") contentStr = m.content;
      else {
        const attachNames = m._attachmentNames?.join(", ") ?? "anexo";
        const parts = [`[Anexo: ${attachNames}]`];
        const textBlock = m.content.find((b) => b.type === "text");
        if (textBlock && textBlock.type === "text") parts.push(textBlock.text);
        contentStr = parts.join("\n");
      }
      return `**${role}:**\n${contentStr}\n`;
    });
    const content = `# Transcrição — ${persona.name}\nData: ${new Date().toLocaleString("pt-BR")}\n\n---\n\n${lines.join("\n---\n\n")}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entrevista-${personaId}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewThread = () => {
    const id = newThreadId();
    navigate({ to: "/persona/$personaId/$threadId", params: { personaId, threadId: id } });
  };

  const handleDeleteThread = (id: string) => {
    const updated = deleteThread(personaId, id);
    setThreads(updated);
    if (id === threadId) {
      const next = updated[0]?.id ?? newThreadId();
      navigate({
        to: "/persona/$personaId/$threadId",
        params: { personaId, threadId: next },
        replace: true,
      });
    }
  };

  const handleInterestSelect = (level: InterestLevel) => {
    setInterestLevel(level);
    setForcedInterest(level);
    setIsManualInterest(true);
  };
  const handleClearManual = () => {
    setForcedInterest(null);
    setIsManualInterest(false);
  };

  if (!persona) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Persona não encontrada.{" "}
        <Link to="/" className="ml-2 underline">
          voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded p-1 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Menu"
          >
            ☰
          </button>
          <Link
            to="/"
            className="hidden items-center gap-2 text-muted-foreground hover:text-foreground sm:flex"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Personas</span>
          </Link>
          <img src={brainLogo} alt="Brain" className="hidden h-7 w-auto md:block" />
          <div className="flex items-center gap-2">
            <select
              value={personaId}
              onChange={(e) => {
                const nextId = e.target.value;
                const nextPersona = getPersona(nextId);
                if (nextPersona && nextPersona.context !== persona.context) {
                  // Contexto diferente (ex.: PLAENGE → Novo Mandara): não faz
                  // sentido continuar uma thread do produto anterior, então
                  // já abre uma conversa nova, sem modal de confirmação.
                  navigate({
                    to: "/persona/$personaId/$threadId",
                    params: { personaId: nextId, threadId: newThreadId() },
                  });
                } else {
                  navigate({
                    to: "/persona/$personaId",
                    params: { personaId: nextId },
                  });
                }
              }}
              className="rounded-lg border border-input bg-card px-3 py-1.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
            >
              {CONTEXT_ORDER.map((ctx) => (
                <optgroup key={ctx} label={CONTEXT_LABELS[ctx]}>
                  {PERSONAS.filter((p) => p.context === ctx).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <InterestBadge level={interestLevel} manual={isManualInterest} />

          <button
            onClick={exportTranscript}
            disabled={messages.length === 0}
            className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted disabled:opacity-40 sm:flex"
          >
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>

          <button
            onClick={resetInterview}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
          </button>

          <button
            onClick={() => setDebugMode((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs ${
              debugMode
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
            aria-label="Debug"
          >
            <Bug className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {debugMode && (
        <div className="flex flex-wrap gap-4 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          <span>
            Modelo: <code>claude-sonnet-4-6</code>
          </span>
          <span>
            Persona: <code>{personaId}</code>
          </span>
          <span>
            Forçado: <code>{forcedInterest ?? "none"}</code>
          </span>
          <span>
            Tokens in: <code>{tokenInfo.input}</code>
          </span>
          <span>
            Tokens out: <code>{tokenInfo.output}</code>
          </span>
          <span>
            Msgs: <code>{messages.length}</code>
          </span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "flex" : "hidden"
          } absolute inset-0 z-40 w-80 flex-col gap-4 overflow-y-auto border-r border-border bg-card p-4 lg:relative lg:z-auto lg:flex`}
        >
          <div className="flex items-center justify-between lg:hidden">
            <p className="text-sm font-semibold text-foreground">Ficha + Conversas</p>
            <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Persona identity */}
          <div className="flex items-center gap-3">
            <img
              src={persona.avatar}
              alt={persona.name}
              className="h-14 w-14 rounded-full object-cover"
            />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-foreground">{persona.name}</h2>
              <p className="text-xs text-muted-foreground">
                {persona.age} anos · {persona.city}
              </p>
              <p className="text-xs text-muted-foreground">{persona.occupation}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Stat label="Renda" value={persona.income} />
            <Stat label="Teto" value={persona.priceCeiling} />
            <Stat label="Produto" value={persona.preferredProduct} />
            <Stat label="Perfil" value={persona.profile} />
          </div>

          {persona.context === "aquiraz" && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Empreendimento:</span> Novo Mandara ·
              Apartamento vertical resort · Porto das Dunas/CE
            </p>
          )}

          {persona.context === "prudente" && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Empreendimento:</span> Condomínio
              horizontal de lotes · Região dos Damas · Presidente Prudente/SP
            </p>
          )}

          {persona.context === "campo_alegre" && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Empreendimento:</span> Condomínio
              Monte Sereno · Lotes de campo · Campo Alegre/SC
            </p>
          )}

          {persona.context === "alta_floresta" && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Empreendimento:</span> Grupo Almeida
              Prado · Lotes de alto padrão · Jardim Santa Cecília · Alta Floresta/MT
            </p>
          )}

          {/* Interest manual override */}
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Interesse
            </p>
            <div className="flex gap-1">
              {(["ALTO", "MÉDIO", "BAIXO"] as InterestLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleInterestSelect(lvl)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                    interestLevel === lvl
                      ? `${interestColor(lvl)} text-primary-foreground`
                      : "bg-muted text-muted-foreground hover:bg-accent/35 hover:text-foreground"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            {isManualInterest && (
              <button
                onClick={handleClearManual}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Voltar ao modo automático
              </button>
            )}
          </div>

          {/* Criteria */}
          <Collapsible title="Critérios de decisão">
            <ul className="space-y-2">
              {persona.decisionCriteria.map((c, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="font-bold text-primary">{i + 1}.</span>
                  {c}
                </li>
              ))}
            </ul>
          </Collapsible>

          {/* Objections */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Principais objeções
            </p>
            <ul className="space-y-1">
              {persona.mainObjections.map((o, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="text-destructive">✕</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>

          {personaMd && (
            <button
              onClick={() => setShowFullPersona(true)}
              className="text-left text-xs text-primary underline underline-offset-2 hover:text-secondary"
            >
              Ver persona completa →
            </button>
          )}

          {/* Threads list */}
          <div className="border-t border-border pt-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Conversas
              </span>
              <button
                onClick={handleNewThread}
                className="inline-flex items-center gap-1 rounded text-xs text-primary hover:text-secondary"
              >
                <Plus className="h-3.5 w-3.5" /> Nova
              </button>
            </div>
            <div className="space-y-1">
              {threads.length === 0 && (
                <p className="text-xs text-muted-foreground">Sem conversas ainda.</p>
              )}
              {threads.map((t) => {
                const active = t.id === threadId;
                return (
                  <div
                    key={t.id}
                    className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm ${
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    <button
                      onClick={() =>
                        navigate({
                          to: "/persona/$personaId/$threadId",
                          params: { personaId, threadId: t.id },
                        })
                      }
                      className="flex-1 truncate text-left text-xs"
                    >
                      {t.title}
                    </button>
                    <button
                      onClick={() => handleDeleteThread(t.id)}
                      className="rounded p-0.5 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                      aria-label="Apagar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chat area */}
        <main
          className="relative flex flex-1 flex-col overflow-hidden"
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
          }}
        >
          {dragOver && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-primary bg-muted/90">
              <p className="text-sm font-medium text-primary">Solte aqui para anexar</p>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
              {messages.length === 0 && !streaming && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={persona.avatar}
                      alt={persona.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <h1 className="text-2xl font-semibold text-foreground">{persona.name}</h1>
                      <p className="text-sm text-muted-foreground">{persona.tagline}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{persona.bio}</p>
                </div>
              )}

              <div className="space-y-6">
                {messages.map((m, i) => (
                  <MessageBubble key={i} message={m} persona={persona} />
                ))}
                {streaming && (
                  <div className="flex gap-3">
                    <img
                      src={persona.avatar}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                    <div className="flex-1 text-sm text-foreground">
                      {streamingContent ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{streamingContent}</p>
                      ) : (
                        <p className="animate-pulse text-muted-foreground">Pensando…</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-4 mb-2 flex items-start justify-between gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="mt-0.5 shrink-0 text-destructive/70 hover:text-destructive"
                aria-label="Fechar erro"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-border bg-card px-4 py-3 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-2">
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground"
                    >
                      {f.type === "application/pdf" ? (
                        <FileText className="h-4 w-4 text-destructive" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-primary" />
                      )}
                      <span className="max-w-[10rem] truncate">{f.name}</span>
                      <button
                        onClick={() => setAttachedFiles((prev) => prev.filter((_, j) => j !== i))}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Remover anexo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-end gap-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFilesAttach(Array.from(e.target.files ?? []));
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={streaming || evaluating}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted disabled:opacity-40"
                  aria-label="Anexar"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  rows={1}
                  disabled={evaluating}
                  placeholder={`Pergunte algo a ${persona.name.split(" ")[0]}…`}
                  className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                />

                {streaming ? (
                  <button
                    type="button"
                    onClick={stopStreaming}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    aria-label="Parar"
                  >
                    <StopCircle className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={evaluating || (!input.trim() && attachedFiles.length === 0)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-secondary disabled:opacity-40"
                    aria-label="Enviar"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </form>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Enter envia · Shift+Enter quebra linha · cole/arraste imagens ou PDF (até{" "}
                  {MAX_ATTACHMENTS}) · Empreendimento: {CONTEXT_LABELS[persona.context]}
                </p>
                <button
                  onClick={() => sendMessage("/encerrar")}
                  disabled={streaming || evaluating || messages.length === 0}
                  className="text-xs font-semibold text-primary hover:text-secondary disabled:opacity-40"
                >
                  {evaluating ? "Avaliando…" : "Encerrar entrevista"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Evaluation modal */}
      {evaluation && <EvalModal evaluation={evaluation} onClose={() => setEvaluation(null)} />}

      {/* Full persona modal */}
      {showFullPersona && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={() => setShowFullPersona(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <h3 className="text-lg font-semibold text-foreground">{persona.name}</h3>
              <button
                onClick={() => setShowFullPersona(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="prose prose-sm prose-stone max-w-none p-6">
              <ReactMarkdown>{personaMd}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Subcomponents ------------------------------------------------

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-3 py-2">
      <span className="block text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/25"
      >
        {title}
        <span className="text-muted-foreground">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}

function interestColor(level: InterestLevel): string {
  if (level === "ALTO") return "bg-primary";
  if (level === "BAIXO") return "bg-destructive";
  return "bg-amber-500";
}

function InterestBadge({ level, manual }: { level: InterestLevel; manual: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-primary-foreground ${interestColor(level)}`}
      title={manual ? "Definido manualmente" : "Estimado pela IA"}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
      Interesse: {level}
      {manual && <span className="ml-1 text-[10px] opacity-80">(manual)</span>}
    </span>
  );
}

function MessageBubble({
  message,
  persona,
}: {
  message: ChatMessage;
  persona: { avatar: string; name: string };
}) {
  const isUser = message.role === "user";
  const text = messageText(message);
  const hasImage =
    typeof message.content !== "string" && message.content.some((b) => b.type === "image");
  const hasPdf =
    typeof message.content !== "string" && message.content.some((b) => b.type === "document");

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] space-y-1">
          {(hasImage || hasPdf) && (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              {hasPdf ? (
                <FileText className="h-3.5 w-3.5" />
              ) : (
                <ImageIcon className="h-3.5 w-3.5" />
              )}
              {message._attachmentNames?.join(", ") ?? "anexo"}
            </div>
          )}
          {text && (
            <div className="rounded-2xl bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
              {text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <img src={persona.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
      <div className="flex-1 text-sm leading-relaxed text-foreground">
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

function EvalModal({ evaluation, onClose }: { evaluation: Evaluation; onClose: () => void }) {
  const { resumo, nivel_interesse_final, principais_objecoes, pontos_positivos, proximos_passos } =
    evaluation;
  const lvl = normalizeInteresse(nivel_interesse_final);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-primary px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-primary-foreground">Avaliação da Entrevista</h2>
            <p className="text-xs text-primary-foreground/80">Gerada automaticamente pela IA</p>
          </div>
          <button
            onClick={onClose}
            className="text-primary-foreground/80 hover:text-primary-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nível de interesse final
            </p>
            <InterestBadge level={lvl} manual={false} />
          </div>
          <Section title="Resumo">
            <p className="text-sm leading-relaxed text-foreground">{resumo}</p>
          </Section>
          <Section title="Principais objeções">
            <BulletList items={principais_objecoes} icon="✕" iconColor="text-destructive" />
          </Section>
          <Section title="Pontos positivos">
            <BulletList items={pontos_positivos} icon="✓" iconColor="text-primary" />
          </Section>
          <Section title="Próximos passos">
            <BulletList items={proximos_passos} icon="→" iconColor="text-primary" />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function BulletList({
  items,
  icon,
  iconColor,
}: {
  items: string[];
  icon: string;
  iconColor: string;
}) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2 text-sm text-foreground">
          <span className={`flex-shrink-0 font-bold ${iconColor}`}>{icon}</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
