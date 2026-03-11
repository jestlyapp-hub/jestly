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

interface OrderDrawerProps {
  order: Order | null;
  onClose: () => void;
  patchOrder: (id: string, api: Record<string, unknown>, raw: Record<string, unknown>) => Promise<boolean>;
  clients: ClientOption[];
  customFields?: BoardField[];
  onAddOption?: (fieldId: string, label: string) => Promise<FieldOption>;
  briefData?: BriefData | null;
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
      <div className="flex items-center gap-1 mb-2">
        <span className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
          Briefing
        </span>
        <FieldSaveIndicator state={getState("briefing")} />
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={() => { if (timerRef.current) { clearTimeout(timerRef.current); commit(value); } }}
        placeholder="Contexte, instructions, attentes du client..."
        rows={3}
        className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-md px-3 py-2 text-[#191919] placeholder:text-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30 resize-none"
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
      <div className="flex items-center gap-1 mb-2">
        <span className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
          Ressources
        </span>
        <FieldSaveIndicator state={getState("resources")} />
      </div>
      {resources.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {resources.map((item, idx) => (
            <div key={item.id || idx} className="flex items-center gap-2 group bg-[#FAFAF9] rounded-md px-2.5 py-1.5 border border-[#F0F0EE]">
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
          className="flex-1 text-[12px] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2.5 py-1.5 text-[#191919] placeholder:text-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30"
        />
        <button
          onClick={addResource}
          disabled={!newUrl.trim()}
          className="text-[11px] px-2.5 py-1.5 rounded bg-[#F7F7F5] border border-[#E6E6E4] text-[#5A5A58] hover:bg-[#EFEFEF] disabled:opacity-40 cursor-pointer disabled:cursor-default transition-colors"
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
      <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-2">
        Projet
      </div>
      {created ? (
        <div className="flex items-center gap-2 text-[12px] text-emerald-600 font-medium">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          Projet créé ! Redirection...
        </div>
      ) : (
        <>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
            {creating ? "Création..." : "Créer un projet depuis cette commande"}
          </button>
          {createError && <p className="text-[11px] text-red-500 mt-1">{createError}</p>}
        </>
      )}
    </div>
  );
}

export default function OrderDrawer({
  order,
  onClose,
  patchOrder,
  clients,
  customFields = [],
  onAddOption,
  briefData: briefDataProp,
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
          // single object from maybeSingle-like join
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
    <span className="text-[9px] px-1 py-0.5 rounded bg-purple-50 text-purple-600 font-medium ml-1">
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
            className="fixed inset-0 bg-black/10 z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white border-l border-[#E6E6E4] z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E6E4]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-mono text-[#8A8A88]">
                    #{order.id.slice(0, 8)}
                  </span>
                  {order.groupId && order.groupIndex && order.groupTotal && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5] font-medium">
                      {order.groupIndex}/{order.groupTotal}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <EditableCell
                    value={order.product}
                    className="text-[16px] font-semibold text-[#191919]"
                    onCommit={(v) => saveField("title", { title: String(v) }, { title: String(v) })}
                  />
                  <FieldSaveIndicator state={getState("title")} />
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-[#F7F7F5] transition-colors cursor-pointer ml-3"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Client section */}
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
                    Client
                  </span>
                  <FieldSaveIndicator state={getState("client")} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[12px] font-bold text-[#4F46E5] flex-shrink-0">
                    {order.client
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
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
                    <div className="text-[12px] text-[#8A8A88]">
                      {order.clientEmail}
                      {order.clientPhone && ` \u00B7 ${order.clientPhone}`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#E6E6E4]" />

              {/* Details section */}
              <div className="space-y-4">
                <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
                  Details
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] text-[#5A5A58]">Montant</span>
                    <FieldSaveIndicator state={getState("amount")} />
                  </div>
                  <EditableCell
                    value={order.price}
                    type="number"
                    suffix="€"
                    className="text-[15px] font-bold text-[#191919]"
                    onCommit={(v) => saveField("amount", { amount: Number(v) }, { amount: Number(v) })}
                  />
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] text-[#5A5A58]">Statut</span>
                    <FieldSaveIndicator state={getState("status")} />
                  </div>
                  <StatusSelectCell
                    currentStatus={order.status}
                    onCommit={(s) => {
                      saveField("status", { status: s }, { status: s });
                      toast.success(`Statut : ${s}`);
                    }}
                  />
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] text-[#5A5A58]">Priorite</span>
                    <FieldSaveIndicator state={getState("priority")} />
                  </div>
                  <PriorityPicker
                    value={order.priority}
                    onChange={(p) => saveField("priority", { priority: p }, { priority: p })}
                  />
                </div>

                {/* Deadline */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] text-[#5A5A58]">Deadline</span>
                    {isFromBrief("deadline") && <BriefBadge />}
                    <FieldSaveIndicator state={getState("deadline")} />
                  </div>
                  <input
                    type="date"
                    value={order.deadline ?? ""}
                    onChange={(e) => {
                      const v = e.target.value || null;
                      saveField("deadline", { deadline: v }, { deadline: v });
                    }}
                    className="text-[12px] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2 py-1 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 cursor-pointer"
                  />
                </div>

                {/* Paid toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] text-[#5A5A58]">Paye</span>
                    <FieldSaveIndicator state={getState("paid")} />
                  </div>
                  <button
                    onClick={() => saveField("paid", { paid: !order.paid }, { paid: !order.paid })}
                    className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                      order.paid ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        order.paid ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Date (read-only) */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#5A5A58]">Date</span>
                  <span className="text-[13px] text-[#191919]">{order.date}</span>
                </div>

                {/* Tags */}
                {order.tags.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-[13px] text-[#5A5A58]">Tags</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {order.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7F7F5] border border-[#E6E6E4] text-[#5A5A58]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] text-[#5A5A58]">Categorie</span>
                    {isFromBrief("category") && <BriefBadge />}
                    <FieldSaveIndicator state={getState("category")} />
                  </div>
                  <select
                    value={order.category ?? ""}
                    onChange={(e) => {
                      const v = e.target.value || null;
                      saveField("category", { category: v }, { category: v });
                    }}
                    className="text-[12px] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2 py-1 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* External Ref */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] text-[#5A5A58]">Ref. externe</span>
                    {isFromBrief("external_ref") && <BriefBadge />}
                    <FieldSaveIndicator state={getState("external_ref")} />
                  </div>
                  <EditableCell
                    value={order.externalRef ?? ""}
                    placeholder="—"
                    className="text-[13px] text-[#191919]"
                    onCommit={(v) => {
                      const val = String(v).trim() || null;
                      saveField("external_ref", { external_ref: val }, { external_ref: val });
                    }}
                  />
                </div>
              </div>

              {/* Custom fields */}
              {customFields.length > 0 && (
                <>
                  <div className="h-px bg-[#E6E6E4]" />
                  <div className="space-y-4">
                    <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
                      Proprietes
                    </div>
                    {customFields.filter(f => !(f.config as { hidden?: boolean })?.hidden).map((field) => (
                      <div key={field.id} className="flex items-center justify-between">
                        <span className="text-[13px] text-[#5A5A58]">{field.label}</span>
                        <CustomCell
                          field={field}
                          value={order.customFields?.[field.key]}
                          onCommit={(v) => {
                            const next = { ...(order.customFields ?? {}), [field.key]: v };
                            saveField(`custom_${field.key}`, { custom_fields: next }, { custom_fields: next });
                          }}
                          onAddOption={(label) => onAddOption ? onAddOption(field.id, label) : Promise.resolve({ label, color: "gray" })}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Brief client (questionnaire responses) */}
              {briefData && briefData.fields.length > 0 && (
                <>
                  <div className="h-px bg-[#E6E6E4]" />
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
                        {briefData.brief_name || "Brief client"}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">
                        Reçu
                      </span>
                    </div>
                    {/* Pinned fields summary */}
                    {briefData.fields.some((f) => f.pinned) && (
                      <div className="bg-[#EEF2FF] rounded-lg p-3 mb-3">
                        <BriefAnswersDisplay
                          fields={briefData.fields}
                          answers={briefData.answers}
                          pinnedOnly
                        />
                      </div>
                    )}
                    {/* All fields (hide mapped to avoid duplication) */}
                    <BriefAnswersDisplay
                      fields={briefData.fields}
                      answers={briefData.answers}
                      fieldSources={briefData.fieldSources}
                      hideMapped
                    />
                    {/* Copy answers */}
                    <button
                      onClick={() => {
                        const text = briefData.fields
                          .map((f) => `${f.label}: ${briefData.answers[f.key] ?? "—"}`)
                          .join("\n");
                        navigator.clipboard.writeText(text);
                        toast.success("Réponses copiées");
                      }}
                      className="mt-3 text-[11px] text-[#4F46E5] hover:underline cursor-pointer"
                    >
                      Copier les réponses
                    </button>
                  </div>
                </>
              )}

              <div className="h-px bg-[#E6E6E4]" />

              {/* Briefing */}
              <DrawerBriefing
                briefing={order.briefing ?? ""}
                getState={getState}
                saveField={saveField}
              />

              <div className="h-px bg-[#E6E6E4]" />

              {/* Resources */}
              <DrawerResources
                resources={order.resources ?? []}
                getState={getState}
                saveField={saveField}
              />

              <div className="h-px bg-[#E6E6E4]" />

              {/* Checklist */}
              <div>
                <div className="flex items-center gap-1 mb-0">
                  <FieldSaveIndicator state={getState("checklist")} />
                </div>
                <OrderDrawerChecklist
                  checklist={order.checklist}
                  onChange={(items: ChecklistItem[]) =>
                    saveField("checklist", { checklist: items }, { checklist: items })
                  }
                />
              </div>

              <div className="h-px bg-[#E6E6E4]" />

              {/* Create project from order */}
              <CreateProjectFromOrder order={order} />

              <div className="h-px bg-[#E6E6E4]" />

              {/* Notes */}
              <div>
                <div className="flex items-center gap-1 mb-0">
                  <FieldSaveIndicator state={getState("notes")} />
                </div>
                <OrderDrawerNotes
                  notes={order.notes ?? ""}
                  onChange={(value: string) =>
                    saveField("notes", { notes: value || null }, { notes: value || null })
                  }
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
