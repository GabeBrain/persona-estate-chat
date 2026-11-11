/**
 * Fonte única de navegação da BRAIN Qualitativa.
 *
 * Sidebar, busca global (Ctrl + K) e página Início leem esta lista.
 * Ver docs/LAYOUT_BRAIN_QUALITATIVA.md, seção 3.4.
 */
import type { ReactNode } from "react";
import { House, MessagesSquare, Route as RouteIcon } from "lucide-react";
import type { FileRouteTypes } from "@/routeTree.gen";

/** Rotas navegáveis (geradas pelo TanStack Router), sem os endpoints de API. */
export type AppPath = Exclude<FileRouteTypes["to"], `/api/${string}`>;

export type Perfil = "Analista" | "Gestão" | "Administrativo";

export const PERFIS: Perfil[] = ["Analista", "Gestão", "Administrativo"];

export interface Pagina {
  path: AppPath;
  label: string;
  icon: ReactNode;
  /** Usada no card da Início. */
  description: string;
  /** Selo do card (ex.: "Pesquisa qualitativa"). */
  study: string;
  /** Quem vê. */
  perfis: Perfil[];
  /** Ex.: "(em implementação)". */
  standbyLabel?: string;
  /** Id da pasta, se fizer parte de uma. */
  folder?: string;
  /** Prefixos extras que também ativam o item (ex.: telas de detalhe). */
  activePrefixes?: string[];
  /** Itens administrativos ficam depois do divisor. */
  admin?: boolean;
}

export const HOME: Pagina = {
  path: "/",
  label: "Início",
  icon: <House className="h-4 w-4" aria-hidden="true" />,
  description: "Escolha pelo objetivo do seu trabalho.",
  study: "Início",
  perfis: PERFIS,
};

export const PAGINAS: Pagina[] = [
  {
    path: "/personas",
    label: "Personas Sintéticas",
    icon: <MessagesSquare className="h-4 w-4" aria-hidden="true" />,
    description: "Entreviste personas modeladas a partir de entrevistas qualitativas reais.",
    study: "Personas sintéticas",
    perfis: ["Analista", "Gestão"],
    activePrefixes: ["/persona"],
  },
];

export interface Pasta {
  id: string;
  label: string;
  icon: ReactNode;
}

/** Pastas só são exibidas com 2+ itens visíveis para o perfil. */
export const PASTAS: Pasta[] = [];

export interface Jornada {
  id: string;
  /** Verbo + objetivo. */
  title: string;
  description: string;
  icon: ReactNode;
}

export const JORNADAS: Jornada[] = [
  {
    id: "entrevistas-simuladas",
    title: "Conduzir entrevistas simuladas",
    description:
      "Converse com personas sintéticas de cada praça para validar hipóteses de produto.",
    icon: <RouteIcon className="h-5 w-5" aria-hidden="true" />,
  },
];

/**
 * Perfil do usuário atual. O app ainda não tem login (previsto no M3):
 * por enquanto todos os perfis são liberados.
 */
export const PERFIS_DO_USUARIO: Perfil[] = PERFIS;

export function podeVer(pagina: Pagina, perfis: Perfil[] = PERFIS_DO_USUARIO): boolean {
  return pagina.perfis.some((p) => perfis.includes(p));
}

export function paginasVisiveis(perfis: Perfil[] = PERFIS_DO_USUARIO): Pagina[] {
  return PAGINAS.filter((p) => podeVer(p, perfis));
}

export function isActivePath(pathname: string, pagina: Pagina): boolean {
  const prefixes = [pagina.path, ...(pagina.activePrefixes ?? [])];
  if (pagina.path === "/") return pathname === "/";
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}
