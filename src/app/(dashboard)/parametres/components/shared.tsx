"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  User, Building2, SlidersHorizontal, Receipt, CreditCard, Puzzle,
  Bell, ShieldCheck, Database, AlertTriangle, Save, Check, Loader2,
  ChevronRight, CircleCheck,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

export interface UserSettings {
  defaultPage?: string;
  compactMode?: boolean;
  amountDisplay?: "ht" | "ttc";
  defaultCurrency?: string;
  calendarView?: "week" | "month";
  weekStartsMonday?: boolean;
  dateFormat?: string;
  emailMarketing?: boolean;
  [key: string]: unknown;
}

export interface WorkspaceSettings {
  companyName?: string;
  logo?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  vatNumber?: string;
  siret?: string;
  defaultCurrency?: string;
  defaultTaxRate?: number;
  paymentTermsDays?: number;
  invoicePrefix?: string;
  legalMention?: string;
}

export interface NotificationSettings {
  email?: {
    newOrders?: boolean;
    deliveredOrders?: boolean;
    paymentReminders?: boolean;
    monthEndReminder?: boolean;
    integrationAlerts?: boolean;
    subscription?: boolean;
  };
  inApp?: {
    taskReminders?: boolean;
    calendarReminders?: boolean;
    billingSuggestions?: boolean;
    healthAlerts?: boolean;
    monthlyClose?: boolean;
  };
  digest?: {
    enabled?: boolean;
    frequency?: "daily" | "weekly";
  };
}

export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  business_name: string | null;
  avatar_url: string | null;
  subdomain: string;
  plan: "free" | "pro";
  phone: string | null;
  role: string | null;
  locale: string | null;
  timezone: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  settings: UserSettings;
  workspace: WorkspaceSettings;
  notifications: NotificationSettings;
  created_at: string;
  updated_at: string;
}

/* Form state passed to each section */
export interface SettingsForm {
  fullName: string;
  phone: string;
  role: string;
  locale: string;
  timezone: string;
  businessName: string;
  settings: UserSettings;
  workspace: WorkspaceSettings;
  notifications: NotificationSettings;
}

export interface SettingsFormActions {
  setFullName: (v: string) => void;
  setPhone: (v: string) => void;
  setRole: (v: string) => void;
  setLocale: (v: string) => void;
  setTimezone: (v: string) => void;
  setBusinessName: (v: string) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  updateWorkspace: (patch: Partial<WorkspaceSettings>) => void;
  updateNotifEmail: (patch: Partial<NonNullable<NotificationSettings["email"]>>) => void;
  updateNotifInApp: (patch: Partial<NonNullable<NotificationSettings["inApp"]>>) => void;
  updateNotifDigest: (patch: Partial<NonNullable<NotificationSettings["digest"]>>) => void;
  markDirty: (section: string) => void;
}

/* ══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════════════ */

export const SECTIONS = [
  { id: "compte", label: "Compte", icon: User, enabled: true, soon: false },
  { id: "workspace", label: "Workspace", icon: Building2, enabled: true, soon: false },
  { id: "preferences", label: "Préférences", icon: SlidersHorizontal, enabled: true, soon: false },
  { id: "facturation", label: "Facturation", icon: Receipt, enabled: true, soon: false },
  { id: "abonnement", label: "Abonnement", icon: CreditCard, enabled: false, soon: true },
  { id: "integrations", label: "Intégrations", icon: Puzzle, enabled: true, soon: false },
  { id: "notifications", label: "Notifications", icon: Bell, enabled: true, soon: false },
  { id: "securite", label: "Sécurité", icon: ShieldCheck, enabled: true, soon: false },
  { id: "donnees", label: "Données", icon: Database, enabled: true, soon: false },
  { id: "danger", label: "Zone dangereuse", icon: AlertTriangle, enabled: true, soon: false },
] as const;

export type SectionId = typeof SECTIONS[number]["id"];

/** Sections navigables (enabled === true) — utilisé par observer + sidebar + search */
export const ENABLED_SECTIONS = SECTIONS.filter(s => s.enabled);

/** Set d'ids activables — pour validation rapide */
const enabledIds = new Set<string>(ENABLED_SECTIONS.map(s => s.id));

/** Vérifie qu'un id est une section activable */
export function isEnabledSection(id: string): id is SectionId {
  return enabledIds.has(id);
}

/** Placeholder pour les sections "coming soon" — PAS d'id DOM pour ne pas interférer avec l'observer */
export function ComingSoonPlaceholder({ label }: { label: string }) {
  return (
    <div className="scroll-mt-24">
      <div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden">
        <div className="px-8 py-12 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-[#F0EEFF] flex items-center justify-center mb-3">
            <CreditCard size={18} className="text-[#7C3AED]" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#191919]">{label}</h3>
          <p className="text-[13px] text-[#A8A29E] mt-1.5 max-w-xs">
            La gestion des abonnements et plans sera bientôt disponible.
          </p>
          <span className="mt-3 text-[11px] font-medium text-[#7C3AED] bg-[#F0EEFF] px-3 py-1 rounded-full">
            Bientôt disponible
          </span>
        </div>
      </div>
    </div>
  );
}

export const TIMEZONES = [
  "Europe/Paris", "Europe/London", "Europe/Berlin", "Europe/Madrid",
  "Europe/Rome", "Europe/Brussels", "Europe/Zurich", "Europe/Amsterdam",
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "America/Toronto", "America/Sao_Paulo",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Dubai",
  "Australia/Sydney", "Pacific/Auckland",
];

export const CURRENCIES = [
  { code: "EUR", label: "Euro (EUR)" },
  { code: "USD", label: "Dollar US (USD)" },
  { code: "GBP", label: "Livre sterling (GBP)" },
  { code: "CHF", label: "Franc suisse (CHF)" },
  { code: "CAD", label: "Dollar canadien (CAD)" },
];

export const INTEGRATIONS = [
  { key: "stripe", name: "Stripe", description: "Paiements en ligne, facturation, abonnements", category: "Paiements", status: "available" as const },
  { key: "google_calendar", name: "Google Calendar", description: "Synchronisation agenda et rendez-vous", category: "Productivité", status: "available" as const },
  { key: "apple_calendar", name: "Apple Calendar", description: "Synchronisation iCal", category: "Productivité", status: "available" as const },
];

/* Searchable index: keyword → section id */
export const SEARCH_INDEX: { keywords: string[]; section: SectionId; label: string }[] = [
  { keywords: ["nom", "prénom", "email", "profil", "avatar", "photo", "téléphone", "langue", "fuseau"], section: "compte", label: "Compte & Profil" },
  { keywords: ["workspace", "entreprise", "société", "studio", "siret", "tva", "adresse", "logo", "business"], section: "workspace", label: "Workspace" },
  { keywords: ["préférence", "accueil", "compact", "date", "calendrier", "semaine", "ht", "ttc", "montant", "devise"], section: "preferences", label: "Préférences" },
  { keywords: ["facture", "facturation", "tva", "devise", "paiement", "délai", "préfixe", "mention", "export"], section: "facturation", label: "Facturation" },
  { keywords: ["abonnement", "plan", "pro", "free", "prix", "stripe", "paiement", "facture"], section: "abonnement", label: "Abonnement" },
  { keywords: ["intégration", "stripe", "google", "calendar", "gmail", "slack", "notion", "drive", "apple"], section: "integrations", label: "Intégrations" },
  { keywords: ["notification", "email", "rappel", "alerte", "digest", "récapitulatif", "commande", "tâche"], section: "notifications", label: "Notifications" },
  { keywords: ["sécurité", "mot de passe", "password", "2fa", "session", "google", "connexion", "authentification"], section: "securite", label: "Sécurité" },
  { keywords: ["données", "export", "confidentialité", "rgpd", "supprimer", "archive", "privacy"], section: "donnees", label: "Données" },
  { keywords: ["danger", "supprimer", "compte", "réinitialiser", "déconnecter"], section: "danger", label: "Zone dangereuse" },
];

/* ══════════════════════════════════════════════════════════════════════
   SHARED UI — Styles
   ══════════════════════════════════════════════════════════════════════ */

export const inputCls = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-xl px-4 h-[44px] text-[13px] text-[#191919] placeholder:text-[#C4C4C2] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all";
export const inputErrorCls = "w-full bg-[#FEF2F2] border border-red-300 rounded-xl px-4 h-[44px] text-[13px] text-[#191919] placeholder:text-[#C4C4C2] focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all";
export const inputSuccessCls = "w-full bg-[#F0FDF4] border border-emerald-300 rounded-xl px-4 h-[44px] text-[13px] text-[#191919] placeholder:text-[#C4C4C2] focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all";
export const labelCls = "block text-[12px] font-medium text-[#78716C] mb-1.5";
export const selectCls = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-xl px-4 h-[44px] text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all appearance-none cursor-pointer";

/** Returns the appropriate input class based on validation state */
export function getInputCls(value: string, error?: string, touched?: boolean): string {
  if (!value || !touched) return inputCls;
  if (error) return inputErrorCls;
  return inputSuccessCls;
}

/* ══════════════════════════════════════════════════════════════════════
   SHARED UI — Components
   ══════════════════════════════════════════════════════════════════════ */

export function SectionCard({ id, title, description, children, danger, dirty }: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  danger?: boolean;
  dirty?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className={`bg-white rounded-xl border ${danger ? "border-red-200" : dirty ? "border-[#4F46E5]/30" : "border-[#E6E6E4]"} overflow-hidden transition-colors`}>
        <div className={`px-8 py-6 border-b ${danger ? "border-red-100 bg-red-50/30" : "border-[#F5F5F4]"}`}>
          <div className="flex items-center gap-2">
            <h2 className={`text-[16px] font-semibold ${danger ? "text-red-600" : "text-[#191919]"}`}>{title}</h2>
            {dirty && (
              <span className="text-[10px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full">Modifié</span>
            )}
          </div>
          {description && <p className="text-[13px] text-[#A8A29E] mt-1">{description}</p>}
        </div>
        <div className="px-8 py-6">{children}</div>
      </div>
    </section>
  );
}

/** Sub-section divider with label and optional description */
export function SubSection({ label, description }: { label: string; description?: string }) {
  return (
    <div className="pt-2 pb-1">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-px flex-1 bg-[#F0F0EE]" />
        <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider flex-shrink-0">{label}</p>
        <div className="h-px flex-1 bg-[#F0F0EE]" />
      </div>
      {description && <p className="text-[11px] text-[#C4C4C2] text-center">{description}</p>}
    </div>
  );
}

/** Required badge */
export function RequiredBadge() {
  return <span className="text-[10px] font-medium text-[#4F46E5] bg-[#EEF2FF] px-1.5 py-0.5 rounded ml-1.5">Requis</span>;
}

/** Optional badge */
export function OptionalBadge() {
  return <span className="text-[10px] font-medium text-[#A8A29E] ml-1.5">(optionnel)</span>;
}

export function Toggle({ checked, onChange, label, description }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center justify-between w-full py-3 group text-left">
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-[13px] font-medium text-[#191919]">{label}</div>
        {description && <div className="text-[12px] text-[#A8A29E] mt-0.5">{description}</div>}
      </div>
      <div className={`relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 ${checked ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
        <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "left-[22px]" : "left-[3px]"}`} />
      </div>
    </button>
  );
}

export function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1"
        >
          <span className="inline-block w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function FieldSuccess({ message, show }: { message: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1"
        >
          <CircleCheck size={11} className="flex-shrink-0" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* ── Sticky Save Bar ── */
export function SaveBar({ dirty, saving, saved, error, onSave, onCancel }: {
  dirty: boolean;
  saving: boolean;
  saved: boolean;
  error?: string | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {(dirty || saved || error) && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`flex items-center gap-3 px-6 py-3.5 backdrop-blur-xl border rounded-2xl shadow-xl ${error ? "bg-red-50/95 border-red-200 shadow-red-500/10" : saved ? "bg-emerald-50/95 border-emerald-200 shadow-emerald-500/10" : "bg-white/95 border-[#E6E6E4] shadow-black/10"}`}>
            {error ? (
              <>
                <div className="text-[13px] font-medium text-red-600">
                  {error}
                </div>
                <div className="h-4 w-px bg-red-200" />
                <button
                  onClick={onCancel}
                  className="text-[13px] font-medium text-[#A8A29E] hover:text-[#57534E] px-3 py-1.5 rounded-lg hover:bg-white/50 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#4F46E5] px-5 py-2.5 rounded-xl hover:bg-[#4338CA] transition-colors shadow-sm disabled:opacity-50"
                >
                  Réessayer
                </button>
              </>
            ) : saved ? (
              <div className="flex items-center gap-2 text-[13px] font-medium text-emerald-600">
                <Check size={15} />
                Paramètres enregistrés
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#57534E]">
                  <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" />
                  Modifications non enregistrées
                </div>
                <div className="h-4 w-px bg-[#E6E6E4]" />
                <button
                  onClick={onCancel}
                  className="text-[13px] font-medium text-[#A8A29E] hover:text-[#57534E] px-3 py-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#4F46E5] px-5 py-2.5 rounded-xl hover:bg-[#4338CA] transition-colors shadow-md shadow-[#4F46E5]/25 disabled:opacity-50"
                >
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Enregistrement...</> : <><Save size={14} /> Sauvegarder</>}
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Completion Widget ── */
export function CompletionWidget({ profile, form, onNavigate }: {
  profile: ProfileData;
  form: SettingsForm;
  onNavigate: (section: SectionId) => void;
}) {
  const checks = [
    { done: !!profile.avatar_url, label: "Ajouter un avatar", section: "compte" as SectionId },
    { done: !!form.phone, label: "Renseigner votre téléphone", section: "compte" as SectionId },
    { done: !!form.businessName, label: "Nom commercial", section: "workspace" as SectionId },
    { done: !!(form.workspace.address && form.workspace.city), label: "Adresse professionnelle", section: "workspace" as SectionId },
    { done: !!form.workspace.siret, label: "Ajouter votre SIRET", section: "workspace" as SectionId },
    { done: !!profile.stripe_customer_id, label: "Connecter Stripe", section: "integrations" as SectionId },
    { done: false, label: "Connecter Google Calendar", section: "integrations" as SectionId },
    { done: form.notifications.email?.newOrders !== undefined, label: "Configurer les notifications", section: "notifications" as SectionId },
    { done: form.workspace.defaultTaxRate !== undefined && form.workspace.defaultTaxRate > 0, label: "Configurer la TVA", section: "facturation" as SectionId },
  ];

  const done = checks.filter(c => c.done).length;
  const total = checks.length;
  const pct = Math.round((done / total) * 100);
  const remaining = checks.filter(c => !c.done);

  if (pct === 100) return null;

  return (
    <div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden mb-6">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[14px] font-semibold text-[#191919]">Configuration du compte</h3>
            <p className="text-[12px] text-[#A8A29E] mt-0.5">Votre compte est configuré à {pct}%</p>
          </div>
          <span className="text-[20px] font-bold text-[#4F46E5] tabular-nums">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-[#F0F0EE] rounded-full overflow-hidden">
          <div className="h-full bg-[#4F46E5] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        {remaining.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">Recommandations</p>
            {remaining.slice(0, 4).map(r => (
              <button
                key={r.label}
                onClick={() => onNavigate(r.section)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-[#57534E] hover:bg-[#F7F7F5] transition-colors text-left"
              >
                <div className="w-5 h-5 rounded-full border-2 border-[#E6E6E4] flex-shrink-0" />
                {r.label}
                <ChevronRight size={12} className="ml-auto text-[#D6D3D1]" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Validation helpers ── */
export function validateEmail(v: string): string | undefined {
  if (!v) return undefined;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? undefined : "Email invalide";
}

/** URL validation — accepts bare domains (monsite.fr) and full URLs */
export function validateUrl(v: string): string | undefined {
  if (!v) return undefined;
  // Accept bare domains like monsite.fr
  const withProtocol = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try { new URL(withProtocol); return undefined; } catch { return "URL invalide (ex: monsite.fr)"; }
}

/** Auto-prefix URL with https:// if needed */
export function normalizeUrl(v: string): string {
  if (!v) return v;
  const trimmed = v.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function validateSiret(v: string): string | undefined {
  if (!v) return undefined;
  const digits = v.replace(/\s/g, "");
  return /^\d{14}$/.test(digits) ? undefined : "SIRET invalide (14 chiffres)";
}
export function validateVat(v: string): string | undefined {
  if (!v) return undefined;
  return /^[A-Z]{2}\d{9,12}$/.test(v.replace(/\s/g, "")) ? undefined : "Format attendu : FR12345678901";
}
export function validatePhone(v: string): string | undefined {
  if (!v) return undefined;
  const clean = v.replace(/[\s\-\.\(\)]/g, "");
  return /^\+?\d{8,15}$/.test(clean) ? undefined : "Numéro invalide";
}
