# Detalhamento de Desenvolvimento — Persona Estate Chat (PLAENGE)

> Documento técnico de referência. Cobre arquitetura, decisões, fluxo de dados e a
> análise de performance, UX e segurança do estado atual.
> Para o histórico de etapas e o planejamento, ver [ROADMAP.md](./ROADMAP.md).

Última atualização: 2026-07-28

---

## 1. Visão Geral

POC de **entrevista simulada com personas sintéticas** de potenciais compradores
imobiliários. O app hoje cobre **dois empreendimentos/contextos** distintos — cada
persona pertence a um `context` (`plaenge` ou `aquiraz`) que determina o produto e a
localização sobre os quais ela fala. O entrevistador conversa com uma persona movida
por Claude, que mantém um **nível de interesse dinâmico** (ALTO/MÉDIO/BAIXO) e gera,
ao final, um **relatório de avaliação** estruturado.

### Personas atuais

**Contexto `plaenge`** — loteamento horizontal em Governador Celso Ramos/SC, sintetizado
a partir de **19 entrevistas qualitativas** reais (as transcrições originais ficavam em
`plaenge-poc/interviews/`, removidas em 2026-07-28 junto com o restante da POC legada —
a síntese já está totalmente incorporada em `personas.ts`/`persona-prompts/`):

| ID | Nome | Perfil | Interesse inicial |
|---|---|---|---|
| `renato` | Renato Borges (57, Curitiba) | Empresário, lote + construção, teto R$ 4–4,5 mi | MÉDIO |
| `claudia` | Claudia Mendes (52, São Paulo) | Empresária RH, casa pronta, teto R$ 4,5–5 mi | MÉDIO |
| `rodrigo` | Rodrigo Faria (42, Goiânia) | Empresário, lote + construção, teto R$ 7–7,5 mi | ALTO |

**Contexto `aquiraz`** — apartamento vertical resort no empreendimento Novo Mandara,
Porto das Dunas, Aquiraz/CE, sintetizado a partir de entrevistas com compradores
cearenses/nordestinos de alto padrão (fontes em `persona/Persona_4..7_*_Aquiraz.md`):

| ID | Nome | Perfil | Interesse inicial |
|---|---|---|---|
| `sergio_ce` | Sérgio Cavalcante (52, Fortaleza) | Empresário varejo/combustível, investidor, teto R$ 3–3,5 mi | ALTO |
| `henrique_ce` | Henrique Matos (45, Fortaleza) | Cardiologista, decisão em casal, teto R$ 3–3,5 mi | MÉDIO |
| `ester_ce` | Ester Brandão (45, Fortaleza) | Empresária combustíveis, busca resort/bem-estar, teto R$ 4–4,4 mi | ALTO |
| `paula_ce` | Paula Drummond (42, Fortaleza) | Advogada imobiliária/incorporadora, teto R$ 8–10 mi | ALTO |

As personas do contexto `aquiraz` nunca mencionam PLAENGE, Governador Celso Ramos ou
Florianópolis — são produtos e mercados deliberadamente isolados.

---

## 2. Arquitetura

Stack: **TanStack Start/Router + React 19 + Vite + Tailwind v4**, com a API Anthropic
rodando em **rotas server-side** (Nitro). Não há backend Express separado — o app roda
via Lovable a partir deste repositório (`persona-estate-chat/`), que é autossuficiente.

```
src/
├── routes/
│   ├── persona.$personaId.$threadId.tsx   ← UI principal do chat (client)
│   └── api/
│       ├── chat.ts        ← POST /api/chat      (streaming SSE)
│       └── evaluate.ts    ← POST /api/evaluate  (avaliação JSON)
├── lib/
│   ├── personas.ts        ← metadados das personas (client-safe), incl. campo `context`
│   ├── personas.server.ts ← carrega system prompts (.txt) — server only
│   ├── persona-prompts/   ← renato.txt | claudia.txt | rodrigo.txt | sergio_ce.txt | henrique_ce.txt | ester_ce.txt | paula_ce.txt
│   └── chat-storage.ts    ← persistência de threads em localStorage
└── assets/                ← avatares das personas
public/persona-md/         ← fichas markdown completas servidas estaticamente
```

> A POC original (Express + React separados) e as entrevistas brutas viviam em
> `c:\CLAUDE_CODE\plaenge-poc\{backend,frontend,personas,interviews}\` — removidas em
> 2026-07-28 por já estarem superadas por este app. Ainda existe `plaenge-poc/persona/`
> com as fichas-fonte em markdown (não removidas).

### Modelo de IA

- Modelo atual nos endpoints: `claude-sonnet-4-6`.
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

### Anexos

- É possível anexar **várias imagens e/ou um PDF na mesma mensagem** (limite de 5
  por envio, configurável via `MAX_ATTACHMENTS` na tela de chat). Cada anexo vira
  um content block (`image`/`document`) independente; o texto digitado (se houver)
  entra como bloco final.
- Imagens são redimensionadas no cliente (máx. 1600px, JPEG 85%) antes de virar
  base64, reduzindo o payload enviado à API e o espaço ocupado no `localStorage`.

### Contextos e troca de persona

- Cada persona tem um `context` (`"plaenge"` | `"aquiraz"`); o seletor no header agrupa
  as personas por contexto usando `<optgroup>`.
- Ao trocar de persona **dentro do mesmo contexto**, o comportamento é o de sempre:
  navega para `/persona/$personaId` e reaproxima a thread mais recente dessa persona
  (ou cria uma nova, se não houver nenhuma).
- Ao trocar **entre contextos diferentes** (ex.: Renato → Sérgio), a troca já navega
  direto para uma thread nova (`newThreadId()`) em vez de reabrir a última conversa
  daquela persona — não faz sentido continuar uma thread pensada para outro produto.
  Nenhuma conversa é apagada: o histórico anterior de cada persona continua listado
  normalmente na barra lateral quando você volta a ela.
- Como as threads já são isoladas por `chat:persona:<id>`, não há risco de uma persona
  do Aquiraz "herdar" mensagens de uma persona do PLAENGE.

### Persistência

- Threads ficam em `localStorage` por persona: chave `chat:persona:<id>`.
- Cada thread guarda `id`, `title`, `updatedAt` e o array completo de mensagens
  (**incluindo anexos em base64** — ver pendência de performance em §4).
- `saveThreads` recupera de `QuotaExceededError`: ao estourar a cota, remove
  progressivamente o base64 de anexos de threads mais antigas (preservando o
  texto) e tenta salvar novamente antes de reportar falha — evita perder
  histórico de conversa quando o armazenamento local enche.

---

## 4. Análise de Performance

| Prioridade | Item | Detalhe / Ação |
|---|---|---|
| Alta | **Re-render da lista inteira no streaming** | A cada chunk, todas as mensagens (com `ReactMarkdown`) re-renderizam. Memoizar `MessageBubble` com `React.memo` e `key` estável. |
| ✅ Mitigado | **base64 de anexos no localStorage** | Imagens são redimensionadas (máx. 1600px, JPEG 85%) antes de virar base64, reduzindo o tamanho por anexo. `saveThreads` agora recupera automaticamente de `QuotaExceededError`: remove o base64 de anexos de threads antigas (mantendo o texto) e tenta salvar de novo antes de desistir — o histórico de texto não é mais perdido quando a cota estoura. Mover para IndexedDB continua pendente para eliminar o problema na raiz. |
| Média | **Autoscroll forçado** | Rola pro fim a cada chunk mesmo quando o usuário rolou pra cima. Só auto-rolar se já estiver perto do fim. |
| Média | **Bundle inicial** | Muitos `@radix-ui/*` + `recharts` (pesado) nas deps. Lazy-load/code-split o que não é usado nesta tela. |
| Baixa | **Regex por chunk** | `extractProgressiveFala` roda regex sobre a string acumulada a cada chunk (~O(n²) no total da resposta). Aceitável hoje; revisitar se respostas crescerem. |

---

## 5. Fragilidades e Vulnerabilidades

| Severidade | Item | Detalhe / Mitigação |
|---|---|---|
| 🔴 Alta | **Endpoints sem auth nem rate-limit** | `/api/chat` e `/api/evaluate` são públicos — qualquer um com a URL consome créditos Anthropic. Adicionar autenticação (token/sessão) + rate-limiting por IP. |
| 🔴 Alta | **Chave real exposta (histórico)** | O `.env` da POC Express legada (`plaenge-poc/backend/.env`, fora deste repositório) tinha uma chave Anthropic real em texto puro. O arquivo local foi removido em 2026-07-28, mas isso **não revoga a chave** — ainda **falta revogar/rotacionar** no console Anthropic. |
| ✅ Resolvido | **Sem limite de tamanho de payload** | Limite de 20 MB adicionado em ambos os endpoints; JSON inválido retorna 400. |
| ✅ Resolvido | **`forcedInterest` sem validação** | Validado contra `["ALTO","MÉDIO","BAIXO"]`; valores inválidos são ignorados (tratados como `null`). |
| ✅ Resolvido | **`saveThreads` sem try/catch** | `QuotaExceededError` capturado; `upsertThread` retorna `{ threads, saved }` e o chat exibe aviso ao usuário. |
| ✅ Resolvido | **Erros internos vazados ao cliente** | Erros logados no servidor (`console.error`); cliente recebe mensagem genérica em PT-BR. |
| ✅ Resolvido | **Model id desatualizado** | Endpoints atualizados para `claude-sonnet-4-6`. |

---

## 6. UX / Acessibilidade

- **Acessibilidade:** botões só com ícone (lucide) sem `aria-label` — a maioria já recebeu `aria-label`; revisar cobertura completa.
- **Banner de erro:** ✅ agora tem botão ✕ para dispensar; exibe aviso específico quando localStorage está cheio.
- **ErrorComponent (dev):** ✅ exibe `error.message` + stack trace em modo `DEV` para facilitar diagnóstico.
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
