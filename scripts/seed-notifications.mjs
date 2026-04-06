/**
 * Seed de notifications réalistes pour tester le pipeline complet.
 * Usage: node scripts/seed-notifications.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(join(__dirname, "..", ".env.local"), "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const idx = line.indexOf("=");
  if (idx > 0) {
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (k && v) env[k] = v;
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Utilisateur cible : jestlyapp@gmail.com
const USER_ID = "b13177ae-671e-4b61-a6df-ba944f6456b4";

async function insert(row) {
  const { data, error } = await supabase
    .from("notifications")
    .insert({ user_id: USER_ID, metadata: {}, triggered_by: "system", ...row })
    .select("id")
    .single();
  const ok = !!data && !error;
  const reason = error?.code === "23505" ? "doublon" : error?.message;
  console.log(ok ? "  \u2713" : "  \u2717", row.type + ":", row.title, reason ? `(${reason})` : "");
  return ok;
}

async function seed() {
  console.log("\n  Seed notifications pour jestlyapp@gmail.com\n");
  let created = 0;

  // ── 1. Commandes ──
  const { data: orders } = await supabase
    .from("orders")
    .select("id, title, status, amount, clients(name)")
    .eq("user_id", USER_ID)
    .order("created_at", { ascending: false })
    .limit(6);

  console.log(`  ${orders?.length ?? 0} commandes trouvees\n`);

  for (const o of (orders || []).slice(0, 3)) {
    const clientName = o.clients?.name;
    const msg = clientName
      ? `${clientName} \u2014 ${o.title}${o.amount ? ` (${Number(o.amount).toFixed(2)} \u20AC)` : ""}`
      : o.title;
    if (await insert({
      type: "order_new", category: "orders", severity: "success",
      title: "Nouvelle commande re\u00E7ue", message: msg,
      cta_label: "Voir la commande", cta_href: "/commandes",
      entity_type: "order", entity_id: o.id,
      idempotency_key: `seed_order_new:${o.id}`,
    })) created++;
  }

  for (const o of (orders || []).filter(o => o.status === "delivered").slice(0, 2)) {
    const msg = o.clients?.name
      ? `${o.title} pour ${o.clients.name} est marqu\u00E9e comme livr\u00E9e.`
      : `${o.title} est marqu\u00E9e comme livr\u00E9e.`;
    if (await insert({
      type: "order_delivered", category: "orders", severity: "success",
      title: "Commande livr\u00E9e", message: msg,
      cta_label: "Voir la commande", cta_href: "/commandes",
      entity_type: "order", entity_id: o.id,
      idempotency_key: `seed_delivered:${o.id}`,
    })) created++;
  }

  // ── 2. Taches ──
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, due_date, status")
    .eq("user_id", USER_ID)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  console.log(`\n  ${tasks?.length ?? 0} taches trouvees\n`);

  for (const t of (tasks || []).slice(0, 2)) {
    const dateStr = t.due_date
      ? new Date(t.due_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
      : null;
    if (await insert({
      type: "task_due", category: "tasks", severity: "warning",
      title: "T\u00E2che \u00E0 \u00E9ch\u00E9ance",
      message: dateStr
        ? `\u00AB ${t.title} \u00BB arrive \u00E0 \u00E9ch\u00E9ance le ${dateStr}.`
        : `\u00AB ${t.title} \u00BB n\u00E9cessite votre attention.`,
      cta_label: "Voir la t\u00E2che", cta_href: `/taches/${t.id}`,
      entity_type: "task", entity_id: t.id,
      idempotency_key: `seed_task:${t.id}`,
    })) created++;
  }

  // ── 3. Notifications systeme ──
  const now = new Date();
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  console.log("\n  Notifications syst\u00E8me\n");

  const systemNotifs = [
    {
      type: "invoice_suggestion", category: "billing", severity: "info",
      title: "Facturation recommand\u00E9e",
      message: "Certaines commandes livr\u00E9es ne sont pas encore factur\u00E9es.",
      cta_label: "Facturer maintenant", cta_href: "/facturation",
      idempotency_key: `seed_invoice:${now.toISOString().slice(0, 10)}`,
    },
    {
      type: "health_alert", category: "health", severity: "warning",
      title: "T\u00E2ches en retard d\u00E9tect\u00E9es",
      message: "Vous avez des t\u00E2ches dont l'\u00E9ch\u00E9ance est d\u00E9pass\u00E9e.",
      cta_label: "Voir les t\u00E2ches", cta_href: "/taches",
      idempotency_key: `seed_health:${now.toISOString().slice(0, 10)}`,
    },
    {
      type: "monthly_closure_reminder", category: "billing", severity: "info",
      title: "Cl\u00F4ture mensuelle",
      message: `Pensez \u00E0 v\u00E9rifier votre facturation pour ${monthLabel}.`,
      cta_label: "Ouvrir la facturation", cta_href: "/facturation",
      idempotency_key: `seed_closure:${now.toISOString().slice(0, 7)}`,
    },
    {
      type: "calendar_reminder", category: "calendar", severity: "info",
      title: "\u00C9v\u00E9nement \u00E0 venir",
      message: "Vous avez un \u00E9v\u00E9nement pr\u00E9vu prochainement.",
      cta_label: "Voir le calendrier", cta_href: "/calendrier",
      idempotency_key: `seed_calendar:${now.toISOString().slice(0, 10)}`,
    },
  ];

  for (const n of systemNotifs) {
    if (await insert(n)) created++;
  }

  // ── Resultat ──
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", USER_ID);

  const { count: unread } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", USER_ID)
    .eq("is_read", false)
    .eq("is_archived", false);

  console.log(`\n  === R\u00C9SULTAT ===`);
  console.log(`  Cr\u00E9\u00E9es: ${created}`);
  console.log(`  Total notifications: ${count}`);
  console.log(`  Non lues: ${unread}\n`);
}

seed().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
