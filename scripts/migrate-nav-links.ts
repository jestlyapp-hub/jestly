/**
 * Migration: Auto-link nav/footer/CTA on existing sites
 *
 * Fixes legacy sites where nav links have labels but no blockId/destinationType.
 * Uses the same matching logic as from-template/route.ts.
 *
 * Usage:
 *   npx tsx scripts/migrate-nav-links.ts              # dry-run (default)
 *   npx tsx scripts/migrate-nav-links.ts --apply       # apply changes
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load .env.local for local execution
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const isDryRun = !process.argv.includes("--apply");

// ── Label → block type matching (same as from-template/route.ts) ──

function matchLabelToBlockType(label: string, blockType: string): boolean {
  const l = label.toLowerCase().trim();
  const t = blockType.toLowerCase();

  if (l === "services" && (t.includes("service") || t.includes("feature"))) return true;
  if (l === "tarifs" && t.includes("pricing")) return true;
  if (l === "contact" && (t.includes("contact") || t.includes("cta"))) return true;
  if (l === "portfolio" && (t.includes("portfolio") || t.includes("gallery"))) return true;
  if (l === "showreel" && (t.includes("showreel") || t.includes("video"))) return true;
  if (l === "stack" && t.includes("stack")) return true;
  if (l === "projets" && (t.includes("portfolio") || t.includes("project"))) return true;
  if (l === "prestations" && (t.includes("service") || t.includes("pricing"))) return true;
  if ((l === "témoignages" || l === "temoignages") && t.includes("testimonial")) return true;
  if (l === "faq" && t.includes("faq")) return true;
  return false;
}

function isContactBlock(blockType: string): boolean {
  const t = blockType.toLowerCase();
  return (t.includes("contact") || t.includes("cta")) && !t.includes("banner");
}

interface NavLink {
  label?: string;
  blockId?: string;
  destinationType?: string;
  pageId?: string;
  url?: string;
  [key: string]: unknown;
}

interface NavConfig {
  links?: NavLink[];
  ctaLabel?: string;
  ctaBlockId?: string;
  ctaDestinationType?: string;
  [key: string]: unknown;
}

interface FooterConfig {
  links?: NavLink[];
  [key: string]: unknown;
}

// ── Main migration ──

async function migrate() {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  Nav Links Migration — ${isDryRun ? "DRY RUN" : "APPLYING CHANGES"}`);
  console.log(`${"═".repeat(60)}\n`);

  // 1. Fetch all sites with nav
  const { data: sites, error: sitesErr } = await supabase
    .from("sites")
    .select("id, slug, nav, footer")
    .not("nav", "is", null);

  if (sitesErr) {
    console.error("Failed to fetch sites:", sitesErr.message);
    process.exit(1);
  }

  if (!sites || sites.length === 0) {
    console.log("No sites found.");
    return;
  }

  console.log(`Found ${sites.length} sites with nav config.\n`);

  let totalSites = 0;
  let legacySites = 0;
  let totalLinksFixed = 0;
  let totalCtaFixed = 0;
  let totalFooterFixed = 0;
  let totalErrors = 0;

  for (const site of sites) {
    const nav: NavConfig = site.nav || {};
    const footer: FooterConfig = site.footer || {};
    const navLinks: NavLink[] = nav.links || [];
    const footerLinks: NavLink[] = footer.links || [];

    // Check if site needs migration
    const navNeedsFix = navLinks.some(
      (l) => l.label && !l.blockId && !l.pageId && !l.url
    );
    const ctaNeedsFix = nav.ctaLabel && !nav.ctaBlockId && !nav.ctaDestinationType;
    const footerNeedsFix = footerLinks.some(
      (l) => l.label && !l.blockId && !l.pageId && !l.url
    );

    if (!navNeedsFix && !ctaNeedsFix && !footerNeedsFix) {
      totalSites++;
      continue; // Already migrated
    }

    legacySites++;

    // Fetch home page blocks for this site
    const { data: pages } = await supabase
      .from("site_pages")
      .select("id, is_home")
      .eq("site_id", site.id)
      .order("sort_order", { ascending: true });

    const homePage = pages?.find((p: { is_home: boolean }) => p.is_home) || pages?.[0];
    if (!homePage) {
      console.log(`  ⚠ Site ${site.slug || site.id} — no pages found, skipping`);
      totalErrors++;
      continue;
    }

    const { data: blocks } = await supabase
      .from("site_blocks")
      .select("id, type, sort_order")
      .eq("page_id", homePage.id)
      .order("sort_order", { ascending: true });

    if (!blocks || blocks.length === 0) {
      console.log(`  ⚠ Site ${site.slug || site.id} — no blocks found, skipping`);
      totalErrors++;
      continue;
    }

    // Fix nav links
    let linksFixed = 0;
    const fixedNavLinks = navLinks.map((link) => {
      if (link.blockId || link.pageId || link.url) return link; // Already has destination
      const label = (link.label || "").toLowerCase().trim();

      if (label === "accueil" || label === "home") {
        linksFixed++;
        return { ...link, blockId: "__top", destinationType: "section" };
      }

      const match = blocks.find((b: { type: string }) => matchLabelToBlockType(label, b.type));
      if (match) {
        linksFixed++;
        return { ...link, blockId: match.id, destinationType: "section" };
      }
      return link;
    });

    // Fix CTA
    let ctaFixed = 0;
    const ctaPatch: Record<string, unknown> = {};
    if (ctaNeedsFix) {
      const ctaBlock = blocks.find((b: { type: string }) => isContactBlock(b.type));
      if (ctaBlock) {
        ctaPatch.ctaDestinationType = "section";
        ctaPatch.ctaBlockId = ctaBlock.id;
        ctaFixed = 1;
      }
    }

    // Fix footer links
    let footerFixed = 0;
    const fixedFooterLinks = footerLinks.map((link) => {
      if (link.blockId || link.pageId || link.url) return link;
      const label = (link.label || "").toLowerCase().trim();

      if (label === "accueil" || label === "home") {
        footerFixed++;
        return { ...link, blockId: "__top", destinationType: "section" };
      }

      const match = blocks.find((b: { type: string }) => matchLabelToBlockType(label, b.type));
      if (match) {
        footerFixed++;
        return { ...link, blockId: match.id, destinationType: "section" };
      }
      return link;
    });

    const totalFixed = linksFixed + ctaFixed + footerFixed;
    if (totalFixed === 0) {
      console.log(`  · Site ${site.slug || site.id} — legacy but no matching blocks found`);
      continue;
    }

    console.log(`  ${isDryRun ? "→" : "✓"} Site: ${site.slug || site.id}`);
    if (linksFixed > 0) console.log(`    nav links corrigés: ${linksFixed}`);
    if (ctaFixed > 0) console.log(`    CTA corrigé: oui`);
    if (footerFixed > 0) console.log(`    footer links corrigés: ${footerFixed}`);

    totalLinksFixed += linksFixed;
    totalCtaFixed += ctaFixed;
    totalFooterFixed += footerFixed;

    // Apply changes
    if (!isDryRun) {
      const updatedNav = {
        ...nav,
        links: fixedNavLinks,
        ...ctaPatch,
      };
      const updatedFooter = {
        ...footer,
        links: fixedFooterLinks,
      };

      const { error: updateErr } = await supabase
        .from("sites")
        .update({ nav: updatedNav, footer: updatedFooter })
        .eq("id", site.id);

      if (updateErr) {
        console.log(`    ✗ ERREUR: ${updateErr.message}`);
        totalErrors++;
      } else {
        console.log(`    [nav-migration] siteId=${site.id} links_fixed=${linksFixed} cta_fixed=${ctaFixed} footer_fixed=${footerFixed} status=success`);
      }
    }
  }

  // Summary
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  RÉSUMÉ ${isDryRun ? "(DRY RUN)" : "(APPLIQUÉ)"}`);
  console.log(`${"─".repeat(60)}`);
  console.log(`  Sites total:        ${sites.length}`);
  console.log(`  Sites déjà OK:      ${totalSites}`);
  console.log(`  Sites legacy:       ${legacySites}`);
  console.log(`  Nav links corrigés: ${totalLinksFixed}`);
  console.log(`  CTA corrigés:       ${totalCtaFixed}`);
  console.log(`  Footer corrigés:    ${totalFooterFixed}`);
  if (totalErrors > 0) console.log(`  Erreurs:            ${totalErrors}`);
  console.log(`${"─".repeat(60)}\n`);

  if (isDryRun) {
    console.log("  → Pour appliquer : npx tsx scripts/migrate-nav-links.ts --apply\n");
  }
}

migrate().catch(console.error);
