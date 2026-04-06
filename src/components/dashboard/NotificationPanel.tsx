"use client";

/* ══════════════════════════════════════════════════════════════════════
   NotificationPanel — Centre de notifications premium Jestly
   Bell + dropdown panel avec filtres, actions, realtime.
   ══════════════════════════════════════════════════════════════════════ */

import { useState, useRef, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Bell, Check, CheckCheck, Settings, ShoppingBag, PackageCheck,
  Receipt, CalendarClock, Puzzle, CreditCard, CheckSquare, Calendar,
  Lightbulb, HeartPulse, MailOpen, AlertTriangle, Inbox,
} from "lucide-react";
import { useNotifications } from "@/lib/notifications/use-notifications";
import { NOTIFICATION_TYPES, CATEGORY_LABELS, FILTER_CATEGORIES } from "@/lib/notifications/config";
import type { NotificationRow, NotificationCategory } from "@/lib/notifications/types";

/* ── Mapping icônes par nom (depuis config.ts) ── */
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  ShoppingBag, PackageCheck, Receipt, CalendarClock, Puzzle,
  CreditCard, CheckSquare, Calendar, Lightbulb, HeartPulse,
  MailOpen, AlertTriangle,
};

/* ── Temps relatif ── */
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/* ── Groupement temporel ── */
function groupByTime(notifications: NotificationRow[]): { label: string; items: NotificationRow[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;

  const groups: { label: string; items: NotificationRow[] }[] = [
    { label: "Aujourd'hui", items: [] },
    { label: "Hier", items: [] },
    { label: "Cette semaine", items: [] },
    { label: "Plus ancien", items: [] },
  ];

  for (const n of notifications) {
    const t = new Date(n.created_at).getTime();
    if (t >= today) groups[0].items.push(n);
    else if (t >= yesterday) groups[1].items.push(n);
    else if (t >= weekAgo) groups[2].items.push(n);
    else groups[3].items.push(n);
  }

  return groups.filter(g => g.items.length > 0);
}

/* ══════════════════════════════════════════════════════════════════════
   Composant principal
   ══════════════════════════════════════════════════════════════════════ */

export default function NotificationPanel() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationCategory | "all">("all");
  const ref = useRef<HTMLDivElement>(null);

  // Guard de montage — évite tout mismatch SSR/client
  useEffect(() => { setMounted(true); }, []);

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    category: activeFilter,
    limit: 30,
    enabled: mounted, // ne fetch que côté client après mount
  });

  // Fermer au clic extérieur
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Fermer avec Escape
  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const groups = groupByTime(notifications);

  // SSR-safe : rendu statique avant hydratation, dynamique après mount
  if (!mounted) {
    return (
      <div className="relative">
        <button
          className="relative p-2 rounded-lg hover:bg-[#F7F7F5] transition-all duration-150 cursor-pointer group"
          aria-label="Notifications"
          aria-expanded={false}
          aria-haspopup="dialog"
        >
          <Bell
            size={19}
            className="text-[#78716C] group-hover:text-[#57534E] transition-colors"
            strokeWidth={1.8}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      {/* ── Bell trigger ── */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-[#F7F7F5] transition-all duration-150 cursor-pointer group"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell
          size={19}
          className="text-[#78716C] group-hover:text-[#57534E] transition-colors"
          strokeWidth={1.8}
        />
        {/* Badge compteur */}
        <AnimatePresence initial={false}>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#7C3AED] text-white text-[10px] font-bold leading-none px-1 shadow-sm shadow-[#7C3AED]/30"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Panel dropdown ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="dialog"
            aria-label="Centre de notifications"
            className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-[#E6E6E4] shadow-xl shadow-black/8 w-[420px] max-w-[calc(100vw-2rem)] overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[15px] font-semibold text-[#191919]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-semibold text-[#7C3AED] bg-[#F0EEFF] px-2 py-0.5 rounded-full">
                      {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="flex items-center gap-1 text-[11px] font-medium text-[#7C3AED] hover:text-[#6D28D9] px-2 py-1 rounded-md hover:bg-[#F0EEFF] transition-colors"
                      title="Tout marquer comme lu"
                    >
                      <CheckCheck size={13} />
                      Tout lu
                    </button>
                  )}
                  <Link
                    href="/parametres#notifications"
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-md text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F7F7F5] transition-colors"
                    title="Préférences de notifications"
                  >
                    <Settings size={14} />
                  </Link>
                </div>
              </div>

              {/* ── Filtres ── */}
              <div className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1">
                {FILTER_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full transition-all duration-150 ${
                      activeFilter === cat
                        ? "bg-[#191919] text-white"
                        : "text-[#78716C] hover:bg-[#F7F7F5] hover:text-[#57534E]"
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#F0F0EE]" />

            {/* ── Liste ── */}
            <div className="max-h-[420px] overflow-y-auto overscroll-contain">
              {loading && notifications.length === 0 ? (
                /* Skeleton */
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="w-9 h-9 rounded-xl bg-[#F0F0EE] flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-0.5">
                        <div className="h-3 bg-[#F0F0EE] rounded w-3/4" />
                        <div className="h-2.5 bg-[#F7F7F5] rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                /* Empty state */
                <div className="py-14 px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F7F5] flex items-center justify-center mx-auto mb-3">
                    <Inbox size={22} className="text-[#D6D3D1]" />
                  </div>
                  <p className="text-[13px] font-medium text-[#A8A29E]">
                    {activeFilter === "all"
                      ? "Aucune notification pour le moment"
                      : `Aucune notification dans ${CATEGORY_LABELS[activeFilter]}`}
                  </p>
                  <p className="text-[11px] text-[#D6D3D1] mt-1">
                    Les nouvelles notifications apparaîtront ici en temps réel.
                  </p>
                </div>
              ) : (
                /* Grouped notifications */
                groups.map((group) => (
                  <Fragment key={group.label}>
                    <div className="px-5 pt-3 pb-1.5">
                      <p className="text-[10px] font-semibold text-[#C4C4C2] uppercase tracking-wider">
                        {group.label}
                      </p>
                    </div>
                    {group.items.map((notif) => (
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        onMarkRead={markAsRead}
                        onClose={() => setOpen(false)}
                      />
                    ))}
                  </Fragment>
                ))
              )}
            </div>

            {/* ── Footer ── */}
            {notifications.length > 0 && (
              <>
                <div className="h-px bg-[#F0F0EE]" />
                <div className="px-5 py-2.5">
                  <Link
                    href="/parametres#notifications"
                    onClick={() => setOpen(false)}
                    className="text-[11px] font-medium text-[#A8A29E] hover:text-[#7C3AED] transition-colors"
                  >
                    Gérer les préférences de notifications
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   NotificationItem — Ligne individuelle
   ══════════════════════════════════════════════════════════════════════ */

function NotificationItem({
  notification: n,
  onMarkRead,
  onClose,
}: {
  notification: NotificationRow;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) {
  const config = NOTIFICATION_TYPES[n.type];
  const IconComponent = ICON_MAP[config?.icon ?? ""] ?? Bell;
  const colors = config?.colors ?? { bg: "bg-slate-50", text: "text-slate-600" };

  const handleClick = () => {
    if (!n.is_read) onMarkRead(n.id);
    if (n.cta_href) onClose();
  };

  const content = (
    <div
      className={`flex items-start gap-3 px-5 py-3 transition-colors cursor-pointer group ${
        !n.is_read
          ? "bg-[#FAFAFF] hover:bg-[#F5F3FF]"
          : "hover:bg-[#FBFBFA]"
      }`}
      onClick={handleClick}
    >
      {/* Icône */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
        <IconComponent size={16} className={colors.text} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[13px] leading-snug ${!n.is_read ? "font-semibold text-[#191919]" : "font-medium text-[#57534E]"}`}>
            {n.title}
          </p>
          {/* Point non lu */}
          {!n.is_read && (
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] flex-shrink-0 mt-1.5" />
          )}
        </div>
        {n.message && (
          <p className="text-[12px] text-[#A8A29E] mt-0.5 line-clamp-2 leading-relaxed">
            {n.message}
          </p>
        )}
        <div className="flex items-center gap-2.5 mt-1.5">
          <span className="text-[10px] text-[#D6D3D1]">{timeAgo(n.created_at)}</span>
          {n.cta_label && (
            <span className="text-[10px] font-medium text-[#7C3AED] group-hover:text-[#6D28D9]">
              {n.cta_label} →
            </span>
          )}
        </div>
      </div>

      {/* Action rapide mark read */}
      {!n.is_read && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(n.id);
          }}
          className="p-1 rounded-md opacity-0 group-hover:opacity-100 text-[#C4C4C2] hover:text-[#7C3AED] hover:bg-[#F0EEFF] transition-all flex-shrink-0 mt-0.5"
          title="Marquer comme lu"
        >
          <Check size={13} />
        </button>
      )}
    </div>
  );

  if (n.cta_href) {
    return (
      <Link href={n.cta_href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
