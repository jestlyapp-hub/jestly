/**
 * Campagne stress-test : 15 sites + produits + publication
 * Usage: node scripts/campaign-15-sites.mjs
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

const USER_ID = "b13177ae-671e-4b61-a6df-ba944f6456b4";
const BASE_DOMAIN = env.NEXT_PUBLIC_BASE_DOMAIN || "jestly.fr";

// ── Matrice des 15 sites ──
const SITES = [
  { name: "Alex Montage", slug: "alex-montage", template: "creator", desc: "Vid\u00E9aste freelance minimaliste", products: ["Montage vid\u00E9o court", "Montage vid\u00E9o long", "Color grading"] },
  { name: "MotionLab Studio", slug: "motionlab-studio", template: "cinema", desc: "Motion designer premium", products: ["Intro anim\u00E9e", "Logo anim\u00E9", "Vid\u00E9o promo", "Pack motion"] },
  { name: "MiniaMaker Pro", slug: "miniamaker-pro", template: "creator", desc: "Miniaturiste YouTube conversion", products: ["Miniature YouTube", "Pack 5 miniatures", "Miniature premium"] },
  { name: "Sophie Photo", slug: "sophie-photo", template: "editorial", desc: "Photographe mariage visuel", products: ["S\u00E9ance portrait", "Pack mariage", "Book photo", "Retouche avanc\u00E9e"] },
  { name: "ShortCut Factory", slug: "shortcut-factory", template: "neon", desc: "Monteur short-form agressif CTA", products: ["Short TikTok", "R\u00E9el Instagram", "YouTube Short"] },
  { name: "Brand Identity Co", slug: "brand-identity-co", template: "studio", desc: "Designer branding portfolio + offre", products: ["Logo + charte", "Refonte branding", "Packaging design"] },
  { name: "Lucas Conseil", slug: "lucas-conseil", template: "product", desc: "Consultant cr\u00E9atif ultra simple 1 page", products: ["Audit strat\u00E9gique", "Coaching 1h", "Plan d'action"] },
  { name: "CollectifVisu", slug: "collectif-visu", template: "studio", desc: "Studio cr\u00E9atif multi-services", products: ["Direction artistique", "Shooting photo", "Montage vid\u00E9o", "Branding complet", "Social media pack"] },
  { name: "ProdMax Agency", slug: "prodmax-agency", template: "cinema", desc: "Agence vid\u00E9o beaucoup de sections", products: ["Film corporate", "Captation live", "Post-production", "Spot publicitaire"] },
  { name: "TarifMaster", slug: "tarifmaster", template: "product", desc: "Site pricing tr\u00E8s dense", products: ["Starter", "Pro", "Enterprise", "Custom", "Add-on SEO", "Add-on Analytics"] },
  { name: "FAQ Ultime", slug: "faq-ultime", template: "editorial", desc: "Beaucoup de texte et FAQ longue", products: ["Formation compl\u00E8te", "eBook guide", "Template pack"] },
  { name: "PixelGallery", slug: "pixel-gallery", template: "creator", desc: "Beaucoup d'images / galeries", products: ["Print A3", "Print A2", "Print A1", "Pack 3 prints"] },
  { name: "HeroMax Design", slug: "heromax-design", template: "neon", desc: "Hero complexe + CTA + sections r\u00E9ordonn\u00E9es", products: ["UI/UX Design", "Landing page", "Dashboard design"] },
  { name: "MobileFirst Studio", slug: "mobilefirst-studio", template: "studio", desc: "Mobile-first sections compactes", products: ["App design", "Responsive audit", "Prototype Figma"] },
  { name: "StressTest Extreme", slug: "stresstest-extreme", template: "creator", desc: "Stress test: beaucoup de blocs, produits, titres longs, contenu volumineux", products: [
    "Prestation ultra longue description pour tester les limites du syst\u00E8me de rendu",
    "Pack \u00E9norme avec beaucoup d'options et de personnalisations possibles",
    "Service premium haut de gamme avec suivi complet du projet de A \u00E0 Z",
    "Consultation strat\u00E9gique et op\u00E9rationnelle",
    "Offre sp\u00E9ciale \u00E9v\u00E9nement",
    "Mini prestation rapide",
    "Audit complet approfondi",
    "Formation intensive"
  ] },
];

const results = [];

async function createSiteFromTemplate(site) {
  const t0 = Date.now();

  // 1. Cr\u00E9er le site
  const { data: newSite, error: siteErr } = await supabase.from("sites").insert({
    owner_id: USER_ID,
    slug: site.slug,
    name: site.name,
    status: "draft",
    settings: { name: site.name, description: site.desc, maintenanceMode: false, socials: {} },
    theme: { primaryColor: "#4F46E5", fontFamily: "Inter", borderRadius: "rounded", shadow: "md" },
    seo: { globalTitle: site.name, globalDescription: site.desc },
  }).select("id").single();

  if (siteErr) {
    if (siteErr.code === "23505") {
      console.log(`  \u26A0 ${site.name}: slug d\u00E9j\u00E0 utilis\u00E9, skip`);
      // R\u00E9cup\u00E9rer le site existant
      const { data: existing } = await supabase.from("sites").select("id").eq("slug", site.slug).eq("owner_id", USER_ID).single();
      if (existing) return { ...site, siteId: existing.id, existing: true, time: 0, products_created: 0, bugs: ["Slug d\u00E9j\u00E0 existant"] };
    }
    console.log(`  \u2717 ${site.name}: ${siteErr.message}`);
    return { ...site, siteId: null, error: siteErr.message, time: 0, products_created: 0, bugs: [siteErr.message] };
  }

  const siteId = newSite.id;

  // 2. Cr\u00E9er une page d'accueil avec blocs de base
  const { data: homePage } = await supabase.from("site_pages").insert({
    site_id: siteId,
    title: "Accueil",
    slug: "/",
    is_home: true,
    sort_order: 0,
    status: "draft",
  }).select("id").single();

  const pageId = homePage?.id;
  const bugs = [];

  if (!pageId) {
    bugs.push("Impossible de cr\u00E9er la page d'accueil");
    return { ...site, siteId, time: Date.now() - t0, products_created: 0, bugs };
  }

  // 3. Ins\u00E9rer des blocs vari\u00E9s
  const blocks = [
    { type: "hero", sort_order: 0, content: { title: site.name, subtitle: site.desc, ctaLabel: "D\u00E9couvrir", ctaLink: "" }, style: { paddingTop: 80, paddingBottom: 80, containerWidth: "boxed" }, settings: {}, visible: true },
    { type: "features", sort_order: 1, content: { title: "Nos services", items: site.products.slice(0, 3).map(p => ({ title: p, description: "Description du service " + p })) }, style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" }, settings: {}, visible: true },
    { type: "pricing", sort_order: 2, content: { title: "Tarifs", plans: site.products.slice(0, 3).map((p, i) => ({ name: p, price: (i + 1) * 49, features: ["Livraison rapide", "R\u00E9visions incluses", "Support prioritaire"] })) }, style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" }, settings: {}, visible: true },
    { type: "testimonials", sort_order: 3, content: { title: "T\u00E9moignages", items: [{ name: "Marie D.", text: "Excellent travail, je recommande !", rating: 5 }, { name: "Pierre L.", text: "Tr\u00E8s professionnel et r\u00E9actif.", rating: 5 }] }, style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" }, settings: {}, visible: true },
    { type: "faq", sort_order: 4, content: { title: "Questions fr\u00E9quentes", items: [{ question: "Quel est le d\u00E9lai ?", answer: "G\u00E9n\u00E9ralement 3 \u00E0 5 jours ouvrables." }, { question: "Quels formats ?", answer: "PNG, JPG, PSD, AI selon la prestation." }] }, style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" }, settings: {}, visible: true },
    { type: "contact-form", sort_order: 5, content: { title: "Contact", subtitle: "Envoyez-moi un message", createOrder: false }, style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" }, settings: {}, visible: true },
  ];

  const blockRows = blocks.map(b => ({ page_id: pageId, ...b }));
  const { error: blockErr } = await supabase.from("site_blocks").insert(blockRows);
  if (blockErr) bugs.push("Erreur insertion blocs: " + blockErr.message);

  // 4. Cr\u00E9er les produits
  let productsCreated = 0;
  const productIds = [];

  for (let i = 0; i < site.products.length; i++) {
    const pName = site.products[i];
    const price = Math.round((Math.random() * 200 + 29) * 100); // 29\u20AC \u00E0 229\u20AC en cents

    const { data: product, error: prodErr } = await supabase.from("products").insert({
      owner_id: USER_ID,
      name: pName,
      slug: pName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      price_cents: price,
      description: `${pName} \u2014 prestation professionnelle par ${site.name}.`,
      status: "active",
      category: "service",
    }).select("id").single();

    if (prodErr) {
      if (prodErr.code !== "23505") bugs.push(`Produit "${pName}": ${prodErr.message}`);
    } else if (product) {
      productsCreated++;
      productIds.push(product.id);
    }
  }

  // 5. Lier les produits au site
  for (const pid of productIds) {
    const { error: linkErr } = await supabase.from("site_product_links").upsert(
      { site_id: siteId, product_id: pid, sort_order: productIds.indexOf(pid) },
      { onConflict: "site_id,product_id" }
    );
    if (linkErr) bugs.push(`Link produit: ${linkErr.message}`);
  }

  // 6. Publier le site
  const { error: pubErr } = await supabase.from("sites").update({ status: "published" }).eq("id", siteId);
  if (pubErr) bugs.push("Publication: " + pubErr.message);

  // Publier la page
  const { error: pagePubErr } = await supabase.from("site_pages").update({ status: "published", published_at: new Date().toISOString() }).eq("id", pageId);
  if (pagePubErr) bugs.push("Publication page: " + pagePubErr.message);

  const time = Date.now() - t0;
  console.log(`  \u2713 ${site.name} | ${time}ms | ${productsCreated} produits | ${blocks.length} blocs${bugs.length ? " | \u26A0 " + bugs.length + " bug(s)" : ""}`);

  return { ...site, siteId, pageId, time, products_created: productsCreated, blocks_count: blocks.length, published: !pubErr, bugs };
}

async function run() {
  console.log("\n  \u2550\u2550 CAMPAGNE 15 SITES \u2550\u2550\n");

  for (const site of SITES) {
    const result = await createSiteFromTemplate(site);
    results.push(result);
  }

  // ── V\u00E9rification rendu public ──
  console.log("\n  \u2550\u2550 V\u00C9RIFICATION RENDU PUBLIC \u2550\u2550\n");

  for (const r of results) {
    if (!r.siteId) continue;

    // V\u00E9rifier que le site est accessible via son slug
    const { data: siteData } = await supabase.from("sites")
      .select("id, slug, status, name")
      .eq("id", r.siteId)
      .single();

    if (siteData) {
      const url = `https://${BASE_DOMAIN}/s/${siteData.slug}`;
      console.log(`  ${siteData.status === "published" ? "\u2713" : "\u2717"} ${siteData.name} | ${siteData.status} | ${url}`);
    }
  }

  // ── V\u00E9rification int\u00E9grit\u00E9 data ──
  console.log("\n  \u2550\u2550 INT\u00C9GRIT\u00C9 DATA \u2550\u2550\n");

  const { count: totalSites } = await supabase.from("sites").select("id", { count: "exact", head: true }).eq("owner_id", USER_ID);
  const { count: totalProducts } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("owner_id", USER_ID);
  const { count: totalLinks } = await supabase.from("site_product_links").select("site_id", { count: "exact", head: true });
  const { count: totalPages } = await supabase.from("site_pages").select("id", { count: "exact", head: true });
  const { count: totalBlocks } = await supabase.from("site_blocks").select("id", { count: "exact", head: true });

  console.log(`  Sites: ${totalSites}`);
  console.log(`  Produits: ${totalProducts}`);
  console.log(`  Liens site-produit: ${totalLinks}`);
  console.log(`  Pages: ${totalPages}`);
  console.log(`  Blocs: ${totalBlocks}`);

  // ── R\u00E9sum\u00E9 ──
  console.log("\n  \u2550\u2550 MATRICE R\u00C9SULTAT \u2550\u2550\n");
  console.log("  Site                      | Temps  | Blocs | Produits | Bugs");
  console.log("  " + "-".repeat(70));

  let totalBugs = 0;
  for (const r of results) {
    const name = (r.name || "???").padEnd(26);
    const time = ((r.time || 0) + "ms").padEnd(7);
    const blocs = String(r.blocks_count || 0).padEnd(6);
    const prods = String(r.products_created || 0).padEnd(9);
    const bugCount = (r.bugs || []).length;
    totalBugs += bugCount;
    console.log(`  ${name}| ${time}| ${blocs}| ${prods}| ${bugCount}`);
  }

  console.log("\n  Total bugs: " + totalBugs);
  if (totalBugs > 0) {
    console.log("\n  \u2550\u2550 D\u00C9TAIL BUGS \u2550\u2550\n");
    for (const r of results) {
      if (r.bugs?.length > 0) {
        console.log(`  ${r.name}:`);
        for (const b of r.bugs) console.log(`    - ${b}`);
      }
    }
  }

  console.log("");
}

run().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
