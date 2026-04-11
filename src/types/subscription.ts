// ═══════════════════════════════════════════════════════════════════
// Cockpit Abonnements — Types
// ═══════════════════════════════════════════════════════════════════

export type BillingFrequency = "monthly" | "quarterly" | "yearly";
export type SubscriptionStatus = "active" | "paused" | "to_cancel" | "cancelled";
export type SubscriptionCategory =
  | "design"
  | "marketing"
  | "hosting"
  | "tools"
  | "media"
  | "finance"
  | "communication"
  | "other";

export interface Subscription {
  id: string;
  owner_id: string;
  name: string;
  logo_url: string | null;
  domain: string | null;
  color_tag: string | null;
  amount_cents: number;
  billing_frequency: BillingFrequency;
  billing_day: number;
  currency: string;
  category: SubscriptionCategory;
  is_tax_deductible: boolean;
  status: SubscriptionStatus;
  last_used_at: string | null;
  notes: string | null;
  budget_limit_cents: number | null;
  billing_anchor_date: string | null;
  cancel_reminder_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionFormData {
  name: string;
  domain?: string;
  amount_cents: number;
  billing_frequency: BillingFrequency;
  billing_day: number;
  category: SubscriptionCategory;
  is_tax_deductible: boolean;
  status: SubscriptionStatus;
  notes?: string;
}

// ── Computed helpers ─────────────────────────────────────────────

export const CATEGORY_CONFIG: Record<SubscriptionCategory, { label: string; color: string; icon: string }> = {
  design:        { label: "Design",        color: "#8B5CF6", icon: "🎨" },
  marketing:     { label: "Marketing",     color: "#EC4899", icon: "📢" },
  hosting:       { label: "Hébergement",   color: "#3B82F6", icon: "☁️" },
  tools:         { label: "Outils",        color: "#10B981", icon: "🔧" },
  media:         { label: "Médias",        color: "#F59E0B", icon: "🎬" },
  finance:       { label: "Finance",       color: "#6366F1", icon: "💰" },
  communication: { label: "Communication", color: "#06B6D4", icon: "💬" },
  other:         { label: "Autre",         color: "#8A8A88", icon: "📦" },
};

export const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; color: string }> = {
  active:    { label: "Actif",      color: "#10B981" },
  paused:    { label: "En pause",   color: "#F59E0B" },
  to_cancel: { label: "À résilier", color: "#EF4444" },
  cancelled: { label: "Résilié",    color: "#8A8A88" },
};

export const FREQUENCY_LABELS: Record<BillingFrequency, string> = {
  monthly:   "Mensuel",
  quarterly: "Trimestriel",
  yearly:    "Annuel",
};
