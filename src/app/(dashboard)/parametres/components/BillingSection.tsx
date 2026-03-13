"use client";

import type { SettingsForm, SettingsFormActions } from "./shared";
import { SectionCard, inputCls, labelCls, selectCls, CURRENCIES } from "./shared";

export function BillingSection({ form, actions, dirty }: {
  form: SettingsForm;
  actions: SettingsFormActions;
  dirty: boolean;
}) {
  const ws = form.workspace;
  const set = (patch: Partial<typeof ws>) => { actions.updateWorkspace(patch); actions.markDirty("facturation"); };

  return (
    <SectionCard id="facturation" title="Facturation" description="Paramètres par défaut pour vos factures et devis." dirty={dirty}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Devise par défaut</label>
            <select value={ws.defaultCurrency || "EUR"} onChange={e => set({ defaultCurrency: e.target.value })} className={selectCls}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Taux de TVA (%)</label>
            <input type="number" min={0} max={100} step={0.1} value={ws.defaultTaxRate ?? 20} onChange={e => set({ defaultTaxRate: parseFloat(e.target.value) || 0 })} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Délai de paiement (jours)</label>
            <select value={ws.paymentTermsDays ?? 30} onChange={e => set({ paymentTermsDays: parseInt(e.target.value) })} className={selectCls}>
              <option value={0}>Immédiat</option>
              <option value={7}>7 jours</option>
              <option value={14}>14 jours</option>
              <option value={30}>30 jours</option>
              <option value={45}>45 jours</option>
              <option value={60}>60 jours</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Préfixe de facture</label>
            <input type="text" value={ws.invoicePrefix || ""} onChange={e => set({ invoicePrefix: e.target.value })} className={inputCls} placeholder="FAC-" />
          </div>
        </div>

        <div className="h-px bg-[#F0F0EE]" />

        <div>
          <label className={labelCls}>Mention légale (bas de facture)</label>
          <textarea
            rows={3}
            value={ws.legalMention || ""}
            onChange={e => set({ legalMention: e.target.value })}
            className={inputCls + " resize-none"}
            placeholder="Ex: TVA non applicable, art. 293 B du CGI"
          />
          <p className="text-[11px] text-[#C4C4C2] mt-1">Apparaît en bas de chaque facture générée.</p>
        </div>
      </div>
    </SectionCard>
  );
}
