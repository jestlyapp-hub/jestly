"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { PRIORITY_CONFIG, formatDate, type Task } from "@/lib/tasks-utils";
import Link from "next/link";

export default function ArchivePage() {
  const { data: rawTasks, loading, mutate } = useApi<Task[]>("/api/tasks?archived=true", []);
  const [search, setSearch] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const tasks = rawTasks ?? [];

  const filtered = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.clientName || "").toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleRestore(taskId: string) {
    setRestoringId(taskId);
    try {
      await apiFetch("/api/tasks", {
        method: "PATCH",
        body: { id: taskId, archived: false, status: "todo" },
      });
      await mutate();
    } catch {
      // silently fail
    } finally {
      setRestoringId(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="h-8 w-48 bg-[#F7F7F5] rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[#F7F7F5] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/taches"
            className="p-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-[#191919]">Archives</h1>
          <span className="text-[13px] text-[#999] bg-[#F7F7F5] px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
        </div>
        <div className="relative max-w-xs w-full">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E6E6E4] rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
          />
        </div>
      </motion.div>

      {/* List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E6E6E4] py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F7F7F5] flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" rx="1" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
            </div>
            <p className="text-[14px] text-[#999]">Aucune tâche archivée</p>
            <Link
              href="/taches"
              className="inline-block mt-3 text-[13px] text-[#4F46E5] hover:underline"
            >
              Retour aux taches
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden divide-y divide-[#F3F3F3]">
            {filtered.map((task) => {
              const pCfg = PRIORITY_CONFIG[task.priority];
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#FBFBFA] transition-colors"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#191919] truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className="text-[11px] px-1.5 py-0.5 rounded font-medium"
                        style={{ color: pCfg.color, background: pCfg.bg }}
                      >
                        {pCfg.label}
                      </span>
                      {task.clientName && (
                        <span className="text-[11px] text-[#999]">
                          {task.clientName}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-[11px] text-[#999]">
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Restore button */}
                  <button
                    onClick={() => handleRestore(task.id)}
                    disabled={restoringId === task.id}
                    className="text-[12px] text-[#4F46E5] hover:text-[#4338CA] font-medium px-3 py-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {restoringId === task.id ? "..." : "Restaurer"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
