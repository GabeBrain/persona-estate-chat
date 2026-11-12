import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronDown, MapPin, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERSONA_CITIES, PERSONAS } from "@/lib/personas";

const ALL_CITIES = "Todas as cidades";

type PersonasSearch = { city?: string };

export const Route = createFileRoute("/personas")({
  validateSearch: (search: Record<string, unknown>): PersonasSearch => ({
    city: typeof search.city === "string" ? search.city : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Personas Sintéticas · BRAIN Qualitativa" },
      { property: "og:title", content: "Personas Sintéticas · BRAIN Qualitativa" },
      { property: "og:description", content: "Personas do mercado imobiliário modeladas a partir de entrevistas qualitativas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "description",
        content:
          "Converse com personas sintéticas Brain baseadas em entrevistas qualitativas reais do mercado imobiliário.",
      },
    ],
  }),
  component: PersonasPage,
});

function PersonasPage() {
  const { city } = Route.useSearch();
  const navigate = useNavigate({ from: "/personas" });
  const selectedCity = PERSONA_CITIES.includes(city ?? "") ? city : undefined;
  const visiblePersonas = selectedCity
    ? PERSONAS.filter((persona) => persona.city === selectedCity)
    : PERSONAS;

  function selectCity(nextCity?: string) {
    void navigate({
      search: (previous) => ({ ...previous, city: nextCity }),
      replace: true,
    });
  }

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-6 p-5 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Personas Sintéticas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Personas modeladas a partir de entrevistas qualitativas reais. Faça perguntas abertas e
            valide hipóteses de produto como numa entrevista de pesquisa.
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between sm:w-56">
              <span className="flex min-w-0 items-center gap-2">
                <MapPin aria-hidden="true" />
                <span className="truncate">{selectedCity ?? ALL_CITIES}</span>
              </span>
              <ChevronDown aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)]">
            <DropdownMenuItem onSelect={() => selectCity()}>
              <Check className={selectedCity ? "opacity-0" : "opacity-100"} aria-hidden="true" />
              {ALL_CITIES}
            </DropdownMenuItem>
            {PERSONA_CITIES.map((cityOption) => (
              <DropdownMenuItem key={cityOption} onSelect={() => selectCity(cityOption)}>
                <Check
                  className={selectedCity === cityOption ? "opacity-100" : "opacity-0"}
                  aria-hidden="true"
                />
                {cityOption}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {visiblePersonas.length}{" "}
        {visiblePersonas.length === 1 ? "perfil encontrado" : "perfis encontrados"}
      </p>

      {visiblePersonas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <UserX className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-3 text-base font-semibold text-foreground">
            Nenhuma persona nesta cidade
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha outra cidade ou veja todas as personas disponíveis.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => selectCity()}>
            Ver todas as personas
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePersonas.map((p) => (
            <Link
              key={p.id}
              to="/persona/$personaId"
              params={{ personaId: p.id }}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className={`relative bg-muted ${p.context === "fortaleza-bld" ? "aspect-[4/3]" : "h-44"}`}>
                <img
                  src={p.avatar}
                  alt={p.name}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className={`absolute inset-0 h-full w-full object-cover ${p.context === "fortaleza-bld" ? "object-top" : ""}`}
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-heading text-base font-semibold text-foreground">{p.name}</h2>
                <p className="mt-1 text-xs font-medium text-primary">{p.role}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-5 text-muted-foreground">{p.bio}</p>
                <div className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-medium text-foreground group-hover:text-primary">
                  Iniciar conversa
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
