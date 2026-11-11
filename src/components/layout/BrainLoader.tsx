import brainLogo from "@/assets/logo-brain.png";

/** Estado "Carregando" padrão BRAIN: logo + "Carregando <nome da página>". */
export function BrainLoader({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full min-h-60 w-full flex-col items-center justify-center gap-3 p-8"
    >
      <img src={brainLogo} alt="" aria-hidden="true" className="h-7 w-auto animate-pulse" />
      <p className="text-sm text-muted-foreground">Carregando {label}</p>
    </div>
  );
}
