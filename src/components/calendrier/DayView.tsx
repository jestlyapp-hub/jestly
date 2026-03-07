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
import OrderDots from "./OrderDots";

const START_HOUR = 0;
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
      setCurrentTimeTop(getEventTopPercent(`${h}:${m}`, START_HOUR, END_HOUR));
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [today]);

  const dayEvents = useMemo(() => events.filter((e) => e.date === dateStr), [events, dateStr]);
  const manualAllDay = dayEvents.filter((e) => e.allDay && e.source !== "order");
  const orderEvents = dayEvents.filter((e) => e.allDay && e.source === "order");
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
      className="bg-[#FAFAF9] rounded-xl border border-[#E0E0DE] overflow-hidden flex flex-col h-full"
    >
      {/* ─── Day header ─── */}
      <div className={`px-5 py-3 border-b border-[#E0E0DE] flex-shrink-0 flex items-center gap-3 bg-[#F7F7F5] ${today ? "bg-[#4F46E5]/[0.03]" : ""}`}>
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-[16px] font-bold ${
          today ? "bg-[#4F46E5] text-white" : "text-[#1A1A1A] bg-[#EEEEED]"
        }`}>
          {date.getDate()}
        </span>
        <div>
          <div className={`text-[14px] font-semibold ${today ? "text-[#4F46E5]" : "text-[#1A1A1A]"}`}>
            {formatDayName(date)}
          </div>
          <div className="text-[11px] text-[#999]">{formatMonthName(date)} {date.getFullYear()}</div>
        </div>
      </div>

      {/* ─── All-day events + order markers ─── */}
      {(manualAllDay.length > 0 || orderEvents.length > 0) && (
        <div className="px-4 py-2.5 border-b border-[#E0E0DE] flex-shrink-0 bg-[#F7F7F5]/60">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Manual all-day events: pills */}
            {manualAllDay.map((evt) => {
              const bgColor = getEventDisplayColor(evt);
              return (
                <button
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="text-left px-3 py-1.5 rounded-md text-[12px] font-semibold text-white hover:brightness-105 transition-all cursor-pointer truncate max-w-[200px]"
                  style={{ backgroundColor: bgColor }}
                >
                  {evt.title}
                </button>
              );
            })}
            {/* Order markers with client initials */}
            {orderEvents.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-semibold text-[#B0B0AE] uppercase tracking-wider select-none">
                  Cmd
                </span>
                <OrderDots orders={orderEvents} onSelect={onSelectEvent} />
              </div>
            )}
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
          <div className="relative bg-[#F7F7F5]/50">
            {timeSlots.map((slot) => {
              const hour = parseInt(slot);
              const isMajor = hour === 0 || hour === 6 || hour === 12 || hour === 18;
              return (
                <div
                  key={slot}
                  className={`absolute right-3 tabular-nums -translate-y-1/2 select-none ${
                    isMajor
                      ? "text-[10px] font-semibold text-[#888]"
                      : "text-[9px] font-normal text-[#B8B8B6]"
                  }`}
                  style={{ top: `${pct(hour)}%` }}
                >
                  {hour.toString().padStart(2, "0")}h
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

              const isMidnight = hour === 0;
              const isNoon = hour === 12;
              const is6h = hour === 6 || hour === 18;
              const is3h = hour % 3 === 0;

              let borderClass: string;
              if (isMidnight || isNoon) {
                borderClass = "border-[#D4D4D2]";
              } else if (is6h) {
                borderClass = "border-[#DDDCDA]";
              } else if (is3h) {
                borderClass = "border-[#E5E5E3]";
              } else {
                borderClass = "border-[#EDEDEB]";
              }

              return (
                <div
                  key={slot}
                  data-slot-time={slot}
                  className={`absolute left-0 right-0 border-t transition-colors ${borderClass} ${
                    isSelected ? "bg-[#4F46E5]/[0.06]" : "hover:bg-[#F5F5F3]"
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
