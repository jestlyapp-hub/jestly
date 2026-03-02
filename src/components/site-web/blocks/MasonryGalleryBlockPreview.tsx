"use client";

import { memo, useState } from "react";
import type { MasonryGalleryBlockContent } from "@/types";

function MasonryGalleryBlockPreviewInner({ content }: { content: MasonryGalleryBlockContent }) {
  const [lightboxState, setLightboxState] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });
  const maxImages = content.maxImages ?? 12;
  const limitedItems = content.items.slice(0, maxImages);

  const cols = content.columns === 2 ? 2 : content.columns === 4 ? 4 : 3;
  const columns: typeof limitedItems[] = Array.from({ length: cols }, () => []);
  limitedItems.forEach((item, i) => columns[i % cols].push(item));

  // Flat list for lightbox navigation
  const flatItems = limitedItems;

  const openLightbox = (flatIndex: number) => {
    if (content.lightbox) {
      setLightboxState({ open: true, index: flatIndex });
    }
  };

  const navigate = (dir: -1 | 1) => {
    setLightboxState((prev) => ({
      open: true,
      index: (prev.index + dir + flatItems.length) % flatItems.length,
    }));
  };

  // Track flat index per item
  let flatIdx = -1;

  return (
    <div className="py-6">
      <div className={`grid gap-3 ${cols === 2 ? "grid-cols-2" : cols === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
        {columns.map((col, ci) => (
          <div key={ci} className="space-y-3">
            {col.map((item, i) => {
              flatIdx++;
              const currentFlatIdx = flatIdx;
              return (
                <div
                  key={i}
                  className={`relative group rounded-xl overflow-hidden ${content.lightbox ? "cursor-pointer" : ""}`}
                  onClick={() => openLightbox(currentFlatIdx)}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title ?? ""} className="w-full object-cover" style={{ minHeight: 80 + ((ci + i) % 3) * 40 }} />
                  ) : (
                    <div className="bg-[var(--site-primary-light)] flex items-center justify-center text-[11px] text-[var(--site-primary)] font-medium" style={{ height: 80 + ((ci + i) % 3) * 40 }}>Image</div>
                  )}
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[12px] font-medium text-white">{item.title}</span>
                    </div>
                  )}
                  {content.lightbox && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-80 transition-opacity">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Lightbox overlay */}
      {content.lightbox && lightboxState.open && flatItems[lightboxState.index] && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setLightboxState({ open: false, index: 0 })}>
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxState({ open: false, index: 0 }); }}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl z-10"
          >
            &times;
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            className="absolute left-4 text-white/80 hover:text-white text-3xl z-10"
          >
            &#8249;
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(1); }}
            className="absolute right-4 text-white/80 hover:text-white text-3xl z-10"
          >
            &#8250;
          </button>
          <div className="max-w-3xl max-h-[80vh] p-4" onClick={(e) => e.stopPropagation()}>
            {flatItems[lightboxState.index].imageUrl ? (
              <img
                src={flatItems[lightboxState.index].imageUrl}
                alt={flatItems[lightboxState.index].title ?? ""}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            ) : (
              <div className="w-96 h-64 bg-[var(--site-primary-light)] rounded-lg flex items-center justify-center text-[var(--site-primary)] font-medium">Image</div>
            )}
            {flatItems[lightboxState.index].title && (
              <div className="text-center text-white text-[13px] mt-3">{flatItems[lightboxState.index].title}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(MasonryGalleryBlockPreviewInner);
