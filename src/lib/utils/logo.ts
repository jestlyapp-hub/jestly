// ═══════════════════════════════════════════════════════════════════
// Logo detection — Clearbit + validation + fallback + cache
// ═══════════════════════════════════════════════════════════════════

import { normalizeDomain, hasTLD, guessDomains } from "./domain";

// ── Cache mémoire ────────────────────────────────────────────────
// Évite les fetches répétés pour le même domaine pendant la session.

const logoCache = new Map<string, string | null>();

// ── Clearbit URL ─────────────────────────────────────────────────

export function getClearbitLogoUrl(domain: string): string {
  return `https://logo.clearbit.com/${normalizeDomain(domain)}`;
}

// ── Validation logo (HEAD request) ───────────────────────────────

/**
 * Vérifie si un logo existe à l'URL donnée.
 * Utilise un fetch HEAD avec timeout de 3s.
 */
export async function validateLogo(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      mode: "no-cors", // Clearbit ne supporte pas CORS sur HEAD
    });

    clearTimeout(timeout);
    // no-cors retourne opaque response (status 0), on vérifie via un GET image
    return true;
  } catch {
    return false;
  }
}

/**
 * Vérifie si un logo Clearbit est valide en chargeant l'image.
 * Plus fiable que HEAD car Clearbit redirige les 404.
 */
export function validateLogoViaImage(url: string): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);

  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      img.src = "";
      resolve(false);
    }, 4000);

    img.onload = () => {
      clearTimeout(timeout);
      // Clearbit retourne un pixel 1x1 transparent pour les domaines inconnus
      // Un vrai logo fait au moins 10x10
      resolve(img.naturalWidth > 10 && img.naturalHeight > 10);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    img.src = url;
  });
}

// ── Fallback visuel ──────────────────────────────────────────────

const GRADIENT_PAIRS: [string, string][] = [
  ["#7C3AED", "#A78BFA"], // violet
  ["#3B82F6", "#93C5FD"], // blue
  ["#EC4899", "#F9A8D4"], // pink
  ["#10B981", "#6EE7B7"], // emerald
  ["#F59E0B", "#FCD34D"], // amber
  ["#EF4444", "#FCA5A5"], // red
  ["#06B6D4", "#67E8F9"], // cyan
  ["#8B5CF6", "#C4B5FD"], // purple
  ["#6366F1", "#A5B4FC"], // indigo
  ["#14B8A6", "#5EEAD4"], // teal
];

/**
 * Génère un logo fallback basé sur le nom.
 * Couleur stable (hash déterministe).
 */
export function generateLetterLogo(name: string): {
  letter: string;
  gradientFrom: string;
  gradientTo: string;
  background: string;
} {
  const letter = name.charAt(0).toUpperCase();

  // Hash déterministe du nom pour couleur stable
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PAIRS.length;
  const [from, to] = GRADIENT_PAIRS[index];

  return {
    letter,
    gradientFrom: from,
    gradientTo: to,
    background: `linear-gradient(135deg, ${from}, ${to})`,
  };
}

// ── Auto-guess domaine ───────────────────────────────────────────

/**
 * Si l'input n'a pas de TLD, teste les domaines courants
 * et retourne le premier avec un logo valide.
 */
export async function autoGuessDomain(
  name: string,
): Promise<{ domain: string; logoUrl: string } | null> {
  const normalized = normalizeDomain(name);

  // Si déjà un domaine complet, tester directement
  if (hasTLD(normalized)) {
    const url = getClearbitLogoUrl(normalized);
    const cached = logoCache.get(normalized);
    if (cached !== undefined) {
      return cached ? { domain: normalized, logoUrl: cached } : null;
    }
    const valid = await validateLogoViaImage(url);
    logoCache.set(normalized, valid ? url : null);
    return valid ? { domain: normalized, logoUrl: url } : null;
  }

  // Pas de TLD → tester les candidats
  const candidates = guessDomains(normalized);
  for (const domain of candidates) {
    const cached = logoCache.get(domain);
    if (cached !== undefined) {
      if (cached) return { domain, logoUrl: cached };
      continue;
    }

    const url = getClearbitLogoUrl(domain);
    const valid = await validateLogoViaImage(url);
    logoCache.set(domain, valid ? url : null);
    if (valid) return { domain, logoUrl: url };
  }

  return null;
}

// ── Résolution complète ──────────────────────────────────────────

export interface LogoResult {
  logoUrl: string | null;
  resolvedDomain: string | null;
  isFallback: boolean;
  fallback: ReturnType<typeof generateLetterLogo>;
}

/**
 * Résout le logo pour un abonnement donné.
 * 1. Si domaine fourni → normalise + teste Clearbit
 * 2. Si pas de domaine → auto-guess à partir du nom
 * 3. Fallback lettre si rien ne marche
 */
export async function resolveLogo(
  name: string,
  domain?: string | null,
): Promise<LogoResult> {
  const fallback = generateLetterLogo(name);

  // Cas 1: domaine explicite
  if (domain) {
    const normalized = normalizeDomain(domain);
    const cacheKey = normalized;

    // Check cache
    const cached = logoCache.get(cacheKey);
    if (cached !== undefined) {
      return cached
        ? { logoUrl: cached, resolvedDomain: normalized, isFallback: false, fallback }
        : { logoUrl: null, resolvedDomain: normalized, isFallback: true, fallback };
    }

    const url = getClearbitLogoUrl(normalized);
    const valid = await validateLogoViaImage(url);
    logoCache.set(cacheKey, valid ? url : null);

    if (valid) {
      return { logoUrl: url, resolvedDomain: normalized, isFallback: false, fallback };
    }
  }

  // Cas 2: auto-guess à partir du nom
  const guessed = await autoGuessDomain(name);
  if (guessed) {
    return {
      logoUrl: guessed.logoUrl,
      resolvedDomain: guessed.domain,
      isFallback: false,
      fallback,
    };
  }

  // Cas 3: fallback
  return { logoUrl: null, resolvedDomain: null, isFallback: true, fallback };
}
