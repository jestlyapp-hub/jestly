import { memo } from "react";
import type { PricingTableBlockContent } from "@/types";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";
import { useProductsByIds } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";

function PricingTableBlockPreviewInner({ content }: { content: PricingTableBlockContent }) {
  const cols = content.columns === 2 ? "grid-cols-2" : content.columns === 4 ? "grid-cols-4" : "grid-cols-3";
  const resolvedProducts = useProductsByIds(content.productIds || []);
  const displayPlans = content.mode === "product" && resolvedProducts.length > 0
    ? resolvedProducts.map(p => ({
        name: p.name,
        price: p.priceCents / 100,
        period: "monthly" as const,
        description: p.shortDescription || "",
        features: p.features || [],
        isPopular: false,
        ctaLabel: p.ctaLabel || "Choisir",
        productId: p.id,
      }))
    : content.plans;

  return (
    <div className="py-6">
      {content.title && <h3 className="text-lg font-bold text-center mb-6" style={{ color: "var(--site-text)" }}>{content.title}</h3>}
      <div className={`grid ${cols} gap-4`}>
        {displayPlans.map((plan, i) => (
          <div
            key={i}
            className={`rounded-xl p-5 relative ${plan.isPopular ? "shadow-lg" : ""}`}
            style={{ border: plan.isPopular ? "2px solid var(--site-primary)" : "1px solid var(--site-border, #E6E6E4)" }}
          >
            {plan.isPopular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[var(--site-primary)] text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider" style={{ color: "var(--btn-text, #fff)" }}>Populaire</span>
            )}
            <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--site-text)" }}>{plan.name}</div>
            <div className="text-[11px] mb-3" style={{ color: "var(--site-muted)" }}>{plan.description}</div>
            <div className="text-2xl font-bold mb-1" style={{ color: "var(--site-text)" }}>
              {plan.price} &euro;<span className="text-[11px] font-normal" style={{ color: "var(--site-muted)" }}>/{plan.period === "monthly" ? "mois" : "an"}</span>
            </div>
            <ul className="space-y-1.5 my-4">
              {plan.features.map((f, fi) => (
                <li key={fi} className="text-[11px] flex items-center gap-1.5" style={{ color: "var(--site-muted)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <SmartLinkButton link={plan.productId ? { type: "product", productId: plan.productId, mode: "checkout" } : { type: "none" }} label={plan.ctaLabel} className="block text-center text-[12px] font-semibold px-4 py-2 cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(PricingTableBlockPreviewInner);
