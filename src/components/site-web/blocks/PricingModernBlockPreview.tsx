"use client";

import { memo } from "react";
import type { PricingModernBlockContent } from "@/types";
import { useProductsByIds } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function PlanCard({ name, price, period, description, features, isPopular, ctaLabel, link, style: btnStyle }: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  isPopular: boolean;
  ctaLabel: string;
  link?: Parameters<typeof SmartLinkButton>[0]["link"];
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: "var(--site-surface)",
        border: isPopular
          ? "2px solid var(--site-primary)"
          : "1px solid var(--site-border)",
        boxShadow: isPopular
          ? "0 0 40px -10px var(--site-primary-light), 0 8px 32px -8px rgba(0,0,0,0.3)"
          : "0 4px 24px -4px rgba(0,0,0,0.15)",
      }}
    >
      {isPopular && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wider px-4 py-1 rounded-full"
          style={{ backgroundColor: "var(--site-primary)", color: "#fff" }}
        >
          Populaire
        </span>
      )}

      <div className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--site-primary)" }}>
        {name}
      </div>

      <div className="mb-1 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--site-text)" }}>
          {price}
        </span>
        {period && (
          <span className="text-sm" style={{ color: "var(--site-muted)" }}>
            /{period}
          </span>
        )}
      </div>

      <p className="text-[13px] mb-6" style={{ color: "var(--site-muted)" }}>
        {description}
      </p>

      <div className="mb-5" style={{ borderBottom: "1px solid var(--site-border)" }} />

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, fi) => (
          <li key={fi} className="flex items-start gap-2.5 text-[13px]" style={{ color: "var(--site-text)" }}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              className="mt-0.5 flex-shrink-0"
              stroke="var(--site-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ opacity: 0.85 }}>{feature}</span>
          </li>
        ))}
      </ul>

      <SmartLinkButton
        link={link}
        label={ctaLabel}
        className="block w-full text-center text-[13px] font-semibold px-5 py-3 rounded-lg cursor-pointer transition-all duration-200"
        style={
          isPopular
            ? { backgroundColor: "var(--site-primary)", color: "#fff", borderRadius: "var(--site-btn-radius)" }
            : { backgroundColor: "transparent", color: "var(--site-text)", border: "1px solid var(--site-border)", borderRadius: "var(--site-btn-radius)" }
        }
      />
    </div>
  );
}

function PricingModernBlockPreviewInner({ content }: { content: PricingModernBlockContent }) {
  const mode = content.mode || "manual";
  const products = useProductsByIds(mode === "product" ? (content.productIds || []) : []);

  const isEmpty = mode === "product" ? products.length === 0 : (content.plans ?? []).length === 0;

  if (isEmpty) {
    return (
      <div className="py-8 text-center">
        <div className="text-[13px]" style={{ color: "var(--site-muted)" }}>
          {mode === "product" ? "Aucun produit selectionne" : "Aucun plan configure"}
        </div>
        <div className="text-[11px] mt-1" style={{ color: "var(--site-muted)", opacity: 0.6 }}>
          {mode === "product" ? "Ajoutez des produits depuis l\u0027onglet Contenu" : "Ajoutez des plans depuis l\u0027onglet Contenu"}
        </div>
      </div>
    );
  }

  // Build plan cards from either manual plans or products
  const cards = mode === "product"
    ? products.map((p) => ({
        name: p.name,
        price: formatPrice(p.priceCents),
        period: undefined as string | undefined,
        description: p.shortDescription || "",
        features: p.features || [],
        isPopular: p.id === content.highlightProductId,
        ctaLabel: p.ctaLabel || "Choisir",
        link: { type: "product" as const, productId: p.id, mode: "checkout" as const, briefTemplateId: content.briefTemplateId ?? undefined },
      }))
    : (content.plans ?? []).map((plan) => ({
        name: plan.name,
        price: plan.price,
        period: plan.period,
        description: plan.description,
        features: plan.features,
        isPopular: plan.isPopular,
        ctaLabel: plan.ctaLabel,
        link: plan.blockLink,
      }));

  const cols =
    cards.length === 1
      ? "grid-cols-1 max-w-md mx-auto"
      : cards.length === 2
        ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
        : cards.length === 3
          ? "grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto";

  return (
    <section className="py-16 px-4">
      {(content.title || content.subtitle) && (
        <div className="text-center mb-12">
          {content.title && (
            <h2
              className="text-3xl font-bold tracking-tight mb-3"
              style={{ color: "var(--site-text)", fontFamily: "var(--site-heading-font)" }}
            >
              {content.title}
            </h2>
          )}
          {content.subtitle && (
            <p className="text-base max-w-2xl mx-auto" style={{ color: "var(--site-muted)" }}>
              {content.subtitle}
            </p>
          )}
        </div>
      )}

      <div className={`grid ${cols} gap-6`}>
        {cards.map((card, index) => (
          <PlanCard key={index} {...card} />
        ))}
      </div>
    </section>
  );
}

export default memo(PricingModernBlockPreviewInner);
