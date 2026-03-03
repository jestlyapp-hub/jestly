"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Order, BoardField } from "@/types";
import { PRIORITY_COLORS } from "@/lib/kanban-config";

export default function KanbanCard({
  order,
  boardFields,
  onClick,
}: {
  order: Order;
  boardFields: BoardField[];
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id, data: { order } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityBorder = PRIORITY_COLORS[order.priority] ?? "border-l-transparent";
  const checkDone = order.checklist.filter((c) => c.done).length;
  const checkTotal = order.checklist.length;

  // Custom fields visible on card
  const visibleFields = boardFields.filter((f) => f.isVisibleOnCard);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`bg-white rounded-lg border border-[#E6E6E4] border-l-[3px] ${priorityBorder} px-3 py-2.5 cursor-pointer transition-all select-none ${
        isDragging
          ? "opacity-50 shadow-lg rotate-2"
          : "hover:shadow-sm hover:-translate-y-0.5"
      }`}
    >
      {/* Title */}
      <div className="text-[13px] font-medium text-[#191919] mb-1.5 line-clamp-2">
        {order.product}
      </div>

      {/* Client */}
      <div className="text-[11px] text-[#8A8A88] mb-2">{order.client}</div>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-[#191919]">
          {order.price} &euro;
        </span>

        <div className="flex items-center gap-2">
          {checkTotal > 0 && (
            <span className={`text-[10px] font-medium ${checkDone === checkTotal ? "text-emerald-500" : "text-[#8A8A88]"}`}>
              {checkDone}/{checkTotal}
            </span>
          )}

          {order.paid && (
            <span className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          )}

          {(order.priority === "urgent" || order.priority === "high") && (
            <span className={`text-[10px] font-bold ${order.priority === "urgent" ? "text-red-500" : "text-orange-400"}`}>
              {order.priority === "urgent" ? "!!!" : "!!"}
            </span>
          )}

          {order.deadline && (
            <span className="text-[10px] text-[#8A8A88]">
              {new Date(order.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>

      {/* Custom fields on card */}
      {visibleFields.length > 0 && order.customFields && (
        <div className="flex flex-wrap gap-1 mt-2">
          {visibleFields.map((f) => {
            const val = order.customFields?.[f.key];
            if (val == null || val === "") return null;
            return (
              <span key={f.key} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7F7F5] text-[#5A5A58]">
                {f.label}: {String(val)}
              </span>
            );
          })}
        </div>
      )}

      {/* Tags */}
      {order.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {order.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7F7F5] text-[#5A5A58]">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
