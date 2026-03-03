"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BoardStatus, BoardField, StatusView } from "@/types";
import { STATUS_COLORS, AVAILABLE_COLORS, FIELD_TYPES } from "@/lib/kanban-config";
import { apiFetch } from "@/lib/hooks/use-api";

type Tab = "columns" | "fields";

export default function CustomizeDrawer({
  open,
  onClose,
  boardId,
  currentView,
  productionStatuses,
  cashStatuses,
  fields,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  boardId?: string;
  currentView: StatusView;
  productionStatuses: BoardStatus[];
  cashStatuses: BoardStatus[];
  fields: BoardField[];
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<Tab>("columns");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-[#E6E6E4] z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E6E4]">
              <h2 className="text-[16px] font-semibold text-[#191919]">
                Personnaliser
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-[#F7F7F5] transition-colors cursor-pointer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8A8A88"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Main tabs */}
            <div className="flex gap-1 px-6 pt-4 pb-2">
              {(
                [
                  ["columns", "Colonnes"],
                  ["fields", "Proprietes"],
                ] as [Tab, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium cursor-pointer ${
                    tab === key
                      ? "bg-[#EEF2FF] text-[#4F46E5]"
                      : "text-[#8A8A88] hover:text-[#5A5A58]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="px-6 py-4">
              {tab === "columns" ? (
                <ColumnsTab
                  currentView={currentView}
                  productionStatuses={productionStatuses}
                  cashStatuses={cashStatuses}
                  boardId={boardId}
                  onRefresh={onRefresh}
                />
              ) : (
                <FieldsTab fields={fields} onRefresh={onRefresh} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Columns Tab ─── */

function ColumnsTab({
  currentView,
  productionStatuses,
  cashStatuses,
  boardId,
  onRefresh,
}: {
  currentView: StatusView;
  productionStatuses: BoardStatus[];
  cashStatuses: BoardStatus[];
  boardId?: string;
  onRefresh: () => void;
}) {
  const [viewTab, setViewTab] = useState<StatusView>(currentView);
  const statuses = viewTab === "cash" ? cashStatuses : productionStatuses;
  const [items, setItems] = useState(statuses);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Sync items when statuses or viewTab change
  const expected = viewTab === "cash" ? cashStatuses : productionStatuses;
  if (
    expected.length !== items.length ||
    expected.some((s, i) => s.id !== items[i]?.id)
  ) {
    setItems(expected);
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    await apiFetch("/api/orders/board/statuses/reorder", {
      method: "PUT",
      body: { ids: reordered.map((s) => s.id) },
    });
    onRefresh();
  };

  const addColumn = async () => {
    await apiFetch("/api/orders/board/statuses", {
      method: "POST",
      body: {
        name: "Nouvelle colonne",
        color: "gray",
        view: viewTab,
        board_id: boardId,
      },
    });
    onRefresh();
  };

  const updateStatus = async (
    id: string,
    updates: Partial<BoardStatus>
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, any> = {};
    if ("name" in updates) body.name = updates.name;
    if ("color" in updates) body.color = updates.color;
    await apiFetch(`/api/orders/board/statuses/${id}`, {
      method: "PATCH",
      body,
    });
    onRefresh();
  };

  const archiveStatus = async (id: string) => {
    await apiFetch(`/api/orders/board/statuses/${id}`, {
      method: "DELETE",
    });
    setItems((prev) => prev.filter((s) => s.id !== id));
    onRefresh();
  };

  return (
    <div>
      {/* View sub-tabs */}
      <div className="flex gap-1 mb-4">
        {(
          [
            ["production", "Production"],
            ["cash", "Cash"],
          ] as [StatusView, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setViewTab(key)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
              viewTab === key
                ? "bg-[#191919] text-white"
                : "bg-[#F7F7F5] text-[#5A5A58] hover:text-[#191919]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5">
            {items.map((status) => (
              <SortableStatusRow
                key={status.id}
                status={status}
                onUpdate={(updates) => updateStatus(status.id, updates)}
                onArchive={() => archiveStatus(status.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <p className="text-[13px] text-[#8A8A88] py-4">
          Aucune colonne pour cette vue. Ajoutez-en une.
        </p>
      )}

      <button
        onClick={addColumn}
        className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#4F46E5] hover:text-[#4338CA] cursor-pointer"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Ajouter une colonne
      </button>
    </div>
  );
}

function SortableStatusRow({
  status,
  onUpdate,
  onArchive,
}: {
  status: BoardStatus;
  onUpdate: (updates: Partial<BoardStatus>) => void;
  onArchive: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: status.id });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(status.name);
  const [showColors, setShowColors] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const colors = STATUS_COLORS[status.color] ?? STATUS_COLORS.gray;

  const saveName = () => {
    setEditing(false);
    if (name !== status.name && name.trim())
      onUpdate({ name: name.trim() });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {/* Drag handle */}
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab text-[#8A8A88] hover:text-[#5A5A58]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </span>

      {/* Color dot */}
      <div className="relative">
        <button
          onClick={() => setShowColors(!showColors)}
          className={`w-3 h-3 rounded-full ${colors.dot} cursor-pointer`}
        />
        {showColors && (
          <div className="absolute top-6 left-0 bg-white border border-[#E6E6E4] rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1.5 z-10">
            {AVAILABLE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  onUpdate({ color: c });
                  setShowColors(false);
                }}
                className={`w-5 h-5 rounded-full ${
                  STATUS_COLORS[c].dot
                } cursor-pointer ${
                  c === status.color
                    ? "ring-2 ring-[#4F46E5] ring-offset-1"
                    : ""
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Name */}
      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => e.key === "Enter" && saveName()}
          className="flex-1 text-[13px] bg-transparent border-b border-[#4F46E5] outline-none text-[#191919] py-0.5"
        />
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          className="flex-1 text-[13px] text-[#191919] cursor-text"
        >
          {status.name}
        </span>
      )}

      {/* Archive */}
      <button
        onClick={onArchive}
        className="text-[#8A8A88] hover:text-red-500 cursor-pointer"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Fields Tab ─── */

function FieldsTab({
  fields,
  onRefresh,
}: {
  fields: BoardField[];
  onRefresh: () => void;
}) {
  const addField = async () => {
    await apiFetch("/api/orders/board/fields", {
      method: "POST",
      body: { label: "Nouvelle propriete", field_type: "text" },
    });
    onRefresh();
  };

  const updateField = async (
    id: string,
    updates: Record<string, unknown>
  ) => {
    await apiFetch(`/api/orders/board/fields/${id}`, {
      method: "PATCH",
      body: updates,
    });
    onRefresh();
  };

  const deleteField = async (id: string) => {
    await apiFetch(`/api/orders/board/fields/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div>
      <div className="space-y-2">
        {fields.map((field) => (
          <FieldRow
            key={field.id}
            field={field}
            onUpdate={(u) => updateField(field.id, u)}
            onDelete={() => deleteField(field.id)}
          />
        ))}
      </div>

      {fields.length === 0 && (
        <p className="text-[13px] text-[#8A8A88] py-4">
          Aucune propriete personnalisee. Ajoutez-en pour enrichir vos
          commandes.
        </p>
      )}

      <button
        onClick={addField}
        className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#4F46E5] hover:text-[#4338CA] cursor-pointer"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Ajouter une propriete
      </button>
    </div>
  );
}

function FieldRow({
  field,
  onUpdate,
  onDelete,
}: {
  field: BoardField;
  onUpdate: (u: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(field.label);
  const [optionsText, setOptionsText] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const saveLabel = () => {
    setEditing(false);
    if (label !== field.label && label.trim())
      onUpdate({ label: label.trim() });
  };

  const addOption = () => {
    if (!optionsText.trim()) return;
    const newOpts = [...field.options, optionsText.trim()];
    onUpdate({ options: newOpts });
    setOptionsText("");
  };

  const removeOption = (opt: string) => {
    onUpdate({ options: field.options.filter((o) => o !== opt) });
  };

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-lg px-3 py-2.5 space-y-2">
      <div className="flex items-center gap-2">
        {/* Label */}
        {editing ? (
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={saveLabel}
            onKeyDown={(e) => e.key === "Enter" && saveLabel()}
            className="flex-1 text-[13px] bg-transparent border-b border-[#4F46E5] outline-none text-[#191919]"
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            className="flex-1 text-[13px] font-medium text-[#191919] cursor-text"
          >
            {field.label}
          </span>
        )}

        {/* Type selector */}
        <select
          value={field.fieldType}
          onChange={(e) => onUpdate({ field_type: e.target.value })}
          className="text-[11px] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-1.5 py-0.5 text-[#5A5A58] cursor-pointer"
        >
          {FIELD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Visible on card */}
        <button
          onClick={() =>
            onUpdate({ is_visible_on_card: !field.isVisibleOnCard })
          }
          title={
            field.isVisibleOnCard
              ? "Visible sur les cartes"
              : "Masque sur les cartes"
          }
          className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${
            field.isVisibleOnCard
              ? "bg-[#EEF2FF] text-[#4F46E5]"
              : "bg-[#F7F7F5] text-[#8A8A88]"
          }`}
        >
          Carte
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="text-[#8A8A88] hover:text-red-500 cursor-pointer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Options for select/multi_select */}
      {(field.fieldType === "select" ||
        field.fieldType === "multi_select") && (
        <div>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-[11px] text-[#4F46E5] cursor-pointer"
          >
            {showOptions
              ? "Masquer options"
              : `Options (${field.options.length})`}
          </button>

          {showOptions && (
            <div className="mt-1.5 space-y-1">
              {field.options.map((opt) => (
                <div key={opt} className="flex items-center gap-1.5">
                  <span className="text-[12px] text-[#5A5A58] flex-1">
                    {opt}
                  </span>
                  <button
                    onClick={() => removeOption(opt)}
                    className="text-[#8A8A88] hover:text-red-500 cursor-pointer"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
              <div className="flex gap-1.5">
                <input
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addOption()}
                  placeholder="Nouvelle option..."
                  className="flex-1 text-[11px] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2 py-1 text-[#191919] placeholder-[#8A8A88] focus:outline-none"
                />
                <button
                  onClick={addOption}
                  className="text-[11px] text-[#4F46E5] font-medium cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
