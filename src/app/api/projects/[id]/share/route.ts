import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/projects/[id]/share — toggle sharing, generate token
export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id: projectId } = await ctx.params;

  let body: { enabled: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    share_enabled: body.enabled,
  };

  // Generate token if enabling and none exists
  if (body.enabled) {
    const { data: existing } = await (supabase.from("projects") as any)
      .select("share_token")
      .eq("id", projectId)
      .single();

    if (!existing?.share_token) {
      // Generate a short readable token
      const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
      updates.share_token = token;
    }
  }

  const { error } = await (supabase.from("projects") as any)
    .update(updates)
    .eq("id", projectId);

  if (error) {
    console.error("[project-share] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return updated project share info
  const { data } = await (supabase.from("projects") as any)
    .select("share_token, share_enabled")
    .eq("id", projectId)
    .single();

  return NextResponse.json({
    shareToken: data?.share_token,
    shareEnabled: data?.share_enabled,
  });
}
