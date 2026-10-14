/**
 * Glifos del sistema BUILD / SHIFT / CUT.
 * SVG mínimos, afilados, monocromos. Cada uno es una operación, no un icono.
 */
export function GlyphBuild({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="2" y="2" width="16" height="16" fill="currentColor" />
      <rect x="22" y="2" width="16" height="16" fill="currentColor" />
      <rect x="2" y="22" width="16" height="16" fill="currentColor" />
      <rect x="22" y="22" width="16" height="16" fill="currentColor" />
    </svg>
  );
}

export function GlyphShift({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="2" y="6" width="16" height="16" fill="currentColor" />
      <rect x="14" y="18" width="16" height="16" fill="currentColor" />
      <rect x="30" y="2" width="8" height="8" fill="currentColor" />
    </svg>
  );
}

export function GlyphCut({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M20 2a18 18 0 1 0 18 18h-18z" fill="currentColor" />
      <rect x="20" y="2" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

export function GlyphForm({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="2" y="2" width="11" height="11" fill="currentColor" />
      <rect x="15" y="15" width="11" height="11" fill="currentColor" />
      <rect x="28" y="28" width="10" height="10" fill="currentColor" />
      <rect x="28" y="2" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
