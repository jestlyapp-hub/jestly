"use client";

import { memo, useState, useEffect, useCallback } from "react";
import type { TestimonialsCarouselBlockContent } from "@/types";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= count ? "var(--site-primary)" : "#E6E6E4"} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialsCarouselBlockPreviewInner({ content }: { content: TestimonialsCarouselBlockContent }) {
  const [active, setActive] = useState(0);
  const count = content.testimonials.length;

  const next = useCallback(() => setActive((a) => (a + 1) % count), [count]);

  useEffect(() => {
    if (!content.autoplay || count <= 1) return;
    const id = setInterval(next, content.autoplayInterval || 5000);
    return () => clearInterval(id);
  }, [content.autoplay, content.autoplayInterval, count, next]);

  if (count === 0) return <div className="py-6 text-center text-[13px] opacity-50">Aucun témoignage</div>;

  const t = content.testimonials[active];

  return (
    <div className="py-6 text-center">
      <Stars count={t.rating} />
      <p className="text-[14px] italic opacity-70 my-4 max-w-md mx-auto">&ldquo;{t.text}&rdquo;</p>
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[var(--site-primary-light)] flex items-center justify-center text-[10px] font-bold text-[var(--site-primary)]">
          {t.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div className="text-left">
          <div className="text-[12px] font-semibold">{t.name}</div>
          <div className="text-[10px] opacity-50">{t.role}</div>
        </div>
      </div>
      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {content.testimonials.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} className={`w-2 h-2 rounded-full transition-colors ${i === active ? "bg-[var(--site-primary)]" : "bg-[#E6E6E4]"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(TestimonialsCarouselBlockPreviewInner);
