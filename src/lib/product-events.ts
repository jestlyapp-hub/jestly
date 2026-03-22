"use client";

// ── Tracking des événements produit Jestly ──────────────────────
// Envoie les events via beacon (fire-and-forget) à /api/events
// Anti-duplication via Set de clés event+timestamp

type EventCategory =
  | "auth" | "onboarding" | "site" | "order" | "client"
  | "product" | "project" | "billing" | "search" | "settings";

const sentEvents = new Set<string>();

/**
 * Track un événement produit. Fire-and-forget, ne bloque jamais l'UI.
 */
export function trackProductEvent(
  eventName: string,
  category: EventCategory,
  metadata?: Record<string, unknown>,
) {
  // Anti-duplication: même event dans les 5 secondes = skip
  const dedupeKey = `${eventName}:${Math.floor(Date.now() / 5000)}`;
  if (sentEvents.has(dedupeKey)) return;
  sentEvents.add(dedupeKey);
  // Nettoyage après 30s
  setTimeout(() => sentEvents.delete(dedupeKey), 30_000);

  const payload = JSON.stringify({
    event_name: eventName,
    event_category: category,
    metadata: metadata || {},
  });

  // Beacon pour garantir livraison même si l'user navigue
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/events", payload);
  } else if (typeof fetch !== "undefined") {
    fetch("/api/events", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {}); // Silent fail
  }
}

// ── Helpers typés pour les événements les plus courants ──────────

export const ProductEvents = {
  // Auth
  loginCompleted: () => trackProductEvent("auth.login", "auth"),

  // Onboarding
  onboardingStarted: () => trackProductEvent("onboarding.started", "onboarding"),
  onboardingCompleted: () => trackProductEvent("onboarding.completed", "onboarding"),
  onboardingWelcomeStep: (step: number) => trackProductEvent(`onboarding.welcome_step_${step}`, "onboarding"),
  onboardingWelcomeCompleted: (activity: string | null) => trackProductEvent("onboarding.welcome_completed", "onboarding", { activity }),
  onboardingChecklistStep: (stepId: string) => trackProductEvent(`onboarding.step.${stepId}`, "onboarding"),
  onboardingChecklistDismissed: () => trackProductEvent("onboarding.checklist_dismissed", "onboarding"),
  onboardingProductAddedToSite: () => trackProductEvent("onboarding.product_added_to_site", "onboarding"),
  onboardingSitePublished: () => trackProductEvent("onboarding.site_published_from_guide", "onboarding"),
  onboardingMissionCompleted: (mission: string) => trackProductEvent(`onboarding.mission.${mission}`, "onboarding"),

  // Sites
  siteCreated: (siteId: string) => trackProductEvent("site.created", "site", { site_id: siteId }),
  sitePublished: (siteId: string) => trackProductEvent("site.published", "site", { site_id: siteId }),
  siteEdited: (siteId: string) => trackProductEvent("site.edited", "site", { site_id: siteId }),

  // Orders
  orderCreated: (orderId: string) => trackProductEvent("order.created", "order", { order_id: orderId }),
  orderCompleted: (orderId: string) => trackProductEvent("order.completed", "order", { order_id: orderId }),

  // Clients
  clientAdded: (clientId: string) => trackProductEvent("client.added", "client", { client_id: clientId }),

  // Products
  productCreated: (productId: string) => trackProductEvent("product.created", "product", { product_id: productId }),

  // Projects
  projectCreated: (projectId: string) => trackProductEvent("project.created", "project", { project_id: projectId }),

  // Billing
  invoiceCreated: () => trackProductEvent("billing.invoice_created", "billing"),

  // Search
  searchPerformed: (query: string) => trackProductEvent("search.performed", "search", { query_length: query.length }),

  // Settings
  settingsUpdated: (section: string) => trackProductEvent("settings.updated", "settings", { section }),

  // Generic page view (dashboard pages)
  pageViewed: (path: string) => trackProductEvent("page.viewed", "auth", { path }),
} as const;
