import type {
  Order,
  Client,
  Product,
  Invoice,
  Subscription,
  Activity,
} from "@/types";

export const orders: Order[] = [
  { id: "CMD-001", client: "Marie Dupont", clientEmail: "marie@studio.fr", product: "Logo redesign", price: 450, status: "in_progress", date: "2025-03-15" },
  { id: "CMD-002", client: "Lucas Martin", clientEmail: "lucas@agency.com", product: "Motion intro YouTube", price: 280, status: "delivered", date: "2025-03-14" },
  { id: "CMD-003", client: "Sophie Bernard", clientEmail: "sophie@freelance.fr", product: "Pack reseaux sociaux", price: 150, status: "pending", date: "2025-03-13" },
  { id: "CMD-004", client: "Thomas Petit", clientEmail: "thomas@startup.io", product: "Montage podcast #12", price: 120, status: "delivered", date: "2025-03-12" },
  { id: "CMD-005", client: "Emma Leroy", clientEmail: "emma@brand.co", product: "Identite visuelle", price: 890, status: "in_progress", date: "2025-03-11" },
  { id: "CMD-006", client: "Hugo Moreau", clientEmail: "hugo@media.fr", product: "Thumbnail YouTube x10", price: 200, status: "pending", date: "2025-03-10" },
  { id: "CMD-007", client: "Lea Fournier", clientEmail: "lea@design.com", product: "Template Notion", price: 49, status: "cancelled", date: "2025-03-09" },
  { id: "CMD-008", client: "Marie Dupont", clientEmail: "marie@studio.fr", product: "Charte graphique", price: 680, status: "delivered", date: "2025-03-08" },
];

export const clients: Client[] = [
  { id: "CLI-001", name: "Marie Dupont", email: "marie@studio.fr", totalRevenue: 2340, ordersCount: 5, lastOrder: "2025-03-15", avatar: "MD" },
  { id: "CLI-002", name: "Lucas Martin", email: "lucas@agency.com", totalRevenue: 1680, ordersCount: 3, lastOrder: "2025-03-14", avatar: "LM" },
  { id: "CLI-003", name: "Sophie Bernard", email: "sophie@freelance.fr", totalRevenue: 890, ordersCount: 2, lastOrder: "2025-03-13", avatar: "SB" },
  { id: "CLI-004", name: "Thomas Petit", email: "thomas@startup.io", totalRevenue: 1240, ordersCount: 4, lastOrder: "2025-03-12", avatar: "TP" },
  { id: "CLI-005", name: "Emma Leroy", email: "emma@brand.co", totalRevenue: 2890, ordersCount: 6, lastOrder: "2025-03-11", avatar: "EL" },
  { id: "CLI-006", name: "Hugo Moreau", email: "hugo@media.fr", totalRevenue: 600, ordersCount: 2, lastOrder: "2025-03-10", avatar: "HM" },
];

export const products: Product[] = [
  { id: "PRD-001", name: "Logo redesign", price: 450, active: true, sales: 12, category: "Design" },
  { id: "PRD-002", name: "Motion intro YouTube", price: 280, active: true, sales: 8, category: "Motion" },
  { id: "PRD-003", name: "Pack reseaux sociaux", price: 150, active: true, sales: 23, category: "Design" },
  { id: "PRD-004", name: "Montage podcast", price: 120, active: true, sales: 15, category: "Montage" },
  { id: "PRD-005", name: "Identite visuelle", price: 890, active: false, sales: 4, category: "Design" },
  { id: "PRD-006", name: "Thumbnail YouTube x10", price: 200, active: true, sales: 31, category: "Design" },
  { id: "PRD-007", name: "Template Notion", price: 49, active: true, sales: 67, category: "Digital" },
];

export const invoices: Invoice[] = [
  { id: "FAC-001", number: "FAC-2025-047", client: "Marie Dupont", amount: 450, status: "paid", date: "2025-03-15" },
  { id: "FAC-002", number: "FAC-2025-046", client: "Lucas Martin", amount: 280, status: "paid", date: "2025-03-14" },
  { id: "FAC-003", number: "FAC-2025-045", client: "Sophie Bernard", amount: 150, status: "pending", date: "2025-03-13" },
  { id: "FAC-004", number: "FAC-2025-044", client: "Thomas Petit", amount: 120, status: "paid", date: "2025-03-12" },
  { id: "FAC-005", number: "FAC-2025-043", client: "Emma Leroy", amount: 890, status: "overdue", date: "2025-03-11" },
  { id: "FAC-006", number: "FAC-2025-042", client: "Hugo Moreau", amount: 200, status: "pending", date: "2025-03-10" },
];

export const subscriptions: Subscription[] = [
  { id: "SUB-001", client: "Marie Dupont", plan: "Pack mensuel Design", amount: 199, status: "active", startDate: "2025-01-15", nextBilling: "2025-04-15" },
  { id: "SUB-002", client: "Lucas Martin", plan: "Montage hebdo", amount: 349, status: "active", startDate: "2025-02-01", nextBilling: "2025-04-01" },
  { id: "SUB-003", client: "Sophie Bernard", plan: "CM reseaux sociaux", amount: 249, status: "active", startDate: "2024-11-10", nextBilling: "2025-04-10" },
  { id: "SUB-004", client: "Thomas Petit", plan: "Podcast mensuel", amount: 120, status: "cancelled", startDate: "2024-09-01", nextBilling: "-" },
];

export const revenueData = [
  { month: "Oct", revenue: 2400 },
  { month: "Nov", revenue: 3200 },
  { month: "Dec", revenue: 2800 },
  { month: "Jan", revenue: 3600 },
  { month: "Fev", revenue: 4100 },
  { month: "Mars", revenue: 3900 },
];

export const ordersChartData = [
  { month: "Oct", orders: 18 },
  { month: "Nov", orders: 24 },
  { month: "Dec", orders: 21 },
  { month: "Jan", orders: 28 },
  { month: "Fev", orders: 32 },
  { month: "Mars", orders: 29 },
];

export const activities: Activity[] = [
  { id: 1, type: "order", message: "Nouvelle commande de Marie Dupont", time: "il y a 2h" },
  { id: 2, type: "payment", message: "Paiement recu — 280 \u20ac", time: "il y a 4h" },
  { id: 3, type: "client", message: "Nouveau client : Hugo Moreau", time: "il y a 6h" },
  { id: 4, type: "delivery", message: "Commande CMD-004 livree", time: "hier" },
  { id: 5, type: "invoice", message: "Facture FAC-2025-047 payee", time: "hier" },
];
