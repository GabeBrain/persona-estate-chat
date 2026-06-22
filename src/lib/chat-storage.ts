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
  _attachmentName?: string;
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

export function saveThreads(personaId: string, threads: Thread[]): boolean {
  if (typeof window === "undefined") return true;
  try {
    window.localStorage.setItem(KEY(personaId), JSON.stringify(threads));
    return true;
  } catch (err) {
    console.warn("[chat-storage] localStorage quota exceeded:", err);
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

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

export function isValidAttachment(file: File): boolean {
  return file.type.startsWith("image/") || file.type === "application/pdf";
}

// Strip display-only fields before sending to API
export function toApiMessages(messages: ChatMessage[]) {
  return messages.map(({ _attachmentName: _a, ...rest }) => rest);
}
