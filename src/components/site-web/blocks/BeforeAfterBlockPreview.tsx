"use client";

import { memo, useState, useRef, useCallback } from "react";
import type { BeforeAfterBlockContent } from "@/types";

function BeforeAfterBlockPreviewInner({ content }: { content: BeforeAfterBlockContent }) {
  const [position, setPosition] = useState(content.initialPosition);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleMove(e.clientX);
  }, [handleMove]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging.current) handleMove(e.clientX);
  }, [handleMove]);

  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  return (
    <div className="py-6">
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/9] rounded-xl overflow-hidden cursor-col-resize select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* After (full width behind) */}
        {content.afterImageUrl ? (
          <img src={content.afterImageUrl} alt={content.afterLabel} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[var(--site-primary-light)] flex items-center justify-center text-[11px] text-[var(--site-primary)]">Après</div>
        )}
        {/* Before (clipped) */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          {content.beforeImageUrl ? (
            <img src={content.beforeImageUrl} alt={content.beforeLabel} className="absolute inset-0 w-full h-full object-cover" style={{ width: containerRef.current?.offsetWidth ?? "100%" }} />
          ) : (
            <div className="absolute inset-0 bg-[#E6E6E4] flex items-center justify-center text-[11px] text-[#999]" style={{ width: containerRef.current?.offsetWidth ?? "100%" }}>Avant</div>
          )}
        </div>
        {/* Slider handle */}
        <div className="absolute top-0 bottom-0" style={{ left: `${position}%`, transform: "translateX(-50%)" }}>
          <div className="w-[3px] h-full bg-white shadow-lg" />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>
        {/* Labels */}
        <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white bg-black/40 px-2 py-0.5 rounded">{content.beforeLabel}</span>
        <span className="absolute bottom-3 right-3 text-[10px] font-bold text-white bg-black/40 px-2 py-0.5 rounded">{content.afterLabel}</span>
      </div>
    </div>
  );
}

export default memo(BeforeAfterBlockPreviewInner);
