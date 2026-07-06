"use client";

import { useEffect } from "react";

/**
 * Titre d'onglet par page pour les vues client (le dashboard ECOM est entièrement
 * en composants client — l'export `metadata` de Next n'y est pas disponible).
 * Chaque vue a ainsi son propre titre au lieu du générique « Logiciel de gestion
 * freelance tout-en-un | Jestly ». Restaure le titre précédent au démontage.
 */
export function usePageTitle(title: string, suffix = "Jestly"): void {
  useEffect(() => {
    const previous = document.title;
    document.title = suffix ? `${title} | ${suffix}` : title;
    return () => {
      document.title = previous;
    };
  }, [title, suffix]);
}
