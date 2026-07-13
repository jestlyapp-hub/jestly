/**
 * GET /api/integrations/shopify/sync-state
 * État de sync des boutiques Shopify de l'user (multi-boutiques).
 * Utilisé par le sélecteur de boutique + la barre de progression du SetupModal.
 *
 * Renvoie :
 *  - `integrations` : toutes les boutiques (principale d'abord), chacune avec
 *    son `sync_state` (progression de la sync initiale).
 *  - `integration` : la boutique PRINCIPALE (rétro-compat des consommateurs
 *    mono-boutique : IntegrationsTab, GeneralTab, use-account-memory).
 */
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

interface SyncStateRow {
  initial_sync_completed: boolean;
  initial_sync_progress: Record<string, unknown>;
}

const DEFAULT_SYNC_STATE: SyncStateRow = {
  initial_sync_completed: false,
  initial_sync_progress: {},
};

export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Toutes les boutiques Shopify du user (tous statuts), principale d'abord.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from("integrations") as any)
    .select("id, shop_domain, status, last_sync_at, last_error, metadata, created_at")
    .eq("user_id", user.id)
    .eq("provider", "shopify")
    .order("created_at", { ascending: true });

  const integrationRows = (rows ?? []) as Array<{
    id: string;
    shop_domain: string;
    status: string;
    last_sync_at: string | null;
    last_error: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
  }>;

  if (integrationRows.length === 0) {
    return NextResponse.json({ connected: false, integrations: [] });
  }

  // État de sync par boutique.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: states } = await (supabase.from("shopify_sync_state") as any)
    .select("integration_id, initial_sync_completed, initial_sync_progress")
    .in("integration_id", integrationRows.map((r) => r.id));

  const stateByIntegration = new Map<string, SyncStateRow>();
  for (const s of (states ?? []) as Array<{ integration_id: string } & SyncStateRow>) {
    stateByIntegration.set(s.integration_id, {
      initial_sync_completed: s.initial_sync_completed,
      initial_sync_progress: s.initial_sync_progress ?? {},
    });
  }

  const integrations = integrationRows.map((r) => ({
    ...r,
    sync_state: stateByIntegration.get(r.id) ?? DEFAULT_SYNC_STATE,
  }));

  const primary = integrations[0];

  return NextResponse.json({
    connected: true,
    // Rétro-compat mono-boutique : la boutique principale + son état.
    integration: primary,
    sync_state: primary.sync_state,
    // Multi-boutiques : toutes les boutiques avec leur état.
    integrations,
  });
}
