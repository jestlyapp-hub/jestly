/**
 * Fonctions de synchronisation Shopify → cache Supabase.
 * Sync delta (incremental) + initial full sync.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { ShopifyClient, ShopifyApiError } from "./client";
import {
  QUERY_ORDERS,
  QUERY_PRODUCTS,
  QUERY_CUSTOMERS,
  QUERY_SHOPIFYQL,
} from "./queries";
import type { DecryptedIntegration } from "./types";
import { computeTrackingStatus } from "./tracking-status";
import { matchPixelAttributionForUser } from "@/lib/pixel/matcher";

const PAGE_SIZE = 50;

// ── Helpers parsing GraphQL responses ────────────────────────────
interface PageInfo { hasNextPage: boolean; endCursor: string | null }
interface Edge<T> { node: T }
interface Connection<T> { pageInfo: PageInfo; edges: Edge<T>[] }

interface OrderNode {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
  cancelledAt: string | null;
  displayFinancialStatus: string | null;
  displayFulfillmentStatus: string | null;
  email: string | null;
  phone: string | null;
  tags: string[];
  sourceName: string | null;
  customAttributes?: Array<{ key: string; value: string | null }> | null;
  customerJourneySummary?: {
    ready?: boolean | null;
    momentsCount?: { count: number } | null;
    firstVisit?: {
      landingPage: string | null;
      referrerUrl: string | null;
      source: string | null;
      utmParameters?: { source: string | null; medium: string | null; campaign: string | null } | null;
    } | null;
  } | null;
  totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
  subtotalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
  totalTaxSet: { shopMoney: { amount: string } };
  totalShippingPriceSet: { shopMoney: { amount: string } };
  totalDiscountsSet: { shopMoney: { amount: string } };
  currencyCode: string;
  customer: { id: string; email: string | null } | null;
  shippingAddress: unknown;
  billingAddress: unknown;
  lineItems: Connection<{
    id: string; title: string; variantTitle: string | null; quantity: number;
    sku: string | null; vendor: string | null;
    product: { id: string } | null;
    variant: { id: string; image: { url: string } | null } | null;
    originalUnitPriceSet: { shopMoney: { amount: string } };
    totalDiscountSet: { shopMoney: { amount: string } };
  }>;
}

function shopifyGidToId(gid: string | null | undefined): string | null {
  if (!gid) return null;
  // gid://shopify/Order/12345 -> 12345
  const parts = gid.split("/");
  return parts[parts.length - 1] ?? null;
}

function n(s: string | null | undefined): number | null {
  if (s == null) return null;
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : null;
}

// ── Sync Orders ──────────────────────────────────────────────────
export async function syncOrders(
  integration: DecryptedIntegration,
  options: { since?: string | null; maxPages?: number } = {},
): Promise<{ synced: number; lastCreatedAt: string | null }> {
  const client = new ShopifyClient(integration);
  const supabase = createAdminClient();
  let cursor: string | null = null;
  let synced = 0;
  let lastCreatedAt: string | null = null;
  const maxPages = options.maxPages ?? 500;
  const query = options.since ? `updated_at:>='${options.since}'` : undefined;

  for (let page = 0; page < maxPages; page++) {
    const res: { orders: Connection<OrderNode> } = await client.request(QUERY_ORDERS, {
      first: PAGE_SIZE,
      after: cursor,
      query,
    });

    const rows = res.orders.edges.map(({ node }) => {
      const journey = node.customerJourneySummary;
      const firstVisit = journey?.firstVisit;
      const utm = firstVisit?.utmParameters;
      // Journey pas encore traité par Shopify (ready=false) → momentsCount non fiable → inconnu.
      const momentsCount = journey?.ready === false ? null : journey?.momentsCount?.count ?? null;
      const lineItems = node.lineItems.edges.map(({ node: li }) => ({
        id: shopifyGidToId(li.id),
        product_id: shopifyGidToId(li.product?.id),
        variant_id: shopifyGidToId(li.variant?.id),
        title: li.title,
        variant_title: li.variantTitle,
        quantity: li.quantity,
        price: n(li.originalUnitPriceSet?.shopMoney?.amount) ?? 0,
        total_discount: n(li.totalDiscountSet?.shopMoney?.amount) ?? 0,
        sku: li.sku,
        vendor: li.vendor,
        image_url: li.variant?.image?.url ?? null,
      }));
      if (!lastCreatedAt || node.createdAt > lastCreatedAt) lastCreatedAt = node.createdAt;
      return {
        integration_id: integration.id,
        shopify_order_id: shopifyGidToId(node.id),
        order_number: node.name?.replace(/^#/, "") ?? null,
        name: node.name,
        total_price: n(node.totalPriceSet?.shopMoney?.amount),
        subtotal_price: n(node.subtotalPriceSet?.shopMoney?.amount),
        total_tax: n(node.totalTaxSet?.shopMoney?.amount),
        total_shipping: n(node.totalShippingPriceSet?.shopMoney?.amount),
        total_discounts: n(node.totalDiscountsSet?.shopMoney?.amount),
        currency: node.currencyCode,
        financial_status: node.displayFinancialStatus?.toLowerCase() ?? null,
        fulfillment_status: node.displayFulfillmentStatus?.toLowerCase() ?? null,
        customer_id: shopifyGidToId(node.customer?.id),
        email: node.email ?? node.customer?.email ?? null,
        phone: node.phone,
        line_items: lineItems,
        shipping_address: node.shippingAddress ?? null,
        billing_address: node.billingAddress ?? null,
        tags: node.tags ?? [],
        source_name: node.sourceName,
        note_attributes: node.customAttributes ?? [],
        referring_site: firstVisit?.referrerUrl ?? null,
        landing_site: firstVisit?.landingPage ?? null,
        utm_source: utm?.source ?? null,
        utm_medium: utm?.medium ?? null,
        utm_campaign: utm?.campaign ?? null,
        journey_moments_count: momentsCount,
        tracking_status: computeTrackingStatus(momentsCount, {
          utm_source: utm?.source ?? null,
          utm_medium: utm?.medium ?? null,
          utm_campaign: utm?.campaign ?? null,
          referring_site: firstVisit?.referrerUrl ?? null,
          landing_site: firstVisit?.landingPage ?? null,
        }),
        created_at: node.createdAt,
        updated_at: node.updatedAt,
        processed_at: node.processedAt,
        cancelled_at: node.cancelledAt,
        synced_at: new Date().toISOString(),
      };
    });

    if (rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("shopify_orders") as any)
        .upsert(rows, { onConflict: "integration_id,shopify_order_id" });
      if (error) throw new ShopifyApiError(`Upsert orders failed: ${error.message}`);
      synced += rows.length;
    }

    if (!res.orders.pageInfo.hasNextPage) break;
    cursor = res.orders.pageInfo.endCursor;
  }

  return { synced, lastCreatedAt };
}

// ── Sync Products ────────────────────────────────────────────────
interface ProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string | null;
  vendor: string | null;
  status: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  totalInventory: number | null;
  priceRangeV2: {
    minVariantPrice: { amount: string };
    maxVariantPrice: { amount: string };
  };
  featuredImage: { url: string; altText: string | null } | null;
  images: Connection<{ url: string; altText: string | null }>;
  variants: Connection<{
    id: string; title: string; sku: string | null;
    price: string; compareAtPrice: string | null;
    inventoryQuantity: number; position: number;
  }>;
}

export async function syncProducts(
  integration: DecryptedIntegration,
  options: { since?: string | null; maxPages?: number } = {},
): Promise<{ synced: number }> {
  const client = new ShopifyClient(integration);
  const supabase = createAdminClient();
  let cursor: string | null = null;
  let synced = 0;
  const maxPages = options.maxPages ?? 200;
  const query = options.since ? `updated_at:>='${options.since}'` : undefined;

  for (let page = 0; page < maxPages; page++) {
    const res: { products: Connection<ProductNode> } = await client.request(QUERY_PRODUCTS, {
      first: PAGE_SIZE,
      after: cursor,
      query,
    });

    const rows = res.products.edges.map(({ node }) => ({
      integration_id: integration.id,
      shopify_product_id: shopifyGidToId(node.id),
      title: node.title,
      handle: node.handle,
      description: node.description,
      product_type: node.productType,
      vendor: node.vendor,
      status: node.status,
      tags: node.tags ?? [],
      variants: node.variants.edges.map(({ node: v }) => ({
        id: shopifyGidToId(v.id),
        title: v.title,
        sku: v.sku,
        price: n(v.price) ?? 0,
        compare_at_price: n(v.compareAtPrice),
        inventory_quantity: v.inventoryQuantity ?? 0,
        inventory_management: null,
        position: v.position,
      })),
      images: node.images.edges.map(({ node: i }) => ({ url: i.url, alt: i.altText })),
      featured_image_url: node.featuredImage?.url ?? null,
      price_min: n(node.priceRangeV2?.minVariantPrice?.amount),
      price_max: n(node.priceRangeV2?.maxVariantPrice?.amount),
      total_inventory: node.totalInventory,
      created_at: node.createdAt,
      updated_at: node.updatedAt,
      published_at: node.publishedAt,
      synced_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("shopify_products") as any)
        .upsert(rows, { onConflict: "integration_id,shopify_product_id" });
      if (error) throw new ShopifyApiError(`Upsert products failed: ${error.message}`);
      synced += rows.length;
    }

    if (!res.products.pageInfo.hasNextPage) break;
    cursor = res.products.pageInfo.endCursor;
  }
  return { synced };
}

// ── Sync Customers ───────────────────────────────────────────────
interface CustomerNode {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  numberOfOrders: string;
  amountSpent: { amount: string; currencyCode: string };
  tags: string[];
  emailMarketingConsent: { marketingState: string } | null;
  createdAt: string;
  updatedAt: string;
  defaultAddress: unknown;
  addresses: unknown[];
}

export async function syncCustomers(
  integration: DecryptedIntegration,
  options: { since?: string | null; maxPages?: number } = {},
): Promise<{ synced: number }> {
  const client = new ShopifyClient(integration);
  const supabase = createAdminClient();
  let cursor: string | null = null;
  let synced = 0;
  const maxPages = options.maxPages ?? 200;
  const query = options.since ? `updated_at:>='${options.since}'` : undefined;

  for (let page = 0; page < maxPages; page++) {
    const res: { customers: Connection<CustomerNode> } = await client.request(QUERY_CUSTOMERS, {
      first: PAGE_SIZE,
      after: cursor,
      query,
    });

    const rows = res.customers.edges.map(({ node }) => ({
      integration_id: integration.id,
      shopify_customer_id: shopifyGidToId(node.id),
      email: node.email,
      first_name: node.firstName,
      last_name: node.lastName,
      phone: node.phone,
      orders_count: parseInt(node.numberOfOrders ?? "0", 10),
      total_spent: n(node.amountSpent?.amount) ?? 0,
      currency: node.amountSpent?.currencyCode ?? "EUR",
      accepts_marketing: node.emailMarketingConsent?.marketingState === "SUBSCRIBED",
      addresses: node.addresses ?? [],
      default_address: node.defaultAddress ?? null,
      tags: node.tags ?? [],
      created_at: node.createdAt,
      updated_at: node.updatedAt,
      synced_at: new Date().toISOString(),
    }));

    if (rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("shopify_customers") as any)
        .upsert(rows, { onConflict: "integration_id,shopify_customer_id" });
      if (error) throw new ShopifyApiError(`Upsert customers failed: ${error.message}`);
      synced += rows.length;
    }

    if (!res.customers.pageInfo.hasNextPage) break;
    cursor = res.customers.pageInfo.endCursor;
  }
  return { synced };
}

// ── Sync Analytics (ShopifyQL) ───────────────────────────────────
interface ShopifyQLTableResponse {
  __typename: "TableResponse";
  tableData: { columns: { name: string; dataType: string }[]; rowData: (string | number | null)[][] };
}
interface ShopifyQLParseError { __typename: "ParseError"; code: string; message: string }
type ShopifyQLResult = ShopifyQLTableResponse | ShopifyQLParseError;

export async function syncAnalytics(
  integration: DecryptedIntegration,
  options: { since?: string; until?: string } = {},
): Promise<{ synced: number }> {
  const client = new ShopifyClient(integration);
  const supabase = createAdminClient();

  const since = options.since ?? thirtyDaysAgo();
  const until = options.until ?? todayIso();
  const ql = `
    FROM sales
    SHOW gross_sales, discounts, returns, net_sales, shipping_charges, taxes,
         total_sales, orders, ordered_item_quantity,
         returning_customers, new_customers, total_customers,
         returning_customer_rate, average_order_value
    GROUP BY day
    SINCE '${since}'
    UNTIL '${until}'
  `.trim();

  const res: { shopifyqlQuery: ShopifyQLResult } = await client.request(QUERY_SHOPIFYQL, {
    query: ql,
  });

  if (res.shopifyqlQuery.__typename === "ParseError") {
    throw new ShopifyApiError(`ShopifyQL error: ${res.shopifyqlQuery.message}`);
  }

  const { columns, rowData } = res.shopifyqlQuery.tableData;
  const idx: Record<string, number> = {};
  columns.forEach((c, i) => { idx[c.name] = i; });

  const rows = rowData.map((row) => ({
    integration_id: integration.id,
    date: String(row[idx["day"] ?? 0]),
    gross_sales: Number(row[idx["gross_sales"]] ?? 0),
    discounts: Number(row[idx["discounts"]] ?? 0),
    returns: Number(row[idx["returns"]] ?? 0),
    net_sales: Number(row[idx["net_sales"]] ?? 0),
    shipping_charges: Number(row[idx["shipping_charges"]] ?? 0),
    taxes: Number(row[idx["taxes"]] ?? 0),
    total_sales: Number(row[idx["total_sales"]] ?? 0),
    orders: Number(row[idx["orders"]] ?? 0),
    returning_customers: Number(row[idx["returning_customers"]] ?? 0),
    new_customers: Number(row[idx["new_customers"]] ?? 0),
    total_customers: Number(row[idx["total_customers"]] ?? 0),
    returning_customer_rate: row[idx["returning_customer_rate"]] != null
      ? Number(row[idx["returning_customer_rate"]]) : null,
    average_order_value: row[idx["average_order_value"]] != null
      ? Number(row[idx["average_order_value"]]) : null,
    units_sold: Number(row[idx["ordered_item_quantity"]] ?? 0),
    synced_at: new Date().toISOString(),
  }));

  if (rows.length === 0) return { synced: 0 };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("shopify_analytics_daily") as any)
    .upsert(rows, { onConflict: "integration_id,date" });
  if (error) throw new ShopifyApiError(`Upsert analytics failed: ${error.message}`);
  return { synced: rows.length };
}

// ── Sync Sessions (ShopifyQL) ────────────────────────────────────
export async function syncSessions(
  integration: DecryptedIntegration,
  options: { since?: string; until?: string } = {},
): Promise<{ synced: number }> {
  const client = new ShopifyClient(integration);
  const supabase = createAdminClient();
  const since = options.since ?? thirtyDaysAgo();
  const until = options.until ?? todayIso();
  const ql = `
    FROM sessions
    SHOW sessions, online_store_visitors,
         sessions_with_cart_additions,
         sessions_that_reached_checkout,
         sessions_that_completed_checkout
    GROUP BY day
    SINCE '${since}'
    UNTIL '${until}'
  `.trim();

  const res: { shopifyqlQuery: ShopifyQLResult } = await client.request(QUERY_SHOPIFYQL, {
    query: ql,
  });

  if (res.shopifyqlQuery.__typename === "ParseError") {
    throw new ShopifyApiError(`ShopifyQL sessions error: ${res.shopifyqlQuery.message}`);
  }

  const { columns, rowData } = res.shopifyqlQuery.tableData;
  const idx: Record<string, number> = {};
  columns.forEach((c, i) => { idx[c.name] = i; });

  const rows = rowData.map((row) => ({
    integration_id: integration.id,
    date: String(row[idx["day"] ?? 0]),
    sessions: Number(row[idx["sessions"]] ?? 0),
    online_store_visitors: Number(row[idx["online_store_visitors"]] ?? 0),
    sessions_with_cart_additions: Number(row[idx["sessions_with_cart_additions"]] ?? 0),
    sessions_that_reached_checkout: Number(row[idx["sessions_that_reached_checkout"]] ?? 0),
    sessions_that_completed_checkout: Number(row[idx["sessions_that_completed_checkout"]] ?? 0),
    sessions_by_device: {},
    sessions_by_country: {},
    sessions_by_referrer: {},
    sessions_by_landing_page: {},
    synced_at: new Date().toISOString(),
  }));

  if (rows.length === 0) return { synced: 0 };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("shopify_sessions_daily") as any)
    .upsert(rows, { onConflict: "integration_id,date" });
  if (error) throw new ShopifyApiError(`Upsert sessions failed: ${error.message}`);
  return { synced: rows.length };
}

// ── Initial Full Sync ────────────────────────────────────────────
export async function initialFullSync(
  integration: DecryptedIntegration,
): Promise<{ orders: number; products: number; customers: number; analytics: number; sessions: number }> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("shopify_sync_state") as any).upsert({
    integration_id: integration.id,
    initial_sync_started_at: now,
    initial_sync_completed: false,
    initial_sync_progress: {},
  });

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();

  const orders = await syncOrders(integration, { since: ninetyDaysAgo });
  await updateProgress(integration.id, "orders", orders.synced);

  const products = await syncProducts(integration);
  await updateProgress(integration.id, "products", products.synced);

  const customers = await syncCustomers(integration);
  await updateProgress(integration.id, "customers", customers.synced);

  let analyticsSynced = 0;
  try {
    const r = await syncAnalytics(integration);
    analyticsSynced = r.synced;
    await updateProgress(integration.id, "analytics", analyticsSynced);
  } catch (e) {
    console.warn(`[ecom] analytics sync skipped: ${(e as Error).message}`);
  }

  let sessionsSynced = 0;
  try {
    const r = await syncSessions(integration);
    sessionsSynced = r.synced;
  } catch (e) {
    console.warn(`[ecom] sessions sync skipped: ${(e as Error).message}`);
  }

  try {
    await matchPixelAttributionForUser(integration.user_id);
  } catch (e) {
    console.warn(`[ecom] pixel matching skipped: ${(e as Error).message}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("shopify_sync_state") as any).update({
    initial_sync_completed: true,
    initial_sync_completed_at: new Date().toISOString(),
    last_orders_sync_at: new Date().toISOString(),
    last_products_sync_at: new Date().toISOString(),
    last_customers_sync_at: new Date().toISOString(),
    last_analytics_sync_at: new Date().toISOString(),
    last_sessions_sync_at: new Date().toISOString(),
  }).eq("integration_id", integration.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("integrations") as any)
    .update({ last_sync_at: new Date().toISOString(), status: "active" })
    .eq("id", integration.id);

  return {
    orders: orders.synced,
    products: products.synced,
    customers: customers.synced,
    analytics: analyticsSynced,
    sessions: sessionsSynced,
  };
}

// ── Delta Sync (incremental) ─────────────────────────────────────
export async function deltaSync(integration: DecryptedIntegration): Promise<void> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: state } = await (supabase.from("shopify_sync_state") as any)
    .select("*")
    .eq("integration_id", integration.id)
    .maybeSingle();

  const lastOrders = state?.last_orders_sync_at ?? null;
  const lastProducts = state?.last_products_sync_at ?? null;
  const lastCustomers = state?.last_customers_sync_at ?? null;

  try {
    await syncOrders(integration, { since: lastOrders });
    await syncProducts(integration, { since: lastProducts });
    await syncCustomers(integration, { since: lastCustomers });
    try { await syncAnalytics(integration); } catch (e) { console.warn("analytics:", (e as Error).message); }
    try { await syncSessions(integration); } catch (e) { console.warn("sessions:", (e as Error).message); }
    // Matching pixel first-party (jamais bloquant pour la sync).
    try { await matchPixelAttributionForUser(integration.user_id); } catch (e) { console.warn("pixel:", (e as Error).message); }

    const now = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("shopify_sync_state") as any).upsert({
      integration_id: integration.id,
      last_orders_sync_at: now,
      last_products_sync_at: now,
      last_customers_sync_at: now,
      last_analytics_sync_at: now,
      last_sessions_sync_at: now,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("integrations") as any)
      .update({ last_sync_at: now, last_error: null })
      .eq("id", integration.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("integrations") as any)
      .update({ last_error: message, status: "error" })
      .eq("id", integration.id);
    throw err;
  }
}

async function updateProgress(integrationId: string, entity: string, synced: number) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("shopify_sync_state") as any)
    .select("initial_sync_progress")
    .eq("integration_id", integrationId)
    .maybeSingle();
  const progress = (data?.initial_sync_progress as Record<string, unknown>) ?? {};
  progress[entity] = { synced, completed: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("shopify_sync_state") as any)
    .update({ initial_sync_progress: progress })
    .eq("integration_id", integrationId);
}

function thirtyDaysAgo(): string {
  return new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
