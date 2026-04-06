/**
 * Jestly — Audit complet d'intégrité de la base de données
 * READ-ONLY — Aucune modification de données
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("ERREUR: Variables Supabase manquantes dans .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Helper: run raw SQL via rpc (uses service_role, bypasses RLS)
async function sql(query) {
  // Use the Supabase REST API to run raw SQL via the pg_net or rpc approach
  // Since we have service_role, we query tables directly
  const { data, error } = await supabase.rpc("", {}).catch(() => ({}));
  // Fallback: use direct table queries
  return null;
}

// Helper to query and handle errors
async function query(table, select = "*", options = {}) {
  let q = supabase.from(table).select(select, { count: "exact", ...options });
  if (options.filters) {
    for (const [method, ...args] of options.filters) {
      q = q[method](...args);
    }
  }
  if (options.limit) q = q.limit(options.limit);
  const { data, error, count } = await q;
  if (error) return { data: null, error: error.message, count: 0 };
  return { data, error: null, count };
}

// Count helper
async function countTable(table) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) return { count: -1, error: error.message };
  return { count, error: null };
}

// Global reference sets (populated during orphan check, reused in data consistency)
let profileSet, clientSet, orderSet, productSet, siteSet, pageSet;

const SEPARATOR = "═".repeat(70);
const SUBSEP = "─".repeat(50);

function header(title) {
  console.log(`\n${SEPARATOR}`);
  console.log(`  ${title}`);
  console.log(SEPARATOR);
}

function sub(title) {
  console.log(`\n  ${SUBSEP}`);
  console.log(`  ${title}`);
  console.log(`  ${SUBSEP}`);
}

function ok(msg) {
  console.log(`  [OK] ${msg}`);
}

function warn(msg) {
  console.log(`  [!!] ${msg}`);
}

function info(msg) {
  console.log(`  [--] ${msg}`);
}

// ══════════════════════════════════════════════════════════════════
// 1. TABLE STATISTICS
// ══════════════════════════════════════════════════════════════════
async function auditTableStats() {
  header("1. STATISTIQUES DES TABLES");

  const tables = [
    "profiles",
    "orders",
    "clients",
    "tasks",
    "products",
    "sites",
    "site_pages",
    "site_blocks",
    "calendar_events",
    "invoices",
    "notifications",
    "search_documents",
    "leads",
    "projects",
    "billing_items",
    "order_items",
    "order_submissions",
    "analytics_events",
    "briefs",
    "site_assets",
    "site_product_links",
    "site_published_snapshots",
    "support_tickets",
    "task_templates",
    "waitlist",
  ];

  const results = {};
  for (const t of tables) {
    const { count, error } = await countTable(t);
    if (error) {
      info(`${t.padEnd(30)} ERREUR: ${error}`);
    } else {
      results[t] = count;
      console.log(`  ${t.padEnd(30)} ${String(count).padStart(6)} lignes`);
    }
  }

  // Distribution par utilisateur (top tables)
  sub("Distribution par utilisateur (tables principales)");

  for (const t of ["orders", "clients", "tasks", "products", "calendar_events", "invoices", "sites"]) {
    const userCol = t === "sites" ? "owner_id" : t === "products" ? "owner_id" : "user_id";
    const { data, error } = await supabase
      .from(t)
      .select(userCol);

    if (error) {
      info(`${t}: erreur — ${error.message}`);
      continue;
    }
    if (!data || data.length === 0) {
      info(`${t}: aucune donnée`);
      continue;
    }

    const counts = {};
    for (const row of data) {
      const uid = row[userCol];
      counts[uid] = (counts[uid] || 0) + 1;
    }

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    console.log(`  ${t}:`);
    for (const [uid, c] of entries) {
      console.log(`    ${uid}: ${c} lignes`);
    }
  }

  return results;
}

// ══════════════════════════════════════════════════════════════════
// 2. ORPHAN RECORDS CHECK
// ══════════════════════════════════════════════════════════════════
async function auditOrphans() {
  header("2. VÉRIFICATION DES ORPHELINS");

  // Populate global reference sets
  const { data: profileIds } = await supabase.from("profiles").select("id");
  profileSet = new Set((profileIds || []).map((p) => p.id));

  const { data: clientIds } = await supabase.from("clients").select("id");
  clientSet = new Set((clientIds || []).map((c) => c.id));

  const { data: orderIds } = await supabase.from("orders").select("id");
  orderSet = new Set((orderIds || []).map((o) => o.id));

  const { data: productIds } = await supabase.from("products").select("id");
  productSet = new Set((productIds || []).map((p) => p.id));

  const { data: siteIds } = await supabase.from("sites").select("id");
  siteSet = new Set((siteIds || []).map((s) => s.id));

  const { data: pageIds } = await supabase.from("site_pages").select("id");
  pageSet = new Set((pageIds || []).map((p) => p.id));

  // 2a. Orders with non-existent client_id
  sub("2a. Commandes avec client_id inexistant");
  {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, client_id, title, status");
    const orphans = (orders || []).filter((o) => o.client_id && !clientSet.has(o.client_id));
    if (orphans.length === 0) {
      ok("Aucune commande orpheline (client_id valide)");
    } else {
      warn(`${orphans.length} commande(s) avec client_id inexistant:`);
      for (const o of orphans) {
        console.log(`    - order ${o.id} (titre: "${o.title}", statut: ${o.status}) → client_id: ${o.client_id}`);
      }
    }
  }

  // 2b. Orders with non-existent product_id
  sub("2b. Commandes avec product_id inexistant");
  {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, product_id, title");
    const orphans = (orders || []).filter((o) => o.product_id && !productSet.has(o.product_id));
    if (orphans.length === 0) {
      ok("Aucune commande orpheline (product_id valide ou null)");
    } else {
      warn(`${orphans.length} commande(s) avec product_id inexistant:`);
      for (const o of orphans) {
        console.log(`    - order ${o.id} (titre: "${o.title}") → product_id: ${o.product_id}`);
      }
    }
  }

  // 2c. Tasks with non-existent order_id
  sub("2c. Tâches avec order_id inexistant");
  {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, order_id, title");
    const orphans = (tasks || []).filter((t) => t.order_id && !orderSet.has(t.order_id));
    if (orphans.length === 0) {
      ok("Aucune tâche orpheline (order_id valide ou null)");
    } else {
      warn(`${orphans.length} tâche(s) avec order_id inexistant:`);
      for (const t of orphans) {
        console.log(`    - task ${t.id} (titre: "${t.title}") → order_id: ${t.order_id}`);
      }
    }
  }

  // 2d. Tasks with non-existent client_id
  sub("2d. Tâches avec client_id inexistant");
  {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, client_id, title");
    const orphans = (tasks || []).filter((t) => t.client_id && !clientSet.has(t.client_id));
    if (orphans.length === 0) {
      ok("Aucune tâche orpheline (client_id valide ou null)");
    } else {
      warn(`${orphans.length} tâche(s) avec client_id inexistant:`);
      for (const t of orphans) {
        console.log(`    - task ${t.id} (titre: "${t.title}") → client_id: ${t.client_id}`);
      }
    }
  }

  // 2e. Order items with non-existent order_id
  sub("2e. Order items avec order_id inexistant");
  {
    const { data: items } = await supabase
      .from("order_items")
      .select("id, order_id, label");
    const orphans = (items || []).filter((i) => !orderSet.has(i.order_id));
    if (!items || items.length === 0) {
      info("Table order_items vide");
    } else if (orphans.length === 0) {
      ok("Aucun order_item orphelin");
    } else {
      warn(`${orphans.length} order_item(s) avec order_id inexistant:`);
      for (const i of orphans) {
        console.log(`    - item ${i.id} (label: "${i.label}") → order_id: ${i.order_id}`);
      }
    }
  }

  // 2f. Order items with non-existent product_id
  sub("2f. Order items avec product_id inexistant");
  {
    const { data: items } = await supabase
      .from("order_items")
      .select("id, product_id, label");
    const orphans = (items || []).filter((i) => i.product_id && !productSet.has(i.product_id));
    if (!items || items.length === 0) {
      info("Table order_items vide");
    } else if (orphans.length === 0) {
      ok("Aucun order_item orphelin (product_id valide ou null)");
    } else {
      warn(`${orphans.length} order_item(s) avec product_id inexistant:`);
      for (const i of orphans) {
        console.log(`    - item ${i.id} (label: "${i.label}") → product_id: ${i.product_id}`);
      }
    }
  }

  // 2g. Entities with user_id not in profiles
  sub("2g. Entités avec user_id absent de profiles");
  const userIdTables = [
    { table: "orders", col: "user_id" },
    { table: "clients", col: "user_id" },
    { table: "tasks", col: "user_id" },
    { table: "invoices", col: "user_id" },
    { table: "calendar_events", col: "user_id" },
    { table: "notifications", col: "user_id" },
    { table: "billing_items", col: "user_id" },
    { table: "products", col: "owner_id" },
    { table: "sites", col: "owner_id" },
  ];

  for (const { table, col } of userIdTables) {
    const { data, error } = await supabase.from(table).select(`id, ${col}`);
    if (error) {
      info(`${table}: erreur — ${error.message}`);
      continue;
    }
    const orphans = (data || []).filter((r) => r[col] && !profileSet.has(r[col]));
    if (orphans.length === 0) {
      ok(`${table}.${col}: tous valides`);
    } else {
      warn(`${table}: ${orphans.length} ligne(s) avec ${col} absent de profiles:`);
      for (const r of orphans.slice(0, 10)) {
        console.log(`    - ${r.id} → ${col}: ${r[col]}`);
      }
      if (orphans.length > 10) console.log(`    ... et ${orphans.length - 10} de plus`);
    }
  }

  // 2h. Site blocks/pages referencing non-existent sites
  sub("2h. Pages de site sans site parent");
  {
    const { data: pages } = await supabase
      .from("site_pages")
      .select("id, site_id, title, slug");
    const orphans = (pages || []).filter((p) => !siteSet.has(p.site_id));
    if (orphans.length === 0) {
      ok("Toutes les pages référencent un site valide");
    } else {
      warn(`${orphans.length} page(s) sans site parent:`);
      for (const p of orphans) {
        console.log(`    - page ${p.id} (titre: "${p.title}") → site_id: ${p.site_id}`);
      }
    }
  }

  sub("2i. Blocs de site sans page parent");
  {
    const { data: blocks } = await supabase
      .from("site_blocks")
      .select("id, page_id, type");
    const orphans = (blocks || []).filter((b) => !pageSet.has(b.page_id));
    if (!blocks || blocks.length === 0) {
      info("Table site_blocks vide");
    } else if (orphans.length === 0) {
      ok("Tous les blocs référencent une page valide");
    } else {
      warn(`${orphans.length} bloc(s) sans page parent:`);
      for (const b of orphans.slice(0, 10)) {
        console.log(`    - block ${b.id} (type: "${b.type}") → page_id: ${b.page_id}`);
      }
    }
  }

  // 2j. Invoices with non-existent client_id or order_id
  sub("2j. Factures avec client_id ou order_id inexistant");
  {
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id, client_id, order_id, invoice_number");
    if (!invoices || invoices.length === 0) {
      info("Table invoices vide");
    } else {
      const clientOrphans = invoices.filter((i) => i.client_id && !clientSet.has(i.client_id));
      const orderOrphans = invoices.filter((i) => i.order_id && !orderSet.has(i.order_id));
      if (clientOrphans.length === 0) ok("Factures: tous les client_id valides");
      else {
        warn(`${clientOrphans.length} facture(s) avec client_id inexistant:`);
        for (const i of clientOrphans) console.log(`    - ${i.invoice_number} → client_id: ${i.client_id}`);
      }
      if (orderOrphans.length === 0) ok("Factures: tous les order_id valides");
      else {
        warn(`${orderOrphans.length} facture(s) avec order_id inexistant:`);
        for (const i of orderOrphans) console.log(`    - ${i.invoice_number} → order_id: ${i.order_id}`);
      }
    }
  }

  // 2k. Calendar events with non-existent client_id or order_id
  sub("2k. Événements calendrier avec client_id ou order_id inexistant");
  {
    const { data: events } = await supabase
      .from("calendar_events")
      .select("id, client_id, order_id, title");
    if (!events || events.length === 0) {
      info("Table calendar_events vide");
    } else {
      const clientOrphans = events.filter((e) => e.client_id && !clientSet.has(e.client_id));
      const orderOrphans = events.filter((e) => e.order_id && !orderSet.has(e.order_id));
      if (clientOrphans.length === 0) ok("Événements: tous les client_id valides");
      else {
        warn(`${clientOrphans.length} événement(s) avec client_id inexistant:`);
        for (const e of clientOrphans) console.log(`    - "${e.title}" (${e.id}) → client_id: ${e.client_id}`);
      }
      if (orderOrphans.length === 0) ok("Événements: tous les order_id valides");
      else {
        warn(`${orderOrphans.length} événement(s) avec order_id inexistant:`);
        for (const e of orderOrphans) console.log(`    - "${e.title}" (${e.id}) → order_id: ${e.order_id}`);
      }
    }
  }

  // 2l. Projects with non-existent references
  sub("2l. Projets avec références invalides");
  {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, user_id, client_id, product_id, order_id, name");
    if (!projects || projects.length === 0) {
      info("Table projects vide");
    } else {
      // projects.user_id references auth.users directly, not profiles
      // but profiles.id = auth.users.id so we can still check
      const userOrphans = projects.filter((p) => p.user_id && !profileSet.has(p.user_id));
      const clientOrphans = projects.filter((p) => p.client_id && !clientSet.has(p.client_id));
      const productOrphans = projects.filter((p) => p.product_id && !productSet.has(p.product_id));
      const orderOrphans = projects.filter((p) => p.order_id && !orderSet.has(p.order_id));

      if (userOrphans.length === 0) ok("Projets: tous les user_id valides");
      else warn(`${userOrphans.length} projet(s) avec user_id invalide`);
      if (clientOrphans.length === 0) ok("Projets: tous les client_id valides");
      else warn(`${clientOrphans.length} projet(s) avec client_id invalide`);
      if (productOrphans.length === 0) ok("Projets: tous les product_id valides");
      else warn(`${productOrphans.length} projet(s) avec product_id invalide`);
      if (orderOrphans.length === 0) ok("Projets: tous les order_id valides");
      else warn(`${orderOrphans.length} projet(s) avec order_id invalide`);
    }
  }
}

// ══════════════════════════════════════════════════════════════════
// 3. DATA CONSISTENCY CHECKS
// ══════════════════════════════════════════════════════════════════
async function auditDataConsistency() {
  header("3. COHÉRENCE DES DONNÉES");

  // 3a. Orders with amount = 0 or null
  sub("3a. Commandes avec montant = 0 ou null");
  {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, title, amount, status, client_id, created_at");
    const zeroOrNull = (orders || []).filter(
      (o) => o.amount === null || o.amount === 0
    );
    if (zeroOrNull.length === 0) {
      ok("Aucune commande avec montant nul ou zéro");
    } else {
      warn(`${zeroOrNull.length} commande(s) avec montant = 0 ou null:`);
      for (const o of zeroOrNull) {
        console.log(
          `    - ${o.id} (titre: "${o.title}", statut: ${o.status}, montant: ${o.amount}, créé: ${o.created_at})`
        );
      }
    }
  }

  // 3b. Orders with unexpected status
  sub("3b. Commandes avec statut invalide");
  {
    const validStatuses = new Set([
      "new", "in_progress", "delivered", "paid",
      "brief_received", "in_review", "validated", "invoiced",
      "cancelled", "refunded", "dispute",
    ]);
    const { data: orders } = await supabase
      .from("orders")
      .select("id, title, status");
    const invalid = (orders || []).filter((o) => !validStatuses.has(o.status));
    if (invalid.length === 0) {
      ok("Tous les statuts de commandes sont valides");
    } else {
      warn(`${invalid.length} commande(s) avec statut invalide:`);
      for (const o of invalid) {
        console.log(`    - ${o.id} (titre: "${o.title}") → statut: "${o.status}"`);
      }
    }

    // Status distribution
    const statusCounts = {};
    for (const o of orders || []) {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    }
    info("Distribution des statuts de commandes:");
    for (const [s, c] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${s}: ${c}`);
    }
  }

  // 3c. Tasks with invalid status
  sub("3c. Tâches avec statut invalide");
  {
    const validStatuses = new Set(["todo", "in_progress", "done", "completed"]);
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, status");
    const invalid = (tasks || []).filter((t) => !validStatuses.has(t.status));
    if (invalid.length === 0) {
      ok("Tous les statuts de tâches sont valides");
    } else {
      warn(`${invalid.length} tâche(s) avec statut invalide:`);
      for (const t of invalid) {
        console.log(`    - ${t.id} (titre: "${t.title}") → statut: "${t.status}"`);
      }
    }

    const statusCounts = {};
    for (const t of tasks || []) {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    }
    info("Distribution des statuts de tâches:");
    for (const [s, c] of Object.entries(statusCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${s}: ${c}`);
    }
  }

  // 3d. Products with price_cents = 0 or negative
  sub("3d. Produits avec price_cents = 0 ou négatif");
  {
    const { data: products } = await supabase
      .from("products")
      .select("id, name, price_cents, status, type");
    const invalid = (products || []).filter(
      (p) => p.price_cents === null || p.price_cents <= 0
    );
    if (invalid.length === 0) {
      ok("Tous les produits ont un prix > 0");
    } else {
      warn(`${invalid.length} produit(s) avec prix <= 0:`);
      for (const p of invalid) {
        console.log(
          `    - ${p.id} (nom: "${p.name}", type: ${p.type}, statut: ${p.status}) → price_cents: ${p.price_cents}`
        );
      }
    }
  }

  // 3e. Clients with no email AND no name
  sub("3e. Clients sans email ET sans nom");
  {
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, email, user_id, created_at");
    const invalid = (clients || []).filter(
      (c) =>
        (!c.email || c.email.trim() === "") &&
        (!c.name || c.name.trim() === "")
    );
    if (invalid.length === 0) {
      ok("Tous les clients ont au moins un nom ou un email");
    } else {
      warn(`${invalid.length} client(s) sans nom ET sans email:`);
      for (const c of invalid) {
        console.log(`    - ${c.id} (user: ${c.user_id}, créé: ${c.created_at})`);
      }
    }

    // Also check for empty/blank names
    const blankNames = (clients || []).filter(
      (c) => !c.name || c.name.trim() === ""
    );
    if (blankNames.length > 0) {
      warn(`${blankNames.length} client(s) avec nom vide/blank:`);
      for (const c of blankNames.slice(0, 5)) {
        console.log(`    - ${c.id} (email: ${c.email})`);
      }
    }

    // Check for empty emails
    const blankEmails = (clients || []).filter(
      (c) => !c.email || c.email.trim() === ""
    );
    if (blankEmails.length > 0) {
      info(`${blankEmails.length} client(s) avec email vide (autorisé par migration 051):`);
      for (const c of blankEmails.slice(0, 5)) {
        console.log(`    - ${c.id} (nom: "${c.name}")`);
      }
    }

    // Duplicate emails within same user
    sub("3e-bis. Clients avec email dupliqué (même utilisateur)");
    const emailMap = {};
    for (const c of clients || []) {
      if (!c.email || c.email.trim() === "") continue;
      const key = `${c.user_id}::${c.email.toLowerCase().trim()}`;
      if (!emailMap[key]) emailMap[key] = [];
      emailMap[key].push(c);
    }
    const dupes = Object.entries(emailMap).filter(([, v]) => v.length > 1);
    if (dupes.length === 0) {
      ok("Aucun doublon d'email client par utilisateur");
    } else {
      warn(`${dupes.length} groupe(s) de doublons d'email client:`);
      for (const [key, clients] of dupes) {
        console.log(`    Email: ${key.split("::")[1]} (user: ${key.split("::")[0]})`);
        for (const c of clients) {
          console.log(`      - id: ${c.id}, nom: "${c.name}", créé: ${c.created_at}`);
        }
      }
    }
  }

  // 3f. Calendar events with end_time before start_time
  sub("3f. Événements calendrier avec end_time < start_time");
  {
    const { data: events } = await supabase
      .from("calendar_events")
      .select("id, title, date, start_time, end_time, all_day");
    const invalid = (events || []).filter((e) => {
      if (!e.start_time || !e.end_time) return false;
      return e.end_time < e.start_time;
    });
    if (!events || events.length === 0) {
      info("Table calendar_events vide");
    } else if (invalid.length === 0) {
      ok("Aucun événement avec horaires incohérents");
    } else {
      warn(`${invalid.length} événement(s) avec end_time < start_time:`);
      for (const e of invalid) {
        console.log(
          `    - "${e.title}" (${e.id}) date: ${e.date}, ${e.start_time} → ${e.end_time}`
        );
      }
    }
  }

  // 3g. Duplicate calendar events (same title + user + date)
  sub("3g. Événements calendrier dupliqués (même titre + user + date)");
  {
    const { data: events } = await supabase
      .from("calendar_events")
      .select("id, user_id, title, date, start_time");
    const eventMap = {};
    for (const e of events || []) {
      const key = `${e.user_id}::${e.title}::${e.date}`;
      if (!eventMap[key]) eventMap[key] = [];
      eventMap[key].push(e);
    }
    const dupes = Object.entries(eventMap).filter(([, v]) => v.length > 1);
    if (dupes.length === 0) {
      ok("Aucun événement dupliqué");
    } else {
      warn(`${dupes.length} groupe(s) d'événements dupliqués:`);
      for (const [key, evts] of dupes) {
        const [, title, date] = key.split("::");
        console.log(`    "${title}" le ${date} (${evts.length}x):`);
        for (const e of evts) {
          console.log(`      - id: ${e.id}, heure: ${e.start_time || "all_day"}`);
        }
      }
    }
  }

  // 3h. Orders with paid=true but status != 'paid'
  sub("3h. Incohérence paid/status sur les commandes");
  {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, title, status, paid, amount");
    const paidButNotStatus = (orders || []).filter(
      (o) => o.paid === true && o.status !== "paid"
    );
    const statusPaidButNotFlag = (orders || []).filter(
      (o) => o.status === "paid" && o.paid !== true
    );
    if (paidButNotStatus.length === 0) {
      ok("Aucune commande avec paid=true et status != 'paid'");
    } else {
      warn(`${paidButNotStatus.length} commande(s) avec paid=true mais status != 'paid':`);
      for (const o of paidButNotStatus) {
        console.log(`    - ${o.id} (titre: "${o.title}", status: ${o.status}, paid: ${o.paid})`);
      }
    }
    if (statusPaidButNotFlag.length === 0) {
      ok("Aucune commande avec status='paid' et paid=false");
    } else {
      warn(`${statusPaidButNotFlag.length} commande(s) avec status='paid' mais paid=false:`);
      for (const o of statusPaidButNotFlag) {
        console.log(`    - ${o.id} (titre: "${o.title}", paid: ${o.paid})`);
      }
    }
  }

  // 3i. Invoices consistency
  sub("3i. Cohérence des factures (total vs amount + tax)");
  {
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id, invoice_number, amount, tax_amount, total, status");
    if (!invoices || invoices.length === 0) {
      info("Table invoices vide");
    } else {
      const mismatched = invoices.filter((i) => {
        const expected = Number(i.amount) + Number(i.tax_amount);
        return Math.abs(Number(i.total) - expected) > 0.01;
      });
      if (mismatched.length === 0) {
        ok("Tous les totaux de factures sont cohérents");
      } else {
        warn(`${mismatched.length} facture(s) avec total incohérent:`);
        for (const i of mismatched) {
          console.log(
            `    - ${i.invoice_number} (${i.id}): amount=${i.amount} + tax=${i.tax_amount} != total=${i.total}`
          );
        }
      }
    }
  }

  // 3j. Search documents freshness
  sub("3j. Index de recherche — documents orphelins");
  {
    const { data: docs } = await supabase
      .from("search_documents")
      .select("id, entity_type, entity_id, user_id");
    if (!docs || docs.length === 0) {
      info("Table search_documents vide");
    } else {
      // Check for entity types with a known source
      const entityChecks = {
        order: orderSet,
        client: clientSet,
        product: productSet,
      };

      for (const [type, validSet] of Object.entries(entityChecks)) {
        const matching = docs.filter((d) => d.entity_type === type);
        const orphans = matching.filter((d) => !validSet.has(d.entity_id));
        if (orphans.length === 0) {
          ok(`search_documents[${type}]: tous les entity_id valides (${matching.length} docs)`);
        } else {
          warn(`search_documents[${type}]: ${orphans.length}/${matching.length} orphelin(s):`);
          for (const d of orphans.slice(0, 5)) {
            console.log(`    - doc ${d.id} → entity_id: ${d.entity_id}`);
          }
        }
      }

      // Distribution by entity_type
      const typeCounts = {};
      for (const d of docs) {
        typeCounts[d.entity_type] = (typeCounts[d.entity_type] || 0) + 1;
      }
      info("Distribution des search_documents par entity_type:");
      for (const [t, c] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
        console.log(`    ${t}: ${c}`);
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════════
// 4. SITES DATA AUDIT
// ══════════════════════════════════════════════════════════════════
async function auditSites() {
  header("4. AUDIT DES SITES");

  const { data: sites } = await supabase
    .from("sites")
    .select("id, slug, name, status, owner_id, custom_domain, is_private, created_at, updated_at");

  if (!sites || sites.length === 0) {
    info("Aucun site trouvé");
    return;
  }

  info(`Total: ${sites.length} site(s)`);

  // Status distribution
  const statusCounts = {};
  for (const s of sites) {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  }
  info("Distribution par statut:");
  for (const [s, c] of Object.entries(statusCounts)) {
    console.log(`    ${s}: ${c}`);
  }

  // Private sites
  const privateSites = sites.filter((s) => s.is_private);
  info(`Sites privés: ${privateSites.length}`);

  // Custom domains
  const withDomain = sites.filter((s) => s.custom_domain);
  info(`Sites avec domaine personnalisé: ${withDomain.length}`);
  for (const s of withDomain) {
    console.log(`    - ${s.slug} → ${s.custom_domain}`);
  }

  // Detail per site: pages and blocks
  sub("Détail par site (pages et blocs)");
  for (const site of sites) {
    const { data: pages } = await supabase
      .from("site_pages")
      .select("id, title, slug, status, is_home")
      .eq("site_id", site.id);

    const pageCount = (pages || []).length;
    const publishedPages = (pages || []).filter((p) => p.status === "published").length;
    const draftPages = pageCount - publishedPages;
    const homePages = (pages || []).filter((p) => p.is_home);

    // Count blocks for all pages of this site
    let totalBlocks = 0;
    let emptyPages = [];
    for (const page of pages || []) {
      const { count } = await supabase
        .from("site_blocks")
        .select("*", { count: "exact", head: true })
        .eq("page_id", page.id);
      const blockCount = count || 0;
      totalBlocks += blockCount;
      if (blockCount === 0) {
        emptyPages.push(page);
      }
    }

    console.log(
      `  Site: "${site.name}" (${site.slug}) — statut: ${site.status}`
    );
    console.log(`    Pages: ${pageCount} (${publishedPages} publiées, ${draftPages} brouillons)`);
    console.log(`    Blocs total: ${totalBlocks}`);
    console.log(`    Pages d'accueil: ${homePages.length}`);

    // Warnings
    if (homePages.length === 0 && pageCount > 0) {
      warn(`  Aucune page d'accueil définie (is_home = true)`);
    }
    if (homePages.length > 1) {
      warn(`  Plusieurs pages d'accueil: ${homePages.map((p) => p.slug).join(", ")}`);
    }
    if (emptyPages.length > 0) {
      warn(`  ${emptyPages.length} page(s) sans aucun bloc:`);
      for (const p of emptyPages) {
        console.log(`      - "${p.title}" (${p.slug})`);
      }
    }
    if (site.status === "published" && totalBlocks === 0) {
      warn(`  Site publié mais AUCUN bloc de contenu!`);
    }
    if (pageCount === 0) {
      warn(`  Site sans aucune page!`);
    }
  }
}

// ══════════════════════════════════════════════════════════════════
// 5. FOREIGN KEY INTEGRITY (via schema inspection)
// ══════════════════════════════════════════════════════════════════
async function auditForeignKeys() {
  header("5. INTÉGRITÉ DES CLÉS ÉTRANGÈRES");

  info("Les FK avec ON DELETE CASCADE sont en place pour les tables principales:");
  info("  profiles → auth.users (CASCADE)");
  info("  clients.user_id → profiles (CASCADE)");
  info("  orders.user_id → profiles (CASCADE)");
  info("  orders.client_id → clients (pas de CASCADE — risque d'orphelins si client supprimé)");
  info("  orders.product_id → products (SET NULL)");
  info("  tasks.user_id → profiles (CASCADE)");
  info("  tasks.order_id → orders (pas spécifié → RESTRICT par défaut)");
  info("  tasks.client_id → clients (SET NULL)");
  info("  invoices.user_id → profiles (CASCADE)");
  info("  invoices.client_id → clients (pas spécifié → RESTRICT)");
  info("  invoices.order_id → orders (pas spécifié → RESTRICT)");
  info("  sites.owner_id → profiles (CASCADE)");
  info("  site_pages.site_id → sites (CASCADE)");
  info("  site_blocks.page_id → site_pages (CASCADE)");
  info("  calendar_events.client_id → clients (SET NULL)");
  info("  calendar_events.order_id → orders (SET NULL)");
  info("  notifications.user_id → profiles (CASCADE)");
  info("  order_items.order_id → orders (CASCADE)");
  info("  order_items.product_id → products (SET NULL)");

  sub("Problèmes potentiels de cascade");
  warn("orders.client_id: pas de ON DELETE CASCADE ni SET NULL — la suppression d'un client avec commandes échouera (RESTRICT)");
  warn("invoices.client_id: pas de ON DELETE CASCADE ni SET NULL — même problème");
  warn("invoices.order_id: pas de ON DELETE CASCADE ni SET NULL — même problème");
  warn("tasks.order_id: pas de ON DELETE CASCADE ni SET NULL — même problème (migration 001)");
  info("RECOMMANDATION: Ajouter ON DELETE SET NULL sur ces FK pour éviter les blocages de suppression");
}

// ══════════════════════════════════════════════════════════════════
// 6. MISSING INDEXES CHECK
// ══════════════════════════════════════════════════════════════════
async function auditIndexes(tableStats) {
  header("6. VÉRIFICATION DES INDEX");

  info("Index existants (d'après les migrations):");
  const knownIndexes = [
    "idx_clients_user_id (clients.user_id)",
    "idx_products_owner_id (products.owner_id)",
    "idx_orders_user_id (orders.user_id)",
    "idx_orders_client_id (orders.client_id)",
    "idx_orders_status (orders.status)",
    "idx_invoices_user_id (invoices.user_id)",
    "idx_invoices_client_id (invoices.client_id)",
    "idx_tasks_user_id (tasks.user_id)",
    "idx_tasks_order_id (tasks.order_id)",
    "idx_tasks_archived_at (tasks.archived_at)",
    "idx_tasks_client_id (tasks.client_id)",
    "idx_tasks_status (tasks.status)",
    "idx_tasks_due_date (tasks.due_date)",
    "idx_sites_slug (sites.slug)",
    "idx_sites_owner (sites.owner_id)",
    "idx_sites_custom_domain (sites.custom_domain)",
    "idx_pages_site (site_pages.site_id)",
    "idx_blocks_page_order (site_blocks.page_id, sort_order)",
    "idx_calendar_events_user_id (calendar_events.user_id)",
    "idx_calendar_events_date (calendar_events.user_id, date)",
    "idx_billing_items_user (billing_items.user_id)",
    "idx_billing_items_client (billing_items.client_id)",
    "idx_billing_items_status (billing_items.user_id, status)",
    "idx_notifications_user_unread (partial)",
    "idx_notifications_user_category (partial)",
    "idx_order_items_order (order_items.order_id)",
    "idx_profiles_subdomain (profiles.subdomain)",
    "idx_projects_user (projects.user_id)",
  ];
  for (const idx of knownIndexes) {
    console.log(`    ${idx}`);
  }

  sub("Index potentiellement manquants");

  // Check tables with data that might need indexes
  const suggestions = [];

  // order_submissions has no user_id index (queries via order_id join)
  suggestions.push({
    table: "order_submissions",
    suggestion: "Pas d'index direct sur user_id (jointure via order_id OK)",
    severity: "low",
  });

  // leads has no index on email (could be useful for dedup)
  suggestions.push({
    table: "leads",
    suggestion: "Pas d'index sur leads.email — utile si recherche/dédup de leads par email",
    severity: "medium",
  });

  // analytics_events — idx_analytics_site_time exists, but no index on visitor_id
  suggestions.push({
    table: "analytics_events",
    suggestion: "Pas d'index sur analytics_events.visitor_id — utile pour analyse par visiteur",
    severity: "low",
  });

  // invoices — no index on status or due_date
  suggestions.push({
    table: "invoices",
    suggestion: "Pas d'index sur invoices.status ou invoices.due_date — utile pour filtrage",
    severity: "medium",
  });

  // orders — no index on deadline
  suggestions.push({
    table: "orders",
    suggestion: "Pas d'index sur orders.deadline — utile pour tri par échéance",
    severity: "low",
  });

  // notifications — entity_id for lookups
  suggestions.push({
    table: "notifications",
    suggestion: "Pas d'index sur notifications.entity_id — utile pour lookup par entité",
    severity: "low",
  });

  for (const s of suggestions) {
    const icon = s.severity === "medium" ? "[!!]" : "[--]";
    console.log(`  ${icon} ${s.table}: ${s.suggestion}`);
  }
}

// ══════════════════════════════════════════════════════════════════
// 7. ADDITIONAL INTEGRITY CHECKS
// ══════════════════════════════════════════════════════════════════
async function auditAdditional() {
  header("7. VÉRIFICATIONS SUPPLÉMENTAIRES");

  // 7a. Profiles without subdomain
  sub("7a. Profils sans sous-domaine");
  {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, subdomain, full_name");
    const noSubdomain = (profiles || []).filter(
      (p) => !p.subdomain || p.subdomain.trim() === ""
    );
    if (noSubdomain.length === 0) {
      ok("Tous les profils ont un sous-domaine");
    } else {
      warn(`${noSubdomain.length} profil(s) sans sous-domaine:`);
      for (const p of noSubdomain) {
        console.log(`    - ${p.id} (email: ${p.email})`);
      }
    }

    // Duplicate subdomains
    const subdomainMap = {};
    for (const p of profiles || []) {
      if (!p.subdomain) continue;
      const key = p.subdomain.toLowerCase();
      if (!subdomainMap[key]) subdomainMap[key] = [];
      subdomainMap[key].push(p);
    }
    const dupes = Object.entries(subdomainMap).filter(([, v]) => v.length > 1);
    if (dupes.length === 0) {
      ok("Aucun doublon de sous-domaine");
    } else {
      warn(`${dupes.length} sous-domaine(s) dupliqué(s):`);
      for (const [sd, ps] of dupes) {
        console.log(`    ${sd}:`);
        for (const p of ps) console.log(`      - ${p.id} (${p.email})`);
      }
    }
  }

  // 7b. Notifications integrity
  sub("7b. Notifications — cohérence");
  {
    const { data: notifs } = await supabase
      .from("notifications")
      .select("id, user_id, type, category, severity, is_read, read_at, is_archived, archived_at");
    if (!notifs || notifs.length === 0) {
      info("Table notifications vide");
    } else {
      // is_read=true but read_at is null
      const readNoDate = notifs.filter((n) => n.is_read && !n.read_at);
      if (readNoDate.length > 0) {
        warn(`${readNoDate.length} notification(s) marquée(s) lue(s) sans read_at`);
      } else {
        ok("Cohérence is_read/read_at OK");
      }

      // is_archived=true but archived_at is null
      const archivedNoDate = notifs.filter((n) => n.is_archived && !n.archived_at);
      if (archivedNoDate.length > 0) {
        warn(`${archivedNoDate.length} notification(s) archivée(s) sans archived_at`);
      } else {
        ok("Cohérence is_archived/archived_at OK");
      }

      // Severity distribution
      const sevCounts = {};
      for (const n of notifs) sevCounts[n.severity] = (sevCounts[n.severity] || 0) + 1;
      info("Distribution par sévérité:");
      for (const [s, c] of Object.entries(sevCounts)) console.log(`    ${s}: ${c}`);

      // Category distribution
      const catCounts = {};
      for (const n of notifs) catCounts[n.category] = (catCounts[n.category] || 0) + 1;
      info("Distribution par catégorie:");
      for (const [cat, c] of Object.entries(catCounts)) console.log(`    ${cat}: ${c}`);
    }
  }

  // 7c. Billing items with period_end < period_start
  sub("7c. Billing items — cohérence des périodes");
  {
    const { data: items } = await supabase
      .from("billing_items")
      .select("id, title, period_start, period_end, status");
    if (!items || items.length === 0) {
      info("Table billing_items vide");
    } else {
      const invalid = items.filter(
        (i) => i.period_start && i.period_end && i.period_end < i.period_start
      );
      if (invalid.length === 0) {
        ok("Toutes les périodes de billing_items sont cohérentes");
      } else {
        warn(`${invalid.length} billing_item(s) avec period_end < period_start`);
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════
async function main() {
  console.log(SEPARATOR);
  console.log("  JESTLY — AUDIT D'INTÉGRITÉ DE LA BASE DE DONNÉES");
  console.log(`  Date: ${new Date().toISOString()}`);
  console.log(`  Supabase: ${supabaseUrl}`);
  console.log(SEPARATOR);

  const tableStats = await auditTableStats();
  await auditOrphans();
  await auditDataConsistency();
  await auditSites();
  await auditForeignKeys();
  await auditIndexes(tableStats);
  await auditAdditional();

  console.log(`\n${SEPARATOR}`);
  console.log("  AUDIT TERMINÉ");
  console.log(SEPARATOR);
}

main().catch((err) => {
  console.error("ERREUR FATALE:", err);
  process.exit(1);
});
