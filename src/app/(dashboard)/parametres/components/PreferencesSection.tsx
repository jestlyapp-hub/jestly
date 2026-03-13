"use client";

import type { SettingsForm, SettingsFormActions } from "./shared";
import { SectionCard, labelCls, selectCls, Toggle } from "./shared";

export function PreferencesSection({ form, actions, dirty }: {
  form: SettingsForm;
  actions: SettingsFormActions;
  dirty: boolean;
}) {
  const s = form.settings;
  const set = (patch: Partial<typeof s>) => { actions.updateSettings(patch); actions.markDirty("preferences"); };

  return (
    <SectionCard id="preferences" title="Préférences" description="Personnalisez votre expérience Jestly." dirty={dirty}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Page d&apos;accueil après connexion</label>
            <select value={s.defaultPage || "dashboard"} onChange={e => set({ defaultPage: e.target.value })} className={selectCls}>
              <option value="dashboard">Dashboard</option>
              <option value="commandes">Commandes</option>
              <option value="facturation">Facturation</option>
              <option value="clients">Clients</option>
              <option value="taches">Tâches</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Format de date</label>
            <select value={s.dateFormat || "dd/MM/yyyy"} onChange={e => set({ dateFormat: e.target.value })} className={selectCls}>
              <option value="dd/MM/yyyy">31/12/2025</option>
              <option value="MM/dd/yyyy">12/31/2025</option>
              <option value="yyyy-MM-dd">2025-12-31</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Vue calendrier par défaut</label>
            <select value={s.calendarView || "week"} onChange={e => set({ calendarView: e.target.value as "week" | "month" })} className={selectCls}>
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Affichage des montants</label>
            <select value={s.amountDisplay || "ht"} onChange={e => set({ amountDisplay: e.target.value as "ht" | "ttc" })} className={selectCls}>
              <option value="ht">HT (hors taxes)</option>
              <option value="ttc">TTC (toutes taxes)</option>
            </select>
          </div>
        </div>

        <div className="h-px bg-[#F0F0EE]" />

        <div className="space-y-1">
          <Toggle checked={s.weekStartsMonday !== false} onChange={v => set({ weekStartsMonday: v })} label="La semaine commence le lundi" description="Affecte le calendrier et les vues par période." />
          <Toggle checked={!!s.compactMode} onChange={v => set({ compactMode: v })} label="Mode compact" description="Réduit l'espacement pour afficher plus de données." />
        </div>
      </div>
    </SectionCard>
  );
}
