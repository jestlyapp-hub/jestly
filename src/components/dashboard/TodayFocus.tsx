"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useApi } from "@/lib/hooks/use-api";
import type { Task } from "@/lib/tasks-utils";

interface TodayItem {
  id: string;
  type: "task" | "event" | "deadline";
  title: string;
  time: string;
  status: "done" | "pending" | "urgent";
  href: string;
}

const borderColors: Record<TodayItem["type"], string> = {
  task: "#4F46E5",
  event: "#0EA5E9",
  deadline: "#F59E0B",
};

const statusConfig: Record<TodayItem["status"], { label: string; bg: string; text: string }> = {
  done: { label: "Fait", bg: "bg-emerald-50", text: "text-emerald-600" },
  pending: { label: "A faire", bg: "bg-[#F7F7F5]", text: "text-[#666]" },
  urgent: { label: "Urgent", bg: "bg-red-50", text: "text-red-500" },
};

const typeLabels: Record<TodayItem["type"], string> = {
  task: "Tâche",
  event: "Événement",
  deadline: "Échéance",
};

function formatTodayDate(): string {
  const now = new Date();
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export default function TodayFocus() {
  const { data: tasks } = useApi<Task[]>("/api/tasks");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: events } = useApi<any[]>("/api/calendar/events");

  const today = new Date().toISOString().slice(0, 10);

  const items: TodayItem[] = [];

  // Tasks due today or overdue
  if (tasks) {
    for (const t of tasks) {
      if (t.archived) continue;
      if (!t.dueDate) continue;
      const taskDate = t.dueDate.slice(0, 10);
      const isOverdue = taskDate < today;
      const isToday = taskDate === today;
      if (!isToday && !isOverdue) continue;
      const isDone = t.status === "done" || t.status === "completed";
      items.push({
        id: t.id,
        type: isOverdue && !isDone ? "deadline" : "task",
        title: t.title,
        time: isOverdue ? "En retard" : "",
        status: isDone ? "done" : (t.priority === "urgent" || t.priority === "high") ? "urgent" : "pending",
        href: `/taches/${t.id}`,
      });
    }
  }

  // Calendar events today
  if (events) {
    for (const e of events) {
      const eventDate = (e.date || "").slice(0, 10);
      if (eventDate !== today) continue;
      items.push({
        id: e.id,
        type: "event",
        title: e.title,
        time: e.startTime || (e.allDay ? "Journee" : ""),
        status: "pending",
        href: "/calendrier",
      });
    }
  }

  // Sort: urgent first, then by time
  items.sort((a, b) => {
    if (a.status === "urgent" && b.status !== "urgent") return -1;
    if (b.status === "urgent" && a.status !== "urgent") return 1;
    if (a.status === "done" && b.status !== "done") return 1;
    if (b.status === "done" && a.status !== "done") return -1;
    return (a.time || "").localeCompare(b.time || "");
  });

  return (
    <div className="bg-white rounded-xl border border-[#E6E6E4]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E6E6E4] flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-[#191919]">Aujourd&apos;hui</h2>
          <p className="text-[12px] text-[#999] mt-0.5">{formatTodayDate()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/taches" className="text-[12px] font-medium text-[#4F46E5] hover:underline">
            Taches
          </Link>
          <Link href="/calendrier" className="text-[12px] font-medium text-[#4F46E5] hover:underline">
            Calendrier
          </Link>
        </div>
      </div>

      {/* Items */}
      <div className="p-5 space-y-2">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F7F7F5] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#CCC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[13px] text-[#999]">Rien de prevu aujourd&apos;hui</p>
          </div>
        ) : (
          items.slice(0, 8).map((item, i) => (
            <Link key={item.id} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#FBFBFA] transition-colors cursor-pointer group"
                style={{ borderLeft: `3px solid ${borderColors[item.type]}` }}
              >
                {/* Time */}
                <span className="text-[12px] font-medium text-[#999] w-14 shrink-0">{item.time}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium truncate ${item.status === "done" ? "text-[#BBB] line-through" : "text-[#191919]"}`}>
                    {item.title}
                  </p>
                  <span className="text-[11px] text-[#999]">{typeLabels[item.type]}</span>
                </div>

                {/* Status chip */}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConfig[item.status].bg} ${statusConfig[item.status].text}`}>
                  {statusConfig[item.status].label}
                </span>
              </motion.div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
