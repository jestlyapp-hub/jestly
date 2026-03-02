import type { OrderStatus, InvoiceStatus, SubscriptionStatus, SitePageStatus, SiteOrderStatus } from "@/types";

type Status = OrderStatus | InvoiceStatus | SubscriptionStatus | SitePageStatus | SiteOrderStatus;

const config: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "En attente", bg: "bg-gray-100", text: "text-gray-600" },
  in_progress: { label: "En cours", bg: "bg-[#F0EBFF]", text: "text-[#6a18f1]" },
  delivered: { label: "Livré", bg: "bg-emerald-50", text: "text-emerald-600" },
  cancelled: { label: "Annulé", bg: "bg-red-50", text: "text-red-500" },
  paid: { label: "Payée", bg: "bg-emerald-50", text: "text-emerald-600" },
  overdue: { label: "En retard", bg: "bg-amber-50", text: "text-amber-600" },
  active: { label: "Actif", bg: "bg-emerald-50", text: "text-emerald-600" },
  paused: { label: "Pausé", bg: "bg-amber-50", text: "text-amber-600" },
  published: { label: "Publiée", bg: "bg-emerald-50", text: "text-emerald-600" },
  draft: { label: "Brouillon", bg: "bg-gray-100", text: "text-gray-600" },
};

export default function BadgeStatus({ status }: { status: Status }) {
  const c = config[status] ?? { label: status, bg: "bg-gray-100", text: "text-gray-600" };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
