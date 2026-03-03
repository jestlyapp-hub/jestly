"use client";

type FieldSaveState = "idle" | "saving" | "saved" | "error";

export default function FieldSaveIndicator({ state }: { state: FieldSaveState }) {
  if (state === "idle") return null;

  if (state === "saving") {
    return (
      <span className="inline-flex items-center ml-1.5">
        <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#D0D0CE" strokeWidth="2.5" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#8A8A88" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (state === "saved") {
    return (
      <span className="inline-flex items-center ml-1.5 text-emerald-500">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }

  // error
  return (
    <span className="inline-flex items-center ml-1.5 text-red-500">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </span>
  );
}
