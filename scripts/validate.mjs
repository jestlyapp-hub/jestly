#!/usr/bin/env node

/**
 * Jestly — Automated Validation Script
 * Checks code consistency against DB constraints after each modification.
 *
 * Usage:
 *   npm run validate          — run all checks
 *   node scripts/validate.mjs — same
 *
 * Checks performed:
 *   1. Status slugs in code match the orders CHECK constraint
 *   2. Kanban config defaults use valid slugs
 *   3. Fallback statuses in components use valid slugs
 *   4. Field types match order_fields CHECK constraint
 *   5. No writes to non-existent columns (status_id sent to API)
 *   6. TypeScript OrderStatus type matches DB constraint
 *   7. Next.js build type-check (optional, with --build flag)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

/* ─── Config: source of truth from DB ─── */

const VALID_ORDER_STATUSES = [
  "new",
  "brief_received",
  "in_progress",
  "in_review",
  "validated",
  "delivered",
  "invoiced",
  "paid",
  "cancelled",
  "refunded",
  "dispute",
];

const VALID_STATUS_VIEWS = ["production", "cash"];

const VALID_FIELD_TYPES = [
  "text",
  "number",
  "select",
  "multi_select",
  "date",
  "url",
  "money",
  "boolean",
];

// Columns that DO exist on the orders table (from migrations)
const ORDERS_COLUMNS = [
  "id", "user_id", "client_id", "product_id", "title", "description",
  "amount", "status", "status_id", "priority", "deadline", "custom_fields",
  "created_at", "updated_at",
];

/* ─── Helpers ─── */

let errors = [];
let warnings = [];
let passed = 0;

function ok(msg) {
  passed++;
  console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
}

function fail(msg, file, line) {
  const loc = line ? `${file}:${line}` : file;
  const full = `${msg} (${loc})`;
  errors.push(full);
  console.log(`  \x1b[31m✗\x1b[0m ${full}`);
}

function warn(msg, file, line) {
  const loc = line ? `${file}:${line}` : file;
  const full = `${msg} (${loc})`;
  warnings.push(full);
  console.log(`  \x1b[33m⚠\x1b[0m ${full}`);
}

function readFile(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf-8");
}

function findFiles(dir, ext, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      findFiles(full, ext, results);
    } else if (ext.some((e) => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

function relPath(abs) {
  return path.relative(ROOT, abs).replace(/\\/g, "/");
}

/* ─── Check 1: Kanban config default statuses use valid slugs ─── */

function checkKanbanConfig() {
  console.log("\n\x1b[1m[1] Kanban config — default status slugs\x1b[0m");

  const content = readFile("src/lib/kanban-config.ts");
  if (!content) { fail("File not found", "src/lib/kanban-config.ts"); return; }

  const lines = content.split("\n");
  const slugRegex = /slug:\s*["']([^"']+)["']/g;

  let found = 0;
  for (let i = 0; i < lines.length; i++) {
    let match;
    while ((match = slugRegex.exec(lines[i])) !== null) {
      found++;
      const slug = match[1];
      if (!VALID_ORDER_STATUSES.includes(slug)) {
        fail(`Invalid status slug "${slug}" — not in CHECK constraint`, "src/lib/kanban-config.ts", i + 1);
      }
    }
  }

  if (found > 0 && errors.length === 0) ok(`All ${found} default slugs are valid`);

  // Check views
  const viewRegex = /view:\s*["']([^"']+)["']/g;
  for (let i = 0; i < lines.length; i++) {
    let match;
    while ((match = viewRegex.exec(lines[i])) !== null) {
      const view = match[1];
      if (!VALID_STATUS_VIEWS.includes(view)) {
        fail(`Invalid view "${view}" — must be "production" or "cash"`, "src/lib/kanban-config.ts", i + 1);
      }
    }
  }
}

/* ─── Check 2: Fallback statuses in components ─── */

function checkFallbackStatuses() {
  console.log("\n\x1b[1m[2] Component fallback statuses\x1b[0m");

  const files = [
    "src/components/commandes/CreateOrderDrawer.tsx",
  ];

  for (const f of files) {
    const content = readFile(f);
    if (!content) { warn(`File not found (skipped)`, f); continue; }

    const lines = content.split("\n");
    const slugRegex = /slug:\s*["']([^"']+)["']/g;
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
      let match;
      while ((match = slugRegex.exec(lines[i])) !== null) {
        count++;
        const slug = match[1];
        if (!VALID_ORDER_STATUSES.includes(slug)) {
          fail(`Invalid fallback slug "${slug}"`, f, i + 1);
        }
      }
    }

    if (count > 0) ok(`${f} — ${count} slugs valid`);
  }
}

/* ─── Check 3: TypeScript OrderStatus type matches DB ─── */

function checkTypeScriptTypes() {
  console.log("\n\x1b[1m[3] TypeScript OrderStatus type sync\x1b[0m");

  const content = readFile("src/types/index.ts");
  if (!content) { fail("File not found", "src/types/index.ts"); return; }

  // Extract OrderStatus type values
  const typeMatch = content.match(/type\s+OrderStatus\s*=\s*([\s\S]*?);/);
  if (!typeMatch) { warn("OrderStatus type not found (skipped)", "src/types/index.ts"); return; }

  const typeStr = typeMatch[1];
  const tsStatuses = [...typeStr.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

  // Check both directions
  for (const s of tsStatuses) {
    if (!VALID_ORDER_STATUSES.includes(s)) {
      fail(`TypeScript has "${s}" but it's not in DB CHECK constraint`, "src/types/index.ts");
    }
  }

  for (const s of VALID_ORDER_STATUSES) {
    if (!tsStatuses.includes(s)) {
      warn(`DB allows "${s}" but TypeScript OrderStatus doesn't include it`, "src/types/index.ts");
    }
  }

  if (tsStatuses.length > 0) ok(`OrderStatus has ${tsStatuses.length} values, all valid`);
}

/* ─── Check 4: Field types in kanban-config ─── */

function checkFieldTypes() {
  console.log("\n\x1b[1m[4] Field types match DB constraint\x1b[0m");

  const content = readFile("src/lib/kanban-config.ts");
  if (!content) return;

  const lines = content.split("\n");
  const ftRegex = /field_type:\s*["']([^"']+)["']/g;

  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    let match;
    while ((match = ftRegex.exec(lines[i])) !== null) {
      count++;
      const ft = match[1];
      if (!VALID_FIELD_TYPES.includes(ft)) {
        fail(`Invalid field_type "${ft}"`, "src/lib/kanban-config.ts", i + 1);
      }
    }
  }

  if (count > 0) ok(`All ${count} field types are valid`);
}

/* ─── Check 5: API routes — hardcoded status values ─── */

function checkApiStatusValues() {
  console.log("\n\x1b[1m[5] API routes — hardcoded status values\x1b[0m");

  const apiDir = path.join(ROOT, "src/app/api");
  const files = findFiles(apiDir, [".ts", ".tsx"]);

  let totalChecked = 0;

  for (const f of files) {
    const content = fs.readFileSync(f, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Look for status: "something" or status === "something" patterns
      const statusAssignments = [
        ...line.matchAll(/status:\s*["']([^"']+)["']/g),
        ...line.matchAll(/status\s*===?\s*["']([^"']+)["']/g),
        ...line.matchAll(/["']([^"']+)["']\s*===?\s*status/g),
      ];

      for (const match of statusAssignments) {
        const val = match[1];
        // Skip if it's clearly a variable reference or part of other code
        if (val.includes("$") || val.includes("{") || val.length > 30) continue;
        totalChecked++;
        if (!VALID_ORDER_STATUSES.includes(val)) {
          // Could be a non-order status, only flag if in orders context
          const rel = relPath(f);
          if (rel.includes("order")) {
            fail(`Hardcoded status "${val}" not in CHECK constraint`, rel, i + 1);
          }
        }
      }
    }
  }

  ok(`Scanned ${files.length} API files, ${totalChecked} status references checked`);
}

/* ─── Check 6: No status_id writes in POST/PATCH bodies ─── */

function checkNoStatusIdWrites() {
  console.log("\n\x1b[1m[6] No status_id in API insert/update bodies\x1b[0m");

  const orderFiles = [
    "src/app/api/orders/route.ts",
    "src/app/api/orders/[id]/route.ts",
  ];

  for (const f of orderFiles) {
    const content = readFile(f);
    if (!content) { warn(`File not found (skipped)`, f); continue; }

    const lines = content.split("\n");
    let hasIssue = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Check if status_id is being written to DB (in insert/update objects)
      if (/status_id\s*[:=]/.test(line) && !/\/\//.test(line.split("status_id")[0])) {
        // Make sure it's not just destructuring from request body
        // Only flag if it's being set in an insert/update object
        if (line.includes("insert") || line.includes("update") ||
            (i > 0 && /\b(insert|update)\b/i.test(lines.slice(Math.max(0, i - 5), i).join("")))) {
          warn(`status_id write detected — make sure column exists`, f, i + 1);
          hasIssue = true;
        }
      }
    }

    if (!hasIssue) ok(`${f} — no problematic status_id writes`);
  }
}

/* ─── Check 7: Component status submissions ─── */

function checkComponentStatusUsage() {
  console.log("\n\x1b[1m[7] Component status submissions\x1b[0m");

  const compDir = path.join(ROOT, "src/components/commandes");
  if (!fs.existsSync(compDir)) { warn("commandes components dir not found"); return; }

  const files = findFiles(compDir, [".tsx", ".ts"]);

  for (const f of files) {
    const content = fs.readFileSync(f, "utf-8");
    const lines = content.split("\n");
    const rel = relPath(f);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for status: "literal" in fetch bodies
      const statusLiterals = [...line.matchAll(/status:\s*["']([^"']+)["']/g)];
      for (const match of statusLiterals) {
        const val = match[1];
        if (!VALID_ORDER_STATUSES.includes(val) && val !== "Choisir") {
          fail(`Hardcoded status "${val}" not in CHECK constraint`, rel, i + 1);
        }
      }
    }

    ok(`${rel} — checked`);
  }
}

/* ─── Check 8: Build type-check (optional) ─── */

function checkBuild() {
  console.log("\n\x1b[1m[8] Next.js build check\x1b[0m");

  try {
    execSync("npx next build", { cwd: ROOT, stdio: "pipe", timeout: 120000 });
    ok("Build succeeded");
  } catch (e) {
    const output = (e.stderr || e.stdout || "").toString().slice(-500);
    fail(`Build failed:\n${output}`, "next build");
  }
}

/* ─── Main ─── */

console.log("\x1b[1m\x1b[35m━━━ Jestly Validation ━━━\x1b[0m");
console.log(`Checking code consistency against DB constraints...\n`);

const startErrors = errors.length;

checkKanbanConfig();
checkFallbackStatuses();
checkTypeScriptTypes();
checkFieldTypes();
checkApiStatusValues();
checkNoStatusIdWrites();
checkComponentStatusUsage();

const doBuild = process.argv.includes("--build");
if (doBuild) {
  checkBuild();
} else {
  console.log("\n\x1b[2m  Tip: run with --build to also verify Next.js build\x1b[0m");
}

/* ─── Summary ─── */

console.log("\n\x1b[1m━━━ Summary ━━━\x1b[0m");
console.log(`  \x1b[32m${passed} passed\x1b[0m`);
if (warnings.length) console.log(`  \x1b[33m${warnings.length} warnings\x1b[0m`);
if (errors.length) console.log(`  \x1b[31m${errors.length} errors\x1b[0m`);

if (errors.length > 0) {
  console.log("\n\x1b[31mValidation FAILED\x1b[0m — fix errors above before pushing.\n");
  process.exit(1);
} else {
  console.log("\n\x1b[32mAll checks passed!\x1b[0m\n");
  process.exit(0);
}
