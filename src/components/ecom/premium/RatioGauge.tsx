"use client";

/**
 * Demi-cadran d'aiguille réutilisable — calé sur un RATIO borné [0..2], point
 * mort au centre (1,0). Sous 1,0 zone rouge, au-dessus zone verte. L'aiguille
 * balaie au montage (respecte prefers-reduced-motion via l'absence de re-render
 * forcé). Utilisé par le VerdictHero du Dashboard (MER ÷ seuil) et le verdict du
 * détail campagne (ROAS Jestly ÷ seuil). Sans ratio → arc pointillé « en attente ».
 */
import { useEffect, useState } from "react";

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

/** Petit tick radial à une valeur du cadran (point mort). */
function TickAt({ value, color }: { value: number; color: string }) {
  const outer = polar(value);
  const vt = Math.max(0, Math.min(DOMAIN_MAX, value));
  const theta = (180 - (vt / DOMAIN_MAX) * 180) * (Math.PI / 180);
  const inner = { x: CX + (R - STROKE) * Math.cos(theta), y: CY - (R - STROKE) * Math.sin(theta) };
  return <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={color} strokeWidth="2.5" strokeLinecap="round" />;
}

export function RatioGauge({
  ratio,
  positive,
  sublabel = "MER / SEUIL",
  waitingLabel = "En attente",
  className = "w-[260px] h-[152px]",
  ariaLabel,
}: {
  /** Ratio à afficher (ex. MER ÷ seuil). null → cadran en attente de calibrage. */
  ratio: number | null;
  positive: boolean;
  sublabel?: string;
  waitingLabel?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const has = ratio != null && Number.isFinite(ratio);
  const [swept, setSwept] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setSwept(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const clamped = has ? Math.max(0, Math.min(DOMAIN_MAX, ratio!)) : 0;
  const needleDeg = swept ? (clamped - 1) * 90 : -90;
  const needleColor = positive ? "var(--ecom-pos)" : "var(--ecom-neg)";

  return (
    <svg viewBox="0 0 260 152" className={className} role="img"
      aria-label={ariaLabel ?? (has ? `Ratio : ${ratio!.toFixed(2)}` : "Cadran en attente de calibrage")}>
      {has ? (
        <>
          <path d={arcPath(0, 1)} fill="none" strokeWidth={STROKE} strokeLinecap="round"
            stroke="color-mix(in srgb, var(--ecom-neg) 26%, white)" className="ecom-gauge-arc" style={{ animationDelay: "60ms" }} />
          <path d={arcPath(1, DOMAIN_MAX)} fill="none" strokeWidth={STROKE} strokeLinecap="round"
            stroke="color-mix(in srgb, var(--ecom-pos) 30%, white)" className="ecom-gauge-arc" style={{ animationDelay: "160ms" }} />
          <TickAt value={1} color="var(--ecom-navy)" />
          <g className="ecom-gauge-needle"
            style={{ transform: `rotate(${needleDeg}deg)`, transformOrigin: `${CX}px ${CY}px`, transition: "transform var(--ecom-t-hero) var(--ecom-ease-out)" }}>
            <line x1={CX} y1={CY} x2={CX} y2={CY - (R - 8)} strokeWidth="3" strokeLinecap="round" stroke={needleColor} />
          </g>
          <circle cx={CX} cy={CY} r="6" fill="var(--ecom-surface-1)" stroke={needleColor} strokeWidth="3" />
          <text x={CX} y={CY + 26} textAnchor="middle" className="ecom-tnum" fontSize="20" fontWeight="700" fill={needleColor}>
            {ratio!.toFixed(2)}×
          </text>
          <text x={CX} y={CY + 40} textAnchor="middle" fontSize="9" letterSpacing="0.06em" fill="var(--ecom-muted)" style={{ textTransform: "uppercase" }}>
            {sublabel}
          </text>
        </>
      ) : (
        <>
          <path d={arcPath(0, DOMAIN_MAX)} fill="none" strokeWidth={STROKE} strokeLinecap="round"
            stroke="var(--ecom-card-border)" strokeDasharray="2 8" />
          <circle cx={CX} cy={CY} r="6" fill="var(--ecom-surface-1)" stroke="var(--ecom-card-border-strong)" strokeWidth="3" />
          <text x={CX} y={CY + 28} textAnchor="middle" fontSize="10" letterSpacing="0.06em" fill="var(--ecom-muted)" style={{ textTransform: "uppercase" }}>
            {waitingLabel}
          </text>
        </>
      )}
    </svg>
  );
}
