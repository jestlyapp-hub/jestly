"use client";

/**
 * Contexte de la boutique ECOM sélectionnée + middleware SWR d'injection.
 *
 * ISOLATION MULTI-BOUTIQUES centralisée en UN point : au lieu de threader un
 * `integration_id` dans les ~10 sites d'appel `useApi` (dashboard, widgets
 * imbriqués, objectifs, vue journalière…), le middleware SWR l'ajoute
 * automatiquement à toute clé `/api/ecom/*`. Conséquences :
 *  - la clé de cache devient propre à la boutique → pas de fuite d'une boutique
 *    à l'autre, bascule instantanée (cache par boutique) ;
 *  - changer de boutique change la clé → SWR refetch tout seul.
 *
 * Le middleware lit le contexte via `useContext` (licite : il s'exécute dans le
 * rendu du composant appelant, sous le Provider). Hors module ECOM, le contexte
 * vaut `null` → aucune réécriture.
 */
import { createContext, useContext } from "react";
import type { Middleware } from "swr";

/** id de l'intégration Shopify sélectionnée (ou null : boutique principale). */
export const EcomShopContext = createContext<string | null>(null);

export function useSelectedShopId(): string | null {
  return useContext(EcomShopContext);
}

/** Middleware SWR : injecte `integration_id` dans les clés `/api/ecom/*`. */
export const ecomShopMiddleware: Middleware = (useSWRNext) => (key, fetcher, config) => {
  const shopId = useContext(EcomShopContext);
  let nextKey = key;
  if (typeof key === "string" && key.startsWith("/api/ecom/") && shopId) {
    // Ne pas doubler si un appelant a déjà précisé la boutique.
    if (!key.includes("integration_id=")) {
      nextKey = key + (key.includes("?") ? "&" : "?") + "integration_id=" + encodeURIComponent(shopId);
    }
  }
  return useSWRNext(nextKey, fetcher, config);
};

/** Tableau stable de middlewares pour `<SWRConfig value={{ use: SWR_USE }}>`. */
export const ECOM_SWR_USE: Middleware[] = [ecomShopMiddleware];
