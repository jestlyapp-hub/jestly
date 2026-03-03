import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/leads — list leads for the authenticated user's sites
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Get user's site IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sites } = await (supabase.from("sites") as any)
    .select("id")
    .eq("owner_id", user.id);

  if (!sites || sites.length === 0) {
    return NextResponse.json([]);
  }

  const siteIds = sites.map((s: { id: string }) => s.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("leads") as any)
    .select("*")
    .in("site_id", siteIds)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
