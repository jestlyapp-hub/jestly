import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import type { SearchResult } from "@/lib/search-utils";

// GET /api/search?q=query&limit=25&type=client
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") ?? "25"),
    50
  );
  const entityType = req.nextUrl.searchParams.get("type") || null;

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // 1) Try V2 search (search_documents table + fn_search_v2)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc("fn_search_v2", {
      p_query: q,
      p_user_id: user.id,
      p_limit: limit,
      p_entity_type: entityType,
    });

    if (!error && data && data.length > 0) {
      return NextResponse.json({ results: data.map(mapV2Row) });
    }

    // If RPC returned empty but no error, still return empty (not a fallback case)
    if (!error && data) {
      return NextResponse.json({ results: [] });
    }
  } catch {
    // fn_search_v2 not available — fall through to legacy
  }

  // 2) Legacy fallback: direct table queries (works without migration 033)
  const results: SearchResult[] = [];
  await legacySearch(supabase, user.id, q, entityType, results);
  return NextResponse.json({ results });
}

/* ─── Map V2 RPC row → SearchResult ─── */

interface V2Row {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  subtitle: string;
  description: string;
  breadcrumbs: string[];
  href: string;
  status: string | null;
  priority: string | null;
  amount_cents: number | null;
  item_date: string | null;
  is_archived: boolean;
  metadata: Record<string, string>;
  rank_score: number;
}

function mapV2Row(row: V2Row): SearchResult {
  const type = row.entity_type as SearchResult["type"];

  // Build subtitle: entity label + contextual info
  const subtitleParts: string[] = [];
  if (row.subtitle && row.subtitle !== row.title) {
    subtitleParts.push(row.subtitle);
  }

  // Add breadcrumbs as context
  const crumbs = (row.breadcrumbs || []).filter(Boolean);
  if (crumbs.length > 0 && !subtitleParts.some((p) => crumbs.includes(p))) {
    subtitleParts.push(...crumbs.filter((c) => !subtitleParts.includes(c)));
  }

  return {
    id: row.entity_id || row.id,
    type,
    title: row.title || "Sans titre",
    subtitle: subtitleParts.join(" · ") || undefined,
    description: row.description ? row.description.slice(0, 120) : undefined,
    breadcrumbs: crumbs.length > 0 ? crumbs : undefined,
    status: row.status ?? undefined,
    priority: row.priority ?? undefined,
    amount: row.amount_cents ? Number(row.amount_cents) : undefined,
    date: row.item_date?.slice(0, 10) ?? undefined,
    href: row.href,
    archived: row.is_archived || undefined,
    score: row.rank_score,
    meta: row.metadata || undefined,
  };
}

/* ─── Legacy fallback (no V2 migration) ─── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function legacySearch(supabase: any, userId: string, q: string, entityType: string | null, results: SearchResult[]) {
  const pattern = `%${q}%`;

  const shouldSearch = (type: string) => !entityType || entityType === type;

  // Clients
  if (shouldSearch("client")) {
    try {
      const { data: clients } = await (supabase.from("clients") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .select("id, name, email, company, total_revenue, status")
        .eq("user_id", userId)
        .or(`name.ilike.${pattern},email.ilike.${pattern},company.ilike.${pattern}`)
        .limit(5);

      if (clients) {
        for (const c of clients) {
          results.push({
            id: c.id,
            type: "client",
            title: c.name,
            subtitle: [c.email, c.company].filter(Boolean).join(" · "),
            amount: c.total_revenue ?? undefined,
            status: c.status,
            href: "/clients",
          });
        }
      }
    } catch { /* table may not exist */ }
  }

  // Orders
  if (shouldSearch("order")) {
    try {
      const { data: orders } = await (supabase.from("orders") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .select("id, title, status, amount, priority, created_at, clients(name)")
        .eq("user_id", userId)
        .limit(20);

      if (orders) {
        // Enrich with product names (separate query — PostgREST FK issue)
        const { enrichOrdersWithProducts } = await import("@/lib/supabase-helpers");
        const enrichedOrders = await enrichOrdersWithProducts(supabase, orders, userId);

        const lq = q.toLowerCase();
        for (const o of enrichedOrders) {
          const clientName = o.clients?.name ?? "";
          const productName = o.products?.name ?? "";
          const orderTitle = o.title ?? "";
          if (
            clientName.toLowerCase().includes(lq) ||
            productName.toLowerCase().includes(lq) ||
            orderTitle.toLowerCase().includes(lq) ||
            o.id?.toLowerCase().includes(lq)
          ) {
            results.push({
              id: o.id,
              type: "order",
              title: productName || orderTitle || "Commande",
              subtitle: clientName,
              status: o.status,
              priority: o.priority,
              date: o.created_at?.slice(0, 10),
              amount: o.amount ? Number(o.amount) : undefined,
              href: "/commandes",
            });
          }
        }
      }
    } catch { /* table may not exist */ }
  }

  // Products
  if (shouldSearch("product")) {
    try {
      const { data: products } = await (supabase.from("products") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .select("id, name, price_cents, category, status, short_description")
        .eq("owner_id", userId)
        .or(`name.ilike.${pattern},category.ilike.${pattern},short_description.ilike.${pattern}`)
        .limit(5);

      if (products) {
        for (const p of products) {
          results.push({
            id: p.id,
            type: "product",
            title: p.name,
            subtitle: [p.category, p.short_description].filter(Boolean).join(" · ").slice(0, 100),
            amount: p.price_cents ? Number(p.price_cents) : undefined,
            status: p.status ?? "inactive",
            href: "/produits",
          });
        }
      }
    } catch { /* table may not exist */ }
  }

  // Tasks
  if (shouldSearch("task")) {
    try {
      const { data: tasks } = await (supabase.from("tasks") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .select("id, title, status, priority, due_date, client_name, archived_at")
        .eq("user_id", userId)
        .or(`title.ilike.${pattern},client_name.ilike.${pattern}`)
        .limit(5);

      if (tasks) {
        for (const t of tasks) {
          results.push({
            id: t.id,
            type: "task",
            title: t.title,
            subtitle: t.client_name ?? "",
            status: t.status,
            priority: t.priority,
            date: t.due_date,
            archived: !!t.archived_at,
            href: `/taches/${t.id}`,
          });
        }
      }
    } catch { /* table may not exist */ }
  }

  // Projects
  if (shouldSearch("project")) {
    try {
      const { data: projects } = await (supabase.from("projects") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .select("id, name, description, status, priority, clients(name)")
        .eq("user_id", userId)
        .or(`name.ilike.${pattern},description.ilike.${pattern}`)
        .limit(5);

      if (projects) {
        for (const p of projects) {
          results.push({
            id: p.id,
            type: "project",
            title: p.name,
            subtitle: p.clients?.name ?? "",
            status: p.status,
            priority: p.priority,
            href: `/projets/${p.id}`,
          });
        }
      }
    } catch { /* table may not exist */ }
  }

  // Calendar events
  if (shouldSearch("event")) {
    try {
      const { data: events } = await (supabase.from("calendar_events") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .select("id, title, category, date, priority")
        .eq("user_id", userId)
        .or(`title.ilike.${pattern}`)
        .limit(5);

      if (events) {
        for (const e of events) {
          results.push({
            id: e.id,
            type: "event",
            title: e.title,
            subtitle: e.category ?? "",
            date: e.date,
            priority: e.priority,
            href: "/calendrier",
          });
        }
      }
    } catch { /* table may not exist */ }
  }

  // Invoices
  if (shouldSearch("invoice")) {
    try {
      const { data: invoices } = await (supabase.from("invoices") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .select("id, invoice_number, total, status, due_date, clients(name)")
        .eq("user_id", userId)
        .or(`invoice_number.ilike.${pattern}`)
        .limit(5);

      if (invoices) {
        for (const inv of invoices) {
          results.push({
            id: inv.id,
            type: "invoice",
            title: inv.invoice_number || "Facture",
            subtitle: inv.clients?.name ?? "",
            status: inv.status,
            amount: inv.total ? Number(inv.total) : undefined,
            date: inv.due_date,
            href: "/facturation",
          });
        }
      }
    } catch { /* table may not exist */ }
  }

  // Brief templates
  if (shouldSearch("brief")) {
    try {
      const { data: briefs } = await (supabase.from("brief_templates") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .select("id, name, description")
        .eq("owner_id", userId)
        .or(`name.ilike.${pattern},description.ilike.${pattern}`)
        .limit(5);

      if (briefs) {
        for (const b of briefs) {
          results.push({
            id: b.id,
            type: "brief",
            title: b.name,
            subtitle: b.description ?? "",
            href: "/briefs",
          });
        }
      }
    } catch { /* table may not exist */ }
  }
}
