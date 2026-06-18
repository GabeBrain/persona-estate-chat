import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Load personas manifest once at startup
const personas = JSON.parse(readFileSync(join(ROOT, 'personas/personas.json'), 'utf-8'));

// Cache system prompts by persona id
const promptCache = {};

function loadSystemPrompt(personaId) {
  if (promptCache[personaId]) return promptCache[personaId];
  const persona = personas.find((p) => p.id === personaId);
  if (!persona) throw new Error(`Unknown persona: ${personaId}`);
  const text = readFileSync(join(ROOT, 'personas', persona.system_prompt_file), 'utf-8');
  promptCache[personaId] = text.trim();
  return promptCache[personaId];
}

function buildSystemPrompt(personaId, forcedInterest) {
  const base = loadSystemPrompt(personaId);
  if (!forcedInterest) return base;
  return (
    base +
    `\n\n[INSTRUÇÃO DO ENTREVISTADOR]: O nível de interesse deve ser ${forcedInterest} nesta e nas próximas respostas, até mudança natural ou novo ajuste.`
  );
}

// POST /chat — streaming SSE
app.post('/chat', async (req, res) => {
  const { messages, personaId = 'renato', forcedInterest = null } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  let systemPrompt;
  try {
    systemPrompt = buildSystemPrompt(personaId, forcedInterest);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    });

    let inputTokens = 0;
    let outputTokens = 0;

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ type: 'text', text: event.delta.text })}\n\n`);
      }
      if (event.type === 'message_start') {
        inputTokens = event.message.usage?.input_tokens ?? 0;
      }
      if (event.type === 'message_delta') {
        outputTokens = event.usage?.output_tokens ?? 0;
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done', inputTokens, outputTokens })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Anthropic stream error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
      res.end();
    }
  }
});

// POST /evaluate — generate evaluation JSON (non-streaming)
app.post('/evaluate', async (req, res) => {
  const { messages, personaId = 'renato' } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  let systemPrompt;
  try {
    systemPrompt = loadSystemPrompt(personaId);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const evalPrompt = `Com base na conversa de entrevista acima, gere um relatório de avaliação em JSON com exatamente esta estrutura:
{
  "resumo": "Parágrafo de 3-4 frases resumindo os principais pontos da conversa.",
  "nivel_interesse_final": "ALTO | MÉDIO | BAIXO",
  "principais_objecoes": ["objeção 1", "objeção 2", "objeção 3"],
  "pontos_positivos": ["ponto 1", "ponto 2", "ponto 3"],
  "proximos_passos": ["passo 1", "passo 2", "passo 3"]
}
Responda APENAS com o JSON, sem texto extra.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: systemPrompt,
      messages: [...messages, { role: 'user', content: evalPrompt }],
    });

    const raw = response.content[0].text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const json = JSON.parse(raw);
    res.json(json);
  } catch (err) {
    console.error('Evaluate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /personas — return full persona list
app.get('/personas', (_req, res) => {
  res.json(personas);
});

// GET /persona/:id — return markdown content of the full persona file
app.get('/persona/:id', (req, res) => {
  const persona = personas.find((p) => p.id === req.params.id);
  if (!persona) return res.status(404).json({ error: 'Persona not found' });

  try {
    const content = readFileSync(join(ROOT, persona.markdown_file), 'utf-8');
    res.json({ content });
  } catch {
    res.status(404).json({ error: 'Markdown file not found' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
