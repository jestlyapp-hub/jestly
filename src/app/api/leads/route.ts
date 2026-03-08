import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

// GET /api/leads — list leads for the authenticated user's sites
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { data: sites } = await (supabase.from("sites") as any)
    .select("id")
    .eq("owner_id", user.id);

  if (!sites || sites.length === 0) {
    return NextResponse.json([]);
  }

  const siteIds = sites.map((s: { id: string }) => s.id);

  const { data, error } = await (supabase.from("leads") as any)
    .select("*")
    .in("site_id", siteIds)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// PATCH /api/leads — update lead status or notes
export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { id, status, notes } = body as { id?: string; status?: string; notes?: string };

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Verify ownership: lead must belong to user's site
  const { data: sites } = await (supabase.from("sites") as any)
    .select("id")
    .eq("owner_id", user.id);

  if (!sites || sites.length === 0) {
    return NextResponse.json({ error: "No sites found" }, { status: 403 });
  }

  const siteIds = sites.map((s: { id: string }) => s.id);

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (notes !== undefined) updates.notes = notes;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await (supabase.from("leads") as any)
    .update(updates)
    .eq("id", id)
    .in("site_id", siteIds)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  return NextResponse.json(data);
}
