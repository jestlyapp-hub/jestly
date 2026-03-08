import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { isAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  if (!isAdmin(auth.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();

  // Fetch all waitlist entries for stats computation
  const { data: entries, error } = await (supabase.from("waitlist") as ReturnType<typeof supabase.from>)
    .select("id, status, job_type, score, source, created_at, utm_source");

  if (error) {
    console.error("[admin/stats] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  const all = entries || [];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // KPIs
  const total = all.length;
  const thisWeek = all.filter((e: any) => new Date(e.created_at) >= weekAgo).length;
  const thisMonth = all.filter((e: any) => new Date(e.created_at) >= monthAgo).length;
  const statusCounts: Record<string, number> = {};
  const jobCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  const utmCounts: Record<string, number> = {};

  let totalScore = 0;

  for (const e of all) {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
    jobCounts[e.job_type] = (jobCounts[e.job_type] || 0) + 1;
    if (e.source) sourceCounts[e.source] = (sourceCounts[e.source] || 0) + 1;
    if (e.utm_source) utmCounts[e.utm_source] = (utmCounts[e.utm_source] || 0) + 1;
    totalScore += e.score || 0;
  }

  // Daily signups for last 30 days (for chart)
  const dailySignups: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const count = all.filter((e: any) => e.created_at.startsWith(dateStr)).length;
    dailySignups.push({ date: dateStr, count });
  }

  return NextResponse.json({
    total,
    thisWeek,
    thisMonth,
    avgScore: total > 0 ? Math.round(totalScore / total) : 0,
    statusCounts,
    jobCounts,
    sourceCounts,
    utmCounts,
    dailySignups,
  });
}
