import type { ProductType, ProductMode, ProductStatus } from "@/types";

export const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "service", label: "Service" },
  { value: "pack", label: "Pack" },
  { value: "digital", label: "Digital" },
  { value: "lead_magnet", label: "Lead magnet" },
];

export const PRODUCT_MODES: { value: ProductMode; label: string }[] = [
  { value: "checkout", label: "Paiement" },
  { value: "contact", label: "Contact (formulaire)" },
];

export const PRODUCT_STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "draft", label: "Brouillon" },
  { value: "active", label: "Actif" },
  { value: "archived", label: "Archivé" },
];

export function defaultCtaLabel(type: ProductType, mode: ProductMode): string {
  if (type === "lead_magnet") return "Obtenir";
  if (type === "digital") return mode === "checkout" ? "Télécharger" : "Demander un devis";
  return mode === "checkout" ? "Acheter" : "Demander un devis";
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

export function centsToEuros(cents: number): number {
  return cents / 100;
}
