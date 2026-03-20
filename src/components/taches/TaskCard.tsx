"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  PRIORITY_CONFIG,
  getSubtaskProgress,
  getDueDateStatus,
  formatDate,
  type Task,
} from "@/lib/tasks-utils";
import RelationBadge from "@/components/ui/RelationBadge";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  overlay?: boolean;
}

export default function TaskCard({ task, onClick, overlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const pCfg = PRIORITY_CONFIG[task.priority];
  const dueStat = getDueDateStatus(task.dueDate);
  const sub = task.subtasks.length > 0 ? getSubtaskProgress(task.subtasks) : null;

  const dueColor =
    dueStat === "overdue"
      ? "#EF4444"
      : dueStat === "soon"
        ? "#F59E0B"
        : "#999";

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={overlay ? undefined : style}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      onClick={onClick}
      className={`bg-white border border-[#E6E6E4] rounded-lg p-3 cursor-pointer hover:border-[#D0D0CE] hover:shadow-sm transition-all group ${
        overlay ? "shadow-lg rotate-[2deg]" : ""
      }`}
    >
      {/* Title */}
      <p className="text-[13px] font-semibold text-[#191919] leading-snug mb-2 line-clamp-2">
        {task.title || "Sans titre"}
      </p>

      {/* Priority + Due */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span
          className="text-[10px] font-semibold px-1.5 py-[2px] rounded"
          style={{ color: pCfg.color, background: pCfg.bg }}
        >
          {pCfg.label}
        </span>
        {task.dueDate && (
          <span className="flex items-center gap-1 text-[11px]" style={{ color: dueColor }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(task.dueDate)}
            {dueStat === "overdue" && (
              <span className="text-[10px] font-medium"> (en retard)</span>
            )}
          </span>
        )}
      </div>

      {/* Subtasks progress */}
      {sub && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[#999]">
              {sub.done}/{sub.total}
            </span>
            <span className="text-[10px] text-[#BBB]">{sub.percent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#EFEFEF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4F46E5] rounded-full transition-all duration-300"
              style={{ width: `${sub.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Client + Order + Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {task.clientName && (
          <span onClick={(e) => e.stopPropagation()}>
            <RelationBadge
              type="client"
              label={task.clientName}
              href={task.clientId ? `/clients?id=${task.clientId}` : undefined}
            />
          </span>
        )}
        {task.orderTitle && (
          <span onClick={(e) => e.stopPropagation()}>
            <RelationBadge
              type="order"
              label={task.orderTitle}
              href={task.orderId ? `/commandes?id=${task.orderId}` : undefined}
            />
          </span>
        )}
        {task.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[10px] text-[#666] bg-[#F7F7F5] px-1.5 py-[1px] rounded"
          >
            {tag}
          </span>
        ))}
        {task.tags.length > 2 && (
          <span className="text-[10px] text-[#BBB]">+{task.tags.length - 2}</span>
        )}
      </div>
    </div>
  );
}
