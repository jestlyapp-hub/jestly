import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/public/products?site_id=X — public active products for a site
export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("site_id");
  if (!siteId) {
    return NextResponse.json({ error: "site_id est requis" }, { status: 400 });
  }

  const supabase = await createClient();

  // Get site owner
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: site } = await (supabase.from("sites") as any)
    .select("owner_id")
    .eq("id", siteId)
    .eq("status", "published")
    .single();

  if (!site) {
    return NextResponse.json({ error: "Site introuvable" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("products") as any)
    .select("*")
    .eq("owner_id", site.owner_id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
