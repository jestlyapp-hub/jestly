import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { id } = await ctx.params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (auth.supabase.from("shopify_orders") as any)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ data });
}
