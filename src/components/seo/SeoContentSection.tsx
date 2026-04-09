/**
 * SeoContentSection — Bloc de contenu textuel SEO riche
 *
 * Affiche des sections H2 + paragraphes pour densifier le contenu indexable.
 * Chaque page fonctionnalité peut passer ses propres blocs de texte.
 *
 * Usage :
 *   <SeoContentSection blocks={[
 *     { heading: "Pourquoi utiliser un logiciel de facturation freelance", paragraphs: ["..."] },
 *   ]} />
 */

export interface SeoBlock {
  heading: string;
  paragraphs: string[];
}

interface SeoContentSectionProps {
  blocks: SeoBlock[];
}

export default function SeoContentSection({ blocks }: SeoContentSectionProps) {
  return (
    <section className="relative py-24 sm:py-32 px-6" style={{ background: "#FFFFFF" }}>
      <div className="max-w-3xl mx-auto">
        <div className="space-y-12">
          {blocks.map((block, i) => (
            <div key={i}>
              <h2 className="text-[22px] sm:text-[28px] font-bold leading-tight tracking-[-0.02em] mb-4" style={{ color: "#111118" }}>
                {block.heading}
              </h2>
              {block.paragraphs.map((p, j) => (
                <p key={j} className="text-[15px] leading-[1.75] mb-4" style={{ color: "#4B5563" }}>
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
