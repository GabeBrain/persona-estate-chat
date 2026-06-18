import renatoPrompt from "./persona-prompts/renato.txt?raw";
import claudiaPrompt from "./persona-prompts/claudia.txt?raw";
import rodrigoPrompt from "./persona-prompts/rodrigo.txt?raw";

const PROMPTS: Record<string, string> = {
  renato: renatoPrompt,
  claudia: claudiaPrompt,
  rodrigo: rodrigoPrompt,
};

export function getSystemPrompt(personaId: string, forcedInterest?: string | null): string {
  const base = PROMPTS[personaId];
  if (!base) throw new Error(`Unknown persona: ${personaId}`);
  if (!forcedInterest) return base.trim();
  return (
    base.trim() +
    `\n\n[INSTRUÇÃO DO ENTREVISTADOR]: O nível de interesse deve ser ${forcedInterest} nesta e nas próximas respostas, até mudança natural ou novo ajuste.`
  );
}
