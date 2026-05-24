/**
 * Types business Shopify pour Jestly Ecom V1.
 * Pas de codegen pour V1 — types maintenus à la main pour les entités utilisées.
 * GraphQL Admin API 2026-01.
 */

export type ShopifyFinancialStatus =
  | "pending" | "authorized" | "partially_paid" | "paid"
  | "partially_refunded" | "refunded" | "voided";

export type ShopifyFulfillmentStatus =
  | "fulfilled" | "partial" | "unfulfilled" | "scheduled" | "on_hold" | null;

export type ShopifyProductStatus = "ACTIVE" | "ARCHIVED" | "DRAFT";

// ── Integration record (DB row) ──────────────────────────────────
export interface IntegrationRow {
  id: string;
  user_id: string;
  provider: "shopify" | string;
  shop_domain: string;
  scopes: string[];
  webhooks_subscribed: string[];
  status: "active" | "paused" | "error" | "disconnected";
  last_sync_at: string | null;
  last_error: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Chiffrés (hex strings) — ne jamais exposer au client
  access_token_encrypted: string;
  access_token_nonce: string;
  webhook_secret_encrypted: string | null;
  webhook_secret_nonce: string | null;
}

// ── Decrypted integration (server-side only) ─────────────────────
// V1 finale : access_token n'est plus stocké (token éphémère 24h mint à la demande
// par lib/shopify/lhorlogemurale.ts). On garde le champ optionnel pour backward-compat.
export interface DecryptedIntegration {
  id: string;
  user_id: string;
  shop_domain: string;
  /** @deprecated V1 utilise client_credentials, token mint à la demande. */
  access_token?: string;
  webhook_secret?: string | null;
  scopes: string[];
  /** Override des env vars SHOPIFY_LHORLOGEMURALE_* (multi-tenant V2). */
  shop_override?: {
    shopDomain: string;
    clientId: string;
    clientSecret: string;
    apiVersion?: string;
  };
}

// ── Order (cached) ───────────────────────────────────────────────
export interface ShopifyOrderCache {
  id: string;
  integration_id: string;
  shopify_order_id: string;
  order_number: string | null;
  name: string | null;
  total_price: number | null;
  subtotal_price: number | null;
  total_tax: number | null;
  total_shipping: number | null;
  total_discounts: number | null;
  currency: string;
  financial_status: ShopifyFinancialStatus | null;
  fulfillment_status: ShopifyFulfillmentStatus;
  customer_id: string | null;
  email: string | null;
  phone: string | null;
  line_items: ShopifyLineItem[];
  shipping_address: ShopifyAddress | null;
  billing_address: ShopifyAddress | null;
  tags: string[];
  source_name: string | null;
  referring_site: string | null;
  landing_site: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  cancelled_at: string | null;
  synced_at: string;
}

export interface ShopifyLineItem {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  title: string;
  variant_title: string | null;
  quantity: number;
  price: number;
  total_discount: number;
  sku: string | null;
  vendor: string | null;
  image_url: string | null;
}

export interface ShopifyAddress {
  first_name: string | null;
  last_name: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  country_code: string | null;
  zip: string | null;
  phone: string | null;
}

// ── Product (cached) ─────────────────────────────────────────────
export interface ShopifyProductCache {
  id: string;
  integration_id: string;
  shopify_product_id: string;
  title: string;
  handle: string | null;
  description: string | null;
  product_type: string | null;
  vendor: string | null;
  status: ShopifyProductStatus | null;
  tags: string[];
  variants: ShopifyVariant[];
  images: { url: string; alt: string | null }[];
  featured_image_url: string | null;
  price_min: number | null;
  price_max: number | null;
  total_inventory: number | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  synced_at: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  inventory_quantity: number;
  inventory_management: string | null;
  position: number;
}

// ── Customer (cached) ────────────────────────────────────────────
export interface ShopifyCustomerCache {
  id: string;
  integration_id: string;
  shopify_customer_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  orders_count: number;
  total_spent: number;
  currency: string;
  accepts_marketing: boolean;
  addresses: ShopifyAddress[];
  default_address: ShopifyAddress | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  synced_at: string;
}

// ── Analytics daily ──────────────────────────────────────────────
export interface ShopifyAnalyticsDaily {
  id: string;
  integration_id: string;
  date: string; // YYYY-MM-DD
  gross_sales: number;
  discounts: number;
  returns: number;
  net_sales: number;
  shipping_charges: number;
  taxes: number;
  total_sales: number;
  orders: number;
  returning_customers: number;
  new_customers: number;
  total_customers: number;
  returning_customer_rate: number | null;
  average_order_value: number | null;
  units_sold: number;
  synced_at: string;
}

// ── Sessions daily ───────────────────────────────────────────────
export interface ShopifySessionsDaily {
  id: string;
  integration_id: string;
  date: string;
  sessions: number;
  online_store_visitors: number;
  sessions_with_cart_additions: number;
  sessions_that_reached_checkout: number;
  sessions_that_completed_checkout: number;
  sessions_by_device: Record<string, number>;
  sessions_by_country: Record<string, number>;
  sessions_by_referrer: Record<string, number>;
  sessions_by_landing_page: Record<string, number>;
  avg_session_duration: number | null;
}

// ── Sync state ───────────────────────────────────────────────────
export interface ShopifySyncState {
  integration_id: string;
  last_orders_sync_at: string | null;
  last_products_sync_at: string | null;
  last_customers_sync_at: string | null;
  last_analytics_sync_at: string | null;
  last_sessions_sync_at: string | null;
  initial_sync_completed: boolean;
  initial_sync_started_at: string | null;
  initial_sync_completed_at: string | null;
  initial_sync_progress: {
    orders?: { synced: number; total: number };
    products?: { synced: number; total: number };
    customers?: { synced: number; total: number };
    analytics?: { synced: number; total: number };
  };
  updated_at: string;
}

// ── KPI computed ─────────────────────────────────────────────────
export interface EcomKpi {
  label: string;
  value: number;
  formattedValue: string;
  previousValue?: number;
  variation?: number; // percentage
  sparklineData?: { date: string; value: number }[];
}
