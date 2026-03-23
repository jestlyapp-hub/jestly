"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useApi } from "@/lib/hooks/use-api";
import RelationBadge from "@/components/ui/RelationBadge";
import type { Task } from "@/lib/tasks-utils";

interface Deadline {
  id: string;
  title: string;
  client: string;
  date: Date;
  type: "order" | "task";
  href: string;
}

type Urgency = "overdue" | "today" | "thisWeek" | "later";

const urgencyConfig: Record<Urgency, { label: string; dot: string; text: string }> = {
  overdue: { label: "En retard", dot: "bg-red-500", text: "text-red-500" },
  today: { label: "Aujourd'hui", dot: "bg-amber-500", text: "text-amber-600" },
  thisWeek: { label: "Cette semaine", dot: "bg-[#4F46E5]", text: "text-[#4F46E5]" },
  later: { label: "", dot: "bg-[#CCC]", text: "text-[#999]" },
};

function getUrgency(date: Date): Urgency {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays <= 7) return "thisWeek";
  return "later";
}

function formatRelative(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < -1) return `il y a ${Math.abs(diffDays)} jours`;
  if (diffDays === -1) return "hier";
  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "demain";
  return `dans ${diffDays} jours`;
}

function formatDate(date: Date): string {
  const d = date.getDate();
  const months = ["jan.", "fev.", "mars", "avr.", "mai", "juin", "juil.", "aout", "sept.", "oct.", "nov.", "dec."];
  return `${d} ${months[date.getMonth()]}`;
}

export default function UpcomingDeadlines() {
  const { data: tasks } = useApi<Task[]>("/api/tasks");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: events } = useApi<any[]>("/api/calendar/events");

  const deadlines: Deadline[] = [];

  // Tasks with due dates (not completed, not archived)
  if (tasks) {
    for (const t of tasks) {
      if (t.archived) continue;
      if (!t.dueDate) continue;
      if (t.status === "done" || t.status === "completed") continue;
      deadlines.push({
        id: t.id,
        title: t.title,
        client: t.clientName || "",
        date: new Date(t.dueDate),
        type: "task",
        href: `/taches/${t.id}`,
      });
    }
  }

  // Calendar events with deadlines
  if (events) {
    for (const e of events) {
      if (e.source === "order" && e.date) {
        deadlines.push({
          id: e.id,
          title: e.title,
          client: e.clientName || "",
          date: new Date(e.date),
          type: "order",
          href: "/commandes",
        });
      }
    }
  }

  // Sort by date
  deadlines.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Take first 8
  const visible = deadlines.slice(0, 8);

  return (
    <div className="bg-white rounded-xl border border-[#E6E6E4]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E6E6E4] flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#191919]">Échéances à venir</h2>
        <a href="/calendrier" className="text-[12px] font-medium text-[#4F46E5] hover:underline">
          Voir le calendrier
        </a>
      </div>

      {/* List */}
      <div className="p-5 space-y-1">
        {visible.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[13px] text-[#999]">Aucune echeance a venir</p>
          </div>
        ) : (
          visible.map((dl, i) => {
            const urgency = getUrgency(dl.date);
            const cfg = urgencyConfig[urgency];

            return (
              <motion.div
                key={dl.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#FBFBFA] transition-colors"
              >
                {/* Urgency dot */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={dl.href}
                    className="text-[13px] font-medium text-[#191919] truncate block hover:text-[#4F46E5] transition-colors"
                  >
                    {dl.title}
                  </Link>
                  {dl.client && (
                    <div className="mt-0.5">
                      <RelationBadge type="client" label={dl.client} href="/clients" />
                    </div>
                  )}
                </div>

                {/* Date info */}
                <div className="text-right shrink-0">
                  <p className={`text-[12px] font-medium ${cfg.text}`}>{formatRelative(dl.date)}</p>
                  <p className="text-[10px] text-[#BBB]">{formatDate(dl.date)}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
