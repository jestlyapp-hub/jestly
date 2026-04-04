import type { Order } from "@/types";

/* ─── Event Categories ─── */

export type EventCategory =
  | "deadline"
  | "livraison"
  | "appel"
  | "session"
  | "review"
  | "rappel"
  | "admin"
  | "contenu"
  | "personnel"
  | "tache"
  | "projet"
  | "facture";

export type EventPriority = "low" | "medium" | "high" | "urgent";

export interface CalendarEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string;          // YYYY-MM-DD
  startTime?: string;    // HH:mm
  endTime?: string;      // HH:mm
  allDay: boolean;
  notes?: string;
  priority: EventPriority;
  /** Source type */
  source: "manual" | "order" | "task" | "project" | "invoice";
  /** Custom hex color (overrides category default) */
  color?: string;
  /** FK to clients table */
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  /** If source === "order" */
  orderId?: string;
  orderStatus?: string;
  orderPrice?: number;
  productName?: string;
  /** If source === "task" */
  taskId?: string;
  taskStatus?: string;
  /** If source === "project" */
  projectId?: string;
  projectStatus?: string;
  /** If source === "invoice" */
  invoiceId?: string;
  invoiceStatus?: string;
  invoiceAmount?: number;
}

export interface CategoryConfig {
  label: string;
  bg: string;
  text: string;
  dot: string;
  border: string;
}

export const CATEGORY_CONFIG: Record<EventCategory, CategoryConfig> = {
  deadline:  { label: "Deadline",   bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500",     border: "border-red-200" },
  livraison: { label: "Livraison",  bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", border: "border-emerald-200" },
  appel:     { label: "Appel",      bg: "bg-blue-50",    text: "text-blue-600",    dot: "bg-blue-500",    border: "border-blue-200" },
  session:   { label: "Session",    bg: "bg-violet-50",  text: "text-violet-600",  dot: "bg-violet-500",  border: "border-violet-200" },
  review:    { label: "Review",     bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-500",   border: "border-amber-200" },
  rappel:    { label: "Rappel",     bg: "bg-orange-50",  text: "text-orange-600",  dot: "bg-orange-500",  border: "border-orange-200" },
  admin:     { label: "Admin",      bg: "bg-gray-100",   text: "text-gray-600",    dot: "bg-gray-500",    border: "border-gray-200" },
  contenu:   { label: "Contenu",    bg: "bg-cyan-50",    text: "text-cyan-600",    dot: "bg-cyan-500",    border: "border-cyan-200" },
  personnel: { label: "Personnel",  bg: "bg-indigo-50",  text: "text-indigo-600",  dot: "bg-indigo-500",  border: "border-indigo-200" },
  tache:     { label: "Tâche",      bg: "bg-purple-50",  text: "text-purple-600",  dot: "bg-purple-500",  border: "border-purple-200" },
  projet:    { label: "Projet",     bg: "bg-teal-50",    text: "text-teal-600",    dot: "bg-teal-500",    border: "border-teal-200" },
  facture:   { label: "Facture",    bg: "bg-pink-50",    text: "text-pink-600",    dot: "bg-pink-500",    border: "border-pink-200" },
};

export const ALL_CATEGORIES: EventCategory[] = [
  "appel", "session", "contenu", "review", "livraison", "rappel", "admin", "personnel", "deadline", "tache", "projet", "facture",
];

export const PRIORITY_CONFIG: Record<EventPriority, { label: string; color: string }> = {
  low:    { label: "Basse",   color: "#999" },
  medium: { label: "Moyenne", color: "#F59E0B" },
  high:   { label: "Haute",   color: "#EF4444" },
  urgent: { label: "Urgente", color: "#DC2626" },
};

/* ─── Solid Colors for Event Blocks ─── */

export const CATEGORY_SOLID: Record<EventCategory, string> = {
  deadline:  "#EF4444",
  livraison: "#10B981",
  appel:     "#3B82F6",
  session:   "#8B5CF6",
  review:    "#F59E0B",
  rappel:    "#F97316",
  admin:     "#64748B",
  contenu:   "#06B6D4",
  personnel: "#6366F1",
  tache:     "#9333EA",
  projet:    "#14B8A6",
  facture:   "#EC4899",
};

/** Curated palette for custom event color picker */
export const EVENT_PALETTE = [
  "#EF4444", "#F97316", "#F59E0B", "#22C55E",
  "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6",
  "#EC4899", "#64748B",
];

/** Get the display color for an event (custom color > category default) */
export function getEventDisplayColor(event: CalendarEvent): string {
  if (event.color) return event.color;
  return CATEGORY_SOLID[event.category];
}

/* ─── Order → CalendarEvent ─── */

export function orderToCalendarEvent(order: Order): CalendarEvent | null {
  if (!order.deadline) return null;
  return {
    id: `order-${order.id}`,
    title: `${order.product} — ${order.client}`,
    category: "deadline",
    date: order.deadline,
    allDay: true,
    notes: order.notes,
    priority: order.priority === "urgent" ? "urgent" : order.priority === "high" ? "high" : "medium",
    source: "order",
    orderId: order.id,
    orderStatus: order.status,
    orderPrice: order.price,
    clientName: order.client,
    clientEmail: order.clientEmail,
    productName: order.product,
  };
}

/* ─── Time Slots ─── */

export function generateTimeSlots(startHour = 7, endHour = 22): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

/* ─── Date Helpers ─── */

const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const JOURS_COURT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MOIS_COURT = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

export function formatDayName(date: Date): string {
  return JOURS[date.getDay()];
}

export function formatDayNameShort(date: Date): string {
  return JOURS_COURT[date.getDay()];
}

export function formatMonthName(date: Date): string {
  return MOIS[date.getMonth()];
}

export function formatMonthNameShort(date: Date): string {
  return MOIS_COURT[date.getMonth()];
}

export function formatDateFr(date: Date): string {
  return `${date.getDate()} ${MOIS[date.getMonth()]} ${date.getFullYear()}`;
}

export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/* ─── Week Helpers ─── */

/** Get Monday of the week containing `date` */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Return 7 dates starting from Monday */
export function getWeekDays(date: Date): Date[] {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/* ─── Month Helpers ─── */

export interface MonthDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/** Return all days to display in a month grid (padded to full weeks) */
export function getMonthDays(year: number, month: number): MonthDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const today = new Date();

  // Start from Monday of the first week
  const startDay = getMonday(firstOfMonth);

  // We need enough rows to cover the whole month
  const days: MonthDay[] = [];
  const current = new Date(startDay);

  // Generate 6 weeks maximum (42 days)
  for (let i = 0; i < 42; i++) {
    const d = new Date(current);
    days.push({
      date: d,
      isCurrentMonth: d.getMonth() === month,
      isToday: isSameDay(d, today),
    });
    current.setDate(current.getDate() + 1);

    // Stop after we've passed the month and completed the week row
    if (i >= 27 && current.getMonth() !== month && current.getDay() === 1) break;
  }

  return days;
}

/* ─── Event positioning for day/week views ─── */

export function getEventTopPercent(time: string, startHour = 7, endHour = 22): number {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = (h - startHour) * 60 + m;
  const totalRange = (endHour - startHour) * 60;
  return Math.max(0, Math.min(100, (totalMinutes / totalRange) * 100));
}

export function getEventHeightPercent(startTime: string, endTime: string, startHour = 7, endHour = 22): number {
  const top = getEventTopPercent(startTime, startHour, endHour);
  const bottom = getEventTopPercent(endTime, startHour, endHour);
  return Math.max(2, bottom - top);
}

/* ─── Event Display Helpers ─── */

/** Get a stronger background color for event blocks (category or custom color) */
export function getEventBgColor(event: CalendarEvent, opacity = 0.18): string {
  const color = getEventDisplayColor(event);
  // Convert hex to rgba for controlled opacity
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
