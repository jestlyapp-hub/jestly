"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  getMonthDays,
  toDateStr,
  getEventDisplayColor,
  getEventBgColor,
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-[#D8D8D6] shadow-sm overflow-hidden h-full flex flex-col"
    >
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-[#DDDDD9] flex-shrink-0 bg-[#FAFAF9]">
        {WEEK_HEADERS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-[10px] font-bold text-[#A0A09E] uppercase tracking-widest py-2.5 ${
              i < 6 ? "border-r border-[#E4E4E2]" : ""
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col">
        {weeks.map((week, wi) => (
          <div key={wi} className={`grid grid-cols-7 flex-1 ${wi < weeks.length - 1 ? "border-b border-[#E4E4E2]" : ""}`}>
            {week.map((day, di) => {
              const dateStr = toDateStr(day.date);
              const dayEvents = eventsByDate[dateStr] || [];

              return (
                <div
                  key={dateStr}
                  onClick={() => onCreateEvent(dateStr)}
                  className={`p-1.5 cursor-pointer transition-colors group ${
                    di < 6 ? "border-r border-[#E4E4E2]" : ""
                  } ${
                    !day.isCurrentMonth ? "bg-[#FAFAF9]" : "hover:bg-[#FCFCFB]"
                  } ${
                    day.isToday ? "bg-[#4F46E5]/[0.02]" : ""
                  }`}
                >
                  {/* Day number */}
                  <div className="flex justify-end mb-1">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 text-[12px] font-bold rounded-full transition-colors ${
                        day.isToday
                          ? "bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/20"
                          : day.isCurrentMonth
                          ? "text-[#333] group-hover:bg-[#F0F0EE]"
                          : "text-[#C8C8C6]"
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
                      <div className="space-y-[3px]">
                        {orderEvts.length > 0 && (
                          <div className="px-0.5 py-[2px]">
                            <OrderDots orders={orderEvts} onSelect={onSelectEvent} compact />
                          </div>
                        )}
                        {visibleManual.map((evt) => {
                          const accentColor = getEventDisplayColor(evt);
                          return (
                            <button
                              key={evt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectEvent(evt);
                              }}
                              className="w-full text-left px-1.5 py-[3px] rounded-[4px] text-[10px] font-bold truncate transition-all cursor-pointer hover:shadow-sm text-white"
                              style={{
                                backgroundColor: getEventBgColor(evt, 0.85),
                                borderLeft: `2px solid ${accentColor}`,
                              }}
                            >
                              {!evt.allDay && evt.startTime && (
                                <span className="opacity-75 mr-0.5 font-semibold">{evt.startTime}</span>
                              )}
                              {evt.title}
                            </button>
                          );
                        })}
                        {remainingManual > 0 && (
                          <div className="text-[10px] text-[#999] font-semibold pl-1.5">
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
