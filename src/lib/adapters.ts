import type { Product, Order, Client } from "@/types";
import type { Service, OrderRecord, ClientRecord } from "@/types/database";

/**
 * Convert a DB service row to the frontend Product type.
 */
export function serviceToProduct(row: Service): Product {
  return {
    id: row.id,
    name: row.title,
    price: Number(row.price),
    active: row.is_active,
    sales: row.sales_count,
    category: row.category,
    type: row.type === "formation" ? "service" : (row.type as Product["type"]),
    slug: row.slug || row.id,
    shortDescription: row.short_description || row.description,
    longDescription: row.long_description ?? undefined,
    features: row.features ?? undefined,
    deliveryTimeDays: row.delivery_time_days ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? row.image_url ?? undefined,
    featured: row.is_featured,
  };
}

/**
 * Convert a DB order row (with joined client + service) to the frontend Order type.
 */
export function orderRecordToOrder(
  row: OrderRecord & {
    clients?: { name: string; email: string } | null;
    services?: { title: string } | null;
  }
): Order {
  return {
    id: row.id,
    client: row.clients?.name ?? "Client inconnu",
    clientEmail: row.clients?.email ?? "",
    product: row.services?.title ?? row.title,
    price: Number(row.amount),
    status: row.status === "new" ? "pending" : (row.status as Order["status"]),
    date: row.created_at.split("T")[0],
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
