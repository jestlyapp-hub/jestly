"use client";

/**
 * Sélecteur de métriques (KPI Dashboard ET colonnes Vue journalière). Panneau
 * type « Colonnes » de la vue Produits : liste ordonnée des métriques affichées
 * (réordonner ↑/↓, retirer), catalogue groupé par section pour en ajouter, et
 * réinitialiser au défaut. La sélection (ordre inclus) est persistée par le
 * parent (useEcomPref). DA Jestly.
 */
import { useState } from "react";
import { SlidersHorizontal, ChevronUp, ChevronDown, X, Plus, RotateCcw } from "lucide-react";
import { METRIC_BY_ID, METRIC_CATALOG, SECTION_LABELS, SECTION_ORDER, type MetricSection } from "@/lib/gads/metric-catalog";

interface Props {
  label?: string;
  selected: string[];
  onChange: (ids: string[]) => void;
  onReset: () => void;
  /** Restreint le catalogue proposé (ex. colonnes calculables par jour). */
  allowedIds?: string[];
}

export default function MetricSelector({ label = "Métriques", selected, onChange, onReset, allowedIds }: Props) {
  const [open, setOpen] = useState(false);
  const allow = (id: string) => !allowedIds || allowedIds.includes(id);
  const catalog = METRIC_CATALOG.filter((d) => allow(d.id));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= selected.length) return;
    const next = [...selected];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (id: string) => onChange(selected.filter((x) => x !== id));
  const add = (id: string) => onChange([...selected, id]);

  const available = catalog.filter((d) => !selected.includes(d.id));
  const bySection = (s: MetricSection) => available.filter((d) => d.section === s);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white text-[var(--ecom-navy)] border border-[var(--ecom-card-border)] hover:bg-[var(--ecom-surface-sunken)]">
        <SlidersHorizontal size={13} /> {label} ({selected.length})
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-20 bg-white border border-[var(--ecom-card-border)] rounded-lg shadow-lg p-3 w-72 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8A88]">Affichées · ordre</span>
              <button onClick={onReset} className="inline-flex items-center gap-1 text-[11px] text-[var(--ecom-brand-violet)] hover:underline">
                <RotateCcw size={11} /> Réinitialiser
              </button>
            </div>
            <div className="space-y-1 mb-3">
              {selected.map((id, i) => {
                const def = METRIC_BY_ID[id];
                if (!def) return null;
                return (
                  <div key={id} className="flex items-center gap-1.5 bg-[var(--ecom-surface-sunken)] rounded-md px-2 py-1">
                    <span className="flex-1 text-[12px] text-[var(--ecom-navy)] truncate">{def.label}</span>
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="p-0.5 text-[#8A8A88] hover:text-[var(--ecom-navy)] disabled:opacity-30" aria-label="Monter"><ChevronUp size={13} /></button>
                    <button onClick={() => move(i, 1)} disabled={i === selected.length - 1} className="p-0.5 text-[#8A8A88] hover:text-[var(--ecom-navy)] disabled:opacity-30" aria-label="Descendre"><ChevronDown size={13} /></button>
                    <button onClick={() => remove(id)} className="p-0.5 text-[#B4B4B2] hover:text-rose-600" aria-label="Retirer"><X size={13} /></button>
                  </div>
                );
              })}
              {selected.length === 0 && <p className="text-[11px] text-[#8A8A88] italic px-1">Aucune métrique — ajoute-en ci-dessous.</p>}
            </div>

            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8A88]">Ajouter</span>
            {SECTION_ORDER.map((s) => {
              const items = bySection(s);
              if (items.length === 0) return null;
              return (
                <div key={s} className="mt-1.5">
                  <div className="text-[10px] text-[#B4B4B2] mb-0.5">{SECTION_LABELS[s]}</div>
                  <div className="flex flex-wrap gap-1">
                    {items.map((d) => (
                      <button key={d.id} onClick={() => add(d.id)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-[var(--ecom-card-border)] text-[11px] text-[var(--ecom-navy)] hover:border-[var(--ecom-brand-violet)] hover:bg-[var(--ecom-violet-light)]">
                        <Plus size={10} /> {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
