/**
 * Regroupements temporels en Europe/Paris (passe qualité A1).
 *
 * Toutes les agrégations « par jour » du module Analytics doivent utiliser le
 * jour de Paris, pas le jour UTC : une commande à 00 h 30 heure de Paris
 * appartient à SON jour, pas à la veille. Les dates de gads_daily viennent du
 * compte Google Ads (fuseau Paris) — ces helpers alignent le CA Shopify sur
 * le même axe.
 */
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const PARIS_TZ = "Europe/Paris";

/** Jour de Paris (YYYY-MM-DD) d'un instant ISO/Date. */
export function parisDay(instant: string | Date): string {
  return formatInTimeZone(instant, PARIS_TZ, "yyyy-MM-dd");
}

/** Instant UTC (ISO) du minuit de Paris d'un jour YYYY-MM-DD. */
export function parisDayStartUtcIso(day: string): string {
  return fromZonedTime(`${day}T00:00:00`, PARIS_TZ).toISOString();
}

/** Instant UTC (ISO) du minuit de Paris du jour SUIVANT (borne exclusive). */
export function parisNextDayStartUtcIso(day: string): string {
  const next = new Date(new Date(`${day}T12:00:00Z`).getTime() + 24 * 3600 * 1000)
    .toISOString().slice(0, 10);
  return parisDayStartUtcIso(next);
}

/** Aujourd'hui, au sens de Paris. */
export function todayParis(): string {
  return parisDay(new Date());
}

/** Il y a N-1 jours (plage de N jours se terminant aujourd'hui, Paris). */
export function parisDaysAgo(days: number): string {
  return parisDay(new Date(Date.now() - days * 24 * 3600 * 1000));
}
