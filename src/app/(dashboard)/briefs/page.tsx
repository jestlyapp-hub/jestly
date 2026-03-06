"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { useColumns } from "@/lib/hooks/use-columns";
import BriefSchemaBuilder from "@/components/briefs/BriefSchemaBuilder";
import { LEGACY_SEEDED_KEYS } from "@/lib/kanban-config";
import type { BriefField } from "@/types";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

interface TemplateRow {
  id: string;
  name: string;
  description: string | null;
  version: number;
  schema: BriefField[];
  created_at: string;
  updated_at: string;
}

const DEFAULT_FIELDS: BriefField[] = [
  { key: "date_souhaitee", type: "date", label: "Date souhaitée", required: false, pinned: true, destinationType: "column_default", destinationKey: "deadline", target_kind: "order_field", target_ref: "deadline", destinationColumnLabel: "Deadline" },
  { key: "description_besoin", type: "textarea", label: "Description du besoin", required: true, placeholder: "Décrivez votre projet en détail...", destinationType: "detail_field", destinationKey: "briefing", target_kind: "order_field", target_ref: "briefing", destinationColumnLabel: "Briefing" },
  { key: "fichiers", type: "file", label: "Fichiers à fournir", required: false, destinationType: "detail_field", destinationKey: "resources", target_kind: "order_field", target_ref: "resources", destinationColumnLabel: "Ressources" },
];

export default function BriefsPage() {
  const { data: templates, loading, mutate } = useApi<TemplateRow[]>("/api/brief-templates");
  const { fields: allBoardFields } = useColumns();
  const orderColumns = allBoardFields.filter(
    (f) => !LEGACY_SEEDED_KEYS.has(f.key) && !(f.config as { hidden?: boolean })?.hidden
  );
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<BriefField[]>([]);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (useDefault = false) => {
    if (!createName.trim()) return;
    await apiFetch("/api/brief-templates", {
      method: "POST",
      body: {
        name: createName,
        description: createDesc || null,
        fields: useDefault ? DEFAULT_FIELDS : [],
      },
    });
    setShowCreate(false);
    setCreateName("");
    setCreateDesc("");
    await mutate();
  };

  const startEdit = (t: TemplateRow) => {
    setEditingId(t.id);
    setEditFields(t.schema || []);
    setEditName(t.name);
  };

  const saveEdit = useCallback(async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await apiFetch(`/api/brief-templates/${editingId}`, {
        method: "PUT",
        body: { name: editName, fields: editFields },
      });
      await mutate();
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }, [editingId, editName, editFields, mutate]);

  const handleDuplicate = async (t: TemplateRow) => {
    await apiFetch("/api/brief-templates", {
      method: "POST",
      body: {
        name: `${t.name} (copie)`,
        description: t.description,
        fields: t.schema,
      },
    });
    await mutate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce template ?")) return;
    await apiFetch(`/api/brief-templates/${id}`, { method: "DELETE" });
    if (editingId === id) setEditingId(null);
    await mutate();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Briefs</h1>
          <p className="text-[13px] text-[#8A8A88]">Questionnaires pour vos clients</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Créer un brief
        </button>
      </motion.div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)} className="fixed inset-0 bg-black/10 z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl border border-[#E6E6E4] shadow-lg z-50 p-6 space-y-4"
            >
              <h2 className="text-[16px] font-semibold text-[#191919]">Nouveau brief</h2>
              <div>
                <label className="block text-[12px] text-[#8A8A88] mb-1">Nom</label>
                <input value={createName} onChange={(e) => setCreateName(e.target.value)} className={inputClass} placeholder="Ex : Brief logo" />
              </div>
              <div>
                <label className="block text-[12px] text-[#8A8A88] mb-1">Description</label>
                <textarea value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} className={inputClass + " resize-none"} rows={2} placeholder="Optionnel" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCreate(false)}
                  disabled={!createName.trim()}
                  className="flex-1 py-2.5 text-[13px] font-semibold rounded-lg border border-[#E6E6E4] text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors disabled:opacity-40"
                >
                  Vide
                </button>
                <button
                  onClick={() => handleCreate(true)}
                  disabled={!createName.trim()}
                  className="flex-1 py-2.5 text-[13px] font-semibold rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors disabled:opacity-40"
                >
                  Template par défaut
                </button>
              </div>
              <button onClick={() => setShowCreate(false)} className="w-full text-[12px] text-[#8A8A88] hover:text-[#5A5A58] cursor-pointer">
                Annuler
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Templates list */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#F7F7F5] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (!templates || templates.length === 0) && (
        <div className="text-center py-16">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E6E6E4" strokeWidth="1.5" className="mx-auto mb-3">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
          </svg>
          <p className="text-[14px] text-[#8A8A88]">Aucun brief créé</p>
          <p className="text-[12px] text-[#8A8A88] mt-1">Créez un questionnaire pour collecter les infos de vos clients</p>
        </div>
      )}

      {!loading && templates && templates.length > 0 && (
        <div className="space-y-3">
          {templates.map((t) => (
            <motion.div
              key={t.id}
              layout
              className={`bg-white border rounded-xl p-4 transition-colors ${
                editingId === t.id ? "border-[#4F46E5]/30 shadow-sm" : "border-[#E6E6E4]"
              }`}
            >
              {/* Template header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => editingId === t.id ? setEditingId(null) : startEdit(t)}
                  className="flex-1 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[#191919]">{t.name}</span>
                    <span className="text-[11px] text-[#8A8A88] bg-[#F7F7F5] px-1.5 py-0.5 rounded">v{t.version}</span>
                    <span className="text-[11px] text-[#8A8A88]">{(t.schema || []).length} champs</span>
                  </div>
                  {t.description && <p className="text-[12px] text-[#8A8A88] mt-0.5">{t.description}</p>}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(t)}
                    title="Dupliquer"
                    className="p-1.5 rounded text-[#8A8A88] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    title="Supprimer"
                    className="p-1.5 rounded text-[#8A8A88] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Inline editor */}
              <AnimatePresence>
                {editingId === t.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-[#E6E6E4] space-y-4">
                      <div>
                        <label className="block text-[12px] text-[#8A8A88] mb-1">Nom du template</label>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <BriefSchemaBuilder
                        fields={editFields}
                        onChange={setEditFields}
                        orderFields={orderColumns}
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="px-4 py-2 text-[13px] font-semibold rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors disabled:opacity-60"
                        >
                          {saving ? "Enregistrement..." : "Enregistrer"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
