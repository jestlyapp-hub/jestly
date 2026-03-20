"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";

import type {
  ProfileData, SettingsForm, SettingsFormActions,
} from "./components/shared";
import {
  SECTIONS, SEARCH_INDEX, SaveBar, CompletionWidget,
} from "./components/shared";

import { AccountSection } from "./components/AccountSection";
import { WorkspaceSection } from "./components/WorkspaceSection";
import { PreferencesSection } from "./components/PreferencesSection";
import { BillingSection } from "./components/BillingSection";
import { SubscriptionSection } from "./components/SubscriptionSection";
import { IntegrationsSection } from "./components/IntegrationsSection";
import { NotificationsSection } from "./components/NotificationsSection";
import { SecuritySection } from "./components/SecuritySection";
import { PrivacySection } from "./components/PrivacySection";
import { DangerZoneSection } from "./components/DangerZoneSection";

/* ══════════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════════ */

function buildForm(p: ProfileData): SettingsForm {
  return {
    fullName: p.full_name || "",
    phone: p.phone || "",
    role: p.role || "",
    locale: p.locale || "fr",
    timezone: p.timezone || "Europe/Paris",
    businessName: p.business_name || "",
    settings: { ...p.settings },
    workspace: { ...p.workspace },
    notifications: { ...p.notifications },
  };
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ══════════════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════════════ */

export default function SettingsPage() {
  /* ── Data fetching ── */
  const { data: profile, loading, mutate } = useApi<ProfileData>("/api/settings");

  /* ── Form state ── */
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [dirtySections, setDirtySections] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ── Active section (IntersectionObserver) ── */
  const [activeSection, setActiveSection] = useState<string>("compte");
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* ── Search ── */
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = searchQuery.trim().length >= 2
    ? SEARCH_INDEX.filter(entry =>
        entry.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
        entry.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  /* ── Init form from profile ── */
  useEffect(() => {
    if (profile && !form) setForm(buildForm(profile));
  }, [profile, form]);

  /* ── IntersectionObserver for sidebar active state ── */
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [form]);

  /* ── Saved flash ── */
  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(t);
    }
  }, [saved]);

  /* ── Actions ── */
  const markDirty = useCallback((section: string) => {
    setDirtySections(prev => {
      const next = new Set(prev);
      next.add(section);
      return next;
    });
  }, []);

  const actions: SettingsFormActions | null = form ? {
    setFullName: v => setForm(f => f ? { ...f, fullName: v } : f),
    setPhone: v => setForm(f => f ? { ...f, phone: v } : f),
    setRole: v => setForm(f => f ? { ...f, role: v } : f),
    setLocale: v => setForm(f => f ? { ...f, locale: v } : f),
    setTimezone: v => setForm(f => f ? { ...f, timezone: v } : f),
    setBusinessName: v => setForm(f => f ? { ...f, businessName: v } : f),
    updateSettings: patch => setForm(f => f ? { ...f, settings: { ...f.settings, ...patch } } : f),
    updateWorkspace: patch => setForm(f => f ? { ...f, workspace: { ...f.workspace, ...patch } } : f),
    updateNotifEmail: patch => setForm(f => f ? { ...f, notifications: { ...f.notifications, email: { ...f.notifications.email, ...patch } } } : f),
    updateNotifInApp: patch => setForm(f => f ? { ...f, notifications: { ...f.notifications, inApp: { ...f.notifications.inApp, ...patch } } } : f),
    updateNotifDigest: patch => setForm(f => f ? { ...f, notifications: { ...f.notifications, digest: { ...f.notifications.digest, ...patch } } } : f),
    markDirty,
  } : null;

  /* ── Save ── */
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    if (!form || !profile) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          business_name: form.businessName,
          phone: form.phone || null,
          role: form.role || null,
          locale: form.locale,
          timezone: form.timezone,
          settings: form.settings,
          workspace: form.workspace,
          notifications: form.notifications,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erreur HTTP ${res.status}`);
      }
      setDirtySections(new Set());
      setSaved(true);
      mutate();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }, [form, profile, mutate]);

  /* ── Cancel ── */
  const handleCancel = useCallback(() => {
    if (profile) {
      setForm(buildForm(profile));
      setDirtySections(new Set());
      setSaveError(null);
    }
  }, [profile]);

  /* ── Avatar change (immediate save, then refetch profile) ── */
  const handleAvatarChange = useCallback(() => {
    mutate();
  }, [mutate]);

  /* ── Reset preferences to defaults ── */
  const handleResetPreferences = useCallback(async () => {
    const defaults = {
      settings: {},
      workspace: {},
      notifications: {},
    };
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaults),
    });
    mutate();
    if (profile) {
      setForm(prev => prev ? {
        ...prev,
        settings: {},
        workspace: {},
        notifications: {},
      } : prev);
      setDirtySections(new Set());
    }
  }, [mutate, profile]);

  /* ── Loading state ── */
  if (loading || !profile || !form || !actions) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={24} className="animate-spin text-[#A8A29E]" />
      </div>
    );
  }

  const isDirty = dirtySections.size > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-[#191919]">Paramètres</h1>
        <p className="text-[14px] text-[#A8A29E] mt-1">Gérez votre compte, votre workspace et vos préférences.</p>

        {/* Search */}
        <div className="relative mt-4 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4C4C2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un paramètre..."
            className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-[#191919] placeholder:text-[#C4C4C2] focus:outline-none focus:border-[#7C3AED]/30 focus:ring-1 focus:ring-[#7C3AED]/20 transition-all"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg z-20 py-1">
              {searchResults.map(r => (
                <button
                  key={r.section}
                  onClick={() => { scrollToSection(r.section); setSearchQuery(""); }}
                  className="w-full text-left px-4 py-2.5 text-[13px] text-[#57534E] hover:bg-[#F7F7F5] transition-colors"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Layout: Sidebar + Content ── */}
      <div className="flex gap-8">
        {/* Sticky sidebar */}
        <nav className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24 space-y-0.5">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              const sectionDirty = dirtySections.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-left ${
                    isActive
                      ? "bg-[#F0EEFF] text-[#7C3AED]"
                      : "text-[#78716C] hover:bg-[#F7F7F5] hover:text-[#57534E]"
                  }`}
                >
                  <Icon size={15} className={isActive ? "text-[#7C3AED]" : "text-[#A8A29E]"} />
                  <span className="flex-1">{s.label}</span>
                  {sectionDirty && (
                    <span className="w-2 h-2 rounded-full bg-[#7C3AED] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          <CompletionWidget profile={profile} form={form} onNavigate={scrollToSection} />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <AccountSection profile={profile} form={form} actions={actions} dirty={dirtySections.has("compte")} onAvatarChange={handleAvatarChange} />
            <WorkspaceSection form={form} actions={actions} dirty={dirtySections.has("workspace")} />
            <PreferencesSection form={form} actions={actions} dirty={dirtySections.has("preferences")} />
            <BillingSection form={form} actions={actions} dirty={dirtySections.has("facturation")} />
            <SubscriptionSection profile={profile} />
            <IntegrationsSection profile={profile} />
            <NotificationsSection form={form} actions={actions} dirty={dirtySections.has("notifications")} />
            <SecuritySection profile={profile} />
            <PrivacySection form={form} actions={actions} dirty={dirtySections.has("donnees")} />
            <DangerZoneSection onResetPreferences={handleResetPreferences} />
          </motion.div>
        </div>
      </div>

      {/* ── SaveBar ── */}
      <SaveBar
        dirty={isDirty}
        saving={saving}
        saved={saved}
        error={saveError}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
