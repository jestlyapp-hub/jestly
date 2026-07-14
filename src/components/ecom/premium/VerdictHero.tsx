"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { RatioGauge } from "./RatioGauge";

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
  /** Aucune commande / donnée insuffisante : verdict non calculable (neutre). */
  insufficientData?: boolean;
  profitable: boolean;
  netProfitLabel: string | null;   // Net Profit formaté (verdict principal)
  netProfitNegative: boolean;
  mer: number | null;
  beRoas: number | null;
  merLabel: string | null;         // MER formaté (fallback verdict + contexte)
  beRoasLabel: string | null;
  calibrateHref: string;
}

export function VerdictHero({
  periodLabel,
  costsConfigured,
  insufficientData = false,
  profitable,
  netProfitLabel,
  netProfitNegative,
  mer,
  beRoas,
  merLabel,
  beRoasLabel,
  calibrateHref,
}: Props) {
  // Données insuffisantes (0 commande) : verdict neutre, on ne feint pas un calcul.
  const noVerdict = insufficientData && costsConfigured;
  const hasGauge = !noVerdict && costsConfigured && mer != null && beRoas != null && beRoas > 0;
  const ratio = hasGauge ? mer! / beRoas! : 0;
  const gap = hasGauge ? ratio - 1 : 0; // écart au point mort, en « ×seuil »

  const heroValue = noVerdict ? "—" : (costsConfigured && netProfitLabel != null ? netProfitLabel : (merLabel ?? "—"));
  const heroTone = noVerdict
    ? "text-[var(--ecom-muted)]"
    : costsConfigured && netProfitLabel != null
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
            {noVerdict ? (
              <>
                <StatusBadge tone="neutral" size="lg" label="Rentabilité non calculable" />
                <span className="text-[var(--ecom-fs-label)] text-[var(--ecom-muted)]">Aucune commande sur la période.</span>
              </>
            ) : costsConfigured ? (
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
          <RatioGauge
            ratio={hasGauge ? ratio : null}
            positive={profitable}
            sublabel="MER / SEUIL"
            ariaLabel={hasGauge ? `Ratio MER sur seuil : ${ratio.toFixed(2)}` : "Cadran en attente de calibrage"}
          />
        </div>
      </div>
    </section>
  );
}
