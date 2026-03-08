"use client";

import { useState, useRef, useCallback } from "react";

interface ImageUploaderProps {
  value: string | undefined;
  onChange: (url: string) => void;
  label?: string;
  /** Hint text below the input */
  hint?: string;
  /** Aspect ratio for preview thumbnail */
  previewAspect?: string;
}

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ImageUploader({
  value,
  onChange,
  label,
  hint,
  previewAspect = "16 / 9",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Le fichier doit etre une image");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Image trop lourde (max 10 Mo)");
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: "Erreur inconnue" }));
          throw new Error(body.error || "Echec de l'upload");
        }
        const data = await res.json();
        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Echec de l'upload");
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const remove = () => {
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          {label}
        </label>
      )}

      {/* Preview / Drop zone */}
      {value ? (
        <div className="relative group">
          <div
            className="rounded-lg border border-[#E6E6E4] overflow-hidden bg-[#F7F7F5]"
            style={{ aspectRatio: previewAspect }}
          >
            <img
              src={value}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 bg-white rounded-md text-[11px] font-medium text-[#1A1A1A] hover:bg-[#F7F7F5] transition-colors"
            >
              Changer
            </button>
            <button
              type="button"
              onClick={remove}
              className="px-3 py-1.5 bg-white rounded-md text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragActive
              ? "border-[#4F46E5] bg-[#EEF2FF]/50"
              : "border-[#E6E6E4] hover:border-[#4F46E5]/40 bg-[#F7F7F5]/50"
          }`}
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
              <span className="text-[12px] text-[#5A5A58]">Upload en cours...</span>
            </div>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#999"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-[11px] text-[#999] text-center">
                Glisser une image ou cliquer pour uploader
              </span>
            </>
          )}
        </div>
      )}

      {/* URL fallback input */}
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ou coller une URL d'image..."
        className={`${inputClass} text-[11px]`}
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="text-[11px] text-red-500 font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="text-[10px] text-[#BBB]">{hint}</p>
      )}
    </div>
  );
}
