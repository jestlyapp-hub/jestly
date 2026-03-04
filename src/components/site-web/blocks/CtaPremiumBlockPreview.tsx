import { memo } from "react";
import type { CtaPremiumBlockContent } from "@/types";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function CtaPremiumBlockPreviewInner({ content }: { content: CtaPremiumBlockContent }) {
  return (
    <div className="py-10 px-6 text-center relative overflow-hidden rounded-2xl" style={content.backgroundImageUrl ? { backgroundImage: `url(${content.backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: "linear-gradient(135deg, var(--site-primary) 0%, #6366F1 100%)" }}>
      {content.backgroundImageUrl && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-2">{content.title}</h3>
        <p className="text-[13px] text-white/70 mb-6 max-w-md mx-auto">{content.description}</p>
        <div className="flex items-center justify-center gap-3">
          <SmartLinkButton link={content.primaryBlockLink} label={content.primaryCtaLabel} className="inline-block text-[13px] font-semibold px-6 py-2.5 cursor-pointer" />
          {content.secondaryCtaLabel && (
            <SmartLinkButton link={content.secondaryBlockLink} label={content.secondaryCtaLabel} className="inline-block text-[13px] font-semibold px-6 py-2.5 cursor-pointer rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors" style={{ backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "8px" }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(CtaPremiumBlockPreviewInner);
