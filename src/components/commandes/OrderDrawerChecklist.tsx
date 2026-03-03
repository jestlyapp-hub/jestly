"use client";

import { useState } from "react";
import type { ChecklistItem } from "@/types";

export default function OrderDrawerChecklist({
  checklist,
  onChange,
}: {
  checklist: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}) {
  const [newItem, setNewItem] = useState("");

  const toggle = (id: string) => {
    onChange(checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
  };

  const remove = (id: string) => {
    onChange(checklist.filter((c) => c.id !== id));
  };

  const add = () => {
    const label = newItem.trim();
    if (!label) return;
    const item: ChecklistItem = { id: crypto.randomUUID(), label, done: false };
    onChange([...checklist, item]);
    setNewItem("");
  };

  const done = checklist.filter((c) => c.done).length;
  const total = checklist.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
          Checklist
        </span>
        {total > 0 && (
          <span className="text-[11px] text-[#8A8A88]">
            {done}/{total} ({pct}%)
          </span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1.5 bg-[#F7F7F5] rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-[#4F46E5] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* Items */}
      <div className="space-y-1 mb-2">
        {checklist.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <button
              onClick={() => toggle(item.id)}
              className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                item.done
                  ? "bg-[#4F46E5] border-[#4F46E5]"
                  : "border-[#E6E6E4] hover:border-[#4F46E5]"
              }`}
            >
              {item.done && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <span
              className={`text-[13px] flex-1 ${
                item.done ? "line-through text-[#8A8A88]" : "text-[#191919]"
              }`}
            >
              {item.label}
            </span>
            <button
              onClick={() => remove(item.id)}
              className="opacity-0 group-hover:opacity-100 text-[#8A8A88] hover:text-red-500 transition-all cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add item */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Ajouter une tache..."
          className="flex-1 text-[12px] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2 py-1.5 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30"
        />
        <button
          onClick={add}
          className="text-[11px] font-medium text-[#4F46E5] hover:text-[#4338CA] cursor-pointer"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
