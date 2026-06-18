import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Plus, Send, Trash2 } from "lucide-react";
import { getPersona } from "@/lib/personas";
import {
  deleteThread,
  loadThreads,
  newThreadId,
  titleFromMessages,
  upsertThread,
  type Thread,
} from "@/lib/chat-storage";

export const Route = createFileRoute("/persona/$personaId/$threadId")({
  component: ChatPage,
});

function ChatPage() {
  const { personaId, threadId } = Route.useParams();
  const persona = getPersona(personaId);
  const navigate = useNavigate();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Carrega threads + mensagens iniciais desta thread
  const initialMessages = useMemo<UIMessage[]>(() => {
    const all = loadThreads(personaId);
    setThreads(all);
    return all.find((t) => t.id === threadId)?.messages ?? [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaId, threadId]);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { personaId } }),
    [personaId],
  );

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Persiste no localStorage quando mensagens mudam (após streaming)
  useEffect(() => {
    if (messages.length === 0) return;
    if (status === "streaming" || status === "submitted") return;
    const thread: Thread = {
      id: threadId,
      title: titleFromMessages(messages),
      updatedAt: Date.now(),
      messages,
    };
    const updated = upsertThread(personaId, thread);
    setThreads(updated);
  }, [messages, status, personaId, threadId]);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isLoading]);

  // Foco no input ao montar e ao trocar de thread
  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  if (!persona) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-600">
        Persona não encontrada.{" "}
        <Link to="/" className="ml-2 underline">
          voltar
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    void sendMessage({ text });
  }

  function handleNewThread() {
    const id = newThreadId();
    navigate({ to: "/persona/$personaId/$threadId", params: { personaId, threadId: id } });
  }

  function handleDeleteThread(id: string) {
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
  }

  function usePrompt(text: string) {
    setInput(text);
    inputRef.current?.focus();
  }

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-stone-200 bg-white md:flex">
        <div className="border-b border-stone-200 p-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-stone-500 hover:text-stone-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Todas as personas
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <img
              src={persona.avatar}
              alt={persona.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-serif text-base text-stone-900">{persona.name}</p>
              <p className="truncate text-xs text-stone-500">{persona.role}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 pt-4">
          <span className="text-xs uppercase tracking-widest text-stone-500">
            Conversas
          </span>
          <button
            onClick={handleNewThread}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-emerald-800 hover:bg-emerald-50"
          >
            <Plus className="h-3.5 w-3.5" /> Nova
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {threads.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-stone-400">
              Suas conversas aparecerão aqui.
            </p>
          )}
          {threads.map((t) => {
            const active = t.id === threadId;
            return (
              <div
                key={t.id}
                className={`group flex items-center gap-1 rounded-lg px-2 py-2 text-sm ${
                  active ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <button
                  onClick={() =>
                    navigate({
                      to: "/persona/$personaId/$threadId",
                      params: { personaId, threadId: t.id },
                    })
                  }
                  className="flex-1 truncate text-left"
                >
                  {t.title}
                </button>
                <button
                  onClick={() => handleDeleteThread(t.id)}
                  className="rounded p-1 text-stone-400 opacity-0 hover:text-red-600 group-hover:opacity-100"
                  aria-label="Apagar conversa"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Chat */}
      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-3 md:hidden">
          <Link to="/" className="text-sm text-stone-600">
            ← Personas
          </Link>
          <span className="font-serif text-base text-stone-900">{persona.name}</span>
          <button onClick={handleNewThread} className="text-sm text-emerald-800">
            Nova
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            {messages.length === 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <h1 className="font-serif text-2xl text-stone-900">{persona.name}</h1>
                    <p className="text-sm text-stone-500">{persona.tagline}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-stone-600">{persona.bio}</p>
                <div className="space-y-2 pt-2">
                  <p className="text-xs uppercase tracking-widest text-stone-500">
                    Sugestões para começar
                  </p>
                  {persona.suggestedPrompts.map((s) => (
                    <button
                      key={s}
                      onClick={() => usePrompt(s)}
                      className="block w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-left text-sm text-stone-700 transition hover:border-emerald-700 hover:text-stone-900"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} personaAvatar={persona.avatar} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-3 text-sm text-stone-500">
                  <img
                    src={persona.avatar}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="animate-pulse">Pensando…</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-stone-200 bg-white px-4 py-4 sm:px-6"
        >
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
              placeholder={`Pergunte algo a ${persona.name.split(" ")[0]}…`}
              className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function MessageBubble({
  message,
  personaAvatar,
}: {
  message: UIMessage;
  personaAvatar: string;
}) {
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-stone-900 px-4 py-2.5 text-sm leading-relaxed text-white">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <img src={personaAvatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
      <div className="prose prose-sm prose-stone max-w-none flex-1 text-stone-800">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
