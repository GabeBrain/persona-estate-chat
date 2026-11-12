import renatoPrompt from "./persona-prompts/renato.txt?raw";
import claudiaPrompt from "./persona-prompts/claudia.txt?raw";
import rodrigoPrompt from "./persona-prompts/rodrigo.txt?raw";
import sergioCePrompt from "./persona-prompts/sergio_ce.txt?raw";
import henriqueCePrompt from "./persona-prompts/henrique_ce.txt?raw";
import esterCePrompt from "./persona-prompts/ester_ce.txt?raw";
import paulaCePrompt from "./persona-prompts/paula_ce.txt?raw";
import andersonPrudentePrompt from "./persona-prompts/anderson_prudente.txt?raw";
import sergioPrudentePrompt from "./persona-prompts/sergio_prudente.txt?raw";
import gilmarNovakPrompt from "./persona-prompts/gilmar_novak.txt?raw";
import thiagoTeodoroPrompt from "./persona-prompts/thiago_teodoro.txt?raw";
import andreBordignonPrompt from "./persona-prompts/andre_bordignon.txt?raw";
import viniciusQueirozPrompt from "./persona-prompts/vinicius_queiroz.txt?raw";
import cristianoAlbuquerquePrompt from "./persona-prompts/cristiano_albuquerque.txt?raw";
import franciscoBezerraPrompt from "./persona-prompts/francisco_bezerra.txt?raw";
import alexandreHolandaPrompt from "./persona-prompts/alexandre_holanda.txt?raw";
import andersonMoreiraPrompt from "./persona-prompts/anderson_moreira.txt?raw";
import joseEduardoFontenelePrompt from "./persona-prompts/jose_eduardo_fontenele.txt?raw";
import eduardoBenevidesPrompt from "./persona-prompts/eduardo_benevides.txt?raw";
import luanaVasconcelosPrompt from "./persona-prompts/luana_vasconcelos.txt?raw";

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
  gilmar_novak: gilmarNovakPrompt,
  thiago_teodoro: thiagoTeodoroPrompt,
  andre_bordignon: andreBordignonPrompt,
  vinicius_queiroz: viniciusQueirozPrompt,
  cristiano_albuquerque: cristianoAlbuquerquePrompt,
  francisco_bezerra: franciscoBezerraPrompt,
  alexandre_holanda: alexandreHolandaPrompt,
  anderson_moreira: andersonMoreiraPrompt,
  jose_eduardo_fontenele: joseEduardoFontenelePrompt,
  eduardo_benevides: eduardoBenevidesPrompt,
  luana_vasconcelos: luanaVasconcelosPrompt,
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
