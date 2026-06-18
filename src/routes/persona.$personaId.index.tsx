import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPersona } from "@/lib/personas";
import { loadThreads, newThreadId } from "@/lib/chat-storage";

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
      <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-600">
        Persona não encontrada.
      </div>
    );
  }

  if (!threadId) return <div className="min-h-screen bg-stone-50" />;

  return (
    <Navigate
      to="/persona/$personaId/$threadId"
      params={{ personaId, threadId }}
      replace
    />
  );
}
