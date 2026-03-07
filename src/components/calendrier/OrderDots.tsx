"use client";

import { useState } from "react";
import { getEventDisplayColor, type CalendarEvent } from "@/lib/calendar-utils";

interface OrderDotsProps {
  orders: CalendarEvent[];
  onSelect: (event: CalendarEvent) => void;
  compact?: boolean;
}

function getInitial(order: CalendarEvent): string {
  const name = order.clientName?.trim();
  if (name) return name[0].toUpperCase();
  return "?";
}

export default function OrderDots({ orders, onSelect, compact }: OrderDotsProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (orders.length === 0) return null;

  const size = compact
    ? "w-[17px] h-[17px] text-[7px]"
    : "w-[20px] h-[20px] text-[8px]";
  const gap = compact ? "gap-[3px]" : "gap-[5px]";

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`flex flex-wrap items-center ${gap}`}>
        {orders.map((order) => {
          const color = getEventDisplayColor(order);
          const initial = getInitial(order);
          return (
            <button
              key={order.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(order);
              }}
              className={`${size} rounded-full flex items-center justify-center font-extrabold text-white cursor-pointer flex-shrink-0 leading-none transition-all duration-150 hover:scale-[1.15] hover:shadow-md hover:ring-2 hover:ring-white/60`}
              style={{
                backgroundColor: color,
                boxShadow: `0 1px 3px ${color}30`,
              }}
              aria-label={order.title}
              title={order.clientName || order.title}
            >
              {initial}
            </button>
          );
        })}
      </div>

      {/* Premium tooltip */}
      {showTooltip && orders.length > 0 && (
        <div className="absolute left-0 top-full mt-2 z-50 bg-white border border-[#E6E6E4] rounded-xl shadow-xl shadow-black/8 py-2 min-w-[240px] max-w-[320px]">
          <div className="px-3 pb-1.5 mb-1 border-b border-[#F0F0EE]">
            <span className="text-[10px] font-bold text-[#B0B0AE] uppercase tracking-wider">
              {orders.length} commande{orders.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="py-0.5">
            {orders.map((order) => {
              const color = getEventDisplayColor(order);
              const initial = getInitial(order);
              return (
                <button
                  key={order.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(order);
                  }}
                  className="flex items-center gap-2.5 w-full text-left py-1.5 px-3 hover:bg-[#F7F7F5] transition-colors cursor-pointer group"
                >
                  <span
                    className="w-[18px] h-[18px] rounded-full flex-shrink-0 flex items-center justify-center text-[7px] font-extrabold text-white transition-transform group-hover:scale-110"
                    style={{ backgroundColor: color }}
                  >
                    {initial}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-[#1A1A1A] truncate leading-tight">
                      {order.title}
                    </div>
                    {order.orderStatus && (
                      <div className="text-[10px] text-[#B0B0AE] capitalize leading-tight mt-0.5">
                        {order.orderStatus.replace(/_/g, " ")}
                        {order.orderPrice != null && ` — ${order.orderPrice}\u00A0\u20AC`}
                      </div>
                    )}
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
