import { memo } from "react";
import type { CtaPremiumBlockContent } from "@/types";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function CtaPremiumBlockPreviewInner({ content }: { content: CtaPremiumBlockContent }) {
  return (
    <div className="py-10 px-6 text-center relative overflow-hidden rounded-2xl" style={content.backgroundImageUrl ? { backgroundImage: `url(${content.backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: "linear-gradient(135deg, var(--site-primary) 0%, var(--site-secondary, #6366F1) 100%)" }}>
      {content.backgroundImageUrl && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-2" style={{ color: "var(--btn-text, #fff)" }}>{content.title}</h3>
        <p className="text-[13px] mb-6 max-w-md mx-auto" style={{ color: "var(--btn-text, rgba(255,255,255,0.7))" }}>{content.description}</p>
        <div className="flex items-center justify-center gap-3">
          <SmartLinkButton link={content.primaryBlockLink} label={content.primaryCtaLabel} className="inline-block text-[13px] font-semibold px-6 py-2.5 cursor-pointer" />
          {content.secondaryCtaLabel && (
            <SmartLinkButton link={content.secondaryBlockLink} label={content.secondaryCtaLabel} className="inline-block text-[13px] font-semibold px-6 py-2.5 cursor-pointer rounded-lg transition-colors" style={{ backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "var(--btn-text, #fff)", borderRadius: "8px" }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(CtaPremiumBlockPreviewInner);
