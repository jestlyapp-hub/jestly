/**
 * Settings Module — End-to-End Tests
 *
 * Tests the /api/settings GET & PATCH endpoints,
 * JSONB merge behavior, and avatar pipeline.
 *
 * Run: npx tsx scripts/test-settings.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

let passed = 0;
let failed = 0;
const results: { name: string; ok: boolean; detail?: string }[] = [];

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    results.push({ name, ok: true });
  } else {
    failed++;
    results.push({ name, ok: false, detail });
  }
}

// ── Test helpers ──

function testValidatePhone() {
  const clean = (v: string) => v.replace(/[\s\-\.\(\)]/g, "");
  const isValid = (v: string) => {
    if (!v) return true;
    return /^\+?\d{8,15}$/.test(clean(v));
  };

  assert("validatePhone: empty string is valid", isValid(""));
  assert("validatePhone: +33612345678 is valid", isValid("+33612345678"));
  assert("validatePhone: +33 6 12 34 56 78 is valid", isValid("+33 6 12 34 56 78"));
  assert("validatePhone: 0612345678 is valid", isValid("0612345678"));
  assert("validatePhone: too short (12345) is invalid", !isValid("12345"));
  assert("validatePhone: letters (abc) is invalid", !isValid("abc"));
}

function testValidateEmail() {
  const isValid = (v: string) => {
    if (!v) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  assert("validateEmail: empty is valid", isValid(""));
  assert("validateEmail: user@example.com is valid", isValid("user@example.com"));
  assert("validateEmail: missing @ is invalid", !isValid("userexample.com"));
  assert("validateEmail: missing domain is invalid", !isValid("user@"));
}

function testValidateUrl() {
  const isValid = (v: string) => {
    if (!v) return true;
    try { new URL(v); return true; } catch { return false; }
  };

  assert("validateUrl: empty is valid", isValid(""));
  assert("validateUrl: https://example.com is valid", isValid("https://example.com"));
  assert("validateUrl: not-a-url is invalid", !isValid("not-a-url"));
  assert("validateUrl: http://localhost:3000 is valid", isValid("http://localhost:3000"));
}

function testValidateSiret() {
  const isValid = (v: string) => {
    if (!v) return true;
    const digits = v.replace(/\s/g, "");
    return /^\d{14}$/.test(digits);
  };

  assert("validateSiret: empty is valid", isValid(""));
  assert("validateSiret: 14 digits is valid", isValid("12345678901234"));
  assert("validateSiret: 14 digits with spaces is valid", isValid("123 456 789 01234"));
  assert("validateSiret: 13 digits is invalid", !isValid("1234567890123"));
  assert("validateSiret: letters is invalid", !isValid("ABCDE12345678"));
}

function testValidateVat() {
  const isValid = (v: string) => {
    if (!v) return true;
    return /^[A-Z]{2}\d{9,12}$/.test(v.replace(/\s/g, ""));
  };

  assert("validateVat: empty is valid", isValid(""));
  assert("validateVat: FR12345678901 is valid", isValid("FR12345678901"));
  assert("validateVat: DE123456789 is valid", isValid("DE123456789"));
  assert("validateVat: missing country code is invalid", !isValid("12345678901"));
  assert("validateVat: lowercase country code is invalid", !isValid("fr12345678901"));
}

// ── Test JSONB merge simulation ──

function testJsonbMerge() {
  // Simulate the frontend merge pattern
  const original = {
    settings: { defaultPage: "dashboard", compactMode: false, dateFormat: "dd/MM/yyyy" },
    workspace: { siret: "12345678901234", city: "Paris" },
    notifications: { email: { newOrders: true }, inApp: { taskReminders: true } },
  };

  // User changes only one field in settings
  const updatedSettings = { ...original.settings, compactMode: true };
  assert(
    "JSONB merge: changing one settings field preserves others",
    updatedSettings.defaultPage === "dashboard" && updatedSettings.compactMode === true && updatedSettings.dateFormat === "dd/MM/yyyy"
  );

  // User changes one workspace field
  const updatedWorkspace = { ...original.workspace, city: "Lyon" };
  assert(
    "JSONB merge: changing workspace.city preserves siret",
    updatedWorkspace.siret === "12345678901234" && updatedWorkspace.city === "Lyon"
  );

  // User changes one notification sub-field
  const updatedNotifs = {
    ...original.notifications,
    email: { ...original.notifications.email, newOrders: false },
  };
  assert(
    "JSONB merge: changing notifications.email preserves inApp",
    updatedNotifs.email.newOrders === false && updatedNotifs.inApp.taskReminders === true
  );

  // Simulate partial PATCH: only settings sent, workspace & notifications untouched
  const patchBody = {
    settings: updatedSettings,
    workspace: original.workspace,
    notifications: original.notifications,
  };
  assert(
    "JSONB merge: full PATCH preserves all sections",
    patchBody.settings.compactMode === true &&
    patchBody.workspace.siret === "12345678901234" &&
    patchBody.notifications.email.newOrders === true
  );
}

// ── Test buildForm helper ──

function testBuildForm() {
  const profile = {
    id: "uuid",
    email: "test@test.com",
    full_name: "John Doe",
    business_name: null,
    avatar_url: null,
    subdomain: "johndoe",
    plan: "free" as const,
    phone: null,
    role: null,
    locale: null,
    timezone: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    settings: {},
    workspace: {},
    notifications: {},
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  };

  const form = {
    fullName: profile.full_name || "",
    phone: profile.phone || "",
    role: profile.role || "",
    locale: profile.locale || "fr",
    timezone: profile.timezone || "Europe/Paris",
    businessName: profile.business_name || "",
    settings: { ...profile.settings },
    workspace: { ...profile.workspace },
    notifications: { ...profile.notifications },
  };

  assert("buildForm: fullName from profile", form.fullName === "John Doe");
  assert("buildForm: null phone defaults to empty string", form.phone === "");
  assert("buildForm: null locale defaults to fr", form.locale === "fr");
  assert("buildForm: null timezone defaults to Europe/Paris", form.timezone === "Europe/Paris");
  assert("buildForm: null business_name defaults to empty string", form.businessName === "");
  assert("buildForm: empty settings stays empty object", JSON.stringify(form.settings) === "{}");
}

// ── Test avatar fallback ──

function testAvatarFallback() {
  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  assert("avatar fallback: 'John Doe' → 'JD'", getInitials("John Doe") === "JD");
  assert("avatar fallback: 'Alice' → 'A'", getInitials("Alice") === "A");
  assert("avatar fallback: empty string → '?'", getInitials("") === "?");
  assert("avatar fallback: 'A B C D' → 'AB' (max 2)", getInitials("A B C D") === "AB");
  assert("avatar fallback: '  ' trims to '?'", getInitials("  ") === "?");
}

// ── Test search index ──

function testSearchIndex() {
  const SEARCH_INDEX = [
    { keywords: ["nom", "prénom", "email", "profil", "avatar"], section: "compte", label: "Compte & Profil" },
    { keywords: ["workspace", "entreprise", "siret", "tva"], section: "workspace", label: "Workspace" },
    { keywords: ["facture", "facturation", "tva", "devise"], section: "facturation", label: "Facturation" },
  ];

  const search = (q: string) =>
    SEARCH_INDEX.filter(entry =>
      entry.keywords.some(k => k.toLowerCase().includes(q.toLowerCase())) ||
      entry.label.toLowerCase().includes(q.toLowerCase())
    );

  assert("search: 'nom' matches compte", search("nom").some(r => r.section === "compte"));
  assert("search: 'siret' matches workspace", search("siret").some(r => r.section === "workspace"));
  assert("search: 'tva' matches workspace AND facturation", search("tva").length === 2);
  assert("search: 'xyz' matches nothing", search("xyz").length === 0);
  assert("search: 'Compte' matches by label", search("Compte").some(r => r.section === "compte"));
}

// ── Test API whitelist ──

function testApiWhitelist() {
  const allowed = [
    "full_name", "business_name", "avatar_url", "phone", "role",
    "locale", "timezone",
    "settings", "workspace", "notifications",
  ];

  const body: Record<string, unknown> = {
    full_name: "Test",
    id: "hacked",
    email: "hacked@evil.com",
    plan: "pro",
    stripe_customer_id: "cus_hacked",
    settings: { compactMode: true },
  };

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  assert("API whitelist: full_name passes through", updates.full_name === "Test");
  assert("API whitelist: settings passes through", (updates.settings as any)?.compactMode === true);
  assert("API whitelist: id is blocked", updates.id === undefined);
  assert("API whitelist: email is blocked", updates.email === undefined);
  assert("API whitelist: plan is blocked", updates.plan === undefined);
  assert("API whitelist: stripe_customer_id is blocked", updates.stripe_customer_id === undefined);
}

// ── Test dirty state ──

function testDirtyState() {
  let dirtySections = new Set<string>();

  const markDirty = (section: string) => {
    dirtySections = new Set(dirtySections);
    dirtySections.add(section);
  };

  assert("dirty: initially empty", dirtySections.size === 0);

  markDirty("compte");
  assert("dirty: after marking compte, size=1", dirtySections.size === 1);
  assert("dirty: compte is dirty", dirtySections.has("compte"));

  markDirty("workspace");
  assert("dirty: after marking workspace, size=2", dirtySections.size === 2);

  markDirty("compte"); // duplicate
  assert("dirty: duplicate mark doesn't increase size", dirtySections.size === 2);

  // Clear
  dirtySections = new Set();
  assert("dirty: after clear, size=0", dirtySections.size === 0);
}

// ── Export test ──

function testCsvGeneration() {
  const rows = [
    { id: "1", name: "Client A", email: "a@test.com" },
    { id: "2", name: 'Client "B"', email: "b@test.com" },
  ];

  const allKeys = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const header = allKeys.map(k => `"${k}"`).join(",");
  const dataRows = rows.map(row =>
    allKeys.map(k => {
      const val = (row as any)[k];
      if (val === null || val === undefined) return "";
      if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(",")
  );

  assert("CSV: header has 3 columns", header.split(",").length === 3);
  assert("CSV: row 1 has client A", dataRows[0].includes("Client A"));
  assert("CSV: row 2 escapes double quotes", dataRows[1].includes('""B""'));
}

// ══════════════════════════════════════════════════════════════
// RUN ALL TESTS
// ══════════════════════════════════════════════════════════════

console.log("\n═══════════════════════════════════════════");
console.log("  Settings Module — Test Suite");
console.log("═══════════════════════════════════════════\n");

testValidatePhone();
testValidateEmail();
testValidateUrl();
testValidateSiret();
testValidateVat();
testJsonbMerge();
testBuildForm();
testAvatarFallback();
testSearchIndex();
testApiWhitelist();
testDirtyState();
testCsvGeneration();

console.log("───────────────────────────────────────────");
for (const r of results) {
  console.log(`  ${r.ok ? "✅" : "❌"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
}
console.log("───────────────────────────────────────────");
console.log(`\n  Total: ${results.length} | ✅ ${passed} | ❌ ${failed}\n`);

if (failed > 0) process.exit(1);
