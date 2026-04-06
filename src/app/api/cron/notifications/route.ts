import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications/service";

/**
 * GET /api/cron/notifications
 * Cron job pour générer les rappels automatiques :
 * - Tâches à échéance dans les 24h
 * - Rappels calendrier dans les 2h
 * - Clôture mensuelle (dernier jour du mois)
 *
 * Protégé par CRON_SECRET (Vercel Cron).
 * Idempotent grâce aux idempotency_keys.
 */
export async function GET(req: NextRequest) {
  // Vérifier le secret cron
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const results = { taskReminders: 0, calendarReminders: 0, monthlyClosures: 0, errors: 0 };

  // ── 1. Tâches à échéance dans les prochaines 24h ──
  try {
    const tomorrow = new Date(now);
    tomorrow.setHours(tomorrow.getHours() + 24);
    const todayStr = now.toISOString().slice(0, 10);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tasks } = await (supabase.from("tasks") as any)
      .select("id, user_id, title, due_date")
      .gte("due_date", todayStr)
      .lte("due_date", tomorrowStr)
      .is("archived_at", null)
      .neq("status", "done")
      .neq("status", "completed");

    if (tasks) {
      for (const task of tasks) {
        const dateLabel = new Date(task.due_date).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
        });

        const result = await createNotification({
          user_id: task.user_id,
          type: "task_due",
          category: "tasks",
          title: "Tâche à échéance",
          message: `« ${task.title} » arrive à échéance le ${dateLabel}.`,
          cta_label: "Voir la tâche",
          cta_href: `/taches/${task.id}`,
          entity_type: "task",
          entity_id: task.id,
          triggered_by: "cron",
          idempotency_key: `cron_task_due:${task.id}:${todayStr}`,
        });

        if (!result.skipped && result.notification) results.taskReminders++;
      }
    }
  } catch (err) {
    console.error("[cron/notifications] task reminders error:", err);
    results.errors++;
  }

  // ── 2. Événements calendrier dans les 2 prochaines heures ──
  try {
    const todayStr = now.toISOString().slice(0, 10);
    const nowTime = now.toTimeString().slice(0, 5); // HH:mm
    const in2h = new Date(now);
    in2h.setHours(in2h.getHours() + 2);
    const in2hTime = in2h.toTimeString().slice(0, 5);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: events } = await (supabase.from("calendar_events") as any)
      .select("id, user_id, title, date, start_time")
      .eq("date", todayStr)
      .gte("start_time", nowTime)
      .lte("start_time", in2hTime);

    if (events) {
      for (const event of events) {
        const result = await createNotification({
          user_id: event.user_id,
          type: "calendar_reminder",
          category: "calendar",
          title: "Événement à venir",
          message: `« ${event.title ?? "Événement"} » commence à ${event.start_time?.slice(0, 5) ?? "bientôt"}.`,
          cta_label: "Voir l'événement",
          cta_href: `/calendrier`,
          entity_type: "event",
          entity_id: event.id,
          triggered_by: "cron",
          idempotency_key: `cron_calendar:${event.id}:${todayStr}`,
        });

        if (!result.skipped && result.notification) results.calendarReminders++;
      }
    }
  } catch (err) {
    console.error("[cron/notifications] calendar reminders error:", err);
    results.errors++;
  }

  // ── 3. Clôture mensuelle (dernier jour du mois) ──
  try {
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    if (now.getDate() === lastDay) {
      const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: users } = await (supabase.from("profiles") as any)
        .select("id");

      if (users) {
        for (const user of users) {
          const result = await createNotification({
            user_id: user.id,
            type: "monthly_closure_reminder",
            category: "billing",
            title: "Clôture mensuelle",
            message: `Pensez à clôturer votre facturation pour ${monthLabel}.`,
            cta_label: "Ouvrir la facturation",
            cta_href: "/facturation",
            triggered_by: "cron",
            idempotency_key: `cron_monthly_closure:${user.id}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
          });

          if (!result.skipped && result.notification) results.monthlyClosures++;
        }
      }
    }
  } catch (err) {
    console.error("[cron/notifications] monthly closure error:", err);
    results.errors++;
  }

  console.log("[cron/notifications] completed:", results);
  return NextResponse.json({ ok: true, ...results });
}
