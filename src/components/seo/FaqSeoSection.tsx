/**
 * FaqSeoSection — Section FAQ SEO avec JSON-LD FAQPage Schema
 *
 * Affiche une FAQ accessible (accordion) + injecte le schema FAQPage
 * pour les rich snippets Google.
 *
 * Usage :
 *   <FaqSeoSection
 *     title="Questions fréquentes sur la facturation freelance"
 *     items={[
 *       { question: "...", answer: "..." },
 *     ]}
 *   />
 */
import JsonLd from "./JsonLd";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSeoSectionProps {
  title: string;
  items: FaqItem[];
  accentColor?: string;
}

export default function FaqSeoSection({ title, items, accentColor = "#4F46E5" }: FaqSeoSectionProps) {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="relative py-24 sm:py-32 px-6" style={{ background: "#F3F0FF" }}>
      <JsonLd data={faqLd} />
      <div className="max-w-3xl mx-auto">
        <h2 className="text-[28px] sm:text-[36px] md:text-[44px] font-extrabold leading-[1.08] tracking-[-0.03em] text-center mb-12" style={{ color: "#111118" }}>
          {title}
        </h2>

        <div className="space-y-4">
          {items.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-white transition-all"
              style={{ border: "1px solid #E5E7EB", boxShadow: "0 4px 16px rgba(124,58,237,0.06)" }}
            >
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-[15px] sm:text-[16px] font-semibold" style={{ color: "#111118" }}>
                  {item.question}
                </h3>
                <span className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors group-open:rotate-45" style={{ background: `${accentColor}10`, color: accentColor }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-5 text-[14px] leading-relaxed" style={{ color: "#6B7280" }}>
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
