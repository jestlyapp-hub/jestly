import { memo } from "react";
import type { LogoCloudBlockContent } from "@/types";

function LogoCloudBlockPreviewInner({ content }: { content: LogoCloudBlockContent }) {
  const cols = content.columns === 3 ? "grid-cols-2 sm:grid-cols-3" : content.columns === 5 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : content.columns === 6 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <div className="py-6">
      {content.title && <p className="text-[13px] text-center mb-6" style={{ color: "var(--site-muted)" }}>{content.title}</p>}
      <div className={`grid ${cols} gap-6 items-center justify-items-center`}>
        {content.logos.map((logo, i) => (
          <div key={i} className={`flex items-center justify-center h-12 ${content.grayscale ? "grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" : ""}`}>
            {logo.imageUrl ? (
              <img src={logo.imageUrl} alt={logo.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="px-4 py-2 rounded-lg border text-[11px] font-medium" style={{ background: "var(--site-surface, #F7F7F5)", borderColor: "var(--site-border, #E6E6E4)", color: "var(--site-muted, #999)" }}>{logo.name}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(LogoCloudBlockPreviewInner);
