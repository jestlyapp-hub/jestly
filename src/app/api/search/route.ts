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
  const tagsParam = req.nextUrl.searchParams.get("tags") || null;
  const tagFilters = tagsParam ? tagsParam.split(",").map(t => t.trim()).filter(Boolean) : [];

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (process.env.NODE_ENV === "development") {
    console.log("GLOBAL_SEARCH_QUERY", { q, entityType, tagFilters });
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
      let mapped = data.map(mapV2Row);

      // Filter by tags if requested (tags stored in metadata JSONB)
      if (tagFilters.length > 0) {
        mapped = mapped.filter((r: SearchResult) => {
          const itemTags: string[] = r.tags || [];
          const metaTags: string[] = r.meta?.tags ? String(r.meta.tags).split(",").map(t => t.trim()) : [];
          const allTags = [...itemTags, ...metaTags].map(t => t.toLowerCase());
          return tagFilters.every(tf => allTags.includes(tf.toLowerCase()));
        });
      }

      return NextResponse.json({ results: mapped });
    }

    // V2 returned empty — fall through to legacy search
    // (search_documents may not be synced yet)
  } catch {
    // fn_search_v2 not available — fall through to legacy
  }

  // 2) Legacy fallback: direct table queries (works without migration 033)
  // Strip # from query for ILIKE (tags don't contain # in DB)
  const cleanQ = q.replace(/#/g, "").trim();
  const results: SearchResult[] = [];
  if (cleanQ.length >= 2) {
    await legacySearch(supabase, user.id, cleanQ, entityType, results);
  }

  if (process.env.NODE_ENV === "development") {
    console.log("GLOBAL_SEARCH_RESULTS", { count: results.length, types: [...new Set(results.map((r) => r.type))] });
  }

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

  // Extract tags from metadata
  const metaTags: string[] = row.metadata?.tags
    ? (Array.isArray(row.metadata.tags) ? row.metadata.tags : String(row.metadata.tags).split(",").map(t => t.trim()))
    : [];

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
    tags: metaTags.length > 0 ? metaTags : undefined,
    score: row.rank_score,
    meta: row.metadata || undefined,
  };
}

/* ─── Sanitize ILIKE special chars ─── */
function sanitizeIlike(q: string): string {
  return q.replace(/[%_,\\]/g, (c) => `\\${c}`);
}

/* ─── Legacy fallback (no V2 migration) ─── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function legacySearch(supabase: any, userId: string, q: string, entityType: string | null, results: SearchResult[]) {
  const pattern = `%${sanitizeIlike(q)}%`;

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
          const productName = o.title ?? "";
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
            status: p.status ?? "active",
            href: "/produits",
          });
        }
      }
    } catch { /* table may not exist */ }
  }

  // Tasks — search title, client_name, tags, subtasks
  if (shouldSearch("task")) {
    try {
      // Fetch tasks matching title or client_name via ILIKE
      const { data: tasks } = await (supabase.from("tasks") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .select("id, title, status, priority, due_date, client_name, archived_at, tags, subtasks")
        .eq("user_id", userId)
        .or(`title.ilike.${pattern},client_name.ilike.${pattern}`)
        .limit(10);

      // Also fetch tasks where JSONB tags or subtasks might match
      // (ILIKE doesn't work on JSONB, so fetch recent tasks and filter in memory)
      const { data: allTasks } = await (supabase.from("tasks") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .select("id, title, status, priority, due_date, client_name, archived_at, tags, subtasks")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(100);

      // Merge and deduplicate
      const taskMap = new Map<string, typeof tasks[0]>();
      for (const t of (tasks || [])) taskMap.set(t.id, t);

      const lq = q.toLowerCase();
      for (const t of (allTasks || [])) {
        if (taskMap.has(t.id)) continue; // already matched by ILIKE

        // Check tags (JSONB array)
        const tags: string[] = Array.isArray(t.tags) ? t.tags : [];
        const tagMatch = tags.some((tag: string) => tag.toLowerCase().includes(lq));

        // Check subtasks text (JSONB array of {id, text, done})
        const subs: { text?: string }[] = Array.isArray(t.subtasks) ? t.subtasks : [];
        const subMatch = subs.some((s) => s.text?.toLowerCase().includes(lq));

        if (tagMatch || subMatch) {
          taskMap.set(t.id, t);
        }
      }

      for (const t of taskMap.values()) {
        const tags: string[] = Array.isArray(t.tags) ? t.tags : [];
        const subs: { text?: string }[] = Array.isArray(t.subtasks) ? t.subtasks : [];
        const subTexts = subs.map((s) => s.text).filter(Boolean);

        results.push({
          id: t.id,
          type: "task",
          title: t.title,
          subtitle: [t.client_name, tags.length > 0 ? tags.map((tg: string) => `#${tg}`).join(" ") : ""].filter(Boolean).join(" · "),
          description: subTexts.length > 0 ? `Sous-tâches: ${subTexts.join(", ")}` : undefined,
          status: t.status,
          priority: t.priority,
          date: t.due_date,
          archived: !!t.archived_at,
          tags: tags.length > 0 ? tags : undefined,
          href: `/taches/${t.id}`,
        });
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
