/**
 * Plans & Entitlements — Source de vérité unique
 *
 * Ce fichier centralise TOUTES les définitions de plans, limites, features et helpers.
 * Aucun autre fichier ne doit hardcoder des valeurs de plan.
 *
 * Architecture :
 * - PlanId : identifiant du plan (starter, pro, business)
 * - PlanDefinition : limites + features du plan
 * - Entitlements : permissions résolues pour un utilisateur donné
 * - resolveEntitlements() : croise le plan avec l'usage réel
 *
 * Règles métier clés :
 * - Mois calendaire (1er au dernier jour) pour les compteurs mensuels
 * - Bornes inclusives
 * - Les suppressions NE réduisent PAS le compteur (anti-contournement)
 * - Upgrade = effet immédiat (quotas augmentent instantanément)
 * - Downgrade = fin de période (cancel_at_period_end via Stripe)
 * - On ne supprime JAMAIS de données au downgrade
 * - Les ressources hors quota deviennent read-only, pas supprimées
 */

/* ══════════════════════════════════════════════════════════════
   PLAN TYPES
   ══════════════════════════════════════════════════════════════ */

export type PlanId = "starter" | "pro" | "business";

export type FeatureKey =
  | "crm_full"
  | "crm_export"
  | "quotes"
  | "auto_invoices"
  | "accounting_exports"
  | "analytics_detailed"
  | "analytics_exports"
  | "calendar_advanced"
  | "briefing"
  | "white_label"
  | "custom_domain"
  | "seo_full"
  | "automations"
  | "priority_support"
  | "dedicated_support"
  | "beta_access";

export type ResourceKey =
  | "sites"
  | "orders_per_month"
  | "active_projects"
  | "pages_per_site";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: Record<ResourceKey, number>; // -1 = illimité
  features: Set<FeatureKey>;
}

/* ══════════════════════════════════════════════════════════════
   PLAN DEFINITIONS — Modifier ici pour changer les plans
   ══════════════════════════════════════════════════════════════ */

const UNLIMITED = -1;

export const PLANS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: {
      sites: 1,
      orders_per_month: 15,
      active_projects: 3,
      pages_per_site: 3,
    },
    features: new Set([]),
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 4.99,
    yearlyPrice: 3.99,
    limits: {
      sites: 3,
      orders_per_month: 50,
      active_projects: UNLIMITED,
      pages_per_site: 10,
    },
    features: new Set<FeatureKey>([
      "crm_full",
      "crm_export",
      "quotes",
      "auto_invoices",
      "accounting_exports",
      "analytics_detailed",
      "calendar_advanced",
      "briefing",
      "white_label",
      "seo_full",
      "priority_support",
    ]),
  },
  business: {
    id: "business",
    name: "Business",
    monthlyPrice: 14.99,
    yearlyPrice: 11.99,
    limits: {
      sites: UNLIMITED,
      orders_per_month: UNLIMITED,
      active_projects: UNLIMITED,
      pages_per_site: UNLIMITED,
    },
    features: new Set<FeatureKey>([
      "crm_full",
      "crm_export",
      "quotes",
      "auto_invoices",
      "accounting_exports",
      "analytics_detailed",
      "analytics_exports",
      "calendar_advanced",
      "briefing",
      "white_label",
      "custom_domain",
      "seo_full",
      "automations",
      "priority_support",
      "dedicated_support",
      "beta_access",
    ]),
  },
};

/* ══════════════════════════════════════════════════════════════
   FEATURE LABELS (français)
   ══════════════════════════════════════════════════════════════ */

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  crm_full: "CRM complet",
  crm_export: "Export contacts",
  quotes: "Devis",
  auto_invoices: "Factures automatiques",
  accounting_exports: "Exports comptables",
  analytics_detailed: "Analytics détaillés",
  analytics_exports: "Exports rapports",
  calendar_advanced: "Calendrier avancé",
  briefing: "Briefing client",
  white_label: "White-label",
  custom_domain: "Domaine personnalisé",
  seo_full: "SEO complet",
  automations: "Automatisations",
  priority_support: "Support prioritaire",
  dedicated_support: "Support dédié",
  beta_access: "Accès bêta",
};

export const RESOURCE_LABELS: Record<ResourceKey, string> = {
  sites: "Sites vitrines",
  orders_per_month: "Commandes / mois",
  active_projects: "Projets actifs",
  pages_per_site: "Pages / site",
};

/* ══════════════════════════════════════════════════════════════
   USAGE & ENTITLEMENTS
   ══════════════════════════════════════════════════════════════ */

export interface ResourceUsage {
  sites: number;
  ordersThisMonth: number;
  activeProjects: number;
  pagesForSite?: number; // contextuel, pour un site donné
}

export interface ResourceEntitlement {
  current: number;
  limit: number; // -1 = unlimited
  canCreate: boolean;
  overQuota: boolean;
  overBy: number;
}

export interface Entitlements {
  plan: PlanDefinition;
  resources: Record<ResourceKey, ResourceEntitlement>;
  features: Record<FeatureKey, boolean>;
  isOverAnyQuota: boolean;
}

/**
 * Résout les entitlements d'un utilisateur en croisant son plan avec son usage.
 */
export function resolveEntitlements(planId: PlanId, usage: ResourceUsage): Entitlements {
  const plan = PLANS[planId] || PLANS.starter;

  const resolveResource = (key: ResourceKey, current: number): ResourceEntitlement => {
    const limit = plan.limits[key];
    if (limit === UNLIMITED) {
      return { current, limit, canCreate: true, overQuota: false, overBy: 0 };
    }
    const overBy = Math.max(0, current - limit);
    return {
      current,
      limit,
      canCreate: current < limit,
      overQuota: current > limit,
      overBy,
    };
  };

  const resources: Record<ResourceKey, ResourceEntitlement> = {
    sites: resolveResource("sites", usage.sites),
    orders_per_month: resolveResource("orders_per_month", usage.ordersThisMonth),
    active_projects: resolveResource("active_projects", usage.activeProjects),
    pages_per_site: resolveResource("pages_per_site", usage.pagesForSite ?? 0),
  };

  const features = {} as Record<FeatureKey, boolean>;
  for (const key of Object.keys(FEATURE_LABELS) as FeatureKey[]) {
    features[key] = plan.features.has(key);
  }

  const isOverAnyQuota = Object.values(resources).some((r) => r.overQuota);

  return { plan, resources, features, isOverAnyQuota };
}

/* ══════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════ */

/**
 * Renvoie le plan minimum nécessaire pour une feature donnée.
 */
export function minimumPlanFor(feature: FeatureKey): PlanId {
  const order: PlanId[] = ["starter", "pro", "business"];
  for (const planId of order) {
    if (PLANS[planId].features.has(feature)) return planId;
  }
  return "business";
}

/**
 * Renvoie le plan minimum pour une limite de ressource donnée.
 */
export function minimumPlanForLimit(resource: ResourceKey, needed: number): PlanId {
  const order: PlanId[] = ["starter", "pro", "business"];
  for (const planId of order) {
    const limit = PLANS[planId].limits[resource];
    if (limit === UNLIMITED || limit >= needed) return planId;
  }
  return "business";
}

/**
 * Formate une limite pour l'affichage.
 */
export function formatLimit(limit: number): string {
  return limit === UNLIMITED ? "Illimité" : String(limit);
}

/**
 * Bornes du mois calendaire courant (pour compter les commandes/mois).
 * Renvoie { start: YYYY-MM-DD, end: YYYY-MM-DD } inclusif.
 */
export function currentMonthBounds(): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const end = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

/**
 * Résout un planId depuis le champ `plan` de la DB (gère les legacy values).
 */
export function normalizePlanId(dbPlan: string | null | undefined): PlanId {
  if (dbPlan === "pro") return "pro";
  if (dbPlan === "business") return "business";
  return "starter"; // "free", null, undefined → starter
}
