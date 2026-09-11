import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, MapPin } from "lucide-react";
import brainLogo from "@/assets/logo-brain.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERSONAS } from "@/lib/personas";

const ALL_CITIES = "Todas as cidades";

const cities = Array.from(new Set(PERSONAS.map((persona) => persona.city))).sort((a, b) =>
  a.localeCompare(b, "pt-BR"),
);

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    city: typeof search.city === "string" ? search.city : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Personas Sintéticas Brain" },
      {
        name: "description",
        content:
          "Converse com personas sintéticas Brain baseadas em entrevistas qualitativas reais do mercado imobiliário.",
      },
      { property: "og:title", content: "Personas Sintéticas Brain" },
      {
        property: "og:description",
        content:
          "Personas sintéticas treinadas com entrevistas reais para explorar dores e necessidades do mercado imobiliário.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const { city } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const selectedCity = cities.includes(city ?? "") ? city : undefined;
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <img src={brainLogo} alt="Brain" className="h-7 w-auto" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Personas Sintéticas
            </span>
          </div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Pesquisa Imobiliária
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <section className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Personas Sintéticas Brain
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Converse com quem move o mercado imobiliário.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Cada persona abaixo foi modelada a partir de entrevistas qualitativas reais. Faça
            perguntas abertas, valide hipóteses de produto, explore dores e necessidades como em uma
            entrevista de pesquisa.
          </p>
        </section>

        <section className="mt-10" aria-labelledby="personas-heading">
          <div className="flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="personas-heading" className="text-sm font-semibold text-foreground">
                Personas disponíveis
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground" aria-live="polite">
                {visiblePersonas.length} {visiblePersonas.length === 1 ? "perfil encontrado" : "perfis encontrados"}
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
                {cities.map((cityOption) => (
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
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePersonas.map((p) => (
            <Link
              key={p.id}
              to="/persona/$personaId"
              params={{ personaId: p.id }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"
            >
              <div className="relative h-44 bg-muted">
                <img
                  src={p.avatar}
                  alt={p.name}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 p-5">
                <h2 className="text-xl font-semibold text-foreground">{p.name}</h2>
                <p className="text-xs uppercase tracking-wider text-primary">{p.role}</p>
                <p className="text-xs text-muted-foreground">{p.tagline}</p>
                <p className="line-clamp-3 pt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.bio}
                </p>
                <div className="pt-3 text-sm font-semibold text-foreground group-hover:text-primary">
                  Iniciar conversa →
                </div>
              </div>
            </Link>
          ))}
          </div>
        </section>

        <footer className="mt-20 border-t border-border pt-6 text-xs text-muted-foreground">
          Histórico de conversas salvo neste navegador.
        </footer>
      </main>
    </div>
  );
}
