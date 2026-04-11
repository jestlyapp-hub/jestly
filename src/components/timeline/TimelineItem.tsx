"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  UserPlus,
  FileText,
  Palette,
  CheckSquare,
  CircleCheck,
  PackageCheck,
  AlertTriangle,
  CreditCard,
  Upload,
  MessageCircle,
  Bell,
  Clock,
} from "lucide-react";
import type { TimelineEvent } from "@/types/timeline";

// ── Icon mapping ─────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  "shopping-bag": ShoppingBag,
  "user-plus": UserPlus,
  "file-text": FileText,
  "palette": Palette,
  "check-square": CheckSquare,
  "circle-check": CircleCheck,
  "package-check": PackageCheck,
  "check-circle": CircleCheck,
  "alert-triangle": AlertTriangle,
  "credit-card": CreditCard,
  "upload": Upload,
  "message-circle": MessageCircle,
  "bell": Bell,
  "clock": Clock,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
  slate: { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200" },
};

// ── Navigation par type d'entité ─────────────────────────────

function getEntityHref(entityType: string | null, entityId: string | null): string | null {
  if (!entityType || !entityId) return null;
  const routes: Record<string, string> = {
    order: "/commandes",
    client: "/clients",
    invoice: "/facturation",
    project: "/projets",
    task: "/taches",
  };
  const base = routes[entityType];
  if (!base) return null;
  return `${base}?id=${entityId}`;
}

// ── Timestamp relatif ────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

// ── Component ────────────────────────────────────────────────

interface TimelineItemProps {
  event: TimelineEvent;
  isLast?: boolean;
}

export default function TimelineItem({ event, isLast = false }: TimelineItemProps) {
  const router = useRouter();

  const IconComponent = ICON_MAP[event.icon || ""] || Bell;
  const colors = COLOR_MAP[event.color || "slate"] || COLOR_MAP.slate;
  const href = getEntityHref(event.entity_type, event.entity_id);

  const metadata = event.metadata || {};
  const clientName = metadata.client_name as string | undefined;
  const amount = metadata.amount as number | undefined;
  const currency = (metadata.currency as string) || "EUR";

  // Description enrichie
  let subtitle = event.description || "";
  if (clientName && amount) {
    subtitle = `${clientName} — ${amount}${currency === "EUR" ? "€" : ` ${currency}`}`;
  } else if (clientName) {
    subtitle = clientName;
  } else if (amount) {
    subtitle = `${amount}${currency === "EUR" ? "€" : ` ${currency}`}`;
  }

  const handleClick = () => {
    if (href) router.push(href);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" as const }}
      className="relative flex gap-4 group"
    >
      {/* ── Timeline line + dot ── */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${colors.bg} ${
            event.is_important ? `ring-2 ${colors.border}` : ""
          }`}
        >
          <IconComponent size={16} strokeWidth={1.8} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 min-h-[24px] bg-[#E6E6E4]" />
        )}
      </div>

      {/* ── Event card ── */}
      <div
        onClick={handleClick}
        className={`flex-1 pb-6 ${href ? "cursor-pointer" : ""}`}
      >
        <div
          className={`rounded-lg border px-4 py-3 transition-all duration-150 ${
            event.is_important
              ? `border-l-2 ${colors.border} bg-white shadow-sm`
              : "border-[#E6E6E4] bg-white hover:bg-[#FBFBFA]"
          } ${href ? "hover:shadow-sm hover:-translate-y-px" : ""}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#191919] leading-snug">
                {event.title}
              </p>
              {subtitle && (
                <p className="text-[12px] text-[#8A8A88] mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            <span className="text-[11px] text-[#B0B0AE] whitespace-nowrap flex-shrink-0 mt-0.5">
              {relativeTime(event.created_at)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
