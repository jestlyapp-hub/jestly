import { memo } from "react";
import type { BlockType } from "@/types";

/*
 * Miniature abstraite pour chaque type de bloc.
 * Shapes géométriques stylisées — design system unifié.
 *
 * Tokens:
 *   Title:     h-2  bg-[#191919]/70
 *   Subtitle:  h-1.5  bg-[#191919]/20
 *   Body:      h-1  bg-[#191919]/15
 *   Label:     h-1  bg-[#191919]/30
 *   CTA:       bg-[#4F46E5]
 *   Accent:    bg-[#4F46E5]/40
 *   Card bg:   bg-[#EEF2FF]
 *   Surface:   bg-[#F7F7F5]
 *   Border:    border-[#E6E6E4]
 *   Avatar:    rounded-full bg-[#EEF2FF]
 *   Icon:      rounded bg-[#EEF2FF]
 *   Dark bg:   bg-[#191919]
 */

function BlockThumbnailInner({ type }: { type: BlockType }) {
  switch (type) {
    // ═══════════════════════════════════════
    // HERO
    // ═══════════════════════════════════════
    case "hero":
      return (
        <div className="space-y-1.5">
          <div className="h-2 w-16 bg-[#191919]/70 rounded-sm mx-auto" />
          <div className="h-1.5 w-20 bg-[#191919]/20 rounded-sm mx-auto" />
          <div className="h-3 w-12 bg-[#4F46E5] rounded-sm mx-auto mt-1.5" />
        </div>
      );
    case "hero-split-glow":
      return (
        <div className="flex gap-1.5 items-center">
          <div className="flex-1 space-y-1">
            <div className="h-0.5 w-6 bg-[#4F46E5]/40 rounded-sm" />
            <div className="h-2 w-14 bg-[#191919]/70 rounded-sm" />
            <div className="h-1 w-16 bg-[#191919]/15 rounded-sm" />
            <div className="flex gap-1 mt-1">
              <div className="h-2.5 w-8 bg-[#4F46E5] rounded-sm" />
              <div className="h-2.5 w-8 border border-[#E6E6E4] rounded-sm" />
            </div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5]/20 to-[#EEF2FF] rounded-lg" />
        </div>
      );
    case "hero-centered-mesh":
      return (
        <div className="text-center space-y-1">
          <div className="h-0.5 w-6 bg-[#4F46E5]/40 rounded-full mx-auto" />
          <div className="h-2 w-16 bg-[#191919]/70 rounded-sm mx-auto" />
          <div className="h-1 w-20 bg-[#191919]/15 rounded-sm mx-auto" />
          <div className="h-3 w-12 bg-[#4F46E5] rounded-sm mx-auto mt-1" />
          <div className="flex gap-1 justify-center mt-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-4 h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            ))}
          </div>
        </div>
      );
    case "hero-split-portfolio":
      return (
        <div className="flex gap-1.5 items-center">
          <div className="flex-1 space-y-1">
            <div className="h-2 w-12 bg-[#191919]/70 rounded-sm" />
            <div className="h-1 w-16 bg-[#191919]/15 rounded-sm" />
            <div className="h-2.5 w-8 bg-[#4F46E5] rounded-sm mt-1" />
            <div className="flex gap-2 mt-1">
              {["120+", "8a", "98%"].map((v) => (
                <div key={v} className="text-center">
                  <div className="text-[5px] font-bold text-[#4F46E5]">{v}</div>
                  <div className="h-0.5 w-4 bg-[#191919]/10 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
          <div className="w-10 h-12 bg-[#EEF2FF] rounded-lg" />
        </div>
      );
    case "hero-minimal-service":
      return (
        <div className="text-center space-y-1">
          <div className="h-0.5 w-10 bg-[#4F46E5]/20 rounded-full mx-auto" />
          <div className="h-2 w-16 bg-[#191919]/70 rounded-sm mx-auto" />
          <div className="h-1 w-20 bg-[#191919]/15 rounded-sm mx-auto" />
          <div className="flex gap-1 justify-center mt-1">
            <div className="h-2.5 w-10 bg-[#4F46E5] rounded-sm" />
            <div className="h-2.5 w-10 border border-[#E6E6E4] rounded-sm" />
          </div>
          <div className="flex gap-2 justify-center mt-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-1 h-1 rounded-full bg-[#4F46E5]/40" />
                <div className="h-0.5 w-5 bg-[#191919]/10 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      );
    case "hero-dark-saas":
      return (
        <div className="bg-[#191919] rounded-sm p-1.5 text-center space-y-1">
          <div className="h-2 w-14 bg-white/70 rounded-sm mx-auto" />
          <div className="h-1 w-18 bg-white/20 rounded-sm mx-auto" />
          <div className="flex gap-1 justify-center mt-1">
            <div className="h-2.5 w-8 bg-[#4F46E5] rounded-sm" />
            <div className="h-2.5 w-8 border border-white/20 rounded-sm" />
          </div>
        </div>
      );
    case "hero-creator-brand":
      return (
        <div className="flex gap-1.5 items-center">
          <div className="flex-1 space-y-1">
            <div className="h-2 w-10 bg-[#191919]/70 rounded-sm" />
            <div className="h-1 w-16 bg-[#191919]/15 rounded-sm" />
            <div className="flex gap-0.5 mt-0.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-0.5 w-6 bg-[#4F46E5]/20 rounded-sm" />
              ))}
            </div>
            <div className="h-2.5 w-8 bg-[#4F46E5] rounded-sm mt-0.5" />
          </div>
          <div className="w-9 h-9 rounded-full bg-[#EEF2FF]" />
        </div>
      );
    case "hero-video-showreel":
      return (
        <div className="bg-[#191919] rounded-sm p-1.5 text-center space-y-1">
          <div className="h-2 w-12 bg-white/70 rounded-sm mx-auto" />
          <div className="h-1 w-16 bg-white/20 rounded-sm mx-auto" />
          <div className="flex gap-1 justify-center mt-0.5">
            {["M", "MD", "CG"].map((t) => (
              <div key={t} className="text-[4px] text-white/40 px-1 py-0.5 border border-white/10 rounded-sm">{t}</div>
            ))}
          </div>
        </div>
      );

    // ═══════════════════════════════════════
    // PORTFOLIO / PROJETS
    // ═══════════════════════════════════════
    case "portfolio-grid":
      return (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square bg-[#EEF2FF] rounded-sm" />
          ))}
        </div>
      );
    case "portfolio-masonry":
      return (
        <div className="grid grid-cols-3 gap-0.5">
          <div className="col-span-2 row-span-2 bg-[#EEF2FF] rounded-sm aspect-square" />
          <div className="bg-[#E6E6E4]/50 rounded-sm aspect-square" />
          <div className="bg-[#EEF2FF]/70 rounded-sm aspect-square" />
          <div className="bg-[#E6E6E4]/50 rounded-sm aspect-square" />
          <div className="bg-[#EEF2FF] rounded-sm aspect-square" />
          <div className="bg-[#E6E6E4]/40 rounded-sm aspect-square" />
        </div>
      );
    case "projects-grid-cases":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm" />
          <div className="grid grid-cols-2 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border border-[#E6E6E4] rounded-sm p-1">
                <div className="h-3 bg-[#EEF2FF] rounded-sm mb-0.5" />
                <div className="h-1 w-full bg-[#191919]/30 rounded-sm" />
                <div className="h-0.5 w-8 bg-[#4F46E5]/40 rounded-sm mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      );
    case "projects-horizontal":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm" />
          <div className="flex gap-1 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-shrink-0 w-14 border border-[#E6E6E4] rounded-sm p-0.5">
                <div className="h-5 bg-[#EEF2FF] rounded-sm mb-0.5" />
                <div className="h-1 w-10 bg-[#191919]/30 rounded-sm" />
                <div className="h-0.5 w-6 bg-[#191919]/15 rounded-sm mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      );
    case "project-before-after":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="flex items-center h-7">
            <div className="flex-1 h-full bg-[#E6E6E4]/40 rounded-l-sm flex items-end p-0.5">
              <div className="text-[4px] text-[#999]">Avant</div>
            </div>
            <div className="w-0.5 h-full bg-[#4F46E5] relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#4F46E5] border-2 border-white" />
            </div>
            <div className="flex-1 h-full bg-[#EEF2FF] rounded-r-sm flex items-end justify-end p-0.5">
              <div className="text-[4px] text-[#4F46E5]">Après</div>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <div className="h-0.5 w-6 bg-[#4F46E5]/30 rounded-sm" />
            <div className="h-0.5 w-6 bg-[#4F46E5]/30 rounded-sm" />
          </div>
        </div>
      );
    case "project-timeline":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-14 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="flex items-start gap-1">
            <div className="flex flex-col items-center gap-0.5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n}>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[4px] font-bold">{n}</div>
                  {n < 4 && <div className="w-0.5 h-1.5 bg-[#4F46E5]/20 mx-auto" />}
                </div>
              ))}
            </div>
            <div className="flex-1 space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-1 w-8 bg-[#191919]/40 rounded-sm" />
                  <div className="h-0.5 w-12 bg-[#191919]/10 rounded-sm mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "project-masonry-wall":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-8 bg-[#191919]/50 rounded-sm" />
          <div className="grid grid-cols-3 gap-0.5">
            <div className="bg-[#EEF2FF] rounded-sm h-5" />
            <div className="bg-[#E6E6E4]/50 rounded-sm h-7" />
            <div className="bg-[#EEF2FF]/70 rounded-sm h-4" />
            <div className="bg-[#E6E6E4]/40 rounded-sm h-6" />
            <div className="bg-[#EEF2FF] rounded-sm h-4" />
            <div className="bg-[#E6E6E4]/50 rounded-sm h-6" />
          </div>
        </div>
      );

    // ═══════════════════════════════════════
    // SERVICES / OFFRES
    // ═══════════════════════════════════════
    case "services-list":
      return (
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm" />
                <div className="h-1 w-14 bg-[#191919]/15 rounded-sm" />
              </div>
              <div className="h-1.5 w-6 bg-[#4F46E5]/40 rounded-sm" />
            </div>
          ))}
        </div>
      );
    case "service-cards":
      return (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-1 border border-[#E6E6E4] rounded-sm">
              <div className="w-2 h-2 rounded bg-[#EEF2FF] mb-0.5" />
              <div className="h-1 w-full bg-[#191919]/30 rounded-sm" />
              <div className="h-0.5 w-full bg-[#191919]/10 rounded-sm mt-0.5" />
              <div className="h-1.5 w-full bg-[#4F46E5] rounded-sm mt-1" />
            </div>
          ))}
        </div>
      );
    case "services-premium":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-[#191919] rounded-sm p-1">
                <div className="w-2 h-2 rounded bg-[#4F46E5]/30 mb-0.5" />
                <div className="h-1 w-full bg-white/40 rounded-sm" />
                <div className="h-0.5 w-full bg-white/15 rounded-sm mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      );
    case "services-3card-premium":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-1 border border-[#E6E6E4] rounded-sm">
                <div className="h-1 w-full bg-[#191919]/40 rounded-sm mb-0.5" />
                <div className="h-0.5 w-full bg-[#191919]/10 rounded-sm" />
                {[0, 1].map((j) => (
                  <div key={j} className="flex items-center gap-0.5 mt-0.5">
                    <div className="w-0.5 h-0.5 rounded-full bg-[#4F46E5]/40" />
                    <div className="h-0.5 flex-1 bg-[#191919]/10 rounded-sm" />
                  </div>
                ))}
                <div className="h-1.5 w-full bg-[#4F46E5] rounded-sm mt-1" />
              </div>
            ))}
          </div>
        </div>
      );
    case "services-icon-grid":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="text-center p-0.5">
                <div className="w-2.5 h-2.5 rounded bg-[#EEF2FF] mx-auto mb-0.5" />
                <div className="h-0.5 w-full bg-[#191919]/20 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      );
    case "services-split-value":
      return (
        <div className="flex gap-1.5">
          <div className="flex-1 space-y-1">
            <div className="h-2 w-12 bg-[#191919]/70 rounded-sm" />
            <div className="h-1 w-16 bg-[#191919]/15 rounded-sm" />
            <div className="h-1 w-14 bg-[#191919]/10 rounded-sm" />
          </div>
          <div className="flex-1 space-y-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]/40 mt-0.5 flex-shrink-0" />
                <div className="h-1 flex-1 bg-[#191919]/15 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      );
    case "services-process-offers":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-1 p-0.5 border border-[#E6E6E4] rounded-sm">
              <div className="flex-1">
                <div className="h-1 w-8 bg-[#191919]/40 rounded-sm" />
                <div className="h-0.5 w-12 bg-[#191919]/10 rounded-sm mt-0.5" />
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]/20 text-[3px] text-[#4F46E5] flex items-center justify-center">{n}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    // ═══════════════════════════════════════
    // PRODUITS / VENTE
    // ═══════════════════════════════════════
    case "pack-premium":
      return (
        <div className="text-center space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="h-3 w-6 bg-[#4F46E5] rounded-sm mx-auto" />
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-1 justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]/40" />
              <div className="h-1 w-12 bg-[#191919]/15 rounded-sm" />
            </div>
          ))}
          <div className="h-2.5 w-10 bg-[#4F46E5] rounded-sm mx-auto mt-0.5" />
        </div>
      );
    case "product-hero-checkout":
      return (
        <div className="space-y-1.5">
          <div className="h-2 w-14 bg-[#191919]/70 rounded-sm mx-auto" />
          <div className="h-1 w-18 bg-[#191919]/15 rounded-sm mx-auto" />
          <div className="h-2.5 w-8 bg-[#4F46E5] rounded-sm mx-auto" />
          <div className="flex gap-1 justify-center mt-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-1 h-1 rounded-full bg-[#4F46E5]" />
                <div className="h-0.5 w-5 bg-[#191919]/15 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      );
    case "product-cards-grid":
      return (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-[#E6E6E4] rounded-sm p-1">
              <div className="h-3 bg-[#EEF2FF] rounded-sm mb-0.5" />
              <div className="h-1 w-full bg-[#191919]/30 rounded-sm" />
              <div className="h-1.5 w-full bg-[#4F46E5] rounded-sm mt-1" />
            </div>
          ))}
        </div>
      );
    case "product-featured-card":
      return (
        <div className="flex gap-1.5 items-center border border-[#E6E6E4] rounded-sm p-1.5">
          <div className="w-10 h-10 bg-[#EEF2FF] rounded-sm flex-shrink-0" />
          <div className="flex-1 space-y-0.5">
            <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm" />
            <div className="h-1 w-16 bg-[#191919]/15 rounded-sm" />
            <div className="h-2 w-6 bg-[#4F46E5] rounded-sm" />
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-1 h-1 rounded-full bg-[#4F46E5]/40" />
                <div className="h-0.5 w-8 bg-[#191919]/10 rounded-sm" />
              </div>
            ))}
            <div className="h-2 w-10 bg-[#4F46E5] rounded-sm mt-0.5" />
          </div>
        </div>
      );
    case "products-3card-shop":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-8 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border border-[#E6E6E4] rounded-sm p-1">
                <div className="h-4 bg-[#EEF2FF] rounded-sm mb-0.5" />
                <div className="h-1 w-full bg-[#191919]/30 rounded-sm" />
                <div className="h-1 w-4 bg-[#4F46E5]/60 rounded-sm mt-0.5" />
                <div className="h-1.5 w-full bg-[#4F46E5] rounded-sm mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      );
    case "product-bundle-compare":
      return (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex-1 p-1 border rounded-sm ${i === 1 ? "border-[#4F46E5]" : "border-[#E6E6E4]"}`}>
              <div className="h-1 w-full bg-[#191919]/20 rounded-sm mb-0.5" />
              <div className="h-2 w-4 bg-[#4F46E5]/60 rounded-sm mx-auto mb-0.5" />
              {[0, 1].map((j) => (
                <div key={j} className="flex items-center gap-0.5 mb-0.5">
                  <div className="w-1 h-1 rounded-full bg-[#4F46E5]/40" />
                  <div className="h-0.5 flex-1 bg-[#191919]/10 rounded-sm" />
                </div>
              ))}
              <div className="h-1.5 w-full bg-[#4F46E5] rounded-sm mt-0.5" />
            </div>
          ))}
        </div>
      );
    case "product-benefits-mockup":
      return (
        <div className="flex gap-1.5 items-center">
          <div className="w-12 h-10 bg-[#EEF2FF] rounded-sm" />
          <div className="flex-1 space-y-0.5">
            <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm" />
            <div className="h-1 w-14 bg-[#191919]/15 rounded-sm" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-1 h-1 rounded-full bg-[#4F46E5]" />
                <div className="h-0.5 w-8 bg-[#191919]/10 rounded-sm" />
              </div>
            ))}
            <div className="h-2 w-8 bg-[#4F46E5] rounded-sm mt-0.5" />
          </div>
        </div>
      );
    case "inline-checkout":
      return (
        <div className="border border-[#E6E6E4] rounded-sm p-1.5 space-y-1">
          <div className="flex items-center justify-between">
            <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm" />
            <div className="h-1.5 w-5 bg-[#4F46E5] rounded-sm" />
          </div>
          <div className="flex gap-1">
            <div className="flex-1 h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            <div className="flex-1 h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
          </div>
          <div className="h-2.5 w-full bg-[#4F46E5] rounded-sm" />
        </div>
      );
    case "bundle-builder":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1 p-0.5 border border-[#E6E6E4] rounded-sm">
              <div className={`w-2 h-2 rounded-sm border ${i < 2 ? "bg-[#4F46E5] border-[#4F46E5]" : "border-[#E6E6E4]"}`} />
              <div className="h-1 flex-1 bg-[#191919]/20 rounded-sm" />
              <div className="h-1 w-4 bg-[#191919]/30 rounded-sm" />
            </div>
          ))}
          <div className="h-2.5 w-10 bg-[#4F46E5] rounded-sm mx-auto" />
        </div>
      );

    // ═══════════════════════════════════════
    // PRICING / TARIFS
    // ═══════════════════════════════════════
    case "pricing-table":
      return (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex-1 p-1 border rounded-sm ${i === 1 ? "border-[#4F46E5]" : "border-[#E6E6E4]"}`}>
              <div className="h-1 w-full bg-[#191919]/20 rounded-sm mb-1" />
              <div className="h-2 w-4 bg-[#4F46E5]/60 rounded-sm mx-auto mb-1" />
              <div className="h-1.5 w-full bg-[#4F46E5] rounded-sm" />
            </div>
          ))}
        </div>
      );
    case "pricing-table-real":
      return (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex-1 p-1 border rounded-sm ${i === 1 ? "border-[#4F46E5] border-2" : "border-[#E6E6E4]"}`}>
              <div className="h-1 w-full bg-[#191919]/20 rounded-sm mb-0.5" />
              <div className="h-2 w-4 bg-[#4F46E5]/60 rounded-sm mx-auto mb-0.5" />
              {[0, 1].map((j) => (
                <div key={j} className="flex items-center gap-0.5 mb-0.5">
                  <div className="w-1 h-1 rounded-full bg-[#4F46E5]/40" />
                  <div className="h-0.5 flex-1 bg-[#191919]/10 rounded-sm" />
                </div>
              ))}
              <div className="h-1.5 w-full bg-[#4F46E5] rounded-sm mt-0.5" />
            </div>
          ))}
        </div>
      );
    case "pricing-modern":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`flex-1 p-1 rounded-sm ${i === 1 ? "bg-[#191919]" : "border border-[#E6E6E4]"}`}>
                <div className={`h-1 w-full rounded-sm mb-0.5 ${i === 1 ? "bg-white/30" : "bg-[#191919]/20"}`} />
                <div className={`h-2 w-4 rounded-sm mx-auto mb-0.5 ${i === 1 ? "bg-[#4F46E5]" : "bg-[#4F46E5]/40"}`} />
                <div className={`h-1.5 w-full rounded-sm ${i === 1 ? "bg-white" : "bg-[#4F46E5]"}`} />
              </div>
            ))}
          </div>
        </div>
      );
    case "pricing-3tier-saas":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`flex-1 p-1 border rounded-sm ${i === 1 ? "border-[#4F46E5] shadow-sm" : "border-[#E6E6E4]"}`}>
                {i === 1 && <div className="h-0.5 w-5 bg-[#4F46E5] rounded-full mx-auto mb-0.5" />}
                <div className="h-1 w-full bg-[#191919]/20 rounded-sm mb-0.5" />
                <div className="h-2 w-5 bg-[#4F46E5]/50 rounded-sm mx-auto mb-0.5" />
                <div className="h-0.5 w-3 bg-[#191919]/10 rounded-sm mx-auto mb-0.5" />
                <div className="h-1.5 w-full bg-[#4F46E5] rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      );
    case "pricing-custom-quote":
      return (
        <div className="text-center space-y-1 p-1 border border-dashed border-[#4F46E5]/30 rounded-sm bg-[#EEF2FF]/20">
          <div className="h-2 w-12 bg-[#191919]/70 rounded-sm mx-auto" />
          <div className="h-1 w-16 bg-[#191919]/15 rounded-sm mx-auto" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-0.5 justify-center">
              <div className="w-1 h-1 rounded-full bg-[#4F46E5]/40" />
              <div className="h-0.5 w-8 bg-[#191919]/10 rounded-sm" />
            </div>
          ))}
          <div className="h-3 w-12 bg-[#4F46E5] rounded-sm mx-auto mt-0.5" />
        </div>
      );
    case "pricing-mini-faq":
      return (
        <div className="flex gap-1.5">
          <div className="flex-1 flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`flex-1 p-0.5 border rounded-sm ${i === 1 ? "border-[#4F46E5]" : "border-[#E6E6E4]"}`}>
                <div className="h-1.5 w-3 bg-[#4F46E5]/50 rounded-sm mx-auto mb-0.5" />
                <div className="h-1 w-full bg-[#4F46E5] rounded-sm" />
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-0.5 border border-[#E6E6E4] rounded-sm">
                <div className="h-0.5 w-6 bg-[#191919]/20 rounded-sm" />
                <div className="w-1 h-1 border-b border-r border-[#999] rotate-45 -mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      );
    case "comparison-table":
      return (
        <div className="space-y-0.5">
          <div className="flex gap-0.5">
            <div className="flex-1 h-2 bg-[#F7F7F5] rounded-sm" />
            <div className="w-6 h-2 bg-[#4F46E5]/20 rounded-sm" />
            <div className="w-6 h-2 bg-[#4F46E5] rounded-sm" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-0.5">
              <div className="flex-1 h-1.5 bg-[#191919]/10 rounded-sm" />
              <div className="w-6 h-1.5 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-[#4F46E5]/30" /></div>
              <div className="w-6 h-1.5 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-[#4F46E5]" /></div>
            </div>
          ))}
        </div>
      );

    // ═══════════════════════════════════════
    // TÉMOIGNAGES / SOCIAL
    // ═══════════════════════════════════════
    case "testimonials":
      return (
        <div className="grid grid-cols-2 gap-1">
          {[0, 1].map((i) => (
            <div key={i} className="p-1 border border-[#E6E6E4] rounded-sm">
              <div className="h-1 w-full bg-[#191919]/10 rounded-sm mb-1" />
              <div className="flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-full bg-[#EEF2FF]" />
                <div className="h-1 w-4 bg-[#191919]/20 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      );
    case "testimonials-carousel":
      return (
        <div className="space-y-1">
          <div className="flex gap-1 items-center">
            <div className="w-1.5 h-4 bg-[#E6E6E4] rounded-sm" />
            <div className="flex-1 p-1.5 border border-[#E6E6E4] rounded-sm">
              <div className="h-1 w-full bg-[#191919]/10 rounded-sm mb-1" />
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#EEF2FF]" />
                <div className="h-1 w-6 bg-[#191919]/20 rounded-sm" />
              </div>
            </div>
            <div className="w-1.5 h-4 bg-[#E6E6E4] rounded-sm" />
          </div>
          <div className="flex gap-0.5 justify-center">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`} />
            ))}
          </div>
        </div>
      );
    case "testimonials-dark":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-[#191919] rounded-sm p-1">
                <div className="flex gap-0.5 mb-0.5">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <div key={s} className="w-1 h-1 text-[4px] text-yellow-400">★</div>
                  ))}
                </div>
                <div className="h-1 w-full bg-white/20 rounded-sm mb-0.5" />
                <div className="flex items-center gap-0.5">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <div className="h-0.5 w-4 bg-white/30 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "testimonials-3dark":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border border-[#E6E6E4] rounded-sm p-1">
                <div className="flex gap-0.5 mb-0.5">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <div key={s} className="text-[4px] text-yellow-400">★</div>
                  ))}
                </div>
                <div className="h-1 w-full bg-[#191919]/15 rounded-sm mb-0.5" />
                <div className="flex items-center gap-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#EEF2FF]" />
                  <div className="h-0.5 w-5 bg-[#191919]/20 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "testimonials-video":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border border-[#E6E6E4] rounded-sm overflow-hidden">
                <div className="h-5 bg-[#191919] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[2px] border-b-[2px] border-l-[3px] border-transparent border-l-white ml-0.5" />
                  </div>
                </div>
                <div className="p-0.5">
                  <div className="h-0.5 w-full bg-[#191919]/15 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "logo-cloud":
      return (
        <div className="space-y-1">
          <div className="h-1 w-10 bg-[#191919]/30 rounded-sm mx-auto" />
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-5 h-3 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            ))}
          </div>
        </div>
      );
    case "results-logos-quotes":
      return (
        <div className="space-y-1">
          <div className="flex gap-1 justify-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-4 h-2.5 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            ))}
          </div>
          <div className="p-1 border-l-2 border-[#4F46E5] bg-[#EEF2FF]/30">
            <div className="h-1 w-full bg-[#191919]/15 rounded-sm italic" />
            <div className="h-0.5 w-8 bg-[#191919]/30 rounded-sm mt-0.5" />
          </div>
        </div>
      );
    case "numbers-impact":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-4 gap-1 text-center">
            {["12M+", "350+", "<24h", "98%"].map((v) => (
              <div key={v} className="p-0.5">
                <div className="text-[6px] font-bold text-[#4F46E5]">{v}</div>
                <div className="h-0.5 w-full bg-[#191919]/10 rounded-sm mt-0.5" />
                <div className="h-0.5 w-4 bg-[#191919]/5 rounded-sm mt-0.5 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      );
    case "results-timeline":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="flex items-center gap-0.5">
            {["J1", "30j", "60j", "90j"].map((l, i) => (
              <div key={l} className="flex-1 text-center">
                <div className={`w-2 h-2 rounded-full mx-auto mb-0.5 ${i === 3 ? "bg-[#4F46E5]" : "bg-[#4F46E5]/30"}`} />
                <div className="text-[4px] text-[#999]">{l}</div>
                {i < 3 && <div className="h-0.5 w-full bg-[#4F46E5]/10 rounded-sm -mt-2 -mb-1" />}
              </div>
            ))}
          </div>
        </div>
      );
    case "stats-counter":
      return (
        <div className="grid grid-cols-4 gap-1 text-center">
          {["50+", "98%", "8", "24h"].map((v) => (
            <div key={v}>
              <div className="text-[6px] font-bold text-[#4F46E5]">{v}</div>
              <div className="h-0.5 w-full bg-[#191919]/10 rounded-sm" />
            </div>
          ))}
        </div>
      );
    case "stats-animated":
      return (
        <div className="grid grid-cols-3 gap-1 text-center">
          {["150+", "99%", "5K"].map((v) => (
            <div key={v} className="p-1 border border-[#E6E6E4] rounded-sm">
              <div className="text-[7px] font-bold text-[#4F46E5]">{v}</div>
              <div className="h-0.5 w-full bg-[#191919]/10 rounded-sm mt-0.5" />
            </div>
          ))}
        </div>
      );
    case "social-proof-marquee":
      return (
        <div className="space-y-0.5 overflow-hidden">
          {[0, 1].map((row) => (
            <div key={row} className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 px-1 py-0.5 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm flex items-center gap-0.5">
                  <div className="h-0.5 w-6 bg-[#191919]/15 rounded-sm" />
                  <div className="text-[4px] text-[#999]">—</div>
                  <div className="h-0.5 w-3 bg-[#191919]/30 rounded-sm" />
                </div>
              ))}
            </div>
          ))}
        </div>
      );

    // ═══════════════════════════════════════
    // CONTENU / FEATURES
    // ═══════════════════════════════════════
    case "feature-grid":
      return (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-1 border border-[#E6E6E4] rounded-sm text-center">
              <div className="w-2 h-2 rounded bg-[#EEF2FF] mx-auto mb-0.5" />
              <div className="h-0.5 w-full bg-[#191919]/15 rounded-sm" />
            </div>
          ))}
        </div>
      );
    case "why-me":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-14 bg-[#191919]/50 rounded-sm" />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-1 border border-[#E6E6E4] rounded-sm">
                <div className="w-2 h-2 rounded bg-[#EEF2FF] mb-0.5" />
                <div className="h-0.5 w-full bg-[#191919]/15 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      );
    case "tech-stack":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-3 gap-1">
            {["FE", "BE", "Outils"].map((cat) => (
              <div key={cat} className="space-y-0.5">
                <div className="text-[4px] text-[#999] text-center">{cat}</div>
                <div className="grid grid-cols-2 gap-0.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "content-feature-article":
      return (
        <div className="flex gap-1.5 items-center border border-[#E6E6E4] rounded-sm p-1">
          <div className="w-12 h-8 bg-[#EEF2FF] rounded-sm flex-shrink-0" />
          <div className="flex-1 space-y-0.5">
            <div className="h-0.5 w-4 bg-[#4F46E5]/30 rounded-sm" />
            <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm" />
            <div className="h-1 w-full bg-[#191919]/10 rounded-sm" />
            <div className="h-2 w-6 bg-[#4F46E5] rounded-sm mt-0.5" />
          </div>
        </div>
      );
    case "content-3articles":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border border-[#E6E6E4] rounded-sm overflow-hidden">
                <div className="h-4 bg-[#EEF2FF]" />
                <div className="p-0.5">
                  <div className="h-0.5 w-3 bg-[#4F46E5]/30 rounded-sm mb-0.5" />
                  <div className="h-1 w-full bg-[#191919]/30 rounded-sm" />
                  <div className="h-0.5 w-full bg-[#191919]/10 rounded-sm mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "content-comparison-why":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="flex gap-1">
            <div className="flex-1 p-1 bg-[#F7F7F5] rounded-sm space-y-0.5">
              <div className="h-1 w-8 bg-[#191919]/20 rounded-sm" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-0.5">
                  <div className="w-1 h-1 text-[5px] text-red-300">✕</div>
                  <div className="h-0.5 flex-1 bg-[#191919]/10 rounded-sm" />
                </div>
              ))}
            </div>
            <div className="flex-1 p-1 bg-[#EEF2FF]/50 border border-[#4F46E5]/20 rounded-sm space-y-0.5">
              <div className="h-1 w-8 bg-[#4F46E5]/40 rounded-sm" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-0.5">
                  <div className="w-1 h-1 text-[5px] text-[#4F46E5]">✓</div>
                  <div className="h-0.5 flex-1 bg-[#4F46E5]/10 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "blog-preview":
      return (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-[#E6E6E4] rounded-sm overflow-hidden">
              <div className="h-4 bg-[#EEF2FF]" />
              <div className="p-0.5">
                <div className="h-1 w-full bg-[#191919]/30 rounded-sm" />
                <div className="h-0.5 w-full bg-[#191919]/10 rounded-sm mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      );

    // ═══════════════════════════════════════
    // CTA / CONVERSION
    // ═══════════════════════════════════════
    case "centered-cta":
      return (
        <div className="text-center space-y-1 py-1">
          <div className="h-2 w-16 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="h-1 w-20 bg-[#191919]/15 rounded-sm mx-auto" />
          <div className="h-3 w-12 bg-[#4F46E5] rounded-sm mx-auto mt-1" />
        </div>
      );
    case "cta-premium":
      return (
        <div className="flex gap-1.5 items-center">
          <div className="flex-1 space-y-1">
            <div className="h-2 w-14 bg-[#191919]/50 rounded-sm" />
            <div className="h-1 w-full bg-[#191919]/15 rounded-sm" />
            <div className="h-2.5 w-10 bg-[#4F46E5] rounded-sm mt-1" />
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-[#EEF2FF] to-[#E6E6E4] rounded-sm" />
        </div>
      );
    case "cta-banner":
      return (
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-sm p-1.5 text-center space-y-0.5">
          <div className="h-1.5 w-14 bg-white/80 rounded-sm mx-auto" />
          <div className="h-1 w-18 bg-white/30 rounded-sm mx-auto" />
          <div className="flex gap-1 justify-center mt-1">
            <div className="h-2.5 w-8 bg-white rounded-sm" />
            <div className="h-2.5 w-8 border border-white/50 rounded-sm" />
          </div>
        </div>
      );
    case "cta-centered-strong":
      return (
        <div className="text-center space-y-1 py-1.5">
          <div className="h-2 w-16 bg-[#191919]/70 rounded-sm mx-auto" />
          <div className="h-1 w-20 bg-[#191919]/20 rounded-sm mx-auto" />
          <div className="flex gap-1 justify-center mt-1">
            <div className="h-3 w-12 bg-[#4F46E5] rounded-sm" />
            <div className="h-3 w-10 border border-[#E6E6E4] rounded-sm" />
          </div>
        </div>
      );
    case "cta-split-text":
      return (
        <div className="flex gap-2 items-center py-1">
          <div className="flex-1 space-y-0.5">
            <div className="h-2 w-14 bg-[#191919]/70 rounded-sm" />
            <div className="h-1 w-18 bg-[#191919]/15 rounded-sm" />
          </div>
          <div className="flex gap-1">
            <div className="h-3 w-8 bg-[#4F46E5] rounded-sm" />
            <div className="h-3 w-8 border border-[#E6E6E4] rounded-sm" />
          </div>
        </div>
      );
    case "cta-dark-glow":
      return (
        <div className="bg-[#191919] rounded-sm p-1.5 text-center space-y-1">
          <div className="h-2 w-14 bg-white/70 rounded-sm mx-auto" />
          <div className="h-1 w-18 bg-white/20 rounded-sm mx-auto" />
          <div className="h-3 w-10 bg-[#4F46E5] rounded-sm mx-auto mt-0.5" />
          <div className="flex gap-1 justify-center mt-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-0.5 w-5 bg-white/10 rounded-sm" />
            ))}
          </div>
        </div>
      );

    // ═══════════════════════════════════════
    // CONTACT / FORMULAIRES
    // ═══════════════════════════════════════
    case "custom-form":
      return (
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="h-0.5 w-5 bg-[#999]/40 rounded-sm mb-0.5" />
              <div className="h-2.5 w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            </div>
          ))}
          <div className="h-2.5 w-8 bg-[#4F46E5] rounded-sm" />
        </div>
      );
    case "contact-form":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm" />
          <div className="grid grid-cols-2 gap-0.5">
            <div className="h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            <div className="h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
          </div>
          <div className="h-4 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
          <div className="h-2 w-8 bg-[#4F46E5] rounded-sm" />
        </div>
      );
    case "contact-premium":
      return (
        <div className="bg-[#191919] rounded-sm p-1.5 space-y-1">
          <div className="h-1.5 w-10 bg-white/60 rounded-sm" />
          <div className="grid grid-cols-2 gap-0.5">
            <div className="h-2 bg-white/10 border border-white/10 rounded-sm" />
            <div className="h-2 bg-white/10 border border-white/10 rounded-sm" />
          </div>
          <div className="h-3 bg-white/10 border border-white/10 rounded-sm" />
          <div className="h-2 w-8 bg-[#4F46E5] rounded-sm" />
        </div>
      );
    case "form-contact-simple":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm" />
          {["Nom", "Email", "Msg"].map((f) => (
            <div key={f} className={`bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm ${f === "Msg" ? "h-3" : "h-2"}`} />
          ))}
          <div className="h-2.5 w-10 bg-[#4F46E5] rounded-sm" />
        </div>
      );
    case "form-quote-request":
      return (
        <div className="flex gap-1.5">
          <div className="flex-1 space-y-0.5">
            <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            ))}
            <div className="h-3 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            <div className="h-2.5 w-full bg-[#4F46E5] rounded-sm" />
          </div>
          <div className="w-12 flex items-center">
            <div className="w-full p-1 bg-[#EEF2FF]/30 border border-[#4F46E5]/10 rounded-sm">
              <div className="h-0.5 w-full bg-[#191919]/10 rounded-sm" />
              <div className="h-0.5 w-8 bg-[#191919]/10 rounded-sm mt-0.5" />
            </div>
          </div>
        </div>
      );
    case "form-newsletter-lead":
      return (
        <div className="text-center space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="h-1 w-18 bg-[#191919]/15 rounded-sm mx-auto" />
          <div className="flex gap-1 items-center max-w-[80%] mx-auto">
            <div className="flex-1 h-2.5 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            <div className="h-2.5 w-8 bg-[#4F46E5] rounded-sm" />
          </div>
        </div>
      );

    // ═══════════════════════════════════════
    // MÉDIAS
    // ═══════════════════════════════════════
    case "video":
      return (
        <div className="h-10 bg-[#191919] rounded-sm flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-white ml-0.5" />
          </div>
        </div>
      );
    case "full-image":
      return (
        <div className="h-10 bg-gradient-to-br from-[#EEF2FF] to-[#E6E6E4] rounded-sm flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
        </div>
      );
    case "video-text-split":
      return (
        <div className="flex gap-1.5 items-center">
          <div className="w-12 h-8 bg-[#191919] rounded-sm flex items-center justify-center">
            <div className="w-0 h-0 border-t-[2px] border-b-[2px] border-l-[4px] border-transparent border-l-white" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm" />
            <div className="h-1 w-full bg-[#191919]/15 rounded-sm" />
            <div className="h-2 w-6 bg-[#4F46E5] rounded-sm mt-0.5" />
          </div>
        </div>
      );
    case "video-showcase":
      return (
        <div className="space-y-1">
          <div className="h-8 bg-[#191919] rounded-sm flex items-center justify-center relative">
            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[2px] border-b-[2px] border-l-[4px] border-transparent border-l-white ml-0.5" />
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            {["200+", "50+", "98%"].map((v) => (
              <div key={v} className="text-center">
                <div className="text-[5px] font-bold text-[#4F46E5]">{v}</div>
                <div className="h-0.5 w-4 bg-[#191919]/10 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      );
    case "before-after":
      return (
        <div className="flex items-center h-8">
          <div className="flex-1 h-full bg-[#E6E6E4]/50 rounded-l-sm" />
          <div className="w-0.5 h-full bg-[#4F46E5] relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#4F46E5] border-2 border-white" />
          </div>
          <div className="flex-1 h-full bg-[#EEF2FF] rounded-r-sm" />
        </div>
      );
    case "before-after-pro":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-2 gap-1">
            {[0, 1].map((i) => (
              <div key={i} className="flex h-5">
                <div className="flex-1 bg-[#E6E6E4]/40 rounded-l-sm" />
                <div className="w-0.5 bg-[#4F46E5]" />
                <div className="flex-1 bg-[#EEF2FF] rounded-r-sm" />
              </div>
            ))}
          </div>
        </div>
      );
    case "masonry-gallery":
      return (
        <div className="grid grid-cols-3 gap-0.5">
          <div className="col-span-2 row-span-2 bg-[#EEF2FF] rounded-sm aspect-square" />
          <div className="bg-[#E6E6E4]/60 rounded-sm aspect-square" />
          <div className="bg-[#E6E6E4]/40 rounded-sm aspect-square" />
          <div className="bg-[#E6E6E4]/60 rounded-sm aspect-square" />
          <div className="bg-[#EEF2FF] rounded-sm aspect-square" />
          <div className="bg-[#E6E6E4]/40 rounded-sm aspect-square" />
        </div>
      );
    case "media-featured-video":
      return (
        <div className="space-y-1">
          <div className="h-7 bg-[#191919] rounded-sm flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[2px] border-b-[2px] border-l-[4px] border-transparent border-l-white ml-0.5" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-3 bg-[#191919]/60 rounded-sm" />
            ))}
          </div>
        </div>
      );
    case "gallery-3up-strip":
      return (
        <div className="space-y-1">
          <div className="h-1 w-6 bg-[#191919]/30 rounded-sm mx-auto" />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-0.5">
                <div className="h-6 bg-[#EEF2FF] rounded-sm" />
                <div className="h-0.5 w-full bg-[#191919]/15 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      );
    case "gallery-stacked-storyboard":
      return (
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <div className="w-12 h-5 bg-[#EEF2FF] rounded-sm flex-shrink-0" />
              <div className="flex-1">
                <div className="h-1 w-8 bg-[#191919]/40 rounded-sm" />
                <div className="h-0.5 w-12 bg-[#191919]/10 rounded-sm mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      );

    // ═══════════════════════════════════════
    // TIMELINE / PROCESSUS
    // ═══════════════════════════════════════
    case "timeline-process":
      return (
        <div className="space-y-1.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[5px] font-bold flex-shrink-0">{n}</div>
              <div className="h-1 flex-1 bg-[#191919]/15 rounded-sm" />
            </div>
          ))}
        </div>
      );
    case "timeline-advanced":
      return (
        <div className="flex items-start gap-1">
          <div className="flex flex-col items-center gap-0.5">
            {[1, 2, 3].map((n) => (
              <div key={n}>
                <div className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[4px] font-bold">{n}</div>
                {n < 3 && <div className="w-0.5 h-2 bg-[#4F46E5]/20 mx-auto" />}
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div className="h-1 w-10 bg-[#191919]/40 rounded-sm" />
                <div className="h-0.5 w-14 bg-[#191919]/15 rounded-sm mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      );
    case "process-4steps":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="flex gap-0.5 items-center">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex-1 text-center">
                <div className="w-3 h-3 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[5px] font-bold mx-auto">{n}</div>
                <div className="h-1 w-full bg-[#191919]/20 rounded-sm mt-0.5" />
                <div className="h-0.5 w-full bg-[#191919]/10 rounded-sm mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      );
    case "process-detailed-timeline":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="flex items-start gap-1">
            <div className="flex flex-col items-center">
              {[1, 2, 3, 4].map((n) => (
                <div key={n}>
                  <div className="w-2 h-2 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[4px] font-bold">{n}</div>
                  {n < 4 && <div className="w-0.5 h-1.5 bg-[#4F46E5]/20 mx-auto" />}
                </div>
              ))}
            </div>
            <div className="flex-1 space-y-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="p-0.5 border border-[#E6E6E4] rounded-sm">
                  <div className="h-1 w-8 bg-[#191919]/40 rounded-sm" />
                  <div className="h-0.5 w-12 bg-[#191919]/10 rounded-sm mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    // ═══════════════════════════════════════
    // FAQ / CONFIANCE
    // ═══════════════════════════════════════
    case "faq-accordion":
      return (
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-0.5 border border-[#E6E6E4] rounded-sm">
              <div className="h-1 w-12 bg-[#191919]/30 rounded-sm" />
              <div className="w-1.5 h-1.5 border-b border-r border-[#999] rotate-45 -mt-0.5" />
            </div>
          ))}
        </div>
      );
    case "faq-advanced":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto mb-1" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-0.5 border border-[#E6E6E4] rounded-sm">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]/30" />
                <div className="h-1 w-10 bg-[#191919]/30 rounded-sm" />
              </div>
              <div className="w-1.5 h-1.5 border-b border-r border-[#999] rotate-45 -mt-0.5" />
            </div>
          ))}
        </div>
      );
    case "faq-accordion-full":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`p-0.5 border rounded-sm ${i === 0 ? "border-[#4F46E5]/30 bg-[#EEF2FF]/20" : "border-[#E6E6E4]"}`}>
              <div className="flex items-center justify-between">
                <div className="h-1 w-10 bg-[#191919]/30 rounded-sm" />
                <div className={`w-1.5 h-1.5 border-b border-r border-[#999] ${i === 0 ? "-rotate-45 mt-0.5" : "rotate-45 -mt-0.5"}`} />
              </div>
              {i === 0 && <div className="h-1 w-full bg-[#191919]/10 rounded-sm mt-0.5" />}
            </div>
          ))}
        </div>
      );
    case "faq-2column":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-6 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-2 gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="h-1 w-full bg-[#191919]/30 rounded-sm" />
                <div className="h-0.5 w-full bg-[#191919]/10 rounded-sm mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      );
    case "trust-badges":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="flex gap-1 justify-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="w-3 h-3 rounded-full bg-[#EEF2FF] mx-auto flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]/30" />
                </div>
                <div className="h-0.5 w-4 bg-[#191919]/15 rounded-sm mt-0.5 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      );

    // ═══════════════════════════════════════
    // À PROPOS / ÉQUIPE
    // ═══════════════════════════════════════
    case "about-personal-story":
      return (
        <div className="flex gap-1.5 items-center">
          <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-0.5">
            <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm" />
            <div className="h-1 w-full bg-[#191919]/10 rounded-sm" />
            <div className="h-1 w-14 bg-[#191919]/10 rounded-sm" />
            <div className="flex gap-0.5 mt-0.5">
              {[0, 1].map((i) => (
                <div key={i} className="h-0.5 w-6 bg-[#4F46E5]/20 rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      );
    case "about-studio-values":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-2 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="p-1 border border-[#E6E6E4] rounded-sm">
                <div className="w-2 h-2 rounded bg-[#EEF2FF] mb-0.5" />
                <div className="h-1 w-full bg-[#191919]/30 rounded-sm" />
                <div className="h-0.5 w-full bg-[#191919]/10 rounded-sm mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      );
    case "team-mini-grid":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-8 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="w-4 h-4 rounded-full bg-[#EEF2FF] mx-auto mb-0.5" />
                <div className="h-0.5 w-full bg-[#191919]/30 rounded-sm" />
                <div className="h-0.5 w-full bg-[#191919]/10 rounded-sm mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      );

    // ═══════════════════════════════════════
    // DIVERS
    // ═══════════════════════════════════════
    case "newsletter":
      return (
        <div className="text-center space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="flex gap-1 items-center">
            <div className="flex-1 h-2.5 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            <div className="h-2.5 w-6 bg-[#4F46E5] rounded-sm" />
          </div>
        </div>
      );
    case "calendar-booking":
      return (
        <div className="text-center space-y-1">
          <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm mx-auto" />
          <div className="flex gap-0.5 justify-center flex-wrap">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-2 w-6 border border-[#E6E6E4] rounded-sm" />
            ))}
          </div>
        </div>
      );
    case "lead-magnet":
      return (
        <div className="flex gap-1.5 items-center p-1 border border-[#4F46E5]/30 rounded-sm bg-[#EEF2FF]/30">
          <div className="space-y-0.5 flex-1">
            <div className="h-1.5 w-12 bg-[#191919]/50 rounded-sm" />
            <div className="h-1 w-16 bg-[#191919]/15 rounded-sm" />
            <div className="flex gap-0.5 mt-0.5">
              <div className="flex-1 h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
              <div className="h-2 w-6 bg-[#4F46E5] rounded-sm" />
            </div>
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        </div>
      );
    case "availability-banner":
      return (
        <div className="flex items-center justify-between p-1.5 bg-[#EEF2FF]/50 border border-[#4F46E5]/20 rounded-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <div className="h-1.5 w-14 bg-[#191919]/40 rounded-sm" />
          </div>
          <div className="h-2 w-8 bg-[#4F46E5] rounded-sm" />
        </div>
      );

    // ═══════════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════════
    case "footer-block":
      return (
        <div className="bg-[#191919] rounded-sm p-1.5">
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="h-1 w-6 bg-white/50 rounded-sm mb-0.5" />
              <div className="h-0.5 w-10 bg-white/15 rounded-sm" />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-0.5">
                <div className="h-0.5 w-4 bg-white/30 rounded-sm" />
                <div className="h-0.5 w-5 bg-white/10 rounded-sm" />
                <div className="h-0.5 w-4 bg-white/10 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      );
    case "footer-simple-premium":
      return (
        <div className="border-t border-[#E6E6E4] pt-1 flex items-center justify-between">
          <div className="h-1 w-8 bg-[#191919]/40 rounded-sm" />
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-0.5 w-4 bg-[#191919]/20 rounded-sm" />
            ))}
          </div>
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-[#E6E6E4]" />
            ))}
          </div>
        </div>
      );
    case "footer-multi-column":
      return (
        <div className="border-t border-[#E6E6E4] pt-1 space-y-1">
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="h-1 w-8 bg-[#191919]/40 rounded-sm mb-0.5" />
              <div className="h-0.5 w-12 bg-[#191919]/10 rounded-sm" />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-0.5">
                <div className="h-0.5 w-5 bg-[#191919]/30 rounded-sm" />
                <div className="h-0.5 w-4 bg-[#191919]/10 rounded-sm" />
                <div className="h-0.5 w-5 bg-[#191919]/10 rounded-sm" />
              </div>
            ))}
          </div>
          <div className="h-0.5 w-12 bg-[#191919]/10 rounded-sm" />
        </div>
      );
    case "signature-creative-closing":
      return (
        <div className="text-center space-y-1 py-1.5">
          <div className="h-2 w-16 bg-[#191919]/70 rounded-sm mx-auto" />
          <div className="h-1 w-20 bg-[#191919]/15 rounded-sm mx-auto" />
          <div className="h-3 w-12 bg-[#4F46E5] rounded-sm mx-auto mt-1" />
          <div className="h-0.5 w-14 bg-[#191919]/10 rounded-sm mx-auto italic" />
        </div>
      );

    // ═══════════════════════════════════════
    // FALLBACK — catégorie générique
    // ═══════════════════════════════════════
    default:
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#191919]/30 rounded-sm mx-auto" />
          <div className="h-1 w-16 bg-[#191919]/10 rounded-sm mx-auto" />
          <div className="h-2 w-8 bg-[#4F46E5]/30 rounded-sm mx-auto mt-1" />
        </div>
      );
  }
}

const BlockThumbnail = memo(BlockThumbnailInner);
export default BlockThumbnail;
