"use client";

import { useState, useEffect, useCallback } from "react";
import type { AccountState } from "./guide.types";

const EMPTY: AccountState = {
  loading: true,
  siteId: null,
  hasSite: false,
  siteStyled: false,
  sitePublished: false,
  blocksCount: 0,
  hasBlocks: false,
  hasProductBlocks: false,
  hasProducts: false,
  hasClients: false,
  hasOrders: false,
};

const PRODUCT_BLOCK_TYPES = new Set([
  "services-list", "service-cards", "services-premium", "pack-premium",
  "pricing-table", "pricing-table-real", "pricing-modern", "comparison-table",
  "product-hero-checkout", "product-cards-grid", "inline-checkout", "bundle-builder",
]);

function isSiteStyled(theme: Record<string, unknown> | null | undefined): boolean {
  if (!theme || typeof theme !== "object") return false;
  const keys = ["primaryColor", "fontFamily", "headingFont", "backgroundColor", "mode"];
  return keys.some((k) => k in theme && theme[k] != null && theme[k] !== "");
}

async function fetchAccountState(): Promise<AccountState> {
  const s: AccountState = { ...EMPTY, loading: false };

  const [sitesRes, productsRes, clientsRes, ordersRes] = await Promise.allSettled([
    fetch("/api/sites").then((r) => (r.ok ? r.json() : null)),
    fetch("/api/products").then((r) => (r.ok ? r.json() : null)),
    fetch("/api/clients").then((r) => (r.ok ? r.json() : null)),
    fetch("/api/orders").then((r) => (r.ok ? r.json() : null)),
  ]);

  const arr = (res: PromiseSettledResult<unknown>): unknown[] => {
    if (res.status !== "fulfilled" || !res.value) return [];
    if (Array.isArray(res.value)) return res.value;
    const v = res.value as Record<string, unknown>;
    if (Array.isArray(v.data)) return v.data;
    if (Array.isArray(v.items)) return v.items;
    return [];
  };

  const sites = arr(sitesRes) as Record<string, unknown>[];
  if (sites.length > 0) {
    const site = sites[0];
    s.hasSite = true;
    s.siteId = (site.id as string) ?? null;
    s.sitePublished = site.status === "published";
    s.siteStyled = isSiteStyled(site.theme as Record<string, unknown>);

    const pages = (site.pages ?? site.site_pages ?? []) as Record<string, unknown>[];
    let blocks = 0;
    let productBlock = false;
    for (const p of pages) {
      const bl = (p.blocks ?? p.site_blocks ?? []) as Record<string, unknown>[];
      blocks += bl.length;
      for (const b of bl) { if (PRODUCT_BLOCK_TYPES.has(b.type as string)) productBlock = true; }
    }
    s.blocksCount = blocks;
    s.hasBlocks = blocks > 0;
    s.hasProductBlocks = productBlock;
  }

  const products = arr(productsRes);
  s.hasProducts = products.length > 0;

  const clients = arr(clientsRes);
  s.hasClients = clients.length > 0;

  const orders = arr(ordersRes);
  s.hasOrders = orders.length > 0;

  return s;
}

export function useAccountState() {
  const [state, setState] = useState<AccountState>(EMPTY);

  const refresh = useCallback(async () => {
    try { setState(await fetchAccountState()); }
    catch { setState((p) => ({ ...p, loading: false })); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { accountState: state, refreshAccountState: refresh };
}
