import { clients, orders, invoices, products } from "@/lib/mock-data";

/* ─── Types ─── */

export interface SearchResult {
  id: string;
  type: "client" | "order" | "task" | "invoice" | "product";
  title: string;
  subtitle?: string;
  status?: string;
  date?: string;
  amount?: number;
  href: string;
}

import { MOCK_TASKS } from "@/lib/tasks-utils";

/* ─── Status labels FR ─── */

export const statusLabels: Record<string, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  validated: "Valide",
  paid: "Paye",
  cancelled: "Annule",
  pending: "En attente",
  overdue: "En retard",
  active: "Actif",
  todo: "A faire",
  done: "Termine",
  delivered: "Livre",
};

/* ─── Entity type config ─── */

export const entityConfig: Record<
  SearchResult["type"],
  { label: string; color: string; bgColor: string }
> = {
  client: { label: "Client", color: "#2563EB", bgColor: "#EFF6FF" },
  order: { label: "Commande", color: "#4F46E5", bgColor: "#EEF2FF" },
  task: { label: "Tache", color: "#7C3AED", bgColor: "#F5F3FF" },
  invoice: { label: "Facture", color: "#16A34A", bgColor: "#F0FDF4" },
  product: { label: "Produit", color: "#EA580C", bgColor: "#FFF7ED" },
};

/* ─── Search mock data locally ─── */

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function searchMockData(query: string): SearchResult[] {
  const q = normalize(query);
  if (!q || q.length < 2) return [];

  const results: SearchResult[] = [];

  // Clients
  for (const c of clients) {
    if (normalize(c.name).includes(q) || normalize(c.email).includes(q)) {
      results.push({
        id: c.id,
        type: "client",
        title: c.name,
        subtitle: c.email,
        amount: c.totalRevenue,
        href: "/clients",
      });
    }
  }

  // Orders
  for (const o of orders) {
    if (
      normalize(o.client).includes(q) ||
      normalize(o.product).includes(q) ||
      normalize(o.id).includes(q)
    ) {
      results.push({
        id: o.id,
        type: "order",
        title: `${o.id} - ${o.product}`,
        subtitle: o.client,
        status: o.status,
        date: o.date,
        amount: o.price,
        href: "/commandes",
      });
    }
  }

  // Invoices
  for (const inv of invoices) {
    if (
      normalize(inv.client).includes(q) ||
      normalize(inv.number).includes(q) ||
      normalize(inv.id).includes(q)
    ) {
      results.push({
        id: inv.id,
        type: "invoice",
        title: inv.number,
        subtitle: inv.client,
        status: inv.status,
        date: inv.date,
        amount: inv.amount,
        href: "/facturation",
      });
    }
  }

  // Products
  for (const p of products) {
    if (
      normalize(p.name).includes(q) ||
      (p.category && normalize(p.category).includes(q))
    ) {
      results.push({
        id: p.id,
        type: "product",
        title: p.name,
        subtitle: `${(p.priceCents / 100).toFixed(0)} EUR`,
        amount: p.priceCents / 100,
        href: "/produits",
      });
    }
  }

  // Tasks — use the real MOCK_TASKS from tasks-utils
  for (const t of MOCK_TASKS) {
    if (
      normalize(t.title).includes(q) ||
      (t.clientName && normalize(t.clientName).includes(q)) ||
      t.tags.some((tag) => normalize(tag).includes(q))
    ) {
      results.push({
        id: t.id,
        type: "task",
        title: t.title,
        subtitle: t.clientName || (statusLabels[t.status] ?? t.status),
        status: t.status,
        date: t.dueDate,
        href: `/taches/${t.id}`,
      });
    }
  }

  return results;
}

/* ─── Quick-access items (shown when input focused, query empty) ─── */

export function getQuickAccessItems(): SearchResult[] {
  return [
    {
      id: "qa-1",
      type: "client",
      title: "Marie Dupont",
      subtitle: "marie@studio.fr",
      href: "/clients",
    },
    {
      id: "qa-2",
      type: "order",
      title: "CMD-001 - Logo redesign",
      subtitle: "Marie Dupont",
      status: "in_progress",
      href: "/commandes",
    },
    {
      id: "qa-3",
      type: "task",
      title: "Finaliser la maquette du site vitrine",
      subtitle: "En cours",
      status: "in_progress",
      href: "/taches/t1",
    },
    {
      id: "qa-4",
      type: "product",
      title: "Identite visuelle",
      subtitle: "890 EUR",
      href: "/produits",
    },
  ];
}
