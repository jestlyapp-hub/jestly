"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Users,
  CalendarDays,
  TrendingUp,
  X,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  Link2,
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
  CheckSquare,
  ChevronDown,
  Percent,
  Sparkles,
  Pin,
  Send,
  Loader2,
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
  type: string;
  description: string;
  created_at: string;
}

interface LeadTouch {
  id: string;
  lead_id: string;
  touch_type: string;
  landing_path: string | null;
  utm_source: string | null;
  created_at: string;
}

interface Kpis {
  total: number;
  this_week: number;
  this_month: number;
  avg_score: number;
  qualified_pct: number;
  converted_pct: number;
}

interface Campaign {
  id: string;
  name: string;
}

// ── Constants ──────────────────────────────────────────────────────
const STATUS_LIST = [
  { value: "", label: "Tous" },
  { value: "new", label: "Nouveau" },
  { value: "contacted", label: "Contacté" },
  { value: "qualified", label: "Qualifié" },
  { value: "nurturing", label: "Nurturing" },
  { value: "converted_signup", label: "Converti Signup" },
  { value: "converted_paid", label: "Converti Paid" },
  { value: "lost", label: "Perdu" },
  { value: "spam", label: "Spam" },
];

const SOURCES = [
  { value: "", label: "Toutes les sources" },
  { value: "contact-form", label: "Formulaire" },
  { value: "newsletter", label: "Newsletter" },
  { value: "checkout", label: "Checkout" },
  { value: "brief", label: "Brief" },
];

const QUALITY_TIERS = [
  { value: "", label: "Toutes qualités" },
  { value: "unknown", label: "Unknown" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "premium", label: "Premium" },
];

const SOURCE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  "contact-form": { bg: "bg-blue-50", text: "text-blue-700", label: "Formulaire" },
  newsletter: { bg: "bg-purple-50", text: "text-purple-700", label: "Newsletter" },
  checkout: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Checkout" },
  brief: { bg: "bg-amber-50", text: "text-amber-700", label: "Brief" },
};

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: "bg-blue-50", text: "text-blue-700", label: "Nouveau" },
  contacted: { bg: "bg-amber-50", text: "text-amber-700", label: "Contacté" },
  qualified: { bg: "bg-green-50", text: "text-green-700", label: "Qualifié" },
  nurturing: { bg: "bg-indigo-50", text: "text-indigo-700", label: "Nurturing" },
  converted_signup: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Signup" },
  converted_paid: { bg: "bg-teal-50", text: "text-teal-700", label: "Paid" },
  lost: { bg: "bg-red-50", text: "text-red-700", label: "Perdu" },
  spam: { bg: "bg-gray-100", text: "text-gray-500", label: "Spam" },
  archived: { bg: "bg-gray-100", text: "text-gray-500", label: "Archivé" },
};

const QUALITY_BADGE: Record<string, { bg: string; text: string }> = {
  unknown: { bg: "bg-gray-100", text: "text-gray-500" },
  low: { bg: "bg-red-50", text: "text-red-600" },
  medium: { bg: "bg-amber-50", text: "text-amber-700" },
  high: { bg: "bg-green-50", text: "text-green-700" },
  premium: { bg: "bg-indigo-50", text: "text-indigo-700" },
};

const ACTIVITY_ICONS: Record<string, { icon: typeof Plus; color: string }> = {
  created: { icon: Plus, color: "text-green-500" },
  status_change: { icon: ArrowRight, color: "text-blue-500" },
  note_added: { icon: StickyNote, color: "text-purple-500" },
  tag_added: { icon: Tag, color: "text-amber-500" },
  tag_removed: { icon: Tag, color: "text-amber-500" },
  score_change: { icon: BarChart3, color: "text-blue-500" },
  signup: { icon: UserCheck, color: "text-emerald-500" },
  payment: { icon: CreditCard, color: "text-teal-500" },
  owner_change: { icon: UserCog, color: "text-gray-500" },
  campaign_attributed: { icon: Target, color: "text-indigo-500" },
};

const PAGE_SIZE = 50;

// ── Helpers ────────────────────────────────────────────────────────
function relativeDate(d: string): string {
  const now = new Date();
  const date = new Date(d);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `il y a ${diffD}j`;
  if (diffD < 30) return `il y a ${Math.floor(diffD / 7)}sem`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatDateTime(d: string): string {
  return new Date(d).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Source Badge ───────────────────────────────────────────────────
function SourceBadge({ source }: { source: string | null }) {
  const badge = source ? SOURCE_BADGE[source] : null;
  if (!badge) {
    return (
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
        {source || "—"}
      </span>
    );
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${badge.bg} ${badge.text}`}>
      {badge.label}
    </span>
  );
}

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGE[status] || { bg: "bg-gray-100", text: "text-gray-500", label: status };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${badge.bg} ${badge.text}`}>
      {badge.label}
    </span>
  );
}

// ── Quality Badge ─────────────────────────────────────────────────
function QualityBadge({ tier }: { tier: string | null }) {
  if (!tier) return <span className="text-[11px] text-[#8A8A88]">—</span>;
  const badge = QUALITY_BADGE[tier] || { bg: "bg-gray-100", text: "text-gray-500" };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${badge.bg} ${badge.text}`}>
      {tier}
    </span>
  );
}

// ── Score Display ─────────────────────────────────────────────────
function ScoreDisplay({ score }: { score: number | null }) {
  if (score == null) return <span className="text-[11px] text-[#8A8A88]">—</span>;
  const color = score >= 60 ? "text-green-600" : score >= 30 ? "text-amber-600" : "text-red-500";
  return <span className={`text-[13px] font-semibold tabular-nums ${color}`}>{score}</span>;
}

// ── Detail Drawer ─────────────────────────────────────────────────
function LeadDrawer({
  lead,
  onClose,
  onUpdate,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdate: (updated: Partial<Lead>) => void;
}) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [touches, setTouches] = useState<LeadTouch[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [editOwner, setEditOwner] = useState(lead.owner || "");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Fetch detail data
  useEffect(() => {
    let cancelled = false;
    async function fetchDetail() {
      setLoadingDetail(true);
      try {
        const res = await fetch(`/api/admin/leads/${lead.id}`);
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) {
            setNotes(json.notes || []);
            setActivities(json.activities || []);
            setTouches(json.touches || []);
          }
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    }
    fetchDetail();
    return () => { cancelled = true; };
  }, [lead.id]);

  // ── Actions ──
  const changeStatus = async (newStatus: string) => {
    setStatusDropdownOpen(false);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) onUpdate({ status: newStatus });
    } catch { /* silent */ }
  };

  const addTag = async () => {
    const tag = newTag.trim();
    if (!tag) return;
    const currentTags = lead.tags || [];
    if (currentTags.includes(tag)) { setNewTag(""); return; }
    const updatedTags = [...currentTags, tag];
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTags }),
      });
      if (res.ok) {
        onUpdate({ tags: updatedTags });
        setNewTag("");
      }
    } catch { /* silent */ }
  };

  const removeTag = async (tag: string) => {
    const updatedTags = (lead.tags || []).filter((t) => t !== tag);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTags }),
      });
      if (res.ok) onUpdate({ tags: updatedTags });
    } catch { /* silent */ }
  };

  const saveOwner = async () => {
    const trimmed = editOwner.trim();
    if (trimmed === (lead.owner || "")) return;
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: trimmed || null }),
      });
      if (res.ok) onUpdate({ owner: trimmed || null });
    } catch { /* silent */ }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes((prev) => [note, ...prev]);
        setNewNote("");
      }
    } catch { /* silent */ }
    finally { setSavingNote(false); }
  };

  const togglePinNote = async (noteId: string, pinned: boolean) => {
    try {
      await fetch(`/api/admin/leads/${lead.id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_id: noteId, pinned: !pinned }),
      });
      setNotes((prev) => prev.map((n) => n.id === noteId ? { ...n, pinned: !pinned } : n));
    } catch { /* silent */ }
  };

  const recalculateScore = async () => {
    setRecalculating(true);
    try {
      const res = await fetch("/api/admin/leads/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "compute_scores", lead_ids: [lead.id] }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.scores && json.scores[lead.id] != null) {
          onUpdate({ score: json.scores[lead.id] });
        }
      }
    } catch { /* silent */ }
    finally { setRecalculating(false); }
  };

  const utmItems = [
    { label: "Source", value: lead.utm_source },
    { label: "Medium", value: lead.utm_medium },
    { label: "Campaign", value: lead.utm_campaign },
    { label: "Content", value: lead.utm_content },
    { label: "Term", value: lead.utm_term },
  ].filter((i) => i.value);

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [notes]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white border-l border-[#E6E6E4] z-50 shadow-xl overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E6E6E4] px-6 py-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-[#191919] truncate">
              {lead.name || lead.email.split("@")[0]}
            </h2>
            <p className="text-[12px] text-[#8A8A88] truncate">{lead.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer flex-shrink-0"
          >
            <X size={18} strokeWidth={1.5} className="text-[#666]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Identity */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wide">
              Contact
            </h3>
            <div className="space-y-2.5">
              {lead.company && (
                <div className="flex items-center gap-2.5 text-[13px] text-[#191919]">
                  <Building2 size={14} strokeWidth={1.5} className="text-[#999] flex-shrink-0" />
                  {lead.company}
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2.5 text-[13px] text-[#191919]">
                  <Phone size={14} strokeWidth={1.5} className="text-[#999] flex-shrink-0" />
                  {lead.phone}
                </div>
              )}
            </div>
          </section>

          {/* Source + Status */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wide">
              Source & Statut
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              <SourceBadge source={lead.source} />
              {/* Status with dropdown */}
              <div className="relative">
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="cursor-pointer"
                >
                  <StatusBadge status={lead.status} />
                </button>
                {statusDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg z-20 py-1 min-w-[160px]">
                      {STATUS_LIST.filter((s) => s.value).map((s) => (
                        <button
                          key={s.value}
                          onClick={() => changeStatus(s.value)}
                          className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#F7F7F5] transition-colors cursor-pointer ${
                            lead.status === s.value ? "font-semibold text-[#4F46E5]" : "text-[#5A5A58]"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Score + Quality */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wide">
              Score & Qualité
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ScoreDisplay score={lead.score} />
                <button
                  onClick={recalculateScore}
                  disabled={recalculating}
                  className="p-1 rounded hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-50"
                  title="Recalculer le score"
                >
                  {recalculating ? (
                    <Loader2 size={13} className="animate-spin text-[#8A8A88]" />
                  ) : (
                    <RefreshCw size={13} strokeWidth={1.5} className="text-[#8A8A88]" />
                  )}
                </button>
              </div>
              <QualityBadge tier={lead.quality_tier} />
            </div>
          </section>

          {/* Attribution */}
          {(utmItems.length > 0 || lead.referrer || lead.landing_page || lead.first_touch_source || lead.last_touch_source || lead.campaign_name) && (
            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wide">
                Attribution
              </h3>
              <div className="space-y-2 text-[13px]">
                {utmItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[#8A8A88]">UTM {item.label}</span>
                    <span className="text-[#191919] font-medium truncate ml-4 max-w-[200px]">{item.value}</span>
                  </div>
                ))}
                {lead.referrer && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A8A88]">Referrer</span>
                    <span className="text-[#191919] truncate ml-4 max-w-[200px]">{lead.referrer}</span>
                  </div>
                )}
                {lead.landing_page && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A8A88]">Landing page</span>
                    <span className="text-[#191919] font-mono text-[12px] truncate ml-4 max-w-[200px]">{lead.landing_page}</span>
                  </div>
                )}
                {lead.first_touch_source && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A8A88]">First touch</span>
                    <span className="text-[#191919] font-medium">{lead.first_touch_source}</span>
                  </div>
                )}
                {lead.last_touch_source && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A8A88]">Last touch</span>
                    <span className="text-[#191919] font-medium">{lead.last_touch_source}</span>
                  </div>
                )}
                {lead.campaign_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A8A88]">Campagne</span>
                    <span className="text-[#4F46E5] font-medium">{lead.campaign_name}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Conversion */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wide">
              Conversion
            </h3>
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[#8A8A88]">Inscrit ?</span>
                {lead.converted_user_id ? (
                  <span className="text-emerald-600 font-medium">
                    Oui
                    {lead.converted_at && (
                      <span className="text-[#8A8A88] font-normal ml-1.5 text-[11px]">
                        {relativeDate(lead.converted_at)}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-[#8A8A88]">Non</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A8A88]">Payant ?</span>
                {lead.converted_paid_at ? (
                  <span className="text-teal-600 font-medium">
                    Oui
                    <span className="text-[#8A8A88] font-normal ml-1.5 text-[11px]">
                      {relativeDate(lead.converted_paid_at)}
                    </span>
                  </span>
                ) : (
                  <span className="text-[#8A8A88]">Non</span>
                )}
              </div>
            </div>
          </section>

          {/* Tags */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wide">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(lead.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EEF2FF] text-[#4F46E5]"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X size={11} strokeWidth={2} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
                placeholder="Ajouter un tag..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#F7F7F5] border border-[#EFEFEF] text-[12px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-indigo-500/10"
              />
              <button
                onClick={addTag}
                className="px-3 py-2 rounded-lg bg-[#F7F7F5] border border-[#EFEFEF] text-[12px] text-[#5A5A58] hover:bg-[#E6E6E4] transition-colors cursor-pointer"
              >
                <Plus size={14} strokeWidth={1.5} />
              </button>
            </div>
          </section>

          {/* Owner */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wide">
              Owner
            </h3>
            <input
              type="text"
              value={editOwner}
              onChange={(e) => setEditOwner(e.target.value)}
              onBlur={saveOwner}
              placeholder="Assigner un owner..."
              className="w-full px-3 py-2 rounded-lg bg-[#F7F7F5] border border-[#EFEFEF] text-[13px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-indigo-500/10"
            />
          </section>

          {/* Message */}
          {lead.message && (
            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wide">
                Message
              </h3>
              <div className="flex gap-2.5">
                <MessageSquare size={14} strokeWidth={1.5} className="text-[#999] flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#5A5A58] leading-relaxed whitespace-pre-wrap">
                  {lead.message}
                </p>
              </div>
            </section>
          )}

          {/* Notes */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wide">
              Notes
            </h3>
            {/* Add note */}
            <div className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg bg-[#F7F7F5] border border-[#EFEFEF] text-[13px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-indigo-500/10 resize-none"
              />
              <button
                onClick={addNote}
                disabled={savingNote || !newNote.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F46E5] text-white text-[12px] font-medium hover:bg-[#4338CA] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingNote ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={13} strokeWidth={1.5} />
                )}
                Enregistrer
              </button>
            </div>
            {/* Notes list */}
            {loadingDetail ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#F7F7F5]">
                    <div className="w-32 h-3 bg-[#F0F0EE] rounded animate-pulse mb-2" />
                    <div className="w-full h-3 bg-[#F0F0EE] rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : sortedNotes.length > 0 ? (
              <div className="space-y-2">
                {sortedNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg border text-[13px] ${
                      note.pinned ? "bg-amber-50/50 border-amber-200" : "bg-[#F7F7F5] border-[#EFEFEF]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-[#8A8A88]">
                        {note.author_email} · {relativeDate(note.created_at)}
                      </span>
                      <button
                        onClick={() => togglePinNote(note.id, note.pinned)}
                        className="p-0.5 rounded hover:bg-white/80 transition-colors cursor-pointer"
                        title={note.pinned ? "Désépingler" : "Épingler"}
                      >
                        <Pin
                          size={12}
                          strokeWidth={1.5}
                          className={note.pinned ? "text-amber-500 fill-amber-500" : "text-[#CCCCCC]"}
                        />
                      </button>
                    </div>
                    <p className="text-[#5A5A58] leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#8A8A88]">Aucune note</p>
            )}
          </section>

          {/* Historique */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wide">
              Historique
            </h3>
            {loadingDetail ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#F0F0EE] animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="w-48 h-3 bg-[#F0F0EE] rounded animate-pulse" />
                      <div className="w-20 h-2.5 bg-[#F0F0EE] rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((act) => {
                  const ai = ACTIVITY_ICONS[act.type] || { icon: ArrowRight, color: "text-gray-400" };
                  const Icon = ai.icon;
                  return (
                    <div key={act.id} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full bg-[#F7F7F5] flex items-center justify-center flex-shrink-0 ${ai.color}`}>
                        <Icon size={12} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#5A5A58]">{act.description}</p>
                        <p className="text-[11px] text-[#8A8A88]">{relativeDate(act.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[12px] text-[#8A8A88]">Aucune activité</p>
            )}
          </section>

          {/* Touches d'attribution */}
          {touches.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wide">
                Touches d&apos;attribution
              </h3>
              <div className="space-y-2">
                {touches.map((t) => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-[#F7F7F5] border border-[#EFEFEF] text-[12px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[#191919] capitalize">{t.touch_type}</span>
                      <span className="text-[#8A8A88] text-[11px]">{relativeDate(t.created_at)}</span>
                    </div>
                    {t.landing_path && (
                      <p className="text-[#8A8A88] font-mono text-[11px] truncate">{t.landing_path}</p>
                    )}
                    {t.utm_source && (
                      <p className="text-[#8A8A88] text-[11px]">UTM: {t.utm_source}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Metadata */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wide">
              Métadonnées
            </h3>
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[#8A8A88]">Créé le</span>
                <span className="text-[#191919]">{formatDateTime(lead.created_at)}</span>
              </div>
              {lead.page_path && (
                <div className="flex items-center justify-between">
                  <span className="text-[#8A8A88]">Page</span>
                  <span className="text-[#191919] font-mono text-[12px]">{lead.page_path}</span>
                </div>
              )}
              {lead.block_type && (
                <div className="flex items-center justify-between">
                  <span className="text-[#8A8A88]">Bloc</span>
                  <span className="text-[#191919]">{lead.block_type}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[#8A8A88]">ID</span>
                <span className="text-[#191919] font-mono text-[11px]">{lead.id.slice(0, 12)}...</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

// ── Bulk Action Modal ─────────────────────────────────────────────
function BulkStatusModal({
  count,
  onConfirm,
  onClose,
}: {
  count: number;
  onConfirm: (status: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border border-[#E6E6E4] shadow-xl z-50 p-5 w-full max-w-sm">
        <h3 className="text-[15px] font-semibold text-[#191919] mb-3">
          Changer le statut ({count} lead{count > 1 ? "s" : ""})
        </h3>
        <div className="space-y-1">
          {STATUS_LIST.filter((s) => s.value).map((s) => (
            <button
              key={s.value}
              onClick={() => onConfirm(s.value)}
              className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-3 w-full px-3 py-2 rounded-lg border border-[#E6E6E4] text-[12px] text-[#8A8A88] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
        >
          Annuler
        </button>
      </div>
    </>
  );
}

function BulkTagModal({
  count,
  onConfirm,
  onClose,
}: {
  count: number;
  onConfirm: (tag: string) => void;
  onClose: () => void;
}) {
  const [tag, setTag] = useState("");
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border border-[#E6E6E4] shadow-xl z-50 p-5 w-full max-w-sm">
        <h3 className="text-[15px] font-semibold text-[#191919] mb-3">
          Ajouter un tag ({count} lead{count > 1 ? "s" : ""})
        </h3>
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && tag.trim()) onConfirm(tag.trim()); }}
          placeholder="Nom du tag..."
          className="w-full px-3 py-2.5 rounded-lg bg-[#F7F7F5] border border-[#EFEFEF] text-[13px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-indigo-500/10 mb-3"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={() => { if (tag.trim()) onConfirm(tag.trim()); }}
            disabled={!tag.trim()}
            className="flex-1 px-3 py-2 rounded-lg bg-[#4F46E5] text-white text-[12px] font-medium hover:bg-[#4338CA] transition-colors cursor-pointer disabled:opacity-50"
          >
            Ajouter
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-[#E6E6E4] text-[12px] text-[#8A8A88] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </div>
    </>
  );
}

function BulkOwnerModal({
  count,
  onConfirm,
  onClose,
}: {
  count: number;
  onConfirm: (owner: string) => void;
  onClose: () => void;
}) {
  const [owner, setOwner] = useState("");
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl border border-[#E6E6E4] shadow-xl z-50 p-5 w-full max-w-sm">
        <h3 className="text-[15px] font-semibold text-[#191919] mb-3">
          Assigner un owner ({count} lead{count > 1 ? "s" : ""})
        </h3>
        <input
          type="text"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && owner.trim()) onConfirm(owner.trim()); }}
          placeholder="Nom ou email du owner..."
          className="w-full px-3 py-2.5 rounded-lg bg-[#F7F7F5] border border-[#EFEFEF] text-[13px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-indigo-500/10 mb-3"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={() => { if (owner.trim()) onConfirm(owner.trim()); }}
            disabled={!owner.trim()}
            className="flex-1 px-3 py-2 rounded-lg bg-[#4F46E5] text-white text-[12px] font-medium hover:bg-[#4338CA] transition-colors cursor-pointer disabled:opacity-50"
          >
            Assigner
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-[#E6E6E4] text-[12px] text-[#8A8A88] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [kpis, setKpis] = useState<Kpis>({
    total: 0,
    this_week: 0,
    this_month: 0,
    avg_score: 0,
    qualified_pct: 0,
    converted_pct: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [quality, setQuality] = useState("");
  const [campaign, setCampaign] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Bulk action modals
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkTagOpen, setBulkTagOpen] = useState(false);
  const [bulkOwnerOpen, setBulkOwnerOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Fetch campaigns on mount
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch("/api/admin/campaigns");
        if (res.ok) {
          const json = await res.json();
          setCampaigns(json.data || []);
        }
      } catch { /* silent */ }
    }
    fetchCampaigns();
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (source) params.set("source", source);
    if (status) params.set("status", status);
    if (quality) params.set("quality_tier", quality);
    if (campaign) params.set("campaign_id", campaign);
    if (ownerFilter) params.set("owner", ownerFilter);
    params.set("sort", sort);
    params.set("order", order);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));

    try {
      const res = await fetch(`/api/admin/leads?${params}`);
      const json = await res.json();
      setLeads(json.data || []);
      setTotal(json.total || 0);
      if (json.kpis) {
        setKpis({
          total: json.kpis.total || 0,
          this_week: json.kpis.this_week || 0,
          this_month: json.kpis.this_month || 0,
          avg_score: json.kpis.avg_score || 0,
          qualified_pct: json.kpis.qualified_pct || 0,
          converted_pct: json.kpis.converted_pct || 0,
        });
      }
    } catch {
      setLeads([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, source, status, quality, campaign, ownerFilter, sort, order, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
    setSelectedIds(new Set());
  }, [search, source, status, quality, campaign, ownerFilter, sort, order]);

  const handleSearchChange = (v: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(v), 300);
  };

  const toggleOrder = () => {
    setOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Selection ──
  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Bulk actions ──
  const bulkChangeStatus = async (newStatus: string) => {
    setBulkStatusOpen(false);
    setBulkLoading(true);
    try {
      await fetch("/api/admin/leads/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_status",
          lead_ids: Array.from(selectedIds),
          status: newStatus,
        }),
      });
      setSelectedIds(new Set());
      fetchLeads();
    } catch { /* silent */ }
    finally { setBulkLoading(false); }
  };

  const bulkAddTag = async (tag: string) => {
    setBulkTagOpen(false);
    setBulkLoading(true);
    try {
      await fetch("/api/admin/leads/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_tag",
          lead_ids: Array.from(selectedIds),
          tag,
        }),
      });
      setSelectedIds(new Set());
      fetchLeads();
    } catch { /* silent */ }
    finally { setBulkLoading(false); }
  };

  const bulkAssignOwner = async (owner: string) => {
    setBulkOwnerOpen(false);
    setBulkLoading(true);
    try {
      await fetch("/api/admin/leads/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_owner",
          lead_ids: Array.from(selectedIds),
          owner,
        }),
      });
      setSelectedIds(new Set());
      fetchLeads();
    } catch { /* silent */ }
    finally { setBulkLoading(false); }
  };

  const bulkComputeScores = async () => {
    setBulkLoading(true);
    try {
      await fetch("/api/admin/leads/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "compute_scores",
          lead_ids: Array.from(selectedIds),
        }),
      });
      setSelectedIds(new Set());
      fetchLeads();
    } catch { /* silent */ }
    finally { setBulkLoading(false); }
  };

  // ── Update lead in local state (from drawer) ──
  const handleLeadUpdate = (updated: Partial<Lead>) => {
    setSelectedLead((prev) => prev ? { ...prev, ...updated } : null);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === selectedLead?.id ? { ...l, ...updated } : l
      )
    );
  };

  // ── KPI cards ──
  const kpiCards = [
    { label: "Total leads", value: kpis.total, icon: Users },
    { label: "Cette semaine", value: kpis.this_week, icon: TrendingUp },
    { label: "Ce mois", value: kpis.this_month, icon: CalendarDays },
    { label: "Score moyen", value: kpis.avg_score, icon: BarChart3, suffix: "" },
    { label: "Qualified", value: `${kpis.qualified_pct}%`, icon: Sparkles },
    { label: "Converted", value: `${kpis.converted_pct}%`, icon: Percent },
  ];

  // ── Skeleton rows ──
  const SkeletonRows = () => (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-[#F0F0EE]">
          <td className="px-3 py-3.5 w-10">
            <div className="w-4 h-4 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-4 py-3.5">
            <div className="space-y-1.5">
              <div className="w-28 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
              <div className="w-36 h-2.5 bg-[#F0F0EE] rounded animate-pulse" />
            </div>
          </td>
          <td className="px-4 py-3.5">
            <div className="w-16 h-5 bg-[#F0F0EE] rounded-full animate-pulse" />
          </td>
          <td className="px-4 py-3.5">
            <div className="w-20 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-4 py-3.5">
            <div className="w-14 h-5 bg-[#F0F0EE] rounded-full animate-pulse" />
          </td>
          <td className="px-4 py-3.5">
            <div className="w-8 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-4 py-3.5">
            <div className="w-14 h-5 bg-[#F0F0EE] rounded-full animate-pulse" />
          </td>
          <td className="px-4 py-3.5">
            <div className="w-12 h-5 bg-[#F0F0EE] rounded-full animate-pulse" />
          </td>
          <td className="px-4 py-3.5">
            <div className="w-16 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-4 py-3.5">
            <div className="w-14 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-5">
      <AdminHeader
        title="Leads CRM"
        description={`${total} lead${total > 1 ? "s" : ""} au total`}
        section="Leads"
      />

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-lg border border-[#E6E6E4] px-4 py-3.5"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[#8A8A88] font-medium">
                {kpi.label}
              </span>
              <kpi.icon size={14} strokeWidth={1.5} className="text-[#CCCCCC]" />
            </div>
            <p className="text-[20px] font-bold text-[#191919] tabular-nums">
              {loading ? "..." : kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters bar ── */}
      <div className="space-y-3">
        {/* Search + dropdowns */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              size={16}
              strokeWidth={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
            />
            <input
              type="text"
              placeholder="Rechercher nom, email, entreprise..."
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white border border-[#E6E6E4] text-[13px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-white border border-[#E6E6E4] text-[12px] text-[#666] outline-none cursor-pointer"
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-white border border-[#E6E6E4] text-[12px] text-[#666] outline-none cursor-pointer"
          >
            {QUALITY_TIERS.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>

          <select
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-white border border-[#E6E6E4] text-[12px] text-[#666] outline-none cursor-pointer"
          >
            <option value="">Toutes campagnes</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="relative min-w-[120px]">
            <input
              type="text"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              placeholder="Owner..."
              className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E6E6E4] text-[12px] text-[#666] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-indigo-500/10"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleOrder}
              className="p-2 rounded-lg bg-white border border-[#E6E6E4] text-[#666] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
              title={order === "desc" ? "Tri descendant" : "Tri ascendant"}
            >
              <ArrowUpDown size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_LIST.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
                status === s.value
                  ? "bg-[#4F46E5] text-white"
                  : "bg-white border border-[#E6E6E4] text-[#5A5A58] hover:bg-[#F7F7F5]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bulk Actions Bar ── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#EEF2FF] border border-indigo-200 rounded-lg">
          <span className="text-[13px] font-medium text-[#4F46E5]">
            {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setBulkStatusOpen(true)}
              disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E4] text-[12px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-50"
            >
              Changer statut
            </button>
            <button
              onClick={() => setBulkTagOpen(true)}
              disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E4] text-[12px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-50"
            >
              Ajouter tag
            </button>
            <button
              onClick={() => setBulkOwnerOpen(true)}
              disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E4] text-[12px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-50"
            >
              Assigner owner
            </button>
            <button
              onClick={bulkComputeScores}
              disabled={bulkLoading}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E4] text-[12px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-50"
            >
              {bulkLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                "Calculer scores"
              )}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
            >
              <X size={14} strokeWidth={1.5} className="text-[#5A5A58]" />
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] overflow-hidden">
        {!loading && leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#999]">
            <Users size={36} strokeWidth={1.2} className="mb-4 text-[#CCCCCC]" />
            <p className="text-[14px] font-medium text-[#8A8A88] text-center max-w-sm">
              Aucun lead pour le moment. Les leads apparaîtront ici automatiquement
              quand des visiteurs rempliront des formulaires sur vos sites.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E6E6E4] bg-[#FBFBFA]">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-[#E6E6E4] text-[#4F46E5] focus:ring-indigo-500/20 cursor-pointer accent-[#4F46E5]"
                    />
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                    Lead
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                    Source
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                    Campagne
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                    Score
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                    Qualité
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                    Tags
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                    Créé le
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows />
                ) : (
                  leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`border-b border-[#F0F0EE] hover:bg-[#FBFBFA] cursor-pointer transition-colors ${
                        selectedIds.has(lead.id) ? "bg-[#EEF2FF]/50" : ""
                      }`}
                    >
                      <td
                        className="px-3 py-3.5 w-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="w-3.5 h-3.5 rounded border-[#E6E6E4] text-[#4F46E5] focus:ring-indigo-500/20 cursor-pointer accent-[#4F46E5]"
                        />
                      </td>

                      <td
                        className="px-4 py-3.5"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#191919] truncate">
                            {lead.name || lead.email.split("@")[0]}
                          </p>
                          <p className="text-[11px] text-[#8A8A88] truncate">
                            {lead.email}
                            {lead.company && (
                              <span className="ml-1.5 text-[#ACACAA]">· {lead.company}</span>
                            )}
                          </p>
                        </div>
                      </td>

                      <td
                        className="px-4 py-3.5"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <SourceBadge source={lead.source} />
                      </td>

                      <td
                        className="px-4 py-3.5 text-[12px] text-[#5A5A58] truncate max-w-[140px]"
                        onClick={() => setSelectedLead(lead)}
                      >
                        {lead.campaign_name || "—"}
                      </td>

                      <td
                        className="px-4 py-3.5"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <StatusBadge status={lead.status} />
                      </td>

                      <td
                        className="px-4 py-3.5"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <ScoreDisplay score={lead.score} />
                      </td>

                      <td
                        className="px-4 py-3.5"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <QualityBadge tier={lead.quality_tier} />
                      </td>

                      <td
                        className="px-4 py-3.5"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {(lead.tags || []).slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EEF2FF] text-[#4F46E5] truncate max-w-[60px]"
                            >
                              {tag}
                            </span>
                          ))}
                          {(lead.tags || []).length > 2 && (
                            <span className="text-[10px] text-[#8A8A88]">
                              +{(lead.tags || []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      <td
                        className="px-4 py-3.5 text-[12px] text-[#5A5A58] truncate max-w-[100px]"
                        onClick={() => setSelectedLead(lead)}
                      >
                        {lead.owner || "—"}
                      </td>

                      <td
                        className="px-4 py-3.5 text-[12px] text-[#8A8A88] whitespace-nowrap"
                        onClick={() => setSelectedLead(lead)}
                      >
                        {relativeDate(lead.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-[12px] text-[#8A8A88]">
            {page * PAGE_SIZE + 1}&ndash;{Math.min((page + 1) * PAGE_SIZE, total)} sur {total}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E6E6E4] text-[12px] font-medium text-[#666] hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
              Précédent
            </button>
            <span className="px-3 py-1.5 text-[12px] text-[#5A5A58] font-medium">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E6E6E4] text-[12px] font-medium text-[#666] hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* ── Lead detail drawer ── */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}

      {/* ── Bulk modals ── */}
      {bulkStatusOpen && (
        <BulkStatusModal
          count={selectedIds.size}
          onConfirm={bulkChangeStatus}
          onClose={() => setBulkStatusOpen(false)}
        />
      )}
      {bulkTagOpen && (
        <BulkTagModal
          count={selectedIds.size}
          onConfirm={bulkAddTag}
          onClose={() => setBulkTagOpen(false)}
        />
      )}
      {bulkOwnerOpen && (
        <BulkOwnerModal
          count={selectedIds.size}
          onConfirm={bulkAssignOwner}
          onClose={() => setBulkOwnerOpen(false)}
        />
      )}
    </div>
  );
}
