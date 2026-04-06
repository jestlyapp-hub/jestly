/* ══════════════════════════════════════════════════════════════════════
   Notifications — Types centralisés
   Source de vérité unique pour tout le système de notifications Jestly.
   ══════════════════════════════════════════════════════════════════════ */

/** Types de notifications — enum logique TS, texte en DB */
export type NotificationType =
  | "order_new"
  | "order_delivered"
  | "invoice_payment_reminder"
  | "monthly_closure_reminder"
  | "integration_alert"
  | "subscription_alert"
  | "task_due"
  | "calendar_reminder"
  | "invoice_suggestion"
  | "health_alert"
  | "digest_summary";

/** Catégories pour filtrage UI */
export type NotificationCategory =
  | "orders"
  | "billing"
  | "tasks"
  | "calendar"
  | "integrations"
  | "subscription"
  | "health"
  | "summary"
  | "system";

/** Niveaux de sévérité */
export type NotificationSeverity = "info" | "success" | "warning" | "error";

/** Canal de délivrance */
export type NotificationChannel = "app" | "email";

/** Source du déclenchement */
export type NotificationTrigger = "system" | "cron" | "user" | "webhook";

/** Row DB telle que retournée par Supabase */
export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  cta_label: string | null;
  cta_href: string | null;
  entity_type: string | null;
  entity_id: string | null;
  severity: NotificationSeverity;
  is_read: boolean;
  is_archived: boolean;
  metadata: Record<string, unknown>;
  triggered_by: NotificationTrigger | null;
  idempotency_key: string | null;
  read_at: string | null;
  archived_at: string | null;
  created_at: string;
}

/** Payload pour créer une notification côté serveur */
export interface CreateNotificationPayload {
  user_id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  severity?: NotificationSeverity;
  cta_label?: string;
  cta_href?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  triggered_by?: NotificationTrigger;
  idempotency_key?: string;
}

/** Clé de préférence notification — mapping vers le champ dans profiles.notifications */
export interface NotificationPreferenceMapping {
  /** Canal email — chemin dans notifications.email */
  emailKey?: keyof NotificationEmailPrefs;
  /** Canal in-app — chemin dans notifications.inApp */
  appKey?: keyof NotificationAppPrefs;
}

/** Shape des préférences email (miroir de shared.tsx NotificationSettings) */
export interface NotificationEmailPrefs {
  newOrders?: boolean;
  deliveredOrders?: boolean;
  paymentReminders?: boolean;
  monthEndReminder?: boolean;
  integrationAlerts?: boolean;
  subscription?: boolean;
}

/** Shape des préférences in-app */
export interface NotificationAppPrefs {
  taskReminders?: boolean;
  calendarReminders?: boolean;
  billingSuggestions?: boolean;
  healthAlerts?: boolean;
  monthlyClose?: boolean;
}

/** Filtres pour la liste côté client */
export interface NotificationFilters {
  category?: NotificationCategory | "all";
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}
