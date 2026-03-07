"use client";

import { useState } from "react";
import { getEventDisplayColor, type CalendarEvent } from "@/lib/calendar-utils";

interface OrderDotsProps {
  orders: CalendarEvent[];
  onSelect: (event: CalendarEvent) => void;
  /** Compact mode for tight spaces like month cells */
  compact?: boolean;
}

/** Extract first letter of client name, fallback to "?" */
function getInitial(order: CalendarEvent): string {
  const name = order.clientName?.trim();
  if (name) return name[0].toUpperCase();
  return "?";
}

export default function OrderDots({ orders, onSelect, compact }: OrderDotsProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (orders.length === 0) return null;

  const size = compact ? "w-[16px] h-[16px] text-[7px]" : "w-[18px] h-[18px] text-[8px]";
  const gap = compact ? "gap-[3px]" : "gap-[4px]";

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* All order markers — wrapping enabled */}
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
              className={`${size} rounded-full flex items-center justify-center font-bold text-white transition-all hover:scale-110 hover:shadow-sm cursor-pointer flex-shrink-0 leading-none`}
              style={{ backgroundColor: color }}
              aria-label={order.title}
              title={order.clientName || order.title}
            >
              {initial}
            </button>
          );
        })}
      </div>

      {/* Tooltip on hover */}
      {showTooltip && orders.length > 0 && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-[#E6E6E4] rounded-lg shadow-lg py-1.5 min-w-[220px] max-w-[300px]">
          <div className="px-2.5 pb-1 mb-1 border-b border-[#F0F0EE]">
            <span className="text-[9px] font-semibold text-[#AEAEAC] uppercase tracking-wider">
              {orders.length} commande{orders.length > 1 ? "s" : ""}
            </span>
          </div>
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
                className="flex items-center gap-2 w-full text-left py-1 px-2.5 hover:bg-[#F7F7F5] transition-colors cursor-pointer"
              >
                <span
                  className="w-[16px] h-[16px] rounded-full flex-shrink-0 flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {initial}
                </span>
                <span className="text-[11px] text-[#1A1A1A] truncate leading-tight flex-1">
                  {order.title}
                </span>
                {order.orderStatus && (
                  <span className="text-[9px] text-[#AEAEAC] ml-auto flex-shrink-0 capitalize">
                    {order.orderStatus.replace(/_/g, " ")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
