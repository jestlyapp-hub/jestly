import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// POST /api/search/log — Log search queries and clicks for analytics
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (auth.error) return NextResponse.json({ ok: true }); // Silently skip if unauthed

    const { user, supabase } = auth;
    const body = await req.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("search_logs") as any).insert({
      user_id: user.id,
      query: body.query?.slice(0, 200) ?? "",
      result_count: body.result_count ?? 0,
      clicked_id: body.clicked_id ?? null,
      clicked_type: body.clicked_type ?? null,
      clicked_position: body.clicked_position ?? null,
      duration_ms: body.duration_ms ?? null,
    });
  } catch {
    // Silently fail — analytics should never break the app
  }

  return NextResponse.json({ ok: true });
}
