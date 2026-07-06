"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

/**
 * VerdictHero — l'élément signature du Dashboard : la rentabilité mise en scène
 * comme un instrument de précision. À gauche, le verdict chiffré (Net Profit,
 * ou MER si les coûts ne sont pas saisis) ; à droite, un demi-cadran d'aiguille
 * calé sur le ratio MER ÷ seuil de rentabilité (1,0 = point mort). Sous 1,0 zone
 * rouge, au-dessus zone verte. L'arc se dessine et l'aiguille balaie au
 * chargement (respecte prefers-reduced-motion).
 *
 * Sans coûts : cadran « en attente de calibrage » (arc pointillé grisé) +
 * invitation à renseigner les coûts. Jamais une erreur, une invitation.
 */
interface Props {
  periodLabel: string;             // ex. « 30 derniers jours »
  costsConfigured: boolean;
  profitable: boolean;
  netProfitLabel: string | null;   // Net Profit formaté (verdict principal)
  netProfitNegative: boolean;
  mer: number | null;
  beRoas: number | null;
  merLabel: string | null;         // MER formaté (fallback verdict + contexte)
  beRoasLabel: string | null;
  calibrateHref: string;
}

// ── Géométrie du demi-cadran ──────────────────────────────────────
const CX = 130, CY = 128, R = 104, STROKE = 16;
const DOMAIN_MAX = 2; // ratio borné [0..2], point mort au centre (1,0)

const polar = (value: number) => {
  const v = Math.max(0, Math.min(DOMAIN_MAX, value));
  const theta = (180 - (v / DOMAIN_MAX) * 180) * (Math.PI / 180);
  return { x: CX + R * Math.cos(theta), y: CY - R * Math.sin(theta) };
};

const arcPath = (from: number, to: number): string => {
  const a = polar(from), b = polar(to);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${R} ${R} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
};

export function VerdictHero({
  periodLabel,
  costsConfigured,
  profitable,
  netProfitLabel,
  netProfitNegative,
  mer,
  beRoas,
  merLabel,
  beRoasLabel,
  calibrateHref,
}: Props) {
  const hasGauge = costsConfigured && mer != null && beRoas != null && beRoas > 0;
  const ratio = hasGauge ? mer! / beRoas! : 0;
  const gap = hasGauge ? ratio - 1 : 0; // écart au point mort, en « ×seuil »

  // Balayage de l'aiguille : monté après le premier rendu pour déclencher la transition.
  const [swept, setSwept] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setSwept(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const needleDeg = swept ? (Math.max(0, Math.min(DOMAIN_MAX, ratio)) - 1) * 90 : -90;

  const heroValue = costsConfigured && netProfitLabel != null ? netProfitLabel : (merLabel ?? "—");
  const heroTone = costsConfigured && netProfitLabel != null
    ? (netProfitNegative ? "text-[var(--ecom-neg)]" : "text-[var(--ecom-pos)]")
    : "text-[var(--ecom-navy)]";

  return (
    <section className="relative overflow-hidden bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-lg)] shadow-[var(--ecom-shadow-lg)]">
      {/* Halo violet derrière le chiffre */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-20 w-96 h-96 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(124,58,237,.16), transparent)" }}
      />

      <div className="relative flex flex-col md:flex-row md:items-center gap-6 md:gap-10 p-6 md:p-8">
        {/* ── Verdict chiffré ── */}
        <div className="flex-1 min-w-0">
          <p className="ecom-label">Rentabilité · {periodLabel}</p>
          <div className={`mt-2 text-[var(--ecom-fs-hero)] font-bold leading-[0.95] ecom-tnum tracking-[var(--ecom-tracking-tight)] ${heroTone}`}>
            {heroValue}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {costsConfigured ? (
              <StatusBadge
                tone={profitable ? "positive" : "negative"}
                size="lg"
                label={profitable ? "Rentable" : "En perte"}
              />
            ) : (
              <StatusBadge tone="neutral" size="lg" label="À calibrer" />
            )}
            {hasGauge && merLabel && beRoasLabel && (
              <span className="text-[var(--ecom-fs-label)] text-[var(--ecom-muted)]">
                MER <span className="font-semibold ecom-tnum" style={{ color: profitable ? "var(--ecom-pos)" : "var(--ecom-neg)" }}>{merLabel}</span>
                <span className="mx-1.5 text-[var(--ecom-card-border-strong)]">·</span>
                seuil de rentabilité <span className="font-semibold ecom-tnum text-[var(--ecom-navy)]">{beRoasLabel}</span>
                {Number.isFinite(gap) && (
                  <span className="ml-1.5 font-semibold ecom-tnum" style={{ color: gap >= 0 ? "var(--ecom-pos)" : "var(--ecom-neg)" }}>
                    ({gap >= 0 ? "+" : ""}{gap.toFixed(2)}×)
                  </span>
                )}
              </span>
            )}
          </div>

          {!costsConfigured && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-[var(--ecom-fs-label)] text-[var(--ecom-muted)] max-w-md">
                Calibre ton instrument — renseigne tes coûts pour révéler ta vraie rentabilité (BE-ROAS, Net Profit).
              </p>
              <Link
                href={calibrateHref as never}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--ecom-r-sm)] text-[var(--ecom-fs-label)] font-semibold text-white bg-[var(--ecom-brand-violet)] hover:bg-[var(--ecom-brand-violet-hover)] shadow-[var(--ecom-shadow-violet-glow)] transition-colors duration-[var(--ecom-t-fast)]"
              >
                <Wallet size={15} /> Renseigner mes coûts
              </Link>
            </div>
          )}
        </div>

        {/* ── Instrument (demi-cadran d'aiguille) ── */}
        <div className="shrink-0 mx-auto md:mx-0">
          <svg viewBox="0 0 260 152" className="w-[260px] h-[152px]" role="img"
            aria-label={hasGauge ? `Ratio MER sur seuil : ${ratio.toFixed(2)}` : "Cadran en attente de calibrage"}>
            {/* Zones de fond */}
            {hasGauge ? (
              <>
                <path d={arcPath(0, 1)} fill="none" strokeWidth={STROKE} strokeLinecap="round"
                  stroke="color-mix(in srgb, var(--ecom-neg) 26%, white)" className="ecom-gauge-arc" style={{ animationDelay: "60ms" }} />
                <path d={arcPath(1, DOMAIN_MAX)} fill="none" strokeWidth={STROKE} strokeLinecap="round"
                  stroke="color-mix(in srgb, var(--ecom-pos) 30%, white)" className="ecom-gauge-arc" style={{ animationDelay: "160ms" }} />
                {/* Tick point mort (1,0) */}
                <TickAt value={1} color="var(--ecom-navy)" />
                {/* Aiguille */}
                <g
                  className="ecom-gauge-needle"
                  style={{
                    transform: `rotate(${needleDeg}deg)`,
                    transformOrigin: `${CX}px ${CY}px`,
                    transition: "transform var(--ecom-t-hero) var(--ecom-ease-out)",
                  }}
                >
                  <line x1={CX} y1={CY} x2={CX} y2={CY - (R - 8)} strokeWidth="3" strokeLinecap="round"
                    stroke={profitable ? "var(--ecom-pos)" : "var(--ecom-neg)"} />
                </g>
                <circle cx={CX} cy={CY} r="6" fill="var(--ecom-surface-1)" stroke={profitable ? "var(--ecom-pos)" : "var(--ecom-neg)"} strokeWidth="3" />
                {/* Lecture du ratio sous le moyeu */}
                <text x={CX} y={CY + 26} textAnchor="middle"
                  className="ecom-tnum" fontSize="20" fontWeight="700"
                  fill={profitable ? "var(--ecom-pos)" : "var(--ecom-neg)"}>
                  {ratio.toFixed(2)}×
                </text>
                <text x={CX} y={CY + 40} textAnchor="middle" fontSize="9" letterSpacing="0.06em"
                  fill="var(--ecom-muted)" style={{ textTransform: "uppercase" }}>
                  MER / SEUIL
                </text>
              </>
            ) : (
              <>
                {/* En attente de calibrage : arc pointillé grisé */}
                <path d={arcPath(0, DOMAIN_MAX)} fill="none" strokeWidth={STROKE} strokeLinecap="round"
                  stroke="var(--ecom-card-border)" strokeDasharray="2 8" />
                <circle cx={CX} cy={CY} r="6" fill="var(--ecom-surface-1)" stroke="var(--ecom-card-border-strong)" strokeWidth="3" />
                <text x={CX} y={CY + 28} textAnchor="middle" fontSize="10" letterSpacing="0.06em"
                  fill="var(--ecom-muted)" style={{ textTransform: "uppercase" }}>
                  En attente
                </text>
              </>
            )}
          </svg>
        </div>
      </div>
    </section>
  );
}

/** Petit tick radial à une valeur du cadran (point mort). */
function TickAt({ value, color }: { value: number; color: string }) {
  const outer = polar(value);
  const vt = Math.max(0, Math.min(DOMAIN_MAX, value));
  const theta = (180 - (vt / DOMAIN_MAX) * 180) * (Math.PI / 180);
  const inner = { x: CX + (R - STROKE) * Math.cos(theta), y: CY - (R - STROKE) * Math.sin(theta) };
  return (
    <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  );
}
