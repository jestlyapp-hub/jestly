"use client";

import { useState, useEffect, useRef } from "react";
import { resolveLogo, generateLetterLogo, type LogoResult } from "@/lib/utils/logo";

interface UseSubscriptionLogoResult {
  /** URL du logo (Clearbit) ou null si fallback */
  logoUrl: string | null;
  /** True si on affiche le fallback lettre */
  isFallback: boolean;
  /** True pendant le chargement/validation */
  isLoading: boolean;
  /** Données fallback (lettre + gradient) — toujours disponible */
  fallback: ReturnType<typeof generateLetterLogo>;
  /** Domaine résolu (peut différer de l'input si auto-guess) */
  resolvedDomain: string | null;
}

/**
 * Hook qui résout automatiquement le logo d'un abonnement.
 *
 * - Si domaine fourni → teste Clearbit avec normalisation
 * - Si pas de domaine → auto-guess à partir du nom (claude → claude.ai)
 * - Fallback lettre + gradient si rien ne marche
 * - Cache mémoire intégré (pas de double-fetch)
 *
 * ```tsx
 * const { logoUrl, isFallback, isLoading, fallback } = useSubscriptionLogo("Claude", "claude.ai");
 * ```
 */
export function useSubscriptionLogo(
  name: string,
  domain?: string | null,
): UseSubscriptionLogoResult {
  const fallback = generateLetterLogo(name || "?");
  const [result, setResult] = useState<LogoResult>({
    logoUrl: null,
    resolvedDomain: null,
    isFallback: true,
    fallback,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Track the latest request to avoid stale updates
  const requestId = useRef(0);

  useEffect(() => {
    if (!name) {
      setResult({ logoUrl: null, resolvedDomain: null, isFallback: true, fallback });
      setIsLoading(false);
      return;
    }

    const id = ++requestId.current;
    setIsLoading(true);

    resolveLogo(name, domain).then((res) => {
      // Only update if this is still the latest request
      if (id === requestId.current) {
        setResult(res);
        setIsLoading(false);
      }
    });
  }, [name, domain]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    logoUrl: result.logoUrl,
    isFallback: result.isFallback,
    isLoading,
    fallback: result.fallback,
    resolvedDomain: result.resolvedDomain,
  };
}
