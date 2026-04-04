import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

/**
 * GET /api/settings — full profile + settings + workspace + notifications
 * PATCH /api/settings — update any combination of profile fields
 */

export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("profiles") as any)
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();

  // Whitelist of allowed top-level fields
  const allowed = [
    "full_name", "business_name", "avatar_url", "phone", "role",
    "locale", "timezone",
    "settings", "workspace", "notifications",
  ];

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // For JSONB fields (settings, workspace, notifications), merge with existing data
  if (updates.settings && typeof updates.settings === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current } = await (supabase.from("profiles") as any)
      .select("settings")
      .eq("id", user.id)
      .single();
    updates.settings = { ...(current?.settings || {}), ...(updates.settings as Record<string, unknown>) };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("profiles") as any)
    .update(updates)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
