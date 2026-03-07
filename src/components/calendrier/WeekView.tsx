"use client";

import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  getWeekDays,
  toDateStr,
  formatDayNameShort,
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
const SLOT_HEIGHT_PX = 48; // px per hour — compact

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateEvent: (date: string, startTime?: string, endTime?: string) => void;
  onMoveEvent?: (eventId: string, newDate: string, newStartTime: string) => void;
}

type InteractionMode =
  | null
  | { type: "drag"; eventId: string; hoverDate: string; hoverTime: string }
  | { type: "select"; date: string; startTime: string; endTime: string };

export default function WeekView({ date, events, onSelectEvent, onCreateEvent, onMoveEvent }: WeekViewProps) {
  const weekDays = useMemo(() => getWeekDays(date), [date]);
  const timeSlots = useMemo(() => generateTimeSlots(START_HOUR, END_HOUR), []);
  const [currentTimeTop, setCurrentTimeTop] = useState<number | null>(null);
  const [interaction, setInteraction] = useState<InteractionMode>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pointer tracking refs (avoid re-renders during drag)
  const pointerStart = useRef<{
    x: number; y: number;
    target: "event" | "slot";
    eventId?: string;
    date: string;
    time: string;
  } | null>(null);
  const hasMoved = useRef(false);

  // Current time indicator
  useEffect(() => {
    function update() {
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
  }, []);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const h = now.getHours();
      if (h >= START_HOUR && h <= END_HOUR) {
        const scrollTarget = Math.max(0, (h - START_HOUR - 1) * SLOT_HEIGHT_PX);
        scrollRef.current.scrollTop = scrollTarget;
      }
    }
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const evt of events) {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    }
    return map;
  }, [events]);

  const allDayByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const evt of events) {
      if (evt.allDay) {
        if (!map[evt.date]) map[evt.date] = [];
        map[evt.date].push(evt);
      }
    }
    return map;
  }, [events]);

  const totalHeight = (END_HOUR - START_HOUR) * SLOT_HEIGHT_PX;

  // Resolve target slot from pointer position
  const getSlotFromPoint = useCallback((clientX: number, clientY: number): { date: string; time: string } | null => {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const slotEl = (el as HTMLElement).closest("[data-slot-date]") as HTMLElement | null;
    if (!slotEl?.dataset.slotDate || !slotEl?.dataset.slotTime) return null;
    return { date: slotEl.dataset.slotDate, time: slotEl.dataset.slotTime };
  }, []);

  // Pointer handlers
  const handlePointerDown = useCallback((
    e: React.PointerEvent,
    target: "event" | "slot",
    targetDate: string,
    targetTime: string,
    eventId?: string
  ) => {
    if (e.button !== 0) return; // left click only
    pointerStart.current = { x: e.clientX, y: e.clientY, target, eventId, date: targetDate, time: targetTime };
    hasMoved.current = false;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;

    if (Math.abs(dx) + Math.abs(dy) < 5) return;
    hasMoved.current = true;

    const slot = getSlotFromPoint(e.clientX, e.clientY);
    if (!slot) return;

    if (pointerStart.current.target === "event" && pointerStart.current.eventId) {
      setInteraction({ type: "drag", eventId: pointerStart.current.eventId, hoverDate: slot.date, hoverTime: slot.time });
    } else if (pointerStart.current.target === "slot") {
      const startTime = pointerStart.current.time;
      const endTime = slot.time;
      // Ensure start <= end
      const [sH] = startTime.split(":").map(Number);
      const [eH] = endTime.split(":").map(Number);
      if (eH >= sH) {
        setInteraction({ type: "select", date: pointerStart.current.date, startTime, endTime: addOneHour(endTime) });
      } else {
        setInteraction({ type: "select", date: pointerStart.current.date, startTime: endTime, endTime: addOneHour(startTime) });
      }
    }
  }, [getSlotFromPoint]);

  const handlePointerUp = useCallback(() => {
    if (!pointerStart.current) return;

    if (pointerStart.current.target === "event") {
      if (hasMoved.current && interaction?.type === "drag" && onMoveEvent) {
        const evt = events.find(ev => ev.id === interaction.eventId);
        if (evt && evt.source === "manual") {
          onMoveEvent(interaction.eventId, interaction.hoverDate, interaction.hoverTime);
        }
      } else if (!hasMoved.current) {
        const evt = events.find(ev => ev.id === pointerStart.current!.eventId);
        if (evt) onSelectEvent(evt);
      }
    } else if (pointerStart.current.target === "slot") {
      if (hasMoved.current && interaction?.type === "select") {
        onCreateEvent(interaction.date, interaction.startTime, interaction.endTime);
      } else if (!hasMoved.current) {
        onCreateEvent(pointerStart.current.date, pointerStart.current.time);
      }
    }

    setInteraction(null);
    pointerStart.current = null;
    hasMoved.current = false;
  }, [interaction, events, onSelectEvent, onCreateEvent, onMoveEvent]);

  const hasAllDay = weekDays.some((d) => (allDayByDate[toDateStr(d)] || []).length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden flex flex-col"
      style={{ height: "calc(100vh - 180px)", minHeight: 500 }}
    >
      <div className="overflow-x-auto flex flex-col flex-1 min-w-0">
        <div className="min-w-[700px] flex flex-col flex-1">
          {/* Day headers */}
          <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-[#E6E6E4] flex-shrink-0">
            <div className="border-r border-[#EFEFEF]" />
            {weekDays.map((d) => {
              const td = isToday(d);
              return (
                <div
                  key={toDateStr(d)}
                  className={`text-center py-2 border-r border-[#EFEFEF] last:border-r-0 ${td ? "bg-[#EEF2FF]" : ""}`}
                >
                  <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider">
                    {formatDayNameShort(d)}
                  </div>
                  <div className={`text-[14px] font-bold mt-0.5 ${td ? "text-[#4F46E5]" : "text-[#1A1A1A]"}`}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* All-day events row */}
          {hasAllDay && (
            <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-[#E6E6E4] flex-shrink-0">
              <div className="border-r border-[#EFEFEF] text-[9px] text-[#999] text-right pr-1.5 py-1">
                Journee
              </div>
              {weekDays.map((d) => {
                const dateStr = toDateStr(d);
                const dayAllDay = allDayByDate[dateStr] || [];
                return (
                  <div key={dateStr} className="border-r border-[#EFEFEF] last:border-r-0 p-0.5 space-y-0.5">
                    {dayAllDay.map((evt) => {
                      const bgColor = getEventDisplayColor(evt);
                      return (
                        <button
                          key={evt.id}
                          onClick={() => onSelectEvent(evt)}
                          className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-semibold text-white truncate hover:brightness-110 transition-all cursor-pointer"
                          style={{ backgroundColor: bgColor }}
                        >
                          {evt.title}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
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
            <div className="grid grid-cols-[52px_repeat(7,1fr)] relative" style={{ minHeight: totalHeight }}>
              {/* Time labels */}
              <div className="border-r border-[#EFEFEF] relative">
                {timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="absolute right-1.5 text-[10px] text-[#999] font-medium -translate-y-1/2"
                    style={{
                      top: `${((parseInt(slot) - START_HOUR) / (END_HOUR - START_HOUR)) * 100}%`,
                    }}
                  >
                    {slot}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((d) => {
                const dateStr = toDateStr(d);
                const dayEvents = (eventsByDate[dateStr] || []).filter((e) => !e.allDay && e.startTime);
                const td = isToday(d);

                return (
                  <div
                    key={dateStr}
                    className={`relative border-r border-[#EFEFEF] last:border-r-0 ${td ? "bg-[#EEF2FF]/20" : ""}`}
                    style={{ height: totalHeight }}
                  >
                    {/* Hour slot targets (for drag-drop and slot selection) */}
                    {timeSlots.map((slot) => {
                      const isSelected =
                        interaction?.type === "select" &&
                        interaction.date === dateStr &&
                        parseInt(slot) >= parseInt(interaction.startTime) &&
                        parseInt(slot) < parseInt(interaction.endTime);

                      const isDragTarget =
                        interaction?.type === "drag" &&
                        interaction.hoverDate === dateStr &&
                        interaction.hoverTime === slot;

                      return (
                        <div
                          key={slot}
                          data-slot-date={dateStr}
                          data-slot-time={slot}
                          className={`absolute left-0 right-0 border-t border-[#EFEFEF] transition-colors ${
                            isSelected ? "bg-[#4F46E5]/10" :
                            isDragTarget ? "bg-[#4F46E5]/5" :
                            "hover:bg-[#F7F7F5]/60"
                          }`}
                          style={{
                            top: `${((parseInt(slot) - START_HOUR) / (END_HOUR - START_HOUR)) * 100}%`,
                            height: `${(1 / (END_HOUR - START_HOUR)) * 100}%`,
                          }}
                          onPointerDown={(e) => handlePointerDown(e, "slot", dateStr, slot)}
                        />
                      );
                    })}

                    {/* Current time indicator */}
                    {td && currentTimeTop !== null && (
                      <div
                        className="absolute left-0 right-0 z-20 pointer-events-none"
                        style={{ top: `${currentTimeTop}%` }}
                      >
                        <div className="relative">
                          <div className="absolute -left-[5px] -top-[5px] w-[10px] h-[10px] rounded-full bg-[#4F46E5]" />
                          <div className="h-[2px] bg-[#4F46E5] w-full" />
                        </div>
                      </div>
                    )}

                    {/* Events — solid colored blocks */}
                    {dayEvents.map((evt) => {
                      const bgColor = getEventDisplayColor(evt);
                      const topPct = getEventTopPercent(evt.startTime!, START_HOUR, END_HOUR);
                      const heightPct = evt.endTime
                        ? getEventHeightPercent(evt.startTime!, evt.endTime, START_HOUR, END_HOUR)
                        : (30 / ((END_HOUR - START_HOUR) * 60)) * 100;

                      // If this event is being dragged, show it at hover position instead
                      const isDragging = interaction?.type === "drag" && interaction.eventId === evt.id;
                      if (isDragging) return null;

                      const isOrder = evt.source === "order";

                      return (
                        <div
                          key={evt.id}
                          data-event-id={evt.id}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            if (isOrder) return; // Order events are not draggable
                            handlePointerDown(e, "event", dateStr, evt.startTime || "09:00", evt.id);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!hasMoved.current) onSelectEvent(evt);
                          }}
                          className={`absolute left-0.5 right-0.5 z-10 rounded-md px-1.5 py-1 overflow-hidden text-white shadow-sm hover:shadow-md hover:brightness-110 transition-all text-left ${
                            isOrder ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                          }`}
                          style={{
                            top: `${topPct}%`,
                            height: `${heightPct}%`,
                            minHeight: 22,
                            backgroundColor: bgColor,
                          }}
                        >
                          <div className="text-[10px] font-bold truncate leading-tight">
                            {evt.title}
                          </div>
                          {heightPct > 4 && (
                            <div className="text-[9px] opacity-80 truncate">
                              {evt.startTime}{evt.endTime ? ` - ${evt.endTime}` : ""}
                            </div>
                          )}
                          {heightPct > 8 && evt.clientName && (
                            <div className="text-[9px] opacity-70 truncate">
                              {evt.clientName}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Drag ghost — show dragged event at hover position */}
                    {interaction?.type === "drag" && interaction.hoverDate === dateStr && (() => {
                      const draggedEvent = events.find(ev => ev.id === interaction.eventId);
                      if (!draggedEvent) return null;
                      const bgColor = getEventDisplayColor(draggedEvent);
                      const topPct = getEventTopPercent(interaction.hoverTime, START_HOUR, END_HOUR);
                      const duration = draggedEvent.startTime && draggedEvent.endTime
                        ? getEventHeightPercent(draggedEvent.startTime, draggedEvent.endTime, START_HOUR, END_HOUR)
                        : (60 / ((END_HOUR - START_HOUR) * 60)) * 100;

                      return (
                        <div
                          className="absolute left-0.5 right-0.5 z-30 rounded-md px-1.5 py-1 text-white shadow-lg opacity-80 pointer-events-none ring-2 ring-white/50"
                          style={{
                            top: `${topPct}%`,
                            height: `${duration}%`,
                            minHeight: 22,
                            backgroundColor: bgColor,
                          }}
                        >
                          <div className="text-[10px] font-bold truncate">
                            {draggedEvent.title}
                          </div>
                          <div className="text-[9px] opacity-80">
                            {interaction.hoverTime}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Selection highlight overlay */}
                    {interaction?.type === "select" && interaction.date === dateStr && (() => {
                      const topPct = getEventTopPercent(interaction.startTime, START_HOUR, END_HOUR);
                      const bottomPct = getEventTopPercent(interaction.endTime, START_HOUR, END_HOUR);
                      return (
                        <div
                          className="absolute left-0.5 right-0.5 z-15 rounded-md bg-[#4F46E5]/15 border-2 border-[#4F46E5]/30 border-dashed pointer-events-none"
                          style={{
                            top: `${topPct}%`,
                            height: `${Math.max(2, bottomPct - topPct)}%`,
                            minHeight: 20,
                          }}
                        >
                          <div className="text-[10px] font-semibold text-[#4F46E5] px-1.5 pt-0.5">
                            {interaction.startTime} - {interaction.endTime}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
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
