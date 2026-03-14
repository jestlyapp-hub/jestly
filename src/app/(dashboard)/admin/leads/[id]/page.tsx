"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Tag,
  Plus,
  ArrowRight,
  StickyNote,
  BarChart3,
  UserCheck,
  CreditCard,
  UserCog,
  Target,
  RefreshCw,
  ChevronDown,
  Pin,
  Loader2,
  X,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Link2,
  Clock,
  CheckCircle2,
  User,
  MousePointerClick,
  Fingerprint,
  Send,
  Users,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface Lead {
  id: string;
  site_id: string;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  source: string | null;
  status: string;
  page_path: string | null;
  block_type: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  product_name: string | null;
  amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  score: number | null;
  quality_tier: string | null;
  tags: string[] | null;
  owner: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  first_touch_source: string | null;
  last_touch_source: string | null;
  landing_page: string | null;
  converted_user_id: string | null;
  converted_at: string | null;
  converted_paid_at: string | null;
  anonymous_id: string | null;
  last_activity_at: string | null;
}

interface LeadNote {
  id: string;
  lead_id: string;
  author_email: string;
  content: string;
  pinned: boolean;
  created_at: string;
}

interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  created_at: string;
  actor_id: string | null;
  metadata: Record<string, unknown> | null;
}

interface LeadTouch {
  id: string;
  lead_id: string;
  touch_type: string;
  landing_path: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string | null;
  touched_at: string;
}

interface LeadConversion {
  id: string;
  lead_id: string;
  conversion_type: string;
  converted_at: string;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
}

interface LeadDetail {
  lead: Lead;
  attribution_touches: LeadTouch[];
  notes: LeadNote[];
  activity_log: LeadActivity[];
  conversions: LeadConversion[];
}

// ── Constants ──────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "new", label: "Nouveau" },
  { value: "contacted", label: "Contact\u00e9" },
  { value: "qualified", label: "Qualifi\u00e9" },
  { value: "nurturing", label: "Nurturing" },
  { value: "converted_signup", label: "Converti Signup" },
  { value: "converted_paid", label: "Converti Paid" },
  { value: "lost", label: "Perdu" },
  { value: "spam", label: "Spam" },
];

const STATUS_BADGE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  new: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Nouveau" },
  contacted: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Contact\u00e9" },
  qualified: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Qualifi\u00e9" },
  nurturing: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", label: "Nurturing" },
  converted_signup: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Signup" },
  converted_paid: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", label: "Paid" },
  lost: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Perdu" },
  spam: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200", label: "Spam" },
  archived: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200", label: "Archiv\u00e9" },
};

const SOURCE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  "contact-form": { bg: "bg-blue-50", text: "text-blue-700", label: "Formulaire" },
  newsletter: { bg: "bg-purple-50", text: "text-purple-700", label: "Newsletter" },
  checkout: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Checkout" },
  brief: { bg: "bg-amber-50", text: "text-amber-700", label: "Brief" },
};

const QUALITY_BADGE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  unknown: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200", label: "Unknown" },
  low: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", label: "Low" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Medium" },
  high: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "High" },
  premium: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", label: "Premium" },
};

const ACTIVITY_ICONS: Record<string, { icon: typeof Plus; color: string; bg: string }> = {
  created: { icon: Plus, color: "text-green-600", bg: "bg-green-50" },
  status_change: { icon: ArrowRight, color: "text-blue-600", bg: "bg-blue-50" },
  note_added: { icon: StickyNote, color: "text-purple-600", bg: "bg-purple-50" },
  tag_added: { icon: Tag, color: "text-amber-600", bg: "bg-amber-50" },
  tag_removed: { icon: Tag, color: "text-amber-600", bg: "bg-amber-50" },
  tags_change: { icon: Tag, color: "text-amber-600", bg: "bg-amber-50" },
  score_change: { icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
  signup: { icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
  payment: { icon: CreditCard, color: "text-teal-600", bg: "bg-teal-50" },
  owner_change: { icon: UserCog, color: "text-gray-600", bg: "bg-gray-100" },
  campaign_attributed: { icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
};

const TOUCH_ICONS: Record<string, typeof Globe> = {
  organic: Globe,
  direct: MousePointerClick,
  referral: Link2,
  campaign: Target,
  social: Users,
};

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

// ── Helpers ────────────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeDate(d: string): string {
  const now = new Date();
  const date = new Date(d);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "\u00e0 l'instant";
  if (diffMin < 60) return `il y a ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `il y a ${diffD}j`;
  if (diffD < 30) return `il y a ${Math.floor(diffD / 7)}sem`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function scoreColorClass(score: number): string {
  if (score >= 60) return "text-green-700 bg-green-50 border-green-200";
  if (score >= 30) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

// ── Skeleton ──────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#F0F0EE] animate-pulse rounded ${className}`} />;
}

function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Skeleton className="h-4 w-40" />
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-[#E6E6E4] p-5">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-[#E6E6E4] p-5">
              <Skeleton className="h-5 w-28 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SectionCard ───────────────────────────────────────────────────
function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-[#4F46E5]">{icon}</span>}
        <h2 className="text-[15px] font-semibold text-[#191919]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── InfoRow ────────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start py-2 border-b border-[#EFEFEF] last:border-0">
      <span className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide w-32 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <div className="flex-1 text-[13px] text-[#191919] min-w-0">
        {children || value || <span className="text-[#8A8A88]">&mdash;</span>}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────
export default function AdminLeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline edit states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [ownerInput, setOwnerInput] = useState("");
  const [ownerEditing, setOwnerEditing] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [newNote, setNewNote] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [scoreRecalculating, setScoreRecalculating] = useState(false);
  const [matchingUsers, setMatchingUsers] = useState(false);
  const [patchLoading, setPatchLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`);
      if (!res.ok) throw new Error("Erreur");
      const json = await res.json();
      setData(json);
      setOwnerInput(json.lead.owner || "");
    } catch {
      setError("Impossible de charger le lead.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── PATCH lead ──────────────────────────────────────────────────
  const patchLead = async (updates: Record<string, unknown>) => {
    setPatchLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      // Refetch all data to get fresh activity log
      await fetchData();
    } catch {
      // silent
    } finally {
      setPatchLoading(false);
    }
  };

  // ── Change status ────────────────────────────────────────────────
  const handleStatusChange = async (newStatus: string) => {
    setStatusDropdownOpen(false);
    await patchLead({ status: newStatus });
  };

  // ── Save owner ────────────────────────────────────────────────────
  const handleSaveOwner = async () => {
    setOwnerEditing(false);
    if (ownerInput.trim() !== (data?.lead.owner || "")) {
      await patchLead({ owner: ownerInput.trim() || null });
    }
  };

  // ── Add tag ────────────────────────────────────────────────────────
  const handleAddTag = async () => {
    if (!tagInput.trim() || !data) return;
    const currentTags = data.lead.tags || [];
    if (currentTags.includes(tagInput.trim())) {
      setTagInput("");
      return;
    }
    await patchLead({ tags: [...currentTags, tagInput.trim()] });
    setTagInput("");
  };

  // ── Remove tag ──────────────────────────────────────────────────────
  const handleRemoveTag = async (tag: string) => {
    if (!data) return;
    const currentTags = data.lead.tags || [];
    await patchLead({ tags: currentTags.filter((t) => t !== tag) });
  };

  // ── Recalculate score ───────────────────────────────────────────────
  const handleRecalculateScore = async () => {
    setScoreRecalculating(true);
    try {
      await fetch("/api/admin/leads/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "compute_scores", lead_ids: [id] }),
      });
      await fetchData();
    } catch {
      // silent
    } finally {
      setScoreRecalculating(false);
    }
  };

  // ── Match users ─────────────────────────────────────────────────────
  const handleMatchUsers = async () => {
    setMatchingUsers(true);
    try {
      await fetch("/api/admin/leads/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "match_users" }),
      });
      await fetchData();
    } catch {
      // silent
    } finally {
      setMatchingUsers(false);
    }
  };

  // ── Add note ──────────────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!newNote.trim() || noteSubmitting) return;
    setNoteSubmitting(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      if (!res.ok) throw new Error();
      setNewNote("");
      await fetchData();
    } catch {
      // silent
    } finally {
      setNoteSubmitting(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────
  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">{error || "Erreur inconnue"}</p>
        <button
          onClick={() => router.push("/admin/leads")}
          className="mt-4 text-sm text-[#4F46E5] hover:underline"
        >
          Retour aux leads
        </button>
      </div>
    );
  }

  const { lead, attribution_touches, notes, activity_log, conversions } = data;
  const scoreBadge = lead.score != null ? scoreColorClass(lead.score) : null;
  const statusCfg = STATUS_BADGE[lead.status] || STATUS_BADGE.new;
  const qualityCfg = lead.quality_tier ? QUALITY_BADGE[lead.quality_tier] : null;
  const sourceCfg = lead.source ? SOURCE_BADGE[lead.source] : null;

  // Sort notes: pinned first
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // UTM fields for attribution
  const utmFields = [
    { label: "Source", value: lead.utm_source },
    { label: "Medium", value: lead.utm_medium },
    { label: "Campaign", value: lead.utm_campaign },
    { label: "Content", value: lead.utm_content },
    { label: "Term", value: lead.utm_term },
  ].filter((f) => f.value);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Back link ── */}
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-[13px] text-[#5A5A58] hover:text-[#191919] transition-colors"
      >
        <ArrowLeft size={14} />
        Retour aux leads
      </Link>

      {/* ══════════════════════════════════════════════════════════════
          HEADER CARD
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-[#EEF2FF] border border-[#E6E6E4] flex items-center justify-center text-[#4F46E5] font-bold text-lg flex-shrink-0">
            {lead.name
              ? lead.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : lead.email[0].toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] font-bold text-[#191919] leading-tight">
              {lead.name || lead.email}
            </h1>
            {lead.name && (
              <p className="text-[13px] text-[#5A5A58] mt-0.5">{lead.email}</p>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Status dropdown */}
              <div className="relative">
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} hover:opacity-80 transition-opacity`}
                >
                  {statusCfg.label}
                  <ChevronDown size={12} />
                </button>
                {statusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-[#E6E6E4] shadow-lg z-20 py-1 min-w-[180px]">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#F7F7F5] transition-colors ${
                          opt.value === lead.status
                            ? "text-[#4F46E5] font-medium"
                            : "text-[#5A5A58]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Score badge */}
              {lead.score != null && scoreBadge && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${scoreBadge}`}
                >
                  <BarChart3 size={11} />
                  Score {lead.score}
                </span>
              )}

              {/* Quality tier */}
              {qualityCfg && (
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide border ${qualityCfg.bg} ${qualityCfg.text} ${qualityCfg.border}`}
                >
                  {qualityCfg.label}
                </span>
              )}

              {/* Recalculate score */}
              <button
                onClick={handleRecalculateScore}
                disabled={scoreRecalculating || patchLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-[#4F46E5] border border-[#4F46E5]/30 rounded-md hover:bg-[#EEF2FF] disabled:opacity-40 transition-colors"
              >
                <RefreshCw
                  size={11}
                  className={scoreRecalculating ? "animate-spin" : ""}
                />
                Recalculer score
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TWO-COLUMN LAYOUT
      ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Informations ── */}
          <SectionCard title="Informations" icon={<User size={16} />}>
            <div className="divide-y divide-[#EFEFEF]">
              <InfoRow label="Nom" value={lead.name} />
              <InfoRow label="Email">
                <a
                  href={`mailto:${lead.email}`}
                  className="text-[#4F46E5] hover:underline inline-flex items-center gap-1"
                >
                  <Mail size={12} />
                  {lead.email}
                </a>
              </InfoRow>
              <InfoRow label="T\u00e9l\u00e9phone">
                {lead.phone ? (
                  <span className="inline-flex items-center gap-1">
                    <Phone size={12} className="text-[#8A8A88]" />
                    {lead.phone}
                  </span>
                ) : (
                  <span className="text-[#8A8A88]">&mdash;</span>
                )}
              </InfoRow>
              <InfoRow label="Entreprise">
                {lead.company ? (
                  <span className="inline-flex items-center gap-1">
                    <Building2 size={12} className="text-[#8A8A88]" />
                    {lead.company}
                  </span>
                ) : (
                  <span className="text-[#8A8A88]">&mdash;</span>
                )}
              </InfoRow>
              <InfoRow label="Source">
                {sourceCfg ? (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${sourceCfg.bg} ${sourceCfg.text}`}
                  >
                    {sourceCfg.label}
                  </span>
                ) : (
                  <span className="text-[#8A8A88]">{lead.source || "\u2014"}</span>
                )}
              </InfoRow>
              <InfoRow label="Page" value={lead.page_path} />
              <InfoRow label="Type de bloc" value={lead.block_type} />

              {/* Owner editable */}
              <InfoRow label="Owner">
                {ownerEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ownerInput}
                      onChange={(e) => setOwnerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveOwner();
                        if (e.key === "Escape") {
                          setOwnerEditing(false);
                          setOwnerInput(lead.owner || "");
                        }
                      }}
                      className="px-2 py-1 text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-md focus:outline-none focus:border-[#4F46E5] w-48"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveOwner}
                      className="text-[11px] text-[#4F46E5] hover:underline"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setOwnerEditing(true)}
                    className="text-[13px] hover:text-[#4F46E5] transition-colors"
                  >
                    {lead.owner || (
                      <span className="text-[#8A8A88] italic">Non assign\u00e9</span>
                    )}
                  </button>
                )}
              </InfoRow>

              {/* Tags */}
              <InfoRow label="Tags">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(lead.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/15"
                    >
                      <Tag size={10} />
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500 transition-colors ml-0.5"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddTag();
                      }}
                      placeholder="+ tag"
                      className="w-20 px-1.5 py-0.5 text-[11px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-md focus:outline-none focus:border-[#4F46E5] placeholder:text-[#ACACAA]"
                    />
                  </div>
                </div>
              </InfoRow>

              <InfoRow label="Cr\u00e9\u00e9 le">
                <span className="text-[13px] text-[#5A5A58]">
                  {formatDateTime(lead.created_at)}
                </span>
              </InfoRow>
              {lead.updated_at && (
                <InfoRow label="Mis \u00e0 jour">
                  <span className="text-[13px] text-[#5A5A58]">
                    {formatDateTime(lead.updated_at)}
                  </span>
                </InfoRow>
              )}
              {lead.last_activity_at && (
                <InfoRow label="Derni\u00e8re activit\u00e9">
                  <span className="text-[13px] text-[#5A5A58]">
                    {relativeDate(lead.last_activity_at)}
                  </span>
                </InfoRow>
              )}
            </div>
          </SectionCard>

          {/* ── Attribution ── */}
          <SectionCard title="Attribution" icon={<Target size={16} />}>
            <div className="space-y-3">
              {/* UTM params */}
              {utmFields.length > 0 && (
                <div className="p-3 rounded-md border border-[#EFEFEF] bg-[#FBFBFA]">
                  <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-2">
                    Param\u00e8tres UTM
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {utmFields.map((f) => (
                      <div key={f.label}>
                        <p className="text-[10px] text-[#8A8A88]">{f.label}</p>
                        <p className="text-[12px] text-[#191919] font-medium">
                          {f.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="divide-y divide-[#EFEFEF]">
                {lead.referrer && (
                  <InfoRow label="Referrer">
                    <span className="text-[12px] text-[#5A5A58] break-all">
                      {lead.referrer}
                    </span>
                  </InfoRow>
                )}
                {lead.landing_page && (
                  <InfoRow label="Landing page" value={lead.landing_page} />
                )}
                {lead.first_touch_source && (
                  <InfoRow
                    label="First touch"
                    value={lead.first_touch_source}
                  />
                )}
                {lead.last_touch_source && (
                  <InfoRow
                    label="Last touch"
                    value={lead.last_touch_source}
                  />
                )}
                {lead.campaign_id && (
                  <InfoRow label="Campagne">
                    <span className="text-[12px]">
                      {lead.campaign_name || lead.campaign_id}
                    </span>
                  </InfoRow>
                )}
                {lead.anonymous_id && (
                  <InfoRow label="Anonymous ID">
                    <span className="text-[11px] text-[#8A8A88] font-mono break-all">
                      <Fingerprint
                        size={10}
                        className="inline mr-1 text-[#ACACAA]"
                      />
                      {lead.anonymous_id}
                    </span>
                  </InfoRow>
                )}
              </div>

              {utmFields.length === 0 &&
                !lead.referrer &&
                !lead.landing_page &&
                !lead.first_touch_source &&
                !lead.anonymous_id && (
                  <p className="text-[13px] text-[#8A8A88]">
                    Aucune donn\u00e9e d'attribution disponible.
                  </p>
                )}
            </div>
          </SectionCard>

          {/* ── Attribution Touches ── */}
          {attribution_touches.length > 0 && (
            <SectionCard
              title="Touches d'attribution"
              icon={<MousePointerClick size={16} />}
            >
              <div className="space-y-0">
                {attribution_touches.map((touch, idx) => {
                  const TouchIcon =
                    TOUCH_ICONS[touch.touch_type] || Globe;
                  const DeviceIcon = touch.device_type
                    ? DEVICE_ICONS[touch.device_type] || Monitor
                    : null;
                  return (
                    <div
                      key={touch.id}
                      className="flex items-start gap-3 py-3 border-b border-[#EFEFEF] last:border-0"
                    >
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center mt-0.5">
                        <div className="w-7 h-7 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                          <TouchIcon size={13} className="text-[#4F46E5]" />
                        </div>
                        {idx < attribution_touches.length - 1 && (
                          <div className="w-px h-full bg-[#EFEFEF] mt-1" />
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[12px] font-medium text-[#191919] capitalize">
                            {touch.touch_type}
                          </span>
                          {touch.utm_source && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-[#5A5A58]">
                              {touch.utm_source}
                            </span>
                          )}
                          {DeviceIcon && (
                            <DeviceIcon
                              size={12}
                              className="text-[#8A8A88]"
                            />
                          )}
                        </div>
                        {touch.landing_path && (
                          <p className="text-[11px] text-[#8A8A88] mt-0.5 truncate">
                            {touch.landing_path}
                          </p>
                        )}
                        <p className="text-[11px] text-[#ACACAA] mt-0.5">
                          {formatDateTime(touch.touched_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* ── Conversion ── */}
          <SectionCard title="Conversion" icon={<CheckCircle2 size={16} />}>
            <div className="divide-y divide-[#EFEFEF]">
              <InfoRow label="Lead cr\u00e9\u00e9">
                <span className="text-[13px] text-[#5A5A58]">
                  {formatDateTime(lead.created_at)}
                </span>
              </InfoRow>
              <InfoRow label="Signup">
                {lead.converted_user_id ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <Link
                      href={`/admin/users/${lead.converted_user_id}`}
                      className="text-[13px] text-[#4F46E5] hover:underline"
                    >
                      Voir l'utilisateur
                    </Link>
                    {lead.converted_at && (
                      <span className="text-[11px] text-[#8A8A88] ml-1">
                        {formatDate(lead.converted_at)}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-[13px] text-[#8A8A88]">
                    Non converti
                  </span>
                )}
              </InfoRow>
              <InfoRow label="Paiement">
                {lead.converted_paid_at ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span className="text-[13px] text-[#191919]">
                      {formatDate(lead.converted_paid_at)}
                    </span>
                  </span>
                ) : (
                  <span className="text-[13px] text-[#8A8A88]">
                    Non converti
                  </span>
                )}
              </InfoRow>
            </div>

            {/* Extra conversions from the table */}
            {conversions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#EFEFEF]">
                <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-2">
                  \u00c9v\u00e9nements de conversion
                </p>
                <div className="space-y-2">
                  {conversions.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 text-[12px]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                      <span className="text-[#191919] font-medium capitalize">
                        {c.conversion_type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[#8A8A88]">
                        {formatDateTime(c.converted_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Historique d'activit\u00e9 ── */}
          <SectionCard
            title="Historique d'activit\u00e9"
            icon={<Clock size={16} />}
          >
            {activity_log.length === 0 ? (
              <p className="text-[13px] text-[#8A8A88]">
                Aucune activit\u00e9 enregistr\u00e9e.
              </p>
            ) : (
              <div className="space-y-0 max-h-[500px] overflow-y-auto">
                {activity_log.map((activity, idx) => {
                  const cfg = ACTIVITY_ICONS[activity.activity_type] || {
                    icon: ArrowRight,
                    color: "text-gray-500",
                    bg: "bg-gray-100",
                  };
                  const IconComponent = cfg.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 py-3 border-b border-[#EFEFEF] last:border-0"
                    >
                      {/* Icon */}
                      <div
                        className={`w-7 h-7 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        <IconComponent size={13} className={cfg.color} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#191919]">
                          {activity.description}
                        </p>
                        <p className="text-[11px] text-[#ACACAA] mt-0.5">
                          {relativeDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── RIGHT COLUMN (1/3) ── */}
        <div className="space-y-6">
          {/* ── Notes ── */}
          <SectionCard title="Notes" icon={<StickyNote size={16} />}>
            {/* Add note form */}
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note..."
                className="w-full min-h-[80px] px-3 py-2 text-[13px] text-[#191919] bg-[#F7F7F5] border border-[#E6E6E4] rounded-md resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] placeholder:text-[#ACACAA]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleAddNote();
                  }
                }}
              />
              <button
                onClick={handleAddNote}
                disabled={noteSubmitting || !newNote.trim()}
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#4F46E5] text-white text-[12px] font-medium rounded-md hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {noteSubmitting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Send size={12} />
                )}
                Ajouter
              </button>
            </div>

            {/* Notes list */}
            {sortedNotes.length === 0 ? (
              <p className="text-[12px] text-[#8A8A88]">Aucune note</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {sortedNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-md border ${
                      note.pinned
                        ? "border-[#4F46E5]/20 bg-[#EEF2FF]/30"
                        : "border-[#E6E6E4] bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] text-[#191919] whitespace-pre-wrap flex-1">
                        {note.content}
                      </p>
                      {note.pinned && (
                        <Pin
                          size={12}
                          className="text-[#4F46E5] flex-shrink-0 mt-0.5"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-[#8A8A88]">
                        {note.author_email}
                      </span>
                      <span className="text-[10px] text-[#ACACAA]">
                        {relativeDate(note.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Actions rapides ── */}
          <SectionCard title="Actions rapides" icon={<Target size={16} />}>
            <div className="space-y-4">
              {/* Change status */}
              <div>
                <label className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide block mb-1.5">
                  Changer le statut
                </label>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={patchLoading}
                  className="w-full px-3 py-2 text-[13px] text-[#191919] bg-[#F7F7F5] border border-[#E6E6E4] rounded-md focus:outline-none focus:border-[#4F46E5] disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assign owner */}
              <div>
                <label className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide block mb-1.5">
                  Assigner un owner
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ownerInput}
                    onChange={(e) => setOwnerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveOwner();
                    }}
                    placeholder="email@example.com"
                    className="flex-1 px-3 py-2 text-[13px] text-[#191919] bg-[#F7F7F5] border border-[#E6E6E4] rounded-md focus:outline-none focus:border-[#4F46E5] placeholder:text-[#ACACAA]"
                  />
                  <button
                    onClick={handleSaveOwner}
                    disabled={patchLoading}
                    className="px-3 py-2 bg-[#4F46E5] text-white text-[12px] font-medium rounded-md hover:bg-[#4338CA] disabled:opacity-40 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>

              {/* Add tag */}
              <div>
                <label className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide block mb-1.5">
                  Ajouter un tag
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTag();
                    }}
                    placeholder="Nom du tag"
                    className="flex-1 px-3 py-2 text-[13px] text-[#191919] bg-[#F7F7F5] border border-[#E6E6E4] rounded-md focus:outline-none focus:border-[#4F46E5] placeholder:text-[#ACACAA]"
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={patchLoading || !tagInput.trim()}
                    className="px-3 py-2 bg-[#4F46E5] text-white text-[12px] font-medium rounded-md hover:bg-[#4338CA] disabled:opacity-40 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#EFEFEF]" />

              {/* Recalculate score */}
              <button
                onClick={handleRecalculateScore}
                disabled={scoreRecalculating || patchLoading}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-medium text-[#4F46E5] border border-[#4F46E5]/30 rounded-md hover:bg-[#EEF2FF] disabled:opacity-40 transition-colors"
              >
                <RefreshCw
                  size={13}
                  className={scoreRecalculating ? "animate-spin" : ""}
                />
                Recalculer le score
              </button>

              {/* Match to user */}
              <button
                onClick={handleMatchUsers}
                disabled={matchingUsers || patchLoading}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-medium text-[#5A5A58] border border-[#E6E6E4] rounded-md hover:bg-[#F7F7F5] disabled:opacity-40 transition-colors"
              >
                {matchingUsers ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <UserCheck size={13} />
                )}
                Matcher avec un utilisateur
              </button>
            </div>
          </SectionCard>

          {/* ── Message (if any) ── */}
          {lead.message && (
            <SectionCard title="Message" icon={<Mail size={16} />}>
              <p className="text-[13px] text-[#191919] whitespace-pre-wrap leading-relaxed">
                {lead.message}
              </p>
            </SectionCard>
          )}
        </div>
      </div>

      {/* Click-outside handler for status dropdown */}
      {statusDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setStatusDropdownOpen(false)}
        />
      )}
    </div>
  );
}
