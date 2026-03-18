"use client";

import { useRef, useEffect } from "react";

interface SelectableCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export default function SelectableCheckbox({
  checked,
  indeterminate = false,
  disabled = false,
  onChange,
}: SelectableCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const isActive = checked || indeterminate;

  return (
    <label
      className={`
        relative flex items-center justify-center w-4 h-4 rounded-[4px] border-[1.5px]
        transition-all duration-150 ease-in-out
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-[1.03]"}
        ${isActive
          ? "border-[#6366F1] bg-[#6366F1]"
          : "border-[#D1D5DB] bg-white hover:border-[#9CA3AF]"
        }
        focus-within:ring-2 focus-within:ring-[#6366F1]/20 focus-within:ring-offset-1
      `}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-inherit"
        aria-checked={indeterminate ? "mixed" : checked}
      />
      {checked && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {indeterminate && !checked && (
        <div className="w-2 h-0.5 bg-white rounded pointer-events-none" />
      )}
    </label>
  );
}
