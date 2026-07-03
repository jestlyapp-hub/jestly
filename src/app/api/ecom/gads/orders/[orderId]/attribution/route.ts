import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

/**
 * Attribution manuelle d'une commande — table SÉPARÉE
 * (order_manual_attribution). Ne touche JAMAIS les champs d'attribution
 * réels de shopify_orders : l'hypothèse ne remplace pas la mesure.
 */

const Body = z.object({
  channel: z.enum(["google_ads", "seo", "pinterest", "other", "ghost"]),
  confidence: z.enum(["sure", "assumed", "guessed"]).nullable().optional(),
  note: z.string().trim().max(500).nullable().optional(),
}).refine((b) => b.channel === "ghost" || b.confidence != null, {
  message: "Le niveau de confiance (sûr / supposé / deviné) est obligatoire quand un canal est choisi",
});

/** La commande appartient-elle bien à cet utilisateur ? */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function orderBelongsToUser(supabase: any, orderId: string, userId: string): Promise<boolean> {
  const { data: order } = await supabase.from("shopify_orders")
    .select("integration_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return false;
  const { data: integ } = await supabase.from("integrations")
    .select("user_id")
    .eq("id", order.integration_id)
    .maybeSingle();
  return integ?.user_id === userId;
}

/** PUT — pose ou remplace l'attribution manuelle de la commande. */
export async function PUT(req: NextRequest, ctx: { params: Promise<{ orderId: string }> }) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { orderId } = await ctx.params;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Body invalide" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  if (!(await orderBelongsToUser(supabase, orderId, auth.user.id))) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("order_manual_attribution") as any)
    .upsert({
      user_id: auth.user.id,
      order_id: orderId,
      channel: parsed.data.channel,
      confidence: parsed.data.channel === "ghost" ? null : parsed.data.confidence,
      note: parsed.data.note ?? null,
      attributed_at: new Date().toISOString(),
      attributed_by: auth.user.email ?? auth.user.id,
    }, { onConflict: "order_id" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, attribution: data });
}

/** DELETE — retire l'attribution manuelle (retour à « non examiné »). */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ orderId: string }> }) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { orderId } = await ctx.params;

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("order_manual_attribution") as any)
    .delete()
    .eq("order_id", orderId)
    .eq("user_id", auth.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
