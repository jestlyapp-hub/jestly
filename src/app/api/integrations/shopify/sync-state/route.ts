/**
 * GET /api/integrations/shopify/sync-state
 * Retourne l'état de sync de l'intégration Shopify active de l'user.
 * Utilisé par la barre de progression du SetupModal et le header du dashboard.
 */
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { isBetaEmail } from "@/lib/beta";

export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const is_beta = isBetaEmail(user.email);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration } = await (supabase.from("integrations") as any)
    .select("id, shop_domain, status, last_sync_at, last_error, metadata, created_at")
    .eq("user_id", user.id)
    .eq("provider", "shopify")
    .maybeSingle();

  if (!integration) {
    return NextResponse.json({ connected: false, is_beta });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: state } = await (supabase.from("shopify_sync_state") as any)
    .select("*")
    .eq("integration_id", integration.id)
    .maybeSingle();

  return NextResponse.json({
    connected: true,
    is_beta,
    integration,
    sync_state: state ?? {
      initial_sync_completed: false,
      initial_sync_progress: {},
    },
  });
}
