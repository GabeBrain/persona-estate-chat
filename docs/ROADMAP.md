# Roadmap — Persona Estate Chat (PLAENGE)

> Etapas realizadas, etapas futuras e milestones do produto.
> Detalhes técnicos e análise completa em [DESENVOLVIMENTO.md](./DESENVOLVIMENTO.md).

Última atualização: 2026-06-18

Legenda: ✅ concluído · 🔄 em andamento · ⏳ planejado

---

## Etapas Realizadas ✅

- ✅ **Pesquisa qualitativa** — 19 entrevistas com potenciais compradores (`plaenge-poc/interviews/`).
- ✅ **Síntese de personas** — 3 personas sintéticas (Renato, Claudia, Rodrigo) com critérios, objeções e prompts.
- ✅ **POC inicial** — backend Express + frontend React separados (`plaenge-poc/`).
- ✅ **Migração para app principal** — TanStack Start/Router + React 19 + Vite + Tailwind v4.
- ✅ **API server-side** — `/api/chat` (streaming SSE) e `/api/evaluate` (relatório JSON).
- ✅ **Chave de API protegida** — movida para `CLAUDE_API_KEY` server-side (não mais hardcoded no cliente).
- ✅ **Chat com streaming progressivo** — render da `fala` em tempo real a partir de JSON parcial.
- ✅ **Nível de interesse dinâmico** — automático por resposta + override manual.
- ✅ **Anexos** — colar/arrastar imagem e PDF (base64) para a conversa.
- ✅ **Múltiplas threads** por persona, persistidas em localStorage.
- ✅ **Relatório de avaliação** — resumo, interesse final, objeções, pontos positivos, próximos passos.
- ✅ **Exportar transcrição** em Markdown e modo debug (modelo/tokens).
- ✅ **Remoção das "Sugestões para começar"** do estado vazio do chat.
- ✅ **Documentação** — `docs/DESENVOLVIMENTO.md` e `docs/ROADMAP.md`.

---

## Etapas Futuras ⏳

### Segurança (prioridade máxima)
- ⏳ Autenticação nos endpoints `/api/chat` e `/api/evaluate`.
- ⏳ Rate-limiting por IP/usuário.
- ⏳ Rotacionar a chave Anthropic exposta no `.env` da POC.
- ⏳ Validar `forcedInterest` contra lista fechada e limitar tamanho do payload.
- ⏳ Mensagens de erro genéricas ao cliente; log detalhado só no servidor.

### Robustez & Performance
- ⏳ `try/catch` em `saveThreads` (tratar `QuotaExceededError`).
- ⏳ Memoizar `MessageBubble` para evitar re-render da lista no streaming.
- ⏳ Tirar base64 de anexos do localStorage (IndexedDB ou só metadados).
- ⏳ Autoscroll inteligente (só quando perto do fim).
- ⏳ Atualizar model id para `claude-sonnet-4-6`.

### Produto & UX
- ⏳ Acessibilidade: `aria-label` em botões só de ícone; navegação por teclado.
- ⏳ Banner de erro dispensável + feedback de limite de anexo.
- ⏳ Persona admin: criar/editar personas e prompts sem mexer no código.
- ⏳ Painel de comparação entre personas e histórico de avaliações.

### Plataforma
- ⏳ Backend de persistência (substituir localStorage por banco) com contas de usuário.
- ⏳ Telemetria de uso e custo de tokens por sessão.
- ⏳ Deploy com variáveis de ambiente gerenciadas e observabilidade.

---

## Milestones Principais

### M1 — Hardening da POC 🔄
Tornar a POC atual segura e estável para uso interno/demonstração.
- Auth + rate-limit nos endpoints, rotação de chave, validação de payload.
- `try/catch` no storage, memoização, autoscroll inteligente, model id atualizado.
- **Critério de pronto:** endpoints não abusáveis publicamente e UI sem travamentos conhecidos.

### M2 — Qualidade de Produto ⏳
Elevar a experiência de entrevista e a confiabilidade dos dados.
- Acessibilidade, tratamento de erros, feedback de anexos.
- Histórico de avaliações e exportação consolidada.
- **Critério de pronto:** fluxo de entrevista completo, acessível e auditável.

### M3 — Plataforma Multiusuário ⏳
Sair do armazenamento local e suportar times.
- Contas, persistência em banco, permissões.
- Telemetria de uso/custo.
- **Critério de pronto:** múltiplos usuários com dados isolados e métricas de custo.

### M4 — Escala de Personas ⏳
Tornar a criação de personas um processo de produto, não de engenharia.
- Admin de personas/prompts, versionamento, pipeline a partir de novas entrevistas.
- **Critério de pronto:** nova persona publicada sem deploy de código.
