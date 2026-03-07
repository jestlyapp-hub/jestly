import { memo } from "react";
import type { FeatureGridBlockContent } from "@/types";
import { getIcon } from "@/lib/icons";

function FeatureGridBlockPreviewInner({ content }: { content: FeatureGridBlockContent }) {
  const cols = content.columns === 2 ? "grid-cols-2" : content.columns === 4 ? "grid-cols-4" : "grid-cols-3";

  return (
    <div className="py-6">
      {content.title && <h3 className="text-lg font-bold text-center mb-1" style={{ color: "var(--site-text)" }}>{content.title}</h3>}
      {content.subtitle && <p className="text-[13px] text-center mb-6" style={{ color: "var(--site-muted)" }}>{content.subtitle}</p>}
      <div className={`grid ${cols} gap-4`}>
        {content.features.map((f, i) => (
          <div key={i} className="p-4 rounded-xl hover:shadow-sm transition-shadow" style={{ border: "1px solid var(--site-border, #E6E6E4)" }}>
            <div className="w-9 h-9 rounded-lg bg-[var(--site-primary-light)] flex items-center justify-center text-[var(--site-primary)] mb-3">
              {getIcon(f.icon)}
            </div>
            <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--site-text)" }}>{f.title}</div>
            <div className="text-[11px]" style={{ color: "var(--site-muted)" }}>{f.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(FeatureGridBlockPreviewInner);
