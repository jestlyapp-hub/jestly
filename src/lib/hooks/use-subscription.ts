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

interface SubscriptionData {
  planId: PlanId;
  usage: ResourceUsage;
}

/**
 * Hook principal pour accéder au plan, usage et entitlements de l'utilisateur.
 *
 * Usage :
 *   const { entitlements, canCreate, hasFeature, loading } = useSubscription();
 *   if (!canCreate("orders_per_month")) showUpgradeGate();
 *   if (!hasFeature("analytics_exports")) showUpgradeGate();
 */
export function useSubscription() {
  const { data, loading, error, mutate } = useApi<SubscriptionData>("/api/subscription");

  const planId = data ? normalizePlanId(data.planId) : "starter";
  const usage: ResourceUsage = data?.usage ?? { sites: 0, ordersThisMonth: 0, activeProjects: 0 };
  const entitlements: Entitlements = resolveEntitlements(planId, usage);

  const canCreate = (resource: ResourceKey): boolean => {
    return entitlements.resources[resource].canCreate;
  };

  const hasFeature = (feature: FeatureKey): boolean => {
    return entitlements.features[feature];
  };

  return {
    planId,
    plan: PLANS[planId],
    usage,
    entitlements,
    canCreate,
    hasFeature,
    loading,
    error,
    refresh: mutate,
  };
}
