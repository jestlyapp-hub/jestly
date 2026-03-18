"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Order, ChecklistItem, BoardField, FieldOption, BriefField, ResourceItem } from "@/types";
import { apiFetch } from "@/lib/hooks/use-api";
import { urlToResourceItem } from "@/lib/brief-column-compat";
import BriefAnswersDisplay from "@/components/briefs/BriefAnswersDisplay";
import { useFieldSave } from "@/lib/hooks/use-field-save";
import FieldSaveIndicator from "./FieldSaveIndicator";
import EditableCell from "./EditableCell";
import ClientSelectCell from "./ClientSelectCell";
import StatusSelectCell from "./StatusSelectCell";
import PriorityPicker from "./PriorityPicker";
import OrderDrawerChecklist from "./OrderDrawerChecklist";
import OrderDrawerNotes from "./OrderDrawerNotes";
import CustomCell from "./CustomCell";
import { toast } from "@/lib/hooks/use-toast";

const CATEGORIES = [
  { value: "", label: "Aucune" },
  { value: "miniature", label: "Miniature" },
  { value: "montage", label: "Montage" },
  { value: "design", label: "Design" },
  { value: "logo", label: "Logo" },
  { value: "illustration", label: "Illustration" },
  { value: "autre", label: "Autre" },
];

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

interface BriefData {
  answers: Record<string, unknown>;
  fields: BriefField[];
  brief_name?: string;
  pinned?: string[];
  template_version: number;
  fieldSources?: Record<string, { target_kind: string; target_ref: string }>;
}

export interface BillingAction {
  label: string;
  status: string;
  accent?: boolean;
}

interface OrderDrawerProps {
  order: Order | null;
  onClose: () => void;
  patchOrder: (id: string, api: Record<string, unknown>, raw: Record<string, unknown>) => Promise<boolean>;
  clients: ClientOption[];
  customFields?: BoardField[];
  onAddOption?: (fieldId: string, label: string) => Promise<FieldOption>;
  briefData?: BriefData | null;
  onClientDeleted?: () => void;
  /** When opened from billing context — shows billing actions */
  billingStatus?: string;
  billingActions?: BillingAction[];
  onBillingStatusChange?: (status: string) => void;
  billingMutating?: boolean;
}

/* ─── Section header ─── */
function SectionHeader({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-[#B0B0AE]">{icon}</span>}
      <span className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
        {children}
      </span>
    </div>
  );
}

/* ─── Field row ─── */
function FieldRow({ label, indicator, badge, children }: {
  label: string;
  indicator?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between min-h-[36px] py-1 hover:bg-[#FAFAF9] -mx-2 px-2 rounded-md transition-colors">
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] text-[#5A5A58]">{label}</span>
        {badge}
        {indicator}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/* ─── Briefing sub-component ─── */
function DrawerBriefing({
  briefing,
  getState,
  saveField,
}: {
  briefing: string;
  getState: (f: string) => "idle" | "saving" | "saved" | "error";
  saveField: (field: string, api: Record<string, unknown>, raw: Record<string, unknown>) => void;
}) {
  const [value, setValue] = useState(briefing);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Sync when order changes (e.g. optimistic update from outside)
  useEffect(() => { setValue(briefing); }, [briefing]);

  const commit = useCallback((v: string) => {
    const text = v.trim() || null;
    saveField("briefing", { briefing: text }, { briefing: text });
  }, [saveField]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commit(e.target.value), 1500);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <SectionHeader icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        }>Briefing</SectionHeader>
        <FieldSaveIndicator state={getState("briefing")} />
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={() => { if (timerRef.current) { clearTimeout(timerRef.current); commit(value); } }}
        placeholder="Contexte, instructions, attentes du client..."
        rows={4}
        className="w-full text-[13px] bg-[#FAFAF9] border border-[#EFEFEF] rounded-lg px-3.5 py-2.5 text-[#191919] placeholder:text-[#B0B0AE] focus:outline-none focus:border-[#4F46E5]/30 focus:bg-white resize-none transition-colors leading-relaxed"
      />
    </div>
  );
}

/* ─── Resources sub-component ─── */

function resourceIcon(item: ResourceItem) {
  if (item.type === "transfer_link") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    );
  }
  if (item.type === "file") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function providerBadge(item: ResourceItem) {
  if (item.provider === "wetransfer") return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium shrink-0">WeTransfer</span>;
  if (item.provider === "swisstransfer") return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium shrink-0">SwissTransfer</span>;
  return null;
}

function DrawerResources({
  resources,
  getState,
  saveField,
}: {
  resources: ResourceItem[];
  getState: (f: string) => "idle" | "saving" | "saved" | "error";
  saveField: (field: string, api: Record<string, unknown>, raw: Record<string, unknown>) => void;
}) {
  const [newUrl, setNewUrl] = useState("");

  const addResource = () => {
    const url = newUrl.trim();
    if (!url) return;
    const item = urlToResourceItem(url);
    const next = [...resources, item];
    saveField("resources", { resources: next }, { resources: next });
    setNewUrl("");
  };

  const removeResource = (idx: number) => {
    const next = resources.filter((_, i) => i !== idx);
    saveField("resources", { resources: next }, { resources: next });
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <SectionHeader icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        }>Moodboard & Ressources</SectionHeader>
        <FieldSaveIndicator state={getState("resources")} />
      </div>
      {resources.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {resources.map((item, idx) => (
            <div key={item.id || idx} className="flex items-center gap-2 group bg-[#FAFAF9] rounded-lg px-3 py-2 border border-[#EFEFEF] hover:border-[#E6E6E4] transition-colors">
              {resourceIcon(item)}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-[12px] text-[#4F46E5] hover:underline truncate"
                title={item.url}
              >
                {item.label || item.url}
              </a>
              {providerBadge(item)}
              <button
                onClick={() => removeResource(idx)}
                className="opacity-0 group-hover:opacity-100 text-[#8A8A88] hover:text-red-500 transition-opacity cursor-pointer shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addResource()}
          placeholder="Lien WeTransfer, SwissTransfer ou URL..."
          className="flex-1 text-[12px] bg-[#FAFAF9] border border-[#EFEFEF] rounded-lg px-3 py-2 text-[#191919] placeholder:text-[#B0B0AE] focus:outline-none focus:border-[#4F46E5]/30 focus:bg-white transition-colors"
        />
        <button
          onClick={addResource}
          disabled={!newUrl.trim()}
          className="text-[12px] px-3 py-2 rounded-lg bg-[#F7F7F5] border border-[#E6E6E4] text-[#5A5A58] hover:bg-[#EFEFEF] disabled:opacity-40 cursor-pointer disabled:cursor-default transition-colors font-medium"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}

/* ─── Create Project from Order ─── */
function CreateProjectFromOrder({ order }: { order: Order }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const categoryToType: Record<string, string> = {
        miniature: "thumbnail", montage: "video", design: "design",
        logo: "branding", illustration: "design",
      };
      const res = await apiFetch<{ id: string }>("/api/projects", {
        body: {
          name: order.product || "Projet sans titre",
          description: order.briefing || order.notes || "",
          projectType: categoryToType[order.category || ""] || "custom",
          clientId: order.clientId || null,
          budget: order.price || 0,
          status: "in_progress",
          priority: order.priority || "normal",
          orderId: order.id,
          deadline: order.deadline || null,
          tags: order.tags || [],
        },
      });
      setCreated(true);
      setTimeout(() => router.push(`/projets/${res.id}`), 500);
    } catch {
      setCreating(false);
      setCreateError("Erreur lors de la création du projet");
    }
  };

  return (
    <div>
      <SectionHeader icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
      }>Projet</SectionHeader>
      {created ? (
        <div className="flex items-center gap-2 text-[12px] text-emerald-600 font-medium bg-emerald-50 rounded-lg px-3 py-2.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          Projet créé ! Redirection...
        </div>
      ) : (
        <>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 w-full px-3.5 py-2.5 text-[12px] font-medium text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-lg transition-colors cursor-pointer disabled:opacity-50 border border-[#4F46E5]/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
            {creating ? "Création..." : "Créer un projet depuis cette commande"}
          </button>
          {createError && <p className="text-[11px] text-red-500 mt-1.5">{createError}</p>}
        </>
      )}
    </div>
  );
}

/* ─── Delete Client Dialog ─── */
function DeleteClientFromDrawer({
  clientId,
  clientName,
  onDeleted,
}: {
  clientId: string;
  clientName: string;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const canDelete = confirmation === "SUPPRIMER";

  const handleClose = () => {
    setConfirmation("");
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    setLoading(true);
    try {
      await apiFetch(`/api/clients/${clientId}`, { method: "DELETE" });
      toast.success(`${clientName} a été supprimé`);
      setConfirmation("");
      setOpen(false);
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full px-3.5 py-2.5 text-[12px] text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Supprimer le client {clientName}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="absolute inset-0 bg-black/20" onClick={handleClose} />
            <motion.div
              className="relative bg-white rounded-xl border border-[#E6E6E4] shadow-xl max-w-md w-full mx-4 p-6"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>

              <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-2">
                Supprimer {clientName} ?
              </h3>
              <p className="text-[13px] text-[#5A5A58] leading-relaxed mb-1">
                Cette action retirera le client de toutes les listes actives.
              </p>
              <p className="text-[12px] text-[#8A8A88] leading-relaxed mb-4">
                Les commandes et factures associées seront conservées pour l&apos;historique. Le client sera marqué comme supprimé.
              </p>

              <div className="mb-5">
                <label className="block text-[12px] text-[#8A8A88] mb-1.5">
                  Tapez <span className="font-semibold text-[#1A1A1A]">SUPPRIMER</span> pour confirmer
                </label>
                <input
                  type="text"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="SUPPRIMER"
                  autoFocus
                  className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2.5 text-[13px] text-[#1A1A1A] placeholder-[#C0C0BE] focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-200 transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-[13px] font-medium text-[#5A5A58] bg-white border border-[#E6E6E4] rounded-lg hover:bg-[#FBFBFA] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!canDelete || loading}
                  className="flex-1 px-4 py-2.5 text-[13px] font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Supprimer définitivement
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════ */
/* ─── MAIN DRAWER ─── */
/* ═══════════════════════════════════════ */

export default function OrderDrawer({
  order,
  onClose,
  patchOrder,
  clients,
  customFields = [],
  onAddOption,
  briefData: briefDataProp,
  onClientDeleted,
  billingStatus,
  billingActions,
  onBillingStatusChange,
  billingMutating,
}: OrderDrawerProps) {
  const { getState, markSaving, markSaved, markError } = useFieldSave();

  // Auto-fetch brief data when order has brief responses
  const [fetchedBrief, setFetchedBrief] = useState<BriefData | null>(null);

  useEffect(() => {
    if (!order) { setFetchedBrief(null); return; }
    // Fetch order detail to get brief responses
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const resp = data.order_brief_responses;
        if (resp && !Array.isArray(resp)) {
          setFetchedBrief({
            answers: resp.answers ?? {},
            fields: resp.fields_snapshot ?? resp.schema ?? [],
            brief_name: resp.brief_name,
            pinned: resp.pinned ?? [],
            template_version: resp.template_version ?? 1,
            fieldSources: resp.field_sources ?? undefined,
          });
        } else if (Array.isArray(resp) && resp.length > 0) {
          const r = resp[0];
          setFetchedBrief({
            answers: r.answers ?? {},
            fields: r.fields_snapshot ?? r.schema ?? [],
            brief_name: r.brief_name,
            pinned: r.pinned ?? [],
            template_version: r.template_version ?? 1,
            fieldSources: r.field_sources ?? undefined,
          });
        } else {
          setFetchedBrief(null);
        }
      } catch {
        setFetchedBrief(null);
      }
    })();
    return () => { cancelled = true; };
  }, [order?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const briefData = briefDataProp ?? fetchedBrief;

  const isFromBrief = (fieldName: string): boolean => {
    if (!briefData?.fieldSources) return false;
    return Object.values(briefData.fieldSources).some(
      (s) => s.target_kind === "order_field" && s.target_ref === fieldName
    );
  };

  const BriefBadge = () => (
    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">
      Brief
    </span>
  );

  const saveField = async (field: string, apiBody: Record<string, unknown>, rawPatch: Record<string, unknown>) => {
    if (!order) return;
    markSaving(field);
    const ok = await patchOrder(order.id, apiBody, rawPatch);
    ok ? markSaved(field) : markError(field);
  };

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/12 z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-[520px] bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-[-4px_0_24px_-4px_rgba(0,0,0,0.06)]"
          >
            {/* ═══ HEADER ═══ */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-[#E6E6E4] bg-[#FEFEFE]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono text-[#B0B0AE] bg-[#F7F7F5] px-2 py-0.5 rounded">
                    #{order.id.slice(0, 8)}
                  </span>
                  {order.groupId && order.groupIndex && order.groupTotal && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-medium">
                      {order.groupIndex}/{order.groupTotal}
                    </span>
                  )}
                  {billingActions && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0EEFF] text-[#7C3AED] font-semibold">
                      Facturation
                    </span>
                  )}
                  <StatusSelectCell
                    currentStatus={order.status}
                    onCommit={(s) => {
                      saveField("status", { status: s }, { status: s });
                      toast.success(`Statut : ${s}`);
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <EditableCell
                    value={order.product}
                    className="text-[17px] font-semibold text-[#191919] leading-tight"
                    onCommit={(v) => saveField("title", { title: String(v) }, { title: String(v) })}
                  />
                  <FieldSaveIndicator state={getState("title")} />
                </div>
                {order.price > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[15px] font-bold text-[#191919]">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(order.price)}
                    </span>
                    <FieldSaveIndicator state={getState("amount")} />
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer ml-3 -mt-1"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* ═══ SCROLLABLE CONTENT ═══ */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5 space-y-5">

                {/* ─── Client ─── */}
                <div>
                  <SectionHeader icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  }>Client</SectionHeader>
                  <div className="flex items-center gap-3 bg-[#FAFAF9] rounded-lg p-3 border border-[#EFEFEF]">
                    <div className="w-10 h-10 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[12px] font-bold text-[#4F46E5] flex-shrink-0">
                      {order.client
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <ClientSelectCell
                          currentName={order.client}
                          currentId={order.clientId}
                          clients={clients}
                          onCommit={(clientId) => {
                            const client = clients.find((c) => c.id === clientId);
                            saveField(
                              "client",
                              { client_id: clientId },
                              { client_id: clientId, clients: client ? { name: client.name, email: client.email, phone: null } : undefined }
                            );
                          }}
                        />
                        <FieldSaveIndicator state={getState("client")} />
                      </div>
                      {(order.clientEmail || order.clientPhone) && (
                        <div className="text-[12px] text-[#8A8A88] mt-0.5">
                          {order.clientEmail}
                          {order.clientPhone && ` \u00B7 ${order.clientPhone}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ─── Détails ─── */}
                <div>
                  <SectionHeader icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  }>Détails</SectionHeader>

                  <div className="space-y-0.5">
                    {/* Amount */}
                    <FieldRow label="Montant" indicator={<FieldSaveIndicator state={getState("amount")} />}>
                      <EditableCell
                        value={order.price}
                        type="number"
                        suffix="€"
                        className="text-[14px] font-bold text-[#191919] tabular-nums"
                        onCommit={(v) => saveField("amount", { amount: Number(v) }, { amount: Number(v) })}
                      />
                    </FieldRow>

                    {/* Priority */}
                    <FieldRow label="Priorité" indicator={<FieldSaveIndicator state={getState("priority")} />}>
                      <PriorityPicker
                        value={order.priority}
                        onChange={(p) => saveField("priority", { priority: p }, { priority: p })}
                      />
                    </FieldRow>

                    {/* Deadline */}
                    <FieldRow
                      label="Deadline"
                      badge={isFromBrief("deadline") ? <BriefBadge /> : undefined}
                      indicator={<FieldSaveIndicator state={getState("deadline")} />}
                    >
                      <input
                        type="date"
                        value={order.deadline ?? ""}
                        onChange={(e) => {
                          const v = e.target.value || null;
                          saveField("deadline", { deadline: v }, { deadline: v });
                        }}
                        className="text-[12px] bg-[#F7F7F5] border border-[#EFEFEF] rounded-md px-2.5 py-1.5 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 cursor-pointer hover:border-[#E6E6E4] transition-colors"
                      />
                    </FieldRow>

                    {/* Paid toggle */}
                    <FieldRow label="Payé" indicator={<FieldSaveIndicator state={getState("paid")} />}>
                      <button
                        onClick={() => saveField("paid", { paid: !order.paid }, { paid: !order.paid })}
                        className={`w-10 h-[22px] rounded-full transition-colors cursor-pointer relative ${
                          order.paid ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"
                        }`}
                      >
                        <span
                          className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                            order.paid ? "translate-x-[22px]" : "translate-x-[3px]"
                          }`}
                        />
                      </button>
                    </FieldRow>

                    {/* Date (read-only) */}
                    <FieldRow label="Créée le">
                      <span className="text-[13px] text-[#5A5A58]">{order.date}</span>
                    </FieldRow>

                    {/* Tags */}
                    {order.tags.length > 0 && (
                      <FieldRow label="Tags">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {order.tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7F7F5] border border-[#E6E6E4] text-[#5A5A58] font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </FieldRow>
                    )}

                    {/* Category */}
                    <FieldRow
                      label="Catégorie"
                      badge={isFromBrief("category") ? <BriefBadge /> : undefined}
                      indicator={<FieldSaveIndicator state={getState("category")} />}
                    >
                      <select
                        value={order.category ?? ""}
                        onChange={(e) => {
                          const v = e.target.value || null;
                          saveField("category", { category: v }, { category: v });
                        }}
                        className="text-[12px] bg-[#F7F7F5] border border-[#EFEFEF] rounded-md px-2.5 py-1.5 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 cursor-pointer hover:border-[#E6E6E4] transition-colors"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </FieldRow>

                    {/* External Ref */}
                    <FieldRow
                      label="Réf. externe"
                      badge={isFromBrief("external_ref") ? <BriefBadge /> : undefined}
                      indicator={<FieldSaveIndicator state={getState("external_ref")} />}
                    >
                      <EditableCell
                        value={order.externalRef ?? ""}
                        placeholder="—"
                        className="text-[13px] text-[#191919]"
                        onCommit={(v) => {
                          const val = String(v).trim() || null;
                          saveField("external_ref", { external_ref: val }, { external_ref: val });
                        }}
                      />
                    </FieldRow>
                  </div>
                </div>

                {/* ─── Custom fields ─── */}
                {customFields.length > 0 && (
                  <div>
                    <SectionHeader icon={
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                    }>Propriétés</SectionHeader>
                    <div className="space-y-0.5">
                      {customFields.filter(f => !(f.config as { hidden?: boolean })?.hidden).map((field) => (
                        <FieldRow key={field.id} label={field.label}>
                          <CustomCell
                            field={field}
                            value={order.customFields?.[field.key]}
                            onCommit={(v) => {
                              const next = { ...(order.customFields ?? {}), [field.key]: v };
                              saveField(`custom_${field.key}`, { custom_fields: next }, { custom_fields: next });
                            }}
                            onAddOption={(label) => onAddOption ? onAddOption(field.id, label) : Promise.resolve({ label, color: "gray" })}
                          />
                        </FieldRow>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── Brief client ─── */}
                {briefData && briefData.fields.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <SectionHeader icon={
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      }>{briefData.brief_name || "Brief client"}</SectionHeader>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                        Reçu
                      </span>
                    </div>
                    {briefData.fields.some((f) => f.pinned) && (
                      <div className="bg-[#EEF2FF] rounded-lg p-3 mb-3 border border-[#4F46E5]/10">
                        <BriefAnswersDisplay
                          fields={briefData.fields}
                          answers={briefData.answers}
                          pinnedOnly
                        />
                      </div>
                    )}
                    <BriefAnswersDisplay
                      fields={briefData.fields}
                      answers={briefData.answers}
                      fieldSources={briefData.fieldSources}
                      hideMapped
                    />
                    <button
                      onClick={() => {
                        const text = briefData.fields
                          .map((f) => `${f.label}: ${briefData.answers[f.key] ?? "—"}`)
                          .join("\n");
                        navigator.clipboard.writeText(text);
                        toast.success("Réponses copiées");
                      }}
                      className="mt-3 text-[11px] text-[#4F46E5] hover:underline cursor-pointer font-medium"
                    >
                      Copier les réponses
                    </button>
                  </div>
                )}

                {/* ─── Briefing ─── */}
                <DrawerBriefing
                  briefing={order.briefing ?? ""}
                  getState={getState}
                  saveField={saveField}
                />

                {/* ─── Resources ─── */}
                <DrawerResources
                  resources={order.resources ?? []}
                  getState={getState}
                  saveField={saveField}
                />

                {/* ─── Checklist ─── */}
                <div>
                  <div className="flex items-center gap-1.5 mb-0">
                    <SectionHeader icon={
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    }>Checklist</SectionHeader>
                    <FieldSaveIndicator state={getState("checklist")} />
                  </div>
                  <OrderDrawerChecklist
                    checklist={order.checklist}
                    onChange={(items: ChecklistItem[]) =>
                      saveField("checklist", { checklist: items }, { checklist: items })
                    }
                  />
                </div>

                {/* ─── Projet ─── */}
                <CreateProjectFromOrder order={order} />

                {/* ─── Notes ─── */}
                <div>
                  <div className="flex items-center gap-1.5 mb-0">
                    <SectionHeader icon={
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                    }>Notes</SectionHeader>
                    <FieldSaveIndicator state={getState("notes")} />
                  </div>
                  <OrderDrawerNotes
                    notes={order.notes ?? ""}
                    onChange={(value: string) =>
                      saveField("notes", { notes: value || null }, { notes: value || null })
                    }
                  />
                </div>

                {/* ═══ BILLING ACTIONS (contextual) ═══ */}
                {billingActions && billingActions.length > 0 && onBillingStatusChange && (
                  <div className="mt-2 pt-5 border-t border-[#E6E6E4]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#B0B0AE]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/><path d="M9 14l2 2 4-4"/></svg>
                      </span>
                      <span className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
                        Facturation
                      </span>
                      {billingStatus && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F0EEFF] text-[#7C3AED] ml-auto">
                          {billingStatus === "in_progress" ? "En cours" : billingStatus === "ready" ? "Prête" : billingStatus === "invoiced" ? "Facturée" : billingStatus === "paid" ? "Payée" : billingStatus}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {billingActions.map(a => (
                        <button
                          key={a.status}
                          onClick={() => onBillingStatusChange(a.status)}
                          disabled={billingMutating}
                          className={`w-full text-left px-3.5 py-2.5 text-[13px] rounded-lg flex items-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer ${
                            a.accent
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium border border-emerald-200"
                              : "bg-[#FAFAF9] hover:bg-[#F0EEFF] border border-[#EFEFEF] hover:border-[#DDD6FE] text-[#5A5A58]"
                          }`}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══ DANGER ZONE ═══ */}
                {order.clientId && (
                  <div className="mt-2 pt-5 border-t border-[#E6E6E4]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[#D0D0CE]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      </span>
                      <span className="text-[11px] font-semibold text-[#B0B0AE] uppercase tracking-wider">
                        Zone sensible
                      </span>
                    </div>
                    <div className="rounded-lg border border-red-100 bg-red-50/30 p-1">
                      <DeleteClientFromDrawer
                        clientId={order.clientId}
                        clientName={order.client}
                        onDeleted={() => {
                          onClientDeleted?.();
                          onClose();
                        }}
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
