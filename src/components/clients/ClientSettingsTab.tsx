"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/hooks/use-api";
import type { ClientDetail, ClientStatus } from "@/types";

interface Props {
  client: ClientDetail;
  onUpdate: () => void;
}

export default function ClientSettingsTab({ client, onUpdate }: Props) {
  const [form, setForm] = useState({
    name: client.name,
    email: client.email,
    phone: client.phone || "",
    company: client.company || "",
    website: client.website || "",
    notes: client.notes || "",
    tags: client.tags.join(", "),
    status: client.status as ClientStatus,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [archiveError, setArchiveError] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(false);
    try {
      await apiFetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        body: {
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          company: form.company || null,
          website: form.website || null,
          notes: form.notes || null,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          status: form.status,
        },
      });
      setSaved(true);
      onUpdate();
    } catch (err) {
      console.error("[ClientSettings] Save failed:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    const action = form.status === "archived" ? "réactiver" : "archiver";
    if (!window.confirm(`Voulez-vous ${action} ce client ?`)) return;
    const newStatus = form.status === "archived" ? "active" : "archived";
    setForm((prev) => ({ ...prev, status: newStatus }));
    setSaving(true);
    setArchiveError(false);
    try {
      await apiFetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        body: { status: newStatus },
      });
      onUpdate();
    } catch (err) {
      console.error("[ClientSettings] Archive failed:", err);
      setForm((prev) => ({ ...prev, status: client.status }));
      setArchiveError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-4">Informations du client</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-medium text-[#999] mb-1">Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[12px] font-medium text-[#999] mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[12px] font-medium text-[#999] mb-1">Téléphone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-[12px] font-medium text-[#999] mb-1">Entreprise</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => handleChange("company", e.target.value)}
              className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-[12px] font-medium text-[#999] mb-1">Site web</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://"
              className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-[12px] font-medium text-[#999] mb-1">Statut</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4">
          <label className="block text-[12px] font-medium text-[#999] mb-1">Tags (séparés par des virgules)</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
            placeholder="vip, design, web..."
            className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
          />
        </div>

        {/* Notes */}
        <div className="mt-4">
          <label className="block text-[12px] font-medium text-[#999] mb-1">Notes internes</label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={3}
            className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 resize-none"
          />
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#4F46E5] text-white text-[13px] font-medium rounded-md hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          {saved && (
            <span className="text-[12px] text-emerald-600">Enregistré !</span>
          )}
          {saveError && (
            <span className="text-[12px] text-red-500">Erreur lors de l'enregistrement</span>
          )}
        </div>
      </div>

      {/* Archive / Unarchive */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-2">Zone de danger</h3>
        <p className="text-[12px] text-[#999] mb-3">
          {form.status === "archived"
            ? "Ce client est archivé. Vous pouvez le réactiver."
            : "Archiver ce client le masquera des listes actives."}
        </p>
        <button
          onClick={handleArchive}
          disabled={saving}
          className={`px-4 py-2 text-[13px] font-medium rounded-md transition-colors cursor-pointer ${
            form.status === "archived"
              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              : "bg-red-50 text-red-500 hover:bg-red-100"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {form.status === "archived" ? "Réactiver le client" : "Archiver le client"}
        </button>
        {archiveError && (
          <p className="text-[12px] text-red-500 mt-2">Erreur lors de l'archivage</p>
        )}
      </div>
    </div>
  );
}
