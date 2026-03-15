"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSite } from "@/lib/hooks/use-site";
import { validateSubdomain, normalizeSubdomain } from "@/lib/validate-subdomain";

type CheckStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "reserved";
type SaveState = "idle" | "saving" | "saved" | "error";

const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "jestly.fr";

// ── Inline SVG icons ──────────────────────────────────────────────
function IconCheck({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconExternalLink({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
function IconCopy({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function IconGlobe({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function IconLock({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconEdit({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconShield({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconZap({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconStar({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function Spinner({ size = 14 }: { size?: number }) {
  return <span className="inline-block border-2 border-current border-t-transparent rounded-full animate-spin" style={{ width: size, height: size }} />;
}

// ── Status badge component ────────────────────────────────────────
function StatusRow({ icon, label, status, color }: { icon: React.ReactNode; label: string; status: string; color: "green" | "amber" | "gray" }) {
  const colors = {
    green: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    gray: "text-[#8A8A88] bg-[#F7F7F5]",
  };
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-[13px] text-[#5A5A58]">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors[color]}`}>
        {status}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function SiteDomainePage() {
  const { site, siteId, mutate, loading, error: providerError } = useSite();
  const serverSlug = site.domain.subdomain;
  const isPublished = site.status === "published";

  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when server data arrives
  useEffect(() => {
    if (serverSlug) {
      setInput(serverSlug);
      setEditing(false);
      setSaveState("idle");
    } else if (!loading) {
      setEditing(true);
    }
  }, [serverSlug, loading]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing) setTimeout(() => inputRef.current?.focus(), 50);
  }, [editing]);

  // ── Availability check (debounced 400ms) ──
  const checkAvailability = useCallback((value: string) => {
    abortRef.current?.abort();
    const n = normalizeSubdomain(value);

    if (!n || n.length < 3) { setCheckStatus("idle"); return; }
    if (n === serverSlug) { setCheckStatus("idle"); return; }

    const v = validateSubdomain(value);
    if (!v.valid) {
      setCheckStatus(v.reason === "reserved" ? "reserved" : "invalid");
      setErrorMsg(v.error);
      return;
    }

    setCheckStatus("checking");
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const checkUrl = `/api/subdomains/check?subdomain=${encodeURIComponent(n)}${siteId ? `&exclude=${encodeURIComponent(siteId)}` : ""}`;
    fetch(checkUrl, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => {
        if (ctrl.signal.aborted) return;
        if (data.available) {
          setCheckStatus("available");
          setErrorMsg("");
        } else {
          const reason = data.reason === "taken" ? "taken" : data.reason === "reserved" ? "reserved" : "invalid";
          setCheckStatus(reason);
          setErrorMsg(
            data.reason === "taken" ? "Cette adresse est déjà prise."
              : data.reason === "reserved" ? "Cette adresse est réservée."
                : "Format invalide."
          );
        }
      })
      .catch(err => { if (err.name !== "AbortError") setCheckStatus("idle"); });
  }, [serverSlug, siteId]);

  const handleInputChange = (raw: string) => {
    const clean = raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setInput(clean);
    setSaveState("idle");
    setErrorMsg("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkAvailability(clean), 400);
  };

  // ── Save / Reserve ──
  const handleSave = async () => {
    if (!siteId) {
      setErrorMsg("Site non chargé. Rechargez la page.");
      setSaveState("error");
      return;
    }

    const v = validateSubdomain(input);
    if (!v.valid) { setErrorMsg(v.error); setSaveState("error"); return; }

    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    setSaveState("saving");
    setErrorMsg("");

    try {
      const url = `/api/sites/${siteId}/subdomain`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: v.normalized }),
      });

      let data: Record<string, string>;
      try { data = await res.json(); } catch { data = {}; }

      if (!res.ok) {
        if (res.status === 401) setErrorMsg("Session expirée, reconnectez-vous.");
        else if (res.status === 409) { setCheckStatus("taken"); setErrorMsg(data.error || "Cette adresse est déjà prise."); }
        else if (res.status === 429) setErrorMsg(data.error || "Trop de modifications. Réessayez demain.");
        else setErrorMsg(data.error || `Erreur serveur (${res.status})`);
        setSaveState("error");
        return;
      }

      setSaveState("saved");
      setCheckStatus("idle");
      await mutate();
    } catch {
      setSaveState("error");
      setErrorMsg("Erreur réseau. Vérifiez votre connexion.");
    }
  };

  const startEditing = () => {
    setEditing(true);
    setInput(serverSlug);
    setSaveState("idle");
    setCheckStatus("idle");
    setErrorMsg("");
  };

  const cancelEditing = () => {
    if (serverSlug) {
      setEditing(false);
      setInput(serverSlug);
      setCheckStatus("idle");
      setErrorMsg("");
      setSaveState("idle");
    }
  };

  // ── Derived state ──
  const normalized = normalizeSubdomain(input);
  const hasChanges = normalized !== serverSlug && normalized.length >= 3;
  const canSave =
    hasChanges &&
    validateSubdomain(input).valid &&
    checkStatus !== "taken" && checkStatus !== "reserved" && checkStatus !== "invalid" &&
    saveState !== "saving";

  const fullUrl = serverSlug ? `https://${baseDomain}/s/${serverSlug}` : "";
  const previewSlug = (editing ? normalized : serverSlug) || "mon-site";

  const handleCopy = () => {
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-6 animate-pulse">
          <div className="h-5 bg-[#F7F7F5] rounded w-48 mb-6" />
          <div className="h-12 bg-[#F7F7F5] rounded-lg mb-4" />
          <div className="h-8 bg-[#F7F7F5] rounded w-64" />
        </div>
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-6 animate-pulse">
          <div className="h-5 bg-[#F7F7F5] rounded w-40 mb-4" />
          <div className="h-8 bg-[#F7F7F5] rounded" />
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (providerError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-6">
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-3">Domaine</h2>
          <div className="flex items-center gap-2.5 p-3.5 bg-red-50 rounded-lg border border-red-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-[13px] text-red-600 font-medium">
              {providerError || "Impossible de charger le site."}
            </span>
          </div>
          <button
            onClick={() => mutate()}
            className="mt-4 text-[13px] font-medium text-[#4F46E5] border border-[#4F46E5]/20 px-4 py-2 rounded-lg hover:bg-[#EEF2FF] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ═══════════════════════════════════════════════════════════════
          CARD 1 — Sous-domaine Jestly
          ═══════════════════════════════════════════════════════════════ */}
      <motion.section
        className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
                <IconGlobe size={16} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Adresse publique Jestly</h2>
                <p className="text-[12px] text-[#8A8A88] mt-0.5">
                  {serverSlug
                    ? "L'adresse publique de votre site"
                    : "Choisissez un identifiant unique pour votre site"}
                </p>
              </div>
            </div>
            {serverSlug && !editing && (
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                isPublished
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-amber-600 bg-amber-50"
              }`}>
                {isPublished ? "En ligne" : "Non publié"}
              </span>
            )}
          </div>
        </div>

        {/* ── Domain preview (always visible) ── */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 p-3 bg-[#F7F7F5] rounded-lg border border-[#EFEFEF]">
            <IconLock size={13} />
            <span className="text-[13px] text-[#8A8A88] select-none">https://{baseDomain}/s/</span>
            <span className={`text-[13px] font-semibold ${serverSlug || (editing && normalized) ? "text-[#1A1A1A]" : "text-[#CCCCCC]"}`}>
              {previewSlug}
            </span>
          </div>
        </div>

        {/* ── Mode lecture ── */}
        {serverSlug && !editing && (
          <div className="px-6 pb-5">
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#5A5A58] border border-[#E6E6E4] px-3 py-1.5 rounded-lg hover:bg-[#F7F7F5] hover:border-[#D6D6D4] transition-colors"
              >
                {copied ? <><IconCheck size={12} /> Copié</> : <><IconCopy size={12} /> Copier le lien</>}
              </button>
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#5A5A58] border border-[#E6E6E4] px-3 py-1.5 rounded-lg hover:bg-[#F7F7F5] hover:border-[#D6D6D4] transition-colors"
              >
                <IconExternalLink size={12} /> Ouvrir le site
              </a>
              <button
                onClick={startEditing}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4F46E5] border border-[#4F46E5]/20 px-3 py-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors ml-auto"
              >
                <IconEdit size={12} /> Modifier
              </button>
            </div>

            {/* Publication hint */}
            {!isPublished && (
              <div className="flex items-start gap-2.5 mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[12px] text-amber-700 leading-relaxed">
                  Votre adresse est réservée, mais votre site n'est pas encore publié.
                  Publiez-le depuis l'éditeur pour le rendre accessible à <strong>{baseDomain}/s/{serverSlug}</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Aucun sous-domaine ── */}
        {!serverSlug && !editing && (
          <div className="px-6 pb-5">
            <button
              onClick={() => { setEditing(true); setInput(""); }}
              className="w-full py-3 rounded-lg text-[13px] font-medium text-[#4F46E5] border-2 border-dashed border-[#4F46E5]/20 hover:border-[#4F46E5]/40 hover:bg-[#EEF2FF]/50 transition-colors"
            >
              Configurer l&apos;adresse du site
            </button>
          </div>
        )}

        {/* ── Mode édition ── */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 space-y-3">
                {/* Input field */}
                <div className={`flex items-center bg-white border rounded-lg overflow-hidden transition-colors ${
                  checkStatus === "available" ? "border-emerald-300 ring-1 ring-emerald-100" :
                  checkStatus === "taken" || checkStatus === "reserved" || checkStatus === "invalid" ? "border-red-300 ring-1 ring-red-100" :
                  "border-[#E6E6E4] focus-within:border-[#4F46E5] focus-within:ring-1 focus-within:ring-[#4F46E5]/10"
                }`}>
                  <span className="px-3 text-[13px] text-[#999] border-r border-[#EFEFEF] py-2.5 select-none bg-[#FAFAFA]">{baseDomain}/s/</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && canSave) handleSave(); if (e.key === "Escape") cancelEditing(); }}
                    placeholder={normalizeSubdomain(site.settings.name) || "mon-site"}
                    maxLength={40}
                    className="flex-1 bg-transparent px-3 py-2.5 text-[13px] text-[#1A1A1A] font-medium focus:outline-none"
                  />
                </div>

                {/* Validation feedback */}
                <AnimatePresence mode="wait">
                  {hasChanges && input.length >= 3 && checkStatus !== "idle" && (
                    <motion.div
                      key={checkStatus}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      {checkStatus === "checking" && (
                        <span className="text-[12px] text-[#8A8A88] flex items-center gap-1.5">
                          <Spinner size={12} /> Vérification de la disponibilité...
                        </span>
                      )}
                      {checkStatus === "available" && (
                        <span className="text-[12px] text-emerald-600 font-medium flex items-center gap-1.5">
                          <IconCheck size={12} /> {baseDomain}/s/{normalized} est disponible
                        </span>
                      )}
                      {(checkStatus === "taken" || checkStatus === "reserved" || checkStatus === "invalid") && (
                        <span className="text-[12px] text-red-500 font-medium flex items-center gap-1.5">
                          <IconX size={12} /> {errorMsg}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Save feedback */}
                <AnimatePresence>
                  {saveState === "saved" && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[12px] text-emerald-600 font-medium flex items-center gap-1.5"
                    >
                      <IconCheck size={12} /> Adresse enregistrée avec succès
                    </motion.div>
                  )}
                  {saveState === "error" && errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[12px] text-red-500 font-medium"
                    >
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={!canSave}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      canSave
                        ? "bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-sm"
                        : "bg-[#F7F7F5] text-[#CCCCCC] cursor-not-allowed border border-[#EFEFEF]"
                    }`}
                  >
                    {saveState === "saving" ? <><Spinner size={12} /> Enregistrement...</> : serverSlug ? "Enregistrer" : "Réserver cette adresse"}
                  </button>
                  {serverSlug && (
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#8A8A88] hover:text-[#1A1A1A] hover:bg-[#F7F7F5] transition-colors"
                    >
                      Annuler
                    </button>
                  )}
                </div>

                {/* Validation rules hint */}
                {!serverSlug && (
                  <p className="text-[11px] text-[#BBBBBB] leading-relaxed">
                    3 à 40 caractères. Lettres minuscules, chiffres et tirets uniquement.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Status strip ── */}
        <div className="border-t border-[#EFEFEF] px-6 py-3 bg-[#FAFAFA]">
          <div className="divide-y divide-[#EFEFEF]">
            <StatusRow
              icon={<IconShield size={13} />}
              label="Certificat SSL"
              status={serverSlug ? "Actif" : "Activé à la réservation"}
              color={serverSlug ? "green" : "gray"}
            />
            <StatusRow
              icon={<IconGlobe size={13} />}
              label="Accessibilité publique"
              status={
                !serverSlug ? "Non configuré"
                : isPublished ? "Accessible" : "En attente de publication"
              }
              color={
                !serverSlug ? "gray"
                : isPublished ? "green" : "amber"
              }
            />
            <StatusRow
              icon={<IconZap size={13} />}
              label="Performances"
              status="CDN global"
              color="green"
            />
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════
          CARD 2 — Domaine personnalisé
          ═══════════════════════════════════════════════════════════════ */}
      <motion.section
        className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06 }}
      >
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <IconStar size={16} />
              </div>
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Domaine personnalisé</h2>
            </div>
            <span className="text-[11px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-full">
              Plan Pro
            </span>
          </div>
          <p className="text-[13px] text-[#8A8A88] mt-2 mb-5 ml-[42px]">
            Connectez votre propre nom de domaine pour une image plus professionnelle.
          </p>

          {/* Feature preview list */}
          <div className="ml-[42px] space-y-2.5 mb-5">
            {[
              "Domaine personnalisé (www.votresite.fr)",
              "Certificat SSL automatique",
              "Redirection www configurée",
              "Configuration DNS guidée",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-[#EFEFEF] flex items-center justify-center">
                  <IconCheck size={9} className="text-[#BBBBBB]" />
                </div>
                <span className="text-[12px] text-[#5A5A58]">{feature}</span>
              </div>
            ))}
          </div>

          {/* Disabled input preview */}
          <div className="ml-[42px]">
            <div className="flex items-center bg-[#FAFAFA] border border-[#EFEFEF] rounded-lg overflow-hidden opacity-50 cursor-not-allowed">
              <span className="px-3 text-[13px] text-[#CCCCCC] border-r border-[#EFEFEF] py-2.5 select-none">https://</span>
              <span className="flex-1 px-3 py-2.5 text-[13px] text-[#CCCCCC]">www.votresite.fr</span>
            </div>
            <p className="text-[11px] text-[#BBBBBB] mt-2">
              Disponible avec le plan Pro à 7 EUR/mois.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
