"use client";

import type { SettingsForm, SettingsFormActions } from "./shared";
import { SectionCard, inputCls, labelCls, selectCls, FieldError, validateUrl, validateSiret, validateVat, validatePhone, validateEmail } from "./shared";

export function WorkspaceSection({ form, actions, dirty }: {
  form: SettingsForm;
  actions: SettingsFormActions;
  dirty: boolean;
}) {
  const ws = form.workspace;
  const set = (patch: Partial<typeof ws>) => { actions.updateWorkspace(patch); actions.markDirty("workspace"); };

  return (
    <SectionCard id="workspace" title="Workspace & Business" description="Votre identité professionnelle — utilisée dans la facturation et les exports." dirty={dirty}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nom commercial</label>
            <input type="text" value={form.businessName} onChange={e => { actions.setBusinessName(e.target.value); actions.markDirty("workspace"); }} className={inputCls} placeholder="Studio, agence, marque..." />
          </div>
          <div>
            <label className={labelCls}>Site web</label>
            <input type="url" value={ws.website || ""} onChange={e => set({ website: e.target.value })} className={inputCls} placeholder="https://monsite.fr" />
            <FieldError message={validateUrl(ws.website || "")} />
          </div>
          <div>
            <label className={labelCls}>Email professionnel</label>
            <input type="email" value={ws.email || ""} onChange={e => set({ email: e.target.value })} className={inputCls} placeholder="contact@studio.fr" />
            <FieldError message={validateEmail(ws.email || "")} />
          </div>
          <div>
            <label className={labelCls}>Téléphone professionnel</label>
            <input type="tel" value={ws.phone || ""} onChange={e => set({ phone: e.target.value })} className={inputCls} placeholder="+33 1 23 45 67 89" />
            <FieldError message={validatePhone(ws.phone || "")} />
          </div>
        </div>

        <div className="h-px bg-[#F0F0EE]" />
        <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">Adresse</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Adresse</label>
            <input type="text" value={ws.address || ""} onChange={e => set({ address: e.target.value })} className={inputCls} placeholder="12 rue de la Paix" />
          </div>
          <div>
            <label className={labelCls}>Code postal</label>
            <input type="text" value={ws.postalCode || ""} onChange={e => set({ postalCode: e.target.value })} className={inputCls} placeholder="75001" />
          </div>
          <div>
            <label className={labelCls}>Ville</label>
            <input type="text" value={ws.city || ""} onChange={e => set({ city: e.target.value })} className={inputCls} placeholder="Paris" />
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

        <div className="h-px bg-[#F0F0EE]" />
        <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">Identifiants légaux</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>SIRET</label>
            <input type="text" value={ws.siret || ""} onChange={e => set({ siret: e.target.value })} className={inputCls} placeholder="123 456 789 00012" />
            <FieldError message={validateSiret(ws.siret || "")} />
          </div>
          <div>
            <label className={labelCls}>N° TVA intracommunautaire</label>
            <input type="text" value={ws.vatNumber || ""} onChange={e => set({ vatNumber: e.target.value })} className={inputCls} placeholder="FR12345678901" />
            <FieldError message={validateVat(ws.vatNumber || "")} />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
