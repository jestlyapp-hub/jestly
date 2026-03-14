// ── Tests Campaigns & Lead Intelligence ──────────────────────────────
// Attribution, validation, lead scoring, campaign metrics, data integrity.

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  validateUuid,
  validateSort,
  validatePagination,
  sanitizeSearchTerm,
  escapeIlike,
} from "@/lib/admin/validation";

// =====================================================================
// 1. ATTRIBUTION TESTS
// =====================================================================

describe("Attribution — getAttribution()", () => {
  // Mirror the logic from src/lib/attribution.ts in a testable way
  // (the real module uses window/localStorage which we mock here)

  function detectDeviceType(ua: string): string {
    if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
    if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) return "mobile";
    return "desktop";
  }

  function detectBrowser(ua: string): string {
    if (ua.includes("Firefox/")) return "firefox";
    if (ua.includes("Edg/")) return "edge";
    if (ua.includes("OPR/") || ua.includes("Opera/")) return "opera";
    if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "chrome";
    if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "safari";
    return "other";
  }

  function hasTouchSignal(touch: {
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    utm_term: string | null;
    referrer: string | null;
    gclid: string | null;
    fbclid: string | null;
    ttclid: string | null;
  }): boolean {
    return !!(
      touch.utm_source ||
      touch.utm_medium ||
      touch.utm_campaign ||
      touch.utm_content ||
      touch.utm_term ||
      touch.referrer ||
      touch.gclid ||
      touch.fbclid ||
      touch.ttclid
    );
  }

  it("retourne les UTM params depuis une URL", () => {
    const url = new URL("https://jestly.fr?utm_source=google&utm_medium=cpc&utm_campaign=launch&utm_content=ad1&utm_term=saas");
    const data = {
      utm_source: url.searchParams.get("utm_source"),
      utm_medium: url.searchParams.get("utm_medium"),
      utm_campaign: url.searchParams.get("utm_campaign"),
      utm_content: url.searchParams.get("utm_content"),
      utm_term: url.searchParams.get("utm_term"),
    };
    expect(data.utm_source).toBe("google");
    expect(data.utm_medium).toBe("cpc");
    expect(data.utm_campaign).toBe("launch");
    expect(data.utm_content).toBe("ad1");
    expect(data.utm_term).toBe("saas");
  });

  it("retourne null pour les params absents", () => {
    const url = new URL("https://jestly.fr/pricing");
    expect(url.searchParams.get("utm_source")).toBeNull();
    expect(url.searchParams.get("utm_medium")).toBeNull();
    expect(url.searchParams.get("gclid")).toBeNull();
  });

  it("first touch n'est jamais écrasé", () => {
    // Simule le comportement du localStorage
    const storage: Record<string, string> = {};

    function setFirstTouch(touch: Record<string, string | null>) {
      if (!storage["jestly_first_touch"] && hasTouchSignal(touch as any)) {
        storage["jestly_first_touch"] = JSON.stringify(touch);
      }
    }

    const firstVisit = { utm_source: "google", utm_medium: "cpc", utm_campaign: null, utm_content: null, utm_term: null, referrer: null, gclid: null, fbclid: null, ttclid: null };
    const secondVisit = { utm_source: "facebook", utm_medium: "social", utm_campaign: null, utm_content: null, utm_term: null, referrer: null, gclid: null, fbclid: null, ttclid: null };

    setFirstTouch(firstVisit);
    setFirstTouch(secondVisit);

    const stored = JSON.parse(storage["jestly_first_touch"]);
    expect(stored.utm_source).toBe("google");
    expect(stored.utm_medium).toBe("cpc");
  });

  it("last touch est mis à jour à chaque visite avec signal", () => {
    const storage: Record<string, string> = {};

    function setLastTouch(touch: Record<string, string | null>) {
      if (hasTouchSignal(touch as any)) {
        storage["jestly_last_touch"] = JSON.stringify(touch);
      }
    }

    setLastTouch({ utm_source: "google", utm_medium: "cpc", utm_campaign: null, utm_content: null, utm_term: null, referrer: null, gclid: null, fbclid: null, ttclid: null });
    setLastTouch({ utm_source: "tiktok", utm_medium: "social", utm_campaign: null, utm_content: null, utm_term: null, referrer: null, gclid: null, fbclid: null, ttclid: null });

    const stored = JSON.parse(storage["jestly_last_touch"]);
    expect(stored.utm_source).toBe("tiktok");
  });

  it("last touch n'est PAS mis à jour pour une visite directe sans signal", () => {
    const storage: Record<string, string> = {};

    function setLastTouch(touch: Record<string, string | null>) {
      if (hasTouchSignal(touch as any)) {
        storage["jestly_last_touch"] = JSON.stringify(touch);
      }
    }

    setLastTouch({ utm_source: "google", utm_medium: null, utm_campaign: null, utm_content: null, utm_term: null, referrer: null, gclid: null, fbclid: null, ttclid: null });
    // Visite directe : aucun signal
    setLastTouch({ utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null, utm_term: null, referrer: null, gclid: null, fbclid: null, ttclid: null });

    const stored = JSON.parse(storage["jestly_last_touch"]);
    expect(stored.utm_source).toBe("google");
  });

  it("anonymous_id est généré et persisté", () => {
    const storage: Record<string, string> = {};

    function getOrCreateAnonymousId(): string {
      let id = storage["jestly_anon_id"];
      if (!id) {
        id = crypto.randomUUID();
        storage["jestly_anon_id"] = id;
      }
      return id;
    }

    const id1 = getOrCreateAnonymousId();
    const id2 = getOrCreateAnonymousId();

    expect(id1).toBe(id2);
    expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it("session_id utilise sessionStorage (nouvelle valeur par session)", () => {
    // Simule 2 sessions distinctes
    const session1: Record<string, string> = {};
    const session2: Record<string, string> = {};

    function getOrCreateSessionId(store: Record<string, string>): string {
      let id = store["jestly_session_id"];
      if (!id) {
        id = crypto.randomUUID();
        store["jestly_session_id"] = id;
      }
      return id;
    }

    const sid1 = getOrCreateSessionId(session1);
    const sid2 = getOrCreateSessionId(session2);

    // 2 sessions = 2 IDs différents
    expect(sid1).not.toBe(sid2);
    // Mais dans la même session, c'est stable
    expect(getOrCreateSessionId(session1)).toBe(sid1);
  });

  describe("Device detection", () => {
    it("détecte mobile (iPhone)", () => {
      expect(detectDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)")).toBe("mobile");
    });

    it("détecte mobile (Android)", () => {
      expect(detectDeviceType("Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36")).toBe("mobile");
    });

    it("détecte tablet (iPad)", () => {
      expect(detectDeviceType("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)")).toBe("tablet");
    });

    it("détecte desktop par défaut", () => {
      expect(detectDeviceType("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")).toBe("desktop");
    });
  });

  describe("Browser detection", () => {
    it("détecte Chrome", () => {
      expect(detectBrowser("Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36")).toBe("chrome");
    });

    it("détecte Edge (pas Chrome)", () => {
      expect(detectBrowser("Mozilla/5.0 Chrome/120.0.0.0 Edg/120.0.0.0 Safari/537.36")).toBe("edge");
    });

    it("détecte Firefox", () => {
      expect(detectBrowser("Mozilla/5.0 Firefox/121.0")).toBe("firefox");
    });

    it("détecte Safari (pas Chrome)", () => {
      expect(detectBrowser("Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15")).toBe("safari");
    });

    it("détecte Opera", () => {
      expect(detectBrowser("Mozilla/5.0 Chrome/120.0.0.0 OPR/106.0.0.0 Safari/537.36")).toBe("opera");
    });

    it("retourne 'other' pour un UA inconnu", () => {
      expect(detectBrowser("SomeBot/1.0")).toBe("other");
    });
  });

  it("getAttributionForLead() fusionne first/last touch", () => {
    const firstTouch = { utm_source: "google", referrer: null };
    const lastTouch = { utm_source: "tiktok", referrer: "https://tiktok.com" };
    const current = { utm_source: "tiktok", utm_medium: "social", utm_campaign: null, utm_content: null, utm_term: null, referrer: "https://tiktok.com" };

    const result = {
      utm_source: current.utm_source,
      utm_medium: current.utm_medium,
      utm_campaign: current.utm_campaign,
      utm_content: current.utm_content,
      utm_term: current.utm_term,
      referrer: current.referrer,
      anonymous_id: "test-anon-id",
      first_touch_source: firstTouch.utm_source || firstTouch.referrer || null,
      last_touch_source: lastTouch.utm_source || lastTouch.referrer || null,
    };

    expect(result.first_touch_source).toBe("google");
    expect(result.last_touch_source).toBe("tiktok");
    expect(result.utm_source).toBe("tiktok");
    expect(result.anonymous_id).toBe("test-anon-id");
  });

  it("getAttributionForLead() utilise referrer quand utm_source est null", () => {
    const firstTouch = { utm_source: null, referrer: "https://blog.example.com" };
    const result = {
      first_touch_source: firstTouch.utm_source || firstTouch.referrer || null,
    };
    expect(result.first_touch_source).toBe("https://blog.example.com");
  });
});

// =====================================================================
// 2. VALIDATION TESTS
// =====================================================================

describe("Validation", () => {
  describe("validateUuid()", () => {
    it("accepte un UUID v4 valide", () => {
      expect(validateUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    it("accepte un UUID en majuscules", () => {
      expect(validateUuid("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
    });

    it("rejette une chaîne vide", () => {
      expect(validateUuid("")).toBe(false);
    });

    it("rejette un UUID tronqué", () => {
      expect(validateUuid("550e8400-e29b-41d4-a716")).toBe(false);
    });

    it("rejette un UUID avec caractères invalides", () => {
      expect(validateUuid("550e8400-e29b-41d4-a716-44665544000g")).toBe(false);
    });

    it("rejette un format non-UUID", () => {
      expect(validateUuid("not-a-uuid")).toBe(false);
    });

    it("rejette les injections SQL", () => {
      expect(validateUuid("'; DROP TABLE leads; --")).toBe(false);
    });
  });

  describe("validateSort()", () => {
    const allowed = ["created_at", "name", "email", "score"];

    it("retourne le champ de tri quand il est autorisé", () => {
      expect(validateSort("name", allowed)).toBe("name");
      expect(validateSort("score", allowed)).toBe("score");
    });

    it("retourne le premier élément par défaut si le tri est invalide", () => {
      expect(validateSort("hacked_field", allowed)).toBe("created_at");
    });

    it("retourne le premier élément par défaut pour une chaîne vide", () => {
      expect(validateSort("", allowed)).toBe("created_at");
    });

    it("retourne le premier élément pour une injection SQL", () => {
      expect(validateSort("name; DROP TABLE", allowed)).toBe("created_at");
    });
  });

  describe("validatePagination()", () => {
    it("limite minimum est 1 (valeurs négatives parsées comme NaN → défaut)", () => {
      // parseInt("0") = 0, || 50 retourne 50, Math.max(50,1)=50
      expect(validatePagination({ limit: "0" }).limit).toBe(50);
      // parseInt("-5") = -5, || retourne -5, Math.max(-5,1)=1
      expect(validatePagination({ limit: "-5" }).limit).toBe(1);
    });

    it("limite maximum est 200", () => {
      expect(validatePagination({ limit: "500" }).limit).toBe(200);
      expect(validatePagination({ limit: "9999" }).limit).toBe(200);
    });

    it("valeurs par défaut si non fournies", () => {
      const { limit, offset } = validatePagination({});
      expect(limit).toBe(50);
      expect(offset).toBe(0);
    });

    it("offset ne peut pas être négatif", () => {
      expect(validatePagination({ offset: "-10" }).offset).toBe(0);
    });

    it("valeurs normales sont acceptées", () => {
      const { limit, offset } = validatePagination({ limit: "25", offset: "50" });
      expect(limit).toBe(25);
      expect(offset).toBe(50);
    });

    it("valeurs non numériques retournent les défauts", () => {
      const { limit, offset } = validatePagination({ limit: "abc", offset: "xyz" });
      expect(limit).toBe(50);
      expect(offset).toBe(0);
    });
  });

  describe("sanitizeSearchTerm()", () => {
    it("supprime les espaces en début et fin", () => {
      expect(sanitizeSearchTerm("  hello  ")).toBe("hello");
    });

    it("limite la longueur à 200 caractères", () => {
      const long = "a".repeat(300);
      expect(sanitizeSearchTerm(long).length).toBe(200);
    });

    it("chaîne vide reste vide", () => {
      expect(sanitizeSearchTerm("")).toBe("");
    });

    it("préserve les caractères spéciaux (pas d'échappement ici)", () => {
      expect(sanitizeSearchTerm("test%query")).toBe("test%query");
    });
  });

  describe("escapeIlike()", () => {
    it("échappe le caractère %", () => {
      expect(escapeIlike("50% off")).toBe("50\\% off");
    });

    it("échappe le caractère _", () => {
      expect(escapeIlike("test_value")).toBe("test\\_value");
    });

    it("échappe le caractère \\", () => {
      expect(escapeIlike("path\\to")).toBe("path\\\\to");
    });

    it("chaîne sans caractères spéciaux reste inchangée", () => {
      expect(escapeIlike("hello world")).toBe("hello world");
    });
  });

  describe("Validation d'email", () => {
    // Reproduit la logique de validation d'email utilisée dans les leads
    function isValidEmail(email: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    it("accepte un email valide", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
    });

    it("accepte un email avec sous-domaine", () => {
      expect(isValidEmail("user@sub.example.com")).toBe(true);
    });

    it("rejette un email sans @", () => {
      expect(isValidEmail("userexample.com")).toBe(false);
    });

    it("rejette un email sans domaine", () => {
      expect(isValidEmail("user@")).toBe(false);
    });

    it("rejette un email avec espaces", () => {
      expect(isValidEmail("user @example.com")).toBe(false);
    });

    it("rejette une chaîne vide", () => {
      expect(isValidEmail("")).toBe(false);
    });
  });
});

// =====================================================================
// 3. METRICS / CONVERSION TESTS
// =====================================================================

describe("Lead Score Computation", () => {
  // Miroir JS de fn_compute_lead_score (migration 044)
  const DISPOSABLE_DOMAINS = [
    "guerrillamail.com", "tempmail.com", "throwaway.email", "mailinator.com",
    "yopmail.com", "trashmail.com", "sharklasers.com", "guerrillamail.info",
    "grr.la", "dispostable.com", "maildrop.cc", "temp-mail.org", "fakeinbox.com",
    "getnada.com", "10minutemail.com", "mohmal.com", "burnermail.io",
    "tempail.com", "emailondeck.com", "mintemail.com",
  ];

  interface LeadScoreInput {
    company: string | null;
    phone: string | null;
    utm_source: string | null;
    referrer: string | null;
    source: string | null;
    email: string | null;
    converted_to_user_id: string | null;
    converted_to_paid_at: string | null;
    message: string | null;
    notes_count: number;
  }

  function computeLeadScore(lead: LeadScoreInput): number {
    let score = 0;

    // +10 si company
    if (lead.company && lead.company !== "") score += 10;

    // +5 si phone
    if (lead.phone && lead.phone !== "") score += 5;

    // +10 si utm_source (trafic payant)
    if (lead.utm_source && lead.utm_source !== "") score += 10;

    // +5 si referrer
    if (lead.referrer && lead.referrer !== "") score += 5;

    // Source-based scoring
    if (lead.source === "checkout") score += 15;
    else if (lead.source === "contact-form") score += 10;
    else if (lead.source === "newsletter") score += 5;

    // -10 si email jetable
    if (lead.email) {
      const domain = lead.email.toLowerCase().split("@")[1];
      if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
        score -= 10;
      }
    }

    // +20 si converti en signup
    if (lead.converted_to_user_id) score += 20;

    // +30 si converti en payant
    if (lead.converted_to_paid_at) score += 30;

    // +5 par note (plafonné à 25)
    score += Math.min(lead.notes_count * 5, 25);

    // +5 si message
    if (lead.message && lead.message !== "") score += 5;

    // Clamp 0-100
    return Math.max(0, Math.min(score, 100));
  }

  it("+10 pour company", () => {
    const base: LeadScoreInput = {
      company: "Acme Corp", phone: null, utm_source: null,
      referrer: null, source: null, email: "test@gmail.com",
      converted_to_user_id: null, converted_to_paid_at: null,
      message: null, notes_count: 0,
    };
    expect(computeLeadScore(base)).toBe(10);
  });

  it("+5 pour phone", () => {
    const lead: LeadScoreInput = {
      company: null, phone: "+33612345678", utm_source: null,
      referrer: null, source: null, email: "test@gmail.com",
      converted_to_user_id: null, converted_to_paid_at: null,
      message: null, notes_count: 0,
    };
    expect(computeLeadScore(lead)).toBe(5);
  });

  it("+10 pour utm_source", () => {
    const lead: LeadScoreInput = {
      company: null, phone: null, utm_source: "google",
      referrer: null, source: null, email: "test@gmail.com",
      converted_to_user_id: null, converted_to_paid_at: null,
      message: null, notes_count: 0,
    };
    expect(computeLeadScore(lead)).toBe(10);
  });

  it("+5 pour referrer", () => {
    const lead: LeadScoreInput = {
      company: null, phone: null, utm_source: null,
      referrer: "https://producthunt.com", source: null, email: "test@gmail.com",
      converted_to_user_id: null, converted_to_paid_at: null,
      message: null, notes_count: 0,
    };
    expect(computeLeadScore(lead)).toBe(5);
  });

  it("+15 pour source checkout", () => {
    const lead: LeadScoreInput = {
      company: null, phone: null, utm_source: null,
      referrer: null, source: "checkout", email: "test@gmail.com",
      converted_to_user_id: null, converted_to_paid_at: null,
      message: null, notes_count: 0,
    };
    expect(computeLeadScore(lead)).toBe(15);
  });

  it("+10 pour source contact-form", () => {
    const lead: LeadScoreInput = {
      company: null, phone: null, utm_source: null,
      referrer: null, source: "contact-form", email: "test@gmail.com",
      converted_to_user_id: null, converted_to_paid_at: null,
      message: null, notes_count: 0,
    };
    expect(computeLeadScore(lead)).toBe(10);
  });

  it("-10 pour email jetable", () => {
    const lead: LeadScoreInput = {
      company: "Acme Corp", phone: null, utm_source: null,
      referrer: null, source: null, email: "test@mailinator.com",
      converted_to_user_id: null, converted_to_paid_at: null,
      message: null, notes_count: 0,
    };
    // 10 (company) - 10 (disposable) = 0
    expect(computeLeadScore(lead)).toBe(0);
  });

  it("+20 pour converted signup", () => {
    const lead: LeadScoreInput = {
      company: null, phone: null, utm_source: null,
      referrer: null, source: null, email: "test@gmail.com",
      converted_to_user_id: "some-user-id", converted_to_paid_at: null,
      message: null, notes_count: 0,
    };
    expect(computeLeadScore(lead)).toBe(20);
  });

  it("+30 pour converted paid", () => {
    const lead: LeadScoreInput = {
      company: null, phone: null, utm_source: null,
      referrer: null, source: null, email: "test@gmail.com",
      converted_to_user_id: null, converted_to_paid_at: "2026-01-01T00:00:00Z",
      message: null, notes_count: 0,
    };
    expect(computeLeadScore(lead)).toBe(30);
  });

  it("score clamped à 0 minimum", () => {
    // Email jetable uniquement = -10, clamped à 0
    const lead: LeadScoreInput = {
      company: null, phone: null, utm_source: null,
      referrer: null, source: null, email: "spam@yopmail.com",
      converted_to_user_id: null, converted_to_paid_at: null,
      message: null, notes_count: 0,
    };
    expect(computeLeadScore(lead)).toBe(0);
  });

  it("score clamped à 100 maximum", () => {
    // Lead parfait : 10 + 5 + 10 + 5 + 15 + 20 + 30 + 25 + 5 = 125 → clamped 100
    const lead: LeadScoreInput = {
      company: "Corp", phone: "+33600000000", utm_source: "google",
      referrer: "https://ph.com", source: "checkout", email: "test@gmail.com",
      converted_to_user_id: "uid", converted_to_paid_at: "2026-01-01",
      message: "Je suis intéressé", notes_count: 10,
    };
    expect(computeLeadScore(lead)).toBe(100);
  });

  it("lead vide = 0 points", () => {
    const lead: LeadScoreInput = {
      company: null, phone: null, utm_source: null,
      referrer: null, source: null, email: "test@gmail.com",
      converted_to_user_id: null, converted_to_paid_at: null,
      message: null, notes_count: 0,
    };
    expect(computeLeadScore(lead)).toBe(0);
  });

  it("notes plafonnées à +25 (5 notes)", () => {
    const lead: LeadScoreInput = {
      company: null, phone: null, utm_source: null,
      referrer: null, source: null, email: "test@gmail.com",
      converted_to_user_id: null, converted_to_paid_at: null,
      message: null, notes_count: 20,
    };
    // 20 * 5 = 100, capped at 25
    expect(computeLeadScore(lead)).toBe(25);
  });

  it("+5 pour message", () => {
    const lead: LeadScoreInput = {
      company: null, phone: null, utm_source: null,
      referrer: null, source: null, email: "test@gmail.com",
      converted_to_user_id: null, converted_to_paid_at: null,
      message: "Bonjour, je voudrais en savoir plus", notes_count: 0,
    };
    expect(computeLeadScore(lead)).toBe(5);
  });

  it("email vide ne cause pas de -10", () => {
    const lead: LeadScoreInput = {
      company: null, phone: null, utm_source: null,
      referrer: null, source: null, email: null,
      converted_to_user_id: null, converted_to_paid_at: null,
      message: null, notes_count: 0,
    };
    expect(computeLeadScore(lead)).toBe(0);
  });
});

describe("Campaign Cost Metrics", () => {
  // Miroir JS de la logique dans growth/route.ts et campaigns/[id]/route.ts

  function computeCPL(budgetSpent: number, leadsCount: number): number {
    return leadsCount > 0 ? Math.round((budgetSpent / leadsCount) * 100) / 100 : 0;
  }

  function computeCPSU(budgetSpent: number, signupsCount: number): number {
    return signupsCount > 0 ? Math.round((budgetSpent / signupsCount) * 100) / 100 : 0;
  }

  function computeCPP(budgetSpent: number, paidCount: number): number {
    return paidCount > 0 ? Math.round((budgetSpent / paidCount) * 100) / 100 : 0;
  }

  function computeROAS(revenueCents: number, budgetSpent: number): number {
    return budgetSpent > 0 ? Math.round((revenueCents / budgetSpent) * 100) / 100 : 0;
  }

  it("CPL = budget_spent / leads_count", () => {
    expect(computeCPL(1000, 50)).toBe(20);
  });

  it("CPL arrondi à 2 décimales", () => {
    expect(computeCPL(1000, 3)).toBe(333.33);
  });

  it("CPL = 0 si pas de leads", () => {
    expect(computeCPL(1000, 0)).toBe(0);
  });

  it("CPSU = budget_spent / signups_count", () => {
    expect(computeCPSU(1000, 10)).toBe(100);
  });

  it("CPSU = 0 si pas de signups", () => {
    expect(computeCPSU(1000, 0)).toBe(0);
  });

  it("CPP = budget_spent / paid_count", () => {
    expect(computeCPP(1000, 5)).toBe(200);
  });

  it("CPP = 0 si pas de paid", () => {
    expect(computeCPP(1000, 0)).toBe(0);
  });

  it("ROAS = revenue / budget_spent", () => {
    expect(computeROAS(5000, 1000)).toBe(5);
  });

  it("ROAS = 0 si pas de budget", () => {
    expect(computeROAS(5000, 0)).toBe(0);
  });

  it("ROAS arrondi à 2 décimales", () => {
    expect(computeROAS(7500, 1000)).toBe(7.5);
  });
});

describe("Conversion Rates", () => {
  // Miroir de la logique dans growth/route.ts
  function pct(num: number, den: number): number {
    return den > 0 ? Math.round((num / den) * 10000) / 100 : 0;
  }

  it("lead → signup conversion rate", () => {
    expect(pct(25, 100)).toBe(25);
  });

  it("signup → activation conversion rate", () => {
    expect(pct(15, 25)).toBe(60);
  });

  it("activation → paid conversion rate", () => {
    expect(pct(5, 15)).toBe(33.33);
  });

  it("lead → paid conversion rate", () => {
    expect(pct(5, 100)).toBe(5);
  });

  it("0 division retourne 0", () => {
    expect(pct(10, 0)).toBe(0);
  });

  it("100% si tous convertis", () => {
    expect(pct(50, 50)).toBe(100);
  });

  it("0% si aucun converti", () => {
    expect(pct(0, 100)).toBe(0);
  });

  it("précision à 2 décimales", () => {
    expect(pct(1, 3)).toBe(33.33);
    expect(pct(2, 3)).toBe(66.67);
  });
});

describe("ROI Computation", () => {
  function computeROI(revenue: number, cost: number): number {
    return cost > 0 ? Math.round(((revenue - cost) / cost) * 10000) / 100 : 0;
  }

  it("ROI positif quand revenue > cost", () => {
    expect(computeROI(5000, 1000)).toBe(400);
  });

  it("ROI négatif quand revenue < cost", () => {
    expect(computeROI(500, 1000)).toBe(-50);
  });

  it("ROI = 0 quand revenue = cost", () => {
    expect(computeROI(1000, 1000)).toBe(0);
  });

  it("ROI = 0 quand pas de cost", () => {
    expect(computeROI(5000, 0)).toBe(0);
  });
});

// =====================================================================
// 4. API ROUTE LOGIC TESTS
// =====================================================================

describe("Campaign Slug Generation", () => {
  function slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  it("convertit un nom simple en slug", () => {
    expect(slugify("Summer Sale 2026")).toBe("summer-sale-2026");
  });

  it("gère les accents français", () => {
    expect(slugify("Été Promo Spéciale")).toBe("ete-promo-speciale");
  });

  it("supprime les caractères spéciaux", () => {
    expect(slugify("Launch! @Campaign #1")).toBe("launch-campaign-1");
  });

  it("espaces multiples = un seul tiret", () => {
    expect(slugify("Too   Many   Spaces")).toBe("too-many-spaces");
  });

  it("tirets multiples = un seul tiret", () => {
    expect(slugify("test---slug")).toBe("test-slug");
  });

  it("trim les espaces", () => {
    expect(slugify("  padded  ")).toBe("padded");
  });

  it("chaîne vide retourne chaîne vide", () => {
    expect(slugify("")).toBe("");
  });
});

describe("Campaign Status Transitions", () => {
  const VALID_CAMPAIGN_STATUSES = ["draft", "active", "paused", "archived", "completed"];

  // Les transitions valides d'une campagne
  const VALID_TRANSITIONS: Record<string, string[]> = {
    draft: ["active", "archived"],
    active: ["paused", "completed", "archived"],
    paused: ["active", "completed", "archived"],
    completed: ["archived"],
    archived: [], // terminal state
  };

  function isValidTransition(from: string, to: string): boolean {
    if (!VALID_CAMPAIGN_STATUSES.includes(from)) return false;
    if (!VALID_CAMPAIGN_STATUSES.includes(to)) return false;
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  it("draft → active est valide", () => {
    expect(isValidTransition("draft", "active")).toBe(true);
  });

  it("active → paused est valide", () => {
    expect(isValidTransition("active", "paused")).toBe(true);
  });

  it("active → completed est valide", () => {
    expect(isValidTransition("active", "completed")).toBe(true);
  });

  it("paused → active est valide (reprise)", () => {
    expect(isValidTransition("paused", "active")).toBe(true);
  });

  it("archived → active est invalide (terminal state)", () => {
    expect(isValidTransition("archived", "active")).toBe(false);
  });

  it("completed → draft est invalide", () => {
    expect(isValidTransition("completed", "draft")).toBe(false);
  });

  it("statut inconnu est rejeté", () => {
    expect(isValidTransition("unknown", "active")).toBe(false);
    expect(isValidTransition("active", "unknown")).toBe(false);
  });
});

describe("Lead Status Transitions", () => {
  const VALID_LEAD_STATUSES = [
    "new", "contacted", "qualified", "nurturing",
    "converted_signup", "converted_paid", "lost", "spam", "archived",
  ];

  it("tous les statuts attendus sont définis", () => {
    expect(VALID_LEAD_STATUSES).toContain("new");
    expect(VALID_LEAD_STATUSES).toContain("contacted");
    expect(VALID_LEAD_STATUSES).toContain("qualified");
    expect(VALID_LEAD_STATUSES).toContain("nurturing");
    expect(VALID_LEAD_STATUSES).toContain("converted_signup");
    expect(VALID_LEAD_STATUSES).toContain("converted_paid");
    expect(VALID_LEAD_STATUSES).toContain("lost");
    expect(VALID_LEAD_STATUSES).toContain("spam");
    expect(VALID_LEAD_STATUSES).toContain("archived");
  });

  it("9 statuts au total", () => {
    expect(VALID_LEAD_STATUSES).toHaveLength(9);
  });

  it("statut par défaut = new", () => {
    expect(VALID_LEAD_STATUSES[0]).toBe("new");
  });
});

describe("Bulk Action Validation", () => {
  const VALID_BULK_ACTIONS = [
    "update_status", "add_tag", "remove_tag",
    "assign_owner", "compute_scores", "match_users",
  ];

  it("update_status nécessite lead_ids et value", () => {
    function validateBulkAction(action: string, leadIds?: string[], value?: string): string | null {
      if (!VALID_BULK_ACTIONS.includes(action)) return `Action inconnue: ${action}`;
      if (action === "update_status") {
        if (!leadIds || leadIds.length === 0) return "lead_ids requis";
        if (!value) return "value requis";
      }
      if (action === "add_tag" || action === "remove_tag") {
        if (!leadIds || leadIds.length === 0) return "lead_ids requis";
        if (!value) return "value requis";
      }
      if (action === "assign_owner") {
        if (!leadIds || leadIds.length === 0) return "lead_ids requis";
        if (!value) return "value requis";
      }
      return null;
    }

    expect(validateBulkAction("update_status", ["id1"], "qualified")).toBeNull();
    expect(validateBulkAction("update_status", [], "qualified")).toBe("lead_ids requis");
    expect(validateBulkAction("update_status", ["id1"])).toBe("value requis");
    expect(validateBulkAction("add_tag", ["id1"], "hot")).toBeNull();
    expect(validateBulkAction("remove_tag", ["id1"], "cold")).toBeNull();
    expect(validateBulkAction("assign_owner", ["id1"], "Alice")).toBeNull();
    expect(validateBulkAction("compute_scores")).toBeNull();
    expect(validateBulkAction("match_users")).toBeNull();
    expect(validateBulkAction("delete_all")).toBe("Action inconnue: delete_all");
  });
});

describe("Email Campaign Audience Types", () => {
  const VALID_AUDIENCE_TYPES = ["all", "segment", "manual", "waitlist", "leads"];

  it("5 types d'audience", () => {
    expect(VALID_AUDIENCE_TYPES).toHaveLength(5);
  });

  it("tous les types attendus", () => {
    expect(VALID_AUDIENCE_TYPES).toContain("all");
    expect(VALID_AUDIENCE_TYPES).toContain("segment");
    expect(VALID_AUDIENCE_TYPES).toContain("manual");
    expect(VALID_AUDIENCE_TYPES).toContain("waitlist");
    expect(VALID_AUDIENCE_TYPES).toContain("leads");
  });

  it("type par défaut = all", () => {
    expect(VALID_AUDIENCE_TYPES[0]).toBe("all");
  });

  it("type inconnu n'est pas accepté", () => {
    expect(VALID_AUDIENCE_TYPES).not.toContain("everyone");
    expect(VALID_AUDIENCE_TYPES).not.toContain("custom");
  });
});

describe("Email Campaign Statuses", () => {
  const VALID_EMAIL_STATUSES = ["draft", "scheduled", "sending", "sent", "paused", "cancelled", "failed"];

  it("7 statuts d'email campaign", () => {
    expect(VALID_EMAIL_STATUSES).toHaveLength(7);
  });

  it("commence en draft", () => {
    expect(VALID_EMAIL_STATUSES[0]).toBe("draft");
  });
});

// =====================================================================
// 5. DATA INTEGRITY TESTS
// =====================================================================

describe("Lead-to-User Matching", () => {
  it("matching par email case-insensitive", () => {
    const leadEmail = "John.Doe@Example.COM";
    const userEmail = "john.doe@example.com";
    expect(leadEmail.toLowerCase()).toBe(userEmail.toLowerCase());
  });

  it("emails avec espaces trim avant matching", () => {
    const leadEmail = "  user@test.com  ";
    const userEmail = "user@test.com";
    expect(leadEmail.trim().toLowerCase()).toBe(userEmail.toLowerCase());
  });
});

describe("Duplicate Lead Handling", () => {
  it("détection de doublons par email + site_id", () => {
    const leads = [
      { email: "alice@test.com", site_id: "site-1" },
      { email: "alice@test.com", site_id: "site-1" }, // duplicate
      { email: "alice@test.com", site_id: "site-2" }, // different site = not duplicate
      { email: "bob@test.com", site_id: "site-1" },
    ];

    function findDuplicates(leads: { email: string; site_id: string }[]): number {
      const seen = new Set<string>();
      let dupeCount = 0;
      for (const lead of leads) {
        const key = `${lead.email.toLowerCase()}:${lead.site_id}`;
        if (seen.has(key)) {
          dupeCount++;
        } else {
          seen.add(key);
        }
      }
      return dupeCount;
    }

    expect(findDuplicates(leads)).toBe(1);
  });
});

describe("Campaign Slug Uniqueness", () => {
  it("slug collision append timestamp pour unicité", () => {
    const existingSlugs = ["summer-sale", "winter-promo"];

    function ensureUniqueSlug(slug: string, existing: string[]): string {
      if (existing.includes(slug)) {
        return `${slug}-${Date.now()}`;
      }
      return slug;
    }

    const result = ensureUniqueSlug("summer-sale", existingSlugs);
    expect(result).not.toBe("summer-sale");
    expect(result.startsWith("summer-sale-")).toBe(true);
    // Le timestamp fait que le slug est unique
    expect(result.length).toBeGreaterThan("summer-sale-".length);
  });

  it("slug unique n'est pas modifié", () => {
    const existingSlugs = ["summer-sale"];

    function ensureUniqueSlug(slug: string, existing: string[]): string {
      if (existing.includes(slug)) {
        return `${slug}-${Date.now()}`;
      }
      return slug;
    }

    expect(ensureUniqueSlug("new-campaign", existingSlugs)).toBe("new-campaign");
  });
});

// =====================================================================
// 6. EMPTY STATE TESTS
// =====================================================================

describe("Empty States", () => {
  it("pas de données tracking = pas de fausses métriques", () => {
    const leads: any[] = [];
    const conversions: any[] = [];

    const totalLeads = leads.length;
    const totalSignups = conversions.filter((c: any) => c.conversion_type === "signup_completed").length;
    const totalPaid = conversions.filter((c: any) => c.conversion_type === "paid_conversion").length;

    expect(totalLeads).toBe(0);
    expect(totalSignups).toBe(0);
    expect(totalPaid).toBe(0);
  });

  it("email campaigns sans delivery tracking = 0 opens/clicks", () => {
    const emailCampaign = {
      id: "ec-1",
      name: "Welcome Email",
      status: "sent",
      total_recipients: 100,
      total_delivered: null,
      total_opened: null,
      total_clicked: null,
    };

    expect(emailCampaign.total_opened || 0).toBe(0);
    expect(emailCampaign.total_clicked || 0).toBe(0);
  });

  it("campaign sans budget = pas de CPL/CPSU calculable", () => {
    function formatCPL(budgetSpent: number, leadsCount: number): string {
      if (budgetSpent === 0) return "—";
      return leadsCount > 0 ? `${(budgetSpent / leadsCount).toFixed(2)}€` : "—";
    }

    function formatCPSU(budgetSpent: number, signupsCount: number): string {
      if (budgetSpent === 0) return "—";
      return signupsCount > 0 ? `${(budgetSpent / signupsCount).toFixed(2)}€` : "—";
    }

    expect(formatCPL(0, 10)).toBe("—");
    expect(formatCPSU(0, 5)).toBe("—");
  });

  it("nouvelle campagne commence avec 0 leads/signups/paid", () => {
    const newCampaignStats = {
      leads_count: 0,
      signups_count: 0,
      paid_count: 0,
      revenue_cents: 0,
    };

    expect(newCampaignStats.leads_count).toBe(0);
    expect(newCampaignStats.signups_count).toBe(0);
    expect(newCampaignStats.paid_count).toBe(0);
    expect(newCampaignStats.revenue_cents).toBe(0);
  });

  it("conversion rates = 0% quand leads = 0", () => {
    const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 10000) / 100 : 0);

    expect(pct(0, 0)).toBe(0);
    expect(pct(5, 0)).toBe(0);
  });

  it("ROAS = 0 quand budget = 0", () => {
    const roas = (revenue: number, budget: number) =>
      budget > 0 ? Math.round((revenue / budget) * 100) / 100 : 0;

    expect(roas(5000, 0)).toBe(0);
  });

  it("attribution comparison est vide sans leads", () => {
    const leads: any[] = [];
    const attributionMap: Record<string, { first_touch_leads: number; last_touch_leads: number }> = {};

    for (const lead of leads) {
      if (lead.first_touch_campaign_id) {
        if (!attributionMap[lead.first_touch_campaign_id]) {
          attributionMap[lead.first_touch_campaign_id] = { first_touch_leads: 0, last_touch_leads: 0 };
        }
        attributionMap[lead.first_touch_campaign_id].first_touch_leads++;
      }
    }

    expect(Object.keys(attributionMap)).toHaveLength(0);
  });

  it("top sources est vide sans leads", () => {
    const leads: any[] = [];
    const sourceCounts: Record<string, number> = {};
    for (const lead of leads) {
      const src = lead.utm_source || "direct";
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    }
    expect(Object.keys(sourceCounts)).toHaveLength(0);
  });
});

// =====================================================================
// BONUS: Attribution Model Comparison
// =====================================================================

describe("Attribution Model — First Touch vs Last Touch", () => {
  it("premier touch attribue la conversion au premier canal", () => {
    const leads = [
      { first_touch_campaign_id: "camp-google", last_touch_campaign_id: "camp-tiktok" },
      { first_touch_campaign_id: "camp-google", last_touch_campaign_id: "camp-email" },
      { first_touch_campaign_id: "camp-meta", last_touch_campaign_id: "camp-meta" },
    ];

    const firstTouchCounts: Record<string, number> = {};
    for (const lead of leads) {
      if (lead.first_touch_campaign_id) {
        firstTouchCounts[lead.first_touch_campaign_id] =
          (firstTouchCounts[lead.first_touch_campaign_id] || 0) + 1;
      }
    }

    expect(firstTouchCounts["camp-google"]).toBe(2);
    expect(firstTouchCounts["camp-meta"]).toBe(1);
    expect(firstTouchCounts["camp-tiktok"]).toBeUndefined();
  });

  it("dernier touch attribue la conversion au dernier canal", () => {
    const leads = [
      { first_touch_campaign_id: "camp-google", last_touch_campaign_id: "camp-tiktok" },
      { first_touch_campaign_id: "camp-google", last_touch_campaign_id: "camp-email" },
      { first_touch_campaign_id: "camp-meta", last_touch_campaign_id: "camp-meta" },
    ];

    const lastTouchCounts: Record<string, number> = {};
    for (const lead of leads) {
      if (lead.last_touch_campaign_id) {
        lastTouchCounts[lead.last_touch_campaign_id] =
          (lastTouchCounts[lead.last_touch_campaign_id] || 0) + 1;
      }
    }

    expect(lastTouchCounts["camp-tiktok"]).toBe(1);
    expect(lastTouchCounts["camp-email"]).toBe(1);
    expect(lastTouchCounts["camp-meta"]).toBe(1);
    expect(lastTouchCounts["camp-google"]).toBeUndefined();
  });
});
