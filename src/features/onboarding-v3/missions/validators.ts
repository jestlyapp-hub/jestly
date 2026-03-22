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
  const searchInputs = document.querySelectorAll('[data-testid="products-search"]');
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
  const btn = document.querySelector('[data-testid="publish-site"]');
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
// BRIEF LINKED — Auto-complete if brief already associated
// ═══════════════════════════════════════════════════════════════════

/**
 * Checks if a brief is already linked to the current product.
 * True when: linked brief badges/indicators exist in the DOM,
 * OR the brief tab shows linked briefs,
 * OR the user just clicked the brief tab (progressing).
 */
function validateBriefLinkedToProduct(): ValidatorResult {
  // Check for brief badges in the product page (e.g., "Par défaut" badge)
  const briefBadges = document.querySelectorAll(
    '[data-guide="product-brief-badge"], [data-guide="product-linked-brief"]',
  );
  if (briefBadges.length > 0) {
    log(`brief_linked_to_product: ${briefBadges.length} brief badge(s) found — auto-complete`);
    return { valid: true, message: "Brief déjà lié au produit" };
  }

  // Check for any brief item in the brief tab content
  // Look for brief cards/items that indicate a linked brief
  const briefItems = document.querySelectorAll(
    '.brief-item, [data-brief-id], [data-guide="linked-brief-item"]',
  );
  if (briefItems.length > 0) {
    log(`brief_linked_to_product: ${briefItems.length} brief item(s) in DOM — auto-complete`);
    return { valid: true, message: "Brief lié" };
  }

  // Check if the brief tab is already open and shows content
  // (the tab being open with content = brief is linked)
  const briefTab = document.querySelector<HTMLElement>('[data-guide="product-tab-brief"]');
  if (briefTab) {
    const isActive = briefTab.getAttribute("aria-selected") === "true" ||
                     briefTab.classList.contains("active") ||
                     briefTab.dataset?.state === "active";
    if (isActive) {
      // Tab is active — check if there's brief content visible
      const briefContent = document.querySelector(
        '[data-guide="product-brief-content"], [data-guide="product-add-brief-select"]',
      );
      if (briefContent) {
        // The select exists — check if it shows a selected brief
        const selectValue = briefContent.querySelector('[data-guide="selected-brief"]');
        if (selectValue) {
          log("brief_linked_to_product: selected brief found in select — auto-complete");
          return { valid: true, message: "Brief sélectionné" };
        }
      }
    }
  }

  // Fallback: check if the save button for brief exists and the form has data
  const saveBtn = document.querySelector('[data-guide="product-save-brief"]');
  if (saveBtn) {
    // The save button exists in the DOM — brief tab is open
    // If we also see a selected brief, it's linked
    // For now, just being at the save step with the button visible
    // means progress — the user clicked through
    log("brief_linked_to_product: save button visible, user is in brief tab");
    // DON'T auto-complete here — wait for the user to actually save
    // This is the correct non-auto-complete path
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
