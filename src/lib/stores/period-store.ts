/**
 * Global Period Store — Source de vérité unique pour le filtre date
 *
 * Persiste dans localStorage. Partagé entre toutes les pages dashboard.
 * Utilise useSyncExternalStore (React 18+) — zéro dépendance externe.
 *
 * Usage :
 *   const [period, setPeriod] = useGlobalPeriod();
 *
 * Pour réinitialiser :
 *   setPeriod(PERIOD_ALL);
 *
 * Compatible SSR : retourne PERIOD_ALL côté serveur (hydration safe).
 */
"use client";

import { useSyncExternalStore } from "react";
import { type PeriodFilter, PERIOD_ALL } from "@/lib/period-filter";

const STORAGE_KEY = "jestly_global_period";

/* ── Internal state ── */

let currentPeriod: PeriodFilter = PERIOD_ALL;
const listeners = new Set<() => void>();

// Charger depuis localStorage à l'init du module (client uniquement)
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.label === "string") {
        currentPeriod = parsed;
      }
    }
  } catch {
    // localStorage corrompu ou désactivé — fallback PERIOD_ALL
  }
}

/* ── Store internals ── */

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): PeriodFilter {
  return currentPeriod;
}

function getServerSnapshot(): PeriodFilter {
  return PERIOD_ALL;
}

/* ── Public API ── */

/**
 * Met à jour le filtre global et persiste dans localStorage.
 * Déclenche un re-render de tous les composants abonnés.
 */
export function setGlobalPeriod(period: PeriodFilter): void {
  currentPeriod = period;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(period));
  } catch {
    // localStorage plein ou désactivé
  }
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Hook principal — lit et écrit le filtre date global.
 * Persiste entre les navigations et les refresh navigateur.
 */
export function useGlobalPeriod(): [PeriodFilter, (p: PeriodFilter) => void] {
  const period = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [period, setGlobalPeriod];
}
