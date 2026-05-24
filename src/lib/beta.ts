/**
 * Whitelist e-mail pour la bêta privée du tour de pilotage /ecom (V1).
 * Remplace le check UUID hardcodé : robuste local/prod (l'UUID Supabase diffère
 * entre environnements, l'e-mail non).
 *
 * Config via env serveur `JESTLY_BETA_EMAILS` (CSV). Ne jamais exposer côté client —
 * le check se fait server-side (routes API) et le résultat booléen est transmis au UI.
 */
export function getBetaEmails(): string[] {
  return (process.env.JESTLY_BETA_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isBetaEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getBetaEmails().includes(email.toLowerCase());
}
