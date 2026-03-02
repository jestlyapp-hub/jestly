import { memo } from "react";
import type { ServiceCardsBlockContent } from "@/types";
import { getButtonInlineStyle } from "@/lib/block-style-engine";

const iconMap: Record<string, React.ReactNode> = {
  zap: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  heart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  clock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  globe: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  palette: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.04-.24-.3-.39-.65-.39-1.04 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.52-4.48-9.96-10-9.96z" /></svg>,
};

function ServiceCardsBlockPreviewInner({ content }: { content: ServiceCardsBlockContent }) {
  const cols = content.columns === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className="py-6">
      {content.title && <h3 className="text-lg font-bold text-center mb-6">{content.title}</h3>}
      <div className={`grid ${cols} gap-4`}>
        {content.services.map((s, i) => (
          <div key={i} className="rounded-xl border border-[#E6E6E4] p-5 hover:shadow-md transition-shadow flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-[var(--site-primary-light)] flex items-center justify-center text-[var(--site-primary)] mb-3">
              {iconMap[s.icon] || iconMap.star}
            </div>
            <div className="text-[14px] font-bold mb-1">{s.name}</div>
            <div className="text-[11px] opacity-50 mb-3">{s.description}</div>
            {s.features.length > 0 && (
              <ul className="space-y-1 mb-4 flex-1">
                {s.features.map((f, fi) => (
                  <li key={fi} className="text-[11px] opacity-60 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            )}
            {s.price != null && <div className="text-lg font-bold mb-3">{s.price} €</div>}
            <span className="btn-styled block text-center text-[12px] font-semibold px-4 py-2 cursor-pointer mt-auto" style={getButtonInlineStyle()}>{s.ctaLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(ServiceCardsBlockPreviewInner);
