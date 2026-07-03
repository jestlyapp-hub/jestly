"use client";

import { CheckCircle2, X } from "lucide-react";
import { formatDateFr } from "./format";
import type { ImportRecap } from "./ImportCsvButton";

interface Props {
  recap: ImportRecap;
  onDismiss: () => void;
}

export default function ImportRecapBanner({ recap, onDismiss }: Props) {
  return (
    <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-[12px]">
      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
      <div className="flex-1 text-emerald-900">
        <span className="font-semibold">Import terminé.</span>{" "}
        {recap.rows_added} ligne{recap.rows_added > 1 ? "s" : ""} ajoutée{recap.rows_added > 1 ? "s" : ""},{" "}
        {recap.rows_updated} mise{recap.rows_updated > 1 ? "s" : ""} à jour (le CSV le plus récent fait foi).
        {recap.range && (
          <> Plage couverte : {formatDateFr(recap.range.from)} → {formatDateFr(recap.range.to)},{" "}
          {recap.campaigns_count} campagne{recap.campaigns_count > 1 ? "s" : ""}.</>
        )}
        {recap.skipped_totals > 0 && <> {recap.skipped_totals} ligne{recap.skipped_totals > 1 ? "s" : ""} de total ignorée{recap.skipped_totals > 1 ? "s" : ""}.</>}
        {recap.warnings.length > 0 && (
          <ul className="mt-1 list-disc list-inside text-amber-800">
            {recap.warnings.slice(0, 5).map((w, i) => <li key={i}>{w}</li>)}
            {recap.warnings.length > 5 && <li>… et {recap.warnings.length - 5} autres avertissements</li>}
          </ul>
        )}
      </div>
      <button onClick={onDismiss} className="text-emerald-700 hover:text-emerald-900 shrink-0" aria-label="Fermer">
        <X size={14} />
      </button>
    </div>
  );
}
