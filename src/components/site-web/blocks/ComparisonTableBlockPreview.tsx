import { memo } from "react";
import type { ComparisonTableBlockContent } from "@/types";
import { getButtonInlineStyle } from "@/lib/block-style-engine";

function ComparisonTableBlockPreviewInner({ content }: { content: ComparisonTableBlockContent }) {
  return (
    <div className="py-6">
      {content.title && <h3 className="text-lg font-bold text-center mb-6">{content.title}</h3>}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="text-[12px] font-medium text-[#999] pb-3 pr-4">Fonctionnalités</th>
              {content.plans.map((plan, i) => (
                <th key={i} className={`text-[13px] font-bold pb-3 px-4 text-center ${plan.isHighlighted ? "text-[var(--site-primary)]" : ""}`}>{plan.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row, ri) => (
              <tr key={ri} className="border-t border-[#E6E6E4]">
                <td className="text-[12px] py-2.5 pr-4">{row.feature}</td>
                {row.values.map((val, vi) => (
                  <td key={vi} className="text-center py-2.5 px-4">
                    {typeof val === "boolean" ? (
                      val ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      )
                    ) : (
                      <span className="text-[12px]">{val}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#E6E6E4]">
              <td />
              {content.plans.map((plan, i) => (
                <td key={i} className="text-center pt-4 px-4">
                  <span className="btn-styled inline-block text-[11px] font-semibold px-4 py-1.5 cursor-pointer" style={getButtonInlineStyle()}>{plan.ctaLabel}</span>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default memo(ComparisonTableBlockPreviewInner);
