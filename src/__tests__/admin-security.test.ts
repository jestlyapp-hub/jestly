// ── Tests de sécurité du panneau admin ────────────────────────────────
// Vérifie les helpers de validation, l'authentification admin,
// les constantes et le rate limiting.

import { describe, it, expect, vi, afterAll } from "vitest";

// ── 1. Helpers de validation (unit tests) ─────────────────────────────

import {
  escapeIlike,
  validateUuid,
  validateSort,
  validatePagination,
  sanitizeSearchTerm,
} from "@/lib/admin/validation";

describe("escapeIlike", () => {
  it("échappe le caractère %", () => {
    expect(escapeIlike("test%ing")).toBe("test\\%ing");
  });

  it("échappe le caractère _", () => {
    expect(escapeIlike("test_ing")).toBe("test\\_ing");
  });

  it("échappe le backslash", () => {
    expect(escapeIlike("test\\ing")).toBe("test\\\\ing");
  });

  it("laisse le texte normal inchangé", () => {
    expect(escapeIlike("hello world")).toBe("hello world");
  });

  it("gère la chaîne vide", () => {
    expect(escapeIlike("")).toBe("");
  });

  it("échappe plusieurs caractères spéciaux", () => {
    expect(escapeIlike("%_\\")).toBe("\\%\\_\\\\");
  });
});

describe("validateUuid", () => {
  it("accepte un UUID v4 valide", () => {
    expect(validateUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("rejette une chaîne vide", () => {
    expect(validateUuid("")).toBe(false);
  });

  it("rejette une chaîne aléatoire", () => {
    expect(validateUuid("not-a-uuid")).toBe(false);
  });

  it("rejette un UUID partiel", () => {
    expect(validateUuid("550e8400-e29b-41d4")).toBe(false);
  });

  it("rejette un UUID avec injection SQL", () => {
    expect(
      validateUuid("550e8400-e29b-41d4-a716-446655440000'; DROP TABLE--"),
    ).toBe(false);
  });
});

describe("validateSort", () => {
  const allowed = ["created_at", "name", "email"];

  it("accepte un champ de tri valide", () => {
    expect(validateSort("name", allowed)).toBe("name");
  });

  it("rejette un champ invalide et retourne le défaut", () => {
    expect(validateSort("password", allowed)).toBe("created_at");
  });

  it("rejette une tentative d'injection SQL", () => {
    expect(validateSort("name; DROP TABLE", allowed)).toBe("created_at");
  });
});

describe("validatePagination", () => {
  it("limite le max à 200", () => {
    expect(validatePagination({ limit: "1000" }).limit).toBe(200);
  });

  it("limite le min à 1", () => {
    expect(validatePagination({ limit: "-5" }).limit).toBe(1);
  });

  it("utilise 50 par défaut pour limit", () => {
    expect(validatePagination({}).limit).toBe(50);
  });

  it("rejette un offset négatif", () => {
    expect(validatePagination({ offset: "-10" }).offset).toBe(0);
  });

  it("gère NaN gracieusement", () => {
    expect(validatePagination({ limit: "abc" }).limit).toBe(50);
  });

  it("accepte des valeurs normales", () => {
    const result = validatePagination({ limit: "25", offset: "10" });
    expect(result.limit).toBe(25);
    expect(result.offset).toBe(10);
  });
});

describe("sanitizeSearchTerm", () => {
  it("supprime les espaces superflus", () => {
    expect(sanitizeSearchTerm("  hello  ")).toBe("hello");
  });

  it("limite la longueur à 200 caractères", () => {
    expect(sanitizeSearchTerm("a".repeat(300)).length).toBe(200);
  });

  it("gère la chaîne vide", () => {
    expect(sanitizeSearchTerm("")).toBe("");
  });
});

// ── 2. Fonction isAdmin ───────────────────────────────────────────────

import { isAdmin, ADMIN_EMAIL } from "@/lib/admin/auth";

describe("isAdmin", () => {
  it("retourne false pour un utilisateur null", () => {
    expect(isAdmin(null)).toBe(false);
  });

  it("retourne false pour un utilisateur undefined", () => {
    expect(isAdmin(undefined)).toBe(false);
  });

  it("retourne false pour un utilisateur sans email", () => {
    expect(isAdmin({ id: "123" } as any)).toBe(false);
  });

  it("retourne false pour un email non-admin", () => {
    expect(isAdmin({ email: "other@test.com" } as any)).toBe(false);
  });

  it("retourne true pour l'email admin", () => {
    expect(isAdmin({ email: ADMIN_EMAIL, id: "some-id" } as any)).toBe(true);
  });

  it("est insensible à la casse", () => {
    expect(
      isAdmin({ email: "JESTLYAPP@GMAIL.COM", id: "some-id" } as any),
    ).toBe(true);
  });

  it("rejette les emails similaires mais différents", () => {
    expect(
      isAdmin({ email: "jestlyapp@gmail.com.evil.com" } as any),
    ).toBe(false);
  });
});

// ── 3. Constantes ─────────────────────────────────────────────────────

import { ADMIN_ACTIONS, VALID_FLAG_TYPES } from "@/lib/admin/constants";

describe("ADMIN_ACTIONS", () => {
  it("contient tous les types d'actions requis", () => {
    expect(ADMIN_ACTIONS.ACCESS_GRANTED).toBe("access_granted");
    expect(ADMIN_ACTIONS.ACCESS_DENIED).toBe("access_denied");
    expect(ADMIN_ACTIONS.VIEW_ACCOUNT).toBe("view_account");
    expect(ADMIN_ACTIONS.RATE_LIMIT_HIT).toBe("rate_limit_hit");
  });

  it("contient les actions de gestion", () => {
    expect(ADMIN_ACTIONS.ADD_NOTE).toBe("add_note");
    expect(ADMIN_ACTIONS.ADD_FLAG).toBe("add_flag");
    expect(ADMIN_ACTIONS.REMOVE_FLAG).toBe("remove_flag");
    expect(ADMIN_ACTIONS.EXPORT_DATA).toBe("export_data");
  });
});

describe("VALID_FLAG_TYPES", () => {
  it("contient les types de flags attendus", () => {
    expect(VALID_FLAG_TYPES).toContain("watch");
    expect(VALID_FLAG_TYPES).toContain("blocked");
    expect(VALID_FLAG_TYPES).toContain("vip");
  });

  it("ne contient pas de types inattendus", () => {
    expect(VALID_FLAG_TYPES).not.toContain("admin");
    expect(VALID_FLAG_TYPES).not.toContain("superuser");
  });

  it("contient exactement 6 types", () => {
    expect(VALID_FLAG_TYPES).toHaveLength(6);
  });
});

// ── 4. Rate limiting ──────────────────────────────────────────────────

import { checkAdminRateLimit } from "@/lib/admin/rate-limit";

describe("checkAdminRateLimit", () => {
  it("autorise les requêtes dans le budget", () => {
    const result = checkAdminRateLimit("test-user-ok", "test-endpoint", 5);
    expect(result).toBeNull();
  });

  it("bloque les requêtes au-delà de la limite", () => {
    const userId = "rate-limit-test-" + Date.now();
    // Consommer toutes les requêtes autorisées
    for (let i = 0; i < 3; i++) {
      checkAdminRateLimit(userId, "test-burst", 3);
    }
    // La prochaine doit être bloquée
    const blocked = checkAdminRateLimit(userId, "test-burst", 3);
    expect(blocked).not.toBeNull();
    // Vérifie que c'est une réponse 429
    expect(blocked!.status).toBe(429);
  });

  it("isole les endpoints entre eux", () => {
    const userId = "isolation-test-" + Date.now();
    // Saturer un endpoint
    for (let i = 0; i < 2; i++) {
      checkAdminRateLimit(userId, "endpoint-a", 2);
    }
    // L'autre endpoint doit rester accessible
    const result = checkAdminRateLimit(userId, "endpoint-b", 2);
    expect(result).toBeNull();
  });

  it("isole les utilisateurs entre eux", () => {
    const userA = "user-a-" + Date.now();
    const userB = "user-b-" + Date.now();
    // Saturer l'utilisateur A
    for (let i = 0; i < 2; i++) {
      checkAdminRateLimit(userA, "shared-ep", 2);
    }
    // L'utilisateur B doit rester autorisé
    const result = checkAdminRateLimit(userB, "shared-ep", 2);
    expect(result).toBeNull();
  });

  it("inclut un header Retry-After dans la réponse 429", async () => {
    const userId = "retry-after-test-" + Date.now();
    for (let i = 0; i < 1; i++) {
      checkAdminRateLimit(userId, "retry-ep", 1);
    }
    const blocked = checkAdminRateLimit(userId, "retry-ep", 1);
    expect(blocked).not.toBeNull();
    expect(blocked!.headers.get("Retry-After")).toBeTruthy();
  });
});

// ── 5. Ré-exports depuis index ────────────────────────────────────────

describe("index re-exports", () => {
  it("exporte toutes les fonctions depuis le barrel", async () => {
    const admin = await import("@/lib/admin");
    expect(admin.escapeIlike).toBeDefined();
    expect(admin.validateUuid).toBeDefined();
    expect(admin.validateSort).toBeDefined();
    expect(admin.validatePagination).toBeDefined();
    expect(admin.sanitizeSearchTerm).toBeDefined();
    expect(admin.isAdmin).toBeDefined();
    expect(admin.ADMIN_EMAIL).toBeDefined();
    expect(admin.ADMIN_ACTIONS).toBeDefined();
    expect(admin.VALID_FLAG_TYPES).toBeDefined();
    expect(admin.checkAdminRateLimit).toBeDefined();
  });
});
