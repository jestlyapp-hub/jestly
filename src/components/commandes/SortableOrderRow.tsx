"use client";

import { type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DragChildProps {
  dragHandleProps: Record<string, unknown>;
  isDragging: boolean;
}

interface SortableOrderRowProps {
  id: string;
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLTableRowElement>) => void;
  children: (props: DragChildProps) => ReactNode;
}

export default function SortableOrderRow({
  id,
  disabled,
  className,
  onClick,
  children,
}: SortableOrderRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
    position: "relative",
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={className}
      onClick={onClick}
      {...attributes}
    >
      {children({
        dragHandleProps: disabled
          ? {}
          : { ...listeners, "data-no-drawer": true },
        isDragging,
      })}
    </tr>
  );
}
