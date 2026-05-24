import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { refreshUserCampaignPerformance } from "@/lib/ads/roas-engine";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const body = await req.json().catch(() => ({}));
  const full = body?.full === true;
  try {
    const result = await refreshUserCampaignPerformance({
      userId: auth.user.id,
      fullRecompute: full,
      daysBack: full ? 90 : 7,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
