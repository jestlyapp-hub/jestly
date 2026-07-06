/**
 * StatusBadge — verdict sémantique (Rentable / En perte / Attention / neutre).
 * Couleur = sens financier, jamais l'accent violet. Deux tailles : `sm`
 * (bandeau) et `lg` (Verdict Hero).
 */
type Tone = "positive" | "negative" | "warning" | "neutral";

const TONE: Record<Tone, { fg: string; bg: string }> = {
  positive: { fg: "var(--ecom-pos)", bg: "var(--ecom-pos-soft)" },
  negative: { fg: "var(--ecom-neg)", bg: "var(--ecom-neg-soft)" },
  warning: { fg: "var(--ecom-warn)", bg: "var(--ecom-warn-soft)" },
  neutral: { fg: "var(--ecom-muted)", bg: "var(--ecom-muted-soft)" },
};

export function StatusBadge({
  tone,
  label,
  size = "sm",
}: {
  tone: Tone;
  label: string;
  size?: "sm" | "lg";
}) {
  const t = TONE[tone];
  const dims = size === "lg"
    ? "text-[var(--ecom-fs-label)] px-3 py-1.5 gap-2"
    : "text-[var(--ecom-fs-caption)] px-2 py-0.5 gap-1.5";
  const dot = size === "lg" ? "w-2 h-2" : "w-1.5 h-1.5";
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-[var(--ecom-r-full)] ${dims}`}
      style={{ color: t.fg, background: t.bg }}
    >
      <span className={`inline-block rounded-full ${dot}`} style={{ background: t.fg }} />
      {label}
    </span>
  );
}
