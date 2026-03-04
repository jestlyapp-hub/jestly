"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useSite } from "@/lib/hooks/use-site";
import { validateSubdomain, normalizeSubdomain } from "@/lib/validate-subdomain";

type CheckStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "reserved";
type SaveState = "idle" | "saving" | "saved" | "error";

export default function SiteDomainePage() {
  const { site, siteId, mutate, loading, error: providerError } = useSite();
  const serverSlug = site.domain.subdomain;

  const [editing, setEditing] = useState(!serverSlug);
  const [input, setInput] = useState("");
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Quand le server slug arrive/change: sync l'input et le mode
  useEffect(() => {
    if (serverSlug) {
      setInput(serverSlug);
      setEditing(false);
      setSaveState("idle");
    } else if (!loading) {
      setEditing(true);
    }
  }, [serverSlug, loading]);

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
            data.reason === "taken" ? "Ce sous-domaine est déjà pris."
              : data.reason === "reserved" ? "Ce sous-domaine est réservé."
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
      console.error("[Domaine] handleSave: siteId is null!", { loading, providerError });
      setErrorMsg("Site non chargé. Rechargez la page.");
      setSaveState("error");
      return;
    }

    const v = validateSubdomain(input);
    if (!v.valid) { setErrorMsg(v.error); setSaveState("error"); return; }

    // Abort any running availability check
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    setSaveState("saving");
    setErrorMsg("");

    try {
      const url = `/api/sites/${siteId}/subdomain`;
      console.log("[Domaine] POST", url, { subdomain: v.normalized });

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain: v.normalized }),
      });

      console.log("[Domaine] response status:", res.status);

      // Read response body
      let data: Record<string, string>;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      console.log("[Domaine] response data:", data);

      if (!res.ok) {
        if (res.status === 401) {
          setErrorMsg("Session expirée, reconnectez-vous.");
        } else if (res.status === 409) {
          setCheckStatus("taken");
          setErrorMsg(data.error || "Ce sous-domaine est déjà pris.");
        } else if (res.status === 429) {
          setErrorMsg(data.error || "Trop de modifications. Réessayez demain.");
        } else {
          setErrorMsg(data.error || `Erreur serveur (${res.status})`);
        }
        setSaveState("error");
        return;
      }

      // Succès: re-fetch le site entier (source de vérité = server)
      setSaveState("saved");
      setCheckStatus("idle");
      await mutate();
      // Le useEffect [serverSlug] passera en mode "réservé" automatiquement
    } catch (err) {
      console.error("[Domaine] save error:", err);
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
  const clientValid = validateSubdomain(input).valid;
  const canSave =
    hasChanges && clientValid &&
    checkStatus !== "taken" && checkStatus !== "reserved" && checkStatus !== "invalid" &&
    saveState !== "saving";

  const fullUrl = serverSlug ? `https://${serverSlug}.jestly.site` : "";

  const handleCopy = () => {
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-6 animate-pulse">
          <div className="h-5 bg-[#F7F7F5] rounded w-48 mb-4" />
          <div className="h-10 bg-[#F7F7F5] rounded" />
        </div>
      </div>
    );
  }

  // ── Error state: provider failed to load site ──
  if (providerError) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-6">
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-2">Sous-domaine Jestly</h2>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-[13px] text-red-600 font-medium">
              {providerError || "Impossible de charger le site. Rechargez la page."}
            </span>
          </div>
          <button
            onClick={() => mutate()}
            className="mt-3 text-[12px] font-medium text-[#4F46E5] border border-[#4F46E5]/20 px-3 py-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* ── Sous-domaine ── */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Sous-domaine Jestly</h2>
            {serverSlug && (
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Ouvrir le site"
                className="w-8 h-8 rounded-lg border border-[#E6E6E4] flex items-center justify-center text-[#999] hover:text-[#4F46E5] hover:border-[#4F46E5]/30 hover:bg-[#EEF2FF] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>

          {/* ── Mode réservé (non editing) ── */}
          {serverSlug && !editing && (
            <>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 flex items-center bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg overflow-hidden">
                  <span className="px-3 text-[13px] text-[#999] border-r border-[#E6E6E4] py-2.5 select-none">https://</span>
                  <span className="flex-1 px-3 py-2.5 text-[13px] font-medium text-[#1A1A1A]">{serverSlug}</span>
                  <span className="px-3 text-[13px] text-[#999] border-l border-[#E6E6E4] py-2.5 select-none">.jestly.site</span>
                </div>
              </div>

              {/* Badge réservé */}
              <div className="flex items-center gap-1.5 mt-2.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-[12px] text-emerald-600 font-medium">Réservé</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleCopy}
                  className="text-[12px] font-medium text-[#4F46E5] border border-[#4F46E5]/20 px-3 py-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors"
                >
                  {copied ? "Copié !" : "Copier le lien"}
                </button>
                <button
                  onClick={startEditing}
                  className="text-[12px] font-medium text-[#666] border border-[#E6E6E4] px-3 py-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors"
                >
                  Modifier
                </button>
              </div>
            </>
          )}

          {/* ── Mode édition / première réservation ── */}
          {editing && (
            <>
              <p className="text-[12px] text-[#999] mb-4">
                {serverSlug
                  ? "Modifiez l\u2019adresse de votre site."
                  : "Choisissez une adresse unique pour votre site."}
              </p>

              {/* Input */}
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg overflow-hidden focus-within:border-[#4F46E5] transition-colors">
                  <span className="px-3 text-[13px] text-[#999] border-r border-[#E6E6E4] py-2.5 select-none">https://</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={normalizeSubdomain(site.settings.name) || "mon-site"}
                    maxLength={40}
                    autoFocus
                    className="flex-1 bg-transparent px-3 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none"
                  />
                  <span className="px-3 text-[13px] text-[#999] border-l border-[#E6E6E4] py-2.5 select-none">.jestly.site</span>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className={`px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
                    canSave
                      ? "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                      : "bg-[#F7F7F5] text-[#BBB] cursor-not-allowed border border-[#E6E6E4]"
                  }`}
                >
                  {saveState === "saving"
                    ? "Enregistrement..."
                    : serverSlug ? "Enregistrer" : "Réserver"}
                </button>

                {serverSlug && (
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#999] hover:text-[#1A1A1A] hover:bg-[#F7F7F5] transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>

              {/* Check status indicator */}
              {hasChanges && input.length >= 3 && (
                <div className="mt-2.5">
                  {checkStatus === "checking" && (
                    <span className="text-[12px] text-[#999] flex items-center gap-1.5">
                      <span className="w-3 h-3 border-2 border-[#999] border-t-transparent rounded-full animate-spin" />
                      Vérification...
                    </span>
                  )}
                  {checkStatus === "available" && (
                    <span className="text-[12px] text-emerald-600 font-medium flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Disponible
                    </span>
                  )}
                  {(checkStatus === "taken" || checkStatus === "reserved" || checkStatus === "invalid") && (
                    <span className="text-[12px] text-red-500 font-medium flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      {errorMsg}
                    </span>
                  )}
                </div>
              )}

              {/* Save feedback */}
              {saveState === "saved" && (
                <div className="mt-2.5 text-[12px] text-emerald-600 font-medium flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Sous-domaine réservé !
                </div>
              )}
              {saveState === "error" && errorMsg && (
                <div className="mt-2.5 text-[12px] text-red-500 font-medium">{errorMsg}</div>
              )}
            </>
          )}

          {/* SSL badge */}
          <div className="flex items-center gap-2 mt-4 p-3 bg-emerald-50 rounded-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-[12px] text-emerald-600 font-medium">
              {serverSlug ? "SSL actif — Connexion sécurisée" : "SSL actif dès la réservation"}
            </span>
          </div>
        </motion.section>

        {/* ── Domaine personnalisé ── */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Domaine personnalisé</h2>
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Bientôt disponible
            </span>
          </div>
          <p className="text-[13px] text-[#999] mb-4">
            Connectez votre propre nom de domaine pour un rendu plus professionnel.
          </p>
          <input
            type="text"
            placeholder="www.monsite.fr"
            disabled
            className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[13px] text-[#BBB] cursor-not-allowed"
          />
          <p className="text-[11px] text-[#BBB] mt-2">
            Cette fonctionnalité sera disponible avec le plan Pro.
          </p>
        </motion.section>
      </div>
    </div>
  );
}
