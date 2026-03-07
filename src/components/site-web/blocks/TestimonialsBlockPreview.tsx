import { memo } from "react";
import type { TestimonialsBlockContent } from "@/types";

function TestimonialsBlockPreviewInner({ content }: { content: TestimonialsBlockContent }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
      {content.testimonials.map((t, i) => (
        <div key={i} className="p-4 rounded-lg" style={{ border: "1px solid var(--site-border, #E6E6E4)" }}>
          <p className="text-[12px] italic mb-3" style={{ color: "var(--site-muted, #666)" }}>&ldquo;{t.text}&rdquo;</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--site-primary-light)] flex items-center justify-center text-[10px] font-bold text-[var(--site-primary)]">
              {t.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="text-[11px] font-semibold" style={{ color: "var(--site-text, #1A1A1A)" }}>{t.name}</div>
              <div className="text-[10px]" style={{ color: "var(--site-muted, #999)" }}>{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(TestimonialsBlockPreviewInner);
