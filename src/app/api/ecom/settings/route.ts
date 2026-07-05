/**
 * GET  /api/ecom/settings  → renvoie les settings ROAS de l'user (defaults si absent)
 * PATCH /api/ecom/settings → upsert + déclenche recompute background 30j
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEcomSettings, refreshUserCampaignPerformance } from "@/lib/ads/roas-engine";
import { z } from "zod";

export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const settings = await getEcomSettings(auth.user.id);
  return NextResponse.json({ settings });
}

const Patch = z.object({
  roas_profitability_threshold: z.number().min(0).max(20).optional(),
  roas_warning_threshold: z.number().min(0).max(20).optional(),
  net_margin_percent: z.number().min(0).max(100).optional(),
  attribution_window_days: z.number().int().min(1).max(90).optional(),
  attribution_model: z.enum(["first_touch", "last_touch", "linear", "u_shaped"]).optional(),
  default_currency: z.string().min(3).max(3).optional(),
  alerts_enabled: z.boolean().optional(),
  alert_drop_threshold_percent: z.number().min(0).max(100).optional(),
  alert_min_spend_cents: z.number().int().min(0).optional(),
  email_digest_enabled: z.boolean().optional(),
  email_digest_frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  // Frais par commande (Réglages coûts — coûts variables du BE-ROAS)
  shipping_cost_cents: z.number().int().min(0).optional(),
  payment_fee_percent: z.number().min(0).max(100).optional(),
  payment_fee_fixed_cents: z.number().int().min(0).optional(),
  packaging_cost_cents: z.number().int().min(0).optional(),
});

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const parsed = Patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Body invalide" }, { status: 400 });

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("ecom_settings") as any).upsert({
    user_id: auth.user.id,
    ...parsed.data,
  }, { onConflict: "user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fire-and-forget recompute des 30 derniers jours pour appliquer les nouveaux seuils
  refreshUserCampaignPerformance({ userId: auth.user.id, daysBack: 30 })
    .catch((e) => console.error("[ecom/settings] recompute failed:", e));

  return NextResponse.json({ ok: true });
}
