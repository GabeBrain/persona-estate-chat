## Visão Geral

App de diálogo com personas sintéticas baseadas em entrevistas qualitativas do mercado imobiliário. Construído com TanStack Start + Lovable AI Gateway (sem login, sem banco). Histórico de conversas por persona salvo no `localStorage`.

Como você ainda precisa subir o ZIP do POC, vou começar com uma **base funcional pronta para receber o POC**. Quando você subir o arquivo, eu leio personas, prompts e base de conhecimento de lá e porto para a estrutura abaixo (substituindo os mocks).

## O que será construído agora

**Stack**
- TanStack Start (já configurado)
- AI SDK + Lovable AI Gateway (`google/gemini-3-flash-preview`) via server route `/api/chat`
- AI Elements para UI de chat (Conversation, Message, PromptInput, Shimmer)
- Sem Lovable Cloud / sem login

**Telas / rotas**
- `/` — Galeria de personas (cards com avatar, nome, papel no mercado imobiliário, bio curta)
- `/persona/$personaId` — Tela de chat com a persona selecionada
  - lista de threads daquela persona (sidebar/drawer) + botão "Nova conversa"
  - rota real por thread: `/persona/$personaId/$threadId`
  - mensagens renderizadas via `message.parts` + markdown
  - composer com Shimmer "Pensando..." durante streaming

**Personas (placeholder até o ZIP chegar)**
3 personas exemplo do setor imobiliário (comprador de 1ª moradia, investidor, corretor experiente), cada uma com:
- nome, avatar gerado, bio
- system prompt detalhado
- bloco de "base de conhecimento" (trechos de entrevistas) injetado no system prompt

Estrutura preparada para receber N personas reais vindas do POC.

**Persistência (localStorage)**
- Uma chave por persona: `chat:persona:<id>` → `{ threads: [{ id, title, updatedAt, messages: UIMessage[] }] }`
- Bootstrap idempotente (sem criar threads duplicadas em StrictMode)
- Título da thread = primeiras palavras da 1ª mensagem do usuário

**Backend**
- `src/routes/api/chat.ts` — server route streaming
  - recebe `{ personaId, messages }`
  - carrega persona + base de conhecimento server-side
  - monta `system` prompt e chama `streamText`
- `src/lib/personas.ts` — registro de personas (substituído pelos dados do POC depois)

## Depois que você subir o ZIP

1. Extraio o conteúdo
2. Identifico: personas, prompts, trechos de entrevista, eventuais assets visuais
3. Porto para `src/lib/personas.ts` (ou JSON em `src/data/personas.json` se forem muitos)
4. Substituo placeholders, mantendo a UI/arquitetura acima
5. Se o POC tiver decisões de UX/visual relevantes, adapto

## Detalhes técnicos

- `useChat` do `@ai-sdk/react` com `id = threadId` e `messages` iniciais da thread
- `DefaultChatTransport({ api: '/api/chat', body: { personaId } })`
- Persistência via `onFinish` no cliente (escreve thread atualizada no localStorage)
- AI Elements instalados: `conversation message prompt-input shimmer`
- Avatares das personas gerados com `imagegen` (estilo consistente)
- Identidade visual própria (sem Sparkles genérico): definimos paleta + tipografia próprias do nicho imobiliário (tons sóbrios, serif para títulos)

## Fora do escopo (por enquanto)
- Login / multi-dispositivo
- Painel admin para editar personas (dados virão do ZIP / código)
- RAG vetorial — base de conhecimento entra direto no system prompt (suficiente para entrevistas curtas; se o POC tiver muito texto, reavaliamos)

## Próximo passo
Aprovando este plano, eu construo a base. Você sobe o ZIP em seguida e eu faço a portabilidade no turno seguinte.