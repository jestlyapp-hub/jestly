/**
 * Redirections de l'ancien module « Analytics » (/ecom/gads/*) vers la
 * nouvelle architecture (refonte ECOM). Les paramètres de période (?from&to&pl)
 * et le reste de la query sont préservés — aucun lien existant ne casse.
 */
import { redirect } from "next/navigation";

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function redirectPreservingQuery(
  destination: string,
  searchParams: SearchParams,
  extra?: Record<string, string>,
): Promise<never> {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") params.set(key, value);
  }
  for (const [key, value] of Object.entries(extra ?? {})) params.set(key, value);
  const qs = params.toString();
  redirect(qs ? `${destination}?${qs}` : destination);
}
