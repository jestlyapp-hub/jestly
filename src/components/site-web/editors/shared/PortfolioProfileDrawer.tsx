"use client";

import { useState, useEffect } from "react";
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
    introText?: string;
    challengeText?: string;
    solutionText?: string;
    resultText?: string;
    galleryItemIds?: string[];
    seoTitle?: string;
    seoDescription?: string;
  };
}

interface ProjectItem {
  id: string;
  itemType: string;
  filePath?: string;
  thumbnailUrl?: string;
  title?: string;
}

interface PortfolioProfileDrawerProps {
  project: ProjectData;
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

const tabs = [
  { id: "general", label: "Général" },
  { id: "content", label: "Contenu" },
  { id: "media", label: "Médias" },
  { id: "seo", label: "SEO" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function PortfolioProfileDrawer({ project, onClose, onSaved }: PortfolioProfileDrawerProps) {
  const p = project.portfolio;

  const [tab, setTab] = useState<TabId>("general");
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

  // Content tab
  const [introText, setIntroText] = useState(p.introText || "");
  const [challengeText, setChallengeText] = useState(p.challengeText || "");
  const [solutionText, setSolutionText] = useState(p.solutionText || "");
  const [resultText, setResultText] = useState(p.resultText || "");

  // Media tab
  const [galleryItemIds, setGalleryItemIds] = useState<string[]>(p.galleryItemIds || []);
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // SEO tab
  const [seoTitle, setSeoTitle] = useState(p.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(p.seoDescription || "");

  const [saving, setSaving] = useState(false);

  // Fetch project items for media picker
  useEffect(() => {
    fetch(`/api/projects/${project.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.items) {
          setProjectItems(
            data.items.filter((it: ProjectItem) => it.itemType === "image" || it.itemType === "video")
          );
        }
      })
      .catch(() => {});
  }, [project.id]);

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
          portfolioIntroText: introText || null,
          portfolioChallengeText: challengeText || null,
          portfolioSolutionText: solutionText || null,
          portfolioResultText: resultText || null,
          portfolioGalleryItemIds: galleryItemIds,
          portfolioSeoTitle: seoTitle || null,
          portfolioSeoDescription: seoDescription || null,
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

  const toggleGalleryItem = (id: string) => {
    setGalleryItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="px-5 pt-5 pb-0 border-b border-[#E6E6E4]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1A1A1A]">Page portfolio</h3>
              <p className="text-[11px] text-[#8A8A88] mt-0.5">{project.name}</p>
            </div>
            <button onClick={onClose} className="text-[#8A8A88] hover:text-[#1A1A1A] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <p className="text-[10px] text-[#8A8A88] mb-3 bg-[#F7F7F5] rounded-md px-2.5 py-1.5">
            Les modifications ici n&apos;altèrent pas vos fichiers internes, seulement leur présentation sur le site.
          </p>

          {/* Tabs */}
          <div className="flex gap-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 text-[11px] font-medium border-b-2 transition-all ${
                  tab === t.id
                    ? "border-[#4F46E5] text-[#4F46E5]"
                    : "border-transparent text-[#8A8A88] hover:text-[#5A5A58]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* ─── GENERAL TAB ─── */}
          {tab === "general" && (
            <>
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

              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Slug public</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="ex: miniature-youtube" className={inputClass} />
                <p className="text-[10px] text-[#8A8A88] mt-0.5">URL : /portfolio/{slug || "..."}</p>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre affiché</label>
                <input type="text" value={displayTitle} onChange={(e) => setDisplayTitle(e.target.value)} placeholder={project.name} className={inputClass} />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
                <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Ex: Identité visuelle complète" className={inputClass} />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Catégorie</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Branding, Web Design..." className={inputClass} />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Résultat clé</label>
                <input type="text" value={result} onChange={(e) => setResult(e.target.value)} placeholder="Ex: +200% de conversions" className={inputClass} />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Résumé</label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Courte description..." className={inputClass} />
              </div>
            </>
          )}

          {/* ─── CONTENT TAB ─── */}
          {tab === "content" && (
            <>
              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Introduction / Contexte</label>
                <textarea value={introText} onChange={(e) => setIntroText(e.target.value)} rows={4} placeholder="Décrivez le contexte du projet..." className={inputClass} />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Le défi</label>
                <textarea value={challengeText} onChange={(e) => setChallengeText(e.target.value)} rows={4} placeholder="Quel était le problème à résoudre ?" className={inputClass} />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">La solution</label>
                <textarea value={solutionText} onChange={(e) => setSolutionText(e.target.value)} rows={4} placeholder="Comment avez-vous résolu ce défi ?" className={inputClass} />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Résultats détaillés</label>
                <textarea value={resultText} onChange={(e) => setResultText(e.target.value)} rows={4} placeholder="Quels résultats concrets avez-vous obtenus ?" className={inputClass} />
              </div>

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
            </>
          )}

          {/* ─── MEDIA TAB ─── */}
          {tab === "media" && (
            <>
              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Image de couverture</label>
                <ImageUploader value={coverUrl} onChange={setCoverUrl} label="Couverture" />

                {projectImages.length > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => setShowImagePicker(!showImagePicker)}
                      className="text-[11px] text-[#4F46E5] hover:underline font-medium"
                    >
                      {showImagePicker ? "Masquer" : "Choisir depuis le projet"} ({projectImages.length})
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
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Gallery picker from project items */}
              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
                  Galerie publique ({galleryItemIds.length} sélectionné{galleryItemIds.length > 1 ? "s" : ""})
                </label>
                <p className="text-[10px] text-[#8A8A88] mb-2">
                  Sélectionnez les médias du projet à afficher sur la page portfolio.
                </p>

                {projectItems.length === 0 ? (
                  <div className="py-6 text-center border border-dashed border-[#E6E6E4] rounded-lg bg-[#FBFBFA]">
                    <p className="text-[11px] text-[#8A8A88]">Aucun média dans ce projet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {projectItems.map((item) => {
                      const isSelected = galleryItemIds.includes(item.id);
                      const thumbUrl = item.filePath || item.thumbnailUrl;
                      const order = isSelected ? galleryItemIds.indexOf(item.id) + 1 : null;

                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleGalleryItem(item.id)}
                          className={`relative rounded-lg overflow-hidden aspect-square border-2 transition-all ${
                            isSelected ? "border-[#4F46E5] ring-1 ring-[#4F46E5]/20" : "border-transparent hover:border-[#E6E6E4]"
                          }`}
                        >
                          {thumbUrl ? (
                            <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#F7F7F5] flex items-center justify-center">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            </div>
                          )}

                          {/* Type badge */}
                          <span className="absolute top-1 left-1 text-[8px] px-1 py-0.5 rounded bg-black/50 text-white font-medium uppercase">
                            {item.itemType === "video" ? "VID" : "IMG"}
                          </span>

                          {/* Selection order */}
                          {isSelected && order && (
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#4F46E5] text-white text-[10px] font-bold flex items-center justify-center">
                              {order}
                            </div>
                          )}

                          {/* Check overlay */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#4F46E5]/10" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ─── SEO TAB ─── */}
          {tab === "seo" && (
            <>
              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre SEO</label>
                <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={displayTitle || project.name} className={inputClass} />
                <p className="text-[10px] text-[#8A8A88] mt-0.5">{(seoTitle || displayTitle || project.name).length}/60 caractères</p>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Description SEO</label>
                <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} placeholder={summary || "Description pour les moteurs de recherche..."} className={inputClass} />
                <p className="text-[10px] text-[#8A8A88] mt-0.5">{(seoDescription || summary || "").length}/160 caractères</p>
              </div>

              {/* Preview */}
              <div className="p-3 rounded-lg border border-[#E6E6E4] bg-[#FBFBFA]">
                <p className="text-[10px] font-medium text-[#8A8A88] mb-2 uppercase tracking-wider">Aperçu Google</p>
                <div className="text-[14px] text-[#1A0DAB] font-medium truncate">
                  {seoTitle || displayTitle || project.name} — Mon Site
                </div>
                <div className="text-[11px] text-emerald-700 truncate mt-0.5">
                  jestly.fr/s/monsite/portfolio/{slug || "..."}
                </div>
                <div className="text-[12px] text-[#545454] mt-1 line-clamp-2">
                  {seoDescription || summary || "Description du projet..."}
                </div>
              </div>
            </>
          )}
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
