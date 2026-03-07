import { memo } from "react";
import type { StatsCounterBlockContent } from "@/types";

function StatsCounterBlockPreviewInner({ content }: { content: StatsCounterBlockContent }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 text-center">
      {content.stats.map((stat, i) => (
        <div key={i}>
          <div className="text-2xl font-bold" style={{ color: "var(--site-text)" }}>{stat.value}</div>
          <div className="text-[12px]" style={{ color: "var(--site-muted)" }}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default memo(StatsCounterBlockPreviewInner);
