import type { Product, Order, Client, ClientDetail, ClientNote, ClientEvent } from "@/types";
import type { ProductRow, OrderRecord, ClientRecord } from "@/types/database";

/**
 * Convert a DB product row to the frontend Product type.
 */
export function dbToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    priceCents: Number(row.price_cents),
    status: row.status,
    sales: row.sales_count,
    category: row.category,
    type: row.type,
    slug: row.slug || row.id,
    shortDescription: row.short_description || row.description,
    longDescription: row.long_description ?? undefined,
    features: row.features ?? undefined,
    deliveryTimeDays: row.delivery_time_days ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? row.image_url ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    featured: row.is_featured,
    mode: row.mode ?? "checkout",
    deliveryType: row.delivery_type ?? "none",
    deliveryFileUrl: row.delivery_file_path ?? undefined,
    deliveryUrl: row.delivery_url ?? undefined,
    ctaLabel: row.cta_label ?? "Acheter",
    stripePriceId: row.stripe_price_id ?? undefined,
  };
}

/**
 * Convert a DB order row (with joined client + product) to the frontend Order type.
 */
export function orderRecordToOrder(
  row: OrderRecord & {
    clients?: { name: string; email: string; phone?: string | null } | null;
    products?: { name: string } | null;
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
    product: row.products?.name ?? row.title,
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
    resources: Array.isArray((row as any).resources) ? (row as any).resources : [],
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
