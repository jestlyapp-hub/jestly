"use client";

/**
 * ClientCombobox — sélecteur de client pour formulaires (drawer création/édition).
 *
 * - Liste fournie en mémoire (pas de fetch, pas de duplication API)
 * - Tri alphabétique stable, insensible à la casse et aux accents
 * - Recherche temps réel sur nom + email + téléphone (insensible accents/casse)
 * - Navigation clavier complète : ↑ ↓ Entrée Échap, ouverture/fermeture
 * - État vide explicite, design aligné sur le reste du module
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react";

export interface ClientComboboxOption {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

interface Props {
  value: string;
  options: ClientComboboxOption[];
  onChange: (clientId: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}

/** Normalise une chaîne : lowercase + suppression des accents (NFD). */
export function normalizeForSearch(s: string | null | undefined): string {
  if (!s) return "";
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Tri alphabétique stable, insensible casse/accents. Les sans-nom finissent en bas. */
export function sortClientsByName<T extends { name: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const an = (a.name || "").trim();
    const bn = (b.name || "").trim();
    if (!an && !bn) return 0;
    if (!an) return 1;
    if (!bn) return -1;
    return an.localeCompare(bn, "fr", { sensitivity: "base", numeric: true });
  });
}

export default function ClientCombobox({
  value,
  options,
  onChange,
  placeholder = "Rechercher ou sélectionner un client…",
  loading = false,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(() => sortClientsByName(options), [options]);

  const selected = useMemo(
    () => sorted.find((c) => c.id === value) ?? null,
    [sorted, value],
  );

  const filtered = useMemo(() => {
    const q = normalizeForSearch(query);
    if (!q) return sorted;
    return sorted.filter((c) => {
      const hay = [
        normalizeForSearch(c.name),
        normalizeForSearch(c.email),
        normalizeForSearch(c.phone),
      ].join(" ");
      return hay.includes(q);
    });
  }, [sorted, query]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  // Click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus input when opening
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const select = useCallback(
    (id: string) => {
      onChange(id);
      setOpen(false);
      setQuery("");
    },
    [onChange],
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => (filtered.length === 0 ? 0 : (h + 1) % filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => (filtered.length === 0 ? 0 : (h - 1 + filtered.length) % filtered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const pick = filtered[highlight];
        if (pick) select(pick.id);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    },
    [open, filtered, highlight, select],
  );

  // Keep highlighted item visible
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${highlight}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  const triggerLabel = selected
    ? selected.email
      ? `${selected.name} — ${selected.email}`
      : selected.name
    : placeholder;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKey}
        className={`w-full text-left text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 flex items-center gap-2 transition-colors ${
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-[#4F46E5]/30 focus:outline-none focus:border-[#4F46E5]/30"
        } ${selected ? "text-[#191919]" : "text-[#8A8A88]"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="flex-1 truncate">{triggerLabel}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[#E6E6E4] rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-[#EFEFEF]">
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher par nom, email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2.5 py-1.5 text-[13px] text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30"
            />
          </div>
          <div ref={listRef} className="max-h-60 overflow-y-auto" role="listbox">
            {loading ? (
              <div className="px-3 py-4 text-[12px] text-[#8A8A88] text-center">Chargement…</div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-4 text-[12px] text-[#8A8A88] text-center">
                {query ? "Aucun client trouvé" : "Aucun client disponible"}
              </div>
            ) : (
              filtered.map((c, idx) => {
                const isSelected = c.id === value;
                const isHighlighted = idx === highlight;
                return (
                  <button
                    type="button"
                    key={c.id}
                    data-idx={idx}
                    onMouseEnter={() => setHighlight(idx)}
                    onClick={() => select(c.id)}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors cursor-pointer ${
                      isHighlighted ? "bg-[#EEF2FF]" : "hover:bg-[#FAFAF9]"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#F7F7F5] flex items-center justify-center text-[10px] font-bold text-[#5A5A58] shrink-0">
                      {(c.name || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#191919] truncate">
                        {c.name || <span className="italic text-[#8A8A88]">Sans nom</span>}
                      </div>
                      {c.email && (
                        <div className="text-[11px] text-[#8A8A88] truncate">{c.email}</div>
                      )}
                    </div>
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" className="flex-shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
