"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { apiFetch } from "@/lib/hooks/use-api";

/* ═══════════════════════════════════════════════════════════
   USER PREFERENCES — Context + Hook

   Charge les préférences utilisateur depuis /api/settings
   et les expose à toute l'app via usePreferences().
   ═══════════════════════════════════════════════════════════ */

export interface UserPreferences {
  defaultPage: string;
  dateFormat: string;
  calendarView: "week" | "month" | "day";
  amountDisplay: "ht" | "ttc";
  weekStartsMonday: boolean;
  compactMode: boolean;
}

const DEFAULTS: UserPreferences = {
  defaultPage: "dashboard",
  dateFormat: "dd/MM/yyyy",
  calendarView: "week",
  amountDisplay: "ht",
  weekStartsMonday: true,
  compactMode: false,
};

interface PreferencesContextValue {
  preferences: UserPreferences;
  loading: boolean;
  update: (key: keyof UserPreferences, value: UserPreferences[keyof UserPreferences]) => void;
}

const PreferencesContext = createContext<PreferencesContextValue>({
  preferences: DEFAULTS,
  loading: true,
  update: () => {},
});

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  // Load preferences from API on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<{ settings?: Record<string, unknown> }>("/api/settings");
        if (cancelled) return;
        const s = data?.settings || {};
        setPreferences({
          defaultPage: (s.defaultPage as string) || DEFAULTS.defaultPage,
          dateFormat: (s.dateFormat as string) || DEFAULTS.dateFormat,
          calendarView: (s.calendarView as UserPreferences["calendarView"]) || DEFAULTS.calendarView,
          amountDisplay: (s.amountDisplay as UserPreferences["amountDisplay"]) || DEFAULTS.amountDisplay,
          weekStartsMonday: typeof s.weekStartsMonday === "boolean" ? s.weekStartsMonday : DEFAULTS.weekStartsMonday,
          compactMode: typeof s.compactMode === "boolean" ? s.compactMode : DEFAULTS.compactMode,
        });
      } catch {
        // Keep defaults on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Apply compact mode as data attribute on body
  useEffect(() => {
    document.documentElement.setAttribute("data-compact", preferences.compactMode ? "true" : "false");
  }, [preferences.compactMode]);

  // Update a single preference optimistically + persist
  const update = useCallback((key: keyof UserPreferences, value: UserPreferences[keyof UserPreferences]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    // Persist in background
    apiFetch("/api/settings", {
      method: "PATCH",
      body: { settings: { [key]: value } },
    }).catch(() => {
      // Revert would be complex — the settings page handles errors via its own form
    });
  }, []);

  return (
    <PreferencesContext.Provider value={{ preferences, loading, update }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  return useContext(PreferencesContext);
}

/* ═══════════════════════════════════════════════════════════
   DATE FORMATTING UTILITY
   ═══════════════════════════════════════════════════════════ */

export function formatDateWithPreference(iso: string | null | undefined, format: string): string {
  if (!iso) return "\u2014";
  try {
    const d = new Date(iso.includes("T") ? iso : iso + "T00:00:00");
    if (isNaN(d.getTime())) return "\u2014";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear());

    switch (format) {
      case "MM/dd/yyyy":
        return `${month}/${day}/${year}`;
      case "yyyy-MM-dd":
        return `${year}-${month}-${day}`;
      case "dd/MM/yyyy":
      default:
        return `${day}/${month}/${year}`;
    }
  } catch {
    return "\u2014";
  }
}

/* ═══════════════════════════════════════════════════════════
   AMOUNT FORMATTING UTILITY
   ═══════════════════════════════════════════════════════════ */

const DEFAULT_TVA_RATE = 0.20; // 20% TVA

export function formatAmountWithPreference(
  amountHT: number,
  mode: "ht" | "ttc",
  tvaRate: number = DEFAULT_TVA_RATE,
): { value: number; label: string; suffix: string } {
  if (mode === "ttc") {
    const ttc = amountHT * (1 + tvaRate);
    return {
      value: Math.round(ttc * 100) / 100,
      label: new Intl.NumberFormat("fr-FR").format(Math.round(ttc * 100) / 100) + " \u20AC",
      suffix: "TTC",
    };
  }
  return {
    value: amountHT,
    label: new Intl.NumberFormat("fr-FR").format(amountHT) + " \u20AC",
    suffix: "HT",
  };
}
