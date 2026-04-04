"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook partagé pour le comportement modal du guide :
 * - Focus trap (Tab / Shift+Tab)
 * - Scroll lock du body
 * - Restauration du focus à la fermeture
 * - Escape pour fermer
 *
 * Usage :
 *   const containerRef = useModalBehavior(isOpen, onClose);
 *   <div ref={containerRef}>...</div>
 */
export function useModalBehavior(
  isOpen: boolean,
  onClose?: () => void,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // ── Scroll lock ──
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      body.style.overflow = prevOverflow;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // ── Focus trap + initial focus + restore ──
  useEffect(() => {
    if (!isOpen) return;

    // Save previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element
    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      const firstFocusable = container.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  // ── Tab trap ──
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [isOpen, onClose]);

  return containerRef;
}

/**
 * Hook léger pour le scroll lock seul (overlay guide sans focus trap complet).
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      body.style.overflow = prevOverflow;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
