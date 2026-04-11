"use client";

import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Hook pour tracker les éléments nouvellement créés et leur appliquer
 * un highlight temporaire (glow vert 1.2s).
 *
 * Usage :
 * ```tsx
 * const { newIds, markNew, isNew } = useHighlightNew();
 * // Après création :
 * markNew("id-123");
 * // Dans le rendu :
 * <tr className={isNew("id-123") ? "highlight-new" : ""}>
 * ```
 */
export function useHighlightNew(duration = 1200) {
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const markNew = useCallback((id: string | string[]) => {
    const ids = Array.isArray(id) ? id : [id];
    setNewIds((prev) => {
      const next = new Set(prev);
      ids.forEach((i) => next.add(i));
      return next;
    });

    ids.forEach((i) => {
      // Clear existing timer if any
      const existing = timersRef.current.get(i);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(i);
          return next;
        });
        timersRef.current.delete(i);
      }, duration);
      timersRef.current.set(i, timer);
    });
  }, [duration]);

  const isNew = useCallback((id: string) => newIds.has(id), [newIds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return { newIds, markNew, isNew };
}
