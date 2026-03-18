"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import DatabaseError, { detectErrorVariant } from "@/components/ui/DatabaseError";
import type { Project, ProjectFolder, ProjectItem, ProjectItemType, ProjectStatus, ProjectPriority } from "@/types";

/* ─── Constants ──────────────────────────────────────────── */

const STATUS_CONFIG: Record<ProjectStatus, { label: string; bg: string; text: string; dot: string }> = {
  draft: { label: "Brouillon", bg: "bg-[#F7F7F5]", text: "text-[#8A8A88]", dot: "bg-[#8A8A88]" },
  in_progress: { label: "En cours", bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  review: { label: "Review", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  completed: { label: "Terminé", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  archived: { label: "Archivé", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
};

const PRIORITY_CONFIG: Record<ProjectPriority, { label: string; color: string }> = {
  low: { label: "Basse", color: "#8A8A88" },
  normal: { label: "Normale", color: "#3B82F6" },
  high: { label: "Haute", color: "#F59E0B" },
  urgent: { label: "Urgente", color: "#EF4444" },
};

const ITEM_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  image: { label: "Image", icon: "🖼️", color: "#EC4899" },
  file: { label: "Document", icon: "📄", color: "#8B5CF6" },
  video: { label: "Vidéo", icon: "🎬", color: "#EF4444" },
  note: { label: "Note", icon: "📝", color: "#F59E0B" },
  // Legacy types — mapped for backward compat
  link: { label: "Vidéo", icon: "🎬", color: "#EF4444" },
  embed: { label: "Vidéo", icon: "🎬", color: "#EF4444" },
  reference: { label: "Document", icon: "📄", color: "#8B5CF6" },
  moodboard: { label: "Note", icon: "📝", color: "#F59E0B" },
};

const FOLDER_COLORS = ["#8A8A88", "#4F46E5", "#EC4899", "#EF4444", "#F59E0B", "#10B981", "#06B6D4", "#8B5CF6"];
const COLOR_PALETTE = ["#4F46E5", "#7C3AED", "#EC4899", "#EF4444", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6", "#F97316", "#14B8A6", "#6366F1", "#E11D48", "#0EA5E9"];

/* ─── API response type ──────────────────────────────────── */
interface ProjectDetailResponse {
  project: Project & {
    client?: { id: string; name: string; email: string; company?: string; phone?: string } | null;
    briefTemplateId?: string;
    briefTemplate?: { id: string; name: string; schema: any } | null;
    portfolioImages?: string[];
    portfolioCategory?: string;
    portfolioExternalUrl?: string;
    shareEnabled?: boolean;
  };
  folders: ProjectFolder[];
  items: ProjectItem[];
}

/* ─── Sortable Item Card (Moodboard style) ──────────────── */
function SortableItemCard({ item, isSelected, onSelect, onEdit, onDelete, onPin, onMove, selectMode, onPreview }: {
  item: ProjectItem; isSelected: boolean; onSelect: () => void; onEdit: () => void;
  onDelete: () => void; onPin: () => void; onMove: () => void; selectMode: boolean;
  onPreview?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 50 : "auto" as const };
  const cfg = ITEM_TYPE_CONFIG[item.itemType] || ITEM_TYPE_CONFIG.note;
  const isImage = item.itemType === "image";
  const isDocument = item.itemType === "file" || item.itemType === "reference";
  const isVideo = item.itemType === "video" || item.itemType === "link" || item.itemType === "embed";
  const isNote = item.itemType === "note" || item.itemType === "moodboard";
  const isMedia = isImage; // Only images have visual preview from upload
  const isLink = isVideo; // Videos are link-based
  const isYouTube = item.url && /youtube\.com|youtu\.be/.test(item.url);
  const isVimeo = item.url && /vimeo\.com/.test(item.url);
  const isLoom = item.url && /loom\.com/.test(item.url);

  const getYouTubeId = (url: string) => {
    const m = url.match(/(?:youtu\.be\/|v=)([^&\s]+)/);
    return m?.[1] || null;
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}
      className={`group bg-white rounded-xl border transition-all overflow-hidden break-inside-avoid mb-3 ${isDragging ? "shadow-xl scale-[1.02]" : ""} ${isSelected ? "border-[#4F46E5] ring-2 ring-[#4F46E5]/20" : "border-[#E6E6E4] hover:shadow-md"}`}
    >
      {/* Image/Video preview — full width, auto height */}
      {isMedia && (item.thumbnailUrl || item.url) && (
        <div className="relative cursor-pointer" onClick={onPreview}>
          <img
            src={item.thumbnailUrl || item.url || ""}
            alt={item.title}
            className="w-full object-cover"
            loading="lazy"
            style={{ minHeight: "80px", maxHeight: "400px" }}
          />
          {item.itemType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg"><svg width="18" height="18" viewBox="0 0 24 24" fill="#1A1A1A"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
            </div>
          )}
          {/* Overlay actions on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {selectMode && (
              <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="p-1.5 rounded-lg bg-white/90 shadow-sm cursor-pointer">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? "bg-[#4F46E5] border-[#4F46E5]" : "border-[#999] bg-white"}`}>
                  {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
              </button>
            )}
            <div {...listeners} className="p-1.5 rounded-lg bg-white/90 shadow-sm cursor-grab active:cursor-grabbing">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#666"><circle cx="8" cy="4" r="2"/><circle cx="16" cy="4" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="20" r="2"/><circle cx="16" cy="20" r="2"/></svg>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onPreview?.(); }} className="p-1.5 rounded-lg bg-white/90 shadow-sm text-[#666] hover:text-[#1A1A1A] cursor-pointer" title="Agrandir">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onMove(); }} className="p-1.5 rounded-lg bg-white/90 shadow-sm text-[#666] hover:text-[#1A1A1A] cursor-pointer" title="Déplacer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-lg bg-white/90 shadow-sm text-[#666] hover:text-[#1A1A1A] cursor-pointer" title="Modifier"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-lg bg-white/90 shadow-sm text-[#666] hover:text-red-500 cursor-pointer" title="Supprimer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
          </div>
          {item.isPinned && <div className="absolute top-2 left-2"><span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-semibold shadow-sm">Épinglé</span></div>}
        </div>
      )}

      {/* YouTube embed preview */}
      {isLink && isYouTube && item.url && (
        <div className="relative aspect-video bg-black cursor-pointer" onClick={onPreview}>
          <img src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/hqdefault.jpg`} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg></div>
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div {...listeners} className="p-1.5 rounded-lg bg-white/90 shadow-sm cursor-grab active:cursor-grabbing">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#666"><circle cx="8" cy="4" r="2"/><circle cx="16" cy="4" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="20" r="2"/><circle cx="16" cy="20" r="2"/></svg>
            </div>
          </div>
        </div>
      )}

      {/* Video (Vimeo/Loom — no YouTube, handled above) */}
      {isVideo && !isYouTube && (
        <div className="relative p-4 bg-gradient-to-br from-red-50 to-orange-50 cursor-pointer" onClick={onPreview}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">{isVimeo ? "Vimeo" : isLoom ? "Loom" : "Vidéo"}</span>
              {item.url && <p className="text-[11px] text-[#5A5A58] truncate mt-0.5">{(() => { try { return new URL(item.url).hostname; } catch { return ""; } })()}</p>}
            </div>
          </div>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div {...listeners} className="p-1 rounded-lg bg-white/80 shadow-sm cursor-grab"><svg width="10" height="10" viewBox="0 0 24 24" fill="#999"><circle cx="8" cy="4" r="2"/><circle cx="16" cy="4" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="20" r="2"/><circle cx="16" cy="20" r="2"/></svg></div>
            <button onClick={(e) => { e.stopPropagation(); onMove(); }} className="p-1 rounded-lg bg-white/80 shadow-sm text-[#999] hover:text-[#1A1A1A] cursor-pointer" title="Déplacer"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 rounded-lg bg-white/80 shadow-sm text-[#999] hover:text-[#1A1A1A] cursor-pointer" title="Modifier"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded-lg bg-white/80 shadow-sm text-[#999] hover:text-red-500 cursor-pointer" title="Supprimer"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
          {item.isPinned && <div className="absolute top-2 left-2"><span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-semibold shadow-sm">Épinglé</span></div>}
        </div>
      )}

      {/* Document card */}
      {isDocument && (
        <div className="relative p-4">
          {selectMode && (
            <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="absolute top-2 right-2 p-1 cursor-pointer z-10">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? "bg-[#4F46E5] border-[#4F46E5]" : "border-[#D0D0CE]"}`}>
                {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
            </button>
          )}
          <div className="flex items-center gap-3">
            <div {...listeners} className="p-1 cursor-grab active:cursor-grabbing text-[#D0D0CE] hover:text-[#8A8A88] shrink-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="4" r="2"/><circle cx="16" cy="4" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="20" r="2"/><circle cx="16" cy="20" r="2"/></svg>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-semibold text-[#1A1A1A] truncate">{item.title || "Document"}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                {item.mimeType && <span className="text-[10px] font-medium text-[#8B5CF6] bg-purple-50 px-1.5 py-0.5 rounded">{item.mimeType.split("/").pop()?.toUpperCase()}</span>}
                {item.fileSize ? <span className="text-[10px] text-[#8A8A88]">{(item.fileSize / 1024 / 1024).toFixed(1)} Mo</span> : null}
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg text-[#8B5CF6] hover:bg-purple-50 cursor-pointer" title="Ouvrir">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              )}
              <button onClick={(e) => { e.stopPropagation(); onMove(); }} className="p-1 rounded hover:bg-[#F7F7F5] text-[#BBB] hover:text-[#5A5A58] cursor-pointer" title="Déplacer"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></button>
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 rounded hover:bg-[#F7F7F5] text-[#BBB] hover:text-[#5A5A58] cursor-pointer" title="Modifier"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded hover:bg-red-50 text-[#BBB] hover:text-red-500 cursor-pointer" title="Supprimer"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
          </div>
          {item.isPinned && <div className="absolute top-2 left-2"><span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-semibold">Épinglé</span></div>}
        </div>
      )}

      {/* Note card */}
      {isNote && (
        <div className="relative">
          {selectMode && (
            <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="absolute top-2 right-2 p-1 cursor-pointer z-10">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isSelected ? "bg-[#4F46E5] border-[#4F46E5]" : "border-[#D0D0CE]"}`}>
                {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
            </button>
          )}
          <div className="flex items-center gap-2 px-3 pt-3">
            <div {...listeners} className="p-1 cursor-grab active:cursor-grabbing text-[#D0D0CE] hover:text-[#8A8A88]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="4" r="2"/><circle cx="16" cy="4" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="20" r="2"/><circle cx="16" cy="20" r="2"/></svg>
            </div>
            <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
              <span className="text-xs">📝</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#F59E0B]">Note</span>
            {item.isPinned && <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-semibold ml-auto">Épinglé</span>}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-[13px] font-semibold text-[#1A1A1A] line-clamp-2 flex-1">{item.title || "Sans titre"}</h4>
          {/* Actions for non-image items (images have overlay actions) */}
          {!isImage && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button onClick={onPin} className="p-1 rounded hover:bg-amber-50 text-[#BBB] hover:text-amber-500 cursor-pointer" title={item.isPinned ? "Désépingler" : "Épingler"}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill={item.isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 17v5M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z" /></svg>
              </button>
              <button onClick={onMove} className="p-1 rounded hover:bg-[#F7F7F5] text-[#BBB] hover:text-[#5A5A58] cursor-pointer"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></button>
              <button onClick={onEdit} className="p-1 rounded hover:bg-[#F7F7F5] text-[#BBB] hover:text-[#5A5A58] cursor-pointer"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
              <button onClick={onDelete} className="p-1 rounded hover:bg-red-50 text-[#BBB] hover:text-red-500 cursor-pointer"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
            </div>
          )}
        </div>
        {item.description && <p className="text-[11px] text-[#8A8A88] line-clamp-2 mb-1.5">{item.description}</p>}
        {isNote && item.content && (
          <div className="text-[12px] text-[#5A5A58] line-clamp-5 whitespace-pre-wrap bg-amber-50/40 rounded-lg p-3 mt-1 leading-relaxed border border-amber-100/50"
            dangerouslySetInnerHTML={{ __html: simpleMarkdown(item.content) }}
          />
        )}
        {item.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {item.tags.slice(0, 3).map((t) => <span key={t} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#F7F7F5] text-[#5A5A58]">{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Lightbox ──────────────────────────────────────────── */
function Lightbox({ items, currentId, onClose, onNavigate }: {
  items: ProjectItem[];
  currentId: string;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const current = items.find(i => i.id === currentId);
  if (!current) return null;

  const mediaItems = items.filter(i => (i.itemType === "image" || i.itemType === "video") && (i.thumbnailUrl || i.url));
  const currentIdx = mediaItems.findIndex(i => i.id === currentId);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < mediaItems.length - 1;

  const isYouTube = current.url && /youtube\.com|youtu\.be/.test(current.url);
  const ytId = current.url?.match(/(?:youtu\.be\/|v=)([^&\s]+)/)?.[1];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(mediaItems[currentIdx - 1].id);
      if (e.key === "ArrowRight" && hasNext) onNavigate(mediaItems[currentIdx + 1].id);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentId, hasPrev, hasNext]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer z-10">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>

      {/* Counter */}
      {mediaItems.length > 1 && (
        <div className="absolute top-4 left-4 text-[13px] text-white/60 font-medium">
          {currentIdx + 1} / {mediaItems.length}
        </div>
      )}

      {/* Prev */}
      {hasPrev && (
        <button onClick={(e) => { e.stopPropagation(); onNavigate(mediaItems[currentIdx - 1].id); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button onClick={(e) => { e.stopPropagation(); onNavigate(mediaItems[currentIdx + 1].id); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}

      {/* Image */}
      <div onClick={(e) => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh] flex flex-col items-center">
        {isYouTube && ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
            className="w-[80vw] max-w-[960px] aspect-video rounded-xl"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <img
            src={current.thumbnailUrl || current.url || ""}
            alt={current.title}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        )}
        {(current.title || current.description) && (
          <div className="mt-3 text-center max-w-lg">
            {current.title && <p className="text-[14px] font-medium text-white">{current.title}</p>}
            {current.description && <p className="text-[12px] text-white/60 mt-0.5">{current.description}</p>}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Simple Markdown renderer ───────────────────────────── */
function simpleMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-[#F7F7F5] px-1 rounded text-[#4F46E5]">$1</code>')
    .replace(/^### (.+)$/gm, '<span class="text-[12px] font-bold text-[#1A1A1A] block mt-2">$1</span>')
    .replace(/^## (.+)$/gm, '<span class="text-[13px] font-bold text-[#1A1A1A] block mt-2">$1</span>')
    .replace(/^# (.+)$/gm, '<span class="text-[14px] font-bold text-[#1A1A1A] block mt-2">$1</span>')
    .replace(/^- (.+)$/gm, '<span class="block pl-3">• $1</span>')
    .replace(/\n/g, "<br/>");
}

/* ─── Folder Card ────────────────────────────────────────── */
function FolderCard({ folder, itemCount, onOpen, onRename, onDelete }: { folder: ProjectFolder; itemCount: number; onOpen: () => void; onRename: () => void; onDelete: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="group bg-white rounded-xl border border-[#E6E6E4] hover:border-[#D0D0CE] hover:shadow-sm transition-all cursor-pointer p-4"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${folder.color}15` }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={folder.color} strokeWidth="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onRename(); }} className="p-1 rounded hover:bg-[#F7F7F5] text-[#BBB] hover:text-[#5A5A58] cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded hover:bg-red-50 text-[#BBB] hover:text-red-500 cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
        </div>
      </div>
      <h4 className="text-[13px] font-semibold text-[#1A1A1A] mb-1 truncate">{folder.name}</h4>
      <span className="text-[11px] text-[#8A8A88]">{itemCount} élément{itemCount !== 1 ? "s" : ""}</span>
    </motion.div>
  );
}

/* ─── Add Item Modal — 4 dedicated flows ─────────────────── */
function AddItemModal({ open, folderId, projectId, folders, onClose, onCreated }: { open: boolean; folderId: string | null; projectId: string; folders: ProjectFolder[]; onClose: () => void; onCreated: () => void }) {
  type AddMode = "menu" | "video" | "note" | "folder";
  const [mode, setMode] = useState<AddMode>("menu");
  const [form, setForm] = useState({ title: "", description: "", content: "", url: "", tags: "", targetFolderId: folderId || "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [videoPreview, setVideoPreview] = useState<{ provider: string; thumb: string } | null>(null);

  const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2.5 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20";

  const resetAndClose = () => {
    setMode("menu");
    setForm({ title: "", description: "", content: "", url: "", tags: "", targetFolderId: "" });
    setError("");
    setVideoPreview(null);
    onClose();
  };

  // Video URL detection
  const detectVideo = (url: string) => {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) return { provider: "YouTube", thumb: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` };
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return { provider: "Vimeo", thumb: "" };
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (loomMatch) return { provider: "Loom", thumb: "" };
    return null;
  };

  const handleVideoUrlChange = (url: string) => {
    setForm(f => ({ ...f, url }));
    const preview = detectVideo(url);
    setVideoPreview(preview);
    if (preview && !form.title) {
      setForm(f => ({ ...f, title: `Vidéo ${preview.provider}` }));
    }
  };

  const handleSubmitVideo = async () => {
    if (!form.url.trim()) { setError("Collez un lien vidéo"); return; }
    const preview = detectVideo(form.url);
    if (!preview) { setError("Lien non supporté. Utilisez YouTube, Vimeo ou Loom."); return; }
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/projects/${projectId}/items`, {
        body: {
          itemType: "video",
          folderId: form.targetFolderId || folderId || null,
          title: form.title || `Vidéo ${preview.provider}`,
          description: form.description,
          content: "",
          url: form.url.trim(),
          thumbnailUrl: preview.thumb || undefined,
          tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        },
      });
      onCreated();
      resetAndClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setSaving(false); }
  };

  const handleSubmitNote = async () => {
    if (!form.content.trim() && !form.title.trim()) { setError("Écrivez quelque chose"); return; }
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/projects/${projectId}/items`, {
        body: {
          itemType: "note",
          folderId: form.targetFolderId || folderId || null,
          title: form.title || "Note",
          description: form.description,
          content: form.content,
          tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        },
      });
      onCreated();
      resetAndClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setSaving(false); }
  };

  const handleSubmitFolder = async () => {
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/projects/${projectId}/items`, {
        body: {
          itemType: "folder",
          title: form.title || "Nouveau dossier",
          parentId: folderId || null,
        },
      });
      onCreated();
      resetAndClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetAndClose} />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <h3 className="text-[16px] font-bold text-[#1A1A1A]">
                  {mode === "menu" ? "Ajouter du contenu" : mode === "video" ? "Ajouter une vidéo" : mode === "note" ? "Ajouter une note" : "Nouveau dossier"}
                </h3>
                <button onClick={resetAndClose} className="p-1.5 rounded-lg hover:bg-[#F7F7F5] cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              {error && <div className="mx-6 mb-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-600">{error}</div>}

              {/* ── MENU ── */}
              {mode === "menu" && (
                <div className="px-6 pb-6">
                  <p className="text-[12px] text-[#8A8A88] mb-4">Choisissez le type de contenu à ajouter.</p>
                  <div className="space-y-2">
                    <button onClick={() => {
                      // Image: direct file picker (no modal step)
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.multiple = true;
                      input.onchange = async () => {
                        const files = Array.from(input.files || []);
                        if (files.length === 0) return;
                        resetAndClose();
                        // Use the multi-upload handler from parent (will be called via onCreated pattern)
                        for (const file of files) {
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch(`/api/projects/${projectId}/upload`, { method: "POST", body: fd });
                            const data = await res.json();
                            if (!res.ok) continue;
                            await apiFetch(`/api/projects/${projectId}/items`, {
                              body: {
                                itemType: "image",
                                folderId: folderId || null,
                                title: file.name.replace(/\.[^.]+$/, ""),
                                description: "",
                                content: "",
                                url: data.url,
                                thumbnailUrl: data.url,
                                filePath: data.path,
                                fileSize: data.size,
                                mimeType: data.type,
                                tags: [],
                              },
                            });
                          } catch { /* skip */ }
                        }
                        onCreated();
                      };
                      input.click();
                    }} className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#E6E6E4] hover:border-[#EC4899]/30 hover:bg-pink-50/30 transition-all cursor-pointer text-left">
                      <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-lg shrink-0">🖼️</div>
                      <div>
                        <span className="text-[14px] font-semibold text-[#1A1A1A] block">Image</span>
                        <span className="text-[12px] text-[#8A8A88]">Upload photo, maquette, inspiration</span>
                      </div>
                    </button>

                    <button onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";
                      input.multiple = true;
                      input.onchange = async () => {
                        const files = Array.from(input.files || []);
                        if (files.length === 0) return;
                        resetAndClose();
                        for (const file of files) {
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch(`/api/projects/${projectId}/upload`, { method: "POST", body: fd });
                            const data = await res.json();
                            if (!res.ok) continue;
                            await apiFetch(`/api/projects/${projectId}/items`, {
                              body: {
                                itemType: "file",
                                folderId: folderId || null,
                                title: file.name.replace(/\.[^.]+$/, ""),
                                description: "",
                                content: "",
                                url: data.url,
                                filePath: data.path,
                                fileSize: data.size,
                                mimeType: data.type,
                                tags: [],
                              },
                            });
                          } catch { /* skip */ }
                        }
                        onCreated();
                      };
                      input.click();
                    }} className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#E6E6E4] hover:border-[#8B5CF6]/30 hover:bg-purple-50/30 transition-all cursor-pointer text-left">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg shrink-0">📄</div>
                      <div>
                        <span className="text-[14px] font-semibold text-[#1A1A1A] block">Document</span>
                        <span className="text-[12px] text-[#8A8A88]">Upload PDF, document de référence</span>
                      </div>
                    </button>

                    <button onClick={() => setMode("video")} className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#E6E6E4] hover:border-[#EF4444]/30 hover:bg-red-50/30 transition-all cursor-pointer text-left">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-lg shrink-0">🎬</div>
                      <div>
                        <span className="text-[14px] font-semibold text-[#1A1A1A] block">Vidéo</span>
                        <span className="text-[12px] text-[#8A8A88]">Lien YouTube, Vimeo ou Loom</span>
                      </div>
                    </button>

                    <button onClick={() => setMode("note")} className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#E6E6E4] hover:border-[#F59E0B]/30 hover:bg-amber-50/30 transition-all cursor-pointer text-left">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg shrink-0">📝</div>
                      <div>
                        <span className="text-[14px] font-semibold text-[#1A1A1A] block">Note</span>
                        <span className="text-[12px] text-[#8A8A88]">Texte libre, idée, brief</span>
                      </div>
                    </button>

                    <button onClick={() => setMode("folder")} className="w-full flex items-center gap-4 p-3 rounded-xl border border-dashed border-[#E6E6E4] hover:border-[#D0D0CE] hover:bg-[#FAFAF9] transition-all cursor-pointer text-left">
                      <div className="w-8 h-8 rounded-lg bg-[#F7F7F5] flex items-center justify-center text-base shrink-0">📁</div>
                      <span className="text-[13px] font-medium text-[#5A5A58]">Nouveau dossier</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── VIDEO FLOW ── */}
              {mode === "video" && (
                <div className="px-6 pb-6 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Lien vidéo</label>
                    <input className={inputClass} placeholder="https://youtube.com/watch?v=..." value={form.url} onChange={(e) => handleVideoUrlChange(e.target.value)} autoFocus />
                    <p className="text-[11px] text-[#B0B0AE] mt-1">YouTube, Vimeo ou Loom supportés</p>
                  </div>
                  {videoPreview && (
                    <div className="rounded-xl border border-[#E6E6E4] overflow-hidden">
                      {videoPreview.thumb && <img src={videoPreview.thumb} alt="" className="w-full h-32 object-cover" />}
                      <div className="px-3 py-2 bg-[#FAFAF9]">
                        <span className="text-[11px] font-semibold text-emerald-600">{videoPreview.provider} détecté</span>
                      </div>
                    </div>
                  )}
                  <input className={inputClass} placeholder="Titre (optionnel)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <input className={inputClass} placeholder="Description (optionnel)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={() => { setMode("menu"); setError(""); setVideoPreview(null); }} className="px-3 py-2 text-[13px] text-[#5A5A58] hover:bg-[#F7F7F5] rounded-lg cursor-pointer">Retour</button>
                    <button onClick={handleSubmitVideo} disabled={saving || !form.url.trim()} className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg disabled:opacity-50 cursor-pointer">{saving ? "..." : "Ajouter la vidéo"}</button>
                  </div>
                </div>
              )}

              {/* ── NOTE FLOW ── */}
              {mode === "note" && (
                <div className="px-6 pb-6 space-y-3">
                  <input className={inputClass} placeholder="Titre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
                  <textarea className={`${inputClass} resize-none`} rows={6} placeholder="Écrivez votre note ici..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                  <input className={inputClass} placeholder="Tags (virgules)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={() => { setMode("menu"); setError(""); }} className="px-3 py-2 text-[13px] text-[#5A5A58] hover:bg-[#F7F7F5] rounded-lg cursor-pointer">Retour</button>
                    <button onClick={handleSubmitNote} disabled={saving} className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg disabled:opacity-50 cursor-pointer">{saving ? "..." : "Ajouter la note"}</button>
                  </div>
                </div>
              )}

              {/* ── FOLDER FLOW ── */}
              {mode === "folder" && (
                <div className="px-6 pb-6 space-y-3">
                  <input className={inputClass} placeholder="Nom du dossier" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={() => { setMode("menu"); setError(""); }} className="px-3 py-2 text-[13px] text-[#5A5A58] hover:bg-[#F7F7F5] rounded-lg cursor-pointer">Retour</button>
                    <button onClick={handleSubmitFolder} disabled={saving} className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg disabled:opacity-50 cursor-pointer">{saving ? "..." : "Créer le dossier"}</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function isLinkType(t: string) { return ["link", "embed", "reference", "video"].includes(t); }

/* ─── Edit Item Slide Panel (with upload + rich text) ────── */
function EditItemPanel({ item, projectId, open, onClose, onSaved }: { item: ProjectItem | null; projectId: string; open: boolean; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialized, setInitialized] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (item && initialized !== item.id) {
    setTitle(item.title);
    setDescription(item.description);
    setContent(item.content);
    setUrl(item.url || "");
    setTags(item.tags.join(", "));
    setInitialized(item.id);
    setError("");
  }

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/projects/${projectId}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUrl(data.url);
    } catch (err: any) {
      setError(err?.message || "Erreur d'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/projects/${projectId}/items/${item.id}`, {
        method: "PATCH",
        body: {
          title, description, content,
          url: url || undefined,
          thumbnailUrl: ["image", "video"].includes(item.itemType) ? url || undefined : undefined,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        },
      });
      onSaved();
      onClose();
      setInitialized(null);
    } catch (err: any) {
      setError(err?.message || "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2.5 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20";
  const cfg = item ? (ITEM_TYPE_CONFIG[item.itemType] || ITEM_TYPE_CONFIG.note) : ITEM_TYPE_CONFIG.note;
  const needsUpload = item && ["image", "video", "file"].includes(item.itemType);

  return (
    <AnimatePresence>
      {open && item && (
        <>
          <motion.div className="fixed inset-0 bg-black/10 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { onClose(); setInitialized(null); }} />
          <motion.div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-xl"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E6E4]">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cfg.icon}</span>
                <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Modifier — {cfg.label}</h2>
              </div>
              <button onClick={() => { onClose(); setInitialized(null); }} className="p-1.5 rounded-lg hover:bg-[#F7F7F5] cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-600">{error}</div>}

              <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Titre</label><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} /></div>

              {/* Upload for media/file items */}
              {needsUpload && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Fichier</label>
                  <input ref={fileInputRef} type="file" className="hidden"
                    accept={item.itemType === "image" ? "image/*" : item.itemType === "video" ? "video/*" : "*"}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                  />
                  {url && item.itemType === "image" && (
                    <div className="rounded-lg overflow-hidden border border-[#E6E6E4] mb-2">
                      <img src={url} alt={title} className="w-full h-40 object-cover" />
                    </div>
                  )}
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="w-full px-3 py-2 text-[12px] font-medium text-[#5A5A58] bg-[#F7F7F5] hover:bg-[#EFEFEF] rounded-lg border border-[#E6E6E4] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? "Envoi en cours..." : url ? "Remplacer le fichier" : "Uploader un fichier"}
                  </button>
                </div>
              )}

              {(isLinkType(item.itemType) || needsUpload) && (
                <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">URL</label><input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} /></div>
              )}

              {(item.itemType === "note" || item.itemType === "moodboard") && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">
                    Contenu <span className="text-[#BBB] font-normal">(Markdown: **gras**, *italique*, # titre)</span>
                  </label>
                  <textarea className={`${inputClass} resize-none font-mono`} rows={12} value={content} onChange={(e) => setContent(e.target.value)} />
                  {/* Live preview */}
                  {content && (
                    <div className="mt-2 p-3 bg-[#FAFAF9] rounded-lg border border-[#EFEFEF]">
                      <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-2">Aperçu</div>
                      <div className="text-[12px] text-[#1A1A1A] leading-relaxed" dangerouslySetInnerHTML={{ __html: simpleMarkdown(content) }} />
                    </div>
                  )}
                </div>
              )}

              <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Description</label><textarea className={`${inputClass} resize-none`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
              <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Tags</label><input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Séparés par des virgules" /></div>

              {/* Preview for non-upload media */}
              {!needsUpload && (item.itemType === "image" || item.itemType === "video") && (item.thumbnailUrl || item.url) && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Aperçu</label>
                  <div className="rounded-lg overflow-hidden border border-[#E6E6E4]"><img src={item.thumbnailUrl || item.url || ""} alt={title} className="w-full h-40 object-cover" /></div>
                </div>
              )}

              <div className="pt-2 border-t border-[#EFEFEF]">
                <div className="text-[11px] text-[#8A8A88] space-y-1">
                  <p>Créé le {new Date(item.createdAt).toLocaleDateString("fr-FR")}</p>
                  <p>Modifié le {new Date(item.updatedAt).toLocaleDateString("fr-FR")}</p>
                  {item.fileSize && <p>Taille: {(item.fileSize / 1024 / 1024).toFixed(1)} Mo</p>}
                </div>
              </div>

              <button onClick={handleSave} disabled={saving} className="w-full px-4 py-2.5 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg disabled:opacity-50 cursor-pointer">
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Edit Project Panel (V3 — with brief, portfolio, share) ── */
function EditProjectPanel({ project, open, onClose, onSaved, clients, briefTemplates }: {
  project: ProjectDetailResponse["project"]; open: boolean; onClose: () => void; onSaved: () => void;
  clients: { id: string; name: string; company?: string }[];
  briefTemplates: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority || "normal",
    budget: String(project.budget || ""),
    tags: project.tags.join(", "),
    clientId: project.clientId || "",
    deadline: project.deadline ? project.deadline.split("T")[0] : "",
    startDate: project.startDate ? project.startDate.split("T")[0] : "",
    color: project.color,
    isPortfolio: project.isPortfolio,
    portfolioDescription: project.portfolioDescription || "",
    portfolioCategory: project.portfolioCategory || "",
    portfolioExternalUrl: project.portfolioExternalUrl || "",
    briefTemplateId: project.briefTemplateId || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Le nom est requis"); return; }
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        body: {
          name: form.name.trim(),
          description: form.description,
          status: form.status,
          priority: form.priority,
          budget: Number(form.budget) || 0,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          clientId: form.clientId || null,
          deadline: form.deadline || null,
          startDate: form.startDate || null,
          color: form.color,
          isPortfolio: form.isPortfolio,
          portfolioDescription: form.portfolioDescription,
          portfolioCategory: form.portfolioCategory,
          portfolioExternalUrl: form.portfolioExternalUrl || null,
          briefTemplateId: form.briefTemplateId || null,
        },
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2.5 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/10 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-xl"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E6E4]">
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Modifier le projet</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F7F7F5] cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-600">{error}</div>}

              <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Nom *</label><input className={inputClass} value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(""); }} /></div>
              <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Description</label><textarea className={`${inputClass} resize-none`} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Statut</label><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>{Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
                <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Priorité</label><select className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as ProjectPriority })}>{Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Budget (€)</label><input className={inputClass} type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
                <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Client</label><select className={inputClass} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}><option value="">Aucun</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ""}</option>)}</select></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Début</label><input className={inputClass} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Deadline</label><input className={inputClass} type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
              </div>

              <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Tags</label><input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Virgules" /></div>

              <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Couleur</label><div className="flex items-center gap-1.5 flex-wrap">{COLOR_PALETTE.map((c) => <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={`w-6 h-6 rounded-full cursor-pointer transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-[#4F46E5] scale-110" : "hover:scale-110"}`} style={{ backgroundColor: c }} />)}</div></div>

              {/* Brief template */}
              <div className="border border-[#E6E6E4] rounded-xl p-4">
                <h4 className="text-[13px] font-semibold text-[#1A1A1A] mb-1">Brief associé</h4>
                <p className="text-[11px] text-[#8A8A88] mb-2">Lier un questionnaire brief à ce projet</p>
                <select className={inputClass} value={form.briefTemplateId} onChange={(e) => setForm({ ...form, briefTemplateId: e.target.value })}>
                  <option value="">Aucun brief</option>
                  {briefTemplates.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              {/* Portfolio */}
              <div className="border border-[#E6E6E4] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div><h4 className="text-[13px] font-semibold text-[#1A1A1A]">Publier en portfolio</h4><p className="text-[11px] text-[#8A8A88]">Visible sur votre site public</p></div>
                  <button onClick={() => setForm({ ...form, isPortfolio: !form.isPortfolio })} className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${form.isPortfolio ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-1 ${form.isPortfolio ? "translate-x-4" : ""}`} />
                  </button>
                </div>
                {form.isPortfolio && (
                  <div className="space-y-3 mt-3">
                    <textarea className={`${inputClass} resize-none`} rows={3} placeholder="Description publique du projet..." value={form.portfolioDescription} onChange={(e) => setForm({ ...form, portfolioDescription: e.target.value })} />
                    <input className={inputClass} placeholder="Catégorie (ex: Branding, Web Design...)" value={form.portfolioCategory} onChange={(e) => setForm({ ...form, portfolioCategory: e.target.value })} />
                    <input className={inputClass} placeholder="Lien externe (case study, Behance...)" value={form.portfolioExternalUrl} onChange={(e) => setForm({ ...form, portfolioExternalUrl: e.target.value })} />
                  </div>
                )}
              </div>

              <button onClick={handleSave} disabled={saving} className="w-full px-4 py-2.5 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg disabled:opacity-50 cursor-pointer">
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Rename Folder Modal ────────────────────────────────── */
function RenameFolderModal({ folder, projectId, open, onClose, onSaved }: { folder: ProjectFolder | null; projectId: string; open: boolean; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(folder?.name || "");
  const [color, setColor] = useState(folder?.color || "#8A8A88");
  const [saving, setSaving] = useState(false);

  if (folder && name === "" && folder.name !== "") { setName(folder.name); setColor(folder.color); }

  const handleSave = async () => {
    if (!folder) return;
    setSaving(true);
    try {
      await apiFetch(`/api/projects/${projectId}/items/${folder.id}`, { method: "PATCH", body: { _type: "folder", name, color } });
      onSaved(); onClose();
    } catch { alert("Erreur lors du renommage du dossier"); } finally { setSaving(false); }
  };

  const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2.5 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20";

  return (
    <AnimatePresence>
      {open && folder && (
        <>
          <motion.div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 pt-5 pb-3"><h3 className="text-[16px] font-bold text-[#1A1A1A]">Renommer le dossier</h3></div>
              <div className="px-6 pb-6 space-y-3">
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                <div><label className="block text-[11px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-1.5">Couleur</label><div className="flex gap-1.5">{FOLDER_COLORS.map((c) => <button key={c} type="button" onClick={() => setColor(c)} className={`w-6 h-6 rounded-full cursor-pointer ${color === c ? "ring-2 ring-offset-2 ring-[#4F46E5]" : "hover:scale-110"} transition-all`} style={{ backgroundColor: c }} />)}</div></div>
                <div className="flex gap-2 pt-1">
                  <button onClick={onClose} className="px-3 py-2 text-[13px] text-[#5A5A58] hover:bg-[#F7F7F5] rounded-lg cursor-pointer">Annuler</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg disabled:opacity-50 cursor-pointer">{saving ? "..." : "Sauvegarder"}</button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Move Item Modal ────────────────────────────────────── */
function MoveItemModal({ item, projectId, folders, open, onClose, onMoved }: { item: ProjectItem | null; projectId: string; folders: ProjectFolder[]; open: boolean; onClose: () => void; onMoved: () => void }) {
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);

  const handleMove = async () => {
    if (!item) return;
    setSaving(true);
    try {
      await apiFetch(`/api/projects/${projectId}/items/${item.id}`, { method: "PATCH", body: { folderId: target || null } });
      onMoved(); onClose();
    } catch { alert("Erreur lors du déplacement"); } finally { setSaving(false); }
  };

  const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20";

  return (
    <AnimatePresence>
      {open && item && (
        <>
          <motion.div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 pt-5 pb-3"><h3 className="text-[16px] font-bold text-[#1A1A1A]">Déplacer &laquo;{item.title || "Sans titre"}&raquo;</h3></div>
              <div className="px-6 pb-6 space-y-3">
                <select className={inputClass} value={target} onChange={(e) => setTarget(e.target.value)}>
                  <option value="">Racine du projet</option>
                  {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <div className="flex gap-2 pt-1">
                  <button onClick={onClose} className="px-3 py-2 text-[13px] text-[#5A5A58] hover:bg-[#F7F7F5] rounded-lg cursor-pointer">Annuler</button>
                  <button onClick={handleMove} disabled={saving} className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg disabled:opacity-50 cursor-pointer">{saving ? "..." : "Déplacer"}</button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Batch Move Modal ───────────────────────────────────── */
function BatchMoveModal({ open, folders, projectId, selectedIds, onClose, onMoved }: { open: boolean; folders: ProjectFolder[]; projectId: string; selectedIds: string[]; onClose: () => void; onMoved: () => void }) {
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);

  const handleMove = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/projects/${projectId}/batch`, { body: { action: "move", itemIds: selectedIds, folderId: target || null } });
      onMoved(); onClose();
    } catch { alert("Erreur lors du déplacement groupé"); } finally { setSaving(false); }
  };

  const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 pt-5 pb-3"><h3 className="text-[16px] font-bold text-[#1A1A1A]">Déplacer {selectedIds.length} élément{selectedIds.length > 1 ? "s" : ""}</h3></div>
              <div className="px-6 pb-6 space-y-3">
                <select className={inputClass} value={target} onChange={(e) => setTarget(e.target.value)}>
                  <option value="">Racine du projet</option>
                  {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <div className="flex gap-2 pt-1">
                  <button onClick={onClose} className="px-3 py-2 text-[13px] text-[#5A5A58] hover:bg-[#F7F7F5] rounded-lg cursor-pointer">Annuler</button>
                  <button onClick={handleMove} disabled={saving} className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg disabled:opacity-50 cursor-pointer">{saving ? "..." : "Déplacer"}</button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Quick Add Bar — explicit actions ────────────────────── */
function QuickAddBar({ onAddVideoLink, onUploadImages, onUploadDocs, onOpenNoteModal, onOpenModal }: {
  onAddVideoLink: (url: string) => void;
  onUploadImages: (files: File[]) => void;
  onUploadDocs: (files: File[]) => void;
  onOpenNoteModal: () => void;
  onOpenModal: () => void;
}) {
  const [videoUrl, setVideoUrl] = useState("");
  const [focused, setFocused] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitVideo = () => {
    const v = videoUrl.trim();
    if (!v) return;
    const url = v.startsWith("www.") ? `https://${v}` : v;
    if (/youtube\.com|youtu\.be|vimeo\.com|loom\.com/.test(url)) {
      onAddVideoLink(url);
      setVideoUrl("");
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Video URL input */}
      <div className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-xl transition-all flex-1 min-w-[260px] ${focused ? "border-[#EF4444]/30 ring-1 ring-[#EF4444]/10" : "border-[#E6E6E4]"}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B0B0AE" strokeWidth="2" className="shrink-0"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmitVideo(); }}
          placeholder="Colle un lien YouTube, Vimeo ou Loom..."
          className="flex-1 text-[13px] text-[#1A1A1A] placeholder-[#B0B0AE] bg-transparent focus:outline-none min-w-0"
        />
        {videoUrl.trim() && (
          <button onClick={handleSubmitVideo} className="text-[11px] font-semibold text-[#4F46E5] hover:underline cursor-pointer shrink-0">Ajouter</button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => { const f = Array.from(e.target.files || []); if (f.length > 0) onUploadImages(f); e.target.value = ""; }} />
        <input ref={docInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" className="hidden" onChange={(e) => { const f = Array.from(e.target.files || []); if (f.length > 0) onUploadDocs(f); e.target.value = ""; }} />

        <button onClick={() => imageInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-[#5A5A58] bg-white border border-[#E6E6E4] hover:bg-pink-50 hover:border-pink-200 hover:text-[#EC4899] rounded-lg transition-colors cursor-pointer" title="Ajouter des images">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Image
        </button>
        <button onClick={() => docInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-[#5A5A58] bg-white border border-[#E6E6E4] hover:bg-purple-50 hover:border-purple-200 hover:text-[#8B5CF6] rounded-lg transition-colors cursor-pointer" title="Ajouter un document">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Doc
        </button>
        <button onClick={onOpenNoteModal} className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-[#5A5A58] bg-white border border-[#E6E6E4] hover:bg-amber-50 hover:border-amber-200 hover:text-[#F59E0B] rounded-lg transition-colors cursor-pointer" title="Ajouter une note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          Note
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const { data, loading, error: loadError, mutate } = useApi<ProjectDetailResponse>(`/api/projects/${projectId}`);
  const { data: clientsList } = useApi<{ id: string; name: string; company?: string }[]>("/api/clients", []);
  const { data: briefTemplates } = useApi<{ id: string; name: string }[]>("/api/brief-templates", []);

  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<ProjectFolder | null>(null);
  const [movingItem, setMovingItem] = useState<ProjectItem | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "notes" | "files" | "links" | "pinned">("all");
  const [itemSearch, setItemSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // V3: Selection mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchMove, setShowBatchMove] = useState(false);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);

  // V3: Share state
  const [shareLoading, setShareLoading] = useState(false);

  // Lightbox
  const [lightboxId, setLightboxId] = useState<string | null>(null);

  // Drop zone state
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkUploadCount, setBulkUploadCount] = useState(0);

  // Toast error state
  const [toastError, setToastError] = useState<string | null>(null);
  const showError = (msg: string) => { setToastError(msg); setTimeout(() => setToastError(null), 4000); };

  const project = data?.project;
  const folders = data?.folders ?? [];
  const allItems = data?.items ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const visibleItems = useMemo(() => {
    let items = allItems;
    if (activeFolder) {
      items = items.filter((i) => i.folderId === activeFolder);
    } else {
      items = items.filter((i) => !i.folderId);
    }
    if (activeTab === "notes") items = items.filter((i) => i.itemType === "note");
    if (activeTab === "files") items = items.filter((i) => ["image", "file", "reference"].includes(i.itemType));
    if (activeTab === "links") items = items.filter((i) => ["video", "link", "embed"].includes(i.itemType));
    if (activeTab === "pinned") items = items.filter((i) => i.isPinned);
    if (itemSearch) {
      const q = itemSearch.toLowerCase();
      items = items.filter((i) => i.title.toLowerCase().includes(q) || i.tags.some((t) => t.toLowerCase().includes(q)));
    }
    return items.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      return a.position - b.position;
    });
  }, [allItems, activeFolder, activeTab, itemSearch]);

  const handleDeleteItem = useCallback(async (id: string) => {
    if (!window.confirm("Supprimer cet élément ? Cette action est irréversible.")) return;
    try { await apiFetch(`/api/projects/${projectId}/items/${id}`, { method: "DELETE" }); mutate(); } catch { showError("Erreur lors de la suppression"); }
  }, [projectId, mutate]);

  const handleDeleteFolder = useCallback(async (id: string) => {
    const itemCount = allItems.filter(i => i.folderId === id).length;
    const msg = itemCount > 0
      ? `Supprimer ce dossier ? Les ${itemCount} élément${itemCount > 1 ? "s" : ""} seront déplacé${itemCount > 1 ? "s" : ""} à la racine.`
      : "Supprimer ce dossier vide ?";
    if (!window.confirm(msg)) return;
    try { await apiFetch(`/api/projects/${projectId}/items/${id}?type=folder`, { method: "DELETE" }); if (activeFolder === id) setActiveFolder(null); mutate(); } catch { showError("Erreur lors de la suppression du dossier"); }
  }, [projectId, activeFolder, mutate, allItems]);

  const handleTogglePin = useCallback(async (item: ProjectItem) => {
    try { await apiFetch(`/api/projects/${projectId}/items/${item.id}`, { method: "PATCH", body: { isPinned: !item.isPinned } }); mutate(); } catch { showError("Erreur lors de l'épinglage"); }
  }, [projectId, mutate]);

  const handleDeleteProject = async () => {
    if (!window.confirm("Supprimer ce projet ? Cette action est irréversible.")) return;
    try { await apiFetch(`/api/projects/${projectId}`, { method: "DELETE" }); router.push("/projets"); } catch { showError("Erreur lors de la suppression du projet"); }
  };

  // V3: DnD handler
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIdx = visibleItems.findIndex(i => i.id === active.id);
    const overIdx = visibleItems.findIndex(i => i.id === over.id);
    if (activeIdx === -1 || overIdx === -1) return;

    // Calculate new positions
    const reordered = [...visibleItems];
    const [moved] = reordered.splice(activeIdx, 1);
    reordered.splice(overIdx, 0, moved);

    const updates = reordered.map((item, idx) => ({ id: item.id, position: idx }));

    try {
      await apiFetch(`/api/projects/${projectId}/reorder`, { method: "PATCH", body: { items: updates } });
      mutate();
    } catch { showError("Erreur lors du réordonnement"); }
  }, [visibleItems, projectId, mutate]);

  // V3: Selection handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === visibleItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleItems.map(i => i.id)));
    }
  }, [visibleItems, selectedIds]);

  const handleBatchDelete = useCallback(async () => {
    try {
      await apiFetch(`/api/projects/${projectId}/batch`, { body: { action: "delete", itemIds: Array.from(selectedIds) } });
      setSelectedIds(new Set());
      setSelectMode(false);
      setConfirmBatchDelete(false);
      mutate();
    } catch { showError("Erreur lors de la suppression groupée"); }
  }, [projectId, selectedIds, mutate]);

  const handleBatchPin = useCallback(async (pin: boolean) => {
    try {
      await apiFetch(`/api/projects/${projectId}/batch`, { body: { action: pin ? "pin" : "unpin", itemIds: Array.from(selectedIds) } });
      setSelectedIds(new Set());
      mutate();
    } catch { showError("Erreur lors de l'épinglage groupé"); }
  }, [projectId, selectedIds, mutate]);

  // V3: Share toggle
  const handleToggleShare = useCallback(async () => {
    if (!project) return;
    setShareLoading(true);
    try {
      await apiFetch(`/api/projects/${projectId}/share`, { body: { enabled: !project.shareEnabled } });
      mutate();
    } catch { showError("Erreur lors du partage"); } finally { setShareLoading(false); }
  }, [project, projectId, mutate]);

  // Multi-file upload (drag-drop / paste)
  const handleMultiUpload = useCallback(async (files: File[]) => {
    // Accept all uploadable files (images, videos, PDFs, documents)
    const validFiles = files.filter(f =>
      f.type.startsWith("image/") ||
      f.type.startsWith("video/") ||
      f.type === "application/pdf" ||
      /\.(doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i.test(f.name)
    );
    if (validFiles.length === 0) {
      showError("Types de fichiers non supportés");
      return;
    }
    // Check size limit (10 Mo)
    const tooBig = validFiles.filter(f => f.size > 10 * 1024 * 1024);
    if (tooBig.length > 0) {
      showError(`${tooBig.length} fichier${tooBig.length > 1 ? "s" : ""} trop volumineux (max 10 Mo)`);
    }
    const uploadable = validFiles.filter(f => f.size <= 10 * 1024 * 1024);
    if (uploadable.length === 0) return;

    setBulkUploading(true);
    setBulkUploadCount(uploadable.length);
    let uploaded = 0;
    let failed = 0;
    for (const file of uploadable) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`/api/projects/${projectId}/upload`, { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) { failed++; continue; }
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        await apiFetch(`/api/projects/${projectId}/items`, {
          body: {
            itemType: isVideo ? "video" : isImage ? "image" : "file",
            folderId: activeFolder || null,
            title: file.name.replace(/\.[^.]+$/, ""),
            description: "",
            content: "",
            url: data.url,
            thumbnailUrl: isImage ? data.url : undefined,
            filePath: data.path,
            fileSize: data.size,
            mimeType: data.type,
            tags: [],
          },
        });
        uploaded++;
      } catch { failed++; }
    }
    setBulkUploading(false);
    setBulkUploadCount(0);
    if (failed > 0) {
      showError(`${failed} fichier${failed > 1 ? "s" : ""} n'ont pas pu être uploadé${failed > 1 ? "s" : ""}`);
    }
    if (uploaded > 0) mutate();
  }, [projectId, activeFolder, mutate]);

  // Quick add link (auto-detect type)
  const handleQuickAddLink = useCallback(async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;

    // Auto-detect content type
    const isYouTube = /youtube\.com\/watch|youtu\.be\//.test(trimmed);
    const isImageUrl = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(trimmed);
    const isVideoUrl = /\.(mp4|mov|webm|avi)(\?.*)?$/i.test(trimmed);

    let itemType: string = "link";
    let title = "";
    let thumbnailUrl: string | undefined;

    if (isYouTube) {
      itemType = "video";
      const ytId = trimmed.match(/(?:youtu\.be\/|v=)([^&\s]+)/)?.[1];
      title = "Vidéo YouTube";
      thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined;
    } else if (isImageUrl) {
      itemType = "image";
      title = trimmed.split("/").pop()?.split("?")[0] || "Image";
      thumbnailUrl = trimmed;
    } else if (isVideoUrl) {
      itemType = "video";
      title = trimmed.split("/").pop()?.split("?")[0] || "Vidéo";
    } else {
      try { title = new URL(trimmed).hostname; } catch { title = "Lien"; }
    }

    try {
      await apiFetch(`/api/projects/${projectId}/items`, {
        body: {
          itemType,
          folderId: activeFolder || null,
          title,
          description: "",
          content: "",
          url: trimmed,
          thumbnailUrl,
          tags: [],
        },
      });
      mutate();
    } catch { showError("Erreur lors de l'ajout du lien"); }
  }, [projectId, activeFolder, mutate]);

  // Global drop handler
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleMultiUpload(files);
  }, [handleMultiUpload]);

  // Global paste handler (Ctrl+V images)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.kind === "file" && (item.type.startsWith("image/") || item.type.startsWith("video/"))) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) handleMultiUpload(files);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleMultiUpload]);

  // Hidden multi-file input ref
  const multiFileRef = useRef<HTMLInputElement>(null);

  // Loading
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#FAFAF9]">
        <div className="max-w-[1200px] mx-auto px-6 py-6 animate-pulse">
          <div className="h-5 bg-[#E6E6E4] rounded w-24 mb-5" />
          <div className="bg-white rounded-2xl border border-[#E6E6E4] overflow-hidden mb-6"><div className="h-2 bg-[#E6E6E4]" /><div className="p-6 space-y-3"><div className="h-6 bg-[#F7F7F5] rounded w-64" /><div className="h-4 bg-[#F7F7F5] rounded w-96" /></div></div>
          <div className="grid grid-cols-4 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-white rounded-xl border border-[#E6E6E4]" />)}</div>
        </div>
      </div>
    );
  }

  if (!project) {
    const errorVariant = detectErrorVariant(loadError);
    return (
      <DatabaseError
        variant={errorVariant}
        title={errorVariant === "not_found" ? "Projet introuvable" : undefined}
        message={loadError || undefined}
        migrationFile={errorVariant === "migration" ? "supabase/migrations/028_projects_system.sql" : undefined}
        onRetry={mutate}
        onBack={() => router.push("/projets")}
        backLabel="Retour aux projets"
      />
    );
  }

  const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.draft;
  const priorityCfg = PRIORITY_CONFIG[(project.priority as ProjectPriority)] || PRIORITY_CONFIG.normal;
  const folderItemCounts = folders.reduce<Record<string, number>>((acc, f) => { acc[f.id] = allItems.filter((i) => i.folderId === f.id).length; return acc; }, {});
  const shareUrl = project.shareToken ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${project.shareToken}` : "";

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFAF9]">
      <div className="max-w-[1200px] mx-auto px-6 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => router.push("/projets")} className="flex items-center gap-1.5 text-[13px] text-[#8A8A88] hover:text-[#5A5A58] transition-colors cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Projets
          </button>
          <span className="text-[#E6E6E4]">/</span>
          <span className="text-[13px] text-[#5A5A58] font-medium truncate max-w-xs">{project.name}</span>
        </div>

        {/* ─── Project Header ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E6E6E4] overflow-hidden mb-6">
          <div className="h-2 w-full" style={{ backgroundColor: project.color }} />
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-[22px] font-bold text-[#1A1A1A]">{project.name}</h1>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
                  </span>
                  {project.priority !== "normal" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: `${priorityCfg.color}15`, color: priorityCfg.color }}>
                      {priorityCfg.label}
                    </span>
                  )}
                </div>
                {project.description && <p className="text-[13px] text-[#5A5A58] leading-relaxed max-w-2xl">{project.description}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setShowEditProject(true)} className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-[#5A5A58] bg-[#F7F7F5] hover:bg-[#EFEFEF] rounded-lg transition-colors cursor-pointer">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Modifier
                </button>
                {confirmDelete === projectId ? (
                  <div className="flex items-center gap-1">
                    <button onClick={handleDeleteProject} className="px-3 py-2 text-[12px] font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg cursor-pointer">Confirmer</button>
                    <button onClick={() => setConfirmDelete(null)} className="px-3 py-2 text-[12px] text-[#5A5A58] hover:bg-[#F7F7F5] rounded-lg cursor-pointer">Non</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(projectId)} className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    Supprimer
                  </button>
                )}
              </div>
            </div>

            {/* Context strip */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {project.client && (
                <button onClick={() => router.push(`/clients/${(project.client as any).id}`)} className="inline-flex items-center gap-1.5 text-[12px] text-[#5A5A58] bg-[#F7F7F5] hover:bg-[#EFEFEF] px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  {(project.client as any).name}
                </button>
              )}
              {project.budget > 0 && <span className="inline-flex items-center text-[12px] font-semibold text-[#1A1A1A] bg-[#F7F7F5] px-3 py-1.5 rounded-lg">{project.budget.toLocaleString("fr-FR")}€</span>}
              {project.startDate && <span className="inline-flex items-center gap-1 text-[12px] text-[#8A8A88] bg-[#F7F7F5] px-3 py-1.5 rounded-lg">▶ {new Date(project.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>}
              {project.deadline && <span className="inline-flex items-center gap-1 text-[12px] text-[#8A8A88] bg-[#F7F7F5] px-3 py-1.5 rounded-lg">📅 {new Date(project.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>}
              <span className="inline-flex items-center gap-1 text-[12px] text-[#8A8A88] bg-[#F7F7F5] px-3 py-1.5 rounded-lg">{allItems.length} items · {folders.length} dossiers</span>
              {project.isPortfolio && <span className="inline-flex items-center gap-1 text-[12px] text-[#4F46E5] bg-[#EEF2FF] px-3 py-1.5 rounded-lg font-medium">Portfolio</span>}
              {project.briefTemplate && <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-medium">Brief: {(project.briefTemplate as any).name}</span>}
              {project.tags.map((tag) => <span key={tag} className="text-[11px] font-medium px-2 py-1 rounded-md bg-[#EEF2FF] text-[#4F46E5]">{tag}</span>)}
            </div>

            {/* V3: Share section */}
            <div className="mt-4 pt-4 border-t border-[#EFEFEF] flex items-center gap-3">
              <button onClick={handleToggleShare} disabled={shareLoading}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors cursor-pointer ${project.shareEnabled ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-[#F7F7F5] text-[#5A5A58] hover:bg-[#EFEFEF]"}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                {shareLoading ? "..." : project.shareEnabled ? "Partage activé" : "Activer le partage"}
              </button>
              {project.shareEnabled && shareUrl && (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input readOnly value={shareUrl} className="flex-1 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-1.5 text-[12px] text-[#5A5A58] truncate" />
                  <button onClick={() => { navigator.clipboard.writeText(shareUrl); }} className="px-3 py-1.5 text-[11px] font-medium text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-lg cursor-pointer">Copier</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* V3: Brief panel (if brief template linked) */}
        {project.briefTemplate && (
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-[#1A1A1A]">Brief associé : {(project.briefTemplate as any).name}</h3>
                <p className="text-[11px] text-[#8A8A88]">Questionnaire lié à ce projet</p>
              </div>
            </div>
            {(project.briefTemplate as any).schema?.fields && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">Champs du brief</div>
                <div className="flex flex-wrap gap-1.5">
                  {((project.briefTemplate as any).schema.fields as any[]).map((f: any, i: number) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-[#F7F7F5] text-[#5A5A58]">
                      {f.label || f.key}{f.required ? " *" : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Content Controls ───────────────────────────── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-white border border-[#E6E6E4] rounded-lg p-0.5">
              {(["all", "pinned", "notes", "files", "links"] as const).map((tab) => {
                const labels = { all: "Tout", pinned: "Épinglés", notes: "Notes", files: "Images & Docs", links: "Vidéos" };
                return <button key={tab} onClick={() => setActiveTab(tab)} className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${activeTab === tab ? "bg-[#EEF2FF] text-[#4F46E5]" : "text-[#8A8A88] hover:text-[#5A5A58]"}`}>{labels[tab]}</button>;
              })}
            </div>
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#BBB]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input type="text" placeholder="Chercher..." className="bg-white border border-[#E6E6E4] rounded-lg pl-8 pr-3 py-1.5 text-[12px] w-40 focus:outline-none focus:border-[#4F46E5]/30" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* V3: Select mode toggle */}
            <button onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg transition-colors cursor-pointer ${selectMode ? "bg-[#EEF2FF] text-[#4F46E5]" : "text-[#8A8A88] hover:text-[#5A5A58] hover:bg-[#F7F7F5]"}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" />{selectMode && <polyline points="9 11 12 14 22 4" />}</svg>
              {selectMode ? "Sélection" : "Sélectionner"}
            </button>

            <button onClick={() => setShowAddItem(true)} className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Ajouter du contenu
            </button>
          </div>
        </div>

        {/* V3: Batch action bar */}
        {selectMode && selectedIds.size > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4 px-4 py-3 bg-white border border-[#4F46E5]/20 rounded-xl shadow-sm"
          >
            <button onClick={selectAll} className="text-[12px] font-medium text-[#4F46E5] cursor-pointer hover:underline">
              {selectedIds.size === visibleItems.length ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
            <span className="text-[12px] text-[#8A8A88]">{selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}</span>
            <div className="flex-1" />
            <button onClick={() => handleBatchPin(true)} className="px-2.5 py-1.5 text-[11px] font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg cursor-pointer">Épingler</button>
            <button onClick={() => handleBatchPin(false)} className="px-2.5 py-1.5 text-[11px] font-medium text-[#5A5A58] bg-[#F7F7F5] hover:bg-[#EFEFEF] rounded-lg cursor-pointer">Désépingler</button>
            <button onClick={() => setShowBatchMove(true)} className="px-2.5 py-1.5 text-[11px] font-medium text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-lg cursor-pointer">Déplacer</button>
            {confirmBatchDelete ? (
              <div className="flex items-center gap-1">
                <button onClick={handleBatchDelete} className="px-2.5 py-1.5 text-[11px] font-medium text-white bg-red-500 rounded-lg cursor-pointer">Confirmer</button>
                <button onClick={() => setConfirmBatchDelete(false)} className="px-2.5 py-1.5 text-[11px] text-[#5A5A58] cursor-pointer">Non</button>
              </div>
            ) : (
              <button onClick={() => setConfirmBatchDelete(true)} className="px-2.5 py-1.5 text-[11px] font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer">Supprimer</button>
            )}
          </motion.div>
        )}

        {/* Quick add bar */}
        <div className="mb-4">
          <QuickAddBar
            onAddVideoLink={handleQuickAddLink}
            onUploadImages={handleMultiUpload}
            onUploadDocs={handleMultiUpload}
            onOpenNoteModal={() => setShowAddItem(true)}
            onOpenModal={() => setShowAddItem(true)}
          />
        </div>

        {/* Folder breadcrumb */}
        {activeFolder && (
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setActiveFolder(null)} className="text-[12px] text-[#4F46E5] hover:underline cursor-pointer">Racine</button>
            <span className="text-[#E6E6E4]">/</span>
            <span className="text-[12px] text-[#5A5A58] font-medium">{folders.find((f) => f.id === activeFolder)?.name || "Dossier"}</span>
          </div>
        )}

        {/* Folders */}
        {!activeFolder && folders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-3">Dossiers ({folders.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {folders.map((f) => (
                <FolderCard key={f.id} folder={f} itemCount={folderItemCounts[f.id] || 0} onOpen={() => setActiveFolder(f.id)} onRename={() => setRenamingFolder(f)} onDelete={() => handleDeleteFolder(f.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Hidden multi-file input */}
        <input
          ref={multiFileRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) handleMultiUpload(files);
            e.target.value = "";
          }}
        />

        {/* Bulk upload progress */}
        <AnimatePresence>
          {bulkUploading && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-4 flex items-center gap-3 px-4 py-3 bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-xl"
            >
              <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px] text-[#4F46E5] font-medium">Upload de {bulkUploadCount} fichier{bulkUploadCount > 1 ? "s" : ""} en cours...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items — Moodboard layout */}
        {visibleItems.length > 0 ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={`relative transition-colors rounded-2xl ${isDraggingOver ? "bg-[#EEF2FF] ring-2 ring-dashed ring-[#4F46E5]/40 p-3" : ""}`}
          >
            {isDraggingOver && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#EEF2FF]/80 rounded-2xl pointer-events-none">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#4F46E5]/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  </div>
                  <span className="text-[14px] font-semibold text-[#4F46E5]">Déposez vos fichiers ici</span>
                </div>
              </div>
            )}
            <h3 className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-3 flex items-center gap-2">
              {activeFolder ? "Contenu" : "Moodboard"} ({visibleItems.length})
              <button
                onClick={() => multiFileRef.current?.click()}
                className="text-[10px] font-medium text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] px-2 py-0.5 rounded-full cursor-pointer transition-colors normal-case tracking-normal"
              >
                + Images
              </button>
            </h3>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={visibleItems.map(i => i.id)} strategy={rectSortingStrategy}>
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-3">
                  {visibleItems.map((item) => (
                    <SortableItemCard
                      key={item.id}
                      item={item}
                      selectMode={selectMode}
                      isSelected={selectedIds.has(item.id)}
                      onSelect={() => toggleSelection(item.id)}
                      onEdit={() => setEditingItem(item)}
                      onDelete={() => handleDeleteItem(item.id)}
                      onPin={() => handleTogglePin(item)}
                      onMove={() => setMovingItem(item)}
                      onPreview={() => setLightboxId(item.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center py-20 rounded-2xl transition-colors border-2 border-dashed ${isDraggingOver ? "border-[#4F46E5]/40 bg-[#EEF2FF]" : "border-transparent"}`}
          >
            {isDraggingOver ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#4F46E5]/10 flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </div>
                <p className="text-[15px] font-semibold text-[#4F46E5]">Déposez vos fichiers ici</p>
              </>
            ) : (
              <>
                <p className="text-[16px] font-semibold text-[#1A1A1A] mb-1">
                  {activeFolder ? "Ce dossier est vide" : itemSearch ? "Aucun résultat" : activeTab === "pinned" ? "Aucun élément épinglé" : "Ajoute des inspirations à ton projet"}
                </p>
                <p className="text-[12px] text-[#8A8A88] mb-6 max-w-sm text-center">
                  {activeFolder ? "Ajoute des images, documents ou notes" : !itemSearch && activeTab === "all" ? "Images, documents, vidéos et notes, au même endroit." : ""}
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
                  <button
                    onClick={() => multiFileRef.current?.click()}
                    className="flex items-center gap-3 p-3.5 bg-white border border-[#E6E6E4] hover:border-pink-200 hover:bg-pink-50/30 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center text-base shrink-0">🖼️</div>
                    <div>
                      <span className="text-[13px] font-semibold text-[#1A1A1A] block">Image</span>
                      <span className="text-[11px] text-[#8A8A88]">Upload photos</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".pdf,.doc,.docx";
                      input.multiple = true;
                      input.onchange = () => {
                        const files = Array.from(input.files || []);
                        if (files.length > 0) handleMultiUpload(files);
                      };
                      input.click();
                    }}
                    className="flex items-center gap-3 p-3.5 bg-white border border-[#E6E6E4] hover:border-purple-200 hover:bg-purple-50/30 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-base shrink-0">📄</div>
                    <div>
                      <span className="text-[13px] font-semibold text-[#1A1A1A] block">Document</span>
                      <span className="text-[11px] text-[#8A8A88]">PDF, références</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="flex items-center gap-3 p-3.5 bg-white border border-[#E6E6E4] hover:border-red-200 hover:bg-red-50/30 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-base shrink-0">🎬</div>
                    <div>
                      <span className="text-[13px] font-semibold text-[#1A1A1A] block">Vidéo</span>
                      <span className="text-[11px] text-[#8A8A88]">YouTube, Vimeo</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="flex items-center gap-3 p-3.5 bg-white border border-[#E6E6E4] hover:border-amber-200 hover:bg-amber-50/30 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-base shrink-0">📝</div>
                    <div>
                      <span className="text-[13px] font-semibold text-[#1A1A1A] block">Note</span>
                      <span className="text-[11px] text-[#8A8A88]">Texte libre, idée</span>
                    </div>
                  </button>
                </div>
                <p className="text-[11px] text-[#B0B0AE] mt-5">Glissez des fichiers ou Ctrl+V pour coller une image</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddItemModal open={showAddItem} folderId={activeFolder} projectId={projectId} folders={folders} onClose={() => setShowAddItem(false)} onCreated={mutate} />
      {project && <EditProjectPanel project={project} open={showEditProject} onClose={() => setShowEditProject(false)} onSaved={mutate} clients={(clientsList ?? []).map((c: any) => ({ id: c.id, name: c.name ?? c.email, company: c.company }))} briefTemplates={(briefTemplates ?? []).map((b: any) => ({ id: b.id, name: b.name }))} />}
      <EditItemPanel item={editingItem} projectId={projectId} open={!!editingItem} onClose={() => setEditingItem(null)} onSaved={mutate} />
      <RenameFolderModal folder={renamingFolder} projectId={projectId} open={!!renamingFolder} onClose={() => setRenamingFolder(null)} onSaved={mutate} />
      <MoveItemModal item={movingItem} projectId={projectId} folders={folders} open={!!movingItem} onClose={() => setMovingItem(null)} onMoved={mutate} />
      <BatchMoveModal open={showBatchMove} folders={folders} projectId={projectId} selectedIds={Array.from(selectedIds)} onClose={() => setShowBatchMove(false)} onMoved={() => { setSelectedIds(new Set()); setSelectMode(false); mutate(); }} />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxId && (
          <Lightbox
            items={allItems}
            currentId={lightboxId}
            onClose={() => setLightboxId(null)}
            onNavigate={(id) => setLightboxId(id)}
          />
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {toastError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-red-500 text-white text-[13px] font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {toastError}
            <button onClick={() => setToastError(null)} className="ml-2 hover:opacity-80 cursor-pointer">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
