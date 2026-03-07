"use client";

import { useState } from "react";
import { getEventDisplayColor, type CalendarEvent } from "@/lib/calendar-utils";

interface OrderDotsProps {
  orders: CalendarEvent[];
  maxDots?: number;
  onSelect: (event: CalendarEvent) => void;
}

export default function OrderDots({ orders, maxDots = 3, onSelect }: OrderDotsProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (orders.length === 0) return null;

  const visible = orders.slice(0, maxDots);
  const remaining = orders.length - maxDots;

  return (
    <div
      className="relative inline-flex items-center gap-[5px]"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {visible.map((order) => {
        const color = getEventDisplayColor(order);
        return (
          <button
            key={order.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(order);
            }}
            className="w-[7px] h-[7px] rounded-full transition-all hover:scale-[1.4] cursor-pointer flex-shrink-0 ring-0 hover:ring-2 hover:ring-offset-1"
            style={{
              backgroundColor: color,
              // @ts-expect-error CSS custom property
              "--tw-ring-color": `${color}40`,
            }}
            aria-label={order.title}
          />
        );
      })}
      {remaining > 0 && (
        <span className="text-[9px] text-[#999] font-medium leading-none select-none">
          +{remaining}
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-[#EAEAEA] rounded-lg shadow-lg py-1.5 min-w-[200px] max-w-[280px]">
          <div className="px-2.5 pb-1 mb-1 border-b border-[#F5F5F3]">
            <span className="text-[9px] font-semibold text-[#AEAEAC] uppercase tracking-wider">
              {orders.length} commande{orders.length > 1 ? "s" : ""}
            </span>
          </div>
          {orders.map((order) => {
            const color = getEventDisplayColor(order);
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
                  className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[11px] text-[#1A1A1A] truncate leading-tight">
                  {order.title}
                </span>
                {order.orderStatus && (
                  <span className="text-[9px] text-[#AEAEAC] ml-auto flex-shrink-0">
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
