import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const sb = auth.adminClient;

  // ── Total users ──────────────────────────────────────────────────
  const { count: totalUsers } = await (sb.from("profiles") as any)
    .select("id", { count: "exact", head: true });

  // ── Feature usage counts (total rows per table) ──────────────────
  const tables = [
    { key: "orders", table: "orders", label: "Commandes" },
    { key: "clients", table: "clients", label: "Clients" },
    { key: "products", table: "products", label: "Produits" },
    { key: "sites", table: "sites", label: "Sites" },
    { key: "projects", table: "projects", label: "Projets" },
    { key: "tasks", table: "tasks", label: "Taches" },
    { key: "calendar_events", table: "calendar_events", label: "Evenements calendrier" },
    { key: "briefs", table: "product_briefs", label: "Briefs" },
  ];

  const countResults = await Promise.all(
    tables.map(async (t) => {
      const { count } = await (sb.from(t.table) as any)
        .select("id", { count: "exact", head: true });
      return { ...t, count: count ?? 0 };
    }),
  );

  // ── Feature adoption: distinct users per table ───────────────────
  // We fetch distinct owner/user ids for each table
  const ownerCol: Record<string, string> = {
    orders: "user_id",
    clients: "user_id",
    products: "owner_id",
    sites: "owner_id",
    projects: "user_id",
    tasks: "user_id",
    calendar_events: "user_id",
    product_briefs: "user_id",
  };

  const adoptionResults = await Promise.all(
    tables.map(async (t) => {
      const col = ownerCol[t.table] || "user_id";
      const { data } = await (sb.from(t.table) as any).select(col);
      const uniqueUsers = new Set((data || []).map((r: any) => r[col]));
      return { key: t.key, label: t.label, users: uniqueUsers.size };
    }),
  );

  // ── Activation: users with at least (1 client + 1 product + 1 order) OR 1 site
  const [clientUsers, productUsers, orderUsers, siteUsers] = await Promise.all([
    (sb.from("clients") as any).select("user_id"),
    (sb.from("products") as any).select("owner_id"),
    (sb.from("orders") as any).select("user_id"),
    (sb.from("sites") as any).select("owner_id"),
  ]);

  const clientSet = new Set((clientUsers.data || []).map((r: any) => r.user_id));
  const productSet = new Set((productUsers.data || []).map((r: any) => r.owner_id));
  const orderSet = new Set((orderUsers.data || []).map((r: any) => r.user_id));
  const siteSet = new Set((siteUsers.data || []).map((r: any) => r.owner_id));

  // Activated = has (client + product + order) OR has site
  const allUserIds = new Set([...clientSet, ...productSet, ...orderSet, ...siteSet]);
  let activatedCount = 0;
  allUserIds.forEach((uid) => {
    const hasCore = clientSet.has(uid) && productSet.has(uid) && orderSet.has(uid);
    const hasSite = siteSet.has(uid);
    if (hasCore || hasSite) activatedCount++;
  });

  // ── Response ─────────────────────────────────────────────────────
  return NextResponse.json({
    total_users: totalUsers ?? 0,
    feature_usage: countResults.map((r) => ({
      key: r.key,
      label: r.label,
      count: r.count,
    })),
    feature_adoption: adoptionResults.map((r) => ({
      key: r.key,
      label: r.label,
      users: r.users,
      pct: totalUsers ? Math.round((r.users / totalUsers) * 100) : 0,
    })),
    activation: {
      activated: activatedCount,
      total: totalUsers ?? 0,
      pct: totalUsers ? Math.round((activatedCount / totalUsers) * 100) : 0,
    },
  });
}
