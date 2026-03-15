"use client";

import type { LeadSource } from "@/types";

interface LeadConfig {
  saveAsLead?: boolean;
  successMessage?: string;
  notifyEmail?: string;
  leadSource?: LeadSource;
  leadTags?: string[];
}

interface LeadConfigEditorProps {
  config: LeadConfig;
  onChange: (config: LeadConfig) => void;
  /** Show source selector (default: true) */
  showSource?: boolean;
  /** Show tags input (default: false) */
  showTags?: boolean;
  /** Default source value for this form type */
  defaultSource?: LeadSource;
}

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: "contact-form", label: "Contact" },
  { value: "quote-request", label: "Demande de devis" },
  { value: "newsletter", label: "Newsletter" },
  { value: "lead-magnet", label: "Lead Magnet" },
  { value: "booking", label: "Réservation" },
  { value: "other", label: "Autre" },
];

export default function LeadConfigEditor({
  config,
  onChange,
  showSource = true,
  showTags = false,
  defaultSource = "contact-form",
}: LeadConfigEditorProps) {
  const update = (patch: Partial<LeadConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="space-y-3 border-t border-[#E6E6E4] pt-3 mt-3">
      <label className="block text-[12px] font-semibold text-[#1A1A1A]">Capture de leads</label>

      {/* Save as lead toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#5A5A58]">Sauvegarder comme lead</span>
        <button
          onClick={() => update({ saveAsLead: !(config.saveAsLead !== false) })}
          className={`relative w-9 h-5 rounded-full transition-colors ${
            config.saveAsLead !== false ? "bg-[#4F46E5]" : "bg-[#D1D1D0]"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              config.saveAsLead !== false ? "left-[18px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {config.saveAsLead !== false && (
        <>
          {/* Success message */}
          <div>
            <label className="block text-[11px] font-medium text-[#8A8A88] mb-1">Message de succès</label>
            <input
              type="text"
              value={config.successMessage || ""}
              onChange={(e) => update({ successMessage: e.target.value })}
              placeholder="Merci ! Nous reviendrons vers vous rapidement."
              className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
            />
          </div>

          {/* Notify email */}
          <div>
            <label className="block text-[11px] font-medium text-[#8A8A88] mb-1">Email de notification</label>
            <input
              type="email"
              value={config.notifyEmail || ""}
              onChange={(e) => update({ notifyEmail: e.target.value })}
              placeholder="vous@domaine.fr"
              className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
            />
            <p className="text-[10px] text-[#8A8A88] mt-0.5">Recevez une notification à chaque soumission.</p>
          </div>

          {/* Source selector */}
          {showSource && (
            <div>
              <label className="block text-[11px] font-medium text-[#8A8A88] mb-1">Source du lead</label>
              <select
                value={config.leadSource || defaultSource}
                onChange={(e) => update({ leadSource: e.target.value as LeadSource })}
                className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all appearance-none"
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tags */}
          {showTags && (
            <div>
              <label className="block text-[11px] font-medium text-[#8A8A88] mb-1">Tags auto</label>
              <input
                type="text"
                value={(config.leadTags || []).join(", ")}
                onChange={(e) => update({ leadTags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                placeholder="devis, premium, urgent"
                className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
              />
              <p className="text-[10px] text-[#8A8A88] mt-0.5">Séparez les tags par des virgules.</p>
            </div>
          )}
        </>
      )}

      {/* Info when disabled */}
      {config.saveAsLead === false && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-[11px] text-amber-700">
            Les soumissions ne seront pas enregistrées en base. Activez cette option pour suivre vos leads.
          </p>
        </div>
      )}
    </div>
  );
}
