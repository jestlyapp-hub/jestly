import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "active";

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from("ads_alerts") as any)
    .select("*")
    .eq("user_id", auth.user.id)
    .order("severity", { ascending: false })
    .order("detected_at", { ascending: false })
    .limit(50);
  if (status !== "all") q = q.eq("status", status);
  const { data } = await q;
  return NextResponse.json({ alerts: data ?? [] });
}
