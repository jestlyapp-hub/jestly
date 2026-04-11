// ── Timeline Event Types ─────────────────────────────────────

export const TIMELINE_EVENT_TYPES = [
  "CLIENT_CREATED",
  "CLIENT_UPDATED",
  "ORDER_CREATED",
  "ORDER_UPDATED",
  "ORDER_DELIVERED",
  "INVOICE_CREATED",
  "INVOICE_PAID",
  "PROJECT_CREATED",
  "PROJECT_COMPLETED",
  "TASK_CREATED",
  "TASK_COMPLETED",
  "DEADLINE_APPROACHING",
  "DEADLINE_OVERDUE",
  "PAYMENT_RECEIVED",
  "FILE_UPLOADED",
  "MESSAGE_SENT",
  "SYSTEM_ALERT",
] as const;

export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];

// ── Entity Types ─────────────────────────────────────────────

export const TIMELINE_ENTITY_TYPES = [
  "client",
  "order",
  "invoice",
  "project",
  "task",
  "file",
  "message",
  "system",
] as const;

export type TimelineEntityType = (typeof TIMELINE_ENTITY_TYPES)[number];

// ── Timeline Event ───────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  user_id: string;
  event_type: TimelineEventType;
  entity_type: string | null;
  entity_id: string | null;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  icon: string | null;
  color: string | null;
  is_important: boolean;
  created_at: string;
  created_by: string | null;
}

// ── Filters ──────────────────────────────────────────────────

export interface TimelineFilters {
  types?: TimelineEventType[];
  entity_type?: string;
  entity_id?: string;
  important_only?: boolean;
  search?: string;
  date_from?: string;
  date_to?: string;
}

// ── API Response ─────────────────────────────────────────────

export interface TimelineResponse {
  events: TimelineEvent[];
  next_cursor: string | null;
  has_more: boolean;
}

// ── Filter Chip Config ───────────────────────────────────────

export interface TimelineFilterChip {
  label: string;
  types: TimelineEventType[];
  icon: string;
  color: string;
}

export const TIMELINE_FILTER_CHIPS: TimelineFilterChip[] = [
  {
    label: "Commandes",
    types: ["ORDER_CREATED", "ORDER_UPDATED", "ORDER_DELIVERED"],
    icon: "shopping-bag",
    color: "indigo",
  },
  {
    label: "Factures",
    types: ["INVOICE_CREATED", "INVOICE_PAID"],
    icon: "file-text",
    color: "amber",
  },
  {
    label: "Projets",
    types: ["PROJECT_CREATED", "PROJECT_COMPLETED"],
    icon: "palette",
    color: "violet",
  },
  {
    label: "Tâches",
    types: ["TASK_CREATED", "TASK_COMPLETED"],
    icon: "check-square",
    color: "slate",
  },
  {
    label: "Clients",
    types: ["CLIENT_CREATED", "CLIENT_UPDATED"],
    icon: "users",
    color: "blue",
  },
  {
    label: "Deadlines",
    types: ["DEADLINE_APPROACHING", "DEADLINE_OVERDUE"],
    icon: "alert-triangle",
    color: "red",
  },
  {
    label: "Paiements",
    types: ["PAYMENT_RECEIVED", "INVOICE_PAID"],
    icon: "credit-card",
    color: "emerald",
  },
];

// ── Grouping ─────────────────────────────────────────────────

export type TimelineGroup = "today" | "yesterday" | "this_week" | "last_week" | "this_month" | "older";

export const TIMELINE_GROUP_LABELS: Record<TimelineGroup, string> = {
  today: "Aujourd'hui",
  yesterday: "Hier",
  this_week: "Cette semaine",
  last_week: "La semaine dernière",
  this_month: "Ce mois",
  older: "Plus ancien",
};
