"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type FieldState = "idle" | "saving" | "saved" | "error";

export function useFieldSave() {
  const [states, setStates] = useState<Record<string, FieldState>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      for (const t of Object.values(timers.current)) clearTimeout(t);
    };
  }, []);

  const set = useCallback((field: string, state: FieldState, autoResetMs?: number) => {
    setStates((prev) => ({ ...prev, [field]: state }));
    // Clear any existing timer for this field
    if (timers.current[field]) clearTimeout(timers.current[field]);
    if (autoResetMs) {
      timers.current[field] = setTimeout(() => {
        setStates((prev) => ({ ...prev, [field]: "idle" }));
      }, autoResetMs);
    }
  }, []);

  const getState = useCallback(
    (field: string): FieldState => states[field] ?? "idle",
    [states]
  );

  const markSaving = useCallback((field: string) => set(field, "saving"), [set]);
  const markSaved = useCallback((field: string) => set(field, "saved", 1500), [set]);
  const markError = useCallback((field: string) => set(field, "error", 3000), [set]);

  return { getState, markSaving, markSaved, markError };
}
