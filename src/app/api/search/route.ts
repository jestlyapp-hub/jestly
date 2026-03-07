import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { type SearchResult, statusLabels } from "@/lib/search-utils";

// GET /api/search?q=query
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Try Supabase first
  try {
    const auth = await getAuthUser();
    if (!auth.error) {
      const { user, supabase } = auth;
      const results: SearchResult[] = [];
      const pattern = `%${q}%`;

      // Search clients
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: dbClients } = await (supabase.from("clients") as any)
        .select("id, name, email, total_revenue")
        .eq("user_id", user.id)
        .or(`name.ilike.${pattern},email.ilike.${pattern}`)
        .limit(5);

      if (dbClients) {
        for (const c of dbClients) {
          results.push({
            id: c.id,
            type: "client",
            title: c.name,
            subtitle: c.email,
            amount: c.total_revenue ?? 0,
            href: "/clients",
          });
        }
      }

      // Search orders
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: dbOrders } = await (supabase.from("orders") as any)
        .select("id, status, total_cents, created_at, clients(name), services(title)")
        .eq("user_id", user.id)
        .limit(5);

      if (dbOrders) {
        const lq = q.toLowerCase();
        for (const o of dbOrders) {
          const clientName = o.clients?.name ?? "";
          const serviceTitle = o.services?.title ?? "";
          const orderId = o.id ?? "";
          if (
            clientName.toLowerCase().includes(lq) ||
            serviceTitle.toLowerCase().includes(lq) ||
            orderId.toLowerCase().includes(lq)
          ) {
            results.push({
              id: o.id,
              type: "order",
              title: `${serviceTitle || "Commande"}`,
              subtitle: clientName,
              status: o.status,
              date: o.created_at?.slice(0, 10),
              amount: o.total_cents ? o.total_cents / 100 : undefined,
              href: "/commandes",
            });
          }
        }
      }

      // Search products (services table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: dbProducts } = await (supabase.from("services") as any)
        .select("id, title, price_cents, category")
        .eq("user_id", user.id)
        .or(`title.ilike.${pattern},category.ilike.${pattern}`)
        .limit(5);

      if (dbProducts) {
        for (const p of dbProducts) {
          results.push({
            id: p.id,
            type: "product",
            title: p.title,
            subtitle: p.price_cents ? `${(p.price_cents / 100).toFixed(0)} \u20ac` : p.category ?? "",
            amount: p.price_cents ? p.price_cents / 100 : undefined,
            href: "/produits",
          });
        }
      }

      // Search tasks (include archived — search should find everything)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: dbTasks } = await (supabase.from("tasks") as any)
          .select("id, title, status, priority, due_date, client_name, tags, archived_at")
          .eq("user_id", user.id)
          .or(`title.ilike.${pattern},client_name.ilike.${pattern}`)
          .limit(8);

        if (dbTasks) {
          for (const t of dbTasks) {
            results.push({
              id: t.id,
              type: "task",
              title: t.title,
              subtitle: t.client_name || (statusLabels[t.status] ?? t.status),
              status: t.status,
              date: t.due_date,
              href: `/taches/${t.id}`,
            });
          }
        }
      } catch (e) {
        console.error("[/api/search] Task search error:", e);
      }

      return NextResponse.json({ results });
    }
  } catch (e) {
    console.error("[/api/search] Auth/DB error:", e);
  }

  // No auth or DB entirely unavailable — return empty results
  return NextResponse.json({ results: [] });
}
