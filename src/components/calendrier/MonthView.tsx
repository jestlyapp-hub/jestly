"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  getMonthDays,
  toDateStr,
  getEventDisplayColor,
  type CalendarEvent,
  type MonthDay,
} from "@/lib/calendar-utils";
import OrderDots from "./OrderDots";

const WEEK_HEADERS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MAX_VISIBLE = 3;

interface MonthViewProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateEvent: (date: string) => void;
}

export default function MonthView({ year, month, events, onSelectEvent, onCreateEvent }: MonthViewProps) {
  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const evt of events) {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    }
    return map;
  }, [events]);

  const weeks: MonthDay[][] = useMemo(() => {
    const result: MonthDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-[#E6E6E4] overflow-x-auto"
    >
      <div className="min-w-[640px]">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-[#E6E6E4]">
          {WEEK_HEADERS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-semibold text-[#999] uppercase tracking-wider py-2 border-r border-[#EFEFEF] last:border-r-0"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-[#EFEFEF] last:border-b-0">
            {week.map((day) => {
              const dateStr = toDateStr(day.date);
              const dayEvents = eventsByDate[dateStr] || [];
              const visible = dayEvents.slice(0, MAX_VISIBLE);
              const remaining = dayEvents.length - MAX_VISIBLE;

              return (
                <div
                  key={dateStr}
                  onClick={() => onCreateEvent(dateStr)}
                  className={`min-h-[90px] p-1 border-r border-[#EFEFEF] last:border-r-0 cursor-pointer transition-colors hover:bg-[#FBFBFA] ${
                    !day.isCurrentMonth ? "bg-[#F7F7F5]" : ""
                  }`}
                >
                  {/* Day number */}
                  <div className="flex justify-end mb-0.5">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 text-[11px] font-semibold rounded-full ${
                        day.isToday
                          ? "bg-[#4F46E5] text-white"
                          : day.isCurrentMonth
                          ? "text-[#1A1A1A]"
                          : "text-[#CCC]"
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                  </div>

                  {/* Events */}
                  {(() => {
                    const manualEvents = dayEvents.filter((e) => e.source !== "order");
                    const orderEvts = dayEvents.filter((e) => e.source === "order");
                    const visibleManual = manualEvents.slice(0, MAX_VISIBLE);
                    const remainingManual = manualEvents.length - MAX_VISIBLE;

                    return (
                      <div className="space-y-0.5">
                        {/* Order dots */}
                        {orderEvts.length > 0 && (
                          <div className="px-0.5 py-[2px]">
                            <OrderDots orders={orderEvts} maxDots={3} onSelect={onSelectEvent} />
                          </div>
                        )}
                        {/* Manual events: pills */}
                        {visibleManual.map((evt) => {
                          const bgColor = getEventDisplayColor(evt);
                          return (
                            <button
                              key={evt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectEvent(evt);
                              }}
                              className="w-full text-left px-1.5 py-[3px] rounded text-[10px] font-semibold text-white truncate hover:brightness-110 transition-all cursor-pointer"
                              style={{ backgroundColor: bgColor }}
                            >
                              {!evt.allDay && evt.startTime && (
                                <span className="opacity-70 mr-0.5">{evt.startTime}</span>
                              )}
                              {evt.title}
                            </button>
                          );
                        })}
                        {remainingManual > 0 && (
                          <div className="text-[10px] text-[#999] font-medium pl-1.5">
                            +{remainingManual} de plus
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
