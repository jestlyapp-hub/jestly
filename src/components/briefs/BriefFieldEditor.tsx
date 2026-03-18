"use client";

import { useState, useCallback, useMemo } from "react";
import type { BriefField, BriefFieldType, BoardField } from "@/types";
import { ORDER_DETAIL_FIELDS } from "@/types";
import { isCompatible } from "@/lib/brief-column-compat";

/* ─── Field type config with colors ─── */

const FIELD_TYPE_CONFIG: Record<BriefFieldType, { label: string; color: string; bg: string; icon: string }> = {
  text:     { label: "Texte court",      color: "text-blue-600",    bg: "bg-blue-50",    icon: "T" },
  textarea: { label: "Texte long",       color: "text-indigo-600",  bg: "bg-indigo-50",  icon: "\u00B6" },
  select:   { label: "Liste déroulante", color: "text-violet-600",  bg: "bg-violet-50",  icon: "\u25BE" },
  radio:    { label: "Choix unique",     color: "text-purple-600",  bg: "bg-purple-50",  icon: "\u25C9" },
  checkbox: { label: "Choix multiples",  color: "text-fuchsia-600", bg: "bg-fuchsia-50", icon: "\u2611" },
  date:     { label: "Date",             color: "text-amber-600",   bg: "bg-amber-50",   icon: "\uD83D\uDCC5" },
  number:   { label: "Nombre",           color: "text-emerald-600", bg: "bg-emerald-50", icon: "#" },
  url:      { label: "URL",              color: "text-cyan-600",    bg: "bg-cyan-50",    icon: "\uD83D\uDD17" },
  email:    { label: "Email",            color: "text-sky-600",     bg: "bg-sky-50",     icon: "@" },
  phone:    { label: "Téléphone",        color: "text-teal-600",    bg: "bg-teal-50",    icon: "\uD83D\uDCDE" },
  file:     { label: "Fichier",          color: "text-orange-600",  bg: "bg-orange-50",  icon: "\uD83D\uDCCE" },
};

const inputClass =
  "w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] placeholder:text-[#C4C4C2] focus:outline-none focus:border-[#4F46E5]/40 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all";

const selectClass =
  "w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/40 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all appearance-none cursor-pointer";

const labelClass = "block text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1.5";

const HAS_OPTIONS = new Set<BriefFieldType>(["select", "radio", "checkbox"]);

interface BriefFieldEditorProps {
  field: BriefField;
  onChange: (field: BriefField) => void;
  onDelete: () => void;
  orderFields?: BoardField[];
  expanded?: boolean;
  onToggle?: () => void;
}

/* ─── Destination helpers ─── */

type DestValue = string; // composite "type:key_or_id" or ""

function encodeDestination(type: string, key: string): DestValue {
  return `${type}:${key}`;
}

function decodeDestination(val: DestValue): { type: string; key: string } | null {
  if (!val) return null;
  const idx = val.indexOf(":");
  if (idx < 0) return null;
  return { type: val.slice(0, idx), key: val.slice(idx + 1) };
}

/**
 * Resolve current field destination to a composite select value.
 * Supports both new (destinationType+destinationKey) and legacy (target_kind+target_ref).
 */
function resolveCurrentValue(
  field: BriefField,
  systemColumns: BoardField[],
  customColumns: BoardField[]
): DestValue {
  // New-style destination
  if (field.destinationType && field.destinationType !== "brief_only") {
    const key = field.destinationKey || "";
    if (field.destinationType === "column_custom" && field.destinationColumnId) {
      return encodeDestination("column_custom", field.destinationColumnId);
    }
    return encodeDestination(field.destinationType, key);
  }

  // Legacy resolution: target_kind + target_ref
  if (field.target_kind === "order_custom_property" && field.target_ref) {
    const col = customColumns.find((c) => c.key === field.target_ref);
    if (col) return encodeDestination("column_custom", col.id);
  }
  if (field.target_kind === "order_field" && field.target_ref) {
    // Check if it's a system board column
    const sysCol = systemColumns.find((c) => c.key === field.target_ref);
    if (sysCol) return encodeDestination("column_default", sysCol.key);
    // Check if it's a detail field
    const detail = ORDER_DETAIL_FIELDS.find((d) => d.key === field.target_ref);
    if (detail) return encodeDestination("detail_field", detail.key);
  }

  return "";
}

function resolveDestinationLabel(
  field: BriefField,
  systemColumns: BoardField[],
  customColumns: BoardField[]
): string | null {
  const val = resolveCurrentValue(field, systemColumns, customColumns);
  if (!val) return null;
  const parsed = decodeDestination(val);
  if (!parsed) return null;

  if (parsed.type === "column_default") {
    return systemColumns.find((c) => c.key === parsed.key)?.label || parsed.key;
  }
  if (parsed.type === "detail_field") {
    return ORDER_DETAIL_FIELDS.find((d) => d.key === parsed.key)?.label || parsed.key;
  }
  if (parsed.type === "column_custom") {
    return customColumns.find((c) => c.id === parsed.key)?.label || field.destinationColumnLabel || null;
  }
  return null;
}

function suggestDestination(
  label: string,
  systemColumns: BoardField[],
  customColumns: BoardField[]
): { type: BriefField["destinationType"]; key: string; col?: BoardField; detailKey?: string } | null {
  if (!label.trim()) return null;
  const norm = label.trim().toLowerCase();

  // Check system columns
  const sys = systemColumns.find((c) => c.label.toLowerCase() === norm);
  if (sys) return { type: "column_default", key: sys.key, col: sys };

  // Check detail fields
  const detail = ORDER_DETAIL_FIELDS.find((d) => d.label.toLowerCase() === norm);
  if (detail) return { type: "detail_field", key: detail.key, detailKey: detail.key };

  // Check custom columns
  const custom = customColumns.find((c) => c.label.toLowerCase() === norm);
  if (custom) return { type: "column_custom", key: custom.id, col: custom };

  return null;
}

export default function BriefFieldEditor({ field, onChange, onDelete, orderFields = [], expanded: expandedProp, onToggle }: BriefFieldEditorProps) {
  const [expandedLocal, setExpandedLocal] = useState(false);
  const expanded = expandedProp !== undefined ? expandedProp : expandedLocal;
  const toggleExpanded = onToggle || (() => setExpandedLocal((v) => !v));
  const [copied, setCopied] = useState(false);
  const hasOptions = HAS_OPTIONS.has(field.type);
  const typeConfig = FIELD_TYPE_CONFIG[field.type] || FIELD_TYPE_CONFIG.text;

  const systemColumns = useMemo(() => orderFields.filter((c) => c.isSystem), [orderFields]);
  const customColumns = useMemo(() => orderFields.filter((c) => !c.isSystem), [orderFields]);

  const currentValue = resolveCurrentValue(field, systemColumns, customColumns);
  const destinationLabel = resolveDestinationLabel(field, systemColumns, customColumns);

  // Check if current destination is type-incompatible
  const incompatibleWarning = useMemo(() => {
    const parsed = decodeDestination(currentValue);
    if (!parsed) return null;
    if (parsed.type === "column_custom") {
      const col = customColumns.find((c) => c.id === parsed.key);
      if (col && !isCompatible(field.type, col.fieldType)) {
        return `Type "${field.type}" incompatible avec colonne "${col.fieldType}"`;
      }
    }
    return null;
  }, [currentValue, field.type, customColumns]);

  // Orphan: has a destination set but can't resolve it
  const isOrphan = !destinationLabel
    && (!!field.destinationType && field.destinationType !== "brief_only")
    || (!field.destinationType && !!field.target_kind && field.target_kind !== "custom_answer" && !!field.target_ref && !destinationLabel);

  const applyDestination = useCallback(
    (val: DestValue) => {
      const parsed = decodeDestination(val);

      if (!parsed) {
        // Brief only
        onChange({
          ...field,
          destinationType: "brief_only",
          destinationKey: undefined,
          destinationColumnId: undefined,
          destinationColumnLabel: undefined,
          target_kind: "custom_answer",
          target_ref: undefined,
        });
        return;
      }

      const { type, key } = parsed;

      if (type === "column_default") {
        const col = systemColumns.find((c) => c.key === key);
        onChange({
          ...field,
          destinationType: "column_default",
          destinationKey: key,
          destinationColumnId: col?.id,
          destinationColumnLabel: col?.label || key,
          target_kind: "order_field",
          target_ref: key,
        });
      } else if (type === "detail_field") {
        const detail = ORDER_DETAIL_FIELDS.find((d) => d.key === key);
        onChange({
          ...field,
          destinationType: "detail_field",
          destinationKey: key,
          destinationColumnId: undefined,
          destinationColumnLabel: detail?.label || key,
          target_kind: "order_field",
          target_ref: key,
        });
      } else if (type === "column_custom") {
        const col = customColumns.find((c) => c.id === key);
        onChange({
          ...field,
          destinationType: "column_custom",
          destinationKey: col?.key || key,
          destinationColumnId: key,
          destinationColumnLabel: col?.label || key,
          target_kind: "order_custom_property",
          target_ref: col?.key || key,
        });
      }
    },
    [field, onChange, systemColumns, customColumns]
  );

  const handleLabelChange = useCallback(
    (newLabel: string) => {
      const updates: Partial<BriefField> = { label: newLabel };

      // Smart pre-suggestion: only when no destination is set yet
      const hasDest = field.destinationType && field.destinationType !== "brief_only";
      const hasLegacy = field.target_kind && field.target_kind !== "custom_answer";
      if (!hasDest && !hasLegacy) {
        const match = suggestDestination(newLabel, systemColumns, customColumns);
        if (match) {
          updates.destinationType = match.type;
          updates.destinationKey = match.detailKey || match.col?.key || match.key;
          updates.destinationColumnId = match.type === "column_custom" ? match.key : match.col?.id;
          updates.destinationColumnLabel = match.col?.label
            || ORDER_DETAIL_FIELDS.find((d) => d.key === match.detailKey)?.label;
          if (match.type === "column_custom") {
            updates.target_kind = "order_custom_property";
            updates.target_ref = match.col?.key || match.key;
          } else {
            updates.target_kind = "order_field";
            updates.target_ref = match.detailKey || match.col?.key;
          }
        }
      }

      onChange({ ...field, ...updates });
    },
    [field, onChange, systemColumns, customColumns]
  );

  const addOption = () => {
    onChange({ ...field, options: [...(field.options || []), ""] });
  };
  const updateOption = (idx: number, val: string) => {
    const opts = [...(field.options || [])];
    opts[idx] = val;
    onChange({ ...field, options: opts });
  };
  const removeOption = (idx: number) => {
    onChange({ ...field, options: (field.options || []).filter((_, i) => i !== idx) });
  };

  const copySlug = () => {
    navigator.clipboard.writeText(field.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Badge label for header
  const badgeLabel = destinationLabel
    || field.destinationColumnLabel
    || (isOrphan ? "Destination introuvable" : null);

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow">
      {/* ── Header ── */}
      <div
        className="flex items-center gap-2.5 px-5 py-3.5 cursor-pointer select-none"
        onClick={toggleExpanded}
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-200 ${expanded ? "rotate-0" : "-rotate-90"}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>

        <span className="flex-1 text-[14px] font-semibold text-[#191919] truncate">
          {field.label || "Sans titre"}
        </span>

        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${typeConfig.bg} ${typeConfig.color}`}>
          <span className="text-[10px]">{typeConfig.icon}</span>
          {typeConfig.label}
        </span>

        {badgeLabel && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
            isOrphan ? "bg-red-50 text-red-500"
            : incompatibleWarning ? "bg-amber-50 text-amber-600"
            : "bg-[#EEF2FF] text-[#4F46E5]"
          }`}>
            {isOrphan ? "\u26A0 " : incompatibleWarning ? "\u26A0 " : "\u2192 "}{badgeLabel}
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="shrink-0 p-1 rounded-md text-[#C4C4C2] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          title="Supprimer ce champ"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
          </svg>
        </button>
      </div>

      {/* ── Body ── */}
      {expanded && (
        <div className="px-5 pb-5 space-y-5">
          <div className="h-px bg-[#F0F0EE]" />

          {/* ── Section A: Identité ── */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wider">Identité du champ</h4>

            <div className="grid grid-cols-[1fr_180px] gap-3">
              <div>
                <label className={labelClass}>Label</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  className={inputClass}
                  placeholder="Intitulé du champ"
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={field.type}
                  onChange={(e) => onChange({ ...field, type: e.target.value as BriefFieldType })}
                  className={selectClass}
                >
                  {Object.entries(FIELD_TYPE_CONFIG).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.icon} {cfg.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Slug (read-only) */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Clé (slug)
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={field.key}
                  readOnly
                  className="flex-1 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#8A8A88] font-mono cursor-default select-all"
                />
                <button
                  onClick={copySlug}
                  className="shrink-0 p-2 rounded-lg border border-[#E6E6E4] text-[#8A8A88] hover:text-[#4F46E5] hover:border-[#4F46E5]/30 hover:bg-[#EEF2FF] transition-all cursor-pointer"
                  title="Copier le slug"
                >
                  {copied ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-[#B0B0AE] mt-1">Identifiant technique généré automatiquement. Non modifiable.</p>
            </div>
          </div>

          {/* ── Section B: Aide à la saisie ── */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wider">Aide à la saisie</h4>
            <div>
              <label className={labelClass}>Placeholder</label>
              <input
                type="text"
                value={field.placeholder || ""}
                onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
                className={inputClass}
                placeholder="Texte affiché dans le champ vide"
              />
            </div>
            <div>
              <label className={labelClass}>Texte d&apos;aide</label>
              <input
                type="text"
                value={field.help || ""}
                onChange={(e) => onChange({ ...field, help: e.target.value })}
                className={inputClass}
                placeholder="Explication affichée sous le champ"
              />
            </div>
          </div>

          {/* ── Section C: Configuration ── */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wider">Configuration</h4>

            {/* Toggles row */}
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={field.required || false}
                    onChange={(e) => onChange({ ...field, required: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-[18px] bg-[#E6E6E4] rounded-full peer-checked:bg-[#4F46E5] transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm peer-checked:translate-x-[14px] transition-transform" />
                </div>
                <span className="text-[12px] text-[#5A5A58] group-hover:text-[#191919] transition-colors">Requis</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={field.pinned || false}
                    onChange={(e) => onChange({ ...field, pinned: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-[18px] bg-[#E6E6E4] rounded-full peer-checked:bg-[#4F46E5] transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm peer-checked:translate-x-[14px] transition-transform" />
                </div>
                <span className="text-[12px] text-[#5A5A58] group-hover:text-[#191919] transition-colors">Épingler</span>
              </label>
            </div>

            {/* ── Destination — 4 groups ── */}
            <div>
              <label className={labelClass}>Destination</label>
              <select
                value={currentValue}
                onChange={(e) => applyDestination(e.target.value)}
                className={selectClass + (isOrphan ? " !border-red-300 !ring-red-100" : "")}
              >
                <option value="">Réponse brief uniquement</option>

                {systemColumns.length > 0 && (
                  <optgroup label="Colonnes par défaut">
                    {systemColumns.map((c) => (
                      <option key={c.id} value={encodeDestination("column_default", c.key)}>{c.label}</option>
                    ))}
                  </optgroup>
                )}

                <optgroup label="Details commande">
                  {ORDER_DETAIL_FIELDS.map((d) => (
                    <option key={d.key} value={encodeDestination("detail_field", d.key)}>{d.label}</option>
                  ))}
                </optgroup>

                {customColumns.length > 0 && (
                  <optgroup label="Colonnes personnalisées">
                    {customColumns.map((c) => {
                      const compat = isCompatible(field.type, c.fieldType);
                      return (
                        <option
                          key={c.id}
                          value={encodeDestination("column_custom", c.id)}
                          disabled={!compat}
                        >
                          {c.label}{!compat ? ` (incompatible: ${c.fieldType})` : ""}
                        </option>
                      );
                    })}
                  </optgroup>
                )}
              </select>
              {isOrphan && (
                <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Destination supprimée — cette colonne n&apos;existe plus.
                </p>
              )}
              {incompatibleWarning && (
                <p className="flex items-center gap-1 text-[11px] text-amber-600 mt-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {incompatibleWarning}. Changez la destination ou le type du champ.
                </p>
              )}
              <p className="text-[10px] text-[#B0B0AE] mt-1">La réponse sera envoyée dans cette colonne de la commande.</p>
            </div>
          </div>

          {/* ── Section D: Options ── */}
          {hasOptions && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wider">Options</h4>
              <div className="bg-[#FAFAF9] border border-[#F0F0EE] rounded-xl p-4 space-y-2">
                {(field.options || []).length === 0 && (
                  <p className="text-[12px] text-[#B0B0AE] text-center py-2">Aucune option</p>
                )}
                {(field.options || []).map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 group/opt">
                    <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-md bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      className="flex-1 bg-white border border-[#E6E6E4] rounded-lg px-3 py-1.5 text-[13px] text-[#1A1A1A] placeholder:text-[#C4C4C2] focus:outline-none focus:border-[#4F46E5]/40 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all"
                      placeholder={`Option ${idx + 1}`}
                    />
                    <button
                      onClick={() => removeOption(idx)}
                      className="shrink-0 p-1 rounded-md text-[#D4D4D2] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/opt:opacity-100 transition-all cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="flex items-center gap-1.5 w-full justify-center py-2 mt-1 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] font-medium text-[#8A8A88] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] hover:bg-[#EEF2FF]/50 transition-all cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Ajouter une option
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
