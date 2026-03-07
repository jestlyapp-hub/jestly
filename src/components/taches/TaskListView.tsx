"use client";

import { motion } from "framer-motion";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  COLUMNS_ORDER,
  getSubtaskProgress,
  getDueDateStatus,
  formatDate,
  type Task,
  type TaskStatus,
} from "@/lib/tasks-utils";

interface TaskListViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export default function TaskListView({
  tasks,
  onSelectTask,
  onStatusChange,
}: TaskListViewProps) {
  // Group by status
  const grouped = COLUMNS_ORDER.map((st) => ({
    status: st,
    config: STATUS_CONFIG[st],
    tasks: tasks.filter((t) => t.status === st),
  }));

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <motion.div
          key={group.status}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Group header */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: group.config.color }}
            />
            <span className="text-[13px] font-semibold text-[#1A1A1A]">
              {group.config.label}
            </span>
            <span className="text-[12px] text-[#BBB] ml-1">
              {group.tasks.length}
            </span>
          </div>

          {/* Table */}
          {group.tasks.length > 0 ? (
            <div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EFEFEF]">
                    <th className="w-10" />
                    <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-4 py-2.5">
                      Tache
                    </th>
                    <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-4 py-2.5 hidden sm:table-cell">
                      Priorite
                    </th>
                    <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-4 py-2.5 hidden md:table-cell">
                      Echeance
                    </th>
                    <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-4 py-2.5 hidden lg:table-cell">
                      Client
                    </th>
                    <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-4 py-2.5 hidden lg:table-cell">
                      Progression
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.tasks.map((task) => {
                    const pCfg = PRIORITY_CONFIG[task.priority];
                    const dueStat = getDueDateStatus(task.dueDate);
                    const sub =
                      task.subtasks.length > 0
                        ? getSubtaskProgress(task.subtasks)
                        : null;
                    const dueColor =
                      dueStat === "overdue"
                        ? "#EF4444"
                        : dueStat === "soon"
                          ? "#F59E0B"
                          : "#999";

                    // Next status for inline change
                    const currentIdx = COLUMNS_ORDER.indexOf(task.status);
                    const nextStatus =
                      currentIdx < COLUMNS_ORDER.length - 1
                        ? COLUMNS_ORDER[currentIdx + 1]
                        : null;

                    return (
                      <tr
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className="border-b border-[#EFEFEF] last:border-b-0 hover:bg-[#FBFBFA] transition-colors cursor-pointer"
                      >
                        {/* Checkbox / advance status */}
                        <td className="pl-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (nextStatus) {
                                onStatusChange(task.id, nextStatus);
                              }
                            }}
                            className={`w-4.5 h-4.5 rounded border flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${
                              task.status === "completed"
                                ? "bg-[#10B981] border-[#10B981]"
                                : task.status === "done"
                                  ? "bg-[#F59E0B] border-[#F59E0B]"
                                  : "border-[#D0D0CE] hover:border-[#4F46E5]"
                            }`}
                            title={nextStatus ? `Passer en ${STATUS_CONFIG[nextStatus].label}` : "Termine"}
                          >
                            {(task.status === "completed" || task.status === "done") && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        </td>

                        {/* Title */}
                        <td className="px-4 py-3 max-w-[300px]">
                          <span className="text-[13px] font-medium text-[#1A1A1A] truncate block">
                            {task.title || "Sans titre"}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span
                            className="text-[10px] font-semibold px-1.5 py-[2px] rounded"
                            style={{ color: pCfg.color, background: pCfg.bg }}
                          >
                            {pCfg.label}
                          </span>
                        </td>

                        {/* Due date */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          {task.dueDate ? (
                            <span className="text-[12px]" style={{ color: dueColor }}>
                              {formatDate(task.dueDate)}
                              {dueStat === "overdue" && (
                                <span className="text-[10px] ml-1">(retard)</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-[12px] text-[#CCC]">--</span>
                          )}
                        </td>

                        {/* Client */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {task.clientName ? (
                            <span className="text-[12px] text-[#666]">
                              {task.clientName}
                            </span>
                          ) : (
                            <span className="text-[12px] text-[#CCC]">--</span>
                          )}
                        </td>

                        {/* Subtasks progress */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {sub ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-[#EFEFEF] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#4F46E5] rounded-full"
                                  style={{ width: `${sub.percent}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-[#999]">
                                {sub.done}/{sub.total}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[12px] text-[#CCC]">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E6E6E4] py-6 text-center">
              <p className="text-[13px] text-[#CCC]">Aucune tache</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
