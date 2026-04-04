"use client";

import { useApi } from "./use-api";
import {
  type PlanId,
  type FeatureKey,
  type ResourceKey,
  type Entitlements,
  PLANS,
  normalizePlanId,
  resolveEntitlements,
  type ResourceUsage,
} from "@/lib/plans";
import { isBetaOpenAccess } from "@/lib/beta";

interface SubscriptionData {
  planId: PlanId;
  usage: ResourceUsage;
}

/**
 * Hook principal pour accéder au plan, usage et entitlements de l'utilisateur.
 *
 * En mode bêta open access, canCreate() et hasFeature() retournent toujours true.
 * Le vrai planId est conservé pour la future monétisation.
 */
export function useSubscription() {
  const { data, loading, error, mutate } = useApi<SubscriptionData>("/api/subscription");
  const beta = isBetaOpenAccess();

  const planId = data ? normalizePlanId(data.planId) : "starter";
  const usage: ResourceUsage = data?.usage ?? { sites: 0, ordersThisMonth: 0, activeProjects: 0 };

  // En mode bêta, on résout les entitlements comme un plan Business (tout illimité)
  const effectivePlanId: PlanId = beta ? "business" : planId;
  const entitlements: Entitlements = resolveEntitlements(effectivePlanId, usage);

  const canCreate = (resource: ResourceKey): boolean => {
    if (beta) return true;
    return entitlements.resources[resource].canCreate;
  };

  const hasFeature = (feature: FeatureKey): boolean => {
    if (beta) return true;
    return entitlements.features[feature];
  };

  return {
    /** Le vrai plan DB de l'utilisateur (conservé même en bêta) */
    planId,
    plan: PLANS[planId],
    usage,
    entitlements,
    canCreate,
    hasFeature,
    loading,
    error,
    refresh: mutate,
    /** true si le mode bêta open access est actif */
    isBeta: beta,
  };
}
