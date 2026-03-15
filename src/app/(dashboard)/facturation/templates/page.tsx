"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/hooks/use-api";
import type { BillingTemplate, RecurringProfile, RecurringStatus } from "@/types";
import {
  Plus, X, Pencil, Trash2, Archive, ArchiveRestore, Search,
  FileText, RotateCw, Pause, Play, ChevronLeft, Calendar,
  User, Tag, MoreHorizontal, Copy, Zap,
} from "lucide-react";

/* ── Helpers ── */

function formatEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToTemplate(row: any): BillingTemplate {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    category: row.category || "",
    quantity: Number(row.quantity) || 1,
    unit: row.unit || "unité",
    unitPrice: Number(row.unit_price) || 0,
    currency: row.currency || "EUR",
    taxRate: Number(row.tax_rate) || 0,
    tags: row.tags || [],
    sortOrder: row.sort_order || 0,
    archived: row.archived || false,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToRecurring(row: any): RecurringProfile {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.clients?.name,
    templateId: row.template_id,
    title: row.title,
    description: row.description || "",
    category: row.category || "",
    quantity: Number(row.quantity) || 1,
    unit: row.unit || "forfait",
    unitPrice: Number(row.unit_price) || 0,
    currency: row.currency || "EUR",
    taxRate: Number(row.tax_rate) || 0,
    tags: row.tags || [],
    frequency: row.frequency || "monthly",
    genDay: row.gen_day || 1,
    autoGenerate: row.auto_generate || false,
    status: row.status || "active",
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const tw = {
  input: "w-full px-3.5 py-2.5 text-[13px] text-[#1A1A1A] border border-[#E6E6E4] rounded-lg bg-white focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 placeholder:text-[#C4C4C2] transition-all",
  label: "block text-[12px] font-medium text-[#57534E] mb-1.5",
  select: "w-full px-3.5 py-2.5 text-[13px] text-[#1A1A1A] border border-[#E6E6E4] rounded-lg bg-white focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition-all appearance-none",
} as const;

const recurringStatusConfig: Record<RecurringStatus, { label: string; bg: string; text: string; dot: string }> = {
  active: { label: "Actif", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  paused: { label: "En pause", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  ended: { label: "Terminé", bg: "bg-[#F5F5F4]", text: "text-[#78716C]", dot: "bg-[#A8A29E]" },
};

type ActiveTab = "templates" | "recurring";

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════ */

export default function TemplatesPage() {
  const { data: rawTemplates, loading: loadingT, mutate: mutateT } = useApi<unknown[]>("/api/billing/templates");
  const { data: rawRecurring, loading: loadingR, mutate: mutateR } = useApi<unknown[]>("/api/billing/recurring");
  const { data: rawClients } = useApi<{ id: string; name: string }[]>("/api/clients");
  const clients = rawClients || [];

  const templates = useMemo(() => (rawTemplates || []).map(dbToTemplate), [rawTemplates]);
  const recurring = useMemo(() => (rawRecurring || []).map(dbToRecurring), [rawRecurring]);

  const [mutating, setMutating] = useState(false);
  const [tab, setTab] = useState<ActiveTab>("templates");
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Drawers
  const [editTemplate, setEditTemplate] = useState<BillingTemplate | null>(null);
  const [createTemplate, setCreateTemplate] = useState(false);
  const [editRecurring, setEditRecurring] = useState<RecurringProfile | null>(null);
  const [createRecurring, setCreateRecurring] = useState(false);

  // Filtered lists
  const filteredTemplates = useMemo(() => {
    let list = templates.filter(t => showArchived ? t.archived : !t.archived);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    return list;
  }, [templates, search, showArchived]);

  const filteredRecurring = useMemo(() => {
    let list = recurring;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q) || (r.clientName || "").toLowerCase().includes(q));
    }
    return list;
  }, [recurring, search]);

  // Handlers
  const handleSaveTemplate = useCallback(async (data: Record<string, unknown>, id?: string) => {
    if (mutating) return;
    setMutating(true);
    try {
      const method = id ? "PATCH" : "POST";
      const url = id ? `/api/billing/templates/${id}` : "/api/billing/templates";
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      setCreateTemplate(false);
      setEditTemplate(null);
      await mutateT();
    } finally {
      setMutating(false);
    }
  }, [mutateT, mutating]);

  const handleDeleteTemplate = useCallback(async (id: string) => {
    if (mutating) return;
    setMutating(true);
    try {
      await fetch(`/api/billing/templates/${id}`, { method: "DELETE" });
      await mutateT();
    } finally {
      setMutating(false);
    }
  }, [mutateT, mutating]);

  const handleArchiveTemplate = useCallback(async (id: string, archived: boolean) => {
    if (mutating) return;
    setMutating(true);
    try {
      await fetch(`/api/billing/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      await mutateT();
    } finally {
      setMutating(false);
    }
  }, [mutateT, mutating]);

  const handleSaveRecurring = useCallback(async (data: Record<string, unknown>, id?: string) => {
    if (mutating) return;
    setMutating(true);
    try {
      const method = id ? "PATCH" : "POST";
      const url = id ? `/api/billing/recurring/${id}` : "/api/billing/recurring";
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      setCreateRecurring(false);
      setEditRecurring(null);
      await mutateR();
    } finally {
      setMutating(false);
    }
  }, [mutateR, mutating]);

  const handleDeleteRecurring = useCallback(async (id: string) => {
    if (mutating) return;
    setMutating(true);
    try {
      await fetch(`/api/billing/recurring/${id}`, { method: "DELETE" });
      await mutateR();
    } finally {
      setMutating(false);
    }
  }, [mutateR, mutating]);

  const handleGenerate = useCallback(async (id: string) => {
    if (mutating) return;
    setMutating(true);
    try {
      await fetch(`/api/billing/recurring/${id}/generate`, { method: "POST" });
      await mutateR();
    } finally {
      setMutating(false);
    }
  }, [mutateR, mutating]);

  const loading = loadingT || loadingR;

  return (
    <div className="max-w-[1120px] mx-auto">
      {/* Header */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <a href="/facturation" className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
            <ChevronLeft size={18} />
          </a>
          <h1 className="text-[24px] font-bold text-[#1A1A1A] tracking-tight">Templates & Récurrences</h1>
        </div>
        <p className="text-[14px] text-[#78716C] ml-10 leading-relaxed">
          Bibliothèque de prestations réutilisables et retainers mensuels automatisés.
        </p>
      </motion.div>

      {/* Tabs + Actions */}
      <motion.div
        className="flex items-center justify-between mb-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="flex items-center gap-1 bg-white border border-[#E6E6E4] rounded-lg p-0.5">
          {([
            { key: "templates" as ActiveTab, label: "Templates", count: templates.filter(t => !t.archived).length },
            { key: "recurring" as ActiveTab, label: "Récurrences", count: recurring.filter(r => r.status === "active").length },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
                tab === t.key
                  ? "bg-[#F0EEFF] text-[#6D28D9] shadow-sm"
                  : "text-[#78716C] hover:text-[#57534E]"
              }`}
            >
              {t.label}
              <span className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded-full ${
                tab === t.key ? "bg-[#7C3AED]/10 text-[#7C3AED]" : "text-[#A8A29E]"
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4C4C2]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="pl-9 pr-3 py-2 text-[13px] text-[#1A1A1A] bg-white border border-[#E6E6E4] rounded-lg w-52 focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 placeholder:text-[#C4C4C2] transition-all"
            />
          </div>

          {tab === "templates" && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg border transition-all ${
                showArchived
                  ? "bg-[#F0EEFF] border-[#DDD6FE] text-[#6D28D9]"
                  : "bg-white border-[#E6E6E4] text-[#78716C] hover:bg-[#FAFAF9]"
              }`}
            >
              <Archive size={12} />
              Archivés
            </button>
          )}

          <button
            onClick={() => tab === "templates" ? setCreateTemplate(true) : setCreateRecurring(true)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#7C3AED] px-4 py-2 rounded-lg hover:bg-[#6D28D9] transition-colors shadow-sm shadow-[#7C3AED]/20"
          >
            <Plus size={14} strokeWidth={2.5} />
            {tab === "templates" ? "Nouveau template" : "Nouvelle récurrence"}
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {loading ? (
          <div className="p-5 space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#FAFAF9] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tab === "templates" ? (
          filteredTemplates.length === 0 ? (
            <EmptyState
              icon={<FileText size={24} className="text-[#D6D3D1]" />}
              title={showArchived ? "Aucun template archivé" : "Aucun template"}
              description={showArchived ? "Les templates archivés apparaîtront ici." : "Créez vos prestations types pour facturer plus vite."}
              actionLabel="Créer un template"
              onAction={() => setCreateTemplate(true)}
              showAction={!showArchived}
            />
          ) : (
            <div className="divide-y divide-[#F5F5F4]">
              {filteredTemplates.map(tpl => (
                <TemplateRow
                  key={tpl.id}
                  template={tpl}
                  onEdit={() => setEditTemplate(tpl)}
                  onArchive={() => handleArchiveTemplate(tpl.id, !tpl.archived)}
                  onDelete={() => handleDeleteTemplate(tpl.id)}
                  mutating={mutating}
                />
              ))}
            </div>
          )
        ) : (
          filteredRecurring.length === 0 ? (
            <EmptyState
              icon={<RotateCw size={24} className="text-[#D6D3D1]" />}
              title="Aucune récurrence"
              description="Configurez vos retainers mensuels pour ne plus rien oublier."
              actionLabel="Créer une récurrence"
              onAction={() => setCreateRecurring(true)}
              showAction
            />
          ) : (
            <div className="divide-y divide-[#F5F5F4]">
              {filteredRecurring.map(rec => (
                <RecurringRow
                  key={rec.id}
                  profile={rec}
                  onEdit={() => setEditRecurring(rec)}
                  onDelete={() => handleDeleteRecurring(rec.id)}
                  onGenerate={() => handleGenerate(rec.id)}
                  onToggle={async () => {
                    const next = rec.status === "active" ? "paused" : "active";
                    await handleSaveRecurring({ status: next }, rec.id);
                  }}
                  mutating={mutating}
                />
              ))}
            </div>
          )
        )}
      </motion.div>

      {/* Drawers */}
      <AnimatePresence>
        {(createTemplate || editTemplate) && (
          <TemplateFormDrawer
            key={editTemplate ? `edit-${editTemplate.id}` : "create"}
            template={editTemplate || undefined}
            onClose={() => { setCreateTemplate(false); setEditTemplate(null); }}
            onSave={(data) => handleSaveTemplate(data, editTemplate?.id)}
          />
        )}
        {(createRecurring || editRecurring) && (
          <RecurringFormDrawer
            key={editRecurring ? `edit-${editRecurring.id}` : "create-rec"}
            profile={editRecurring || undefined}
            clients={clients}
            templates={templates.filter(t => !t.archived)}
            onClose={() => { setCreateRecurring(false); setEditRecurring(null); }}
            onSave={(data) => handleSaveRecurring(data, editRecurring?.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ══════════════════════════════════════════════════════════════════════ */

function EmptyState({ icon, title, description, actionLabel, onAction, showAction }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  showAction: boolean;
}) {
  return (
    <div className="py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-5">{icon}</div>
      <p className="text-[15px] font-semibold text-[#44403C]">{title}</p>
      <p className="text-[13px] text-[#A8A29E] mt-1.5 mb-6 max-w-sm mx-auto">{description}</p>
      {showAction && (
        <button onClick={onAction} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#7C3AED] px-5 py-2.5 rounded-lg hover:bg-[#6D28D9] transition-colors shadow-sm shadow-[#7C3AED]/20">
          <Plus size={14} strokeWidth={2.5} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   TEMPLATE ROW
   ══════════════════════════════════════════════════════════════════════ */

function TemplateRow({ template: t, onEdit, onArchive, onDelete, mutating }: {
  template: BillingTemplate;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  mutating?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAF9] transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-[#F0EEFF] flex items-center justify-center shrink-0">
        <FileText size={15} className="text-[#7C3AED]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#1A1A1A] truncate">{t.title}</span>
          {t.category && (
            <span className="text-[11px] text-[#A8A29E] bg-[#F5F5F4] px-1.5 py-0.5 rounded">{t.category}</span>
          )}
          {t.archived && (
            <span className="text-[10px] font-medium text-[#A8A29E] bg-[#F0F0EE] px-1.5 py-0.5 rounded">Archivé</span>
          )}
        </div>
        <div className="text-[11px] text-[#A8A29E] mt-0.5">
          {t.quantity > 1 ? `${t.quantity} ${t.unit} × ` : ""}{formatEur(t.unitPrice)}{t.unit !== "unité" && t.quantity <= 1 ? ` / ${t.unit}` : ""}
          {t.taxRate > 0 && ` · TVA ${t.taxRate}%`}
        </div>
      </div>
      <div className="text-right mr-2">
        <div className="text-[14px] font-bold text-[#1A1A1A] tabular-nums">{formatEur(t.quantity * t.unitPrice)}</div>
        <div className="text-[10px] text-[#A8A29E]">HT</div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 rounded-md text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors" title="Modifier">
          <Pencil size={14} />
        </button>
        <button onClick={onArchive} disabled={mutating} className="p-1.5 rounded-md text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors disabled:opacity-60 disabled:pointer-events-none" title={t.archived ? "Restaurer" : "Archiver"}>
          {t.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
        </button>
        <button onClick={onDelete} disabled={mutating} className="p-1.5 rounded-md text-[#A8A29E] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:pointer-events-none" title="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   RECURRING ROW
   ══════════════════════════════════════════════════════════════════════ */

function RecurringRow({ profile: r, onEdit, onDelete, onGenerate, onToggle, mutating }: {
  profile: RecurringProfile;
  onEdit: () => void;
  onDelete: () => void;
  onGenerate: () => void;
  onToggle: () => void;
  mutating?: boolean;
}) {
  const st = recurringStatusConfig[r.status];
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-[#FAFAF9] transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
        <RotateCw size={15} className="text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#1A1A1A] truncate">{r.title}</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.bg} ${st.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>
        <div className="text-[11px] text-[#A8A29E] mt-0.5">
          {r.clientName || "Sans client"} · Mensuel le {r.genDay}
          {r.startDate && ` · Depuis ${formatDate(r.startDate)}`}
        </div>
      </div>
      <div className="text-right mr-2">
        <div className="text-[14px] font-bold text-[#1A1A1A] tabular-nums">{formatEur(r.quantity * r.unitPrice)}</div>
        <div className="text-[10px] text-[#A8A29E]">/ mois HT</div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {r.status === "active" && (
          <button onClick={onGenerate} disabled={mutating} className="p-1.5 rounded-md text-[#7C3AED] hover:bg-[#F0EEFF] transition-colors disabled:opacity-60 disabled:pointer-events-none" title="Générer ce mois">
            <Zap size={14} />
          </button>
        )}
        <button onClick={onToggle} disabled={mutating} className="p-1.5 rounded-md text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors disabled:opacity-60 disabled:pointer-events-none" title={r.status === "active" ? "Mettre en pause" : "Activer"}>
          {r.status === "active" ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button onClick={onEdit} className="p-1.5 rounded-md text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors" title="Modifier">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} disabled={mutating} className="p-1.5 rounded-md text-[#A8A29E] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:pointer-events-none" title="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   TEMPLATE FORM DRAWER
   ══════════════════════════════════════════════════════════════════════ */

function TemplateFormDrawer({ template, onClose, onSave }: {
  template?: BillingTemplate;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const isEdit = !!template;
  const [form, setForm] = useState({
    title: template?.title || "",
    description: template?.description || "",
    category: template?.category || "",
    quantity: String(template?.quantity || "1"),
    unit: template?.unit || "unité",
    unit_price: template ? String(template.unitPrice) : "",
    tax_rate: String(template?.taxRate || "0"),
    tags: (template?.tags || []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const total = (Number(form.quantity) || 0) * (Number(form.unit_price) || 0);
  const canSave = form.title.trim() && Number(form.unit_price) > 0;

  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSave({
      title: form.title,
      description: form.description,
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      unit_price: Number(form.unit_price),
      tax_rate: Number(form.tax_rate),
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    setSaving(false);
  };

  return (
    <>
      <motion.div className="fixed inset-0 bg-black/15 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="fixed right-0 top-0 h-screen w-[480px] max-w-full bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
              {isEdit ? <Pencil size={16} className="text-[#7C3AED]" /> : <Plus size={16} className="text-[#7C3AED]" />}
            </div>
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">
              {isEdit ? "Modifier le template" : "Nouveau template"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className={tw.label}>Titre *</label>
            <input type="text" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Montage Reel Instagram" className={tw.input} autoFocus />
          </div>
          <div>
            <label className={tw.label}>Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} placeholder="Description par défaut..." className={`${tw.input} resize-none`} />
          </div>
          <div>
            <label className={tw.label}>Catégorie</label>
            <input type="text" value={form.category} onChange={e => set("category", e.target.value)} placeholder="Ex: Vidéo, Design..." className={tw.input} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={tw.label}>Quantité</label>
              <input type="number" min="0.01" step="0.01" value={form.quantity} onChange={e => set("quantity", e.target.value)} className={`${tw.input} tabular-nums`} />
            </div>
            <div>
              <label className={tw.label}>Unité</label>
              <select value={form.unit} onChange={e => set("unit", e.target.value)} className={tw.select}>
                <option value="unité">Unité</option>
                <option value="heure">Heure</option>
                <option value="jour">Jour</option>
                <option value="forfait">Forfait</option>
                <option value="lot">Lot</option>
                <option value="mois">Mois</option>
                <option value="pack">Pack</option>
              </select>
            </div>
            <div>
              <label className={tw.label}>Prix unitaire *</label>
              <input type="number" min="0" step="0.01" value={form.unit_price} onChange={e => set("unit_price", e.target.value)} placeholder="0,00" className={`${tw.input} tabular-nums`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={tw.label}>TVA (%)</label>
              <select value={form.tax_rate} onChange={e => set("tax_rate", e.target.value)} className={tw.select}>
                <option value="0">0%</option>
                <option value="5.5">5,5%</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
              </select>
            </div>
            <div>
              <label className={tw.label}>Tags</label>
              <input type="text" value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="design, urgent..." className={tw.input} />
            </div>
          </div>
          <div className="rounded-xl bg-[#FAFAFF] border border-[#E8E5F5] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#78716C]">Total HT</span>
              <span className="text-[18px] font-bold text-[#1A1A1A] tabular-nums">{formatEur(total)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#F0F0EE] flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] rounded-lg hover:bg-[#F5F5F4] transition-colors">Annuler</button>
          <button onClick={handleSubmit} disabled={!canSave || saving} className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${canSave && !saving ? "text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-sm shadow-[#7C3AED]/20" : "text-[#D6D3D1] bg-[#F5F5F4] border border-[#E6E6E4] cursor-not-allowed"}`}>
            {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer le template"}
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   RECURRING FORM DRAWER
   ══════════════════════════════════════════════════════════════════════ */

function RecurringFormDrawer({ profile, clients, templates, onClose, onSave }: {
  profile?: RecurringProfile;
  clients: { id: string; name: string }[];
  templates: BillingTemplate[];
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const isEdit = !!profile;
  const [form, setForm] = useState({
    title: profile?.title || "",
    description: profile?.description || "",
    client_id: profile?.clientId || "",
    template_id: profile?.templateId || "",
    category: profile?.category || "",
    quantity: String(profile?.quantity || "1"),
    unit: profile?.unit || "forfait",
    unit_price: profile ? String(profile.unitPrice) : "",
    tax_rate: String(profile?.taxRate || "0"),
    gen_day: String(profile?.genDay || "1"),
    start_date: profile?.startDate || new Date().toISOString().slice(0, 10),
    end_date: profile?.endDate || "",
    tags: (profile?.tags || []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const total = (Number(form.quantity) || 0) * (Number(form.unit_price) || 0);
  const canSave = form.title.trim() && Number(form.unit_price) > 0;

  // Auto-fill from template
  const applyTemplate = (tplId: string) => {
    const tpl = templates.find(t => t.id === tplId);
    if (!tpl) return;
    setForm(f => ({
      ...f,
      template_id: tplId,
      title: tpl.title,
      description: tpl.description,
      category: tpl.category,
      quantity: String(tpl.quantity),
      unit: tpl.unit,
      unit_price: String(tpl.unitPrice),
      tax_rate: String(tpl.taxRate),
      tags: tpl.tags.join(", "),
    }));
  };

  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSave({
      title: form.title,
      description: form.description,
      client_id: form.client_id || null,
      template_id: form.template_id || null,
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      unit_price: Number(form.unit_price),
      tax_rate: Number(form.tax_rate),
      gen_day: Number(form.gen_day),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      frequency: "monthly",
    });
    setSaving(false);
  };

  return (
    <>
      <motion.div className="fixed inset-0 bg-black/15 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="fixed right-0 top-0 h-screen w-[520px] max-w-full bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <RotateCw size={16} className="text-emerald-600" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">
              {isEdit ? "Modifier la récurrence" : "Nouvelle récurrence"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Template shortcut */}
          {templates.length > 0 && (
            <div>
              <label className={tw.label}>Préremplir depuis un template</label>
              <select
                value={form.template_id}
                onChange={e => { set("template_id", e.target.value); if (e.target.value) applyTemplate(e.target.value); }}
                className={tw.select}
              >
                <option value="">— Saisie libre —</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.title} ({formatEur(t.unitPrice)})</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={tw.label}>Client</label>
              <select value={form.client_id} onChange={e => set("client_id", e.target.value)} className={tw.select}>
                <option value="">Aucun client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={tw.label}>Catégorie</label>
              <input type="text" value={form.category} onChange={e => set("category", e.target.value)} placeholder="Ex: Maintenance..." className={tw.input} />
            </div>
          </div>
          <div>
            <label className={tw.label}>Titre *</label>
            <input type="text" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ex: Pack contenu mensuel" className={tw.input} />
          </div>
          <div>
            <label className={tw.label}>Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} placeholder="Détails du retainer..." className={`${tw.input} resize-none`} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={tw.label}>Quantité</label>
              <input type="number" min="0.01" step="0.01" value={form.quantity} onChange={e => set("quantity", e.target.value)} className={`${tw.input} tabular-nums`} />
            </div>
            <div>
              <label className={tw.label}>Unité</label>
              <select value={form.unit} onChange={e => set("unit", e.target.value)} className={tw.select}>
                <option value="forfait">Forfait</option>
                <option value="heure">Heure</option>
                <option value="jour">Jour</option>
                <option value="mois">Mois</option>
                <option value="pack">Pack</option>
                <option value="unité">Unité</option>
              </select>
            </div>
            <div>
              <label className={tw.label}>Prix unitaire *</label>
              <input type="number" min="0" step="0.01" value={form.unit_price} onChange={e => set("unit_price", e.target.value)} placeholder="0,00" className={`${tw.input} tabular-nums`} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={tw.label}>TVA (%)</label>
              <select value={form.tax_rate} onChange={e => set("tax_rate", e.target.value)} className={tw.select}>
                <option value="0">0%</option>
                <option value="5.5">5,5%</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
              </select>
            </div>
            <div>
              <label className={tw.label}>Jour de génération</label>
              <input type="number" min="1" max="28" value={form.gen_day} onChange={e => set("gen_day", e.target.value)} className={`${tw.input} tabular-nums`} />
            </div>
            <div>
              <label className={tw.label}>Date de début</label>
              <input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} className={tw.input} />
            </div>
          </div>
          <div>
            <label className={tw.label}>Date de fin <span className="text-[#C4C4C2] font-normal">(optionnel)</span></label>
            <input type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} className={tw.input} />
          </div>
          <div>
            <label className={tw.label}>Tags</label>
            <input type="text" value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="retainer, mensuel..." className={tw.input} />
          </div>
          <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#57534E]">Montant mensuel HT</span>
              <span className="text-[18px] font-bold text-emerald-700 tabular-nums">{formatEur(total)}</span>
            </div>
            <div className="text-[11px] text-[#A8A29E] mt-1">
              Génération automatique le {form.gen_day || 1} de chaque mois
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#F0F0EE] flex items-center gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] rounded-lg hover:bg-[#F5F5F4] transition-colors">Annuler</button>
          <button onClick={handleSubmit} disabled={!canSave || saving} className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${canSave && !saving ? "text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-sm shadow-[#7C3AED]/20" : "text-[#D6D3D1] bg-[#F5F5F4] border border-[#E6E6E4] cursor-not-allowed"}`}>
            {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer la récurrence"}
          </button>
        </div>
      </motion.div>
    </>
  );
}
