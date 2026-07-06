"use client";

/**
 * Export CSV des données filtrées courantes (refonte ECOM, carte blanche E).
 * Généré côté client : ce que tu vois est ce que tu exportes.
 * Point-virgule + BOM UTF-8 → s'ouvre proprement dans Excel FR.
 */
import { Download } from "lucide-react";

interface Props {
  filename: string;
  /** Lignes à exporter — l'ordre des clés de la première ligne fait l'en-tête. */
  rows: Array<Record<string, string | number | null | undefined>>;
  disabled?: boolean;
}

function toCsv(rows: Props["rows"]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number | null | undefined): string => {
    const s = v == null ? "" : String(v);
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(";"),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(";")),
  ].join("\n");
}

export default function ExportCsvButton({ filename, rows, disabled }: Props) {
  const download = () => {
    const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={download} disabled={disabled || rows.length === 0}
      title="Exporter les lignes actuellement filtrées en CSV"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white text-[#1a1535] border border-[#E5E3F0] hover:bg-[#FBFBFA] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]">
      <Download size={13} strokeWidth={1.8} /> Export CSV
    </button>
  );
}
