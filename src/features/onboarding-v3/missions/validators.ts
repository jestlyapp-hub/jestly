"use client";

// ═══════════════════════════════════════════════════════════════════
// Mission Validators — Real state-based validation
//
// RULE: Validation is based on BUSINESS STATE, not DOM interactions.
// The highlight guides the user. The validator concludes the mission.
// These are SEPARATE concerns.
//
// ADAPTIVE: Validators check "skip" conditions first.
// If a product block already exists, library/category steps
// auto-complete immediately so the user jumps to product selection.
// ═══════════════════════════════════════════════════════════════════

import { trackProductEvent } from "@/lib/product-events";

export type ValidatorResult = {
  valid: boolean;
  message?: string;
};

type Validator = () => ValidatorResult | Promise<ValidatorResult>;

const log = (m: string) => {
  if (process.env.NODE_ENV === "development")
    console.log(`[Onboarding Validator] ${m}`);
};

// ── Bridge helper ────────────────────────────────────────────────

function readBridge() {
  const el = document.getElementById("guide-bridge-state");
  if (!el) return null;
  return {
    hasProductBlock: el.dataset.hasProductBlock === "true",
    displayedCount: Number(el.dataset.displayedProductCount || "0"),
  };
}

// ═══════════════════════════════════════════════════════════════════
// BLOCK LIBRARY FLOW — Adaptive validators
// These auto-complete if a product block already exists,
// otherwise they check the normal UI progression.
// ═══════════════════════════════════════════════════════════════════

/**
 * Step: "Open block library"
 * ✓ if product block already exists (skip)
 * ✓ if the AddBlockModal/block catalog is visible (user clicked "Add block")
 */
function validateBlockOrLibraryOpen(): ValidatorResult {
  const bridge = readBridge();
  if (bridge?.hasProductBlock) {
    log("block_or_library_open: skip — product block already exists");
    return { valid: true, message: "Bloc produit déjà présent" };
  }

  // Check if library modal is open (block catalog visible)
  const catalog = document.querySelector('[data-guide="block-catalog"]');
  const categories = document.querySelector('[data-guide="block-cat-vente"]');
  if (catalog || categories) {
    log("block_or_library_open: library is open");
    return { valid: true, message: "Bibliothèque ouverte" };
  }

  return { valid: false };
}

/**
 * Step: "Select Vente category"
 * ✓ if product block already exists (skip)
 * ✓ if the vente category content is expanded/visible
 */
function validateBlockOrVenteSelected(): ValidatorResult {
  const bridge = readBridge();
  if (bridge?.hasProductBlock) {
    log("block_or_vente_selected: skip — product block already exists");
    return { valid: true, message: "Bloc produit déjà présent" };
  }

  // Check if vente category is selected (blocks from vente are showing)
  // The catalog shows blocks when a category is clicked
  const catalog = document.querySelector('[data-guide="block-catalog"]');
  if (catalog) {
    log("block_or_vente_selected: catalog visible (vente likely selected)");
    return { valid: true, message: "Catégorie Vente affichée" };
  }

  return { valid: false };
}

/**
 * Step: "Pick a product block from catalog"
 * ✓ if ANY product block exists in the page
 */
function validateHasProductBlock(): ValidatorResult {
  const bridge = readBridge();
  if (bridge?.hasProductBlock) {
    log("has_product_block: true");
    return { valid: true, message: "Bloc produit ajouté" };
  }

  log("has_product_block: false");
  return { valid: false };
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCT DISPLAY — The critical mission validator
// ═══════════════════════════════════════════════════════════════════

/**
 * Source of truth:
 * isProductDisplayedInGrid = hasProductBlock && productsDisplayed > 0
 */
function validateProductDisplayed(): ValidatorResult {
  const bridge = readBridge();
  if (bridge) {
    log(
      `product_displayed: hasProductBlock=${bridge.hasProductBlock}, productsDisplayed=${bridge.displayedCount}`,
    );

    if (bridge.hasProductBlock && bridge.displayedCount > 0) {
      log("product_displayed: completionSatisfied=true");
      trackProductEvent("onboarding.product_added_to_site", "onboarding");
      return {
        valid: true,
        message: `${bridge.displayedCount} produit${bridge.displayedCount > 1 ? "s" : ""} affiché${bridge.displayedCount > 1 ? "s" : ""}`,
      };
    }

    log("product_displayed: completionSatisfied=false");
    return { valid: false };
  }

  // Fallback: DOM chip detection
  log("product_displayed: bridge not found, checking DOM fallback");
  const searchInputs = document.querySelectorAll('[data-guide="products-search"], [data-testid="products-search"]');
  for (const input of searchInputs) {
    const container = input.closest(".space-y-2");
    if (container) {
      const chips = container.querySelectorAll("[draggable='true']");
      if (chips.length > 0) {
        log(`product_displayed: DOM fallback found ${chips.length} chip(s)`);
        trackProductEvent("onboarding.product_added_to_site", "onboarding");
        return { valid: true };
      }
    }
  }

  log("product_displayed: no products detected");
  return { valid: false };
}

// ═══════════════════════════════════════════════════════════════════
// SITE PUBLICATION
// ═══════════════════════════════════════════════════════════════════

function validateSitePublished(): ValidatorResult {
  const btn = document.querySelector('[data-guide="publish-site"]') || document.querySelector('[data-testid="publish-site"]');
  if (!btn) {
    log("site_published: publish button not found");
    return { valid: false };
  }

  const text = btn.textContent || "";
  const published = text.includes("Publié");
  log(`site_published: buttonText="${text.trim()}", published=${published}`);

  if (published) {
    trackProductEvent("onboarding.site_published", "onboarding");
    return { valid: true, message: "Site publié avec succès !" };
  }

  return { valid: false };
}

// ═══════════════════════════════════════════════════════════════════
// SITE CREATION — Phase 0
// ═══════════════════════════════════════════════════════════════════

/**
 * Checks if a site has been created.
 * After template selection, the page redirects from /nouveau to /site-web/{id}/createur.
 * We detect this by checking the URL pattern.
 */
function validateSiteExists(): ValidatorResult {
  const path = typeof window !== "undefined" ? window.location.pathname : "";

  // After site creation, URL becomes /site-web/{siteId}/...  (not /nouveau)
  if (path.match(/\/site-web\/[^/]+\//) && !path.includes("/nouveau")) {
    log("site_exists: site detected (URL pattern match)");
    return { valid: true, message: "Site créé" };
  }

  // Fallback: check if the GuideBridge is mounted (only on /createur page)
  const bridge = document.getElementById("guide-bridge-state");
  if (bridge) {
    log("site_exists: bridge detected (builder loaded)");
    return { valid: true, message: "Site créé (builder actif)" };
  }

  log(`site_exists: no site detected (path=${path})`);
  return { valid: false };
}

// ═══════════════════════════════════════════════════════════════════
// BUILDER — First block added
// ═══════════════════════════════════════════════════════════════════

/**
 * Checks if a block was just added in the builder.
 * True when: a block is actively selected (activeBlockId is set)
 * AND the block catalog modal is closed (user picked a block).
 */
function validateBlockSelectedInBuilder(): ValidatorResult {
  const bridge = readBridge();
  if (bridge) {
    const activeBlockId = document.getElementById("guide-bridge-state")?.dataset.activeBlockId;
    if (activeBlockId) {
      // Block is selected — catalog closed, block was added
      const catalog = document.querySelector('[data-guide="block-catalog"]');
      if (!catalog) {
        log(`block_selected_in_builder: block selected (${activeBlockId}), catalog closed`);
        return { valid: true, message: "Bloc ajouté et sélectionné" };
      }
    }
  }

  // Fallback: check if the property panel appeared (block was selected)
  const panel = document.querySelector('[data-guide="block-property-panel"]');
  const catalog = document.querySelector('[data-guide="block-catalog"]');
  if (panel && !catalog) {
    log("block_selected_in_builder: property panel visible, catalog closed");
    return { valid: true, message: "Bloc sélectionné" };
  }

  log("block_selected_in_builder: waiting for block selection");
  return { valid: false };
}

// ═══════════════════════════════════════════════════════════════════
// BRIEF TAB OR LINKED — For the "open brief tab" step
// ═══════════════════════════════════════════════════════════════════

/**
 * Step: "Open the Brief tab"
 * ✓ if the Brief tab is currently active (user clicked on it)
 * ✓ if a brief is already linked (auto-skip)
 */
function validateBriefTabOrLinked(): ValidatorResult {
  // First check if brief already linked (auto-skip all brief steps)
  if (hasBriefLinked()) {
    log("brief_tab_or_linked: brief already linked — auto-complete");
    return { valid: true, message: "Brief déjà lié au produit" };
  }

  // Check if the Brief tab is active (user clicked on it)
  const briefTab = document.querySelector<HTMLElement>('[data-guide="product-tab-brief"]');
  if (briefTab) {
    // Detect active state: border-b-2 + text color indicates active in this UI
    const isActive = briefTab.getAttribute("aria-selected") === "true" ||
                     briefTab.classList.contains("active") ||
                     briefTab.dataset?.state === "active" ||
                     briefTab.classList.contains("border-b-2") ||
                     briefTab.className.includes("text-[#4F46E5]");
    if (isActive) {
      log("brief_tab_or_linked: brief tab is active — complete");
      return { valid: true, message: "Onglet Brief ouvert" };
    }
  }

  // Fallback: if the brief select or save button is visible, the tab is open
  const briefSelect = document.querySelector('[data-guide="product-add-brief-select"]');
  if (briefSelect) {
    log("brief_tab_or_linked: brief select visible — tab is open");
    return { valid: true, message: "Onglet Brief ouvert" };
  }

  log("brief_tab_or_linked: brief tab not active");
  return { valid: false };
}

// ═══════════════════════════════════════════════════════════════════
// BRIEF LINKED — Auto-complete if brief already associated
// ═══════════════════════════════════════════════════════════════════

/** Shared helper: checks DOM for linked brief indicators */
function hasBriefLinked(): boolean {
  // Strategy 1: linked-brief-item elements (with data-brief-id)
  const briefItems = document.querySelectorAll(
    '[data-guide="linked-brief-item"], [data-brief-id], [data-guide="product-brief-badge"]',
  );
  if (briefItems.length > 0) return true;
  return false;
}

/**
 * Checks if a brief is linked to the current product.
 * True when: linked brief items exist in the DOM (badges, brief cards).
 */
function validateBriefLinkedToProduct(): ValidatorResult {
  if (hasBriefLinked()) {
    log("brief_linked_to_product: linked brief(s) found in DOM — auto-complete");
    return { valid: true, message: "Brief lié au produit" };
  }

  log("brief_linked_to_product: no linked brief detected");
  return { valid: false };
}

// ── Validator Registry ───────────────────────────────────────────

export const missionValidators: Record<string, Validator> = {
  site_exists: validateSiteExists,
  block_or_library_open: validateBlockOrLibraryOpen,
  block_or_vente_selected: validateBlockOrVenteSelected,
  has_product_block: validateHasProductBlock,
  product_displayed: validateProductDisplayed,
  site_published: validateSitePublished,
  block_selected_in_builder: validateBlockSelectedInBuilder,
  brief_tab_or_linked: validateBriefTabOrLinked,
  brief_linked_to_product: validateBriefLinkedToProduct,
};

/**
 * Run a validator by key. Returns { valid: false } if key not found.
 */
export async function runValidator(key: string): Promise<ValidatorResult> {
  const validator = missionValidators[key];
  if (!validator) {
    log(`validator "${key}" not found`);
    return { valid: false, message: `Validateur "${key}" introuvable` };
  }
  return validator();
}
