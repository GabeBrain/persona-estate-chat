# Padrão de Layout — BRAIN Qualitativa

Referência estética e de organização de layout para o desenvolvimento da **BRAIN Qualitativa**.
Segue o mesmo padrão visual do **Rebrain**, para que os dois ambientes sejam reconhecidos como o
mesmo produto BRAIN.

Este documento é autossuficiente: traz a estrutura da tela, os componentes, as classes e os tokens
necessários para reproduzir o padrão em qualquer projeto **React + Tailwind CSS + shadcn/ui +
lucide-react**.

Versão 1.0 — 11/11/2026.

---

## 1. Princípios

1. **Mesmo produto, mesma cara.** Mesma sidebar, mesma busca, mesma página Início por objetivo,
   mesmas cores e fontes do Rebrain. Só muda o nome ao lado do logo: **Qualitativa**.
2. **O menu é o caminho.** A navegação acontece pela sidebar e pelos cards da Início. Não há botões
   de atalho extras no cabeçalho das páginas.
3. **Organizar pelo objetivo, não pela ferramenta.** A Início agrupa as ferramentas pelo que o
   usuário quer fazer.
4. **Três perfis:** **Analista**, **Gestão** e **Administrativo**.
5. **Sempre claro e escuro.** Toda tela é conferida nos dois temas.

---

## 2. Estrutura da tela

```
┌──────────────────────────┬────────────────────────────────────────────┐
│ [logo BRAIN] QUALITATIVA ‹│                                            │
├──────────────────────────┤                                            │
│ 🔍 Buscar…        Ctrl K │                                            │
├──────────────────────────┤        Área de conteúdo                    │
│ ⌂ Início                 │        (rola sozinha; a tela não rola)     │
│ ▸ Item                   │                                            │
│ ▾ Pasta                  │                                            │
│   │ Subitem              │                                            │
│   │ Subitem              │                                            │
│ ▸ Item (em implementação)│                                            │
│ ───────────────          │                                            │
│ ▸ Itens administrativos  │                                            │
├──────────────────────────┤                                            │
│ (AB) Nome · Perfil   ☾ ⎋ │                                            │
└──────────────────────────┴────────────────────────────────────────────┘
```

```tsx
<div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
  <aside className={cn(
    'flex flex-col h-full border-r border-border bg-card transition-all duration-200 shrink-0 print:hidden',
    collapsed ? 'w-14' : 'w-64',
  )}>
    {/* 2.1 Cabeçalho · 2.2 Busca · 3 Navegação · 2.3 Rodapé */}
  </aside>
  <main className="flex-1 overflow-auto min-w-0">{children}</main>
</div>
```

| Elemento | Medida |
|---|---|
| Sidebar expandida | `w-64` (256px) |
| Sidebar recolhida | `w-14` (56px), só ícones, rótulo no `title` |
| Logo | `h-7 w-auto` (28px de altura, nunca distorcer) |
| Área de conteúdo | `flex-1 overflow-auto min-w-0` |

O estado da sidebar (recolhida e pastas abertas) é salvo no `localStorage`
(`{ collapsed, openGroups, openFolders }`) e restaurado ao recarregar.

### 2.1 Cabeçalho da sidebar

```tsx
<div className={cn('flex items-center gap-2 px-3 py-3 border-b border-border',
  collapsed ? 'justify-center px-2' : 'justify-between')}>
  <div className="flex items-center gap-2 min-w-0">
    <img src={brainLogo} alt="Brain" className="h-7 w-auto shrink-0" />
    {!collapsed && (
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest truncate">
        Qualitativa
      </span>
    )}
  </div>
  <button type="button" onClick={toggleCollapsed}
    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
    title={collapsed ? 'Expandir menu' : 'Recolher menu'}>
    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
  </button>
</div>
```

- Logo: `logoBrain.png` (PNG, fundo transparente).
- Nome: **Qualitativa**, exibido em caixa alta pelo `uppercase` (no código, escrever "Qualitativa").

### 2.2 Busca global (Ctrl + K)

Botão logo abaixo do cabeçalho que abre uma paleta de comandos (`CommandDialog` do shadcn).
Atalho global **Ctrl + K** (⌘ + K no Mac). A paleta lista as mesmas páginas da sidebar,
respeitando o perfil.

```tsx
<div className={cn('px-2 pt-2', collapsed && 'px-1')}>
  <button type="button" onClick={() => setPaletteOpen(true)} title="Buscar (Ctrl+K)"
    className={cn('w-full flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors',
      collapsed && 'justify-center px-0')}>
    <Search className="h-3.5 w-3.5 shrink-0" />
    {!collapsed && <>
      <span className="flex-1 text-left text-xs">Buscar…</span>
      <kbd className="rounded border border-border bg-card px-1.5 text-[10px] font-medium">Ctrl K</kbd>
    </>}
  </button>
</div>
```

### 2.3 Rodapé da sidebar (conta)

`border-t border-border px-3 py-2`, em uma linha:

- Avatar redondo `h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-semibold` com as
  iniciais; ao lado, nome (`text-xs font-medium`) e perfil (`text-[11px] text-muted-foreground`).
  Clicar abre um menu com **Alterar senha**.
- Botão de tema (`Moon` / `Sun`) e botão **Sair** (`LogOut`), ambos
  `rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground`.
- Recolhida: os elementos ficam empilhados (`flex-col`) e só o avatar aparece.

---

## 3. Navegação

### 3.1 Ordem do menu

1. **Início** — sempre o primeiro.
2. **Ferramentas da Qualitativa** — itens soltos ou em pastas, na ordem de uso.
3. **Divisor** (`my-3 border-t border-border`).
4. **Itens administrativos** (usuários, monitoramento, logs) — visíveis só para o perfil
   **Administrativo**.

Sem links externos no menu nem no rodapé.

### 3.2 Item

```tsx
<NavLink to={item.path} title={collapsed ? item.label : undefined}
  className={cn(
    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
    isActive ? 'bg-primary/10 text-primary font-medium'
             : 'text-muted-foreground hover:bg-accent hover:text-foreground',
    collapsed && 'justify-center px-0 py-2.5',
  )}>
  <span className="shrink-0">{item.icon /* lucide h-4 w-4 */}</span>
  {!collapsed && <span className="truncate">
    {item.label}
    {item.standbyLabel && <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">{item.standbyLabel}</span>}
  </span>}
</NavLink>
```

- Ativo também nas sub-rotas (`pathname === path || pathname.startsWith(path + '/')`).
- Ferramenta ainda não finalizada: rótulo secundário **(em implementação)** em `text-[10px]`.
  Se o rótulo for longo, ele quebra para a linha de baixo, como no Rebrain.

### 3.3 Pasta (grupo expansível)

Usada para reunir ferramentas da mesma família (como "Relatórios Automatizados" no Rebrain).

```tsx
<button type="button" onClick={() => !collapsed && toggleFolder(id)}
  className={cn('w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
    hasActiveChild ? 'text-primary font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
    collapsed && 'justify-center px-0 py-2.5')}>
  <span className="shrink-0">{icon}</span>
  {!collapsed && <>
    <span className="flex-1 text-left truncate">{label}</span>
    <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', isOpen && 'rotate-180')} />
  </>}
</button>
{!collapsed && isOpen && (
  <div className="ml-3 pl-2 border-l border-border space-y-0.5">{children}</div>
)}
```

- Abre sozinha quando um filho está ativo.
- Só criar pasta com **2 ou mais itens visíveis** para o perfil; com um só, mostrar o item direto.

### 3.4 Fonte única

Sidebar, busca (Ctrl + K) e página Início leem **a mesma lista** de páginas. Cada entrada declara
rota, rótulo, ícone, descrição, tipo de estudo, perfis e regra de acesso:

```ts
type Perfil = 'Analista' | 'Gestão' | 'Administrativo';

interface Pagina {
  path: string;
  label: string;
  icon: React.ReactNode;
  description: string;      // usada no card da Início
  study: string;            // selo do card (ex.: "Pesquisa qualitativa")
  perfis: Perfil[];         // quem vê
  standbyLabel?: string;    // ex.: "(em implementação)"
  folder?: string;          // id da pasta, se fizer parte de uma
}
```

O que um perfil não pode acessar **não aparece** em lugar nenhum (menu, busca, Início).

---

## 4. Página Início

```
┌───────────────────────────────────────────────────────────────┐
│ ✓ BRAIN Qualitativa · Inteligência estratégica                │
│ O que você precisa fazer hoje?                                │
│ Escolha pelo objetivo do seu trabalho.                        │
└───────────────────────────────────────────────────────────────┘

Qual é o seu contexto?
[👥 Analista] [👥 Gestão] [👥 Administrativo]

Comece pelo objetivo
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ ■ Jornada 1     │ │ ■ Jornada 2     │ │ ■ Jornada 3     │
│  ┌───────────┐  │ │  ┌───────────┐  │ │  ┌───────────┐  │
│  │ card      │  │ │  │ card      │  │ │  │ card      │  │
│  └───────────┘  │ │  └───────────┘  │ │  └───────────┘  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

Contêiner: `mx-auto max-w-7xl space-y-10 p-5 sm:p-8 lg:p-10 animate-fade-in`.

### 4.1 Cabeçalho (hero)

Card `rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8`, **sem botão**.

- Selo: `BadgeCheck` + "**BRAIN Qualitativa · Inteligência estratégica**"
  (`mb-4 flex items-center gap-2 text-sm font-medium text-primary`).
- Título: "**O que você precisa fazer hoje?**" (`text-3xl font-semibold tracking-tight sm:text-4xl`).
- Subtítulo: "Escolha pelo objetivo do seu trabalho."
  (`mt-3 text-base leading-6 text-muted-foreground sm:text-lg`).

### 4.2 Filtro "Qual é o seu contexto?"

- Título `text-base font-semibold` + apoio `text-sm text-muted-foreground`:
  "Use este filtro para destacar os ambientes mais comuns para seu perfil."
- Três botões `size="sm"` com ícone `Users` (`h-3.5 w-3.5`): **Analista**, **Gestão**, **Administrativo**.
  Selecionado `variant="default"`; demais `variant="outline"`. Clicar de novo desmarca.
- Com filtro ativo, botão `variant="ghost"` **Ver todos** (`RefreshCw`) à direita do título.
- Grupo com `role="group" aria-label="Filtrar por público"`.
- O filtro só **destaca**; quem define o que o usuário pode acessar é o perfil dele (seção 3.4).

### 4.3 "Comece pelo objetivo" — jornadas

- Título `text-xl font-semibold` + apoio: "Cada caminho reúne os tipos de estudo e fluxos que fazem
  sentido juntos."
- Grade `grid gap-5 xl:grid-cols-3`.
- Cada jornada: `rounded-2xl border border-border bg-muted/35 p-4 sm:p-5`.
  - Ícone em quadrado `h-10 w-10 rounded-xl bg-primary text-primary-foreground` (ícone `h-5 w-5`).
  - Título `font-heading text-lg font-semibold`, descrição `mt-1 text-sm leading-5 text-muted-foreground`.
  - Cards em `grid gap-3` (com 2+ cards: `sm:grid-cols-2 xl:grid-cols-1`).
- Título da jornada sempre como verbo + objetivo ("Conduzir uma pesquisa", "Analisar entrevistas",
  "Validar ou atualizar dados"…). Ideal: 3 jornadas; cada ferramenta pertence a uma só.
- Jornada sem cards visíveis para o perfil/filtro **não aparece**.

### 4.4 Card de ferramenta

```tsx
<Link to={tool.to}
  className="group flex min-h-40 flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  <div className="mb-4 flex items-start justify-between gap-3">
    <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary">{tool.study}</Badge>
    <ArrowRight aria-hidden="true"
      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
  </div>
  <h3 className="font-heading text-base font-semibold text-foreground">{tool.title}</h3>
  <p className="mt-1.5 text-sm leading-5 text-muted-foreground">{tool.description}</p>
  <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
    {tool.perfis.map((p) => <span key={p} className="text-xs text-muted-foreground">{p}</span>)}
  </div>
</Link>
```

Textos do card: título = nome igual ao do menu; descrição = uma frase começando por verbo
("Organize…", "Explore…", "Revise…"), até ~90 caracteres.

### 4.5 Estado vazio

Quando o filtro não deixa nenhuma jornada:

`rounded-xl border border-dashed border-border bg-card p-8 text-center` com ícone `FileSearch`,
título "Nenhum ambiente destacado para este perfil", texto "Você ainda pode ver todos os ambientes
ou usar a busca global pelo atalho Ctrl + K." e botão `outline` "Ver todos os ambientes".

---

## 5. Páginas internas

1. Contêiner `mx-auto max-w-7xl p-5 sm:p-8 space-y-6 animate-fade-in`. Telas de trabalho em largura
   total (chat, tabelas largas) mantêm o padding lateral.
2. Cabeçalho: título `text-2xl font-semibold` + uma frase em `text-sm text-muted-foreground`.
   Ações da própria ferramenta (exportar, salvar) podem ficar à direita; navegação para outras
   páginas, não — essa fica no menu.
3. Blocos de conteúdo em cards `rounded-xl border border-border bg-card p-5 shadow-sm`.
4. Estados obrigatórios em toda página com dados:
   - **Carregando:** loader com o logo BRAIN e o texto "Carregando <nome da página>".
   - **Vazio:** explicação + próxima ação.
   - **Erro:** mensagem clara + botão "Tentar novamente".
   - **Sucesso.**
5. Acesso negado: mensagem dizendo qual perfil libera a página.

---

## 6. Identidade visual

### 6.1 Tipografia

```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

body { font-family: 'Source Sans 3', sans-serif; -webkit-font-smoothing: antialiased; }
h1, h2, h3, h4, h5, h6 { font-family: 'Montserrat', sans-serif; font-weight: 600; }
```

Tailwind: `fontFamily: { heading: ['Montserrat', 'sans-serif'], body: ['Source Sans 3', 'sans-serif'] }`.

| Uso | Classe |
|---|---|
| Título da Início | `text-3xl sm:text-4xl font-semibold tracking-tight` |
| Título de página | `text-2xl font-semibold` |
| Título de seção | `text-xl font-semibold` |
| Título de card | `font-heading text-base font-semibold` |
| Texto | `text-sm` / `text-base` |
| Apoio | `text-sm text-muted-foreground` |
| Microtexto (perfis, rótulos) | `text-xs` / `text-[10px]` |

### 6.2 Cores (HSL, sem `hsl()`; tema escuro pela classe `.dark` no `<html>`)

```css
:root {
  --background: 220 14% 96%;   --foreground: 221 39% 11%;
  --card: 0 0% 100%;           --card-foreground: 221 39% 11%;
  --popover: 0 0% 100%;        --popover-foreground: 221 39% 11%;
  --primary: 90 37% 34%;       --primary-foreground: 0 0% 100%;   /* verde sálvia */
  --secondary: 90 36% 31%;     --secondary-foreground: 0 0% 100%;
  --muted: 84 27% 92%;         --muted-foreground: 220 9% 46%;
  --accent: 48 95% 49%;        --accent-foreground: 221 39% 11%;  /* amarelo dourado */
  --destructive: 0 65% 34%;    --destructive-foreground: 0 0% 100%;
  --success: 100 41% 24%;      --success-foreground: 0 0% 100%;
  --info: 213 53% 32%;         --info-foreground: 0 0% 100%;
  --warning: 43 100% 27%;      --warning-foreground: 0 0% 100%;
  --border: 220 13% 91%;       --input: 220 13% 91%;  --ring: 90 37% 34%;
  --radius: 0.75rem;
}

.dark {
  --background: 225 15% 8%;    --foreground: 214 32% 91%;
  --card: 225 20% 13%;         --card-foreground: 214 32% 91%;
  --popover: 225 20% 13%;      --popover-foreground: 214 32% 91%;
  --primary: 90 45% 48%;       --primary-foreground: 0 0% 100%;
  --secondary: 90 36% 38%;     --secondary-foreground: 0 0% 100%;
  --muted: 225 15% 20%;        --muted-foreground: 220 9% 58%;
  --accent: 48 90% 45%;        --accent-foreground: 221 39% 11%;
  --destructive: 0 62% 50%;    --destructive-foreground: 0 0% 100%;
  --success: 100 41% 38%;      --success-foreground: 0 0% 100%;
  --info: 213 53% 48%;         --info-foreground: 0 0% 100%;
  --warning: 43 100% 40%;      --warning-foreground: 0 0% 100%;
  --border: 225 15% 22%;       --input: 225 15% 22%;  --ring: 90 45% 48%;
}
```

Uso:

- **primary** — item ativo, selos, ícone das jornadas, botão selecionado, links.
- **accent** — fundo de hover dos itens de menu.
- **muted** — fundo das jornadas (`bg-muted/35`) e textos de apoio.
- **success / info / warning / destructive** — só para status. Nunca para decorar.
- Nunca usar cor fixa (`#...`, `bg-green-600`); sempre o token.

### 6.3 Forma, sombra e movimento

| Elemento | Raio | Sombra |
|---|---|---|
| Hero e jornadas | `rounded-2xl` | hero `shadow-sm` |
| Cards | `rounded-xl` (12px) | `shadow-sm`, hover `shadow-md` |
| Itens de menu e busca | `rounded-lg` | — |
| Botões pequenos de ícone | `rounded-md` | — |

- Entrada de página: `animate-fade-in` (opacidade 0→1 e subida de 4px, 0,3s, `ease-out`).
- Hover de card: sobe 2px (`-translate-y-0.5`), borda `primary/40`, seta desliza.
- Transições curtas: `transition-colors` / `transition-all duration-200`.

### 6.4 Ícones

Somente **lucide-react**. Menu `h-4 w-4`; jornadas `h-5 w-5`; botões pequenos `h-3.5 w-3.5`.
Ícones decorativos com `aria-hidden="true"`.

---

## 7. Responsividade e acessibilidade

- Desktop é a referência (1440px e 1024px). Abaixo de 768px, a sidebar vira uma gaveta (`Sheet`)
  aberta por um botão de menu numa barra superior de 56px com logo + **Qualitativa**.
- Grades da Início: 1 coluna no celular, cards em 2 colunas a partir de `sm`, jornadas em
  3 colunas a partir de `xl`.
- Foco de teclado sempre visível (`focus-visible:ring-2 ring-ring`).
- Botões só com ícone levam `title` e `aria-label`.
- Ordem de tabulação: busca → menu → conta → conteúdo.

---

## 8. Checklist de revisão

- [ ] "Qualitativa" ao lado do logo BRAIN, em caixa alta.
- [ ] Sidebar recolhe/expande e lembra o estado ao recarregar.
- [ ] Ctrl + K abre a busca e lista as mesmas páginas do menu.
- [ ] Cada perfil (Analista, Gestão, Administrativo) vê só o que pode acessar — menu, busca e Início.
- [ ] Itens administrativos depois do divisor, só para Administrativo.
- [ ] Início: hero sem botão, filtro com os três perfis, jornadas por objetivo, estado vazio.
- [ ] Nenhuma cor fixa; tudo por token.
- [ ] Tema claro e escuro conferidos.
- [ ] Páginas com carregando, vazio, erro e sucesso.
- [ ] 1440px, 1024px e 390px conferidos.
