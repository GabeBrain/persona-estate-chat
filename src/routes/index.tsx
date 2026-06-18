import { createFileRoute, Link } from "@tanstack/react-router";
import { PERSONAS } from "@/lib/personas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vozes do Mercado — Personas Imobiliárias" },
      {
        name: "description",
        content:
          "Converse com personas sintéticas baseadas em entrevistas qualitativas reais do mercado imobiliário.",
      },
      { property: "og:title", content: "Vozes do Mercado — Personas Imobiliárias" },
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
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200/80 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-700" />
            <span className="text-sm font-medium tracking-wide text-stone-900">
              Vozes do Mercado
            </span>
          </div>
          <span className="text-xs uppercase tracking-widest text-stone-500">
            Pesquisa Imobiliária
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <section className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-800">
            Personas sintéticas
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
            Converse com quem move o mercado imobiliário.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            Cada persona abaixo foi modelada a partir de entrevistas qualitativas reais.
            Faça perguntas abertas, valide hipóteses de produto, explore dores e
            necessidades — como em uma entrevista de pesquisa.
          </p>
        </section>

        <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((p) => (
            <Link
              key={p.id}
              to="/persona/$personaId"
              params={{ personaId: p.id }}
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative h-48 bg-stone-100">
                <img
                  src={p.avatar}
                  alt={p.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2 p-5">
                <h2 className="font-serif text-xl text-stone-900">{p.name}</h2>
                <p className="text-xs uppercase tracking-wider text-emerald-800">
                  {p.role}
                </p>
                <p className="text-xs text-stone-500">{p.tagline}</p>
                <p className="pt-2 text-sm leading-relaxed text-stone-600 line-clamp-3">
                  {p.bio}
                </p>
                <div className="pt-3 text-sm font-medium text-stone-900 group-hover:text-emerald-800">
                  Iniciar conversa →
                </div>
              </div>
            </Link>
          ))}
        </section>

        <footer className="mt-20 border-t border-stone-200 pt-6 text-xs text-stone-500">
          Histórico de conversas salvo neste navegador.
        </footer>
      </main>
    </div>
  );
}
