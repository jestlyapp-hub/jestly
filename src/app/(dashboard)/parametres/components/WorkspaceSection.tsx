"use client";

import { useState, useRef, useCallback } from "react";
import type { SettingsForm, SettingsFormActions } from "./shared";
import {
  SectionCard, SubSection, RequiredBadge, OptionalBadge,
  inputCls, labelCls, selectCls, getInputCls,
  FieldError, FieldSuccess,
  validateUrl, normalizeUrl, validateSiret, validateVat, validatePhone, validateEmail,
} from "./shared";

/* ══════════════════════════════════════════════════════════════════════
   WORKSPACE & BUSINESS SECTION
   ══════════════════════════════════════════════════════════════════════ */

export function WorkspaceSection({ form, actions, dirty }: {
  form: SettingsForm;
  actions: SettingsFormActions;
  dirty: boolean;
}) {
  const ws = form.workspace;
  const set = (patch: Partial<typeof ws>) => { actions.updateWorkspace(patch); actions.markDirty("workspace"); };

  // ── Blur-based validation tracking ──
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  // ── SIRET toggle + scroll ──
  const [showSiret, setShowSiret] = useState(!!ws.siret);
  const siretRef = useRef<HTMLInputElement>(null);

  const handleShowSiret = useCallback(() => {
    setShowSiret(true);
    // Wait for DOM update then scroll + focus
    requestAnimationFrame(() => {
      setTimeout(() => {
        siretRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        siretRef.current?.focus();
      }, 50);
    });
  }, []);

  // ── URL blur handler: normalize + validate ──
  const handleWebsiteBlur = useCallback(() => {
    markTouched("website");
    if (ws.website) {
      set({ website: normalizeUrl(ws.website) });
    }
  }, [ws.website]);

  // ── Validation state helpers ──
  const urlError = touched.website ? validateUrl(ws.website || "") : undefined;
  const emailError = touched.email ? validateEmail(ws.email || "") : undefined;
  const phoneError = touched.phone ? validatePhone(ws.phone || "") : undefined;
  const siretError = touched.siret ? validateSiret(ws.siret || "") : undefined;
  const vatError = touched.vatNumber ? validateVat(ws.vatNumber || "") : undefined;

  return (
    <SectionCard
      id="workspace"
      title="Workspace & Business"
      description="Votre identité professionnelle — utilisée dans la facturation et les exports."
      dirty={dirty}
    >
      <div className="space-y-7">

        {/* ─────────────── IDENTITÉ ─────────────── */}
        <SubSection label="Identité" description="Informations visibles sur vos factures et devis" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>
              Nom commercial
              <RequiredBadge />
            </label>
            <input
              type="text"
              value={form.businessName}
              onChange={e => { actions.setBusinessName(e.target.value); actions.markDirty("workspace"); }}
              onBlur={() => markTouched("businessName")}
              className={getInputCls(form.businessName, !form.businessName && touched.businessName ? "requis" : undefined, touched.businessName)}
              placeholder="Studio, agence, marque..."
            />
            <FieldError message={!form.businessName && touched.businessName ? "Le nom commercial est requis" : undefined} />
            <FieldSuccess message="Parfait" show={!!form.businessName && !!touched.businessName} />
          </div>

          <div>
            <label className={labelCls}>
              Site web
              <OptionalBadge />
            </label>
            <input
              type="text"
              value={ws.website || ""}
              onChange={e => set({ website: e.target.value })}
              onBlur={handleWebsiteBlur}
              className={getInputCls(ws.website || "", urlError, touched.website)}
              placeholder="monsite.fr"
            />
            <FieldError message={urlError} />
            <FieldSuccess message="URL valide" show={!!ws.website && !urlError && !!touched.website} />
          </div>
        </div>

        {/* ─────────────── CONTACT ─────────────── */}
        <SubSection label="Contact" description="Coordonnées professionnelles pour vos clients" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>
              Email professionnel
              <RequiredBadge />
            </label>
            <input
              type="email"
              value={ws.email || ""}
              onChange={e => set({ email: e.target.value })}
              onBlur={() => markTouched("email")}
              className={getInputCls(ws.email || "", emailError, touched.email)}
              placeholder="contact@studio.fr"
            />
            <FieldError message={emailError} />
            <FieldSuccess message="Email valide" show={!!ws.email && !emailError && !!touched.email} />
          </div>

          <div>
            <label className={labelCls}>
              Téléphone professionnel
              <OptionalBadge />
            </label>
            <input
              type="tel"
              value={ws.phone || ""}
              onChange={e => set({ phone: e.target.value })}
              onBlur={() => markTouched("phone")}
              className={getInputCls(ws.phone || "", phoneError, touched.phone)}
              placeholder="+33 1 23 45 67 89"
            />
            <FieldError message={phoneError} />
            <FieldSuccess message="Numéro valide" show={!!ws.phone && !phoneError && !!touched.phone} />
          </div>
        </div>

        {/* ─────────────── ADRESSE ─────────────── */}
        <SubSection label="Adresse" description="Utilisée pour vos factures et exports clients" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className={labelCls}>
              Adresse
              <RequiredBadge />
            </label>
            <input
              type="text"
              value={ws.address || ""}
              onChange={e => set({ address: e.target.value })}
              onBlur={() => markTouched("address")}
              className={getInputCls(ws.address || "", !ws.address && touched.address ? "requis" : undefined, touched.address)}
              placeholder="12 rue de la Paix"
            />
            <FieldError message={!ws.address && touched.address ? "L'adresse est requise pour la facturation" : undefined} />
          </div>

          <div>
            <label className={labelCls}>Code postal</label>
            <input
              type="text"
              value={ws.postalCode || ""}
              onChange={e => set({ postalCode: e.target.value })}
              className={inputCls}
              placeholder="75001"
            />
          </div>

          <div>
            <label className={labelCls}>Ville</label>
            <input
              type="text"
              value={ws.city || ""}
              onChange={e => set({ city: e.target.value })}
              className={inputCls}
              placeholder="Paris"
            />
          </div>

          <div>
            <label className={labelCls}>Pays</label>
            <select value={ws.country || "FR"} onChange={e => set({ country: e.target.value })} className={selectCls}>
              <option value="FR">France</option>
              <option value="BE">Belgique</option>
              <option value="CH">Suisse</option>
              <option value="CA">Canada</option>
              <option value="LU">Luxembourg</option>
              <option value="US">États-Unis</option>
              <option value="GB">Royaume-Uni</option>
              <option value="DE">Allemagne</option>
            </select>
          </div>
        </div>

        {/* ─────────────── FACTURATION ─────────────── */}
        <SubSection label="Identifiants légaux" description="SIRET et TVA — requis uniquement si applicable à votre statut" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {showSiret ? (
            <div>
              <label className={labelCls}>
                SIRET
                <OptionalBadge />
              </label>
              <input
                ref={siretRef}
                type="text"
                value={ws.siret || ""}
                onChange={e => set({ siret: e.target.value })}
                onBlur={() => markTouched("siret")}
                className={getInputCls(ws.siret || "", siretError, touched.siret)}
                placeholder="123 456 789 00012"
              />
              <FieldError message={siretError} />
              <FieldSuccess message="SIRET valide" show={!!ws.siret && !siretError && !!touched.siret} />
            </div>
          ) : (
            <div>
              <label className={labelCls}>SIRET</label>
              <button
                type="button"
                onClick={handleShowSiret}
                className="w-full h-[44px] rounded-xl border border-dashed border-[#D6D3D1] text-[13px] text-[#78716C] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] hover:bg-[#EEF2FF]/50 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="text-[15px]">+</span>
                Ajouter un SIRET
              </button>
            </div>
          )}

          <div>
            <label className={labelCls}>
              N° TVA intracommunautaire
              <OptionalBadge />
            </label>
            <input
              type="text"
              value={ws.vatNumber || ""}
              onChange={e => set({ vatNumber: e.target.value })}
              onBlur={() => markTouched("vatNumber")}
              className={getInputCls(ws.vatNumber || "", vatError, touched.vatNumber)}
              placeholder="FR12345678901"
            />
            <FieldError message={vatError} />
            <FieldSuccess message="N° TVA valide" show={!!ws.vatNumber && !vatError && !!touched.vatNumber} />
          </div>
        </div>

      </div>
    </SectionCard>
  );
}
