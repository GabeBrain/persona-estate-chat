<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

<!-- PROTOCOLO-SESSAO v3 -->
## Protocolo de sessão

Vale para qualquer agente (Claude, Codex, Lovable) e qualquer pessoa trabalhando neste repo.
Existe para que toda sessão comece do mesmo ponto e termine com o trabalho visível para os outros.
Nada aqui bloqueia trabalho.

### Abertura — antes de alterar qualquer arquivo

1. `git remote -v` — descubra **todos** os remotes antes de comparar qualquer coisa. Um fork tem
   dois: `origin` (a sua cópia) e `upstream` (o repositório do time). Não presuma que só existe um.
2. `git fetch --all` — em toda sessão, sem exceção. Os contadores abaixo valem apenas até o último
   fetch.
3. Compare contra **cada** remote que existir:
   - `git rev-list --left-right --count origin/main...main`
   - `git rev-list --left-right --count upstream/main...main`, se houver `upstream`
4. Agir conforme o caso, **por remote**:

| Situação | O que fazer |
|---|---|
| Em dia, árvore limpa | Seguir. Não dizer nada. |
| Atrás do remoto, árvore limpa | `git pull --ff-only` e avisar em uma linha o que entrou. |
| Atrás do remoto, árvore suja | **Não puxar.** Avisar o que há de novo lá e perguntar antes. |
| À frente do remoto | Avisar quantos commits locais existem e desde quando. Não empurrar sozinho. |
| Divergiu (à frente **e** atrás) | Avisar e perguntar. Nunca resolver merge sem o humano. |

**Num fork, estar em dia com o `origin` não diz nada sobre o `upstream`.** Relate os dois, sempre.

Nunca usar `git pull` sem `--ff-only`, e nunca `rebase`/`reset` de histórico já publicado — os
repos são conectados ao Lovable e reescrever histórico corrompe o projeto do outro lado.

### Fechamento — ao encerrar uma entrega

1. Commit isolado, com `git add <caminhos>` explícito. **Nunca** `git add .` ou `-A`.
2. Entrada no documento vivo do projeto, quando a alteração for relevante.
3. **Reportar o que ficou local:** quantos commits estão à frente do remoto e desde quando.
4. **Perguntar se quer enviar.** Nunca fazer `git push` por conta própria.

### Quando você não consegue verificar

Agente sem navegador, token, credencial ou serviço no ar não consegue confirmar runtime. Nesse caso:

1. **Diga o que não deu para verificar, e por quê.** Nunca conclua por plausibilidade.
2. **Proponha o equivalente headless**, afirmando sobre o objeto que a biblioteca gera antes de gravar.
3. Só então siga com o resto da tarefa.

Relatar o limite é entrega, não desistência. Inventar a verificação é o único erro grave aqui.

### Conflito em documento vivo

Os `LIVE_*.md` são logs append-only. Onde houver `.gitattributes` com `LIVE_*.md merge=union`, o Git
mantém os dois lados sozinho. Se ainda assim conflitar, preserve todas as entradas dos dois lados,
em ordem decrescente de data; nenhuma entrada é descartada, resumida ou reescrita.

Para conferir que nada se perdeu, use a identidade do merge de três pontos:

```
resolvido = base + (local − base) + (upstream − base)
```

**Somar os dois lados diretamente está errado** — duplica as entradas da base comum.

### Vínculo com o Monday

**Regra fixa: nunca escreva no Monday por conta própria.** Leitura é livre; criar card, comentar,
mover status, alterar prazo ou responsável exige pedido explícito da pessoa naquela sessão. Registre
o trabalho no documento vivo.

Toda entrada correspondente a um card traz:

- **Monday:** [Nome do card](https://brain381753.monday.com/boards/<board>/pulses/<itemId>) — `<itemId>`

Board principal: `Backlogs & Roadmaps` — `18398428946`.
Board de execução semanal: `Entregas` — `18398428948`.
<!-- FIM PROTOCOLO-SESSAO -->
