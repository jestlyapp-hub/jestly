import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isLikelyBot } from "@/lib/pixel/collect";
import { PpsPayloadSchema } from "@/lib/pixel/pps";

/**
 * POST /api/pixel/pps — réponse au Post-Purchase Survey (page de statut de
 * commande Shopify). Public, CORS ouvert, text/plain (pas de preflight).
 * Une seule réponse par commande : la PREMIÈRE fait foi (conflit ignoré).
 * Réponse 204 même sur pixel inconnu — pas d'oracle.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const RATE_LIMIT_PER_MINUTE = 30;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
    if (rateBuckets.size > 10_000) {
      for (const [k, b] of rateBuckets) if (b.resetAt < now) rateBuckets.delete(k);
    }
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_PER_MINUTE;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const respond = (status: number) => new NextResponse(null, { status, headers: CORS_HEADERS });

  if (isLikelyBot(req.headers.get("user-agent"))) return respond(204);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return respond(429);

  let json: unknown;
  try {
    json = JSON.parse(await req.text());
  } catch {
    return respond(400);
  }
  const parsed = PpsPayloadSchema.safeParse(json);
  if (!parsed.success) return respond(400);

  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: shop } = await (supabase.from("pixel_shops") as any)
      .select("id")
      .eq("id", parsed.data.pixel_id)
      .eq("is_active", true)
      .maybeSingle();
    if (shop) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("pps_responses") as any).upsert({
        shop_id: shop.id,
        shopify_order_id: parsed.data.order_id,
        answer: parsed.data.answer,
      }, { onConflict: "shop_id,shopify_order_id", ignoreDuplicates: true }); // la première réponse fait foi
    }
  } catch {
    // Jamais d'erreur visible côté boutique.
  }
  return respond(204);
}
