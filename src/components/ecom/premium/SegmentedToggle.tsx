"use client";

import { useRef } from "react";

/**
 * SegmentedToggle — sélecteur à pilule glissante (Revenue / Dépense / Profit /
 * MER…). La pastille active glisse en transform sous l'option choisie
 * (--ecom-t-base, ease-out). Clavier : flèches natives via role=radio.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const containerRef = useRef<HTMLDivElement>(null);
  const pad = size === "sm" ? "text-[var(--ecom-fs-caption)]" : "text-[var(--ecom-fs-label)]";

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      className="relative inline-flex items-center p-0.5 bg-[var(--ecom-surface-sunken)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-full)]"
    >
      {/* Pilule glissante */}
      <span
        aria-hidden
        className="absolute top-0.5 bottom-0.5 rounded-[var(--ecom-r-full)] bg-[var(--ecom-surface-1)] shadow-[var(--ecom-shadow-sm)] transition-transform duration-[var(--ecom-t-base)] ease-[var(--ecom-ease-out)]"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${idx * 100}%)`,
          left: 2,
        }}
      />
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`relative z-10 px-3 py-1 font-medium rounded-[var(--ecom-r-full)] whitespace-nowrap transition-colors duration-[var(--ecom-t-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecom-brand-violet)] ${pad} ${
              active ? "text-[var(--ecom-navy)]" : "text-[var(--ecom-muted)] hover:text-[var(--ecom-navy)]"
            }`}
            style={{ flex: 1 }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
