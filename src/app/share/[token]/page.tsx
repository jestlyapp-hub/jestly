import { notFound } from "next/navigation";

interface SharedProject {
  name: string;
  description: string;
  type: string;
  color: string;
  status: string;
  tags: string[];
  coverUrl?: string;
  images: string[];
  category: string;
  externalUrl?: string;
  budget: number;
  currency: string;
  deadline?: string;
  startDate?: string;
  clientName?: string;
  clientCompany?: string;
  createdAt: string;
  updatedAt: string;
}

interface SharedFolder {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface SharedItem {
  id: string;
  type: string;
  title: string;
  description: string;
  url?: string;
  thumbnailUrl?: string;
  tags: string[];
  position: number;
  isPinned: boolean;
  folderId?: string;
}

async function getSharedProject(token: string): Promise<{ project: SharedProject; folders: SharedFolder[]; items: SharedItem[] } | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_DOMAIN?.includes("localhost")
    ? `http://localhost:3000`
    : `https://jestly.fr`;

  const res = await fetch(`${baseUrl}/api/public/share/${token}`, {
    next: { revalidate: 30 },
  });

  if (!res.ok) return null;
  return res.json();
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  in_progress: "En cours",
  review: "En review",
  completed: "Terminé",
  archived: "Archivé",
};

const TYPE_ICONS: Record<string, string> = {
  image: "🖼️", video: "🎬", file: "📄", link: "🔗", note: "📝",
  embed: "🌐", reference: "📌", moodboard: "🎨",
};

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getSharedProject(token);
  if (!data) return { title: "Projet introuvable" };
  return {
    title: `${data.project.name} — Jestly`,
    description: data.project.description?.slice(0, 200),
  };
}

export default async function SharedProjectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getSharedProject(token);
  if (!data) notFound();

  const { project, folders, items } = data;
  const rootItems = items.filter(i => !i.folderId);
  const pinnedItems = items.filter(i => i.isPinned);
  const mediaItems = items.filter(i => ["image", "video"].includes(i.type) && (i.thumbnailUrl || i.url));

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <header className="bg-white border-b border-[#E6E6E4]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center">
              <span className="text-white text-xs font-bold">J</span>
            </div>
            <span className="text-[13px] text-[#8A8A88]">Projet partagé via Jestly</span>
          </div>
        </div>
      </header>

      {/* Cover */}
      {project.coverUrl && (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img src={project.coverUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Project info */}
        <div className="bg-white rounded-2xl border border-[#E6E6E4] overflow-hidden mb-8">
          <div className="h-2 w-full" style={{ backgroundColor: project.color }} />
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">{project.name}</h1>
                {project.description && (
                  <p className="text-[14px] text-[#5A5A58] leading-relaxed max-w-2xl">{project.description}</p>
                )}
              </div>
              <span className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#F7F7F5] text-[#5A5A58]">
                {STATUS_LABELS[project.status] || project.status}
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 flex-wrap">
              {project.clientName && (
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#5A5A58] bg-[#F7F7F5] px-3 py-1.5 rounded-lg">
                  👤 {project.clientName}{project.clientCompany ? ` · ${project.clientCompany}` : ""}
                </span>
              )}
              {project.category && (
                <span className="inline-flex items-center text-[12px] text-[#4F46E5] bg-[#EEF2FF] px-3 py-1.5 rounded-lg font-medium">
                  {project.category}
                </span>
              )}
              {project.deadline && (
                <span className="inline-flex items-center gap-1 text-[12px] text-[#8A8A88] bg-[#F7F7F5] px-3 py-1.5 rounded-lg">
                  📅 {new Date(project.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
              {project.tags.map(tag => (
                <span key={tag} className="text-[11px] font-medium px-2 py-1 rounded-md bg-[#EEF2FF] text-[#4F46E5]">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery from portfolio images */}
        {project.images.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Galerie</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {project.images.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-[#E6E6E4] aspect-video">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Media items */}
        {mediaItems.length > 0 && project.images.length === 0 && (
          <section className="mb-8">
            <h2 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Assets ({mediaItems.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {mediaItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <img src={item.thumbnailUrl || item.url || ""} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  {item.title && (
                    <div className="p-2.5">
                      <p className="text-[12px] font-medium text-[#1A1A1A] truncate">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Folders */}
        {folders.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Dossiers ({folders.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {folders.map(folder => {
                const folderItems = items.filter(i => i.folderId === folder.id);
                return (
                  <div key={folder.id} className="bg-white rounded-xl border border-[#E6E6E4] p-4">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${folder.color}15` }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={folder.color} strokeWidth="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <h4 className="text-[13px] font-semibold text-[#1A1A1A] truncate">{folder.name}</h4>
                    <span className="text-[11px] text-[#8A8A88]">{folderItems.length} élément{folderItems.length !== 1 ? "s" : ""}</span>
                    {/* Show folder items */}
                    {folderItems.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {folderItems.slice(0, 5).map(item => (
                          <div key={item.id} className="flex items-center gap-2 text-[11px] text-[#5A5A58]">
                            <span>{TYPE_ICONS[item.type] || "📄"}</span>
                            <span className="truncate">{item.title || "Sans titre"}</span>
                          </div>
                        ))}
                        {folderItems.length > 5 && (
                          <span className="text-[10px] text-[#8A8A88]">+{folderItems.length - 5} de plus</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Root items */}
        {rootItems.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Éléments ({rootItems.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rootItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden">
                  {["image", "video"].includes(item.type) && (item.thumbnailUrl || item.url) && (
                    <div className="h-32 overflow-hidden">
                      <img src={item.thumbnailUrl || item.url || ""} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{TYPE_ICONS[item.type] || "📄"}</span>
                      <h4 className="text-[13px] font-semibold text-[#1A1A1A] truncate">{item.title || "Sans titre"}</h4>
                      {item.isPinned && <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-semibold">Épinglé</span>}
                    </div>
                    {item.description && <p className="text-[11px] text-[#8A8A88] line-clamp-2">{item.description}</p>}
                    {item.url && ["link", "embed"].includes(item.type) && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-[#4F46E5] hover:underline mt-1">
                        🔗 {(() => { try { return new URL(item.url).hostname; } catch { return "Lien"; } })()}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* External link */}
        {project.externalUrl && (
          <div className="text-center mb-8">
            <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors">
              Voir le projet complet →
            </a>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E6E6E4] py-6 text-center">
        <p className="text-[12px] text-[#8A8A88]">Créé avec <a href="https://jestly.fr" className="text-[#4F46E5] hover:underline">Jestly</a></p>
      </footer>
    </div>
  );
}
