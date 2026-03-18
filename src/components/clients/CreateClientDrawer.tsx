"use client";

import { useState } from "react";
import SlidePanel from "@/components/ui/SlidePanel";

interface CreateClientDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: (clientId: string) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20";

const labelClass = "block text-[11px] font-medium text-[#999] mb-1";

interface CustomField {
  key: string;
  value: string;
}

export default function CreateClientDrawer({ open, onClose, onCreated }: CreateClientDrawerProps) {
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
    website: "",
    tags: "",
    initialNote: "",
    address: "",
    language: "fr",
    timezone: "Europe/Paris",
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setDuplicateId(null);
  };

  const isEmailValid = form.email.trim() === "" || EMAIL_REGEX.test(form.email);
  const hasName = form.firstName.trim() !== "" || form.lastName.trim() !== "";
  const canSubmit = (hasName || (form.email.trim() !== "" && isEmailValid)) && isEmailValid && !saving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    setDuplicateId(null);

    try {
      const cfObj: Record<string, string> = {};
      for (const f of customFields) {
        if (f.key.trim()) cfObj[f.key.trim()] = f.value;
      }

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim() || undefined,
          lastName: form.lastName.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          company: form.company.trim() || undefined,
          website: form.website.trim() || undefined,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          initialNote: form.initialNote.trim() || undefined,
          address: form.address.trim() ? { street: form.address.trim() } : undefined,
          language: form.language,
          timezone: form.timezone,
          custom_fields: Object.keys(cfObj).length > 0 ? cfObj : undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 409 && data.existingClientId) {
        setDuplicateId(data.existingClientId);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Erreur lors de la création");
        return;
      }

      onCreated(data.id);
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  const addCustomField = () => {
    setCustomFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: "key" | "value", val: string) => {
    setCustomFields((prev) =>
      prev.map((cf, i) => (i === index ? { ...cf, [field]: val } : cf))
    );
  };

  return (
    <SlidePanel open={open} onClose={onClose} title="Nouveau client">
      <div className="space-y-4">
        {/* Duplicate banner */}
        {duplicateId && (
          <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-lg p-3 flex items-center justify-between gap-3">
            <p className="text-[12px] text-[#4F46E5]">
              Ce client existe déjà avec cet email.
            </p>
            <button
              onClick={() => onCreated(duplicateId)}
              className="text-[12px] font-medium text-[#4F46E5] hover:underline whitespace-nowrap cursor-pointer"
            >
              Ouvrir la fiche
            </button>
          </div>
        )}

        {/* Error banner */}
        {error && !duplicateId && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-[12px] text-red-600">{error}</p>
          </div>
        )}

        {/* Email */}
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="client@email.com"
            className={inputClass}
          />
          {form.email && !isEmailValid && (
            <p className="text-[11px] text-red-400 mt-1">Email invalide</p>
          )}
        </div>

        {/* First name / Last name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Prénom</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Jean"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nom</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Dupont"
              className={inputClass}
            />
          </div>
        </div>

        {/* Phone */}
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

        {/* Company */}
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

        {/* Website */}
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

        {/* Tags */}
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

        {/* Initial note */}
        <div>
          <label className={labelClass}>Note initiale</label>
          <textarea
            value={form.initialNote}
            onChange={(e) => handleChange("initialNote", e.target.value)}
            rows={3}
            placeholder="Contexte, premier contact..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-[12px] text-[#999] hover:text-[#1A1A1A] transition-colors cursor-pointer"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          Plus d&apos;infos
        </button>

        {showAdvanced && (
          <div className="space-y-4 pl-2 border-l-2 border-[#EFEFEF]">
            {/* Address */}
            <div>
              <label className={labelClass}>Adresse</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 rue de Paris, 75001 Paris"
                className={inputClass}
              />
            </div>

            {/* Language */}
            <div>
              <label className={labelClass}>Langue</label>
              <select
                value={form.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className={inputClass}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className={labelClass}>Fuseau horaire</label>
              <select
                value={form.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className={inputClass}
              >
                <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                <option value="Europe/London">Europe/London (UTC+0)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (UTC-8)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                <option value="Australia/Sydney">Australia/Sydney (UTC+11)</option>
              </select>
            </div>

            {/* Custom fields */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass}>Champs personnalisés</label>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="text-[11px] text-[#4F46E5] hover:underline cursor-pointer"
                >
                  + Ajouter
                </button>
              </div>
              {customFields.map((cf, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={cf.key}
                    onChange={(e) => updateCustomField(i, "key", e.target.value)}
                    placeholder="Clé"
                    className={`${inputClass} flex-1`}
                  />
                  <input
                    type="text"
                    value={cf.value}
                    onChange={(e) => updateCustomField(i, "value", e.target.value)}
                    placeholder="Valeur"
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomField(i)}
                    className="p-1 text-[#999] hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full px-4 py-2.5 bg-[#4F46E5] text-white text-[13px] font-medium rounded-lg hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {saving ? "Création en cours..." : "Créer le client"}
          </button>
        </div>
      </div>
    </SlidePanel>
  );
}
