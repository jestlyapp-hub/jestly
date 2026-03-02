import { memo } from "react";
import type { PortfolioGridBlockContent } from "@/types";

function PortfolioGridBlockPreviewInner({ content }: { content: PortfolioGridBlockContent }) {
  const cols = content.columns === 2 ? "grid-cols-2" : content.columns === 4 ? "grid-cols-4" : "grid-cols-3";
  return (
    <div className={`grid ${cols} gap-3 py-4`}>
      {content.items.map((item, i) => (
        <div key={i} className="rounded-lg overflow-hidden border border-[#E6E8F0]">
          <div className="h-24 bg-gradient-to-br from-[#F0EBFF] to-[#E6E8F0]" />
          <div className="p-3">
            <div className="text-[12px] font-medium text-[#1A1A1A]">{item.title}</div>
            <div className="text-[10px] text-[#999]">{item.category}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(PortfolioGridBlockPreviewInner);
