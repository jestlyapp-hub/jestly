"use client";

/* ══════════════════════════════════════════════════════════════════════
   Hook client — useNotifications
   Gère le fetch SWR + Supabase Realtime pour les notifications live.
   ══════════════════════════════════════════════════════════════════════ */

import { useEffect, useCallback, useRef } from "react";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRow, NotificationCategory } from "./types";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface NotificationsResponse {
  notifications: NotificationRow[];
  total: number;
}

interface UnreadCountResponse {
  count: number;
}

interface UseNotificationsOptions {
  category?: NotificationCategory | "all";
  unreadOnly?: boolean;
  limit?: number;
  enabled?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { category = "all", unreadOnly = false, limit = 20, enabled = true } = options;

  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (unreadOnly) params.set("unread", "true");
  params.set("limit", String(limit));

  const url = enabled ? `/api/notifications?${params.toString()}` : null;

  const {
    data: response,
    loading,
    error,
    mutate: refetchList,
    setData: setResponse,
  } = useApi<NotificationsResponse>(url, { notifications: [], total: 0 });

  const {
    data: unreadData,
    mutate: refetchUnread,
    setData: setUnreadData,
  } = useApi<UnreadCountResponse>(enabled ? "/api/notifications/unread-count" : null, { count: 0 });

  const notifications = response?.notifications ?? [];
  const total = response?.total ?? 0;
  const unreadCount = unreadData?.count ?? 0;

  // ── Realtime subscription ──
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        () => {
          // Refetch les deux — le RLS filtrera côté serveur
          refetchList();
          refetchUnread();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [enabled, refetchList, refetchUnread]);

  // ── Actions ──

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setResponse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        ),
      };
    });
    setUnreadData((prev) => prev ? { count: Math.max(0, prev.count - 1) } : prev);

    await apiFetch("/api/notifications/mark-read", { body: { id } });
  }, [setResponse, setUnreadData]);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setResponse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map((n) => ({
          ...n,
          is_read: true,
          read_at: n.read_at ?? new Date().toISOString(),
        })),
      };
    });
    setUnreadData({ count: 0 });

    await apiFetch("/api/notifications/mark-all-read");
  }, [setResponse, setUnreadData]);

  const refresh = useCallback(() => {
    refetchList();
    refetchUnread();
  }, [refetchList, refetchUnread]);

  return {
    notifications,
    total,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
