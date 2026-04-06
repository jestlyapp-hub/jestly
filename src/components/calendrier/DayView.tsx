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
  getEventBgColor,
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
  onResizeEvent?: (eventId: string, newStartTime: string, newEndTime: string) => void;
}

type InteractionMode =
  | null
  | { type: "drag"; eventId: string; hoverTime: string }
  | { type: "select"; startTime: string; endTime: string }
  | { type: "resize"; eventId: string; edge: "top" | "bottom"; startTime: string; endTime: string };

export default function DayView({ date, events, onSelectEvent, onCreateEvent, onMoveEvent, onResizeEvent }: DayViewProps) {
  const dateStr = toDateStr(date);
  const timeSlots = useMemo(() => generateTimeSlots(START_HOUR, END_HOUR - 1), []);
  const [currentTimeTop, setCurrentTimeTop] = useState<number | null>(null);
  const [interaction, setInteraction] = useState<InteractionMode>(null);
  const today = isToday(date);
  const gridRef = useRef<HTMLDivElement>(null);

  const pointerStart = useRef<{
    x: number; y: number;
    target: "event" | "slot" | "resize-top" | "resize-bottom";
    eventId?: string;
    time: string;
    origStart?: string;
    origEnd?: string;
  } | null>(null);
  const hasMoved = useRef(false);
  const didResize = useRef(false);

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

  /** Convert pixel Y to time string (15min snap) */
  const yToTime = useCallback((clientY: number): string | null => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const relY = clientY - rect.top;
    const pctY = relY / rect.height;
    const totalMin = pctY * HOUR_RANGE * 60;
    const snapped = Math.round(totalMin / 15) * 15;
    const clamped = Math.max(0, Math.min(HOUR_RANGE * 60 - 15, snapped));
    const h = Math.floor(clamped / 60);
    const m = clamped % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }, []);

  const getSlotFromPoint = useCallback((_clientX: number, clientY: number): string | null => {
    const el = document.elementFromPoint(_clientX, clientY);
    if (!el) return null;
    const slotEl = (el as HTMLElement).closest("[data-slot-time]") as HTMLElement | null;
    return slotEl?.dataset.slotTime || null;
  }, []);

  const handlePointerDown = useCallback((
    e: React.PointerEvent,
    target: "event" | "slot" | "resize-top" | "resize-bottom",
    time: string,
    eventId?: string,
    origStart?: string,
    origEnd?: string,
  ) => {
    if (e.button !== 0) return;
    pointerStart.current = { x: e.clientX, y: e.clientY, target, eventId, time, origStart, origEnd };
    hasMoved.current = false;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerStart.current) return;
    if (Math.abs(e.clientX - pointerStart.current.x) + Math.abs(e.clientY - pointerStart.current.y) < 5) return;
    hasMoved.current = true;

    const ps = pointerStart.current;

    if (ps.target === "resize-top" || ps.target === "resize-bottom") {
      const time = yToTime(e.clientY);
      if (!time || !ps.origStart || !ps.origEnd) return;
      let newStart = ps.origStart;
      let newEnd = ps.origEnd;
      if (ps.target === "resize-top") {
        newStart = time < ps.origEnd ? time : ps.origEnd;
        if (newStart >= newEnd) {
          const [eH, eM] = newEnd.split(":").map(Number);
          const minStart = (eH * 60 + eM) - 15;
          const h = Math.floor(Math.max(0, minStart) / 60);
          const m = Math.max(0, minStart) % 60;
          newStart = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        }
      } else {
        newEnd = time > ps.origStart ? time : ps.origStart;
        if (newEnd <= newStart) {
          const [sH, sM] = newStart.split(":").map(Number);
          const minEnd = (sH * 60 + sM) + 15;
          const h = Math.floor(Math.min(HOUR_RANGE * 60, minEnd) / 60);
          const m = minEnd % 60;
          newEnd = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        }
      }
      setInteraction({ type: "resize", eventId: ps.eventId!, edge: ps.target === "resize-top" ? "top" : "bottom", startTime: newStart, endTime: newEnd });
      return;
    }

    const slot = getSlotFromPoint(e.clientX, e.clientY);
    if (!slot) return;

    if (ps.target === "event" && ps.eventId) {
      setInteraction({ type: "drag", eventId: ps.eventId, hoverTime: slot });
    } else if (ps.target === "slot") {
      const [sH] = ps.time.split(":").map(Number);
      const [eH] = slot.split(":").map(Number);
      if (eH >= sH) {
        setInteraction({ type: "select", startTime: ps.time, endTime: addOneHour(slot) });
      } else {
        setInteraction({ type: "select", startTime: slot, endTime: addOneHour(ps.time) });
      }
    }
  }, [getSlotFromPoint, yToTime]);

  const handlePointerUp = useCallback(() => {
    if (!pointerStart.current) return;

    if (pointerStart.current.target === "resize-top" || pointerStart.current.target === "resize-bottom") {
      didResize.current = true;
      if (hasMoved.current && interaction?.type === "resize" && onResizeEvent) {
        onResizeEvent(interaction.eventId, interaction.startTime, interaction.endTime);
      }
    } else if (pointerStart.current.target === "event") {
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
  }, [interaction, events, dateStr, onSelectEvent, onCreateEvent, onMoveEvent, onResizeEvent]);

  const pct = (hour: number) => ((hour - START_HOUR) / HOUR_RANGE) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-[#D8D8D6] shadow-sm overflow-hidden flex flex-col h-full"
    >
      {/* ─── Day header ─── */}
      <div className={`px-6 py-4 border-b border-[#DDDDD9] flex-shrink-0 flex items-center gap-4 ${today ? "bg-[#4F46E5]/[0.02]" : "bg-[#FAFAF9]"}`}>
        <span className={`inline-flex items-center justify-center w-11 h-11 rounded-full text-[18px] font-bold ${
          today
            ? "bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/25"
            : "text-[#333] bg-[#F0F0EE]"
        }`}>
          {date.getDate()}
        </span>
        <div>
          <div className={`text-[16px] font-bold tracking-[-0.01em] ${today ? "text-[#4F46E5]" : "text-[#191919]"}`}>
            {formatDayName(date)}
          </div>
          <div className="text-[12px] font-medium text-[#999]">{formatMonthName(date)} {date.getFullYear()}</div>
        </div>
      </div>

      {/* ─── All-day events + order markers ─── */}
      {(manualAllDay.length > 0 || orderEvents.length > 0) && (
        <div className="px-6 py-3 border-b border-[#DDDDD9] flex-shrink-0 bg-[#FCFCFB]">
          <div className="flex items-center gap-3 flex-wrap">
            {manualAllDay.map((evt) => {
              const bgColor = getEventDisplayColor(evt);
              return (
                <button
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="text-left px-3 py-1.5 rounded-md text-[12px] font-bold text-white hover:brightness-110 hover:shadow-sm transition-all cursor-pointer truncate max-w-[220px]"
                  style={{ backgroundColor: bgColor }}
                >
                  {evt.title}
                </button>
              );
            })}
            {orderEvents.length > 0 && (
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] font-bold text-[#BBBBB9] uppercase tracking-widest select-none">
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
        <div ref={gridRef} className="absolute inset-0 grid grid-cols-[56px_1fr]">
          {/* Time labels */}
          <div className="relative bg-[#FAFAF9]">
            {timeSlots.map((slot) => {
              const hour = parseInt(slot);
              const isMajor = hour % 6 === 0;
              return (
                <div
                  key={slot}
                  className={`absolute right-4 tabular-nums -translate-y-1/2 select-none ${
                    isMajor
                      ? "text-[11px] font-bold text-[#777]"
                      : hour % 3 === 0
                        ? "text-[10px] font-semibold text-[#999]"
                        : "text-[9px] font-medium text-[#C0C0BE]"
                  }`}
                  style={{ top: `${pct(hour)}%` }}
                >
                  {hour.toString().padStart(2, "0")}
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
                  data-slot-time={slot}
                  className={`absolute left-0 right-0 border-t transition-colors ${borderClass} ${
                    isSelected ? "bg-[#4F46E5]/[0.06]" : "hover:bg-[#F8F8F6]"
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
                  <div className="absolute -left-[5px] -top-[5px] w-[10px] h-[10px] rounded-full bg-[#4F46E5] shadow-sm shadow-[#4F46E5]/30" />
                  <div className="h-[2px] bg-[#4F46E5] w-full shadow-sm shadow-[#4F46E5]/20" />
                </div>
              </div>
            )}

            {/* Events — left-accent premium cards with resize handles */}
            {timedEvents.map((evt) => {
              const accentColor = getEventDisplayColor(evt);
              const isResizing = interaction?.type === "resize" && interaction.eventId === evt.id;
              const displayStart = isResizing ? interaction.startTime : evt.startTime!;
              const displayEnd = isResizing ? interaction.endTime : (evt.endTime || addOneHour(evt.startTime!));
              const topPct = getEventTopPercent(displayStart, START_HOUR, END_HOUR);
              const heightPct = getEventHeightPercent(displayStart, displayEnd, START_HOUR, END_HOUR);

              const isDragging = interaction?.type === "drag" && interaction.eventId === evt.id;
              if (isDragging) return null;
              const isOrder = evt.source === "order";
              const isManual = evt.source === "manual";

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
                    if (didResize.current) { didResize.current = false; return; }
                    if (!hasMoved.current) onSelectEvent(evt);
                  }}
                  className={`absolute left-3 right-4 z-10 rounded-[6px] overflow-hidden transition-all text-left group ${
                    isOrder ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                  } hover:shadow-md hover:z-20 hover:brightness-95`}
                  style={{
                    top: `${topPct}%`,
                    height: `${heightPct}%`,
                    minHeight: 24,
                    backgroundColor: getEventBgColor(evt, 0.85),
                    borderLeft: `3px solid ${accentColor}`,
                  }}
                >
                  {/* Resize handle — top */}
                  {isManual && (
                    <div
                      className="absolute top-0 left-0 right-0 h-[8px] cursor-n-resize z-20 group/handle"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        handlePointerDown(e, "resize-top", evt.startTime!, evt.id, evt.startTime!, evt.endTime || addOneHour(evt.startTime!));
                      }}
                    >
                      <div className="mx-auto mt-[2px] w-8 h-[3px] rounded-full bg-white/40 opacity-0 group-hover/handle:opacity-100 group-hover:opacity-60 transition-opacity" />
                    </div>
                  )}

                  <div className="px-3 py-1 h-full">
                    <div className="text-[12px] font-bold truncate text-white drop-shadow-sm">
                      {evt.title}
                    </div>
                    <div className="text-[10px] font-semibold truncate text-white/80">
                      {displayStart}–{displayEnd}
                    </div>
                    {heightPct > 5 && evt.clientName && (
                      <div className="text-[10px] font-semibold mt-0.5 truncate text-white/65">
                        {evt.clientName}
                      </div>
                    )}
                  </div>

                  {/* Resize handle — bottom */}
                  {isManual && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[8px] cursor-s-resize z-20 group/handle"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        handlePointerDown(e, "resize-bottom", evt.endTime || addOneHour(evt.startTime!), evt.id, evt.startTime!, evt.endTime || addOneHour(evt.startTime!));
                      }}
                    >
                      <div className="mx-auto mb-[2px] w-8 h-[3px] rounded-full bg-white/40 opacity-0 group-hover/handle:opacity-100 group-hover:opacity-60 transition-opacity" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Drag ghost */}
            {interaction?.type === "drag" && (() => {
              const draggedEvent = events.find(ev => ev.id === interaction.eventId);
              if (!draggedEvent) return null;
              const accentColor = getEventDisplayColor(draggedEvent);
              const topPct = getEventTopPercent(interaction.hoverTime, START_HOUR, END_HOUR);
              const duration = draggedEvent.startTime && draggedEvent.endTime
                ? getEventHeightPercent(draggedEvent.startTime, draggedEvent.endTime, START_HOUR, END_HOUR)
                : (60 / (HOUR_RANGE * 60)) * 100;

              return (
                <div
                  className="absolute left-3 right-4 z-30 rounded-[6px] px-3 py-1 shadow-lg opacity-90 pointer-events-none"
                  style={{
                    top: `${topPct}%`,
                    height: `${duration}%`,
                    minHeight: 24,
                    backgroundColor: getEventBgColor(draggedEvent as CalendarEvent, 0.9),
                    borderLeft: `3px solid ${accentColor}`,
                  }}
                >
                  <div className="text-[12px] font-bold truncate text-white drop-shadow-sm">
                    {draggedEvent.title}
                  </div>
                  <div className="text-[10px] font-semibold text-white/80">
                    {interaction.hoverTime}
                  </div>
                </div>
              );
            })()}

            {/* Selection highlight */}
            {interaction?.type === "select" && (() => {
              const topPct = getEventTopPercent(interaction.startTime, START_HOUR, END_HOUR);
              const bottomPct = getEventTopPercent(interaction.endTime, START_HOUR, END_HOUR);
              return (
                <div
                  className="absolute left-3 right-4 z-15 rounded-[6px] bg-[#4F46E5]/8 border-2 border-[#4F46E5]/20 border-dashed pointer-events-none"
                  style={{
                    top: `${topPct}%`,
                    height: `${Math.max(2, bottomPct - topPct)}%`,
                    minHeight: 24,
                  }}
                >
                  <div className="text-[10px] font-bold text-[#4F46E5] px-3 pt-1">
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
