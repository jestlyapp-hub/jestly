"use client";

// Re-export depuis le SiteProvider partagé.
// Toutes les pages sous /site-web/ utilisent le même state via le contexte.
export { useSiteContext as useSite } from "@/lib/contexts/site-context";
export type { UseSiteResult } from "@/lib/contexts/site-context";
