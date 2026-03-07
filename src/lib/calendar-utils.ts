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
  | "personnel";

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
  /** Source: "manual" = user-created, "order" = auto from order deadline */
  source: "manual" | "order";
  /** Custom hex color (overrides category default) */
  color?: string;
  /** FK to clients table */
  clientId?: string;
  /** If source === "order" */
  orderId?: string;
  orderStatus?: string;
  orderPrice?: number;
  clientName?: string;
  clientEmail?: string;
  productName?: string;
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
};

export const ALL_CATEGORIES: EventCategory[] = [
  "appel", "session", "contenu", "review", "livraison", "rappel", "admin", "personnel", "deadline",
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

/* ─── Mock Data (fallback) ─── */

function getRelativeDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return toDateStr(d);
}

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "Appel decouverte — Marie Dupont",
    category: "appel",
    date: getRelativeDate(0),
    startTime: "10:00",
    endTime: "10:30",
    allDay: false,
    notes: "Discuter du projet de refonte logo. Preparer les exemples.",
    priority: "medium",
    source: "manual",
    clientName: "Marie Dupont",
    clientEmail: "marie@studio.fr",
  },
  {
    id: "evt-2",
    title: "Session montage — Podcast #12",
    category: "session",
    date: getRelativeDate(0),
    startTime: "14:00",
    endTime: "16:30",
    allDay: false,
    notes: "Montage episode 12, nettoyage audio + ajout intro.",
    priority: "high",
    source: "manual",
    clientName: "Thomas Petit",
  },
  {
    id: "evt-3",
    title: "Review thumbnails YouTube",
    category: "review",
    date: getRelativeDate(1),
    startTime: "09:00",
    endTime: "10:00",
    allDay: false,
    notes: "Valider les 10 thumbnails avec Hugo avant envoi.",
    priority: "medium",
    source: "manual",
    clientName: "Hugo Moreau",
  },
  {
    id: "evt-4",
    title: "Livraison pack reseaux sociaux",
    category: "livraison",
    date: getRelativeDate(1),
    startTime: "17:00",
    endTime: "17:30",
    allDay: false,
    priority: "high",
    source: "manual",
    clientName: "Sophie Bernard",
  },
  {
    id: "evt-5",
    title: "Comptabilite mensuelle",
    category: "admin",
    date: getRelativeDate(2),
    startTime: "09:00",
    endTime: "11:00",
    allDay: false,
    notes: "Rapprochement bancaire + envoi des factures en retard.",
    priority: "low",
    source: "manual",
  },
  {
    id: "evt-6",
    title: "Creation contenu Instagram",
    category: "contenu",
    date: getRelativeDate(2),
    startTime: "14:00",
    endTime: "16:00",
    allDay: false,
    notes: "Preparer 5 posts pour la semaine prochaine.",
    priority: "medium",
    source: "manual",
  },
  {
    id: "evt-7",
    title: "Rappel : relancer Emma Leroy",
    category: "rappel",
    date: getRelativeDate(3),
    startTime: "10:00",
    endTime: "10:15",
    allDay: false,
    notes: "Relancer pour validation de l'identite visuelle.",
    priority: "medium",
    source: "manual",
    clientName: "Emma Leroy",
  },
  {
    id: "evt-8",
    title: "Sport / pause",
    category: "personnel",
    date: getRelativeDate(4),
    startTime: "12:00",
    endTime: "13:30",
    allDay: false,
    priority: "low",
    source: "manual",
  },
  // Order-derived events
  {
    id: "order-CMD-001",
    title: "Logo redesign — Marie Dupont",
    category: "deadline",
    date: getRelativeDate(3),
    allDay: true,
    priority: "medium",
    source: "order",
    orderId: "CMD-001",
    orderStatus: "in_progress",
    orderPrice: 450,
    clientName: "Marie Dupont",
    clientEmail: "marie@studio.fr",
    productName: "Logo redesign",
  },
  {
    id: "order-CMD-005",
    title: "Identite visuelle — Emma Leroy",
    category: "deadline",
    date: getRelativeDate(5),
    allDay: true,
    priority: "high",
    source: "order",
    orderId: "CMD-005",
    orderStatus: "in_progress",
    orderPrice: 890,
    clientName: "Emma Leroy",
    clientEmail: "emma@brand.co",
    productName: "Identite visuelle",
  },
];
