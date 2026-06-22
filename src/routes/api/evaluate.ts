import { createFileRoute } from "@tanstack/react-router";
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { getSystemPrompt } from "@/lib/personas.server";

type EvalBody = { personaId?: string; messages?: MessageParam[] };

const MODEL = "claude-sonnet-4-6";
const MAX_BODY_BYTES = 20 * 1024 * 1024;

const EVAL_PROMPT = `Com base na conversa de entrevista acima, gere um relatório de avaliação em JSON com exatamente esta estrutura:
{
  "resumo": "Parágrafo de 3-4 frases resumindo os principais pontos da conversa.",
  "nivel_interesse_final": "ALTO | MÉDIO | BAIXO",
  "principais_objecoes": ["objeção 1", "objeção 2", "objeção 3"],
  "pontos_positivos": ["ponto 1", "ponto 2", "ponto 3"],
  "proximos_passos": ["passo 1", "passo 2", "passo 3"]
}
Responda APENAS com o JSON, sem texto extra.`;

export const Route = createFileRoute("/api/evaluate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentLength = Number(request.headers.get("content-length") ?? 0);
        if (contentLength > MAX_BODY_BYTES) {
          return new Response("Payload too large", { status: 413 });
        }

        let body: EvalBody;
        try {
          body = (await request.json()) as EvalBody;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const { personaId, messages } = body;

        if (!personaId || !Array.isArray(messages) || messages.length === 0) {
          return new Response("personaId and messages are required", { status: 400 });
        }

        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey) return new Response("Configuração do servidor incorreta", { status: 500 });

        let system: string;
        try {
          system = getSystemPrompt(personaId);
        } catch {
          return new Response("Persona não encontrada", { status: 404 });
        }

        const client = new Anthropic({ apiKey });
        try {
          const response = await client.messages.create({
            model: MODEL,
            max_tokens: 800,
            system,
            messages: [...messages, { role: "user", content: EVAL_PROMPT }],
          });
          const block = response.content[0];
          const raw =
            block.type === "text"
              ? block.text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "")
              : "";
          const json = JSON.parse(raw);
          return Response.json(json);
        } catch (err) {
          console.error("[/api/evaluate] error:", err);
          return new Response("Erro interno ao gerar avaliação.", { status: 500 });
        }
      },
    },
  },
});
