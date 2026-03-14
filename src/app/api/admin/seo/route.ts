import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const sb = auth.adminClient;

  const [
    publishedSitesRes,
    totalSitesRes,
    pagesRes,
    analyticsRes,
  ] = await Promise.all([
    (sb.from("sites") as any)
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    (sb.from("sites") as any)
      .select("id", { count: "exact", head: true }),
    (sb.from("site_pages") as any)
      .select("id", { count: "exact", head: true }),
    (sb.from("analytics_events") as any)
      .select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    published_sites: publishedSitesRes.count ?? 0,
    total_sites: totalSitesRes.count ?? 0,
    published_pages: pagesRes.count ?? 0,
    total_analytics_events: analyticsRes.count ?? 0,
  });
}
