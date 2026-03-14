import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { fetchSentryStats, isSentryAdminConfigured } from "@/lib/sentry-admin";

// GET — Incidents & logs data
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const supabase = auth.adminClient;

  // ── Fetch recent audit logs (last 50) ──
  const { data: auditLogs, error: auditErr } = await (
    supabase.from("admin_audit_logs") as any
  )
    .select(
      "id, actor_id, actor_email, action, target_type, target_id, metadata, ip_address, result, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  // ── Fetch failed emails from waitlist_email_logs ──
  const { data: failedEmails, error: emailErr } = await (
    supabase.from("waitlist_email_logs") as any
  )
    .select("id, recipient_email, subject, status, error_message, created_at")
    .eq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(50);

  // ── Count totals ──
  const { count: totalAudit } = await (
    supabase.from("admin_audit_logs") as any
  ).select("id", { count: "exact", head: true });

  const { count: totalFailedEmails } = await (
    supabase.from("waitlist_email_logs") as any
  )
    .select("id", { count: "exact", head: true })
    .eq("status", "failed");

  if (auditErr) {
    console.error("[admin/incidents] audit error:", auditErr);
  }
  if (emailErr) {
    console.error("[admin/incidents] email error:", emailErr);
  }

  // ── Sentry stats (optionnel) ──
  const sentryStats = await fetchSentryStats();

  return NextResponse.json({
    audit_logs: auditLogs || [],
    audit_total: totalAudit || 0,
    failed_emails: failedEmails || [],
    failed_emails_total: totalFailedEmails || 0,
    sentry_connected: isSentryAdminConfigured(),
    sentry: sentryStats,
  });
}
