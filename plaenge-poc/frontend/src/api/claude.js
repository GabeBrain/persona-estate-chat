const BASE = '/api';

/**
 * Streams a chat response from the persona.
 * Calls onChunk(text) for each token, onDone({inputTokens,outputTokens}) when finished.
 */
export async function streamChat({ messages, personaId, forcedInterest, onChunk, onDone, onError }) {
  // Strip display-only fields before sending to the API
  const apiMessages = messages.map(({ _attachmentName, _previewUrl, ...rest }) => rest);
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: apiMessages, personaId, forcedInterest: forcedInterest ?? null }),
  });

  if (!res.ok) {
    onError?.(`HTTP ${res.status}`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const payload = JSON.parse(line.slice(6));
        if (payload.type === 'text') onChunk?.(payload.text);
        if (payload.type === 'done') onDone?.(payload);
        if (payload.type === 'error') onError?.(payload.message);
      } catch {
        // ignore malformed lines
      }
    }
  }
}

/** Generates the evaluation panel (non-streaming). */
export async function fetchEvaluation(messages, personaId) {
  const apiMessages = messages.map(({ _attachmentName, _previewUrl, ...rest }) => rest);
  const res = await fetch(`${BASE}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: apiMessages, personaId }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Fetches all personas from the manifest. */
export async function fetchPersonas() {
  const res = await fetch(`${BASE}/personas`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Fetches the markdown content of a single persona. */
export async function fetchPersonaMarkdown(personaId) {
  const res = await fetch(`${BASE}/persona/${personaId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { content } = await res.json();
  return content;
}
