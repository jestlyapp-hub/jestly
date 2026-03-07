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
  getEventBgColor,
  type CalendarEvent,
} from "@/lib/calendar-utils";
import OrderDots from "./OrderDots";

const START_HOUR = 0;
const END_HOUR = 24;
const HOUR_RANGE = END_HOUR - START_HOUR;

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
  const timeSlots = useMemo(() => generateTimeSlots(START_HOUR, END_HOUR - 1), []);
  const [currentTimeTop, setCurrentTimeTop] = useState<number | null>(null);
  const [interaction, setInteraction] = useState<InteractionMode>(null);

  const pointerStart = useRef<{
    x: number; y: number;
    target: "event" | "slot";
    eventId?: string;
    date: string;
    time: string;
  } | null>(null);
  const hasMoved = useRef(false);

  useEffect(() => {
    function update() {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      setCurrentTimeTop(getEventTopPercent(`${h}:${m}`, START_HOUR, END_HOUR));
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const evt of events) {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    }
    return map;
  }, [events]);

  const { manualAllDayByDate, ordersByDate } = useMemo(() => {
    const manual: Record<string, CalendarEvent[]> = {};
    const orders: Record<string, CalendarEvent[]> = {};
    for (const evt of events) {
      if (evt.allDay) {
        if (evt.source === "order") {
          if (!orders[evt.date]) orders[evt.date] = [];
          orders[evt.date].push(evt);
        } else {
          if (!manual[evt.date]) manual[evt.date] = [];
          manual[evt.date].push(evt);
        }
      }
    }
    return { manualAllDayByDate: manual, ordersByDate: orders };
  }, [events]);

  const getSlotFromPoint = useCallback((clientX: number, clientY: number): { date: string; time: string } | null => {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const slotEl = (el as HTMLElement).closest("[data-slot-date]") as HTMLElement | null;
    if (!slotEl?.dataset.slotDate || !slotEl?.dataset.slotTime) return null;
    return { date: slotEl.dataset.slotDate, time: slotEl.dataset.slotTime };
  }, []);

  const handlePointerDown = useCallback((
    e: React.PointerEvent,
    target: "event" | "slot",
    targetDate: string,
    targetTime: string,
    eventId?: string
  ) => {
    if (e.button !== 0) return;
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

  const hasAllDay = weekDays.some((d) => {
    const ds = toDateStr(d);
    return (manualAllDayByDate[ds] || []).length > 0 || (ordersByDate[ds] || []).length > 0;
  });

  const pct = (hour: number) => ((hour - START_HOUR) / HOUR_RANGE) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-[#D8D8D6] shadow-sm overflow-hidden flex flex-col h-full"
    >
      {/* ─── Day headers ─── */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-[#DDDDD9] flex-shrink-0">
        <div className="bg-[#FAFAF9]" />
        {weekDays.map((d, di) => {
          const td = isToday(d);
          return (
            <div
              key={toDateStr(d)}
              className={`text-center py-3 ${di < 6 ? "border-r border-[#E4E4E2]" : ""} ${td ? "bg-[#4F46E5]/[0.03]" : "bg-[#FAFAF9]"}`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-widest ${td ? "text-[#4F46E5]" : "text-[#A0A09E]"}`}>
                {formatDayNameShort(d)}
              </div>
              <div className="mt-1 flex justify-center">
                <span className={`inline-flex items-center justify-center w-8 h-8 text-[14px] font-bold rounded-full transition-colors ${
                  td
                    ? "bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/25"
                    : "text-[#333]"
                }`}>
                  {d.getDate()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── All-day strip ─── */}
      {hasAllDay && (
        <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-[#DDDDD9] flex-shrink-0 bg-[#FCFCFB]">
          <div className="flex items-center justify-center bg-[#FAFAF9]">
            <span className="text-[8px] text-[#BBBBB9] font-bold uppercase tracking-widest">All</span>
          </div>
          {weekDays.map((d, di) => {
            const dateStr = toDateStr(d);
            const dayManual = manualAllDayByDate[dateStr] || [];
            const dayOrders = ordersByDate[dateStr] || [];
            return (
              <div key={dateStr} className={`px-1 py-2 space-y-1 min-h-[36px] flex flex-col justify-center ${di < 6 ? "border-r border-[#E4E4E2]" : ""}`}>
                {dayManual.map((evt) => {
                  const bgColor = getEventDisplayColor(evt);
                  return (
                    <button
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className="w-full text-left px-1.5 py-[3px] rounded-[4px] text-[9px] font-bold text-white truncate hover:brightness-110 transition-all cursor-pointer"
                      style={{ backgroundColor: bgColor }}
                    >
                      {evt.title}
                    </button>
                  );
                })}
                {dayOrders.length > 0 && (
                  <div className="px-0.5">
                    <OrderDots orders={dayOrders} onSelect={onSelectEvent} compact />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Time grid ─── */}
      <div
        className="flex-1 min-h-0 relative overflow-hidden"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ userSelect: interaction ? "none" : undefined }}
      >
        <div className="absolute inset-0 grid grid-cols-[48px_repeat(7,1fr)]">
          {/* Time labels column */}
          <div className="relative bg-[#FAFAF9]">
            {timeSlots.map((slot) => {
              const hour = parseInt(slot);
              const isMajor = hour % 6 === 0;
              return (
                <div
                  key={slot}
                  className={`absolute right-3 tabular-nums -translate-y-1/2 select-none ${
                    isMajor
                      ? "text-[10px] font-bold text-[#777]"
                      : hour % 3 === 0
                        ? "text-[9px] font-semibold text-[#999]"
                        : "text-[8px] font-medium text-[#C0C0BE]"
                  }`}
                  style={{ top: `${pct(hour)}%` }}
                >
                  {hour.toString().padStart(2, "0")}
                </div>
              );
            })}
          </div>

          {/* Day columns */}
          {weekDays.map((d, di) => {
            const dateStr = toDateStr(d);
            const dayEvents = (eventsByDate[dateStr] || []).filter((e) => !e.allDay && e.startTime);
            const td = isToday(d);

            return (
              <div
                key={dateStr}
                className={`relative ${di < 6 ? "border-r border-[#E4E4E2]" : ""} ${
                  td ? "bg-[#4F46E5]/[0.015]" : ""
                }`}
              >
                {/* Hour gridlines + interaction targets */}
                {timeSlots.map((slot) => {
                  const hour = parseInt(slot);
                  const isSelected =
                    interaction?.type === "select" &&
                    interaction.date === dateStr &&
                    hour >= parseInt(interaction.startTime) &&
                    hour < parseInt(interaction.endTime);

                  const isDragTarget =
                    interaction?.type === "drag" &&
                    interaction.hoverDate === dateStr &&
                    interaction.hoverTime === slot;

                  const isMajor = hour % 6 === 0;
                  const is3h = hour % 3 === 0;

                  let borderClass: string;
                  if (isMajor) {
                    borderClass = "border-[#CCCCC9]";
                  } else if (is3h) {
                    borderClass = "border-[#DCDCDA]";
                  } else {
                    borderClass = "border-[#EAEAE8]";
                  }

                  return (
                    <div
                      key={slot}
                      data-slot-date={dateStr}
                      data-slot-time={slot}
                      className={`absolute left-0 right-0 border-t transition-colors ${borderClass} ${
                        isSelected ? "bg-[#4F46E5]/[0.06]" :
                        isDragTarget ? "bg-[#4F46E5]/[0.03]" :
                        "hover:bg-[#F8F8F6]"
                      }`}
                      style={{
                        top: `${pct(hour)}%`,
                        height: `${100 / HOUR_RANGE}%`,
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
                      <div className="absolute -left-[5px] -top-[5px] w-[10px] h-[10px] rounded-full bg-[#4F46E5] shadow-sm shadow-[#4F46E5]/30" />
                      <div className="h-[2px] bg-[#4F46E5] w-full shadow-sm shadow-[#4F46E5]/20" />
                    </div>
                  </div>
                )}

                {/* Events — left-accent premium cards */}
                {dayEvents.map((evt) => {
                  const accentColor = getEventDisplayColor(evt);
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
                        handlePointerDown(e, "event", dateStr, evt.startTime || "09:00", evt.id);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!hasMoved.current) onSelectEvent(evt);
                      }}
                      className={`absolute left-[3px] right-[3px] z-10 rounded-[5px] overflow-hidden transition-all text-left group ${
                        isOrder ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                      } hover:shadow-md hover:z-20 hover:brightness-95`}
                      style={{
                        top: `${topPct}%`,
                        height: `${heightPct}%`,
                        minHeight: 18,
                        backgroundColor: getEventBgColor(evt, 0.85),
                        borderLeft: `3px solid ${accentColor}`,
                      }}
                    >
                      <div className="px-1.5 py-[2px] h-full">
                        <div className="text-[9px] font-bold truncate leading-tight text-white drop-shadow-sm">
                          {evt.title}
                        </div>
                        {heightPct > 3 && (
                          <div className="text-[8px] font-semibold truncate text-white/80">
                            {evt.startTime}{evt.endTime ? `–${evt.endTime}` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Drag ghost */}
                {interaction?.type === "drag" && interaction.hoverDate === dateStr && (() => {
                  const draggedEvent = events.find(ev => ev.id === interaction.eventId);
                  if (!draggedEvent) return null;
                  const accentColor = getEventDisplayColor(draggedEvent);
                  const topPct = getEventTopPercent(interaction.hoverTime, START_HOUR, END_HOUR);
                  const duration = draggedEvent.startTime && draggedEvent.endTime
                    ? getEventHeightPercent(draggedEvent.startTime, draggedEvent.endTime, START_HOUR, END_HOUR)
                    : (60 / (HOUR_RANGE * 60)) * 100;

                  return (
                    <div
                      className="absolute left-[3px] right-[3px] z-30 rounded-[5px] px-1.5 py-1 shadow-lg opacity-90 pointer-events-none"
                      style={{
                        top: `${topPct}%`,
                        height: `${duration}%`,
                        minHeight: 18,
                        backgroundColor: getEventBgColor({ ...draggedEvent } as CalendarEvent, 0.9),
                        borderLeft: `3px solid ${accentColor}`,
                      }}
                    >
                      <div className="text-[9px] font-bold truncate text-white drop-shadow-sm">
                        {draggedEvent.title}
                      </div>
                    </div>
                  );
                })()}

                {/* Selection highlight */}
                {interaction?.type === "select" && interaction.date === dateStr && (() => {
                  const topPct = getEventTopPercent(interaction.startTime, START_HOUR, END_HOUR);
                  const bottomPct = getEventTopPercent(interaction.endTime, START_HOUR, END_HOUR);
                  return (
                    <div
                      className="absolute left-[3px] right-[3px] z-15 rounded-[5px] bg-[#4F46E5]/8 border-2 border-[#4F46E5]/20 border-dashed pointer-events-none"
                      style={{
                        top: `${topPct}%`,
                        height: `${Math.max(2, bottomPct - topPct)}%`,
                        minHeight: 18,
                      }}
                    >
                      <div className="text-[9px] font-bold text-[#4F46E5] px-1.5 pt-0.5">
                        {interaction.startTime}–{interaction.endTime}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function addOneHour(time: string): string {
  const [h] = time.split(":").map(Number);
  return `${Math.min(h + 1, 23).toString().padStart(2, "0")}:00`;
}
