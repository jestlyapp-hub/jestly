import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { isAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// GET — List all waitlist entries (admin only)
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  if (!isAdmin(auth.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Use admin client (service_role) to bypass RLS
  const supabase = createAdminClient();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const job_type = url.searchParams.get("job_type");
  const search = url.searchParams.get("search");
  const sort = url.searchParams.get("sort") || "created_at";
  const order = url.searchParams.get("order") || "desc";
  const limit = parseInt(url.searchParams.get("limit") || "200");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  let query = (supabase.from("waitlist") as ReturnType<typeof supabase.from>).select("*", { count: "exact" });

  if (status && status !== "all") {
    if (status === "new") {
      // Include both 'new' and null status (entries inserted without explicit status)
      query = query.or("status.eq.new,status.is.null");
    } else {
      query = query.eq("status", status);
    }
  }
  if (job_type && job_type !== "all") {
    query = query.eq("job_type", job_type);
  }
  if (search) {
    query = query.or(
      `email.ilike.%${search}%,first_name.ilike.%${search}%,twitter.ilike.%${search}%`
    );
  }

  query = query.order(sort, { ascending: order === "asc" });
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[admin/waitlist] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ data: data || [], total: count || 0 });
}

// PATCH — Update waitlist entry (status, notes, tags, score)
export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  if (!isAdmin(auth.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  const allowed = ["status", "notes", "tags", "score", "invited_at", "last_contacted_at"];
  const safeUpdates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) {
      safeUpdates[key] = updates[key];
    }
  }

  const { data, error } = await (supabase.from("waitlist") as ReturnType<typeof supabase.from>)
    .update(safeUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[admin/waitlist] PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE — Delete waitlist entry
export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  if (!isAdmin(auth.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  const { error } = await (supabase.from("waitlist") as ReturnType<typeof supabase.from>)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[admin/waitlist] DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
