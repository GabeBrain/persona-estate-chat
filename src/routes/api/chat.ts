import { createFileRoute } from "@tanstack/react-router";
import Anthropic from "@anthropic-ai/sdk";
import { getSystemPrompt } from "@/lib/personas.server";

type AnthropicMessage = {
  role: "user" | "assistant";
  content: string | Array<Record<string, unknown>>;
};

type ChatBody = {
  personaId?: string;
  forcedInterest?: string | null;
  messages?: AnthropicMessage[];
};

const MODEL = "claude-sonnet-4-5";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { personaId, messages, forcedInterest } = (await request.json()) as ChatBody;
        if (!personaId || !Array.isArray(messages) || messages.length === 0) {
          return new Response("personaId and messages are required", { status: 400 });
        }

        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey) return new Response("Missing CLAUDE_API_KEY", { status: 500 });

        let system: string;
        try {
          system = getSystemPrompt(personaId, forcedInterest ?? null);
        } catch (e) {
          return new Response((e as Error).message, { status: 404 });
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
                if (
                  event.type === "content_block_delta" &&
                  event.delta.type === "text_delta"
                ) {
                  send({ type: "text", text: event.delta.text });
                } else if (event.type === "message_start") {
                  inputTokens = event.message.usage?.input_tokens ?? 0;
                } else if (event.type === "message_delta") {
                  outputTokens = event.usage?.output_tokens ?? 0;
                }
              }
              send({ type: "done", inputTokens, outputTokens });
            } catch (err) {
              send({ type: "error", message: (err as Error).message });
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
