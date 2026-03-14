import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  logAdminAction,
  checkAdminRateLimit,
  ADMIN_ACTIONS,
} from "@/lib/admin";

// GET — Récupérer tous les health scores des comptes
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { adminClient } = auth;

  // Récupérer tous les snapshots de santé
  const { data: snapshots } = await (adminClient.from("account_health_snapshots") as any)
    .select("account_id, score, tier, signals, computed_at")
    .order("score", { ascending: true });

  // Nombre total d'utilisateurs pour le taux de couverture
  const { count: totalUsers } = await (adminClient.from("profiles") as any)
    .select("id", { count: "exact", head: true });

  const all = snapshots || [];

  // Distribution par tier
  const distribution = {
    healthy: all.filter((s: any) => s.tier === "healthy").length,
    watch: all.filter((s: any) => s.tier === "watch").length,
    risky: all.filter((s: any) => s.tier === "risky").length,
    critical: all.filter((s: any) => s.tier === "critical").length,
  };

  // Score moyen
  const avgScore = all.length > 0
    ? Math.round(all.reduce((sum: number, s: any) => sum + s.score, 0) / all.length)
    : 0;

  // Comptes à risque (risky + critical) avec détails
  const atRisk = all
    .filter((s: any) => s.tier === "risky" || s.tier === "critical")
    .slice(0, 20);

  // Enrichir avec les infos profil
  const atRiskIds = atRisk.map((s: any) => s.account_id);
  let atRiskProfiles: any[] = [];
  if (atRiskIds.length > 0) {
    const { data } = await (adminClient.from("profiles") as any)
      .select("id, email, full_name, plan, created_at")
      .in("id", atRiskIds);
    atRiskProfiles = data || [];
  }

  const atRiskEnriched = atRisk.map((s: any) => {
    const profile = atRiskProfiles.find((p: any) => p.id === s.account_id);
    return { ...s, profile };
  });

  return NextResponse.json({
    total_users: totalUsers || 0,
    scored_users: all.length,
    avg_score: avgScore,
    distribution,
    at_risk: atRiskEnriched,
  });
}

// POST — Déclencher le calcul de santé pour tous les comptes ou un seul
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user, adminClient } = auth;

  const url = new URL(req.url);
  const accountId = url.searchParams.get("account_id");

  // Rate limit : max 2 recalculs complets par minute
  const rateLimitResponse = checkAdminRateLimit(user.id, "compute_health", 2);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "compute_health" });
    return rateLimitResponse;
  }

  if (accountId) {
    // Calcul pour un seul compte
    const { data, error } = await adminClient.rpc("fn_compute_account_health", {
      p_account_id: accountId,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Journaliser l'action
    await logAdminAction(user.id, "compute_health", accountId);
    return NextResponse.json({ result: data });
  } else {
    // Calcul pour TOUS les comptes
    const { data, error } = await adminClient.rpc("fn_compute_all_health_scores");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    await logAdminAction(user.id, "compute_health_all", undefined, { count: data });
    return NextResponse.json({ computed: data });
  }
}
