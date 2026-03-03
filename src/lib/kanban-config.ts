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
  { slug: "a_faire", name: "A faire", color: "blue", view: "production", position: 0 },
  { slug: "valide", name: "Valide", color: "green", view: "production", position: 1 },
  { slug: "paye_prod", name: "Paye", color: "emerald", view: "production", position: 2 },
];

export const DEFAULT_CASH_STATUSES = [
  { slug: "a_facturer", name: "A facturer", color: "orange", view: "cash", position: 0 },
  { slug: "facture", name: "Facture", color: "violet", view: "cash", position: 1 },
  { slug: "attente_paiement", name: "En attente paiement", color: "amber", view: "cash", position: 2 },
  { slug: "paye_cash", name: "Paye", color: "green", view: "cash", position: 3 },
];

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

/* ─── Field types ─── */

export const FIELD_TYPES = [
  { value: "text", label: "Texte" },
  { value: "number", label: "Nombre" },
  { value: "money", label: "Montant" },
  { value: "date", label: "Date" },
  { value: "select", label: "Selection" },
  { value: "multi_select", label: "Multi-selection" },
  { value: "url", label: "Lien URL" },
  { value: "boolean", label: "Case a cocher" },
];

/* ─── Default fields for seeding ─── */

export const DEFAULT_FIELDS = [
  { key: "deadline_custom", label: "Deadline", field_type: "date", position: 0 },
  { key: "lien_drive", label: "Lien Drive", field_type: "url", position: 1 },
  { key: "revisions", label: "Revisions", field_type: "number", position: 2 },
  { key: "type_paiement", label: "Type de paiement", field_type: "select", options: ["Acompte", "Full"], position: 3 },
  { key: "client_vip", label: "Client VIP", field_type: "boolean", position: 4, is_visible_on_card: true },
  { key: "notes_custom", label: "Notes", field_type: "text", position: 5 },
];
