import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPersona } from "@/lib/personas";
import { loadThreads, newThreadId } from "@/lib/chat-storage";
import { BrainLoader } from "@/components/layout/BrainLoader";

export const Route = createFileRoute("/persona/$personaId/")({
  component: PersonaIndex,
});

function PersonaIndex() {
  const { personaId } = Route.useParams();
  const persona = getPersona(personaId);
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (!persona) return;
    const existing = loadThreads(personaId);
    setThreadId(existing[0]?.id ?? newThreadId());
  }, [personaId, persona]);

  if (!persona) {
    return (
      <div className="mx-auto max-w-7xl animate-fade-in p-5 sm:p-8">
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <h1 className="text-base font-semibold text-foreground">Persona não encontrada</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O link pode estar desatualizado. Escolha uma persona na galeria.
          </p>
          <Link
            to="/personas"
            className="mt-4 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ver personas
          </Link>
        </div>
      </div>
    );
  }

  if (!threadId) return <BrainLoader label="conversa" />;

  return <Navigate to="/persona/$personaId/$threadId" params={{ personaId, threadId }} replace />;
}
