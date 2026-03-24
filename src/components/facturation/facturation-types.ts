import type { BillingItemStatus } from "@/types";

/* ── Pipeline item type (unified order + manual) ── */

export interface PipelineItem {
  id: string;
  type: "order" | "manual" | "recurring";
  title: string;
  clientId: string | null;
  clientName: string | null;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalTtc: number;
  billingStatus: BillingStatusKey;
  orderStatus?: string | null;
  priority?: string | null;
  createdAt: string;
  deadline?: string | null;
  deliveredAt?: string | null;
  invoicedAt?: string | null;
  paidAt?: string | null;
  category: string;
  tags: string[];
  notes: string;
  source: string;
  // Manual item extra fields
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  description?: string;
  billingItemId?: string;
}

export type BillingStatusKey = "in_progress" | "ready" | "invoiced" | "paid";

/* ── Billing status config ── */

export const billingStatusConfig: Record<BillingStatusKey, { label: string; bg: string; text: string; dot: string }> = {
  in_progress: { label: "En cours", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  ready: { label: "Prête", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  invoiced: { label: "Facturée", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  paid: { label: "Payée", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
};

export const orderStatusLabels: Record<string, string> = {
  new: "À faire",
  brief_received: "Brief reçu",
  in_progress: "En production",
  in_review: "En révision",
  validated: "Validé",
  delivered: "Prête",
  invoiced: "Facturé",
  paid: "Payé",
};

export const sourceLabels: Record<string, string> = {
  manual: "Saisie manuelle",
  order: "Commande",
  recurring: "Récurrent",
  template: "Template",
  task: "Tâche",
};

/* ── Tab config ── */

export type TabKey = "all" | "in_progress" | "ready" | "invoiced" | "paid";

export const tabs: { key: TabKey; label: string; billingStatuses: BillingStatusKey[] }[] = [
  { key: "all", label: "Toutes", billingStatuses: [] },
  { key: "in_progress", label: "En cours", billingStatuses: ["in_progress"] },
  { key: "ready", label: "Prêtes", billingStatuses: ["ready"] },
  { key: "invoiced", label: "Facturées", billingStatuses: ["invoiced"] },
  { key: "paid", label: "Payées", billingStatuses: ["paid"] },
];

/* ── View mode ── */

export type ViewMode = "list" | "client" | "period";

/* ── Billing transitions ── */

export const billingTransitions: Record<BillingStatusKey, { label: string; next: BillingStatusKey }[]> = {
  in_progress: [
    { label: "Marquer prête", next: "ready" },
  ],
  ready: [
    { label: "Marquer facturée", next: "invoiced" },
  ],
  invoiced: [
    { label: "Marquer payée", next: "paid" },
    { label: "Retour prête", next: "ready" },
  ],
  paid: [
    { label: "Retour facturée", next: "invoiced" },
  ],
};

/* ── Period filter ── */

export type PeriodKey = "all" | "week" | "month" | "quarter" | "year";

export const periodOptions: { key: PeriodKey; label: string }[] = [
  { key: "all", label: "Toutes les dates" },
  { key: "week", label: "Cette semaine" },
  { key: "month", label: "Ce mois-ci" },
  { key: "quarter", label: "Ce trimestre" },
  { key: "year", label: "Cette année" },
];

export function getPeriodRange(key: PeriodKey): { start: string; end: string } | null {
  if (key === "all") return null;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const day = now.getDay();
  let start: Date;
  let end: Date;
  switch (key) {
    case "week": {
      const diff = day === 0 ? 6 : day - 1;
      start = new Date(y, m, d - diff);
      end = new Date(y, m, d + (6 - diff));
      break;
    }
    case "month":
      start = new Date(y, m, 1);
      end = new Date(y, m + 1, 0);
      break;
    case "quarter": {
      const q = Math.floor(m / 3);
      start = new Date(y, q * 3, 1);
      end = new Date(y, q * 3 + 3, 0);
      break;
    }
    case "year":
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31);
      break;
  }
  return {
    start: start!.toISOString().slice(0, 10),
    end: end!.toISOString().slice(0, 10),
  };
}

/* ── Helpers ── */

export function formatEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function formatDateLong(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Shared Tailwind tokens ── */

export const tw = {
  input: "w-full px-3.5 py-2.5 text-[13px] text-[#191919] border border-[#E6E6E4] rounded-lg bg-white focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 placeholder:text-[#C4C4C2] transition-all",
  label: "block text-[12px] font-medium text-[#57534E] mb-1.5",
  select: "w-full px-3.5 py-2.5 text-[13px] text-[#191919] border border-[#E6E6E4] rounded-lg bg-white focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition-all appearance-none",
} as const;

/* ── Export helpers ── */

export interface ExportMeta {
  filename: string;
  format: "csv" | "pdf";
  itemCount: number;
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  clientCount: number;
  clientIds: string[];
  itemIds: string[];
  periodStart: string | null;
  periodEnd: string | null;
}

/* ── Stats interface ── */

export interface BillingStats {
  totalHt: number;
  totalTtc: number;
  readyHt: number;
  readyTtc: number;
  exportedHt: number;
  invoicedHt: number;
  monthHt: number;
  activeClients: number;
  itemCount: number;
  draftCount: number;
  readyCount: number;
}

/* ── Health API types ── */

export interface HealthAnomaly {
  id: string;
  type: string;
  severity: "error" | "warning" | "info";
  title: string;
  description: string;
  itemId?: string;
  itemTitle?: string;
  fix?: string;
}

export interface HealthSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  orderId?: string;
  profileId?: string;
  clientName?: string;
  amount?: number;
  action: string;
}

export interface HealthCheckItem {
  id: string;
  label: string;
  description: string;
  done: boolean;
  count?: number;
  severity: "success" | "warning" | "error";
}

export interface HealthData {
  score: number;
  anomalies: HealthAnomaly[];
  suggestions: HealthSuggestion[];
  checklist: HealthCheckItem[];
  month: {
    label: string;
    totalItems: number;
    totalHt: number;
    readyHt: number;
    drafts: number;
    ready: number;
    exported: number;
    invoiced: number;
  };
  counts: {
    errors: number;
    warnings: number;
    infos: number;
    suggestions: number;
  };
}
