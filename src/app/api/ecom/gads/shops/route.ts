import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/ecom/gads/shops — boutiques pixel de l'utilisateur, pour le
 * sélecteur de boutique du module Analytics (Phase 5).
 */
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("pixel_shops") as any)
    .select("id, shop_domain, label, is_active")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ shops: data ?? [] });
}
