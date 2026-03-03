"use client";

import type { BoardField, FieldOption } from "@/types";
import EditableCell from "./EditableCell";
import CustomSelectCell from "./CustomSelectCell";
import CustomDateCell from "./CustomDateCell";
import CustomBooleanCell from "./CustomBooleanCell";
import CustomUrlCell from "./CustomUrlCell";

interface CustomCellProps {
  field: BoardField;
  value: unknown;
  onCommit: (value: unknown) => void;
  onAddOption: (label: string) => Promise<FieldOption>;
}

export default function CustomCell({ field, value, onCommit, onAddOption }: CustomCellProps) {
  switch (field.fieldType) {
    case "text":
      return (
        <EditableCell
          value={String(value ?? "")}
          placeholder="—"
          onCommit={(v) => onCommit(String(v))}
        />
      );

    case "number":
      return (
        <EditableCell
          value={value != null ? Number(value) : 0}
          type="number"
          placeholder="—"
          onCommit={(v) => onCommit(Number(v))}
        />
      );

    case "money":
      return (
        <EditableCell
          value={value != null ? Number(value) : 0}
          type="number"
          suffix="€"
          placeholder="—"
          onCommit={(v) => onCommit(Number(v))}
        />
      );

    case "date":
      return (
        <CustomDateCell
          value={value as string | null | undefined}
          onCommit={onCommit}
        />
      );

    case "select":
      return (
        <CustomSelectCell
          value={value as string | null | undefined}
          options={field.options}
          onCommit={onCommit}
          onAddOption={onAddOption}
        />
      );

    case "boolean":
      return (
        <CustomBooleanCell
          value={!!value}
          onCommit={onCommit}
        />
      );

    case "url":
      return (
        <CustomUrlCell
          value={value as string | null | undefined}
          onCommit={onCommit}
        />
      );

    default:
      return (
        <span className="text-[13px] text-[#8A8A88]">
          {value != null ? String(value) : "—"}
        </span>
      );
  }
}
