import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BadgeCheck, FileSearch, RefreshCw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JORNADAS, PERFIS, paginasVisiveis, type Jornada, type Perfil } from "@/lib/navigation";
import { CONTEXT_LABELS, PERSONA_CITIES, PERSONAS } from "@/lib/personas";

export const Route = createFileRoute("/")({
  // Compatibilidade: links antigos da galeria (/?city=...) agora vão para /personas.
  validateSearch: (search: Record<string, unknown>): { city?: string } => ({
    city: typeof search.city === "string" ? search.city : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (search.city) {
      throw redirect({ to: "/personas", search: { city: search.city }, replace: true });
    }
  },
  head: () => ({
    meta: [
      { title: "BRAIN Qualitativa" },
      {
        name: "description",
        content: "BRAIN Qualitativa: ferramentas de pesquisa qualitativa organizadas por objetivo.",
      },
    ],
  }),
  component: Inicio,
});

type ToolCard = {
  key: string;
  jornada: Jornada["id"];
  title: string;
  description: string;
  study: string;
  perfis: Perfil[];
  city?: string;
};

function buildCards(): ToolCard[] {
  const personas = paginasVisiveis().find((p) => p.path === "/personas");
  if (!personas) return [];

  return PERSONA_CITIES.map((city) => {
    const fromCity = PERSONAS.filter((p) => p.city === city);
    const contexts = Array.from(
      new Set(fromCity.map((p) => CONTEXT_LABELS[p.context].split(" — ")[0])),
    );
    const n = fromCity.length;
    return {
      key: city,
      jornada: "entrevistas-simuladas",
      title: city,
      description: `Entreviste ${n} ${n === 1 ? "persona" : "personas"} · ${contexts.join(", ")}.`,
      study: personas.study,
      perfis: personas.perfis,
      city,
    };
  });
}

function Inicio() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const cards = buildCards().filter((c) => !perfil || c.perfis.includes(perfil));
  const jornadas = JORNADAS.map((j) => ({
    ...j,
    cards: cards.filter((c) => c.jornada === j.id),
  })).filter((j) => j.cards.length > 0);

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-10 p-5 sm:p-8 lg:p-10">
      {/* 4.1 Hero */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
          BRAIN Qualitativa · Inteligência estratégica
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          O que você precisa fazer hoje?
        </h1>
        <p className="mt-3 text-base leading-6 text-muted-foreground sm:text-lg">
          Escolha pelo objetivo do seu trabalho.
        </p>
      </section>

      {/* 4.2 Filtro de perfil */}
      <section className="space-y-3" aria-labelledby="contexto-heading">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 id="contexto-heading" className="text-base font-semibold text-foreground">
              Qual é o seu contexto?
            </h2>
            <p className="text-sm text-muted-foreground">
              Use este filtro para destacar os ambientes mais comuns para seu perfil.
            </p>
          </div>
          {perfil && (
            <Button variant="ghost" size="sm" onClick={() => setPerfil(null)}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Ver todos
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por público">
          {PERFIS.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={perfil === p ? "default" : "outline"}
              aria-pressed={perfil === p}
              onClick={() => setPerfil((current) => (current === p ? null : p))}
            >
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {p}
            </Button>
          ))}
        </div>
      </section>

      {/* 4.3 Jornadas */}
      <section className="space-y-5" aria-labelledby="objetivo-heading">
        <div>
          <h2 id="objetivo-heading" className="text-xl font-semibold text-foreground">
            Comece pelo objetivo
          </h2>
          <p className="text-sm text-muted-foreground">
            Cada caminho reúne os tipos de estudo e fluxos que fazem sentido juntos.
          </p>
        </div>

        {jornadas.length === 0 ? (
          <EmptyState onReset={() => setPerfil(null)} />
        ) : (
          <div className={cn("grid gap-5", jornadas.length > 1 && "xl:grid-cols-3")}>
            {jornadas.map((j) => (
              <div key={j.id} className="rounded-2xl border border-border bg-muted/35 p-4 sm:p-5">
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    {j.icon}
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      {j.title}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{j.description}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    "grid gap-3",
                    j.cards.length > 1 &&
                      (jornadas.length > 1
                        ? "sm:grid-cols-2 xl:grid-cols-1"
                        : "sm:grid-cols-2 xl:grid-cols-3"),
                  )}
                >
                  {j.cards.map((card) => (
                    <ToolCardLink key={card.key} card={card} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ToolCardLink({ card }: { card: ToolCard }) {
  return (
    <Link
      to="/personas"
      search={{ city: card.city }}
      className="group flex min-h-40 flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary">
          {card.study}
        </Badge>
        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
        />
      </div>
      <h3 className="font-heading text-base font-semibold text-foreground">{card.title}</h3>
      <p className="mt-1.5 text-sm leading-5 text-muted-foreground">{card.description}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
        {card.perfis.map((p) => (
          <span key={p} className="text-xs text-muted-foreground">
            {p}
          </span>
        ))}
      </div>
    </Link>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <FileSearch className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-foreground">
        Nenhum ambiente destacado para este perfil
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Você ainda pode ver todos os ambientes ou usar a busca global pelo atalho Ctrl + K.
      </p>
      <Button variant="outline" className="mt-4" onClick={onReset}>
        Ver todos os ambientes
      </Button>
    </div>
  );
}
