/**
 * Shell da BRAIN Qualitativa: sidebar (logo + nome, busca Ctrl + K, menu,
 * rodapé) e área de conteúdo. Padrão em docs/LAYOUT_BRAIN_QUALITATIVA.md.
 */
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Moon,
  Search,
  Sun,
  User,
} from "lucide-react";
import brainLogo from "@/assets/logo-brain.png";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  HOME,
  PASTAS,
  isActivePath,
  paginasVisiveis,
  type Pagina,
  type Pasta,
} from "@/lib/navigation";
import { PERSONAS } from "@/lib/personas";

const PRODUCT_NAME = "Qualitativa";
const SIDEBAR_STORAGE_KEY = "brain-qualitativa-sidebar";

type SidebarState = {
  collapsed: boolean;
  openGroups: string[];
  openFolders: string[];
};

const DEFAULT_SIDEBAR_STATE: SidebarState = { collapsed: false, openGroups: [], openFolders: [] };

function loadSidebarState(): SidebarState {
  try {
    const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!raw) return DEFAULT_SIDEBAR_STATE;
    const parsed = JSON.parse(raw) as Partial<SidebarState>;
    return {
      collapsed: parsed.collapsed === true,
      openGroups: Array.isArray(parsed.openGroups) ? parsed.openGroups : [],
      openFolders: Array.isArray(parsed.openFolders) ? parsed.openFolders : [],
    };
  } catch {
    return DEFAULT_SIDEBAR_STATE;
  }
}

function saveSidebarState(state: SidebarState) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sem localStorage: o estado vale só para esta sessão.
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SidebarState>(DEFAULT_SIDEBAR_STATE);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useLocation({ select: (l) => l.pathname });

  useEffect(() => {
    setState(loadSidebarState());
  }, []);

  const updateState = useCallback((updater: (prev: SidebarState) => SidebarState) => {
    setState((prev) => {
      const next = updater(prev);
      saveSidebarState(next);
      return next;
    });
  }, []);

  // Atalho global Ctrl + K (⌘ + K no Mac).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Fecha a gaveta mobile ao navegar.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleFolder = useCallback(
    (id: string) =>
      updateState((prev) => ({
        ...prev,
        openFolders: prev.openFolders.includes(id)
          ? prev.openFolders.filter((f) => f !== id)
          : [...prev.openFolders, id],
      })),
    [updateState],
  );

  const collapsed = state.collapsed;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground md:flex-row">
      {/* Barra superior mobile (< 768px) */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-3 print:hidden md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Abrir menu"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src={brainLogo} alt="Brain" className="h-7 w-auto shrink-0" />
          <span className="truncate text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {PRODUCT_NAME}
          </span>
        </Link>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 sm:max-w-64 [&>button:last-child]:hidden">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Navegação da BRAIN Qualitativa</SheetDescription>
          <SidebarContent
            collapsed={false}
            pathname={pathname}
            openFolders={state.openFolders}
            onToggleFolder={toggleFolder}
            onOpenPalette={() => {
              setMobileOpen(false);
              setPaletteOpen(true);
            }}
            onToggleCollapsed={() => setMobileOpen(false)}
            collapseLabel="Fechar menu"
          />
        </SheetContent>
      </Sheet>

      {/* Sidebar desktop */}
      <aside
        className={cn(
          "hidden h-full shrink-0 flex-col border-r border-border bg-card transition-all duration-200 print:hidden md:flex",
          collapsed ? "w-14" : "w-64",
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          pathname={pathname}
          openFolders={state.openFolders}
          onToggleFolder={toggleFolder}
          onOpenPalette={() => setPaletteOpen(true)}
          onToggleCollapsed={() => updateState((prev) => ({ ...prev, collapsed: !prev.collapsed }))}
        />
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</main>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

/* ------------------------------------------------------------------------ */

function SidebarContent({
  collapsed,
  pathname,
  openFolders,
  onToggleFolder,
  onOpenPalette,
  onToggleCollapsed,
  collapseLabel,
}: {
  collapsed: boolean;
  pathname: string;
  openFolders: string[];
  onToggleFolder: (id: string) => void;
  onOpenPalette: () => void;
  onToggleCollapsed: () => void;
  collapseLabel?: string;
}) {
  const paginas = paginasVisiveis();
  const tools = paginas.filter((p) => !p.admin);
  const adminItems = paginas.filter((p) => p.admin);
  const toggleTitle = collapseLabel ?? (collapsed ? "Expandir menu" : "Recolher menu");

  return (
    <div className="flex h-full flex-col">
      {/* 2.1 Cabeçalho */}
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border px-3 py-3",
          collapsed ? "justify-center px-2" : "justify-between",
        )}
      >
        {!collapsed && (
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img src={brainLogo} alt="Brain" className="h-7 w-auto shrink-0" />
            <span className="truncate text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {PRODUCT_NAME}
            </span>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={toggleTitle}
          aria-label={toggleTitle}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* 2.2 Busca global */}
      <div className={cn("px-2 pt-2", collapsed && "px-1")}>
        <button
          type="button"
          onClick={onOpenPalette}
          title="Buscar (Ctrl+K)"
          aria-label="Buscar (Ctrl+K)"
          className={cn(
            "flex w-full items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            collapsed && "justify-center px-0",
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-xs">Buscar…</span>
              <kbd className="rounded border border-border bg-card px-1.5 text-[10px] font-medium">
                Ctrl K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* 3 Navegação */}
      <nav aria-label="Principal" className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
        <NavItem item={HOME} collapsed={collapsed} active={isActivePath(pathname, HOME)} />
        <NavTree
          items={tools}
          collapsed={collapsed}
          pathname={pathname}
          openFolders={openFolders}
          onToggleFolder={onToggleFolder}
        />
        {adminItems.length > 0 && (
          <>
            <div className="my-3 border-t border-border" role="separator" />
            <NavTree
              items={adminItems}
              collapsed={collapsed}
              pathname={pathname}
              openFolders={openFolders}
              onToggleFolder={onToggleFolder}
            />
          </>
        )}
      </nav>

      {/* 2.3 Rodapé. Sem login por ora (M3): só o tema e o aviso de armazenamento local. */}
      <SidebarFooter collapsed={collapsed} />
    </div>
  );
}

function NavTree({
  items,
  collapsed,
  pathname,
  openFolders,
  onToggleFolder,
}: {
  items: Pagina[];
  collapsed: boolean;
  pathname: string;
  openFolders: string[];
  onToggleFolder: (id: string) => void;
}) {
  const rendered = new Set<string>();
  const nodes: ReactNode[] = [];

  for (const item of items) {
    if (!item.folder) {
      nodes.push(
        <NavItem
          key={item.path}
          item={item}
          collapsed={collapsed}
          active={isActivePath(pathname, item)}
        />,
      );
      continue;
    }
    if (rendered.has(item.folder)) continue;
    rendered.add(item.folder);

    const siblings = items.filter((i) => i.folder === item.folder);
    const pasta = PASTAS.find((p) => p.id === item.folder);
    // Só cria pasta com 2+ itens visíveis; com um só, mostra o item direto.
    if (siblings.length < 2 || !pasta) {
      for (const s of siblings) {
        nodes.push(
          <NavItem
            key={s.path}
            item={s}
            collapsed={collapsed}
            active={isActivePath(pathname, s)}
          />,
        );
      }
      continue;
    }
    nodes.push(
      <NavFolder
        key={pasta.id}
        pasta={pasta}
        items={siblings}
        collapsed={collapsed}
        pathname={pathname}
        isOpen={openFolders.includes(pasta.id)}
        onToggle={() => onToggleFolder(pasta.id)}
      />,
    );
  }

  return <>{nodes}</>;
}

function NavItem({
  item,
  collapsed,
  active,
}: {
  item: Pagina;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      to={item.path}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        collapsed && "justify-center px-0 py-2.5",
      )}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && (
        <span className="truncate">
          {item.label}
          {item.standbyLabel && (
            <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
              {item.standbyLabel}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}

function NavFolder({
  pasta,
  items,
  collapsed,
  pathname,
  isOpen,
  onToggle,
}: {
  pasta: Pasta;
  items: Pagina[];
  collapsed: boolean;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hasActiveChild = items.some((i) => isActivePath(pathname, i));
  // Abre sozinha quando um filho está ativo.
  const open = isOpen || hasActiveChild;

  return (
    <div>
      <button
        type="button"
        onClick={() => !collapsed && onToggle()}
        title={collapsed ? pasta.label : undefined}
        aria-expanded={collapsed ? undefined : open}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
          hasActiveChild
            ? "font-medium text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
          collapsed && "justify-center px-0 py-2.5",
        )}
      >
        <span className="shrink-0">{pasta.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">{pasta.label}</span>
            <ChevronDown
              className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
            />
          </>
        )}
      </button>
      {!collapsed && open && (
        <div className="ml-3 space-y-0.5 border-l border-border pl-2">
          {items.map((i) => (
            <NavItem key={i.path} item={i} collapsed={false} active={isActivePath(pathname, i)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const themeLabel = theme === "dark" ? "Usar tema claro" : "Usar tema escuro";

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-t border-border px-3 py-2",
        collapsed && "flex-col px-1",
      )}
    >
      {!collapsed && (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <User className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">Acesso local</p>
            <p className="truncate text-[11px] text-muted-foreground">Dados neste navegador</p>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        title={themeLabel}
        aria-label={themeLabel}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const paginas = [HOME, ...paginasVisiveis()];
  const podeVerPersonas = paginasVisiveis().some((p) => p.path === "/personas");

  function go(action: () => void) {
    onOpenChange(false);
    action();
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar páginas e personas…" />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        <CommandGroup heading="Páginas">
          {paginas.map((p) => (
            <CommandItem
              key={p.path}
              value={`${p.label} ${p.description}`}
              onSelect={() => go(() => void navigate({ to: p.path }))}
            >
              {p.icon}
              <span>{p.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        {podeVerPersonas && (
          <CommandGroup heading="Personas">
            {PERSONAS.map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.name} ${p.city} ${p.occupation}`}
                onSelect={() =>
                  go(
                    () => void navigate({ to: "/persona/$personaId", params: { personaId: p.id } }),
                  )
                }
              >
                <img src={p.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                <span className="truncate">{p.name}</span>
                <span className="ml-auto truncate text-xs text-muted-foreground">{p.city}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
