import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications/service";

/**
 * POST /api/dev/seed-notifications
 *
 * Génère des notifications de test réalistes basées sur les vraies données
 * de l'utilisateur connecté. Admin-only en production.
 *
 * Utile pour :
 * - vérifier que toute la chaîne DB → API → UI → Realtime fonctionne
 * - tester les filtres, mark-as-read, compteur non lues
 * - démonstration / onboarding
 */
export async function POST() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user } = auth;

  // Sécurité : admin seulement en production
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
  }

  const supabase = createAdminClient();
  const userId = user.id;
  const results: { type: string; title: string; ok: boolean; reason?: string }[] = [];

  // ── 1. Notifications commandes (depuis les vraies commandes) ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase.from("orders") as any)
    .select("id, title, status, amount, clients(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (orders?.length) {
    // order_new — 2 dernières commandes
    for (const order of orders.slice(0, 2)) {
      const r = await createNotification({
        user_id: userId,
        type: "order_new",
        category: "orders",
        title: "Nouvelle commande reçue",
        message: order.clients?.name
          ? `${order.clients.name} — ${order.title}${order.amount ? ` (${Number(order.amount).toFixed(2)} €)` : ""}`
          : order.title,
        cta_label: "Voir la commande",
        cta_href: "/commandes",
        entity_type: "order",
        entity_id: order.id,
        triggered_by: "system",
        idempotency_key: `seed_order_new:${order.id}`,
      });
      results.push({ type: "order_new", title: order.title, ok: !!r.notification, reason: r.reason });
    }

    // order_delivered — commandes livrées
    const delivered = orders.filter((o: { status: string }) => o.status === "delivered");
    for (const order of delivered.slice(0, 2)) {
      const r = await createNotification({
        user_id: userId,
        type: "order_delivered",
        category: "orders",
        title: "Commande livrée",
        message: order.clients?.name
          ? `${order.title} pour ${order.clients.name} est marquée comme livrée.`
          : `${order.title} est marquée comme livrée.`,
        cta_label: "Voir la commande",
        cta_href: "/commandes",
        entity_type: "order",
        entity_id: order.id,
        triggered_by: "system",
        idempotency_key: `seed_delivered:${order.id}`,
      });
      results.push({ type: "order_delivered", title: order.title, ok: !!r.notification, reason: r.reason });
    }
  }

  // ── 2. Notifications tâches (depuis les vraies tâches) ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tasks } = await (supabase.from("tasks") as any)
    .select("id, title, due_date")
    .eq("user_id", userId)
    .is("archived_at", null)
    .neq("status", "done")
    .neq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(3);

  if (tasks?.length) {
    for (const task of tasks.slice(0, 2)) {
      const dateStr = task.due_date
        ? new Date(task.due_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
        : "bientôt";
      const r = await createNotification({
        user_id: userId,
        type: "task_due",
        category: "tasks",
        title: "Tâche à échéance",
        message: `« ${task.title} » arrive à échéance ${task.due_date ? `le ${dateStr}` : dateStr}.`,
        cta_label: "Voir la tâche",
        cta_href: `/taches/${task.id}`,
        entity_type: "task",
        entity_id: task.id,
        triggered_by: "system",
        idempotency_key: `seed_task:${task.id}`,
      });
      results.push({ type: "task_due", title: task.title, ok: !!r.notification, reason: r.reason });
    }
  }

  // ── 3. Notifications système (insert direct — bypasse les préférences) ──
  // Pour health_alert et monthly_closure qui sont OFF par défaut,
  // on insère directement pour que l'utilisateur voie au moins un exemple.
  const now = new Date();
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const directNotifs = [
    {
      type: "invoice_suggestion",
      category: "billing",
      title: "Facturation recommandée",
      message: "Certaines commandes livrées ne sont pas encore facturées.",
      severity: "info",
      cta_label: "Facturer maintenant",
      cta_href: "/facturation",
      triggered_by: "system",
      idempotency_key: `seed_invoice_suggestion:${now.toISOString().slice(0, 10)}`,
    },
    {
      type: "health_alert",
      category: "health",
      title: "Vérification recommandée",
      message: "Des tâches en retard ont été détectées dans votre espace de travail.",
      severity: "warning",
      cta_label: "Voir les tâches",
      cta_href: "/taches",
      triggered_by: "system",
      idempotency_key: `seed_health:${now.toISOString().slice(0, 10)}`,
    },
    {
      type: "monthly_closure_reminder",
      category: "billing",
      title: "Clôture mensuelle",
      message: `Pensez à vérifier votre facturation pour ${monthLabel}.`,
      severity: "info",
      cta_label: "Ouvrir la facturation",
      cta_href: "/facturation",
      triggered_by: "system",
      idempotency_key: `seed_closure:${now.toISOString().slice(0, 7)}`,
    },
    {
      type: "calendar_reminder",
      category: "calendar",
      title: "Événement à venir",
      message: "Vous avez un événement prévu prochainement dans votre calendrier.",
      severity: "info",
      cta_label: "Voir le calendrier",
      cta_href: "/calendrier",
      triggered_by: "system",
      idempotency_key: `seed_calendar:${now.toISOString().slice(0, 10)}`,
    },
  ];

  for (const n of directNotifs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("notifications") as any)
      .insert({
        user_id: userId,
        ...n,
        metadata: {},
      })
      .select("id")
      .single();

    const isDupe = error?.code === "23505";
    results.push({
      type: n.type,
      title: n.title,
      ok: !!data && !error,
      reason: isDupe ? "Déjà créée (idempotent)" : error?.message,
    });
  }

  const created = results.filter((r) => r.ok).length;
  return NextResponse.json({ ok: true, created, total: results.length, results });
}
