"use client";

import type { SettingsForm, SettingsFormActions } from "./shared";
import { SectionCard, Toggle, selectCls, labelCls } from "./shared";

export function NotificationsSection({ form, actions, dirty }: {
  form: SettingsForm;
  actions: SettingsFormActions;
  dirty: boolean;
}) {
  const email = form.notifications.email ?? {};
  const inApp = form.notifications.inApp ?? {};
  const digest = form.notifications.digest ?? {};

  const setEmail = (patch: Partial<typeof email>) => { actions.updateNotifEmail(patch); actions.markDirty("notifications"); };
  const setInApp = (patch: Partial<typeof inApp>) => { actions.updateNotifInApp(patch); actions.markDirty("notifications"); };
  const setDigest = (patch: Partial<typeof digest>) => { actions.updateNotifDigest(patch); actions.markDirty("notifications"); };

  return (
    <SectionCard id="notifications" title="Notifications" description="Choisissez comment et quand vous êtes notifié." dirty={dirty}>
      <div className="space-y-5">
        {/* Email */}
        <div>
          <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">Par email</p>
          <Toggle checked={email.newOrders !== false} onChange={v => setEmail({ newOrders: v })} label="Nouvelles commandes" description="Recevez un email à chaque nouvelle commande." />
          <Toggle checked={email.deliveredOrders !== false} onChange={v => setEmail({ deliveredOrders: v })} label="Commandes livrées" description="Notification quand une commande est marquée livrée." />
          <Toggle checked={email.paymentReminders !== false} onChange={v => setEmail({ paymentReminders: v })} label="Rappels de paiement" description="Relance automatique pour factures en retard." />
          <Toggle checked={!!email.monthEndReminder} onChange={v => setEmail({ monthEndReminder: v })} label="Rappel de clôture mensuelle" description="Rappel en fin de mois pour la facturation." />
          <Toggle checked={email.integrationAlerts !== false} onChange={v => setEmail({ integrationAlerts: v })} label="Alertes intégrations" description="Erreurs ou déconnexions de vos intégrations." />
          <Toggle checked={email.subscription !== false} onChange={v => setEmail({ subscription: v })} label="Abonnement" description="Renouvellement, paiement échoué." />
        </div>

        <div className="h-px bg-[#F0F0EE]" />

        {/* In-app */}
        <div>
          <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">Dans l&apos;application</p>
          <Toggle checked={inApp.taskReminders !== false} onChange={v => setInApp({ taskReminders: v })} label="Rappels de tâches" description="Notification avant l'échéance d'une tâche." />
          <Toggle checked={inApp.calendarReminders !== false} onChange={v => setInApp({ calendarReminders: v })} label="Rappels calendrier" description="Notification avant un événement." />
          <Toggle checked={!!inApp.billingSuggestions} onChange={v => setInApp({ billingSuggestions: v })} label="Suggestions facturation" description="Commandes livrées à facturer." />
          <Toggle checked={!!inApp.healthAlerts} onChange={v => setInApp({ healthAlerts: v })} label="Alertes santé" description="Anomalies détectées dans vos données." />
          <Toggle checked={!!inApp.monthlyClose} onChange={v => setInApp({ monthlyClose: v })} label="Clôture mensuelle" description="Rappel de clôture dans l'app." />
        </div>

        <div className="h-px bg-[#F0F0EE]" />

        {/* Digest */}
        <div>
          <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">Récapitulatif</p>
          <Toggle checked={!!digest.enabled} onChange={v => setDigest({ enabled: v })} label="Recevoir un récapitulatif" description="Résumé de votre activité par email." />
          {digest.enabled && (
            <div className="ml-14 mt-2">
              <label className={labelCls}>Fréquence</label>
              <select value={digest.frequency || "weekly"} onChange={e => setDigest({ frequency: e.target.value as "daily" | "weekly" })} className={selectCls + " max-w-[200px]"}>
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
