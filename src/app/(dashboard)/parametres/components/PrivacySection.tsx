"use client";

import { useState, useCallback } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import type { SettingsForm, SettingsFormActions } from "./shared";
import { SectionCard, Toggle } from "./shared";

export function PrivacySection({ form, actions, dirty }: {
  form: SettingsForm;
  actions: SettingsFormActions;
  dirty: boolean;
}) {
  const [exporting, setExporting] = useState<"json" | "csv" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = useCallback(async (format: "json" | "csv") => {
    setExporting(format);
    setExportError(null);
    try {
      const res = await fetch(`/api/settings/export?format=${format}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jestly-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Erreur d'export");
    } finally {
      setExporting(null);
    }
  }, []);

  return (
    <SectionCard id="donnees" title="Données & Confidentialité" description="Contrôlez vos données et vos préférences de confidentialité." dirty={dirty}>
      <div className="space-y-5">
        {/* Export */}
        <div>
          <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-3">Export de données</p>
          <p className="text-[13px] text-[#57534E] mb-3">
            Téléchargez une copie complète de vos données (clients, commandes, factures, tâches) au format JSON ou CSV.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport("json")}
              disabled={exporting !== null}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#7C3AED] border border-[#7C3AED]/30 px-4 py-2.5 rounded-lg hover:bg-[#F0EEFF] transition-colors disabled:opacity-50"
            >
              {exporting === "json" ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Exporter en JSON
            </button>
            <button
              onClick={() => handleExport("csv")}
              disabled={exporting !== null}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] px-4 py-2.5 rounded-lg hover:bg-[#F7F7F5] transition-colors disabled:opacity-50"
            >
              {exporting === "csv" ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              Exporter en CSV
            </button>
          </div>
          {exportError && <p className="text-[11px] text-red-500 mt-2">{exportError}</p>}
        </div>

        <div className="h-px bg-[#F0F0EE]" />

        {/* Privacy toggles */}
        <div>
          <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">Confidentialité</p>
          <Toggle
            checked={!!form.settings.emailMarketing}
            onChange={v => { actions.updateSettings({ emailMarketing: v }); actions.markDirty("donnees"); }}
            label="Emails marketing"
            description="Recevoir des actualités, tutoriels et offres spéciales."
          />
          <Toggle
            checked={true}
            onChange={() => {}}
            label="Statistiques anonymes"
            description="Aide à améliorer Jestly. Aucune donnée personnelle collectée."
          />
        </div>
      </div>
    </SectionCard>
  );
}
