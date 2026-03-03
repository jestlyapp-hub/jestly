"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";
import type { Order, BoardStatus, BoardField } from "@/types";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";

export default function KanbanBoard({
  orders,
  columns,
  boardFields,
  onCardClick,
  onStatusChange,
}: {
  orders: Order[];
  columns: BoardStatus[];
  boardFields: BoardField[];
  onCardClick: (order: Order) => void;
  onStatusChange: (orderId: string, newStatusId: string) => void;
}) {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const order = orders.find((o) => o.id === event.active.id);
    if (order) setActiveOrder(order);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveOrder(null);
    const { active, over } = event;
    if (!over) return;

    const orderId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column
    const isColumn = columns.some((c) => c.id === overId);
    let newStatusId: string;

    if (isColumn) {
      newStatusId = overId;
    } else {
      // Dropped over another card — find that card's statusId
      const targetOrder = orders.find((o) => o.id === overId);
      if (!targetOrder?.statusId) return;
      newStatusId = targetOrder.statusId;
    }

    const currentOrder = orders.find((o) => o.id === orderId);
    if (currentOrder && currentOrder.statusId !== newStatusId) {
      onStatusChange(orderId, newStatusId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
        {columns.map((col) => {
          const colOrders = orders.filter((o) => o.statusId === col.id);
          return (
            <KanbanColumn
              key={col.id}
              column={col}
              orders={colOrders}
              boardFields={boardFields}
              onCardClick={onCardClick}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeOrder ? (
          <div className="rotate-2 shadow-lg">
            <KanbanCard
              order={activeOrder}
              boardFields={boardFields}
              onClick={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
