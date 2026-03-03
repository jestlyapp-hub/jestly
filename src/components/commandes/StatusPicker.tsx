"use client";

import { useState, useRef, useEffect } from "react";
import type { BoardStatus } from "@/types";
import { STATUS_COLORS } from "@/lib/kanban-config";

function dotClass(color: string): string {
  return STATUS_COLORS[color]?.dot ?? "bg-gray-400";
}

function bgClass(color: string): string {
  return STATUS_COLORS[color]?.bg ?? "bg-gray-100";
}

function textClass(color: string): string {
  return STATUS_COLORS[color]?.text ?? "text-gray-600";
}

export default function StatusPicker({
  value,
  statuses,
  onChange,
}: {
  value: string | undefined;
  statuses: BoardStatus[];
  onChange: (statusId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const current = statuses.find((s) => s.id === value);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const productionStatuses = statuses.filter((s) => s.view === "production");
  const cashStatuses = statuses.filter((s) => s.view === "cash");

  const filterFn = (s: BoardStatus) => {
    if (!search) return true;
    return s.name.toLowerCase().includes(search.toLowerCase());
  };

  const filteredProduction = productionStatuses.filter(filterFn);
  const filteredCash = cashStatuses.filter(filterFn);

  return (
    <div ref={ref} className="relative">
      {/* Trigger — badge style */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium cursor-pointer transition-colors ${
          current
            ? `${bgClass(current.color)} ${textClass(current.color)}`
            : "bg-[#F7F7F5] text-[#8A8A88]"
        }`}
      >
        {current && (
          <span className={`w-2 h-2 rounded-full ${dotClass(current.color)}`} />
        )}
        <span>{current?.name ?? "Choisir"}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#E6E6E4] rounded-lg shadow-lg z-[9999] overflow-hidden">
          {/* Search */}
          <div className="px-2 pt-2 pb-1">
            <input
              autoFocus
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-[12px] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2 py-1.5 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {/* Production group */}
            {filteredProduction.length > 0 && (
              <>
                <div className="px-3 py-1 text-[10px] font-semibold text-[#8A8A88] uppercase tracking-wider">
                  Production
                </div>
                {filteredProduction.map((s) => (
                  <StatusOption
                    key={s.id}
                    status={s}
                    isSelected={s.id === value}
                    onSelect={() => {
                      onChange(s.id);
                      setOpen(false);
                      setSearch("");
                    }}
                  />
                ))}
              </>
            )}

            {/* Cash group */}
            {filteredCash.length > 0 && (
              <>
                {filteredProduction.length > 0 && (
                  <div className="h-px bg-[#E6E6E4] mx-2 my-1" />
                )}
                <div className="px-3 py-1 text-[10px] font-semibold text-[#8A8A88] uppercase tracking-wider">
                  Cash
                </div>
                {filteredCash.map((s) => (
                  <StatusOption
                    key={s.id}
                    status={s}
                    isSelected={s.id === value}
                    onSelect={() => {
                      onChange(s.id);
                      setOpen(false);
                      setSearch("");
                    }}
                  />
                ))}
              </>
            )}

            {filteredProduction.length === 0 && filteredCash.length === 0 && (
              <div className="px-3 py-2 text-[12px] text-[#8A8A88]">
                Aucun statut trouve.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusOption({
  status,
  isSelected,
  onSelect,
}: {
  status: BoardStatus;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] cursor-pointer transition-colors ${
        isSelected
          ? "bg-[#EEF2FF] text-[#4F46E5]"
          : "text-[#191919] hover:bg-[#F7F7F5]"
      }`}
    >
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotClass(status.color)}`} />
      <span className="flex-1">{status.name}</span>
      {isSelected && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-70"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}
