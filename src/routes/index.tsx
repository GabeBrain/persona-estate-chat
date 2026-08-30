import { createFileRoute, Link } from "@tanstack/react-router";
import brainLogo from "@/assets/logo-brain.png";
import { PERSONAS } from "@/lib/personas";

export const Route = createFileRoute("/")({
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
    ],
  }),
  component: Index,
});

function Index() {
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

        <section className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((p) => (
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
        </section>

        <footer className="mt-20 border-t border-border pt-6 text-xs text-muted-foreground">
          Histórico de conversas salvo neste navegador.
        </footer>
      </main>
    </div>
  );
}
