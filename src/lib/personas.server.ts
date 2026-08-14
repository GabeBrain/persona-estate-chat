import renatoPrompt from "./persona-prompts/renato.txt?raw";
import claudiaPrompt from "./persona-prompts/claudia.txt?raw";
import rodrigoPrompt from "./persona-prompts/rodrigo.txt?raw";
import sergioCePrompt from "./persona-prompts/sergio_ce.txt?raw";
import henriqueCePrompt from "./persona-prompts/henrique_ce.txt?raw";
import esterCePrompt from "./persona-prompts/ester_ce.txt?raw";
import paulaCePrompt from "./persona-prompts/paula_ce.txt?raw";
import andersonPrudentePrompt from "./persona-prompts/anderson_prudente.txt?raw";
import sergioPrudentePrompt from "./persona-prompts/sergio_prudente.txt?raw";

const PROMPTS: Record<string, string> = {
  renato: renatoPrompt,
  claudia: claudiaPrompt,
  rodrigo: rodrigoPrompt,
  sergio_ce: sergioCePrompt,
  henrique_ce: henriqueCePrompt,
  ester_ce: esterCePrompt,
  paula_ce: paulaCePrompt,
  anderson_prudente: andersonPrudentePrompt,
  sergio_prudente: sergioPrudentePrompt,
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
