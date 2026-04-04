/**
 * Subscription Guard — Protection serveur des API routes
 *
 * Fournit des fonctions pour vérifier les quotas et features
 * avant d'autoriser une action serveur (création, export, etc.).
 *
 * Usage dans une route :
 *   const guard = await checkResourceQuota(supabase, userId, "orders_per_month");
 *   if (!guard.allowed) return NextResponse.json({ error: guard.error, upgrade: guard.upgrade }, { status: 403 });
 */

import { type SupabaseClient } from "@supabase/supabase-js";
import {
  type PlanId,
  type ResourceKey,
  type FeatureKey,
  type ResourceUsage,
  PLANS,
  normalizePlanId,
  resolveEntitlements,
  currentMonthBounds,
  minimumPlanFor,
  minimumPlanForLimit,
  RESOURCE_LABELS,
  FEATURE_LABELS,
  formatLimit,
} from "./plans";
import { isBetaOpenAccess } from "./beta";

export interface GuardResult {
  allowed: boolean;
  planId: PlanId;
  error?: string;
  upgrade?: { plan: PlanId; label: string };
}

/**
 * Récupère le plan de l'utilisateur depuis la DB.
 */
async function getUserPlan(supabase: SupabaseClient, userId: string): Promise<PlanId> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("profiles") as any)
    .select("plan")
    .eq("id", userId)
    .single();
  return normalizePlanId(data?.plan);
}

/**
 * Compte l'usage actuel pour une ressource donnée.
 */
async function countUsage(
  supabase: SupabaseClient,
  userId: string,
  resource: ResourceKey,
  context?: { siteId?: string },
): Promise<number> {
  switch (resource) {
    case "sites": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase.from("sites") as any)
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      return count ?? 0;
    }
    case "orders_per_month": {
      const { start, end } = currentMonthBounds();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase.from("orders") as any)
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", `${start}T00:00:00`)
        .lte("created_at", `${end}T23:59:59`);
      return count ?? 0;
    }
    case "active_projects": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase.from("projects") as any)
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .neq("status", "archived");
      return count ?? 0;
    }
    case "pages_per_site": {
      if (!context?.siteId) return 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase.from("site_pages") as any)
        .select("id", { count: "exact", head: true })
        .eq("site_id", context.siteId);
      return count ?? 0;
    }
  }
}

/**
 * Vérifie si un utilisateur peut créer une nouvelle ressource.
 * Retourne { allowed: true } ou { allowed: false, error, upgrade }.
 */
export async function checkResourceQuota(
  supabase: SupabaseClient,
  userId: string,
  resource: ResourceKey,
  context?: { siteId?: string },
): Promise<GuardResult> {
  // Mode bêta : toutes les ressources sont autorisées
  if (isBetaOpenAccess()) {
    const planId = await getUserPlan(supabase, userId);
    return { allowed: true, planId };
  }

  const planId = await getUserPlan(supabase, userId);
  const plan = PLANS[planId];
  const limit = plan.limits[resource];

  // Illimité → toujours autorisé
  if (limit === -1) return { allowed: true, planId };

  const current = await countUsage(supabase, userId, resource, context);

  if (current < limit) {
    return { allowed: true, planId };
  }

  const needed = current + 1;
  const upgradeTo = minimumPlanForLimit(resource, needed);
  const upgradeLabel = PLANS[upgradeTo].name;
  const resourceLabel = RESOURCE_LABELS[resource];

  return {
    allowed: false,
    planId,
    error: `Limite atteinte : ${current}/${limit} ${resourceLabel}. Passez au plan ${upgradeLabel} pour continuer.`,
    upgrade: { plan: upgradeTo, label: upgradeLabel },
  };
}

/**
 * Vérifie si un utilisateur a accès à une feature.
 */
export async function checkFeatureAccess(
  supabase: SupabaseClient,
  userId: string,
  feature: FeatureKey,
): Promise<GuardResult> {
  // Mode bêta : toutes les features sont accessibles
  if (isBetaOpenAccess()) {
    const planId = await getUserPlan(supabase, userId);
    return { allowed: true, planId };
  }

  const planId = await getUserPlan(supabase, userId);
  const plan = PLANS[planId];

  if (plan.features.has(feature)) {
    return { allowed: true, planId };
  }

  const upgradeTo = minimumPlanFor(feature);
  const upgradeLabel = PLANS[upgradeTo].name;
  const featureLabel = FEATURE_LABELS[feature];

  return {
    allowed: false,
    planId,
    error: `${featureLabel} est disponible à partir du plan ${upgradeLabel}.`,
    upgrade: { plan: upgradeTo, label: upgradeLabel },
  };
}

/**
 * Récupère l'usage complet et les entitlements d'un utilisateur.
 * Utilisé pour la page abonnement / dashboard.
 */
export async function getFullEntitlements(supabase: SupabaseClient, userId: string) {
  const planId = await getUserPlan(supabase, userId);

  const [sites, ordersThisMonth, activeProjects] = await Promise.all([
    countUsage(supabase, userId, "sites"),
    countUsage(supabase, userId, "orders_per_month"),
    countUsage(supabase, userId, "active_projects"),
  ]);

  const usage: ResourceUsage = { sites, ordersThisMonth, activeProjects };
  return resolveEntitlements(planId, usage);
}
