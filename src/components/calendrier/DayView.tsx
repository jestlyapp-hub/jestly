"use client";

import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  toDateStr,
  formatDayName,
  formatMonthName,
  isToday,
  generateTimeSlots,
  getEventTopPercent,
  getEventHeightPercent,
  getEventDisplayColor,
  type CalendarEvent,
} from "@/lib/calendar-utils";

const START_HOUR = 6;
const END_HOUR = 24;
const HOUR_RANGE = END_HOUR - START_HOUR;

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateEvent: (date: string, startTime?: string, endTime?: string) => void;
  onMoveEvent?: (eventId: string, newDate: string, newStartTime: string) => void;
}

type InteractionMode =
  | null
  | { type: "drag"; eventId: string; hoverTime: string }
  | { type: "select"; startTime: string; endTime: string };

export default function DayView({ date, events, onSelectEvent, onCreateEvent, onMoveEvent }: DayViewProps) {
  const dateStr = toDateStr(date);
  const timeSlots = useMemo(() => generateTimeSlots(START_HOUR, END_HOUR - 1), []);
  const [currentTimeTop, setCurrentTimeTop] = useState<number | null>(null);
  const [interaction, setInteraction] = useState<InteractionMode>(null);
  const today = isToday(date);

  const pointerStart = useRef<{
    x: number; y: number;
    target: "event" | "slot";
    eventId?: string;
    time: string;
  } | null>(null);
  const hasMoved = useRef(false);

  useEffect(() => {
    function update() {
      if (!today) { setCurrentTimeTop(null); return; }
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if (h >= START_HOUR && h < END_HOUR) {
        setCurrentTimeTop(getEventTopPercent(`${h}:${m}`, START_HOUR, END_HOUR));
      } else {
        setCurrentTimeTop(null);
      }
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [today]);

  const dayEvents = useMemo(() => events.filter((e) => e.date === dateStr), [events, dateStr]);
  const allDayEvents = dayEvents.filter((e) => e.allDay);
  const timedEvents = dayEvents.filter((e) => !e.allDay && e.startTime);

  const getSlotFromPoint = useCallback((clientX: number, clientY: number): string | null => {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const slotEl = (el as HTMLElement).closest("[data-slot-time]") as HTMLElement | null;
    return slotEl?.dataset.slotTime || null;
  }, []);

  const handlePointerDown = useCallback((
    e: React.PointerEvent,
    target: "event" | "slot",
    time: string,
    eventId?: string
  ) => {
    if (e.button !== 0) return;
    pointerStart.current = { x: e.clientX, y: e.clientY, target, eventId, time };
    hasMoved.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerStart.current) return;
    if (Math.abs(e.clientX - pointerStart.current.x) + Math.abs(e.clientY - pointerStart.current.y) < 5) return;
    hasMoved.current = true;

    const slot = getSlotFromPoint(e.clientX, e.clientY);
    if (!slot) return;

    if (pointerStart.current.target === "event" && pointerStart.current.eventId) {
      setInteraction({ type: "drag", eventId: pointerStart.current.eventId, hoverTime: slot });
    } else if (pointerStart.current.target === "slot") {
      const [sH] = pointerStart.current.time.split(":").map(Number);
      const [eH] = slot.split(":").map(Number);
      if (eH >= sH) {
        setInteraction({ type: "select", startTime: pointerStart.current.time, endTime: addOneHour(slot) });
      } else {
        setInteraction({ type: "select", startTime: slot, endTime: addOneHour(pointerStart.current.time) });
      }
    }
  }, [getSlotFromPoint]);

  const handlePointerUp = useCallback(() => {
    if (!pointerStart.current) return;

    if (pointerStart.current.target === "event") {
      if (hasMoved.current && interaction?.type === "drag" && onMoveEvent) {
        const evt = events.find(ev => ev.id === interaction.eventId);
        if (evt && evt.source === "manual") {
          onMoveEvent(interaction.eventId, dateStr, interaction.hoverTime);
        }
      } else if (!hasMoved.current) {
        const evt = events.find(ev => ev.id === pointerStart.current!.eventId);
        if (evt) onSelectEvent(evt);
      }
    } else if (pointerStart.current.target === "slot") {
      if (hasMoved.current && interaction?.type === "select") {
        onCreateEvent(dateStr, interaction.startTime, interaction.endTime);
      } else if (!hasMoved.current) {
        onCreateEvent(dateStr, pointerStart.current.time);
      }
    }

    setInteraction(null);
    pointerStart.current = null;
    hasMoved.current = false;
  }, [interaction, events, dateStr, onSelectEvent, onCreateEvent, onMoveEvent]);

  const pct = (hour: number) => ((hour - START_HOUR) / HOUR_RANGE) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-[#EAEAEA] overflow-hidden flex flex-col h-full"
    >
      {/* ─── Day header ─── */}
      <div className={`px-5 py-3 border-b border-[#EAEAEA] flex-shrink-0 flex items-center gap-3 ${today ? "bg-[#4F46E5]/[0.02]" : ""}`}>
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-[16px] font-bold ${
          today ? "bg-[#4F46E5] text-white" : "text-[#1A1A1A] bg-[#F7F7F5]"
        }`}>
          {date.getDate()}
        </span>
        <div>
          <div className={`text-[14px] font-semibold ${today ? "text-[#4F46E5]" : "text-[#1A1A1A]"}`}>
            {formatDayName(date)}
          </div>
          <div className="text-[11px] text-[#AEAEAC]">{formatMonthName(date)} {date.getFullYear()}</div>
        </div>
      </div>

      {/* ─── All-day events ─── */}
      {allDayEvents.length > 0 && (
        <div className="px-4 py-2 border-b border-[#EAEAEA] flex-shrink-0">
          <div className="space-y-1">
            {allDayEvents.map((evt) => {
              const bgColor = getEventDisplayColor(evt);
              const isOrder = evt.source === "order";
              return (
                <button
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="w-full text-left px-3 py-1.5 rounded-md text-[12px] font-semibold text-white hover:brightness-105 transition-all cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: bgColor }}
                >
                  {isOrder && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-80">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  )}
                  <span className="truncate">{evt.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Time grid ─── */}
      <div
        className="flex-1 min-h-0 relative overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ userSelect: interaction ? "none" : undefined }}
      >
        <div className="absolute inset-0 grid grid-cols-[52px_1fr]">
          {/* Time labels */}
          <div className="relative">
            {timeSlots.map((slot) => {
              const hour = parseInt(slot);
              return (
                <div
                  key={slot}
                  className="absolute right-3 text-[10px] text-[#C0C0BE] font-normal tabular-nums -translate-y-1/2 select-none"
                  style={{ top: `${pct(hour)}%` }}
                >
                  {hour}h
                </div>
              );
            })}
          </div>

          {/* Event column */}
          <div className="relative">
            {/* Hour gridlines */}
            {timeSlots.map((slot) => {
              const hour = parseInt(slot);
              const isSelected =
                interaction?.type === "select" &&
                hour >= parseInt(interaction.startTime) &&
                hour < parseInt(interaction.endTime);

              return (
                <div
                  key={slot}
                  data-slot-time={slot}
                  className={`absolute left-0 right-0 border-t transition-colors ${
                    hour === 12 ? "border-[#E5E5E3]" :
                    hour % 3 === 0 ? "border-[#EDEDEB]" :
                    "border-[#F5F5F3]"
                  } ${
                    isSelected ? "bg-[#4F46E5]/[0.06]" : "hover:bg-[#FAFAF9]"
                  }`}
                  style={{
                    top: `${pct(hour)}%`,
                    height: `${100 / HOUR_RANGE}%`,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, "slot", slot)}
                />
              );
            })}

            {/* Current time */}
            {currentTimeTop !== null && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${currentTimeTop}%` }}>
                <div className="relative">
                  <div className="absolute -left-[4px] -top-[4px] w-[8px] h-[8px] rounded-full bg-[#4F46E5]" />
                  <div className="h-[1.5px] bg-[#4F46E5] w-full" />
                </div>
              </div>
            )}

            {/* Events */}
            {timedEvents.map((evt) => {
              const bgColor = getEventDisplayColor(evt);
              const topPct = getEventTopPercent(evt.startTime!, START_HOUR, END_HOUR);
              const heightPct = evt.endTime
                ? getEventHeightPercent(evt.startTime!, evt.endTime, START_HOUR, END_HOUR)
                : (30 / (HOUR_RANGE * 60)) * 100;

              const isDragging = interaction?.type === "drag" && interaction.eventId === evt.id;
              if (isDragging) return null;
              const isOrder = evt.source === "order";

              return (
                <div
                  key={evt.id}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (isOrder) return;
                    handlePointerDown(e, "event", evt.startTime || "09:00", evt.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!hasMoved.current) onSelectEvent(evt);
                  }}
                  className={`absolute left-2 right-3 z-10 rounded-md px-3 py-1.5 overflow-hidden text-white transition-all text-left hover:brightness-105 hover:shadow-sm ${
                    isOrder ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                  }`}
                  style={{
                    top: `${topPct}%`,
                    height: `${heightPct}%`,
                    minHeight: 22,
                    backgroundColor: bgColor,
                  }}
                >
                  <div className="text-[12px] font-semibold truncate">{evt.title}</div>
                  <div className="text-[10px] opacity-80">
                    {evt.startTime}–{evt.endTime || "..."}
                  </div>
                  {heightPct > 6 && evt.clientName && (
                    <div className="text-[10px] opacity-65 mt-0.5 truncate">{evt.clientName}</div>
                  )}
                </div>
              );
            })}

            {/* Drag ghost */}
            {interaction?.type === "drag" && (() => {
              const draggedEvent = events.find(ev => ev.id === interaction.eventId);
              if (!draggedEvent) return null;
              const bgColor = getEventDisplayColor(draggedEvent);
              const topPct = getEventTopPercent(interaction.hoverTime, START_HOUR, END_HOUR);
              const duration = draggedEvent.startTime && draggedEvent.endTime
                ? getEventHeightPercent(draggedEvent.startTime, draggedEvent.endTime, START_HOUR, END_HOUR)
                : (60 / (HOUR_RANGE * 60)) * 100;

              return (
                <div
                  className="absolute left-2 right-3 z-30 rounded-md px-3 py-1.5 text-white shadow-md opacity-75 pointer-events-none ring-2 ring-white/40"
                  style={{
                    top: `${topPct}%`,
                    height: `${duration}%`,
                    minHeight: 22,
                    backgroundColor: bgColor,
                  }}
                >
                  <div className="text-[12px] font-semibold truncate">{draggedEvent.title}</div>
                  <div className="text-[10px] opacity-80">{interaction.hoverTime}</div>
                </div>
              );
            })()}

            {/* Selection highlight */}
            {interaction?.type === "select" && (() => {
              const topPct = getEventTopPercent(interaction.startTime, START_HOUR, END_HOUR);
              const bottomPct = getEventTopPercent(interaction.endTime, START_HOUR, END_HOUR);
              return (
                <div
                  className="absolute left-2 right-3 z-15 rounded-md bg-[#4F46E5]/10 border border-[#4F46E5]/25 border-dashed pointer-events-none"
                  style={{
                    top: `${topPct}%`,
                    height: `${Math.max(2, bottomPct - topPct)}%`,
                    minHeight: 20,
                  }}
                >
                  <div className="text-[10px] font-medium text-[#4F46E5] px-2 pt-1">
                    {interaction.startTime}–{interaction.endTime}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function addOneHour(time: string): string {
  const [h] = time.split(":").map(Number);
  return `${Math.min(h + 1, 23).toString().padStart(2, "0")}:00`;
}
