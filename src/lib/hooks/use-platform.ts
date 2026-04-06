"use client";

import { useState, useEffect } from "react";

/** Détecte la plateforme pour afficher les raccourcis corrects (⌘ vs Ctrl) */
export function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform ?? ""));
  }, []);
  return isMac;
}

/** Retourne le label de la touche modificateur selon l'OS */
export function useModKey(): string {
  const isMac = useIsMac();
  return isMac ? "⌘" : "Ctrl";
}
