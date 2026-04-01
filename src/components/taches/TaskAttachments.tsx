"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createId, type TaskAttachment } from "@/lib/tasks-utils";

/* ── Constants ── */

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
const ACCEPT_STRING = "image/jpeg,image/png,image/webp,image/gif";

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/* ── Props ── */

interface TaskAttachmentsProps {
  attachments: TaskAttachment[];
  onChange: (attachments: TaskAttachment[]) => void;
  /** Compact mode for subtask panels */
  compact?: boolean;
}

export default function TaskAttachments({
  attachments,
  onChange,
  compact = false,
}: TaskAttachmentsProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Upload logic ── */

  const uploadFile = useCallback(
    async (file: File) => {
      // Validation côté client
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Format non supporté. Formats acceptés : JPG, PNG, WebP, GIF");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Fichier trop volumineux (max 10 Mo)");
        return;
      }

      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/tasks/attachments", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erreur lors de l'upload");
        }

        const data = await res.json();

        const attachment: TaskAttachment = {
          id: createId(),
          url: data.url,
          fileName: data.fileName,
          mimeType: data.mimeType,
          size: data.size,
          storagePath: data.storagePath,
          createdAt: new Date().toISOString(),
        };

        onChange([...attachments, attachment]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
      } finally {
        setUploading(false);
      }
    },
    [attachments, onChange],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      // Upload one at a time to avoid race conditions
      Array.from(files).forEach((f) => uploadFile(f));
    },
    [uploadFile],
  );

  /* ── Delete ── */

  const handleDelete = useCallback(
    async (attachment: TaskAttachment) => {
      // Optimistic: remove immediately
      onChange(attachments.filter((a) => a.id !== attachment.id));

      // Clean up storage in background
      try {
        await fetch("/api/tasks/attachments", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storagePath: attachment.storagePath }),
        });
      } catch {
        // Storage cleanup failure is non-blocking
      }
    },
    [attachments, onChange],
  );

  /* ── Drag & drop ── */

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  /* ── Render ── */

  const hasImages = attachments.length > 0;

  return (
    <div className="space-y-2">
      {/* ── Image grid ── */}
      {hasImages && (
        <div
          className={`grid gap-2 ${
            attachments.length === 1
              ? "grid-cols-1"
              : compact
                ? "grid-cols-3"
                : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {attachments.map((att, i) => (
            <div
              key={att.id}
              className="group relative rounded-lg overflow-hidden border border-[#E6E6E4] bg-[#F7F7F5] cursor-pointer"
              style={{
                aspectRatio: attachments.length === 1 && !compact ? "16/10" : "1",
              }}
              onClick={() => setViewerIndex(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={att.url}
                alt={att.fileName}
                loading="lazy"
                className="w-full h-full object-cover transition-transform group-hover:scale-[1.03]"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(att);
                }}
                title="Supprimer cette photo"
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 hover:bg-white text-[#999] hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* File name tooltip on hover */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-white truncate block">
                  {att.fileName} · {fmtSize(att.size)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Upload zone ── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex items-center justify-center gap-2 border border-dashed rounded-lg transition-all cursor-pointer ${
          compact ? "px-2 py-2" : "px-3 py-3"
        } ${
          dragOver
            ? "border-[#4F46E5] bg-[#EEF2FF]"
            : "border-[#E6E6E4] hover:border-[#C0C0BE] hover:bg-[#FBFBFA]"
        } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_STRING}
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {uploading ? (
          <>
            <svg
              className="animate-spin"
              width={compact ? "14" : "16"}
              height={compact ? "14" : "16"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
            <span className={`${compact ? "text-[10px]" : "text-[12px]"} text-[#4F46E5] font-medium`}>
              Upload en cours…
            </span>
          </>
        ) : (
          <>
            <svg
              width={compact ? "14" : "16"}
              height={compact ? "14" : "16"}
              viewBox="0 0 24 24"
              fill="none"
              stroke={dragOver ? "#4F46E5" : "#BBB"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className={`${compact ? "text-[10px]" : "text-[12px]"} ${dragOver ? "text-[#4F46E5]" : "text-[#999]"}`}>
              {dragOver
                ? "Déposer ici"
                : compact
                  ? "Ajouter une photo"
                  : "Glisser une photo ou cliquer pour en ajouter"}
            </span>
          </>
        )}
      </div>

      {/* ── Error message ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-[11px] text-[#EF4444] bg-[#FEF2F2] rounded-md px-2.5 py-1.5"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto p-0.5 hover:bg-[#FEE2E2] rounded cursor-pointer"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lightbox viewer ── */}
      <AnimatePresence>
        {viewerIndex !== null && (
          <ImageViewer
            attachments={attachments}
            currentIndex={viewerIndex}
            onIndexChange={setViewerIndex}
            onClose={() => setViewerIndex(null)}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Image Viewer / Lightbox
   ═══════════════════════════════════════════════════════════ */

function ImageViewer({
  attachments,
  currentIndex,
  onIndexChange,
  onClose,
  onDelete,
}: {
  attachments: TaskAttachment[];
  currentIndex: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  onDelete: (att: TaskAttachment) => void;
}) {
  const att = attachments[currentIndex];
  if (!att) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < attachments.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Header bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-white/80 font-medium truncate max-w-[300px]">
            {att.fileName}
          </span>
          <span className="text-[11px] text-white/50">
            {fmtSize(att.size)}
          </span>
          {attachments.length > 1 && (
            <span className="text-[11px] text-white/50">
              {currentIndex + 1} / {attachments.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onDelete(att);
              if (attachments.length <= 1) {
                onClose();
              } else if (currentIndex >= attachments.length - 1) {
                onIndexChange(currentIndex - 1);
              }
            }}
            title="Supprimer"
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-[#EF4444] transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
          <button
            onClick={onClose}
            title="Fermer"
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange(currentIndex - 1);
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange(currentIndex + 1);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      )}

      {/* Image */}
      <motion.img
        key={att.id}
        src={att.url}
        alt={att.fileName}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
}
