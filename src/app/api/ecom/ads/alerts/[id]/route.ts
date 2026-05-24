import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const Body = z.object({
  status: z.enum(["acknowledged", "resolved", "dismissed"]),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { id } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Body invalide" }, { status: 400 });

  const supabase = createAdminClient();
  const timestampField = parsed.data.status === "acknowledged" ? "acknowledged_at"
    : parsed.data.status === "resolved" ? "resolved_at"
    : "dismissed_at";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("ads_alerts") as any)
    .update({ status: parsed.data.status, [timestampField]: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
