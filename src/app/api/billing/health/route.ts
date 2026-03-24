import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

/**
 * GET /api/billing/health
 *
 * Billing intelligence engine — returns:
 * - Health score (0-100)
 * - Anomalies on billing_items (missing data, stale drafts, etc.)
 * - Forgotten billing suggestions (delivered orders without billing items)
 * - Monthly close readiness checklist
 */
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const staleThreshold = new Date(now.getTime() - 14 * 86400000).toISOString(); // 14 days ago

  // ── Fetch all billing items ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase.from("billing_items") as any)
    .select("id, title, client_id, status, total, unit_price, category, description, performed_at, tax_rate, source, recurring, order_id, recurring_profile_id, created_at, updated_at")
    .eq("user_id", user.id)
    .neq("status", "cancelled");

  // ── Fetch delivered/invoiced orders not linked to billing ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase.from("orders") as any)
    .select("id, title, amount, status, client_id, clients(name), created_at")
    .eq("user_id", user.id)
    .in("status", ["delivered", "invoiced", "paid"]);

  // ── Fetch completed tasks with client ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tasks } = await (supabase.from("tasks") as any)
    .select("id, title, client_id, client_name, order_id, status, created_at")
    .eq("user_id", user.id)
    .in("status", ["done", "completed"])
    .is("archived_at", null);

  // ── Fetch active recurring profiles ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recurringProfiles } = await (supabase.from("recurring_billing_profiles") as any)
    .select("id, title, client_id, clients(name), unit_price, status, start_date, end_date")
    .eq("user_id", user.id)
    .eq("status", "active");

  const allItems = items ?? [];
  const allOrders = orders ?? [];
  const allTasks = tasks ?? [];
  const allRecurring = recurringProfiles ?? [];

  // Set of order_ids already linked to billing items
  const billedOrderIds = new Set(
    allItems.filter((i: { source: string; }) => i.source === "order").map((i: { order_id: string; }) => i.order_id).filter(Boolean)
  );

  // ════════════════════════════════════════════
  // 1. ANOMALIES (billing_items quality issues)
  // ════════════════════════════════════════════

  interface Anomaly {
    id: string;
    type: string;
    severity: "error" | "warning" | "info";
    title: string;
    description: string;
    itemId?: string;
    itemTitle?: string;
    fix?: string;
  }

  const anomalies: Anomaly[] = [];

  for (const item of allItems) {
    const ht = Number(item.total) || 0;
    const price = Number(item.unit_price) || 0;

    // Missing client
    if (!item.client_id) {
      anomalies.push({
        id: `no-client-${item.id}`,
        type: "missing_client",
        severity: "warning",
        title: "Ligne sans client",
        description: `"${item.title}" n'est associée à aucun client.`,
        itemId: item.id,
        itemTitle: item.title,
        fix: "Assigner un client à cette prestation",
      });
    }

    // Zero price
    if (price <= 0 && item.status !== "draft") {
      anomalies.push({
        id: `no-price-${item.id}`,
        type: "missing_price",
        severity: "error",
        title: "Ligne sans prix",
        description: `"${item.title}" a un prix unitaire de 0 €.`,
        itemId: item.id,
        itemTitle: item.title,
        fix: "Définir le prix unitaire",
      });
    }

    // Missing category
    if (!item.category) {
      anomalies.push({
        id: `no-cat-${item.id}`,
        type: "missing_category",
        severity: "info",
        title: "Catégorie manquante",
        description: `"${item.title}" n'a pas de catégorie.`,
        itemId: item.id,
        itemTitle: item.title,
        fix: "Ajouter une catégorie",
      });
    }

    // Missing date
    if (!item.performed_at) {
      anomalies.push({
        id: `no-date-${item.id}`,
        type: "missing_date",
        severity: "warning",
        title: "Ligne sans date",
        description: `"${item.title}" n'a pas de date de réalisation.`,
        itemId: item.id,
        itemTitle: item.title,
        fix: "Renseigner la date de réalisation",
      });
    }

    // Missing description (only warn on ready/validated items)
    if (!item.description && ["validated", "ready"].includes(item.status)) {
      anomalies.push({
        id: `no-desc-${item.id}`,
        type: "missing_description",
        severity: "info",
        title: "Description manquante",
        description: `"${item.title}" est prête mais sans description.`,
        itemId: item.id,
        itemTitle: item.title,
        fix: "Ajouter une description",
      });
    }

    // Stale draft (>14 days)
    if (["draft", "to_validate"].includes(item.status) && item.created_at < staleThreshold) {
      const days = Math.floor((now.getTime() - new Date(item.created_at).getTime()) / 86400000);
      anomalies.push({
        id: `stale-draft-${item.id}`,
        type: "stale_draft",
        severity: "warning",
        title: "Brouillon ancien",
        description: `"${item.title}" est en brouillon depuis ${days} jours.`,
        itemId: item.id,
        itemTitle: item.title,
        fix: "Valider ou supprimer ce brouillon",
      });
    }

    // Validated but not exported (>7 days)
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    if (["validated", "ready"].includes(item.status) && item.updated_at < weekAgo) {
      anomalies.push({
        id: `stuck-validated-${item.id}`,
        type: "stuck_validated",
        severity: "warning",
        title: "Prête mais non exportée",
        description: `"${item.title}" est prête depuis plus de 7 jours mais n'a pas été exportée.`,
        itemId: item.id,
        itemTitle: item.title,
        fix: "Exporter cette prestation",
      });
    }

    // Exported but not invoiced (>30 days)
    const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
    if (item.status === "exported" && item.updated_at < monthAgo) {
      anomalies.push({
        id: `stuck-exported-${item.id}`,
        type: "stuck_exported",
        severity: "info",
        title: "Exportée mais non facturée",
        description: `"${item.title}" a été exportée il y a plus de 30 jours sans être marquée facturée.`,
        itemId: item.id,
        itemTitle: item.title,
        fix: "Marquer comme facturée si la facture est envoyée",
      });
    }
  }

  // ════════════════════════════════════════════
  // 2. FORGOTTEN BILLING SUGGESTIONS
  // ════════════════════════════════════════════

  interface Suggestion {
    id: string;
    type: string;
    title: string;
    description: string;
    orderId?: string;
    profileId?: string;
    clientName?: string;
    amount?: number;
    action: string;
  }

  const suggestions: Suggestion[] = [];

  // Delivered orders without billing items
  for (const order of allOrders) {
    if (!billedOrderIds.has(order.id)) {
      suggestions.push({
        id: `unbilled-order-${order.id}`,
        type: "unbilled_order",
        title: `Commande livrée non facturée`,
        description: `"${order.title}" (${Number(order.amount || 0).toFixed(2)} €) est ${order.status === "delivered" ? "livrée" : order.status === "paid" ? "payée" : "facturée"} mais aucune ligne facturable n'y est associée.`,
        orderId: order.id,
        clientName: order.clients?.name,
        amount: Number(order.amount) || 0,
        action: "Créer une ligne facturable",
      });
    }
  }

  // Completed tasks with client but no billing link
  // Group tasks by client to avoid spamming suggestions
  const tasksByClient = new Map<string, { name: string; count: number; taskTitles: string[] }>();
  for (const task of allTasks) {
    if (!task.client_id) continue;
    // Check if there's a billing item for this task's order
    if (task.order_id && billedOrderIds.has(task.order_id)) continue;
    const key = task.client_id;
    if (!tasksByClient.has(key)) {
      tasksByClient.set(key, { name: task.client_name || "Client", count: 0, taskTitles: [] });
    }
    const g = tasksByClient.get(key)!;
    g.count++;
    if (g.taskTitles.length < 3) g.taskTitles.push(task.title);
  }

  for (const [clientId, info] of tasksByClient) {
    if (info.count > 0) {
      suggestions.push({
        id: `tasks-unbilled-${clientId}`,
        type: "tasks_without_billing",
        title: `${info.count} tâche${info.count > 1 ? "s" : ""} terminée${info.count > 1 ? "s" : ""} sans facturation`,
        description: `Le client ${info.name} a ${info.count} tâche${info.count > 1 ? "s" : ""} complétée${info.count > 1 ? "s" : ""} (${info.taskTitles.join(", ")}${info.count > 3 ? "…" : ""}) sans ligne facturable associée.`,
        clientName: info.name,
        action: "Vérifier et créer les lignes",
      });
    }
  }

  // Recurring profiles expected this month but absent
  for (const profile of allRecurring) {
    // Check if start_date allows this month
    if (profile.start_date > monthEnd) continue;
    if (profile.end_date && profile.end_date < monthStart) continue;

    // Check if a billing item with this profile's recurring_profile_id exists this month
    const hasThisMonth = allItems.some(
      (i: { recurring_profile_id?: string; performed_at: string; }) =>
        i.recurring_profile_id === profile.id &&
        i.performed_at >= monthStart &&
        i.performed_at <= monthEnd
    );
    if (!hasThisMonth) {
      suggestions.push({
        id: `recurring-missing-${profile.id}`,
        type: "missing_recurring",
        title: "Retainer mensuel à générer",
        description: `"${profile.title}" pour ${profile.clients?.name || "un client"} (${Number(profile.unit_price || 0).toFixed(2)} €) n'a pas encore été généré ce mois-ci.`,
        profileId: profile.id,
        clientName: profile.clients?.name,
        amount: Number(profile.unit_price) || 0,
        action: "Générer la ligne du mois",
      });
    }
  }

  // Fallback: also detect billing_items flagged recurring without a profile
  const recurringItems = allItems.filter((i: { recurring: boolean; recurring_profile_id?: string; }) => i.recurring && !i.recurring_profile_id);
  for (const item of recurringItems) {
    const hasThisMonth = allItems.some(
      (i: { id: string; title: string; client_id: string; performed_at: string; }) =>
        i.id !== item.id &&
        i.title === item.title &&
        i.client_id === item.client_id &&
        i.performed_at >= monthStart &&
        i.performed_at <= monthEnd
    );
    if (!hasThisMonth) {
      suggestions.push({
        id: `recurring-legacy-${item.id}`,
        type: "missing_recurring",
        title: "Prestation récurrente absente",
        description: `"${item.title}" est marquée récurrente mais aucune occurrence n'existe pour ce mois-ci.`,
        clientName: item.client_id,
        action: "Générer la ligne du mois",
      });
    }
  }

  // ════════════════════════════════════════════
  // 3. MONTHLY CLOSE CHECKLIST
  // ════════════════════════════════════════════

  const monthItems = allItems.filter(
    (i: { performed_at: string; }) => i.performed_at && i.performed_at >= monthStart && i.performed_at <= monthEnd
  );
  const monthDrafts = monthItems.filter((i: { status: string; }) => ["draft", "to_validate"].includes(i.status));
  const monthReady = monthItems.filter((i: { status: string; }) => ["validated", "ready"].includes(i.status));
  const monthExported = monthItems.filter((i: { status: string; }) => i.status === "exported");
  const monthInvoiced = monthItems.filter((i: { status: string; }) => i.status === "invoiced");
  const monthNoPrice = monthItems.filter((i: { unit_price: number; }) => Number(i.unit_price) <= 0);
  const monthNoClient = monthItems.filter((i: { client_id: string | null; }) => !i.client_id);

  const monthTotalHt = monthItems.reduce((s: number, i: { total: number; }) => s + (Number(i.total) || 0), 0);
  const monthReadyHt = monthReady.reduce((s: number, i: { total: number; }) => s + (Number(i.total) || 0), 0);

  interface CheckItem {
    id: string;
    label: string;
    description: string;
    done: boolean;
    count?: number;
    severity: "success" | "warning" | "error";
  }

  const checklist: CheckItem[] = [
    {
      id: "no-zero-price",
      label: "Aucune ligne sans prix",
      description: monthNoPrice.length > 0
        ? `${monthNoPrice.length} ligne${monthNoPrice.length > 1 ? "s" : ""} sans prix ce mois-ci`
        : "Toutes les lignes ont un prix renseigné",
      done: monthNoPrice.length === 0,
      count: monthNoPrice.length,
      severity: monthNoPrice.length > 0 ? "error" : "success",
    },
    {
      id: "no-missing-client",
      label: "Toutes les lignes ont un client",
      description: monthNoClient.length > 0
        ? `${monthNoClient.length} ligne${monthNoClient.length > 1 ? "s" : ""} sans client`
        : "Chaque prestation est attribuée à un client",
      done: monthNoClient.length === 0,
      count: monthNoClient.length,
      severity: monthNoClient.length > 0 ? "warning" : "success",
    },
    {
      id: "no-drafts",
      label: "Aucun brouillon restant",
      description: monthDrafts.length > 0
        ? `${monthDrafts.length} brouillon${monthDrafts.length > 1 ? "s" : ""} à finaliser`
        : "Tous les brouillons ont été traités",
      done: monthDrafts.length === 0,
      count: monthDrafts.length,
      severity: monthDrafts.length > 0 ? "warning" : "success",
    },
    {
      id: "all-exported",
      label: "Prestations validées exportées",
      description: monthReady.length > 0
        ? `${monthReady.length} prestation${monthReady.length > 1 ? "s" : ""} prête${monthReady.length > 1 ? "s" : ""} en attente d'export`
        : "Toutes les prestations validées ont été exportées",
      done: monthReady.length === 0,
      count: monthReady.length,
      severity: monthReady.length > 0 ? "warning" : "success",
    },
    {
      id: "no-forgotten",
      label: "Aucune facturation oubliée",
      description: suggestions.length > 0
        ? `${suggestions.length} suggestion${suggestions.length > 1 ? "s" : ""} de facturation potentiellement oubliée`
        : "Aucune prestation oubliée détectée",
      done: suggestions.length === 0,
      count: suggestions.length,
      severity: suggestions.length > 0 ? "warning" : "success",
    },
    {
      id: "month-has-items",
      label: "Des prestations sont enregistrées",
      description: monthItems.length > 0
        ? `${monthItems.length} prestation${monthItems.length > 1 ? "s" : ""} ce mois-ci`
        : "Aucune prestation enregistrée ce mois-ci",
      done: monthItems.length > 0,
      count: monthItems.length,
      severity: monthItems.length === 0 ? "info" as "warning" : "success",
    },
  ];

  // ════════════════════════════════════════════
  // 4. HEALTH SCORE
  // ════════════════════════════════════════════

  const errorCount = anomalies.filter(a => a.severity === "error").length;
  const warningCount = anomalies.filter(a => a.severity === "warning").length;
  const infoCount = anomalies.filter(a => a.severity === "info").length;

  // Score: start at 100, deduct per issue
  let score = 100;
  score -= errorCount * 10;
  score -= warningCount * 4;
  score -= infoCount * 1;
  score -= suggestions.length * 3;

  // Pénalité ratio paiement : commandes livrées/facturées non payées
  // allOrders contient delivered + invoiced + paid
  const totalFinalized = allOrders.length;
  const totalPaid = allOrders.filter((o: { status: string }) => o.status === "paid").length;
  const unpaidRatio = totalFinalized > 0 ? (totalFinalized - totalPaid) / totalFinalized : 0;
  // Pénalité proportionnelle : 30 pts max si 100% impayé
  score -= Math.round(unpaidRatio * 30);

  score = Math.max(0, Math.min(100, score));

  // If no items AND no finalized orders, neutral score
  if (allItems.length === 0 && totalFinalized === 0) score = 100;

  return NextResponse.json({
    score,
    anomalies,
    suggestions,
    checklist,
    month: {
      label: now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
      totalItems: monthItems.length,
      totalHt: monthTotalHt,
      readyHt: monthReadyHt,
      drafts: monthDrafts.length,
      ready: monthReady.length,
      exported: monthExported.length,
      invoiced: monthInvoiced.length,
    },
    counts: {
      errors: errorCount,
      warnings: warningCount,
      infos: infoCount,
      suggestions: suggestions.length,
    },
    payments: {
      totalFinalized: totalFinalized,
      totalPaid,
      unpaidCount: totalFinalized - totalPaid,
      paidRatio: totalFinalized > 0 ? Math.round((totalPaid / totalFinalized) * 100) : 100,
    },
  });
}
