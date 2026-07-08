import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import {
  deriveMeasuredChannel,
  resolveUnifiedChannel,
  type Channel,
  type DisplayChannel,
  type ManualConfidence,
  type PixelResolvedSource,
} from "@/lib/gads/channels";

/**
 * Détail d'une commande + son attribution RÉSOLUE (la même vérité unifiée que
 * partout ailleurs : natif > pixel > manuel > non attribué). On ne renvoie plus
 * le `source_name`/`utm_source` brut comme canal — la carte Attribution du détail
 * doit coïncider avec la vue Commandes, jamais diverger.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { id } = await ctx.params;
  const supabase = auth.supabase;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("shopify_orders") as any)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const [{ data: pixel }, { data: manual }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("pixel_order_attribution") as any)
      .select("resolved_source, match_method, confidence")
      .eq("order_id", id)
      .maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("order_manual_attribution") as any)
      .select("channel, confidence, note")
      .eq("order_id", id)
      .eq("user_id", auth.user.id)
      .maybeSingle(),
  ]);

  const measured = deriveMeasuredChannel({
    tracking_status: data.tracking_status ?? null,
    utm_source: data.utm_source ?? null,
    utm_medium: data.utm_medium ?? null,
    utm_campaign: data.utm_campaign ?? null,
    referring_site: data.referring_site ?? null,
    landing_site: data.landing_site ?? null,
  });
  const pixelObj = pixel ? { resolved_source: pixel.resolved_source as PixelResolvedSource } : null;
  const manualObj = manual
    ? { channel: manual.channel as Channel, confidence: (manual.confidence ?? null) as ManualConfidence | null, note: (manual.note ?? null) as string | null }
    : null;
  const channel: DisplayChannel = resolveUnifiedChannel({
    measured,
    pixel: pixelObj,
    manual: manualObj ? { channel: manualObj.channel } : null,
  });
  // Origine de la vérité retenue (pilote le badge coloré, comme l'Attribution Board).
  const origin: "native" | "pixel" | "manual" | "unattributed" =
    measured != null ? "native" : pixelObj != null ? "pixel"
      : manualObj != null && manualObj.channel !== "ghost" ? "manual" : "unattributed";

  return NextResponse.json({
    data: {
      ...data,
      attribution: {
        channel,
        origin,
        tracking_status: (data.tracking_status ?? null) as "tracked" | "ghost" | "unmatched" | null,
        measured_channel: measured,
        pixel: pixel ? { resolved_source: pixel.resolved_source, match_method: pixel.match_method, confidence: Number(pixel.confidence) } : null,
        manual: manualObj,
      },
    },
  });
}
