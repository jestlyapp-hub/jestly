import { memo } from "react";
import Image from "next/image";
import type { HeroBlockContent } from "@/types";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function HeroBlockPreviewInner({ content }: { content: HeroBlockContent }) {
  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--site-text)" }}>{content.title}</h2>
      {content.subtitle && <p className="text-[14px] mb-4 max-w-lg mx-auto" style={{ color: "var(--site-muted)" }}>{content.subtitle}</p>}
      {content.ctaLabel && (
        <SmartLinkButton link={content.blockLink} label={content.ctaLabel} className="inline-block text-[13px] font-semibold px-5 py-2.5 cursor-pointer" />
      )}
      {content.imageUrl && (
        <div className="mt-6 max-w-2xl mx-auto rounded-xl overflow-hidden">
          <Image src={content.imageUrl} alt="" width={800} height={450} className="w-full h-auto object-cover" unoptimized />
        </div>
      )}
    </div>
  );
}

export default memo(HeroBlockPreviewInner);
