"use client";

import { useState } from "react";
import ImageUploader from "../ImageUploader";

interface ProjectData {
  id: string;
  name: string;
  coverUrl?: string;
  itemImages: string[];
  portfolio: {
    displayTitle?: string;
    subtitle?: string;
    result?: string;
    summary?: string;
    coverUrl?: string;
    category?: string;
    slug?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    visibility: string;
    description?: string;
  };
}

interface PortfolioProfileDrawerProps {
  project: ProjectData;
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function PortfolioProfileDrawer({ project, onClose, onSaved }: PortfolioProfileDrawerProps) {
  const p = project.portfolio;

  const [displayTitle, setDisplayTitle] = useState(p.displayTitle || "");
  const [subtitle, setSubtitle] = useState(p.subtitle || "");
  const [category, setCategory] = useState(p.category || "");
  const [result, setResult] = useState(p.result || "");
  const [summary, setSummary] = useState(p.summary || "");
  const [coverUrl, setCoverUrl] = useState(p.coverUrl || "");
  const [slug, setSlug] = useState(p.slug || "");
  const [ctaLabel, setCtaLabel] = useState(p.ctaLabel || "");
  const [ctaUrl, setCtaUrl] = useState(p.ctaUrl || "");
  const [visibility, setVisibility] = useState(p.visibility || "draft");
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPortfolio: true,
          portfolioDisplayTitle: displayTitle || null,
          portfolioSubtitle: subtitle || null,
          portfolioCategory: category || null,
          portfolioResult: result || null,
          portfolioSummary: summary || null,
          portfolioCoverUrl: coverUrl || null,
          portfolioSlug: slug || null,
          portfolioCtaLabel: ctaLabel || null,
          portfolioCtaUrl: ctaUrl || null,
          portfolioVisibility: visibility,
        }),
      });
      onSaved();
      onClose();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const projectImages = [project.coverUrl, ...project.itemImages].filter(Boolean) as string[];

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-[#E6E6E4]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1A1A1A]">Configurer le portfolio</h3>
              <p className="text-[11px] text-[#8A8A88] mt-0.5">Projet : {project.name}</p>
            </div>
            <button onClick={onClose} className="text-[#8A8A88] hover:text-[#1A1A1A] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <p className="text-[11px] text-[#8A8A88] mt-2 bg-[#F7F7F5] rounded-md px-2.5 py-1.5">
            Les modifications ici n&apos;altèrent pas vos fichiers internes, seulement leur présentation sur le site.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Cover */}
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Image de couverture</label>
            <ImageUploader value={coverUrl} onChange={setCoverUrl} label="Couverture portfolio" />

            {/* Pick from project images */}
            {projectImages.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setShowImagePicker(!showImagePicker)}
                  className="text-[11px] text-[#4F46E5] hover:underline font-medium"
                >
                  {showImagePicker ? "Masquer" : "Choisir depuis le projet"} ({projectImages.length} image{projectImages.length > 1 ? "s" : ""})
                </button>
                {showImagePicker && (
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {projectImages.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => { setCoverUrl(url); setShowImagePicker(false); }}
                        className={`relative rounded-md overflow-hidden aspect-square border-2 transition-all ${
                          coverUrl === url ? "border-[#4F46E5]" : "border-transparent hover:border-[#E6E6E4]"
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {coverUrl === url && (
                          <div className="absolute inset-0 bg-[#4F46E5]/20 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre affiché</label>
            <input type="text" value={displayTitle} onChange={(e) => setDisplayTitle(e.target.value)} placeholder={project.name} className={inputClass} />
            <p className="text-[10px] text-[#8A8A88] mt-0.5">Par défaut : nom du projet</p>
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Ex: Identité visuelle complète" className={inputClass} />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Catégorie</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Branding, Web Design..." className={inputClass} />
          </div>

          {/* Result */}
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Résultat / Métrique</label>
            <input type="text" value={result} onChange={(e) => setResult(e.target.value)} placeholder="Ex: +200% de conversions" className={inputClass} />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Description courte</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Courte description pour le portfolio..." className={inputClass} />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Slug public</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="ex: miniature-youtube" className={inputClass} />
            <p className="text-[10px] text-[#8A8A88] mt-0.5">Futur URL : /projets/{slug || "..."}</p>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Label CTA</label>
              <input type="text" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Voir le projet" className={inputClass} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">URL CTA</label>
              <input type="text" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Visibilité</label>
            <div className="flex gap-2">
              <button
                onClick={() => setVisibility("public")}
                className={`flex-1 py-2 rounded-lg text-[12px] font-medium border transition-all ${
                  visibility === "public"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-[#F7F7F5] border-[#E6E6E4] text-[#8A8A88] hover:border-[#D1D1D0]"
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setVisibility("draft")}
                className={`flex-1 py-2 rounded-lg text-[12px] font-medium border transition-all ${
                  visibility === "draft"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-[#F7F7F5] border-[#E6E6E4] text-[#8A8A88] hover:border-[#D1D1D0]"
                }`}
              >
                Brouillon
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E6E6E4] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[12px] text-[#5A5A58] hover:text-[#1A1A1A] transition-colors">
            Annuler
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 text-[12px] font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
