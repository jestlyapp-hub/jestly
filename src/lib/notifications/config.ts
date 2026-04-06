/* ══════════════════════════════════════════════════════════════════════
   Notifications — Config centralisée
   Définit chaque type de notification : label, catégorie, préférence,
   CTA par défaut, icône, couleur, sévérité.
   ══════════════════════════════════════════════════════════════════════ */

import type {
  NotificationType,
  NotificationCategory,
  NotificationSeverity,
  NotificationPreferenceMapping,
} from "./types";

export interface NotificationTypeConfig {
  type: NotificationType;
  label: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  /** Mapping vers les préférences utilisateur */
  preferences: NotificationPreferenceMapping;
  /** CTA par défaut (peut être override lors de la création) */
  defaultCta?: { label: string; href: string };
  /** Icône Lucide (nom) pour le rendu UI */
  icon: string;
  /** Couleurs UI — bg et text pour le badge catégorie */
  colors: { bg: string; text: string };
}

/**
 * Registre central de tous les types de notifications.
 * Source de vérité unique utilisée par :
 * - service.ts (création + vérification préférences)
 * - UI (rendu des cartes, icônes, couleurs)
 * - cron (types à générer)
 */
export const NOTIFICATION_TYPES: Record<NotificationType, NotificationTypeConfig> = {
  order_new: {
    type: "order_new",
    label: "Nouvelle commande",
    category: "orders",
    severity: "success",
    preferences: { emailKey: "newOrders" },
    defaultCta: { label: "Voir la commande", href: "/commandes" },
    icon: "ShoppingBag",
    colors: { bg: "bg-emerald-50", text: "text-emerald-600" },
  },
  order_delivered: {
    type: "order_delivered",
    label: "Commande livrée",
    category: "orders",
    severity: "success",
    preferences: { emailKey: "deliveredOrders" },
    defaultCta: { label: "Voir la commande", href: "/commandes" },
    icon: "PackageCheck",
    colors: { bg: "bg-emerald-50", text: "text-emerald-600" },
  },
  invoice_payment_reminder: {
    type: "invoice_payment_reminder",
    label: "Rappel de paiement",
    category: "billing",
    severity: "warning",
    preferences: { emailKey: "paymentReminders" },
    defaultCta: { label: "Voir la facturation", href: "/facturation" },
    icon: "Receipt",
    colors: { bg: "bg-amber-50", text: "text-amber-600" },
  },
  monthly_closure_reminder: {
    type: "monthly_closure_reminder",
    label: "Clôture mensuelle",
    category: "billing",
    severity: "info",
    preferences: { emailKey: "monthEndReminder", appKey: "monthlyClose" },
    defaultCta: { label: "Ouvrir la facturation", href: "/facturation" },
    icon: "CalendarClock",
    colors: { bg: "bg-blue-50", text: "text-blue-600" },
  },
  integration_alert: {
    type: "integration_alert",
    label: "Alerte intégration",
    category: "integrations",
    severity: "error",
    preferences: { emailKey: "integrationAlerts" },
    defaultCta: { label: "Voir les intégrations", href: "/parametres#integrations" },
    icon: "Puzzle",
    colors: { bg: "bg-red-50", text: "text-red-500" },
  },
  subscription_alert: {
    type: "subscription_alert",
    label: "Abonnement",
    category: "subscription",
    severity: "warning",
    preferences: { emailKey: "subscription" },
    defaultCta: { label: "Gérer l'abonnement", href: "/parametres#abonnement" },
    icon: "CreditCard",
    colors: { bg: "bg-violet-50", text: "text-violet-600" },
  },
  task_due: {
    type: "task_due",
    label: "Tâche à échéance",
    category: "tasks",
    severity: "warning",
    preferences: { appKey: "taskReminders" },
    defaultCta: { label: "Voir la tâche", href: "/taches" },
    icon: "CheckSquare",
    colors: { bg: "bg-amber-50", text: "text-amber-600" },
  },
  calendar_reminder: {
    type: "calendar_reminder",
    label: "Rappel calendrier",
    category: "calendar",
    severity: "info",
    preferences: { appKey: "calendarReminders" },
    defaultCta: { label: "Voir l'événement", href: "/calendrier" },
    icon: "Calendar",
    colors: { bg: "bg-blue-50", text: "text-blue-600" },
  },
  invoice_suggestion: {
    type: "invoice_suggestion",
    label: "Suggestion facturation",
    category: "billing",
    severity: "info",
    preferences: { appKey: "billingSuggestions" },
    defaultCta: { label: "Facturer maintenant", href: "/facturation" },
    icon: "Lightbulb",
    colors: { bg: "bg-indigo-50", text: "text-indigo-600" },
  },
  health_alert: {
    type: "health_alert",
    label: "Alerte santé",
    category: "health",
    severity: "warning",
    preferences: { appKey: "healthAlerts" },
    defaultCta: { label: "Vérifier", href: "/dashboard" },
    icon: "HeartPulse",
    colors: { bg: "bg-orange-50", text: "text-orange-600" },
  },
  digest_summary: {
    type: "digest_summary",
    label: "Récapitulatif",
    category: "summary",
    severity: "info",
    preferences: {},
    icon: "MailOpen",
    colors: { bg: "bg-slate-50", text: "text-slate-600" },
  },
};

/** Labels des catégories pour les filtres UI */
export const CATEGORY_LABELS: Record<NotificationCategory | "all", string> = {
  all: "Toutes",
  orders: "Commandes",
  billing: "Facturation",
  tasks: "Tâches",
  calendar: "Calendrier",
  integrations: "Intégrations",
  subscription: "Abonnement",
  health: "Santé",
  summary: "Récap",
  system: "Système",
};

/** Catégories affichées dans les filtres UI (dans l'ordre) */
export const FILTER_CATEGORIES: (NotificationCategory | "all")[] = [
  "all",
  "orders",
  "billing",
  "tasks",
  "calendar",
  "integrations",
  "system",
];

/** Retourne la config d'un type de notification */
export function getNotificationConfig(type: NotificationType): NotificationTypeConfig {
  return NOTIFICATION_TYPES[type];
}
