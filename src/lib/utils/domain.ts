// ═══════════════════════════════════════════════════════════════════
// Domain normalization — production-ready
// ═══════════════════════════════════════════════════════════════════

/**
 * Normalise un input utilisateur en domaine pur.
 *
 * Gère tous les cas :
 *  - "Claude.ai"              → "claude.ai"
 *  - "https://www.claude.ai"  → "claude.ai"
 *  - "www.claude.ai/chat"     → "claude.ai"
 *  - "  Figma.com  "          → "figma.com"
 *  - "notion"                 → "notion" (pas de TLD = retourné tel quel)
 */
export function normalizeDomain(input: string): string {
  let d = input.trim().toLowerCase();

  // Supprimer protocole
  d = d.replace(/^https?:\/\//, "");

  // Supprimer www.
  d = d.replace(/^www\./, "");

  // Supprimer tout après le premier /
  d = d.split("/")[0];

  // Supprimer tout après le premier ?
  d = d.split("?")[0];

  // Supprimer tout après le premier #
  d = d.split("#")[0];

  // Supprimer port
  d = d.split(":")[0];

  // Supprimer espaces résiduels
  d = d.replace(/\s+/g, "");

  return d;
}

/**
 * Vérifie si un domaine contient un TLD (au moins un point).
 */
export function hasTLD(domain: string): boolean {
  return domain.includes(".") && domain.split(".").pop()!.length >= 2;
}

/**
 * TLDs courants à tester pour l'auto-guess.
 * Ordonnés par probabilité pour les outils SaaS.
 */
export const COMMON_TLDS = [".com", ".ai", ".io", ".app", ".so", ".co", ".dev", ".org", ".net"] as const;

/**
 * Génère les domaines candidats à tester pour un nom sans TLD.
 * Ex: "claude" → ["claude.com", "claude.ai", "claude.io", ...]
 */
export function guessDomains(name: string): string[] {
  const base = normalizeDomain(name).replace(/[^a-z0-9-]/g, "");
  if (!base) return [];
  return COMMON_TLDS.map((tld) => `${base}${tld}`);
}
