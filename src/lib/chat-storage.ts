import type { UIMessage } from "ai";

export type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
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

export function saveThreads(personaId: string, threads: Thread[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY(personaId), JSON.stringify(threads));
}

export function upsertThread(personaId: string, thread: Thread): Thread[] {
  const all = loadThreads(personaId);
  const idx = all.findIndex((t) => t.id === thread.id);
  if (idx >= 0) all[idx] = thread;
  else all.unshift(thread);
  all.sort((a, b) => b.updatedAt - a.updatedAt);
  saveThreads(personaId, all);
  return all;
}

export function deleteThread(personaId: string, threadId: string): Thread[] {
  const all = loadThreads(personaId).filter((t) => t.id !== threadId);
  saveThreads(personaId, all);
  return all;
}

export function newThreadId(): string {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function titleFromMessages(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "Nova conversa";
  const text = first.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
  if (!text) return "Nova conversa";
  return text.length > 48 ? text.slice(0, 48) + "…" : text;
}
