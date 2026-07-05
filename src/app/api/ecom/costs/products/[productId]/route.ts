import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const Body = z.object({
  unit_cost_cents: z.number().int().min(0),
  /** Par défaut aujourd'hui — les commandes passées gardent leur version. */
  effective_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

/**
 * PUT /api/ecom/costs/products/[productId] — pose ou met à jour le COGS.
 * Versionné : une écriture le même jour remplace la version du jour,
 * une écriture un autre jour crée une nouvelle version (l'historique reste juste).
 */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ productId: string }> }) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { productId } = await ctx.params;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Body invalide" }, { status: 400 });
  }

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("ecom_product_costs") as any)
    .upsert({
      user_id: auth.user.id,
      shopify_product_id: productId,
      unit_cost_cents: parsed.data.unit_cost_cents,
      effective_from: parsed.data.effective_from ?? new Date().toISOString().slice(0, 10),
    }, { onConflict: "user_id,shopify_product_id,effective_from" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, cost: data });
}
