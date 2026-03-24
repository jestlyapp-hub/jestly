"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import LineItemsEditor, { type LineItemDraft } from "./LineItemsEditor";

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

const CATEGORIES = [
  { value: "", label: "Aucune" },
  { value: "miniature", label: "Miniature" },
  { value: "montage", label: "Montage" },
  { value: "design", label: "Design" },
  { value: "logo", label: "Logo" },
  { value: "illustration", label: "Illustration" },
  { value: "autre", label: "Autre" },
];

const PRIORITIES = [
  { value: "low", label: "Basse" },
  { value: "normal", label: "Normale" },
  { value: "high", label: "Haute" },
  { value: "urgent", label: "Urgente" },
];

const INPUT = "w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30";
const LABEL = "text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block";

export default function CreateOrderDrawer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawClients } = useApi<any[]>(open ? "/api/clients" : null);
  const clients: ClientOption[] = (rawClients ?? []).map((c: { id: string; name: string; email: string }) => ({
    id: c.id, name: c.name, email: c.email,
  }));

  // ── Core fields ──
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [clientId, setClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("");

  // ── Advanced pricing ──
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);
  const [splitMode, setSplitMode] = useState<"grouped" | "split">("grouped");
  const [discount, setDiscount] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [priority, setPriority] = useState("normal");
  const [internalNotes, setInternalNotes] = useState("");
  const [source, setSource] = useState("");

  // ── Existing "Plus d'options" ──
  const [showMore, setShowMore] = useState(false);
  const [briefing, setBriefing] = useState("");
  const [resourceLinks, setResourceLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [externalRef, setExternalRef] = useState("");

  // ── UI state ──
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const briefingRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize briefing textarea
  useEffect(() => {
    if (briefingRef.current) {
      briefingRef.current.style.height = "auto";
      briefingRef.current.style.height = briefingRef.current.scrollHeight + "px";
    }
  }, [briefing]);

  // ── Computed totals ──
  const hasLineItems = lineItems.length > 0;
  const computedTotal = useMemo(() => {
    if (!hasLineItems) return null;
    const subtotal = lineItems.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    return Math.max(0, subtotal - discount);
  }, [lineItems, discount, hasLineItems]);

  // When line items are used, override the amount display
  const displayAmount = hasLineItems ? (computedTotal ?? 0).toFixed(2) : amount;

  const reset = () => {
    setMode("existing");
    setClientId("");
    setNewClientName("");
    setNewClientEmail("");
    setTitle("");
    setAmount("");
    setDeadline("");
    setQuantity(1);
    setCategory("");
    setShowAdvanced(false);
    setSplitMode("grouped");
    setLineItems([]);
    setDiscount(0);
    setDeposit(0);
    setPriority("normal");
    setInternalNotes("");
    setSource("");
    setShowMore(false);
    setBriefing("");
    setResourceLinks([]);
    setNewLink("");
    setExternalRef("");
    setError("");
  };

  const addLink = () => {
    const link = newLink.trim();
    if (!link) return;
    setResourceLinks((prev) => [...prev, link]);
    setNewLink("");
  };

  const removeLink = (idx: number) => {
    setResourceLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  const isValidUrl = (s: string) => {
    try { new URL(s); return true; } catch { return false; }
  };

  // ── Submit ──
  const handleSubmit = async () => {
    // Validation
    if (!title) {
      setError("Titre requis");
      return;
    }
    if (hasLineItems) {
      const emptyLabel = lineItems.some((it) => !it.label.trim());
      if (emptyLabel) {
        setError("Chaque prestation doit avoir un nom");
        return;
      }
      const zeroPrice = lineItems.some((it) => it.unitPrice <= 0);
      if (zeroPrice) {
        setError("Chaque prestation doit avoir un prix");
        return;
      }
    } else if (!amount || Number(amount) < 0) {
      setError("Montant requis");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let finalClientId = clientId;

      if (mode === "new") {
        if (!newClientName) {
          setError("Nom du client requis");
          setSaving(false);
          return;
        }
        try {
          const newClient = await apiFetch<{ id: string }>("/api/clients", {
            method: "POST",
            body: { name: newClientName, email: newClientEmail || undefined },
          });
          finalClientId = newClient.id;
        } catch (clientErr) {
          const msg = clientErr instanceof Error ? clientErr.message : "";
          if (msg.includes("duplicate")) {
            try {
              const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newClientName, email: newClientEmail || undefined }),
              });
              if (res.status === 409) {
                const body = await res.json();
                if (body.existingClientId) {
                  finalClientId = body.existingClientId;
                } else {
                  throw new Error("Client avec cet email existe déjà");
                }
              }
            } catch {
              throw new Error("Client avec cet email existe déjà");
            }
          } else {
            throw clientErr;
          }
        }
      }

      if (!finalClientId) {
        setError("Sélectionnez ou créez un client");
        setSaving(false);
        return;
      }

      // Build payload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: Record<string, any> = {
        client_id: finalClientId,
        title,
        status: "new",
        priority,
        deadline: deadline || undefined,
        quantity,
        category: category || undefined,
        briefing: briefing || undefined,
        resources: resourceLinks.length > 0 ? resourceLinks : undefined,
        external_ref: externalRef || undefined,
      };

      if (hasLineItems && splitMode === "split") {
        // ── Mode séparé : une commande par ligne × quantité ──
        payload.split_items = lineItems.map((it) => ({
          label: it.label,
          description: it.description || undefined,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        }));
        if (internalNotes || source) {
          payload.custom_fields = {
            ...(internalNotes && { internal_notes: internalNotes }),
            ...(source && { source }),
          };
        }
        // Amount placeholder (overridden per item by backend)
        payload.amount = 0;
      } else if (hasLineItems) {
        // ── Mode groupé : une commande avec détail des prestations ──
        payload.items = lineItems.map((it) => ({
          label: it.label,
          description: it.description || undefined,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        }));
        payload.custom_fields = {
          ...(discount > 0 && { discount }),
          ...(deposit > 0 && { deposit }),
          ...(internalNotes && { internal_notes: internalNotes }),
          ...(source && { source }),
          pricing_mode: "advanced",
        };
        payload.amount = computedTotal;
      } else {
        // ── Mode simple ──
        payload.amount = Number(amount);
        if (internalNotes || source) {
          payload.custom_fields = {
            ...(internalNotes && { internal_notes: internalNotes }),
            ...(source && { source }),
          };
        }
      }

      const result = await apiFetch<unknown>("/api/orders", {
        method: "POST",
        body: payload,
      });

      const created = Array.isArray(result) ? result.length : 1;
      toast.success(created > 1 ? `${created} commandes créées` : "Commande créée");

      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

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
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white border-l border-[#E6E6E4] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E6E4] flex-shrink-0">
              <h2 className="text-[16px] font-semibold text-[#191919]">Nouvelle commande</h2>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#F7F7F5] transition-colors cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* ── Client section ── */}
              <div>
                <div className={LABEL} style={{ marginBottom: "8px" }}>Client</div>
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
                    className={`${INPUT} cursor-pointer`}
                  >
                    <option value="">Sélectionner un client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input type="text" placeholder="Nom du client" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className={INPUT} />
                    <input type="email" placeholder="Email du client" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} className={INPUT} />
                  </div>
                )}
              </div>

              <div className="h-px bg-[#E6E6E4]" />

              {/* ── Title ── */}
              <div>
                <label className={LABEL}>Titre</label>
                <input type="text" placeholder="Ex: Logo redesign, Montage video..."
                  value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT} />
              </div>

              {/* ── Amount + Quantity ── */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={LABEL}>
                    Montant (EUR)
                    {hasLineItems && (
                      <span className="ml-1.5 text-[9px] font-medium text-[#4F46E5] bg-[#EEF2FF] px-1.5 py-0.5 rounded-full normal-case tracking-normal">
                        calculé
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={displayAmount}
                    onChange={(e) => !hasLineItems && setAmount(e.target.value)}
                    readOnly={hasLineItems}
                    min={0}
                    className={`${INPUT} tabular-nums ${hasLineItems ? "bg-[#EFEFEF] text-[#5A5A58] cursor-default" : ""}`}
                  />
                </div>
                <div className="w-[140px]">
                  <label className={LABEL}>Quantité</label>
                  <div className="flex items-center bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2.5 py-2 text-[#5A5A58] hover:bg-[#EFEFEF] transition-colors cursor-pointer text-[15px] font-medium"
                    >
                      -
                    </button>
                    <input
                      type="number" min={1} max={50} value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                      className="w-full text-center text-[13px] bg-transparent border-0 py-2 text-[#191919] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                      className="px-2.5 py-2 text-[#5A5A58] hover:bg-[#EFEFEF] transition-colors cursor-pointer text-[15px] font-medium"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {quantity > 1 && (
                <p className="text-[11px] text-[#8A8A88] -mt-2">
                  {quantity} commandes seront créées : &ldquo;{title || "..."} (1/{quantity})&rdquo; à &ldquo;({quantity}/{quantity})&rdquo;
                </p>
              )}

              {/* ── Deadline + Category ── */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={LABEL}>Deadline</label>
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                    className={`${INPUT} cursor-pointer`} />
                </div>
                <div className="flex-1">
                  <label className={LABEL}>Catégorie</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className={`${INPUT} cursor-pointer`}>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ═══════════════════════════════════════════
                  SECTION AVANCÉE — Détail des prestations
                  ═══════════════════════════════════════════ */}
              <div className="border border-[#E6E6E4] rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#FBFBFA] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={showAdvanced ? "#4F46E5" : "#8A8A88"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className={`text-[13px] font-medium ${showAdvanced ? "text-[#4F46E5]" : "text-[#5A5A58]"}`}>
                      Détail des prestations
                    </span>
                    {hasLineItems && (
                      <span className="text-[9px] font-bold text-[#4F46E5] bg-[#EEF2FF] px-1.5 py-0.5 rounded-full">
                        {lineItems.length} ligne{lineItems.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#BBB]">Lignes de prix, remise, acompte</span>
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 space-y-4 border-t border-[#EFEFEF]">
                        {/* Mode selector — groupé vs séparé */}
                        {lineItems.length > 0 && (
                          <div>
                            <label className={LABEL}>Mode de création</label>
                            <div className="flex rounded-lg border border-[#E6E6E4] overflow-hidden">
                              <button
                                onClick={() => setSplitMode("grouped")}
                                className={`flex-1 text-[12px] py-2 px-3 transition-colors cursor-pointer ${
                                  splitMode === "grouped"
                                    ? "bg-[#4F46E5] text-white font-medium"
                                    : "bg-white text-[#5A5A58] hover:bg-[#FBFBFA]"
                                }`}
                              >
                                Commande groupée
                              </button>
                              <button
                                onClick={() => setSplitMode("split")}
                                className={`flex-1 text-[12px] py-2 px-3 border-l border-[#E6E6E4] transition-colors cursor-pointer ${
                                  splitMode === "split"
                                    ? "bg-[#4F46E5] text-white font-medium"
                                    : "bg-white text-[#5A5A58] hover:bg-[#FBFBFA]"
                                }`}
                              >
                                Commandes séparées
                              </button>
                            </div>
                            <p className="text-[10px] text-[#BBB] mt-1.5 leading-relaxed">
                              {splitMode === "grouped"
                                ? "Crée une seule commande avec le détail des prestations."
                                : "Crée une commande distincte pour chaque prestation × quantité."}
                            </p>
                          </div>
                        )}

                        {/* Aide contextuelle */}
                        {lineItems.length === 0 && (
                          <p className="text-[11px] text-[#BBB] leading-relaxed">
                            Ajoutez des lignes pour détailler vos prestations. Le montant total sera calculé automatiquement.
                          </p>
                        )}

                        {/* Line items editor */}
                        <LineItemsEditor
                          items={lineItems}
                          onChange={setLineItems}
                          discount={splitMode === "split" ? 0 : discount}
                          onDiscountChange={splitMode === "split" ? () => {} : setDiscount}
                          deposit={splitMode === "split" ? 0 : deposit}
                          onDepositChange={splitMode === "split" ? () => {} : setDeposit}
                          hideFinancials={splitMode === "split"}
                        />

                        <div className="h-px bg-[#EFEFEF]" />

                        {/* Priority */}
                        <div>
                          <label className={LABEL}>Priorité</label>
                          <div className="flex gap-1.5">
                            {PRIORITIES.map((p) => (
                              <button
                                key={p.value}
                                onClick={() => setPriority(p.value)}
                                className={`flex-1 text-[11px] py-1.5 rounded-md border transition-colors cursor-pointer ${
                                  priority === p.value
                                    ? "bg-[#EEF2FF] border-[#4F46E5]/30 text-[#4F46E5] font-medium"
                                    : "bg-white border-[#E6E6E4] text-[#8A8A88] hover:border-[#D5D5D3]"
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notes internes */}
                        <div>
                          <label className={LABEL}>Notes internes</label>
                          <textarea
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            placeholder="Notes visibles uniquement par vous..."
                            rows={2}
                            className={`${INPUT} resize-none`}
                          />
                        </div>

                        {/* Source */}
                        <div>
                          <label className={LABEL}>Source / Canal</label>
                          <input
                            type="text"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder="Instagram, bouche-à-oreille, site web..."
                            className={INPUT}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Plus d'options (existing: briefing, resources, ref) ── */}
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-1.5 text-[12px] text-[#8A8A88] hover:text-[#5A5A58] transition-colors cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform ${showMore ? "rotate-90" : ""}`}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                {showMore ? "Moins d'options" : "Plus d'options (briefing, ressources, ref...)"}
              </button>

              {showMore && (
                <div className="space-y-5">
                  <div>
                    <label className={LABEL}>Briefing</label>
                    <textarea
                      ref={briefingRef}
                      value={briefing}
                      onChange={(e) => setBriefing(e.target.value)}
                      placeholder={"Exigences, style, consignes, inspirations...\nEx: Style minimaliste, couleurs chaudes, format 1920x1080"}
                      rows={3}
                      className={`${INPUT} resize-none transition-all`}
                    />
                  </div>

                  <div>
                    <label className={LABEL}>Ressources (liens)</label>
                    {resourceLinks.length > 0 && (
                      <div className="space-y-1.5 mb-2">
                        {resourceLinks.map((link, i) => (
                          <div key={i} className="flex items-center gap-2 group">
                            <div className={`flex-1 text-[12px] truncate px-2.5 py-1.5 rounded-md border ${
                              isValidUrl(link) ? "bg-[#F7F7F5] border-[#E6E6E4] text-[#191919]" : "bg-amber-50 border-amber-200 text-amber-700"
                            }`}>
                              {!isValidUrl(link) && <span className="text-[10px] mr-1">&#9888;</span>}
                              {link}
                            </div>
                            <button onClick={() => removeLink(i)}
                              className="opacity-0 group-hover:opacity-100 text-[#8A8A88] hover:text-red-500 transition-all cursor-pointer p-0.5">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input type="text" value={newLink} onChange={(e) => setNewLink(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addLink()}
                        placeholder="https://drive.google.com/... ou texte"
                        className="flex-1 text-[12px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2.5 py-1.5 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30" />
                      <button onClick={addLink} className="text-[11px] font-medium text-[#4F46E5] hover:text-[#4338CA] cursor-pointer whitespace-nowrap">
                        + Ajouter
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>Référence externe</label>
                    <input type="text" value={externalRef} onChange={(e) => setExternalRef(e.target.value)}
                      placeholder="ID Notion, Trello, ref client..."
                      className={INPUT} />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && <p className="text-[13px] text-red-500">{error}</p>}
            </div>

            {/* Footer — sticky */}
            <div className="px-6 py-4 border-t border-[#E6E6E4] flex-shrink-0">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full bg-[#4F46E5] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {(() => {
                  if (saving) return "Création...";
                  if (hasLineItems && splitMode === "split") {
                    const total = lineItems.reduce((s, it) => s + it.quantity, 0);
                    return `Créer ${total} commande${total > 1 ? "s" : ""} séparée${total > 1 ? "s" : ""}`;
                  }
                  if (quantity > 1) return `Créer ${quantity} commandes`;
                  return "Créer la commande";
                })()}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
