/* ══════════════════════════════════════════════════════════════════════
   Notifications — Service central
   Point d'entrée unique pour créer, lire, modifier les notifications.
   Appelé depuis : API routes, triggers métier, cron jobs.
   ══════════════════════════════════════════════════════════════════════ */

import { createAdminClient } from "@/lib/supabase/admin";
import { NOTIFICATION_TYPES } from "./config";
import type {
  NotificationType,
  NotificationRow,
  CreateNotificationPayload,
  NotificationCategory,
  NotificationEmailPrefs,
  NotificationAppPrefs,
} from "./types";

// ── Types internes ──

interface UserNotificationPrefs {
  email?: NotificationEmailPrefs;
  inApp?: NotificationAppPrefs;
  digest?: { enabled?: boolean; frequency?: "daily" | "weekly" };
}

interface CreateResult {
  notification: NotificationRow | null;
  skipped: boolean;
  reason?: string;
}

// ── Service ──

/**
 * Crée une notification in-app si les préférences utilisateur l'autorisent.
 * Idempotent si idempotency_key est fourni.
 */
export async function createNotification(
  payload: CreateNotificationPayload
): Promise<CreateResult> {
  const supabase = createAdminClient();
  const config = NOTIFICATION_TYPES[payload.type];

  // 1. Vérifier les préférences utilisateur pour le canal in-app
  if (config.preferences.appKey) {
    const prefs = await getUserNotificationPrefs(supabase, payload.user_id);
    const appPrefs = prefs?.inApp ?? {};
    const key = config.preferences.appKey;

    // Certains toggles sont ON par défaut (taskReminders, calendarReminders)
    // d'autres sont OFF par défaut (billingSuggestions, healthAlerts, monthlyClose)
    const defaultOn = key === "taskReminders" || key === "calendarReminders";
    const isEnabled = appPrefs[key] !== undefined ? appPrefs[key] : defaultOn;

    if (!isEnabled) {
      return { notification: null, skipped: true, reason: `Préférence in-app ${key} désactivée` };
    }
  }

  // 2. Construire le row
  const row = {
    user_id: payload.user_id,
    type: payload.type,
    category: payload.category,
    title: payload.title,
    message: payload.message,
    severity: payload.severity ?? config.severity,
    cta_label: payload.cta_label ?? config.defaultCta?.label ?? null,
    cta_href: payload.cta_href ?? config.defaultCta?.href ?? null,
    entity_type: payload.entity_type ?? null,
    entity_id: payload.entity_id ?? null,
    metadata: payload.metadata ?? {},
    triggered_by: payload.triggered_by ?? "system",
    idempotency_key: payload.idempotency_key ?? null,
  };

  // 3. Insert (idempotent si clé fournie — ON CONFLICT DO NOTHING via unique index)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("notifications") as any)
    .insert(row)
    .select()
    .single();

  if (error) {
    // Duplicate idempotency_key → skip silencieusement
    if (error.code === "23505" && payload.idempotency_key) {
      return { notification: null, skipped: true, reason: "Doublon idempotency_key" };
    }
    console.error("[notifications/service] createNotification error:", error.message);
    return { notification: null, skipped: false, reason: error.message };
  }

  // 4. Envoyer email si le type a un emailKey et que la préférence est active
  if (config.preferences.emailKey) {
    shouldSendEmail(payload.user_id, payload.type).then(async (send) => {
      if (!send) return;
      try {
        // Récupérer email + prénom de l'utilisateur
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase.from("profiles") as any)
          .select("email, full_name")
          .eq("id", payload.user_id)
          .single();

        if (profile?.email) {
          const { sendNotificationEmail } = await import("./email");
          await sendNotificationEmail({
            to: profile.email,
            firstName: profile.full_name?.split(" ")[0] ?? "there",
            type: payload.type,
            title: payload.title,
            message: payload.message,
            ctaLabel: payload.cta_label ?? config.defaultCta?.label,
            ctaHref: payload.cta_href ?? config.defaultCta?.href,
          });
        }
      } catch (err) {
        console.error("[notifications/service] email send error:", err);
      }
    });
  }

  return { notification: data as NotificationRow, skipped: false };
}

/**
 * Liste les notifications d'un utilisateur (non archivées).
 */
export async function listNotifications(
  userId: string,
  options: { category?: NotificationCategory | "all"; unreadOnly?: boolean; limit?: number; offset?: number } = {}
): Promise<{ data: NotificationRow[]; count: number }> {
  const supabase = createAdminClient();
  const { category = "all", unreadOnly = false, limit = 30, offset = 0 } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("notifications") as any)
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category !== "all") {
    query = query.eq("category", category);
  }
  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[notifications/service] listNotifications error:", error.message);
    return { data: [], count: 0 };
  }

  return { data: (data ?? []) as NotificationRow[], count: count ?? 0 };
}

/**
 * Compte les notifications non lues d'un utilisateur.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (supabase.from("notifications") as any)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false)
    .eq("is_archived", false);

  if (error) {
    console.error("[notifications/service] getUnreadCount error:", error.message);
    return 0;
  }

  return count ?? 0;
}

/**
 * Marque une notification comme lue.
 */
export async function markAsRead(userId: string, notificationId: string): Promise<boolean> {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("notifications") as any)
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    console.error("[notifications/service] markAsRead error:", error.message);
    return false;
  }
  return true;
}

/**
 * Marque toutes les notifications non lues d'un utilisateur comme lues.
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("notifications") as any)
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_read", false)
    .eq("is_archived", false);

  if (error) {
    console.error("[notifications/service] markAllAsRead error:", error.message);
    return false;
  }
  return true;
}

/**
 * Archive une notification.
 */
export async function archiveNotification(userId: string, notificationId: string): Promise<boolean> {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("notifications") as any)
    .update({ is_archived: true, archived_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    console.error("[notifications/service] archiveNotification error:", error.message);
    return false;
  }
  return true;
}

/**
 * Vérifie si un email de notification doit être envoyé selon les préférences.
 */
export async function shouldSendEmail(
  userId: string,
  notificationType: NotificationType
): Promise<boolean> {
  const config = NOTIFICATION_TYPES[notificationType];
  if (!config.preferences.emailKey) return false;

  const supabase = createAdminClient();
  const prefs = await getUserNotificationPrefs(supabase, userId);
  const emailPrefs = prefs?.email ?? {};
  const key = config.preferences.emailKey;

  // La plupart des emails sont ON par défaut sauf monthEndReminder
  const defaultOn = key !== "monthEndReminder";
  return emailPrefs[key] !== undefined ? !!emailPrefs[key] : defaultOn;
}

// ── Helpers privés ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUserNotificationPrefs(supabase: any, userId: string): Promise<UserNotificationPrefs | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("profiles") as any)
    .select("notifications")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return (data.notifications ?? {}) as UserNotificationPrefs;
}
