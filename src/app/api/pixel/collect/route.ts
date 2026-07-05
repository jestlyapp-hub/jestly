import { NextRequest, NextResponse } from "next/server";
import { PixelPayloadSchema, isLikelyBot, recordArrival } from "@/lib/pixel/collect";

/**
 * POST /api/pixel/collect — endpoint public du pixel first-party.
 *
 * Appelé depuis les domaines des boutiques (CORS ouvert) via sendBeacon
 * (Content-Type text/plain → pas de preflight). Réponse toujours 204 pour
 * les payloads valides, même pixel inconnu : pas d'oracle pour les curieux.
 * Rate limiting best-effort par IP (mémoire d'instance).
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const RATE_LIMIT_PER_MINUTE = 60;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
    // Ménage opportuniste pour borner la mémoire.
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

  // Bots évidents : on avale sans stocker.
  if (isLikelyBot(req.headers.get("user-agent"))) return respond(204);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return respond(429);

  // sendBeacon envoie du text/plain : on parse le texte brut en JSON.
  let json: unknown;
  try {
    json = JSON.parse(await req.text());
  } catch {
    return respond(400);
  }

  const parsed = PixelPayloadSchema.safeParse(json);
  if (!parsed.success) return respond(400);

  try {
    await recordArrival(parsed.data);
  } catch {
    // Jamais d'erreur visible côté boutique : l'échec est silencieux.
  }
  return respond(204);
}
