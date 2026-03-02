import { memo } from "react";
import type { PricingTableBlockContent } from "@/types";
import { getButtonInlineStyle } from "@/lib/block-style-engine";

function PricingTableBlockPreviewInner({ content }: { content: PricingTableBlockContent }) {
  const cols = content.columns === 2 ? "grid-cols-2" : content.columns === 4 ? "grid-cols-4" : "grid-cols-3";

  return (
    <div className="py-6">
      {content.title && <h3 className="text-lg font-bold text-center mb-6">{content.title}</h3>}
      <div className={`grid ${cols} gap-4`}>
        {content.plans.map((plan, i) => (
          <div key={i} className={`rounded-xl border p-5 relative ${plan.isPopular ? "border-[var(--site-primary)] shadow-lg" : "border-[#E6E6E4]"}`}>
            {plan.isPopular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[var(--site-primary)] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Populaire</span>
            )}
            <div className="text-[13px] font-semibold mb-1">{plan.name}</div>
            <div className="text-[11px] opacity-50 mb-3">{plan.description}</div>
            <div className="text-2xl font-bold mb-1">{plan.price} €<span className="text-[11px] font-normal opacity-50">/{plan.period === "monthly" ? "mois" : "an"}</span></div>
            <ul className="space-y-1.5 my-4">
              {plan.features.map((f, fi) => (
                <li key={fi} className="text-[11px] opacity-70 flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <span className="btn-styled block text-center text-[12px] font-semibold px-4 py-2 cursor-pointer" style={getButtonInlineStyle()}>{plan.ctaLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(PricingTableBlockPreviewInner);
