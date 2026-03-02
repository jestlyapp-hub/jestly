export type OrderStatus = "pending" | "in_progress" | "delivered" | "cancelled";
export type InvoiceStatus = "paid" | "pending" | "overdue";
export type SubscriptionStatus = "active" | "cancelled" | "paused";

export interface Order {
  id: string;
  client: string;
  clientEmail: string;
  product: string;
  price: number;
  status: OrderStatus;
  date: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  totalRevenue: number;
  ordersCount: number;
  lastOrder: string;
  avatar: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
  sales: number;
  category: string;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
}

export interface Subscription {
  id: string;
  client: string;
  plan: string;
  amount: number;
  status: SubscriptionStatus;
  startDate: string;
  nextBilling: string;
}

export interface Activity {
  id: number;
  type: string;
  message: string;
  time: string;
}
