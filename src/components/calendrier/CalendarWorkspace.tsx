"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import {
  formatMonthName,
  formatDateFr,
  getMonday,
  toDateStr,
  type CalendarEvent,
} from "@/lib/calendar-utils";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import EventDetailDrawer from "./EventDetailDrawer";
import EventFormModal from "./EventFormModal";

type ViewType = "day" | "week" | "month";

const VIEW_LABELS: Record<ViewType, string> = {
  day: "Jour",
  week: "Semaine",
  month: "Mois",
};

export default function CalendarWorkspace() {
  const [view, setView] = useState<ViewType>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>();
  const [formDefaultStartTime, setFormDefaultStartTime] = useState<string | undefined>();
  const [formDefaultEndTime, setFormDefaultEndTime] = useState<string | undefined>();

  const { data: events, loading, error, mutate, setData: setEvents } = useApi<CalendarEvent[]>(
    "/api/calendar/events",
    []
  );

  const goToday = () => setCurrentDate(new Date());

  const goPrev = () => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() - 1);
    else if (view === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const goNext = () => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + 1);
    else if (view === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const getTitle = () => {
    if (view === "month") {
      return `${formatMonthName(currentDate)} ${currentDate.getFullYear()}`;
    }
    if (view === "week") {
      const monday = getMonday(currentDate);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const mStr = `${monday.getDate()} ${formatMonthName(monday).slice(0, 3)}`;
      const sStr = `${sunday.getDate()} ${formatMonthName(sunday).slice(0, 3)} ${sunday.getFullYear()}`;
      return `${mStr} — ${sStr}`;
    }
    return formatDateFr(currentDate);
  };

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  }, []);

  const handleCreateEvent = useCallback((date: string, startTime?: string, endTime?: string) => {
    setEditingEvent(null);
    setFormDefaultDate(date);
    setFormDefaultStartTime(startTime);
    setFormDefaultEndTime(endTime);
    setFormOpen(true);
  }, []);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setDrawerOpen(false);
    setEditingEvent(event);
    setFormDefaultDate(undefined);
    setFormDefaultStartTime(undefined);
    setFormDefaultEndTime(undefined);
    setFormOpen(true);
  }, []);

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      const backup = events || [];
      setEvents((prev) => (prev || []).filter((e) => e.id !== eventId));
      setDrawerOpen(false);
      setSelectedEvent(null);
      try {
        await apiFetch("/api/calendar/events", { method: "DELETE", body: { id: eventId } });
      } catch (e) {
        console.error("Calendar delete error:", e);
        setEvents(backup);
        setSaveError(e instanceof Error ? e.message : "Erreur lors de la suppression");
      }
    },
    [events, setEvents]
  );

  const handleMoveEvent = useCallback(
    (eventId: string, newDate: string, newStartTime: string) => {
      const event = (events || []).find((e) => e.id === eventId);
      if (!event || event.source !== "manual") return;

      let newEndTime: string | undefined;
      if (event.startTime && event.endTime) {
        const [sh, sm] = event.startTime.split(":").map(Number);
        const [eh, em] = event.endTime.split(":").map(Number);
        const durationMin = (eh * 60 + em) - (sh * 60 + sm);
        const [nh, nm] = newStartTime.split(":").map(Number);
        const endMin = nh * 60 + nm + durationMin;
        const endH = Math.min(23, Math.floor(endMin / 60));
        const endM = endMin % 60;
        newEndTime = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
      }

      setEvents((prev) =>
        (prev || []).map((e) =>
          e.id === eventId
            ? { ...e, date: newDate, startTime: newStartTime, endTime: newEndTime || e.endTime }
            : e
        )
      );

      apiFetch("/api/calendar/events", {
        method: "PATCH",
        body: { id: eventId, date: newDate, startTime: newStartTime, endTime: newEndTime },
      }).catch((e) => {
        console.error("Calendar move error:", e);
        // Rollback move
        setEvents((prev) =>
          (prev || []).map((ev) => {
            const original = (events || []).find((o) => o.id === eventId);
            return ev.id === eventId && original ? original : ev;
          })
        );
      });
    },
    [events, setEvents]
  );

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleFormSubmit = useCallback(
    async (eventData: Partial<CalendarEvent>) => {
      setSaveError(null);

      if (editingEvent) {
        // Optimistic update for edit
        setEvents((prev) =>
          (prev || []).map((e) =>
            e.id === editingEvent.id ? { ...e, ...eventData } as CalendarEvent : e
          )
        );
        try {
          await apiFetch("/api/calendar/events", {
            method: "PATCH",
            body: { id: editingEvent.id, ...eventData },
          });
        } catch (e) {
          console.error("Calendar edit error:", e);
          // Rollback
          setEvents((prev) =>
            (prev || []).map((ev) =>
              ev.id === editingEvent.id ? editingEvent : ev
            )
          );
          setSaveError(e instanceof Error ? e.message : "Erreur lors de la modification");
          return;
        }
      } else {
        // Create — NO fake temp event. Wait for real DB response.
        try {
          const newEvent = await apiFetch<CalendarEvent>("/api/calendar/events", {
            body: eventData,
          });
          setEvents((prev) => [...(prev || []), newEvent]);
        } catch (e) {
          console.error("Calendar create error:", e);
          setSaveError(e instanceof Error ? e.message : "Erreur lors de la creation de l'evenement");
          return;
        }
      }
      setFormOpen(false);
      setEditingEvent(null);
    },
    [editingEvent, setEvents]
  );

  const handleQuickAdd = () => {
    setEditingEvent(null);
    setFormDefaultDate(toDateStr(new Date()));
    setFormDefaultStartTime(undefined);
    setFormDefaultEndTime(undefined);
    setFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4" style={{ height: "calc(100vh - 100px)" }}>
        {/* Skeleton toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-7 w-28 bg-[#F0F0EE] rounded-lg animate-pulse" />
            <div className="h-7 w-48 bg-[#F0F0EE] rounded-lg animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-44 bg-[#F0F0EE] rounded-lg animate-pulse" />
            <div className="h-8 w-24 bg-[#EEEEFF] rounded-lg animate-pulse" />
          </div>
        </div>
        {/* Skeleton calendar */}
        <div className="flex-1 bg-white rounded-xl border border-[#E6E6E4] shadow-sm p-6 space-y-3">
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 bg-[#F7F7F5] rounded animate-pulse" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-[#FAFAF9] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3" style={{ height: "calc(100vh - 100px)" }}>
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-[13px] text-[#666]">Impossible de charger le calendrier</p>
        <button onClick={mutate} className="text-[12px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer">
          Reessayer
        </button>
      </div>
    );
  }

  const safeEvents = events || [];

  return (
    <div className="flex flex-col gap-3" style={{ height: "calc(100vh - 100px)" }}>
      {/* ─── Premium Toolbar ─── */}
      <div className="flex items-center justify-between flex-shrink-0">
        {/* Left: Title + Navigation + Date range */}
        <div className="flex items-center gap-5">
          {/* Page title */}
          <h1 className="text-[18px] font-bold text-[#1A1A1A] tracking-[-0.01em]">
            Calendrier
          </h1>

          {/* Navigation cluster */}
          <div className="flex items-center gap-0.5 bg-[#F4F4F2] rounded-lg p-[3px]">
            <button
              onClick={goPrev}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all cursor-pointer"
              aria-label="Precedent"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={goToday}
              className="h-7 px-3 rounded-md text-[11px] font-semibold text-[#555] hover:bg-white hover:shadow-sm transition-all cursor-pointer"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={goNext}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all cursor-pointer"
              aria-label="Suivant"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Date range label */}
          <span className="text-[14px] font-semibold text-[#444] hidden sm:block tracking-[-0.005em]">
            {getTitle()}
          </span>
        </div>

        {/* Right: View toggle + Add button */}
        <div className="flex items-center gap-3">
          {/* Segmented view switcher */}
          <div className="flex bg-[#F4F4F2] rounded-lg p-[3px]">
            {(["day", "week", "month"] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3.5 py-[5px] rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  view === v
                    ? "bg-white text-[#1A1A1A] shadow-sm"
                    : "text-[#888] hover:text-[#555]"
                }`}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>

          {/* Add event CTA */}
          <button
            onClick={handleQuickAdd}
            className="bg-[#4F46E5] text-white rounded-lg px-4 py-[7px] text-[12px] font-semibold hover:bg-[#4338CA] active:bg-[#3730A3] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-[#4F46E5]/20"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau
          </button>
        </div>
      </div>

      {/* Mobile date range */}
      <div className="text-[13px] font-semibold text-[#555] sm:hidden flex-shrink-0">
        {getTitle()}
      </div>

      {/* ─── Calendar surface ─── */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {view === "month" && (
            <MonthView
              key="month"
              year={currentDate.getFullYear()}
              month={currentDate.getMonth()}
              events={safeEvents}
              onSelectEvent={handleSelectEvent}
              onCreateEvent={(date) => handleCreateEvent(date)}
            />
          )}
          {view === "week" && (
            <WeekView
              key="week"
              date={currentDate}
              events={safeEvents}
              onSelectEvent={handleSelectEvent}
              onCreateEvent={handleCreateEvent}
              onMoveEvent={handleMoveEvent}
            />
          )}
          {view === "day" && (
            <DayView
              key="day"
              date={currentDate}
              events={safeEvents}
              onSelectEvent={handleSelectEvent}
              onCreateEvent={handleCreateEvent}
              onMoveEvent={handleMoveEvent}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Save error toast */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white rounded-xl px-5 py-3 shadow-xl max-w-md flex items-center gap-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span className="text-[13px] font-semibold">{saveError}</span>
            <button
              onClick={() => setSaveError(null)}
              className="ml-2 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <EventDetailDrawer
        event={selectedEvent}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedEvent(null);
        }}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      <EventFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleFormSubmit}
        initialEvent={editingEvent}
        defaultDate={formDefaultDate}
        defaultStartTime={formDefaultStartTime}
        defaultEndTime={formDefaultEndTime}
      />
    </div>
  );
}
