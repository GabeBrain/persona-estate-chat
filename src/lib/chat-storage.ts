// Chat message format compatible with Anthropic API.
// content is either string (plain text) or array of content blocks
// (text + image/document for attachments).

export type ContentBlock =
  | { type: "text"; text: string }
  | {
      type: "image";
      source: { type: "base64"; media_type: string; data: string };
    }
  | {
      type: "document";
      source: { type: "base64"; media_type: "application/pdf"; data: string };
    };

export type ChatMessage = {
  role: "user" | "assistant";
  content: string | ContentBlock[];
  // display-only metadata (stripped before sending to API)
  _attachmentNames?: string[];
};

export type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
};

const KEY = (personaId: string) => `chat:persona:${personaId}`;

export function loadThreads(personaId: string): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY(personaId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Thread[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Drop base64 attachment data from a message, keeping any text and a
// placeholder note so the conversation stays readable after pruning.
function stripAttachmentData(m: ChatMessage): ChatMessage {
  if (typeof m.content === "string") return m;
  const textBlock = m.content.find((b) => b.type === "text");
  const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
  const label = m._attachmentNames?.length
    ? `[Anexo(s) removido(s) por limite de armazenamento: ${m._attachmentNames.join(", ")}]`
    : "[Anexo removido por limite de armazenamento]";
  return { role: m.role, content: text ? `${label}\n${text}` : label };
}

function stripThreadAttachments(t: Thread): Thread {
  return { ...t, messages: t.messages.map(stripAttachmentData) };
}

// Attempts to persist `threads`; if the quota is exceeded, progressively
// strips attachment base64 data (oldest threads first) and retries so
// text history is never silently lost.
export function saveThreads(personaId: string, threads: Thread[]): boolean {
  if (typeof window === "undefined") return true;
  const key = KEY(personaId);
  try {
    window.localStorage.setItem(key, JSON.stringify(threads));
    return true;
  } catch (err) {
    console.warn("[chat-storage] localStorage quota exceeded, pruning attachments to retry:", err);
  }

  // Tier 1: strip attachments from every thread except the most recently
  // updated one (almost always the thread currently being written to).
  const mostRecentId = [...threads].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id;
  const tier1 = threads.map((t) => (t.id === mostRecentId ? t : stripThreadAttachments(t)));
  try {
    window.localStorage.setItem(key, JSON.stringify(tier1));
    return true;
  } catch (err) {
    console.warn("[chat-storage] still over quota after pruning older threads:", err);
  }

  // Tier 2: strip attachments everywhere, including the active thread.
  const tier2 = threads.map(stripThreadAttachments);
  try {
    window.localStorage.setItem(key, JSON.stringify(tier2));
    return true;
  } catch (err) {
    console.error("[chat-storage] localStorage still full after pruning all attachments:", err);
    return false;
  }
}

export function upsertThread(personaId: string, thread: Thread): { threads: Thread[]; saved: boolean } {
  const all = loadThreads(personaId);
  const idx = all.findIndex((t) => t.id === thread.id);
  if (idx >= 0) all[idx] = thread;
  else all.unshift(thread);
  all.sort((a, b) => b.updatedAt - a.updatedAt);
  const saved = saveThreads(personaId, all);
  return { threads: all, saved };
}

export function deleteThread(personaId: string, threadId: string): Thread[] {
  const all = loadThreads(personaId).filter((t) => t.id !== threadId);
  saveThreads(personaId, all);
  return all;
}

export function newThreadId(): string {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function messageText(m: ChatMessage): string {
  if (typeof m.content === "string") return m.content;
  return m.content
    .filter((b): b is { type: "text"; text: string } => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

export function titleFromMessages(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "Nova conversa";
  const text = messageText(first).trim();
  if (!text) return "Nova conversa";
  return text.length > 48 ? text.slice(0, 48) + "…" : text;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

const MAX_IMAGE_DIMENSION = 1600;

// Downscales large images before base64-encoding so multiple attachments
// don't blow up the request payload or localStorage quota as fast.
function downscaleImageDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
      if (scale >= 1) {
        resolve(dataUrl);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  const dataUrl = await readFileAsDataUrl(file);
  if (file.type.startsWith("image/")) {
    const resized = await downscaleImageDataUrl(dataUrl);
    const [header, data] = resized.split(",");
    const mediaType = header.match(/data:(.*?);/)?.[1] ?? file.type;
    return { base64: data, mediaType };
  }
  return { base64: dataUrl.split(",")[1], mediaType: file.type };
}

export function isValidAttachment(file: File): boolean {
  return file.type.startsWith("image/") || file.type === "application/pdf";
}

// Strip display-only fields before sending to API
export function toApiMessages(messages: ChatMessage[]) {
  return messages.map(({ _attachmentNames: _a, ...rest }) => rest);
}
