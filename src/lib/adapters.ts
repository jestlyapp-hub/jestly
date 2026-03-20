import type { Product, Order, Client, ClientDetail, ClientNote, ClientEvent } from "@/types";
import type { ProductRow, OrderRecord, ClientRecord } from "@/types/database";
import { normalizeResources } from "@/lib/brief-column-compat";

/**
 * Convert a DB product row to the frontend Product type.
 */
export function dbToProduct(row: ProductRow): Product {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = row as any; // Row may come from old "services" type or new "products" table
  return {
    id: r.id,
    // Post-migration 017: name (new) with title fallback (old)
    name: r.name ?? r.title ?? "",
    // Post-migration 017: price_cents (new) with price fallback (old, in euros)
    priceCents: r.price_cents != null
      ? Number(r.price_cents)
      : Math.round(parseFloat(String(r.price ?? 0).replace(/[€\s]/g, "").replace(",", ".")) * 100) || 0,
    // Post-migration 017: status enum (new) with is_active fallback (old)
    status: r.status && r.status !== "true" && r.status !== "false"
      ? r.status
      : (r.is_active ? "active" : "draft"),
    sales: r.sales_count ?? 0,
    category: r.category ?? "",
    type: r.type ?? "service",
    slug: r.slug || r.id,
    shortDescription: r.short_description || r.description || "",
    longDescription: r.long_description ?? undefined,
    features: r.features ?? undefined,
    deliveryTimeDays: r.delivery_time_days ?? undefined,
    thumbnailUrl: r.thumbnail_url ?? r.image_url ?? undefined,
    coverImageUrl: r.cover_image_url ?? undefined,
    featured: r.is_featured ?? false,
    // Post-migration 017: mode (new) with checkout_mode fallback (old)
    mode: r.mode ?? r.checkout_mode ?? "checkout",
    deliveryType: r.delivery_type ?? "none",
    deliveryFileUrl: r.delivery_file_path ?? undefined,
    deliveryUrl: r.delivery_url ?? undefined,
    ctaLabel: r.cta_label ?? "Acheter",
    stripePriceId: r.stripe_price_id ?? undefined,
  };
}

/**
 * Convert a DB order row (with joined client + product) to the frontend Order type.
 */
export function orderRecordToOrder(
  row: OrderRecord & {
    clients?: { name: string; email: string; phone?: string | null } | null;
    products?: { name: string; price_cents?: number } | null;
    services?: { title: string } | null; // Legacy fallback
  }
): Order {
  // Parse checklist safely
  let checklist: { id: string; label: string; done: boolean }[] = [];
  if (Array.isArray(row.checklist)) {
    checklist = row.checklist as typeof checklist;
  }

  return {
    id: row.id,
    client: row.clients?.name ?? "Client inconnu",
    clientEmail: row.clients?.email ?? "",
    clientId: row.client_id,
    clientPhone: row.clients?.phone ?? undefined,
    product: row.products?.name ?? row.services?.title ?? row.title,
    price: Number(row.amount),
    status: row.status as Order["status"],
    date: row.created_at.split("T")[0],
    priority: row.priority,
    deadline: row.deadline ?? undefined,
    paid: row.paid,
    tags: row.tags ?? [],
    checklist,
    notes: row.notes ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    briefing: (row as any).briefing ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resources: normalizeResources((row as any).resources),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: (row as any).category ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    externalRef: (row as any).external_ref ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupId: (row as any).group_id ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupIndex: (row as any).group_index ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupTotal: (row as any).group_total ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    statusId: (row as any).status_id ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customFields: (row as any).custom_fields ?? {},
  };
}

/**
 * Convert a DB client row to the frontend Client type.
 */
export function clientRecordToClient(
  row: ClientRecord & { orders_count?: number }
): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    totalRevenue: Number(row.total_revenue),
    ordersCount: row.orders_count ?? 0,
    lastOrder: row.updated_at.split("T")[0],
    avatar: row.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
  };
}

/**
 * Convert a DB client row (enriched) to the frontend ClientDetail type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function clientDetailFromRecord(row: any): ClientDetail {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    company: row.company ?? null,
    website: row.website ?? null,
    tags: row.tags ?? [],
    notes: row.notes ?? null,
    totalRevenue: Number(row.total_revenue ?? 0),
    ordersCount: row.orders_count ?? 0,
    status: row.status ?? "active",
    source: row.source ?? null,
    lastOrderAt: row.last_order_at ?? null,
    createdAt: row.created_at,
    avatar: (row.name || "?")
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
  };
}

/**
 * Convert a DB client_notes row to the frontend ClientNote type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function clientNoteFromRecord(row: any): ClientNote {
  return {
    id: row.id,
    clientId: row.client_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert a DB client_events row to the frontend ClientEvent type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function clientEventFromRecord(row: any): ClientEvent {
  return {
    id: row.id,
    clientId: row.client_id,
    type: row.type,
    payload: row.payload ?? {},
    createdAt: row.created_at,
  };
}
