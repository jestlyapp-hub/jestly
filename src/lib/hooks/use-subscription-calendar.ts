"use client";

import { useState, useMemo, useCallback } from "react";
import type { Subscription } from "@/types/subscription";
import {
  getAllEventsForMonth,
  getMonthCalendarMatrix,
  getMonthlyStats,
  type CalendarWeek,
  type CalendarDay,
  type CalendarEvent,
  type MonthStats,
} from "@/lib/subscriptions/calendar";

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export interface UseSubscriptionCalendarResult {
  // Navigation
  year: number;
  month: number; // 0-indexed
  monthLabel: string;
  goNextMonth: () => void;
  goPrevMonth: () => void;
  goToday: () => void;

  // Data
  weeks: CalendarWeek[];
  stats: MonthStats;

  // Selection
  selectedDay: CalendarDay | null;
  selectedSubscription: Subscription | null;
  selectDay: (day: CalendarDay | null) => void;
  selectSubscription: (sub: Subscription | null) => void;
  clearSelection: () => void;
}

export function useSubscriptionCalendar(
  subs: Subscription[],
  dailyRate = 300,
): UseSubscriptionCalendarResult {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  const monthLabel = `${MONTH_NAMES[month]} ${year}`;

  // Navigation
  const goNextMonth = useCallback(() => {
    setSelectedDay(null);
    setSelectedSubscription(null);
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }, [month]);

  const goPrevMonth = useCallback(() => {
    setSelectedDay(null);
    setSelectedSubscription(null);
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }, [month]);

  const goToday = useCallback(() => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
    setSelectedDay(null);
    setSelectedSubscription(null);
  }, []);

  // Events by date
  const eventsByDate = useMemo(
    () => getAllEventsForMonth(subs, year, month),
    [subs, year, month],
  );

  // Average daily for intensity calc
  const monthAvgDaily = useMemo(() => {
    let total = 0;
    let daysWithEvents = 0;
    for (const [, events] of eventsByDate) {
      const dayTotal = events.reduce((s, e) => s + e.amount, 0);
      if (dayTotal > 0) {
        total += dayTotal;
        daysWithEvents++;
      }
    }
    return daysWithEvents > 0 ? total / daysWithEvents : 0;
  }, [eventsByDate]);

  // Calendar matrix
  const weeks = useMemo(
    () => getMonthCalendarMatrix(year, month, eventsByDate, monthAvgDaily),
    [year, month, eventsByDate, monthAvgDaily],
  );

  // Stats
  const stats = useMemo(
    () => getMonthlyStats(weeks, eventsByDate, dailyRate),
    [weeks, eventsByDate, dailyRate],
  );

  // Selection
  const selectDay = useCallback((day: CalendarDay | null) => {
    setSelectedDay(day);
    setSelectedSubscription(null);
  }, []);

  const selectSubscription = useCallback((sub: Subscription | null) => {
    setSelectedSubscription(sub);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDay(null);
    setSelectedSubscription(null);
  }, []);

  return {
    year, month, monthLabel,
    goNextMonth, goPrevMonth, goToday,
    weeks, stats,
    selectedDay, selectedSubscription,
    selectDay, selectSubscription, clearSelection,
  };
}
