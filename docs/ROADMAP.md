# Roadmap — Persona Estate Chat (PLAENGE)

> Etapas realizadas, etapas futuras e milestones do produto.
> Detalhes técnicos e análise completa em [DESENVOLVIMENTO.md](./DESENVOLVIMENTO.md).

Última atualização: 2026-07-30

Legenda: ✅ concluído · 🔄 em andamento · ⏳ planejado

---

## Etapas Realizadas ✅

- ✅ **Pesquisa qualitativa** — 19 entrevistas com potenciais compradores (transcrições originais removidas em 2026-07-28 junto com a POC legada; síntese já incorporada nas personas).
- ✅ **Síntese de personas** — 3 personas sintéticas (Renato, Claudia, Rodrigo) com critérios, objeções e prompts.
- ✅ **POC inicial** — backend Express + frontend React separados (removida do disco em 2026-07-28; app atual roda inteiramente via Lovable a partir deste repositório).
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
- ✅ **Hardening parcial (M1)** — model id atualizado, `forcedInterest` validado, limite de payload, erros genéricos ao cliente, `saveThreads` com try/catch, banner de erro com dismiss, `ErrorComponent` com stack trace em dev.
- ✅ **Múltiplos anexos por mensagem** — colar/arrastar/selecionar até 5 imagens (ou PDF) numa mesma mensagem, com miniaturas removíveis individualmente.
- ✅ **Recuperação automática de cota do localStorage** — ao estourar a cota, remove base64 de anexos de threads antigas (mantendo o texto) e tenta salvar de novo; corrige perda de histórico relatada por usuários.
- ✅ **Segundo empreendimento (Novo Mandara — Porto das Dunas/CE)** — 4 novas personas (Sérgio, Henrique, Ester, Paula) com campo `context: "aquiraz"`, isoladas das personas PLAENGE (`context: "plaenge"`); seletor agrupado por contexto (`<optgroup>`); troca entre contextos diferentes abre thread nova automaticamente, sem modal.
- ✅ **Ajuste de naturalidade das 7 personas (2026-07-29)** — correção de 5 críticas de analistas: excesso de perguntas por resposta, racionalização excessiva/baixa carga emocional, tom de consultor em vez de consumidor, ausência de imprevisibilidade e baixa diferenciação de estilo entre interesse MÉDIO e BAIXO. Ver detalhe em DESENVOLVIMENTO.md.
- ✅ **Correção do HTTP 413 com múltiplos anexos (2026-07-30)** — imagens são sempre reconvertidas para JPEG (mesmo sem precisar de redimensionamento) e `/api/chat`/`/api/evaluate` só recebem os anexos binários dos 2 turnos mais recentes da thread, evitando que o payload cresça a cada turno até estourar o limite de corpo da hospedagem.

---

## Etapas Futuras ⏳

### Segurança (prioridade máxima)
- ⏳ Autenticação nos endpoints `/api/chat` e `/api/evaluate`.
- ⏳ Rate-limiting por IP/usuário.
- ⏳ Rotacionar a chave Anthropic que estava exposta no `.env` da POC legada (o arquivo local foi removido em 2026-07-28, mas isso não invalida a chave — a rotação no console Anthropic ainda não foi feita).
- ✅ Validar `forcedInterest` contra lista fechada e limitar tamanho do payload.
- ✅ Mensagens de erro genéricas ao cliente; log detalhado só no servidor.

### Robustez & Performance
- ✅ `try/catch` em `saveThreads` (tratar `QuotaExceededError`; aviso na UI).
- ✅ `saveThreads` recupera de cota estourada removendo anexos antigos e tentando salvar de novo (não perde mais histórico de texto).
- ✅ Imagens redimensionadas (máx. 1600px, JPEG 85%) antes do base64, reduzindo o crescimento do localStorage.
- ⏳ Memoizar `MessageBubble` para evitar re-render da lista no streaming.
- ⏳ Tirar base64 de anexos do localStorage de vez (IndexedDB ou só metadados) — a recuperação automática mitiga, mas não elimina a causa raiz.
- ⏳ Autoscroll inteligente (só quando perto do fim).
- ✅ Atualizar model id para `claude-sonnet-4-6`.

### Produto & UX
- ⏳ Acessibilidade: revisão completa de `aria-label` e navegação por teclado.
- ✅ Banner de erro dispensável (botão ✕).
- ✅ Anexar múltiplas imagens (até 5) numa mesma mensagem, com remoção individual.
- ⏳ Feedback de limite de anexo ao ultrapassar cota.
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

Concluído neste milestone:
- ✅ `forcedInterest` validado; limite de payload 20 MB; erros genéricos ao cliente.
- ✅ `saveThreads` com try/catch; banner de erro dispensável; model id `claude-sonnet-4-6`.
- ✅ `ErrorComponent` exibe stack trace em modo DEV.

Pendente para fechar o M1:
- ⏳ Auth + rate-limit nos endpoints (maior vetor de abuso).
- ⏳ Rotação da chave Anthropic exposta no `.env` da POC legada (arquivo removido do disco, chave ainda não rotacionada).

**Critério de pronto:** endpoints não abusáveis publicamente e UI sem travamentos conhecidos.

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
