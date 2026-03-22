"use client";

import { useEffect, useCallback } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import { extractProductIdsFromBlocks } from "@/lib/product-context-utils";

// ═══════════════════════════════════════════════════════════════════
// GuideBridge — Pont entre le Guide V3 et le Builder
//
// Monté DANS le BuilderProvider (page /createur).
// Expose l'état du builder au guide via un élément DOM caché.
// Écoute les événements du guide pour effectuer des actions builder.
//
// Actions :
// - ensure-product-block : ajoute un bloc product-cards-grid si absent
// - select-product-block : sélectionne le premier bloc produit
// - ensure-demo-product  : crée un produit demo si aucun n'existe
// ═══════════════════════════════════════════════════════════════════

const PRODUCT_BLOCK_TYPES = [
  "product-cards-grid",
  "services-list",
  "service-cards",
  "product-hero-checkout",
  "inline-checkout",
  "pack-premium",
  "pricing-table-real",
  "bundle-builder",
];

const log = (m: string) => {
  if (process.env.NODE_ENV === "development")
    console.log(`[GuideBridge] ${m}`);
};

export default function GuideBridge() {
  const { state, dispatch } = useBuilder();

  // ── Expose builder state to guide via DOM data attributes ──────
  useEffect(() => {
    const el = document.getElementById("guide-bridge-state");
    if (!el) return;

    const allBlocks = state.site.pages.flatMap((p) => p.blocks);
    const productIds = extractProductIdsFromBlocks(allBlocks);
    const hasProductBlock = allBlocks.some((b) =>
      PRODUCT_BLOCK_TYPES.includes(b.type),
    );

    el.dataset.displayedProductCount = String(productIds.length);
    el.dataset.hasProductBlock = String(hasProductBlock);
    el.dataset.activeBlockId = state.activeBlockId || "";
    el.dataset.activePageId = state.activePageId || "";
  }, [state.site, state.activeBlockId, state.activePageId]);

  // ── Listen for guide events ────────────────────────────────────
  const handleGuideEvent = useCallback(
    (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.action) return;

      switch (detail.action) {
        case "ensure-product-block": {
          const allBlocks = state.site.pages.flatMap((p) => p.blocks);
          const existingBlock = allBlocks.find((b) =>
            PRODUCT_BLOCK_TYPES.includes(b.type),
          );
          if (existingBlock) {
            log(`ensure-product-block: already exists (${existingBlock.id}), selecting`);
            dispatch({ type: "SET_ACTIVE_BLOCK", blockId: existingBlock.id });
            window.dispatchEvent(
              new CustomEvent("jestly-guide-reply", {
                detail: { action: "product-block-ready", blockId: existingBlock.id },
              }),
            );
          } else {
            log("ensure-product-block: creating product-cards-grid");
            dispatch({
              type: "ADD_BLOCK",
              pageId: state.activePageId,
              blockType: "product-cards-grid",
            });
            window.dispatchEvent(
              new CustomEvent("jestly-guide-reply", {
                detail: { action: "product-block-created" },
              }),
            );
          }
          break;
        }

        case "select-product-block": {
          const allBlocks = state.site.pages.flatMap((p) => p.blocks);
          const block = allBlocks.find((b) =>
            PRODUCT_BLOCK_TYPES.includes(b.type),
          );
          if (block) {
            log(`select-product-block: selecting ${block.id}`);
            dispatch({ type: "SET_ACTIVE_BLOCK", blockId: block.id });
          } else {
            log("select-product-block: no product block found");
          }
          break;
        }

        case "ensure-demo-product": {
          log("ensure-demo-product: checking if products exist");
          fetch("/api/products")
            .then((r) => (r.ok ? r.json() : []))
            .then((data) => {
              const products = Array.isArray(data) ? data : [];
              if (products.length > 0) {
                log(`ensure-demo-product: ${products.length} product(s) exist, skipping`);
                return;
              }
              log("ensure-demo-product: no products, creating demo");
              return fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: "Miniature YouTube",
                  price_cents: 1500,
                  type: "service",
                  category: "design",
                  short_description: "Création d'une miniature YouTube professionnelle",
                  status: "active",
                }),
              });
            })
            .then((res) => {
              if (res && res.ok) log("ensure-demo-product: demo product created");
            })
            .catch((err) => log(`ensure-demo-product: error ${err}`));
          break;
        }
      }
    },
    [state.site, state.activePageId, dispatch],
  );

  useEffect(() => {
    window.addEventListener("jestly-guide", handleGuideEvent);
    return () => window.removeEventListener("jestly-guide", handleGuideEvent);
  }, [handleGuideEvent]);

  // Hidden DOM element for state exposure
  return <div id="guide-bridge-state" style={{ display: "none" }} />;
}
