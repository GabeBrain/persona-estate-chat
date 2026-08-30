type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 30;
const HEADER_NAME = "x-persona-api-token";

const buckets = new Map<string, RateLimitEntry>();

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function clientIp(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return request.headers.get("x-real-ip") ?? "unknown";
}

function checkApiToken(request: Request): Response | null {
  const expected = process.env.PERSONA_API_TOKEN?.trim();
  if (!expected) return null;

  const received = request.headers.get(HEADER_NAME)?.trim();
  if (received === expected) return null;

  return new Response("Nao autorizado", { status: 401 });
}

function checkRateLimit(request: Request): Response | null {
  const windowMs = envNumber("PERSONA_RATE_LIMIT_WINDOW_MS", DEFAULT_WINDOW_MS);
  const maxRequests = envNumber("PERSONA_RATE_LIMIT_MAX", DEFAULT_MAX_REQUESTS);
  const now = Date.now();
  const key = `${clientIp(request)}:${new URL(request.url).pathname}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;
  if (current.count <= maxRequests) return null;

  const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return new Response("Muitas requisicoes. Tente novamente em instantes.", {
    status: 429,
    headers: { "Retry-After": String(retryAfter) },
  });
}

export function guardApiRequest(request: Request): Response | null {
  return checkApiToken(request) ?? checkRateLimit(request);
}
