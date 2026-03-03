import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TABLES = [
  "profiles",
  "clients",
  "services",
  "orders",
  "invoices",
  "tasks",
  "sites",
  "site_pages",
  "site_blocks",
  "site_published_snapshots",
  "site_assets",
  "site_product_links",
  "leads",
  "analytics_events",
  "order_items",
  "order_submissions",
  "client_notes",
  "client_events",
];

export async function GET() {
  const supabase = await createClient();

  const results: Record<string, boolean> = {};

  for (const table of TABLES) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from(table) as any).select("*").limit(0);
      results[table] = !error;
    } catch {
      results[table] = false;
    }
  }

  const missing = Object.entries(results)
    .filter(([, ok]) => !ok)
    .map(([t]) => t);

  return NextResponse.json({
    ok: missing.length === 0,
    tables: results,
    missing,
  });
}
