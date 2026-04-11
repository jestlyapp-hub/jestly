"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import AnimatedButton from "@/components/ui/AnimatedButton";
import DatabaseError, { detectErrorVariant } from "@/components/ui/DatabaseError";
import type { Project, ProjectType, ProjectStatus, ProjectPriority } from "@/types";

/* ─── Constants ──────────────────────────────────────────── */

const PROJECT_TYPES: { value: ProjectType; label: string; icon: string }[] = [
  { value: "thumbnail", label: "Thumbnail", icon: "🎨" },
  { value: "video", label: "Video Editing", icon: "🎬" },
  { value: "branding", label: "Branding", icon: "✦" },
  { value: "development", label: "Développement", icon: "⟨/⟩" },
  { value: "design", label: "Design", icon: "◆" },
  { value: "content", label: "Contenu", icon: "✎" },
  { value: "custom", label: "Custom", icon: "★" },
];

const STATUS_CONFIG: Record<ProjectStatus, { label: string; bg: string; text: string }> = {
  draft: { label: "Brouillon", bg: "bg-[#F7F7F5]", text: "text-[#8A8A88]" },
  in_progress: { label: "En cours", bg: "bg-blue-50", text: "text-blue-600" },
  review: { label: "Review", bg: "bg-amber-50", text: "text-amber-600" },
  completed: { label: "Terminé", bg: "bg-emerald-50", text: "text-emerald-600" },
  archived: { label: "Archivé", bg: "bg-gray-100", text: "text-gray-500" },
};

const PRIORITY_CONFIG: Record<ProjectPriority, { label: string; color: string }> = {
  low: { label: "Basse", color: "#8A8A88" },
  normal: { label: "Normale", color: "#3B82F6" },
  high: { label: "Haute", color: "#F59E0B" },
  urgent: { label: "Urgente", color: "#EF4444" },
};

const COLOR_PALETTE = [
  "#4F46E5", "#7C3AED", "#EC4899", "#EF4444", "#F59E0B",
  "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6", "#F97316",
  "#14B8A6", "#6366F1", "#E11D48", "#0EA5E9",
];

/* ─── Client dropdown type ───────────────────────────────── */
interface ClientOption { id: string; name: string; company?: string }

/* ─── Stats Bar ──────────────────────────────────────────── */
function StatsBar({ projects }: { projects: Project[] }) {
  const total = projects.length;
  const active = projects.filter((p) => p.status === "in_progress").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const revenue = projects.reduce((sum, p) => sum + p.budget, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[
        { label: "Total projets", value: String(total) },
        { label: "En cours", value: String(active) },
        { label: "Terminés", value: String(completed) },
        { label: "Valeur totale", value: `${revenue.toLocaleString("fr-FR")}€` },
      ].map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-[#E6E6E4] p-4">
          <div className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wider mb-1">{s.label}</div>
          <div className="text-[22px] font-bold text-[#191919]">{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Project Card ───────────────────────────────────────── */
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const typeInfo = PROJECT_TYPES.find((t) => t.value === project.projectType);
  const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onClick={onClick}
      className="group bg-white rounded-xl border border-[#E6E6E4] hover:border-[#D0D0CE] hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: project.color }} />

      {/* Cover */}
      <div className="relative h-28 overflow-hidden">
        {project.coverUrl ? (
          <Image src={project.coverUrl} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${project.color}15 0%, ${project.color}08 100%)` }}
          >
            <span className="text-3xl opacity-30">{typeInfo?.icon || "★"}</span>
          </div>
        )}
        <div className="absolute top-2.5 right-2.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
            {statusCfg.label}
          </span>
        </div>
        {project.isPortfolio && (
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#EEF2FF] text-[#4F46E5]">
              Portfolio
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[14px] font-semibold text-[#191919] leading-snug line-clamp-2 group-hover:text-[#4F46E5] transition-colors mb-1.5">
          {project.name}
        </h3>

        {project.description && (
          <p className="text-[11px] text-[#8A8A88] line-clamp-2 mb-2.5">{project.description}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
          {project.clientName && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#5A5A58] bg-[#F7F7F5] px-1.5 py-0.5 rounded">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
              {project.clientName}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] text-[#5A5A58] bg-[#F7F7F5] px-1.5 py-0.5 rounded">
            {typeInfo?.icon} {typeInfo?.label || project.projectType}
          </span>
          {project.deadline && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#5A5A58] bg-[#F7F7F5] px-1.5 py-0.5 rounded">
              📅 {new Date(project.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-2.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5]">{tag}</span>
            ))}
            {project.tags.length > 3 && <span className="text-[9px] text-[#8A8A88]">+{project.tags.length - 3}</span>}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-[#EFEFEF]">
          <span className="text-[10px] text-[#8A8A88]">
            {project.itemsCount} élément{project.itemsCount !== 1 ? "s" : ""}
            {project.foldersCount > 0 && ` · ${project.foldersCount} dossier${project.foldersCount !== 1 ? "s" : ""}`}
          </span>
          {project.budget > 0 && (
            <span className="text-[12px] font-semibold text-[#191919]">{project.budget.toLocaleString("fr-FR")}€</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Creation Modal ─────────────────────────────────────── */
function CreateProjectModal({
  open,
  onClose,
  onCreated,
  clients,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
  clients: ClientOption[];
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    projectType: "custom" as ProjectType,
    color: "#4F46E5",
    status: "in_progress" as ProjectStatus,
    priority: "normal" as ProjectPriority,
    budget: "",
    clientId: "",
    tags: "",
    deadline: "",
    startDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setForm({ name: "", description: "", projectType: "custom", color: "#4F46E5", status: "in_progress", priority: "normal", budget: "", clientId: "", tags: "", deadline: "", startDate: "" });
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Le nom du projet est requis");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await apiFetch<{ id: string }>("/api/projects", {
        body: {
          name: form.name.trim(),
          description: form.description,
          projectType: form.projectType,
          color: form.color,
          status: form.status,
          priority: form.priority,
          budget: Number(form.budget) || 0,
          clientId: form.clientId || null,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          deadline: form.deadline || null,
          startDate: form.startDate || null,
        },
      });
      resetForm();
      onClose();
      onCreated(res.id);
    } catch (err: any) {
      const msg = err?.message || "Erreur lors de la création du projet";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2.5 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { onClose(); resetForm(); }} />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-3">
                <div>
                  <h2 className="text-[17px] font-bold text-[#191919]">Nouveau projet</h2>
                  <p className="text-[12px] text-[#8A8A88] mt-0.5">Créez un espace de travail créatif</p>
                </div>
                <button onClick={() => { onClose(); resetForm(); }} className="p-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mx-6 mb-3 px-4 py-2.5 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-600">
                  {error}
                </div>
              )}

              <div className="px-6 pb-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Nom du projet *</label>
                  <input className={inputClass} placeholder="ex: Thumbnail MrBeast Video #12" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(""); }} autoFocus />
                </div>

                {/* Type + Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Type</label>
                    <select className={inputClass} value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value as ProjectType })}>
                      {PROJECT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Couleur</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {COLOR_PALETTE.map((c) => (
                        <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={`w-6 h-6 rounded-full transition-all cursor-pointer ${form.color === c ? "ring-2 ring-offset-2 ring-[#4F46E5] scale-110" : "hover:scale-110"}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Client */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Client</label>
                  <select className={inputClass} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                    <option value="">Aucun client</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ""}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Description</label>
                  <textarea className={`${inputClass} resize-none`} rows={3} placeholder="Décrivez le projet, les objectifs, le contexte..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                {/* Budget + Status + Priority */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Budget (€)</label>
                    <input className={inputClass} type="number" placeholder="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Statut</label>
                    <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Priorité</label>
                    <select className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as ProjectPriority })}>
                      {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Date de début</label>
                    <input className={inputClass} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Deadline</label>
                    <input className={inputClass} type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Tags</label>
                  <input className={inputClass} placeholder="YouTube, Design, Client (virgules)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button onClick={() => { onClose(); resetForm(); }} className="px-4 py-2.5 text-[13px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] rounded-lg transition-colors cursor-pointer">
                    Annuler
                  </button>
                  <AnimatedButton onClick={handleSubmit} disabled={!form.name.trim()} loading={saving}>
                    {saving ? "Création..." : "Créer le projet"}
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Sort options ───────────────────────────────────────── */
type SortKey = "recent" | "name" | "budget" | "status";

function sortProjects(projects: Project[], key: SortKey): Project[] {
  const sorted = [...projects];
  switch (key) {
    case "recent": return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    case "name": return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "budget": return sorted.sort((a, b) => b.budget - a.budget);
    case "status": {
      const order: Record<string, number> = { in_progress: 0, review: 1, draft: 2, completed: 3, archived: 4 };
      return sorted.sort((a, b) => (order[a.status] ?? 5) - (order[b.status] ?? 5));
    }
    default: return sorted;
  }
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function ProjetsPage() {
  const router = useRouter();
  const { data: projects, loading, error: loadError, mutate } = useApi<Project[]>("/api/projects", []);
  const { data: clients } = useApi<ClientOption[]>("/api/clients", []);

  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const clientOptions: ClientOption[] = (clients ?? []).map((c: any) => ({
    id: c.id,
    name: c.name ?? c.email,
    company: c.company,
  }));

  // Unique clients from projects for filter dropdown
  const projectClients = useMemo(() => {
    if (!projects) return [];
    const map = new Map<string, string>();
    projects.forEach((p) => { if (p.clientId && p.clientName) map.set(p.clientId, p.clientName); });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    let result = projects.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.tags.some((t) => t.toLowerCase().includes(q)) && !(p.clientName ?? "").toLowerCase().includes(q)) return false;
      }
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterType !== "all" && p.projectType !== filterType) return false;
      if (filterClient !== "all" && p.clientId !== filterClient) return false;
      return true;
    });
    return sortProjects(result, sortKey);
  }, [projects, search, filterStatus, filterType, filterClient, sortKey]);

  const handleCreated = (id: string) => {
    toast.success("Projet créé");
    mutate();
    router.push(`/projets/${id}`);
  };

  // Error classification
  const errorVariant = loadError ? detectErrorVariant(loadError) : null;
  const isCriticalError = errorVariant === "migration" || errorVariant === "database";

  // Full-screen error for migration / database errors
  if (loadError && isCriticalError && !loading) {
    return (
      <DatabaseError
        variant={errorVariant!}
        message={loadError}
        migrationFile={errorVariant === "migration" ? "supabase/migrations/028_projects_system.sql" : undefined}
        onRetry={mutate}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAF9]">
      <div className="max-w-[1400px] mx-auto px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-[#191919]">Projets</h1>
            <p className="text-[13px] text-[#8A8A88] mt-0.5">Votre espace de travail créatif</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Nouveau projet
          </button>
        </div>

        {/* Non-critical error banner */}
        {loadError && !isCriticalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-[12px] text-red-600">{loadError}</p>
            <button onClick={mutate} className="mt-1 text-[12px] text-red-500 hover:underline cursor-pointer">Réessayer</button>
          </div>
        )}

        {/* Stats */}
        {!loading && projects && projects.length > 0 && <StatsBar projects={projects} />}

        {/* Toolbar */}
        <div className="flex items-center gap-2.5 mb-6 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBB]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Rechercher..." className="w-full bg-white border border-[#E6E6E4] rounded-lg pl-9 pr-3 py-2 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <select className="bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#5A5A58] focus:outline-none cursor-pointer" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous statuts</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>

          <select className="bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#5A5A58] focus:outline-none cursor-pointer" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Tous types</option>
            {PROJECT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
          </select>

          {projectClients.length > 0 && (
            <select className="bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#5A5A58] focus:outline-none cursor-pointer" value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
              <option value="all">Tous clients</option>
              {projectClients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}

          <select className="bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#5A5A58] focus:outline-none cursor-pointer" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="recent">Récents</option>
            <option value="name">Nom A-Z</option>
            <option value="budget">Budget ↓</option>
            <option value="status">Statut</option>
          </select>

          <div className="flex items-center bg-white border border-[#E6E6E4] rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-[#EEF2FF] text-[#4F46E5]" : "text-[#8A8A88] hover:text-[#5A5A58]"}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
            </button>
            <button onClick={() => setViewMode("list")} className={`p-2 transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#EEF2FF] text-[#4F46E5]" : "text-[#8A8A88] hover:text-[#5A5A58]"}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden animate-pulse">
                <div className="h-1.5 bg-[#E6E6E4]" />
                <div className="h-28 bg-[#F7F7F5]" />
                <div className="p-4 space-y-2.5"><div className="h-4 bg-[#F7F7F5] rounded w-3/4" /><div className="h-3 bg-[#F7F7F5] rounded w-1/2" /><div className="h-3 bg-[#F7F7F5] rounded w-1/3" /></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !isCriticalError && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
            </div>
            <h3 className="text-[16px] font-semibold text-[#191919] mb-1">
              {search || filterStatus !== "all" || filterType !== "all" || filterClient !== "all" ? "Aucun résultat" : "Aucun projet"}
            </h3>
            <p className="text-[13px] text-[#8A8A88] mb-4 text-center max-w-xs">
              {search || filterStatus !== "all" || filterType !== "all" || filterClient !== "all"
                ? "Essayez de modifier vos filtres"
                : "Créez votre premier projet pour organiser votre travail créatif"}
            </p>
            {!search && filterStatus === "all" && filterType === "all" && (
              <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer">
                Créer mon premier projet
              </button>
            )}
          </motion.div>
        )}

        {/* Grid view */}
        {!loading && filtered.length > 0 && viewMode === "grid" && (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <ProjectCard key={p.id} project={p} onClick={() => router.push(`/projets/${p.id}`)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* List view */}
        {!loading && filtered.length > 0 && viewMode === "list" && (
          <div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden">
            {filtered.map((p, i) => {
              const typeInfo = PROJECT_TYPES.find((t) => t.value === p.projectType);
              const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.draft;
              return (
                <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => router.push(`/projets/${p.id}`)}
                  className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-[#FBFBFA] transition-colors ${i > 0 ? "border-t border-[#EFEFEF]" : ""}`}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#191919] truncate">{p.name}</div>
                    <div className="text-[11px] text-[#8A8A88] truncate mt-0.5">
                      {typeInfo?.icon} {typeInfo?.label}{p.clientName ? ` · ${p.clientName}` : ""}
                    </div>
                  </div>
                  {p.deadline && (
                    <span className="flex-shrink-0 text-[11px] text-[#8A8A88]">
                      {new Date(p.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                    {statusCfg.label}
                  </span>
                  {p.budget > 0 && (
                    <span className="flex-shrink-0 text-[12px] font-semibold text-[#191919] w-16 text-right">{p.budget.toLocaleString("fr-FR")}€</span>
                  )}
                  <span className="flex-shrink-0 text-[11px] text-[#8A8A88] w-16 text-right">
                    {p.itemsCount} item{p.itemsCount !== 1 ? "s" : ""}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateProjectModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} clients={clientOptions} />
    </div>
  );
}
