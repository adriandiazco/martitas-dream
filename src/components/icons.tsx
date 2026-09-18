// Iconografía temática minimalista (guiños sutiles de la Fase 3).
// SVG con currentColor para respetar contraste y tema.

/** Huella de perro — bullet de hitos alcanzados. */
export function PawPrint({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="12" cy="16" rx="4.2" ry="3.4" />
      <ellipse cx="6.5" cy="10.5" rx="1.8" ry="2.4" />
      <ellipse cx="10" cy="7.5" rx="1.8" ry="2.4" />
      <ellipse cx="14" cy="7.5" rx="1.8" ry="2.4" />
      <ellipse cx="17.5" cy="10.5" rx="1.8" ry="2.4" />
    </svg>
  );
}
