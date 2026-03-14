"use client";

import { ArrowUp, ArrowDown } from "lucide-react";

interface AdminKpiCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  loading?: boolean;
}

export default function AdminKpiCard({
  label,
  value,
  change,
  icon,
  loading = false,
}: AdminKpiCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-20 bg-[#F0F0EE] rounded" />
          <div className="w-8 h-8 bg-[#F0F0EE] rounded-lg" />
        </div>
        <div className="h-7 w-24 bg-[#F0F0EE] rounded mt-1" />
        <div className="h-3 w-16 bg-[#F0F0EE] rounded mt-3" />
      </div>
    );
  }

  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="bg-white rounded-lg border border-[#E6E6E4] p-5 hover:border-[#D0D0CE] transition-colors duration-150">
      {/* En-tete */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-medium text-[#8A8A88] uppercase tracking-[0.04em]">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-[#F7F7F5] flex items-center justify-center text-[#8A8A88]">
            {icon}
          </div>
        )}
      </div>

      {/* Valeur */}
      <div className="text-[26px] font-bold text-[#191919] tracking-[-0.02em] leading-tight">
        {value}
      </div>

      {/* Variation */}
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {isPositive && (
            <ArrowUp size={13} strokeWidth={2} className="text-emerald-600" />
          )}
          {isNegative && (
            <ArrowDown size={13} strokeWidth={2} className="text-red-500" />
          )}
          <span
            className={`text-[12px] font-medium ${
              isPositive
                ? "text-emerald-600"
                : isNegative
                ? "text-red-500"
                : "text-[#8A8A88]"
            }`}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
          <span className="text-[11px] text-[#8A8A88] ml-0.5">vs mois dernier</span>
        </div>
      )}
    </div>
  );
}
