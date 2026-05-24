/**
 * Helpers de formatage FR pour le dashboard ecom.
 */
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function formatCurrency(amount: number | null | undefined, currency = "EUR"): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function formatPercent(n: number | null | undefined, digits = 1): string {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(digits)} %`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "d MMM yyyy", { locale: fr });
  } catch {
    return iso;
  }
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "d MMM", { locale: fr });
  } catch {
    return iso;
  }
}

export function formatRelativeDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: fr });
  } catch {
    return iso;
  }
}

export function formatFinancialStatus(status: string | null | undefined): { label: string; color: string } {
  switch (status) {
    case "paid": return { label: "Payée", color: "emerald" };
    case "pending": return { label: "En attente", color: "amber" };
    case "authorized": return { label: "Autorisée", color: "blue" };
    case "partially_paid": return { label: "Partiellement payée", color: "amber" };
    case "refunded": return { label: "Remboursée", color: "gray" };
    case "partially_refunded": return { label: "Partiellement remboursée", color: "gray" };
    case "voided": return { label: "Annulée", color: "rose" };
    default: return { label: status ?? "—", color: "gray" };
  }
}

export function formatFulfillmentStatus(status: string | null | undefined): { label: string; color: string } {
  switch (status) {
    case "fulfilled": return { label: "Expédiée", color: "emerald" };
    case "partial": return { label: "Partielle", color: "amber" };
    case "unfulfilled":
    case null:
    case undefined:
      return { label: "À expédier", color: "rose" };
    case "scheduled": return { label: "Planifiée", color: "blue" };
    case "on_hold": return { label: "En attente", color: "amber" };
    default: return { label: status ?? "—", color: "gray" };
  }
}

export function formatSource(source: string | null | undefined): string {
  if (!source) return "Direct";
  const map: Record<string, string> = {
    "web": "Site web",
    "shopify_draft_order": "Commande manuelle",
    "pos": "Point de vente",
    "android": "Mobile Android",
    "iphone": "Mobile iPhone",
  };
  return map[source] ?? source;
}

/** Calcule la variation en % entre deux valeurs. */
export function computeVariation(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}
