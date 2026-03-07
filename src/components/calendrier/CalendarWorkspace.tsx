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

  // Event states
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>();
  const [formDefaultStartTime, setFormDefaultStartTime] = useState<string | undefined>();
  const [formDefaultEndTime, setFormDefaultEndTime] = useState<string | undefined>();

  // Fetch events
  const { data: events, loading, error, mutate, setData: setEvents } = useApi<CalendarEvent[]>(
    "/api/calendar/events",
    []
  );

  // Navigation
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

  // Title
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

  // Event handlers
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
      setEvents((prev) => (prev || []).filter((e) => e.id !== eventId));
      setDrawerOpen(false);
      setSelectedEvent(null);
      apiFetch("/api/calendar/events", { method: "DELETE", body: { id: eventId } }).catch(
        (e) => console.error("Calendar delete error:", e)
      );
    },
    [setEvents]
  );

  const handleMoveEvent = useCallback(
    (eventId: string, newDate: string, newStartTime: string) => {
      const event = (events || []).find((e) => e.id === eventId);
      if (!event || event.source !== "manual") return;

      // Calculate duration to preserve endTime
      let newEndTime: string | undefined;
      if (event.startTime && event.endTime) {
        const [sh, sm] = event.startTime.split(":").map(Number);
        const [eh, em] = event.endTime.split(":").map(Number);
        const durationMin = (eh * 60 + em) - (sh * 60 + sm);
        const [nh, nm] = newStartTime.split(":").map(Number);
        const endMin = nh * 60 + nm + durationMin;
        const endH = Math.min(22, Math.floor(endMin / 60));
        const endM = endMin % 60;
        newEndTime = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
      }

      // Optimistic update
      setEvents((prev) =>
        (prev || []).map((e) =>
          e.id === eventId
            ? { ...e, date: newDate, startTime: newStartTime, endTime: newEndTime || e.endTime }
            : e
        )
      );

      // Persist
      apiFetch("/api/calendar/events", {
        method: "PATCH",
        body: { id: eventId, date: newDate, startTime: newStartTime, endTime: newEndTime },
      }).catch((e) => console.error("Calendar move error:", e));
    },
    [events, setEvents]
  );

  const handleFormSubmit = useCallback(
    async (eventData: Partial<CalendarEvent>) => {
      if (editingEvent) {
        // Optimistic update
        setEvents((prev) =>
          (prev || []).map((e) =>
            e.id === editingEvent.id ? { ...e, ...eventData } as CalendarEvent : e
          )
        );
        // Persist edit
        apiFetch("/api/calendar/events", {
          method: "PATCH",
          body: { id: editingEvent.id, ...eventData },
        }).catch((e) => console.error("Calendar edit error:", e));
      } else {
        // Create via API
        try {
          const newEvent = await apiFetch<CalendarEvent>("/api/calendar/events", {
            body: eventData,
          });
          setEvents((prev) => [...(prev || []), newEvent]);
        } catch {
          // Fallback: add locally with temp id
          const tempEvent: CalendarEvent = {
            id: `temp-${Date.now()}`,
            title: eventData.title || "Sans titre",
            category: eventData.category || "personnel",
            date: eventData.date || toDateStr(new Date()),
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            allDay: eventData.allDay ?? true,
            notes: eventData.notes,
            priority: eventData.priority || "medium",
            source: "manual",
            color: eventData.color,
            clientId: eventData.clientId,
            clientName: eventData.clientName,
          };
          setEvents((prev) => [...(prev || []), tempEvent]);
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
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-40 bg-[#F7F7F5] rounded animate-pulse mb-4" />
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-[#F7F7F5] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer">
          Reessayer
        </button>
      </div>
    );
  }

  const safeEvents = events || [];

  return (
    <div className="max-w-7xl mx-auto flex flex-col" style={{ height: "calc(100vh - 100px)" }}>
      {/* Compact toolbar */}
      <motion.div
        className="flex items-center justify-between gap-3 mb-3 flex-shrink-0"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#1A1A1A]">Calendrier</h1>

          {/* View toggle */}
          <div className="flex bg-[#F7F7F5] rounded-lg p-0.5">
            {(["day", "week", "month"] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  view === v
                    ? "bg-white text-[#1A1A1A] shadow-sm"
                    : "text-[#999] hover:text-[#666]"
                }`}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Date navigation */}
          <button
            onClick={goPrev}
            className="p-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            aria-label="Precedent"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={goToday}
            className="px-2.5 py-1 rounded-md border border-[#E6E6E4] text-[11px] font-medium text-[#666] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
          >
            Aujourd&apos;hui
          </button>

          <button
            onClick={goNext}
            className="p-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            aria-label="Suivant"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Date title */}
          <span className="text-[13px] font-semibold text-[#1A1A1A] min-w-[160px] text-center hidden sm:block">
            {getTitle()}
          </span>

          {/* Quick add */}
          <button
            onClick={handleQuickAdd}
            className="bg-[#4F46E5] text-white rounded-lg px-3 py-1.5 text-[12px] font-medium hover:bg-[#4338CA] transition-colors cursor-pointer flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau
          </button>
        </div>
      </motion.div>

      {/* Mobile date title */}
      <div className="text-[13px] font-semibold text-[#1A1A1A] mb-2 sm:hidden flex-shrink-0">
        {getTitle()}
      </div>

      {/* Calendar view — fills remaining space */}
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

      {/* Event detail drawer */}
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

      {/* Event form modal */}
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
