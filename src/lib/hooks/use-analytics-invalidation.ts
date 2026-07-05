"use client";

/**
 * Invalidation croisée des données Analytics (BUG N°1 de la passe qualité).
 *
 * Le cache SWR global ne revalide ni au focus ni entre vues (dedupe 10 s) :
 * une mutation (attribution manuelle, override, coûts…) laissait les autres
 * vues (Vue d'ensemble, Attribution, Produits) sur des données stales.
 * Ce hook revalide TOUTES les clés du module ECOM après une mutation —
 * les vues montées se rafraîchissent immédiatement, les autres au prochain
 * affichage.
 */
import { useCallback } from "react";
import { useSWRConfig } from "swr";

export function useAnalyticsInvalidation(): () => Promise<void> {
  const { mutate } = useSWRConfig();
  return useCallback(async () => {
    await mutate((key) => typeof key === "string" && key.startsWith("/api/ecom/"));
  }, [mutate]);
}
