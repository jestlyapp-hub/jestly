// ── Tests V3 Admin Intelligence ─────────────────────────────────────
// Health score, product events, activation funnel, data integrity.

import { describe, it, expect } from "vitest";

// ── 1. Health Score Tiers ────────────────────────────────────────────

describe("Health Score Tier Logic", () => {
  // Reproduit la logique tier de fn_compute_account_health
  function computeTier(score: number): string {
    if (score >= 70) return "healthy";
    if (score >= 45) return "watch";
    if (score >= 20) return "risky";
    return "critical";
  }

  it("score 100 = healthy", () => {
    expect(computeTier(100)).toBe("healthy");
  });

  it("score 70 = healthy (seuil exact)", () => {
    expect(computeTier(70)).toBe("healthy");
  });

  it("score 69 = watch", () => {
    expect(computeTier(69)).toBe("watch");
  });

  it("score 45 = watch (seuil exact)", () => {
    expect(computeTier(45)).toBe("watch");
  });

  it("score 44 = risky", () => {
    expect(computeTier(44)).toBe("risky");
  });

  it("score 20 = risky (seuil exact)", () => {
    expect(computeTier(20)).toBe("risky");
  });

  it("score 19 = critical", () => {
    expect(computeTier(19)).toBe("critical");
  });

  it("score 0 = critical", () => {
    expect(computeTier(0)).toBe("critical");
  });
});

// ── 2. Health Score Computation Logic ────────────────────────────────

describe("Health Score Computation (JS mirror)", () => {
  // Reproduit la logique de score de fn_compute_account_health
  function computeScore(signals: {
    lastOrderDaysAgo: number | null;
    orders30d: number;
    products: number;
    clients: number;
    sitesPublished: number;
    projects: number;
    profileComplete: boolean;
    accountAgeDays: number;
    ordersTotal: number;
  }): number {
    let score = 0;

    // Récence dernière commande (0-20 pts)
    if (signals.lastOrderDaysAgo !== null) {
      if (signals.lastOrderDaysAgo <= 7) score += 20;
      else if (signals.lastOrderDaysAgo <= 30) score += 15;
      else if (signals.lastOrderDaysAgo <= 90) score += 8;
      else score += 3;
    }

    // Commandes 30j (0-15 pts)
    score += Math.min(signals.orders30d * 5, 15);

    // Produits (0-10 pts)
    score += Math.min(signals.products * 3, 10);

    // Clients (0-10 pts)
    score += Math.min(signals.clients * 2, 10);

    // Site publié (0-15 pts)
    if (signals.sitesPublished > 0) score += 15;

    // Projets (0-10 pts)
    score += Math.min(signals.projects * 2, 10);

    // Profil complété (0-10 pts)
    if (signals.profileComplete) score += 10;

    // Ancienneté (0-10 pts)
    if (signals.accountAgeDays > 180 && signals.ordersTotal > 0) score += 10;
    else if (signals.accountAgeDays > 90 && signals.ordersTotal > 0) score += 7;
    else if (signals.accountAgeDays > 30) score += 3;

    return Math.min(score, 100);
  }

  it("compte vide = 0 points", () => {
    expect(computeScore({
      lastOrderDaysAgo: null, orders30d: 0, products: 0, clients: 0,
      sitesPublished: 0, projects: 0, profileComplete: false,
      accountAgeDays: 1, ordersTotal: 0,
    })).toBe(0);
  });

  it("compte complet actif = score élevé", () => {
    const score = computeScore({
      lastOrderDaysAgo: 2, orders30d: 3, products: 4, clients: 5,
      sitesPublished: 1, projects: 3, profileComplete: true,
      accountAgeDays: 200, ordersTotal: 10,
    });
    expect(score).toBeGreaterThanOrEqual(70);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("profil seul sans activité = score faible", () => {
    const score = computeScore({
      lastOrderDaysAgo: null, orders30d: 0, products: 0, clients: 0,
      sitesPublished: 0, projects: 0, profileComplete: true,
      accountAgeDays: 45, ordersTotal: 0,
    });
    expect(score).toBe(13); // 10 (profil) + 3 (ancienneté > 30j)
  });

  it("freelance actif typique", () => {
    const score = computeScore({
      lastOrderDaysAgo: 5, orders30d: 2, products: 2, clients: 3,
      sitesPublished: 1, projects: 1, profileComplete: true,
      accountAgeDays: 120, ordersTotal: 8,
    });
    // 20 + 10 + 6 + 6 + 15 + 2 + 10 + 7 = 76
    expect(score).toBe(76);
  });

  it("score ne dépasse jamais 100", () => {
    const score = computeScore({
      lastOrderDaysAgo: 1, orders30d: 10, products: 10, clients: 10,
      sitesPublished: 5, projects: 10, profileComplete: true,
      accountAgeDays: 365, ordersTotal: 100,
    });
    expect(score).toBe(100);
  });

  it("compte ancien inactif", () => {
    const score = computeScore({
      lastOrderDaysAgo: 200, orders30d: 0, products: 1, clients: 1,
      sitesPublished: 0, projects: 0, profileComplete: false,
      accountAgeDays: 300, ordersTotal: 2,
    });
    // 3 (old order) + 0 + 3 + 2 + 0 + 0 + 0 + 10 (ancien + orders) = 18
    expect(score).toBe(18);
  });
});

// ── 3. Product Event Validation ──────────────────────────────────────

describe("Product Event Categories", () => {
  const validCategories = [
    "auth", "onboarding", "site", "order", "client",
    "product", "project", "billing", "search", "settings",
  ];

  it("toutes les catégories attendues sont définies", () => {
    expect(validCategories).toContain("auth");
    expect(validCategories).toContain("onboarding");
    expect(validCategories).toContain("site");
    expect(validCategories).toContain("order");
    expect(validCategories).toContain("billing");
  });

  it("pas de catégorie admin dans les events produit", () => {
    expect(validCategories).not.toContain("admin");
    expect(validCategories).not.toContain("system");
  });

  it("10 catégories au total", () => {
    expect(validCategories).toHaveLength(10);
  });
});

// ── 4. Event Naming Convention ───────────────────────────────────────

describe("Event Naming Convention", () => {
  const eventNames = [
    "auth.login",
    "onboarding.started",
    "onboarding.completed",
    "site.created",
    "site.published",
    "site.edited",
    "order.created",
    "order.completed",
    "client.added",
    "product.created",
    "project.created",
    "billing.invoice_created",
    "search.performed",
    "settings.updated",
    "page.viewed",
  ];

  it("tous les events suivent le format 'category.action'", () => {
    for (const name of eventNames) {
      expect(name).toMatch(/^[a-z]+\.[a-z_]+$/);
    }
  });

  it("pas d'event avec des espaces ou majuscules", () => {
    for (const name of eventNames) {
      expect(name).not.toMatch(/[A-Z\s]/);
    }
  });
});

// ── 5. Activation Funnel Logic ───────────────────────────────────────

describe("Activation Funnel", () => {
  function isActivated(user: {
    hasClients: boolean;
    hasProducts: boolean;
    hasOrders: boolean;
    hasSites: boolean;
  }): boolean {
    return user.hasClients && user.hasProducts && (user.hasOrders || user.hasSites);
  }

  it("user avec clients + produits + commandes = activé", () => {
    expect(isActivated({ hasClients: true, hasProducts: true, hasOrders: true, hasSites: false })).toBe(true);
  });

  it("user avec clients + produits + site = activé", () => {
    expect(isActivated({ hasClients: true, hasProducts: true, hasOrders: false, hasSites: true })).toBe(true);
  });

  it("user sans produits = pas activé", () => {
    expect(isActivated({ hasClients: true, hasProducts: false, hasOrders: true, hasSites: true })).toBe(false);
  });

  it("user sans clients = pas activé", () => {
    expect(isActivated({ hasClients: false, hasProducts: true, hasOrders: true, hasSites: true })).toBe(false);
  });

  it("user sans commandes ni site = pas activé", () => {
    expect(isActivated({ hasClients: true, hasProducts: true, hasOrders: false, hasSites: false })).toBe(false);
  });

  it("user vide = pas activé", () => {
    expect(isActivated({ hasClients: false, hasProducts: false, hasOrders: false, hasSites: false })).toBe(false);
  });
});

// ── 6. DAU/WAU/MAU Computation ───────────────────────────────────────

describe("DAU/WAU/MAU Computation", () => {
  function computeActiveUsers(
    events: { user_id: string; created_at: string }[],
    windowDays: number,
    referenceDate: Date,
  ): number {
    const cutoff = new Date(referenceDate.getTime() - windowDays * 86400000);
    const users = new Set<string>();
    for (const e of events) {
      if (new Date(e.created_at) >= cutoff) {
        users.add(e.user_id);
      }
    }
    return users.size;
  }

  const events = [
    { user_id: "a", created_at: "2026-03-14T10:00:00Z" },
    { user_id: "a", created_at: "2026-03-14T11:00:00Z" }, // dupe same user
    { user_id: "b", created_at: "2026-03-13T10:00:00Z" },
    { user_id: "c", created_at: "2026-03-10T10:00:00Z" },
    { user_id: "d", created_at: "2026-02-15T10:00:00Z" }, // old
  ];

  const ref = new Date("2026-03-14T23:59:59Z");

  it("DAU = users uniques aujourd'hui", () => {
    expect(computeActiveUsers(events, 1, ref)).toBe(1); // only user "a"
  });

  it("WAU = users uniques 7 jours", () => {
    expect(computeActiveUsers(events, 7, ref)).toBe(3); // a, b, c
  });

  it("MAU = users uniques 30 jours", () => {
    expect(computeActiveUsers(events, 30, ref)).toBe(4); // a, b, c, d
  });

  it("déduplique les users", () => {
    // user "a" appears twice but should count as 1
    expect(computeActiveUsers(events, 1, ref)).toBe(1);
  });
});
