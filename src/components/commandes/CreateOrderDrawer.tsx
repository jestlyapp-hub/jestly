"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { BoardStatus, BoardField } from "@/types";
import { PRIORITIES } from "@/lib/kanban-config";
import { useApi, apiFetch } from "@/lib/hooks/use-api";

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

export default function CreateOrderDrawer({
  open,
  onClose,
  onCreated,
  statuses,
  fields,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  statuses: BoardStatus[];
  fields: BoardField[];
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawClients } = useApi<any[]>(open ? "/api/clients" : null);
  const clients: ClientOption[] = (rawClients ?? []).map((c: { id: string; name: string; email: string }) => ({
    id: c.id,
    name: c.name,
    email: c.email,
  }));

  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [clientId, setClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [statusId, setStatusId] = useState("");
  const [priority, setPriority] = useState("normal");
  const [deadline, setDeadline] = useState("");
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setMode("existing");
    setClientId("");
    setNewClientName("");
    setNewClientEmail("");
    setTitle("");
    setAmount("");
    setStatusId("");
    setPriority("normal");
    setDeadline("");
    setCustomValues({});
    setError("");
  };

  const handleSubmit = async () => {
    if (!title || !amount) {
      setError("Titre et montant requis");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let finalClientId = clientId;

      // Create new client if needed
      if (mode === "new") {
        if (!newClientName || !newClientEmail) {
          setError("Nom et email du client requis");
          setSaving(false);
          return;
        }
        const newClient = await apiFetch<{ id: string }>("/api/clients", {
          method: "POST",
          body: { name: newClientName, email: newClientEmail },
        });
        finalClientId = newClient.id;
      }

      if (!finalClientId) {
        setError("Selectionnez ou creez un client");
        setSaving(false);
        return;
      }

      // Find status slug from statusId
      const statusObj = statuses.find((s) => s.id === statusId);

      await apiFetch("/api/orders", {
        method: "POST",
        body: {
          client_id: finalClientId,
          title,
          amount: Number(amount),
          status: statusObj?.slug || "new",
          status_id: statusId || undefined,
          priority,
          deadline: deadline || undefined,
          custom_fields: Object.keys(customValues).length > 0 ? customValues : undefined,
        },
      });

      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  // Set default status when statuses load
  if (statuses.length > 0 && !statusId) {
    setStatusId(statuses[0].id);
  }

  return (
    <AnimatePresence>
      {open && (
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
              <h2 className="text-[16px] font-semibold text-[#191919]">Nouvelle commande</h2>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#F7F7F5] transition-colors cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Client section */}
              <div>
                <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-2">Client</div>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setMode("existing")}
                    className={`text-[12px] px-2.5 py-1 rounded-md cursor-pointer ${mode === "existing" ? "bg-[#EEF2FF] text-[#4F46E5] font-medium" : "text-[#8A8A88]"}`}
                  >
                    Client existant
                  </button>
                  <button
                    onClick={() => setMode("new")}
                    className={`text-[12px] px-2.5 py-1 rounded-md cursor-pointer ${mode === "new" ? "bg-[#EEF2FF] text-[#4F46E5] font-medium" : "text-[#8A8A88]"}`}
                  >
                    Nouveau client
                  </button>
                </div>

                {mode === "existing" ? (
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 cursor-pointer"
                  >
                    <option value="">Selectionner un client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Nom du client"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30"
                    />
                    <input
                      type="email"
                      placeholder="Email du client"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30"
                    />
                  </div>
                )}
              </div>

              <div className="h-px bg-[#E6E6E4]" />

              {/* Title */}
              <div>
                <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Titre</label>
                <input
                  type="text"
                  placeholder="Ex: Logo redesign, Montage video..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Montant (EUR)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30"
                />
              </div>

              {/* Status + Priority row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Statut</label>
                  <select
                    value={statusId}
                    onChange={(e) => setStatusId(e.target.value)}
                    className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 cursor-pointer"
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Priorite</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 cursor-pointer"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 cursor-pointer"
                />
              </div>

              {/* Custom fields */}
              {fields.length > 0 && (
                <>
                  <div className="h-px bg-[#E6E6E4]" />
                  <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">Proprietes</div>
                  {fields.map((field) => (
                    <div key={field.id}>
                      <label className="text-[12px] font-medium text-[#5A5A58] mb-1 block">
                        {field.label} {field.isRequired && <span className="text-red-400">*</span>}
                      </label>
                      {renderFieldInput(field, customValues[field.key], (val) =>
                        setCustomValues((prev) => ({ ...prev, [field.key]: val }))
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Error */}
              {error && <p className="text-[13px] text-red-500">{error}</p>}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full bg-[#4F46E5] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Creation..." : "Creer la commande"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function renderFieldInput(
  field: BoardField,
  value: unknown,
  onChange: (val: unknown) => void,
) {
  const cls = "w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30";

  switch (field.fieldType) {
    case "text":
    case "url":
      return (
        <input
          type={field.fieldType === "url" ? "url" : "text"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.label}
          className={cls}
        />
      );
    case "number":
    case "money":
      return (
        <input
          type="number"
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          placeholder="0"
          className={cls}
        />
      );
    case "date":
      return (
        <input
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${cls} cursor-pointer`}
        />
      );
    case "boolean":
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-[#E6E6E4] text-[#4F46E5] focus:ring-[#4F46E5]/20"
          />
          <span className="text-[13px] text-[#5A5A58]">{field.label}</span>
        </label>
      );
    case "select":
      return (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${cls} cursor-pointer`}
        >
          <option value="">Selectionner...</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    case "multi_select":
      return (
        <div className="flex flex-wrap gap-1.5">
          {field.options.map((opt) => {
            const selected = Array.isArray(value) && (value as string[]).includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const arr = Array.isArray(value) ? [...(value as string[])] : [];
                  onChange(selected ? arr.filter((v) => v !== opt) : [...arr, opt]);
                }}
                className={`text-[11px] px-2 py-1 rounded-md border cursor-pointer ${
                  selected ? "bg-[#EEF2FF] border-[#4F46E5]/30 text-[#4F46E5]" : "border-[#E6E6E4] text-[#8A8A88]"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    default:
      return null;
  }
}
