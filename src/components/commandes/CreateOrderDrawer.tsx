"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";

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

  // Core fields
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [clientId, setClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Freelance fields
  const [category, setCategory] = useState("");
  const [briefing, setBriefing] = useState("");
  const [resourceLinks, setResourceLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [externalRef, setExternalRef] = useState("");

  // UI
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showMore, setShowMore] = useState(false);
  const briefingRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize briefing textarea
  useEffect(() => {
    if (briefingRef.current) {
      briefingRef.current.style.height = "auto";
      briefingRef.current.style.height = briefingRef.current.scrollHeight + "px";
    }
  }, [briefing]);

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
    setBriefing("");
    setResourceLinks([]);
    setNewLink("");
    setExternalRef("");
    setError("");
    setShowMore(false);
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

  const handleSubmit = async () => {
    if (!title || !amount) {
      setError("Titre et montant requis");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let finalClientId = clientId;

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: Record<string, any> = {
        client_id: finalClientId,
        title,
        amount: Number(amount),
        status: "new",
        priority: "normal",
        deadline: deadline || undefined,
        quantity,
        category: category || undefined,
        briefing: briefing || undefined,
        resources: resourceLinks.length > 0 ? resourceLinks : undefined,
        external_ref: externalRef || undefined,
      };

      const result = await apiFetch<unknown>("/api/orders", {
        method: "POST",
        body: payload,
      });

      const created = Array.isArray(result) ? result.length : 1;
      toast.success(created > 1 ? `${created} commandes creees` : "Commande creee");

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
            {/* Header — sticky */}
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
                    <input type="text" placeholder="Nom du client" value={newClientName} onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30" />
                    <input type="email" placeholder="Email du client" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)}
                      className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30" />
                  </div>
                )}
              </div>

              <div className="h-px bg-[#E6E6E4]" />

              {/* Title */}
              <div>
                <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Titre</label>
                <input type="text" placeholder="Ex: Logo redesign, Montage video..."
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30" />
              </div>

              {/* Amount + Quantity row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Montant (EUR)</label>
                  <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30" />
                </div>
                <div className="w-[140px]">
                  <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Quantite</label>
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
                  {quantity} commandes seront creees : &ldquo;{title || "..."} (1/{quantity})&rdquo; a &ldquo;({quantity}/{quantity})&rdquo;
                </p>
              )}

              {/* Deadline + Category row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Deadline</label>
                  <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                    className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 cursor-pointer" />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Categorie</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 cursor-pointer">
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggle more options */}
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
                  {/* Briefing */}
                  <div>
                    <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Briefing</label>
                    <textarea
                      ref={briefingRef}
                      value={briefing}
                      onChange={(e) => setBriefing(e.target.value)}
                      placeholder="Exigences, style, consignes, inspirations...&#10;Ex: Style minimaliste, couleurs chaudes, format 1920x1080"
                      rows={3}
                      className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30 resize-none transition-all"
                    />
                  </div>

                  {/* Resource links */}
                  <div>
                    <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Ressources (liens)</label>
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

                  {/* External ref */}
                  <div>
                    <label className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5 block">Reference externe</label>
                    <input type="text" value={externalRef} onChange={(e) => setExternalRef(e.target.value)}
                      placeholder="ID Notion, Trello, ref client..."
                      className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30" />
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
                {saving
                  ? "Creation..."
                  : quantity > 1
                    ? `Creer ${quantity} commandes`
                    : "Creer la commande"
                }
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
