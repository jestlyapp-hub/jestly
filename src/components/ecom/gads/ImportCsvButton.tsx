"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

export interface ImportRecap {
  rows_in_csv: number;
  rows_added: number;
  rows_updated: number;
  new_dates: string[];
  range: { from: string; to: string } | null;
  campaigns_count: number;
  skipped_totals: number;
  warnings: string[];
  missing_dates: string[];
}

interface Props {
  onImported: (recap: ImportRecap) => void;
  variant?: "primary" | "secondary";
}

export default function ImportCsvButton({ onImported, variant = "primary" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ecom/gads/import", { method: "POST", body: form });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      onImported(body.recap as ImportRecap);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const cls = variant === "primary"
    ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
    : "bg-white text-[#191919] border border-[#E6E6E4] hover:bg-[#FBFBFA]";

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors disabled:opacity-60 ${cls}`}
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} strokeWidth={1.8} />}
        {busy ? "Import en cours…" : "Importer un CSV Google Ads"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,text/csv,text/tab-separated-values"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
      />
      {error && <span className="text-[11px] text-rose-600 max-w-[280px] text-right">{error}</span>}
    </div>
  );
}
