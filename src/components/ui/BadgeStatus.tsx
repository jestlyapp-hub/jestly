import type { OrderStatus, InvoiceStatus, SubscriptionStatus, SitePageStatus, SiteOrderStatus, ClientStatus } from "@/types";

type Status = OrderStatus | InvoiceStatus | SubscriptionStatus | SitePageStatus | SiteOrderStatus | ClientStatus | "new" | "refunded" | "brief_received" | "in_review" | "validated" | "invoiced" | "dispute";

const config: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "En attente", bg: "bg-gray-100", text: "text-gray-600" },
  new: { label: "À faire", bg: "bg-blue-50", text: "text-blue-600" },
  brief_received: { label: "Brief reçu", bg: "bg-violet-50", text: "text-violet-600" },
  in_progress: { label: "En cours", bg: "bg-[#EEF2FF]", text: "text-[#4F46E5]" },
  in_review: { label: "En review", bg: "bg-amber-50", text: "text-amber-600" },
  validated: { label: "Validé", bg: "bg-emerald-50", text: "text-emerald-600" },
  delivered: { label: "Livré", bg: "bg-emerald-50", text: "text-emerald-600" },
  invoiced: { label: "Facturé", bg: "bg-cyan-50", text: "text-cyan-600" },
  paid: { label: "Payé", bg: "bg-green-50", text: "text-green-600" },
  cancelled: { label: "Annulé", bg: "bg-red-50", text: "text-red-500" },
  refunded: { label: "Remboursé", bg: "bg-red-50", text: "text-red-500" },
  dispute: { label: "Litige", bg: "bg-red-50", text: "text-red-600" },
  overdue: { label: "En retard", bg: "bg-amber-50", text: "text-amber-600" },
  active: { label: "Actif", bg: "bg-emerald-50", text: "text-emerald-600" },
  paused: { label: "Pause", bg: "bg-amber-50", text: "text-amber-600" },
  published: { label: "Publiée", bg: "bg-emerald-50", text: "text-emerald-600" },
  draft: { label: "Brouillon", bg: "bg-gray-100", text: "text-gray-600" },
  archived: { label: "Archivé", bg: "bg-gray-100", text: "text-gray-500" },
  inactive: { label: "Inactif", bg: "bg-amber-50", text: "text-amber-600" },
};

export default function BadgeStatus({ status }: { status: Status }) {
  const c = config[status] ?? { label: status, bg: "bg-gray-100", text: "text-gray-600" };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
