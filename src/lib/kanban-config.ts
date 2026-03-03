export type KanbanView = "production" | "cashflow" | "table";

/* ─── Color system ─── */

export const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  blue: { dot: "bg-blue-400", bg: "bg-blue-50", text: "text-blue-600" },
  violet: { dot: "bg-violet-400", bg: "bg-violet-50", text: "text-violet-600" },
  indigo: { dot: "bg-indigo-400", bg: "bg-indigo-50", text: "text-indigo-600" },
  amber: { dot: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-600" },
  emerald: { dot: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-600" },
  cyan: { dot: "bg-cyan-400", bg: "bg-cyan-50", text: "text-cyan-600" },
  green: { dot: "bg-green-500", bg: "bg-green-50", text: "text-green-600" },
  red: { dot: "bg-red-400", bg: "bg-red-50", text: "text-red-600" },
  pink: { dot: "bg-pink-400", bg: "bg-pink-50", text: "text-pink-600" },
  orange: { dot: "bg-orange-400", bg: "bg-orange-50", text: "text-orange-600" },
  gray: { dot: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-600" },
};

export const AVAILABLE_COLORS = Object.keys(STATUS_COLORS);

/* ─── Default statuses per view ─── */

export const DEFAULT_PRODUCTION_STATUSES = [
  { slug: "new", name: "À faire", color: "blue", view: "production", position: 0 },
  { slug: "in_progress", name: "En cours", color: "violet", view: "production", position: 1 },
  { slug: "delivered", name: "Livré", color: "green", view: "production", position: 2 },
  { slug: "paid", name: "Payé", color: "emerald", view: "production", position: 3 },
];

export const DEFAULT_CASH_STATUSES = [
  { slug: "invoiced", name: "Facturée", color: "orange", view: "cash", position: 0 },
  { slug: "in_review", name: "En attente paiement", color: "amber", view: "cash", position: 1 },
  { slug: "paid", name: "Payée", color: "green", view: "cash", position: 2 },
];

/* ─── Status labels (FR) ─── */

export const STATUS_LABELS: Record<string, string> = {
  new: "À faire",
  in_progress: "En cours",
  delivered: "Livré",
  paid: "Payé",
};

/* ─── Status order (strict) ─── */

export const STATUS_ORDER: string[] = ["new", "in_progress", "delivered", "paid"];

/* ─── Status flow: bidirectional navigation ─── */

export const NEXT_STATUS: Record<string, string> = {
  new: "in_progress",
  in_progress: "delivered",
  delivered: "paid",
};

export const PREV_STATUS: Record<string, string> = {
  in_progress: "new",
  delivered: "in_progress",
  paid: "delivered",
};

/* ─── Priority ─── */

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-orange-400",
  normal: "border-l-transparent",
  low: "border-l-transparent",
};

export const PRIORITIES = [
  { value: "low", label: "Basse" },
  { value: "normal", label: "Normale" },
  { value: "high", label: "Haute" },
  { value: "urgent", label: "Urgente" },
];

/* ─── System columns (built-in, non-deletable) ─── */

export const SYSTEM_COLUMNS = [
  { key: "title",    label: "Titre",    field_type: "text",   position: 0 },
  { key: "client",   label: "Client",   field_type: "text",   position: 1 },
  { key: "price",    label: "Prix",     field_type: "money",  position: 2 },
  { key: "status",   label: "Statut",   field_type: "select", position: 3 },
  { key: "deadline", label: "Deadline", field_type: "date",   position: 4 },
  { key: "date",     label: "Date",     field_type: "date",   position: 5, config: { readOnly: true } },
] as const;

/* ─── Field types ─── */

export const FIELD_TYPES = [
  { value: "text", label: "Texte" },
  { value: "number", label: "Nombre" },
  { value: "money", label: "Montant" },
  { value: "date", label: "Date" },
  { value: "select", label: "Sélection" },
  { value: "multi_select", label: "Multi-sélection" },
  { value: "url", label: "Lien URL" },
  { value: "boolean", label: "Case à cocher" },
];

/* ─── Legacy seeded keys — MUST be excluded from table ─── */
// These were auto-seeded before the fix. They stay in DB (data in side sheet)
// but are forcibly hidden from the table at API + frontend level.
export const LEGACY_SEEDED_KEYS = new Set([
  "deadline_custom",
  "lien_drive",
  "revisions",
  "type_paiement",
  "client_vip",
  "notes_custom",
]);

/* ─── Default fields for seeding ─── */
// Empty: no custom columns are seeded by default.
// Base columns (Titre, Client, Prix, Statut, Deadline, Date) are hardcoded in page.tsx.
// Users add custom columns via the "+" button.
export const DEFAULT_FIELDS: { key: string; label: string; field_type: string; position: number; options?: string[]; is_visible_on_card?: boolean }[] = [];
