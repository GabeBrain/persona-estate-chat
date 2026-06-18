# Detalhamento de Desenvolvimento — Persona Estate Chat (PLAENGE)

> Documento técnico de referência. Cobre arquitetura, decisões, fluxo de dados e a
> análise de performance, UX e segurança do estado atual.
> Para o histórico de etapas e o planejamento, ver [ROADMAP.md](./ROADMAP.md).

Última atualização: 2026-06-18

---

## 1. Visão Geral

POC de **entrevista simulada com personas sintéticas** de potenciais compradores do
empreendimento PLAENGE em Governador Celso Ramos/SC. O entrevistador conversa com uma
persona movida por Claude, que mantém um **nível de interesse dinâmico** (ALTO/MÉDIO/BAIXO)
e gera, ao final, um **relatório de avaliação** estruturado.

As personas foram sintetizadas a partir de **19 entrevistas qualitativas** reais
(em `plaenge-poc/interviews/`).

### Personas atuais

| ID | Nome | Perfil | Interesse inicial |
|---|---|---|---|
| `renato` | Renato Borges (57, Curitiba) | Empresário, lote + construção, teto R$ 4–4,5 mi | MÉDIO |
| `claudia` | Claudia Mendes (52, São Paulo) | Empresária RH, casa pronta, teto R$ 4,5–5 mi | MÉDIO |
| `rodrigo` | Rodrigo Faria (42, Goiânia) | Empresário, lote + construção, teto R$ 7–7,5 mi | ALTO |

---

## 2. Arquitetura

Stack: **TanStack Start/Router + React 19 + Vite + Tailwind v4**, com a API Anthropic
rodando em **rotas server-side** (Nitro). Não há mais o backend Express separado da POC.

```
src/
├── routes/
│   ├── persona.$personaId.$threadId.tsx   ← UI principal do chat (client)
│   └── api/
│       ├── chat.ts        ← POST /api/chat      (streaming SSE)
│       └── evaluate.ts    ← POST /api/evaluate  (avaliação JSON)
├── lib/
│   ├── personas.ts        ← metadados das personas (client-safe)
│   ├── personas.server.ts ← carrega system prompts (.txt) — server only
│   ├── persona-prompts/   ← renato.txt | claudia.txt | rodrigo.txt
│   └── chat-storage.ts    ← persistência de threads em localStorage
└── assets/                ← avatares das personas
public/persona-md/         ← fichas markdown completas servidas estaticamente

plaenge-poc/               ← POC original (Express). Mantida como referência/legado.
```

### Modelo de IA

- Modelo atual nos endpoints: `claude-sonnet-4-5` (**ver pendência em §5 — atualizar para `claude-sonnet-4-6`**).
- `max_tokens`: 1000 (chat) / 800 (avaliação).
- Streaming via SSE; a chave (`CLAUDE_API_KEY`) fica **somente no servidor**.

---

## 3. Fluxo de Dados

### Chat (streaming)

1. Cliente monta as mensagens (texto e/ou anexo base64) e chama `POST /api/chat`.
2. `getSystemPrompt(personaId, forcedInterest)` monta o system prompt; se houver
   `forcedInterest`, anexa uma instrução extra ao prompt.
3. O servidor abre um `ReadableStream` e repassa eventos SSE: `text` (deltas),
   `done` (tokens in/out) e `error`.
4. O cliente acumula os deltas e usa `extractProgressiveFala()` para renderizar o
   campo `fala` em tempo real, mesmo com o JSON ainda incompleto.
5. Ao final, `parseModelResponse()` extrai `{ fala, interesse }` e atualiza o nível
   de interesse (a menos que esteja fixado manualmente).

### Avaliação

- `POST /api/evaluate` reenvia a conversa + um prompt fixo pedindo um JSON com
  `resumo`, `nivel_interesse_final`, `principais_objecoes`, `pontos_positivos`,
  `proximos_passos`. Resposta não-streaming.

### Persistência

- Threads ficam em `localStorage` por persona: chave `chat:persona:<id>`.
- Cada thread guarda `id`, `title`, `updatedAt` e o array completo de mensagens
  (**incluindo anexos em base64** — ver pendência de performance em §4).

---

## 4. Análise de Performance

| Prioridade | Item | Detalhe / Ação |
|---|---|---|
| Alta | **Re-render da lista inteira no streaming** | A cada chunk, todas as mensagens (com `ReactMarkdown`) re-renderizam. Memoizar `MessageBubble` com `React.memo` e `key` estável. |
| Alta | **base64 de anexos no localStorage** | Incha o storage, deixa o `JSON.parse` no load lento e leva ao estouro de cota. Persistir anexos em IndexedDB ou guardar só metadados. |
| Média | **Autoscroll forçado** | Rola pro fim a cada chunk mesmo quando o usuário rolou pra cima. Só auto-rolar se já estiver perto do fim. |
| Média | **Bundle inicial** | Muitos `@radix-ui/*` + `recharts` (pesado) nas deps. Lazy-load/code-split o que não é usado nesta tela. |
| Baixa | **Regex por chunk** | `extractProgressiveFala` roda regex sobre a string acumulada a cada chunk (~O(n²) no total da resposta). Aceitável hoje; revisitar se respostas crescerem. |

---

## 5. Fragilidades e Vulnerabilidades

| Severidade | Item | Detalhe / Mitigação |
|---|---|---|
| 🔴 Alta | **Endpoints sem auth nem rate-limit** | `/api/chat` e `/api/evaluate` são públicos — qualquer um com a URL consome créditos Anthropic. Adicionar autenticação (token/sessão) + rate-limiting por IP. |
| 🔴 Alta | **Chave real em `plaenge-poc/backend/.env`** | Está em texto puro no working tree (já no `.gitignore`). **Revogar/rotacionar** a chave no console Anthropic. |
| 🟠 Média | **Sem limite de tamanho de payload** | `request.json()` sem limite explícito; PDF/imagem grande em base64 pode estourar memória (a POC limitava a 20mb). Validar tamanho no servidor. |
| 🟠 Média | **`forcedInterest` sem validação** | Valor do cliente é concatenado no system prompt → injeção. Validar contra `["ALTO","MÉDIO","BAIXO"]`. |
| 🟠 Média | **`saveThreads` sem try/catch** | `QuotaExceededError` do localStorage não tratado pode derrubar a UI. Envolver em try/catch e avisar o usuário. |
| 🟡 Baixa | **Erros internos vazados ao cliente** | Retorna `err.message` cru. Logar server-side e devolver mensagem genérica. |
| 🟡 Baixa | **Model id desatualizado** | Endpoints usam `claude-sonnet-4-5`; o mais recente é `claude-sonnet-4-6`. Confirmar e atualizar. |

---

## 6. UX / Acessibilidade

- **Acessibilidade:** botões só com ícone (lucide) sem `aria-label` — adicionar para leitores de tela.
- **Banner de erro:** não fecha sozinho nem tem botão de dispensar.
- **Estado vazio:** as "Sugestões para começar" foram removidas (a pedido); manter um CTA discreto para não ficar vazio demais.
- **Anexos grandes:** dar feedback de limite/cota ao anexar.

---

## 7. Como Rodar

```bash
# na raiz do projeto
npm install
echo "CLAUDE_API_KEY=sk-ant-..." > .env   # chave da Anthropic
npm run dev
```

Scripts: `dev`, `build`, `build:dev`, `preview`, `lint`, `format`.

> O projeto está conectado ao **Lovable**: commits no branch sincronizam de volta ao
> editor. **Não reescrever histórico já publicado** (force-push/rebase/squash). Ver `AGENTS.md`.
