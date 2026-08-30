import { createFileRoute } from "@tanstack/react-router";
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { guardApiRequest } from "@/lib/api-guard.server";
import { getSystemPrompt } from "@/lib/personas.server";

type ChatBody = {
  personaId?: string;
  forcedInterest?: string | null;
  messages?: MessageParam[];
};

const MODEL = "claude-sonnet-4-6";
const VALID_INTEREST = new Set(["ALTO", "MÉDIO", "BAIXO"]);
const MAX_BODY_BYTES = 20 * 1024 * 1024; // 20 MB

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guardResponse = guardApiRequest(request);
        if (guardResponse) return guardResponse;

        const contentLength = Number(request.headers.get("content-length") ?? 0);
        if (contentLength > MAX_BODY_BYTES) {
          return new Response("Payload too large", { status: 413 });
        }

        let body: ChatBody;
        try {
          body = (await request.json()) as ChatBody;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const { personaId, messages } = body;
        const forcedInterest =
          body.forcedInterest != null
            ? VALID_INTEREST.has(body.forcedInterest)
              ? body.forcedInterest
              : null
            : null;

        if (!personaId || !Array.isArray(messages) || messages.length === 0) {
          return new Response("personaId and messages are required", { status: 400 });
        }

        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey) return new Response("Configuração do servidor incorreta", { status: 500 });

        let system: string;
        try {
          system = getSystemPrompt(personaId, forcedInterest ?? null);
        } catch {
          return new Response("Persona não encontrada", { status: 404 });
        }

        const client = new Anthropic({ apiKey });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            const send = (obj: unknown) =>
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
            try {
              const mStream = client.messages.stream({
                model: MODEL,
                max_tokens: 1000,
                system,
                messages,
              });
              let inputTokens = 0;
              let outputTokens = 0;
              for await (const event of mStream) {
                if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                  send({ type: "text", text: event.delta.text });
                } else if (event.type === "message_start") {
                  inputTokens = event.message.usage?.input_tokens ?? 0;
                } else if (event.type === "message_delta") {
                  outputTokens = event.usage?.output_tokens ?? 0;
                }
              }
              send({ type: "done", inputTokens, outputTokens });
            } catch (err) {
              console.error("[/api/chat] stream error:", err);
              send({ type: "error", message: "Erro interno ao processar resposta." });
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
