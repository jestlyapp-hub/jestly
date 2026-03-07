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
      }).catch((e) => console.error("Calendar move error:", e));
    },
    [events, setEvents]
  );

  const handleFormSubmit = useCallback(
    async (eventData: Partial<CalendarEvent>) => {
      if (editingEvent) {
        setEvents((prev) =>
          (prev || []).map((e) =>
            e.id === editingEvent.id ? { ...e, ...eventData } as CalendarEvent : e
          )
        );
        apiFetch("/api/calendar/events", {
          method: "PATCH",
          body: { id: editingEvent.id, ...eventData },
        }).catch((e) => console.error("Calendar edit error:", e));
      } else {
        try {
          const newEvent = await apiFetch<CalendarEvent>("/api/calendar/events", {
            body: eventData,
          });
          setEvents((prev) => [...(prev || []), newEvent]);
        } catch {
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
      <div className="flex flex-col" style={{ height: "calc(100vh - 100px)" }}>
        <div className="h-10 w-48 bg-[#F7F7F5] rounded-lg animate-pulse mb-3" />
        <div className="flex-1 bg-white rounded-xl border border-[#EAEAEA] p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-[#F7F7F5] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: "calc(100vh - 100px)" }}>
        <p className="text-[13px] text-red-500 mb-2">Erreur : {error}</p>
        <button onClick={mutate} className="text-[12px] text-[#4F46E5] hover:underline cursor-pointer">
          Reessayer
        </button>
      </div>
    );
  }

  const safeEvents = events || [];

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 100px)" }}>
      {/* ─── Toolbar ─── */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-[#1A1A1A]">Calendrier</h1>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              className="p-1 rounded-md hover:bg-[#F7F7F5] transition-colors cursor-pointer"
              aria-label="Precedent"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={goToday}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium text-[#666] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={goNext}
              className="p-1 rounded-md hover:bg-[#F7F7F5] transition-colors cursor-pointer"
              aria-label="Suivant"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Date title */}
          <span className="text-[13px] font-medium text-[#666] hidden sm:block">
            {getTitle()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-[#F7F7F5] rounded-lg p-0.5">
            {(["day", "week", "month"] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  view === v
                    ? "bg-white text-[#1A1A1A] shadow-sm"
                    : "text-[#AAA] hover:text-[#666]"
                }`}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>

          {/* Quick add */}
          <button
            onClick={handleQuickAdd}
            className="bg-[#4F46E5] text-white rounded-lg px-3 py-1.5 text-[11px] font-medium hover:bg-[#4338CA] transition-colors cursor-pointer flex items-center gap-1"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau
          </button>
        </div>
      </div>

      {/* Mobile title */}
      <div className="text-[12px] font-medium text-[#666] mb-2 sm:hidden flex-shrink-0">
        {getTitle()}
      </div>

      {/* ─── Calendar view ─── */}
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
