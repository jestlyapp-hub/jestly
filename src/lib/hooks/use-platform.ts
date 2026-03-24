"use client";

import { useMemo } from "react";

/** Détecte la plateforme pour afficher les raccourcis corrects (⌘ vs Ctrl) */
export function useIsMac(): boolean {
  return useMemo(
    () =>
      typeof navigator !== "undefined" &&
      /Mac|iPod|iPhone|iPad/.test(navigator.platform ?? ""),
    [],
  );
}

/** Retourne le label de la touche modificateur selon l'OS */
export function useModKey(): string {
  const isMac = useIsMac();
  return isMac ? "⌘" : "Ctrl";
}
