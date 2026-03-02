"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { mockSite } from "@/lib/mock-data";
import type { PortfolioGridBlockContent } from "@/types";

function findProjectBySlug(slug: string) {
  for (const page of mockSite.pages) {
    for (const block of page.blocks) {
      if (block.type === "portfolio-grid") {
        const content = block.content as PortfolioGridBlockContent;
        const item = content.items.find((it) => it.slug === slug);
        if (item) return item;
      }
    }
  }
  return null;
}

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const project = findProjectBySlug(params.slug);

  if (!project) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-5xl mb-4">404</div>
        <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">Projet introuvable</h1>
        <p className="text-[13px] text-[#999]">Ce projet n&apos;existe pas ou a été retiré.</p>
      </div>
    );
  }

  const images = project.images && project.images.length > 0
    ? project.images
    : [project.imageUrl];

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">{project.title}</h1>
            <span className="bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              {project.category}
            </span>
            {project.featured && (
              <span className="bg-[#4F46E5] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                En vedette
              </span>
            )}
          </div>
          {project.description && (
            <p className="text-[14px] text-[#666] leading-relaxed">{project.description}</p>
          )}
        </div>

        {/* Image gallery */}
        <div className="space-y-3">
          {images.map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-[#E6E6E4]">
              {img ? (
                <img src={img} alt={`${project.title} — Image ${i + 1}`} className="w-full object-cover" />
              ) : (
                <div className="h-64 bg-gradient-to-br from-[#EEF2FF] to-[#E6E6E4] flex items-center justify-center">
                  <div className="text-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-[12px] text-[#4F46E5] font-medium">{project.title}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-6 text-center">
          <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-2">Ce projet vous inspire ?</h3>
          <p className="text-[12px] text-[#999] mb-4">Discutons de votre projet et trouvons la meilleure approche.</p>
          <button className="bg-[#4F46E5] text-white text-[13px] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors">
            Demander un devis
          </button>
        </div>
      </motion.div>
    </div>
  );
}
