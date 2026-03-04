import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateSubdomain } from "@/lib/validate-subdomain";

// GET /api/subdomains/check?subdomain=xxx&exclude=siteId
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("subdomain") || "";
  const excludeSiteId = req.nextUrl.searchParams.get("exclude") || "";

  if (!raw.trim()) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const result = validateSubdomain(raw);
  if (!result.valid) {
    return NextResponse.json({ available: false, reason: result.reason });
  }

  const { normalized } = result;

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("sites") as any)
    .select("id")
    .eq("slug", normalized)
    .limit(1);

  // Exclure le site de l'utilisateur pour ne pas bloquer sur son propre slug
  if (excludeSiteId) {
    query = query.neq("id", excludeSiteId);
  }

  const { data } = await query.maybeSingle();

  if (data) {
    return NextResponse.json({ available: false, reason: "taken" });
  }

  return NextResponse.json({ available: true });
}
