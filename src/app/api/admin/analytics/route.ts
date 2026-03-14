import { NextResponse } from "next/server";
import {
  requireAdmin,
  checkAdminRateLimit,
  logAdminAction,
  ADMIN_ACTIONS,
} from "@/lib/admin";

// GET — Métriques analytics produit pour le dashboard admin V3
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user, adminClient } = auth;

  // Rate limit : 30 requêtes/min
  const rateLimitResponse = checkAdminRateLimit(user.id, "analytics", 30);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "analytics" });
    return rateLimitResponse;
  }

  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
  const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();

  // Récupérer les événements des 7 et 30 derniers jours
  const [events7dRes, events30dRes] = await Promise.all([
    (adminClient.from("product_events") as any)
      .select("user_id, event_name, event_category, created_at")
      .gte("created_at", d7),
    (adminClient.from("product_events") as any)
      .select("user_id, event_name, event_category, created_at")
      .gte("created_at", d30),
  ]);

  const allEvents7d = events7dRes.data || [];
  const allEvents30d = events30dRes.data || [];

  // DAU / WAU / MAU
  const todayStr = now.toISOString().split("T")[0];
  const dauUsers = new Set(
    allEvents7d
      .filter((e: any) => e.created_at.startsWith(todayStr))
      .map((e: any) => e.user_id),
  );
  const wauUsers = new Set(allEvents7d.map((e: any) => e.user_id));
  const mauUsers = new Set(allEvents30d.map((e: any) => e.user_id));

  // Répartition par catégorie (30j)
  const categoryBreakdown: Record<string, number> = {};
  for (const e of allEvents30d) {
    categoryBreakdown[e.event_category] = (categoryBreakdown[e.event_category] || 0) + 1;
  }

  // Top événements (30j)
  const eventCounts: Record<string, number> = {};
  for (const e of allEvents30d) {
    eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;
  }
  const topEvents = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Tendance DAU sur les 7 derniers jours
  const dailyDau: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    const users = new Set(
      allEvents7d
        .filter((e: any) => e.created_at.startsWith(dateStr))
        .map((e: any) => e.user_id),
    );
    dailyDau.push({ date: dateStr, count: users.size });
  }

  // Funnel d'activation : ressources clés par utilisateur
  const [totalUsersRes, usersWithOrdersRes, usersWithClientsRes, usersWithProductsRes, usersWithSitesRes] =
    await Promise.all([
      (adminClient.from("profiles") as any)
        .select("id", { count: "exact", head: true }),
      (adminClient.from("orders") as any)
        .select("user_id"),
      (adminClient.from("clients") as any)
        .select("user_id"),
      (adminClient.from("products") as any)
        .select("owner_id"),
      (adminClient.from("sites") as any)
        .select("owner_id"),
    ]);

  const totalUsers = totalUsersRes.count || 0;
  const orderUsers = new Set((usersWithOrdersRes.data || []).map((r: any) => r.user_id));
  const clientUsers = new Set((usersWithClientsRes.data || []).map((r: any) => r.user_id));
  const productUsers = new Set((usersWithProductsRes.data || []).map((r: any) => r.owner_id));
  const siteUsers = new Set((usersWithSitesRes.data || []).map((r: any) => r.owner_id));

  // Activé = a un client + un produit + (une commande OU un site)
  const allUserIds = new Set([...orderUsers, ...clientUsers, ...productUsers, ...siteUsers]);
  let activatedCount = 0;
  for (const uid of allUserIds) {
    if (clientUsers.has(uid) && productUsers.has(uid) && (orderUsers.has(uid) || siteUsers.has(uid))) {
      activatedCount++;
    }
  }

  return NextResponse.json({
    dau: dauUsers.size,
    wau: wauUsers.size,
    mau: mauUsers.size,
    total_users: totalUsers,
    daily_dau: dailyDau,
    category_breakdown: categoryBreakdown,
    top_events: topEvents,
    total_events_30d: allEvents30d.length,
    activation: {
      total: totalUsers,
      with_orders: orderUsers.size,
      with_clients: clientUsers.size,
      with_products: productUsers.size,
      with_sites: siteUsers.size,
      activated: activatedCount,
    },
  });
}
