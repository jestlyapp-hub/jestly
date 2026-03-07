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
  CATEGORY_CONFIG,
  type CalendarEvent,
} from "@/lib/calendar-utils";

const START_HOUR = 7;
const END_HOUR = 22;
const SLOT_HEIGHT_PX = 56; // px per hour

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
  const timeSlots = useMemo(() => generateTimeSlots(START_HOUR, END_HOUR), []);
  const [currentTimeTop, setCurrentTimeTop] = useState<number | null>(null);
  const [interaction, setInteraction] = useState<InteractionMode>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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
      if (h >= START_HOUR && h <= END_HOUR) {
        setCurrentTimeTop(getEventTopPercent(`${h}:${m}`, START_HOUR, END_HOUR));
      } else {
        setCurrentTimeTop(null);
      }
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [today]);

  // Auto-scroll to current time
  useEffect(() => {
    if (scrollRef.current && today) {
      const now = new Date();
      const h = now.getHours();
      if (h >= START_HOUR && h <= END_HOUR) {
        scrollRef.current.scrollTop = Math.max(0, (h - START_HOUR - 1) * SLOT_HEIGHT_PX);
      }
    }
  }, [today]);

  const dayEvents = useMemo(() => events.filter((e) => e.date === dateStr), [events, dateStr]);
  const allDayEvents = dayEvents.filter((e) => e.allDay);
  const timedEvents = dayEvents.filter((e) => !e.allDay && e.startTime);
  const totalHeight = (END_HOUR - START_HOUR) * SLOT_HEIGHT_PX;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden flex flex-col"
      style={{ height: "calc(100vh - 180px)", minHeight: 500 }}
    >
      {/* Day header */}
      <div className={`px-5 py-2.5 border-b border-[#E6E6E4] flex-shrink-0 ${today ? "bg-[#EEF2FF]" : ""}`}>
        <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider">
          {formatDayName(date)}
        </div>
        <div className={`text-[18px] font-bold ${today ? "text-[#4F46E5]" : "text-[#1A1A1A]"}`}>
          {date.getDate()} {formatMonthName(date)}
        </div>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="px-4 py-1.5 border-b border-[#E6E6E4] bg-[#F7F7F5] flex-shrink-0">
          <div className="text-[9px] text-[#999] font-semibold uppercase tracking-wider mb-1">
            Toute la journee
          </div>
          <div className="space-y-0.5">
            {allDayEvents.map((evt) => {
              const bgColor = getEventDisplayColor(evt);
              return (
                <button
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="w-full text-left px-3 py-1.5 rounded-md text-[12px] font-semibold text-white hover:brightness-110 transition-all cursor-pointer"
                  style={{ backgroundColor: bgColor }}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-white/30 mr-2" />
                  {evt.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ userSelect: interaction ? "none" : undefined }}
      >
        <div className="grid grid-cols-[64px_1fr] relative" style={{ minHeight: totalHeight }}>
          {/* Time labels */}
          <div className="border-r border-[#EFEFEF] relative">
            {timeSlots.map((slot) => (
              <div
                key={slot}
                className="absolute right-2.5 text-[11px] text-[#999] font-medium -translate-y-1/2"
                style={{
                  top: `${((parseInt(slot) - START_HOUR) / (END_HOUR - START_HOUR)) * 100}%`,
                }}
              >
                {slot}
              </div>
            ))}
          </div>

          {/* Event column */}
          <div className="relative" style={{ height: totalHeight }}>
            {/* Hour gridlines + slot targets */}
            {timeSlots.map((slot) => {
              const isSelected =
                interaction?.type === "select" &&
                parseInt(slot) >= parseInt(interaction.startTime) &&
                parseInt(slot) < parseInt(interaction.endTime);

              return (
                <div
                  key={slot}
                  data-slot-time={slot}
                  className={`absolute left-0 right-0 border-t border-[#EFEFEF] transition-colors ${
                    isSelected ? "bg-[#4F46E5]/10" : "hover:bg-[#F7F7F5]/60"
                  }`}
                  style={{
                    top: `${((parseInt(slot) - START_HOUR) / (END_HOUR - START_HOUR)) * 100}%`,
                    height: `${(1 / (END_HOUR - START_HOUR)) * 100}%`,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, "slot", slot)}
                />
              );
            })}

            {/* Current time */}
            {currentTimeTop !== null && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${currentTimeTop}%` }}>
                <div className="relative">
                  <div className="absolute -left-[5px] -top-[5px] w-[10px] h-[10px] rounded-full bg-[#4F46E5]" />
                  <div className="h-[2px] bg-[#4F46E5] w-full rounded-full" />
                </div>
              </div>
            )}

            {/* Events — solid colored blocks */}
            {timedEvents.map((evt) => {
              const bgColor = getEventDisplayColor(evt);
              const topPct = getEventTopPercent(evt.startTime!, START_HOUR, END_HOUR);
              const heightPct = evt.endTime
                ? getEventHeightPercent(evt.startTime!, evt.endTime, START_HOUR, END_HOUR)
                : (30 / ((END_HOUR - START_HOUR) * 60)) * 100;

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
                  className={`absolute left-2 right-2 z-10 rounded-lg px-3 py-2 overflow-hidden text-white shadow-sm hover:shadow-md hover:brightness-110 transition-all text-left ${
                    isOrder ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                  }`}
                  style={{
                    top: `${topPct}%`,
                    height: `${heightPct}%`,
                    minHeight: 28,
                    backgroundColor: bgColor,
                  }}
                >
                  <div className="text-[12px] font-bold truncate">{evt.title}</div>
                  <div className="text-[11px] opacity-80">
                    {evt.startTime} - {evt.endTime || "..."}
                  </div>
                  {heightPct > 7 && evt.clientName && (
                    <div className="text-[10px] opacity-70 mt-0.5 truncate">{evt.clientName}</div>
                  )}
                  {heightPct > 10 && evt.notes && (
                    <div className="text-[10px] opacity-60 mt-0.5 truncate">{evt.notes}</div>
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
                : (60 / ((END_HOUR - START_HOUR) * 60)) * 100;

              return (
                <div
                  className="absolute left-2 right-2 z-30 rounded-lg px-3 py-2 text-white shadow-lg opacity-80 pointer-events-none ring-2 ring-white/50"
                  style={{
                    top: `${topPct}%`,
                    height: `${duration}%`,
                    minHeight: 28,
                    backgroundColor: bgColor,
                  }}
                >
                  <div className="text-[12px] font-bold truncate">{draggedEvent.title}</div>
                  <div className="text-[11px] opacity-80">{interaction.hoverTime}</div>
                </div>
              );
            })()}

            {/* Selection highlight */}
            {interaction?.type === "select" && (() => {
              const topPct = getEventTopPercent(interaction.startTime, START_HOUR, END_HOUR);
              const bottomPct = getEventTopPercent(interaction.endTime, START_HOUR, END_HOUR);
              return (
                <div
                  className="absolute left-2 right-2 z-15 rounded-lg bg-[#4F46E5]/15 border-2 border-[#4F46E5]/30 border-dashed pointer-events-none"
                  style={{
                    top: `${topPct}%`,
                    height: `${Math.max(2, bottomPct - topPct)}%`,
                    minHeight: 24,
                  }}
                >
                  <div className="text-[11px] font-semibold text-[#4F46E5] px-2 pt-1">
                    {interaction.startTime} - {interaction.endTime}
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
  return `${Math.min(h + 1, 22).toString().padStart(2, "0")}:00`;
}
