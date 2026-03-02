"use client";

import { memo, useState, useEffect, useRef } from "react";
import type { StatsAnimatedBlockContent } from "@/types";

function AnimatedNumber({ target, suffix, animate }: { target: number; suffix: string; animate: boolean }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!animate) { setCurrent(target); return; }
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, animate]);

  return <>{current}{suffix}</>;
}

function StatsAnimatedBlockPreviewInner({ content }: { content: StatsAnimatedBlockContent }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!content.animateOnScroll);

  useEffect(() => {
    if (!content.animateOnScroll) { setVisible(true); return; }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [content.animateOnScroll]);

  return (
    <div ref={ref} className="py-8">
      <div className={`grid gap-6 ${content.stats.length === 2 ? "grid-cols-2" : content.stats.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
        {content.stats.map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl font-bold text-[var(--site-primary)]">
              <AnimatedNumber target={s.value} suffix={s.suffix} animate={visible} />
            </div>
            <div className="text-[12px] opacity-50 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(StatsAnimatedBlockPreviewInner);
