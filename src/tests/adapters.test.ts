import { describe, it, expect } from "vitest";
import {
  dbToProduct,
  orderRecordToOrder,
  clientRecordToClient,
  clientDetailFromRecord,
  clientNoteFromRecord,
  clientEventFromRecord,
} from "@/lib/adapters";

// Mock the brief-column-compat dependency
vi.mock("@/lib/brief-column-compat", () => ({
  normalizeResources: (r: unknown) => r ?? [],
}));

describe("dbToProduct", () => {
  it("converts a modern product row", () => {
    const row = {
      id: "p1",
      name: "Logo Design",
      price_cents: 5000,
      status: "active",
      sales_count: 3,
      category: "design",
      type: "service",
      slug: "logo-design",
      short_description: "Un logo sur mesure",
      is_featured: true,
      mode: "checkout",
      delivery_type: "none",
      cta_label: "Commander",
    };
    const product = dbToProduct(row as any);
    expect(product.id).toBe("p1");
    expect(product.name).toBe("Logo Design");
    expect(product.priceCents).toBe(5000);
    expect(product.status).toBe("active");
    expect(product.sales).toBe(3);
    expect(product.featured).toBe(true);
    expect(product.slug).toBe("logo-design");
  });

  it("falls back to legacy fields (title, price, is_active)", () => {
    const row = {
      id: "p2",
      title: "Old Service",
      price: "99,50 €",
      is_active: false,
      slug: "old-service",
    };
    const product = dbToProduct(row as any);
    expect(product.name).toBe("Old Service");
    expect(product.priceCents).toBe(9950);
    expect(product.status).toBe("draft");
  });

  it("handles missing optional fields gracefully", () => {
    const row = { id: "p3" };
    const product = dbToProduct(row as any);
    expect(product.id).toBe("p3");
    expect(product.name).toBe("");
    expect(product.priceCents).toBe(0);
    expect(product.shortDescription).toBe("");
  });
});

describe("orderRecordToOrder", () => {
  it("converts a full order record with joins", () => {
    const row = {
      id: "o1",
      client_id: "c1",
      amount: 150,
      status: "paid",
      created_at: "2026-03-10T12:00:00Z",
      priority: "high",
      deadline: "2026-04-01",
      paid: true,
      tags: ["urgent"],
      checklist: [{ id: "1", label: "Étape 1", done: true }],
      notes: "Notes test",
      title: "Commande logo",
      clients: { name: "Alice", email: "alice@test.fr", phone: "0612345678" },
      products: { name: "Logo Premium", price_cents: 15000 },
    };
    const order = orderRecordToOrder(row as any);
    expect(order.id).toBe("o1");
    expect(order.client).toBe("Alice");
    expect(order.clientEmail).toBe("alice@test.fr");
    expect(order.product).toBe("Logo Premium");
    expect(order.price).toBe(150);
    expect(order.status).toBe("paid");
    expect(order.tags).toEqual(["urgent"]);
    expect(order.checklist).toHaveLength(1);
  });

  it("falls back to 'Client inconnu' when no client joined", () => {
    const row = {
      id: "o2",
      client_id: "c2",
      amount: 50,
      status: "new",
      created_at: "2026-03-01T00:00:00Z",
      priority: "normal",
      paid: false,
      tags: [],
      checklist: null,
      title: "Test",
    };
    const order = orderRecordToOrder(row as any);
    expect(order.client).toBe("Client inconnu");
    expect(order.clientEmail).toBe("");
  });
});

describe("clientRecordToClient", () => {
  it("converts a client record with avatar initials", () => {
    const row = {
      id: "c1",
      name: "Marie Dupont",
      email: "marie@test.fr",
      total_revenue: "2500",
      orders_count: 5,
      updated_at: "2026-03-15T10:00:00Z",
    };
    const client = clientRecordToClient(row as any);
    expect(client.id).toBe("c1");
    expect(client.name).toBe("Marie Dupont");
    expect(client.totalRevenue).toBe(2500);
    expect(client.ordersCount).toBe(5);
    expect(client.avatar).toBe("MD");
    expect(client.lastOrder).toBe("2026-03-15");
  });
});

describe("clientDetailFromRecord", () => {
  it("converts an enriched client record", () => {
    const row = {
      id: "c1",
      name: "Jean Martin",
      email: "jean@test.fr",
      phone: "+33612345678",
      company: "Studio Jean",
      website: "https://jean.fr",
      tags: ["vip"],
      notes: "Client fidèle",
      total_revenue: 5000,
      orders_count: 10,
      status: "active",
      source: "website",
      last_order_at: "2026-03-10",
      created_at: "2025-01-01T00:00:00Z",
    };
    const detail = clientDetailFromRecord(row);
    expect(detail.id).toBe("c1");
    expect(detail.company).toBe("Studio Jean");
    expect(detail.tags).toEqual(["vip"]);
    expect(detail.avatar).toBe("JM");
    expect(detail.totalRevenue).toBe(5000);
  });
});

describe("clientNoteFromRecord", () => {
  it("converts a note record", () => {
    const row = {
      id: "n1",
      client_id: "c1",
      content: "Rappeler lundi",
      created_at: "2026-03-15T12:00:00Z",
      updated_at: "2026-03-15T12:00:00Z",
    };
    const note = clientNoteFromRecord(row);
    expect(note.id).toBe("n1");
    expect(note.content).toBe("Rappeler lundi");
  });
});

describe("clientEventFromRecord", () => {
  it("converts an event record", () => {
    const row = {
      id: "e1",
      client_id: "c1",
      type: "order_created",
      payload: { orderId: "o1" },
      created_at: "2026-03-15T12:00:00Z",
    };
    const event = clientEventFromRecord(row);
    expect(event.type).toBe("order_created");
    expect(event.payload).toEqual({ orderId: "o1" });
  });
});
