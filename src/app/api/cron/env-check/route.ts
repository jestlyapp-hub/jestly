import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/env-check — diagnostic de présence des variables d'environnement.
 * Protégé par CRON_SECRET. Ne renvoie JAMAIS de valeurs : uniquement
 * présent/absent (et la longueur, pour repérer guillemets ou espaces collés).
 */
const EXPECTED = [
  "ENCRYPTION_KEY",
  "CRON_SECRET",
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_REFRESH_TOKEN",
  "GOOGLE_ADS_LOGIN_CUSTOMER_ID",
  "GOOGLE_ADS_CUSTOMER_ID",
  "JESTLY_PINTEREST_APP_ID",
  "JESTLY_PINTEREST_APP_SECRET",
  "JESTLY_PINTEREST_REDIRECT_URI",
  "EXCLUDED_ORDER_NAMES",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report: Record<string, string> = {};
  for (const name of EXPECTED) {
    const v = process.env[name];
    report[name] = v == null || v === "" ? "ABSENTE" : `présente (${v.length} car.)`;
  }
  return NextResponse.json({ env: process.env.VERCEL_ENV ?? "inconnu", vars: report });
}
