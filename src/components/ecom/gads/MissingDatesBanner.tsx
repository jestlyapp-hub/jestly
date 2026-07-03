"use client";

import { AlertTriangle } from "lucide-react";
import { formatDateFr } from "./format";

interface Props {
  missingDates: string[];
}

/**
 * Alerte "trous de données Ads" : jours sans aucune ligne dans la plage
 * couverte par les imports. Jamais interpolés — on demande un réexport CSV.
 */
export default function MissingDatesBanner({ missingDates }: Props) {
  if (missingDates.length === 0) return null;
  const shown = missingDates.slice(0, 8);
  return (
    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-[12px] text-amber-900">
      <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold">
          Données Ads manquantes ({missingDates.length} jour{missingDates.length > 1 ? "s" : ""}) :
        </span>{" "}
        {shown.map((d) => formatDateFr(d)).join(", ")}
        {missingDates.length > shown.length && <> … et {missingDates.length - shown.length} autres</>}
        {". "}Ces jours ne sont pas interpolés — réexporte le CSV Google Ads sur cette plage pour les combler.
      </div>
    </div>
  );
}
