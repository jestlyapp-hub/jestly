"use client";

import { useState, useEffect, useMemo } from "react";
import SlidePanel from "@/components/ui/SlidePanel";
import { apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ClientRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website?: string | null;
  tags: string[];
  notes?: string | null;
  source: string | null;
  status: string;
  language?: string;
  timezone?: string;
  custom_fields?: Record<string, string>;
}

interface EditClientSheetProps {
  client: ClientRow | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

const labelClass = "block text-[11px] font-medium text-[#999] mb-1";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function EditClientSheet({ client, open, onClose, onSaved }: EditClientSheetProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    source: "",
    tags: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  // Populate form when client changes
  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        company: client.company || "",
        website: client.website || "",
        source: client.source || "",
        tags: (client.tags || []).join(", "),
        notes: client.notes || "",
      });
    }
  }, [client]);

  const initialForm = useMemo(() => {
    if (!client) return null;
    return {
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      website: client.website || "",
      source: client.source || "",
      tags: (client.tags || []).join(", "),
      notes: client.notes || "",
    };
  }, [client]);

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    return Object.keys(form).some(
      (key) => form[key as keyof typeof form] !== initialForm[key as keyof typeof initialForm]
    );
  }, [form, initialForm]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!client || !isDirty) return;
    setSaving(true);
    try {
      await apiFetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        body: {
          name: form.name.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
          website: form.website.trim() || undefined,
          source: form.source.trim() || undefined,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          notes: form.notes.trim() || undefined,
        },
      });
      toast.success("Client mis à jour");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlidePanel open={open} onClose={onClose} title="Modifier le client">
      <div className="space-y-6">
        {/* Section: Identité */}
        <div>
          <h3 className="text-[12px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-3">Identité</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Nom complet</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Jean Dupont"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="client@email.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Téléphone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section: Entreprise */}
        <div>
          <h3 className="text-[12px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-3">Entreprise</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Entreprise</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="Nom de l'entreprise"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Site web</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Source</label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => handleChange("source", e.target.value)}
                placeholder="Site web, recommandation, réseau..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section: Organisation */}
        <div>
          <h3 className="text-[12px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-3">Organisation</h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Tags (séparés par des virgules)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="vip, design, web..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Notes internes</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={4}
                placeholder="Notes sur ce client..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#EFEFEF]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-[13px] font-medium text-[#5A5A58] bg-white border border-[#E6E6E4] rounded-md hover:bg-[#FBFBFA] transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="flex-1 px-4 py-2.5 text-[13px] font-medium text-white bg-[#4F46E5] rounded-md hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Enregistrer
          </button>
        </div>
      </div>
    </SlidePanel>
  );
}
