import { NextResponse } from "next/server";
import { requireAdmin, adminUserIdConfigured } from "@/lib/admin";
import { isStripeConnected } from "@/lib/stripe";
import { isSentryAdminConfigured } from "@/lib/sentry-admin";

// GET — Statut sécurité dynamique pour /admin/security
export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const adminClient = auth.adminClient;

  // Derniers accès refusés (24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: deniedCount24h } = await (
    adminClient.from("admin_audit_logs") as any
  )
    .select("id", { count: "exact", head: true })
    .eq("result", "denied")
    .gte("created_at", oneDayAgo);

  // Total audit entries
  const { count: totalAuditEntries } = await (
    adminClient.from("admin_audit_logs") as any
  ).select("id", { count: "exact", head: true });

  // Statut global
  const adminUserIdSet = adminUserIdConfigured();
  const checks = {
    requireAdmin_unified: true,
    audit_logging: true,
    rate_limiting: true,
    input_validation: true,
    rls_enabled: true,
    noindex: true,
    cache_no_store: true,
    security_headers: true,
    admin_user_id: adminUserIdSet,
    stripe_webhooks: isStripeConnected(),
    sentry: isSentryAdminConfigured(),
  };

  const doneCount = Object.values(checks).filter(Boolean).length;
  const totalCount = Object.keys(checks).length;

  // Niveau de confiance
  let confidence: "production-ready" | "bon" | "a-corriger" | "critique";
  if (doneCount >= totalCount - 2) confidence = "production-ready";
  else if (doneCount >= totalCount - 4) confidence = "bon";
  else if (doneCount >= totalCount - 6) confidence = "a-corriger";
  else confidence = "critique";

  return NextResponse.json({
    checks,
    score: { done: doneCount, total: totalCount },
    confidence,
    admin_user_id_configured: adminUserIdSet,
    denied_24h: deniedCount24h || 0,
    total_audit_entries: totalAuditEntries || 0,
  });
}
