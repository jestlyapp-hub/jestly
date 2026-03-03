"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Order, BoardStatus, BoardField } from "@/types";
import { STATUS_COLORS } from "@/lib/kanban-config";
import KanbanCard from "./KanbanCard";

export default function KanbanColumn({
  column,
  orders,
  boardFields,
  onCardClick,
}: {
  column: BoardStatus;
  orders: Order[];
  boardFields: BoardField[];
  onCardClick: (order: Order) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const total = orders.reduce((s, o) => s + o.price, 0);
  const colors = STATUS_COLORS[column.color] ?? STATUS_COLORS.gray;

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[280px] w-[280px] flex-shrink-0 rounded-lg transition-colors ${
        isOver ? "bg-[#EEF2FF]/50" : "bg-[#F7F7F5]/50"
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 mb-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
          <span className="text-[12px] font-semibold text-[#191919]">
            {column.name}
          </span>
          <span className="text-[11px] text-[#8A8A88] bg-white border border-[#E6E6E4] rounded px-1.5 py-0.5 font-medium">
            {orders.length}
          </span>
        </div>
        <span className="text-[11px] font-medium text-[#8A8A88]">
          {total > 0 ? `${total.toLocaleString("fr-FR")} \u20AC` : ""}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={orders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 px-2 pb-2 min-h-[60px]">
          {orders.map((order) => (
            <KanbanCard
              key={order.id}
              order={order}
              boardFields={boardFields}
              onClick={() => onCardClick(order)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
