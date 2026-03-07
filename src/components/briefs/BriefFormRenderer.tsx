"use client";

import { useState } from "react";
import type { BriefField } from "@/types";
import { detectTransferProvider } from "@/lib/brief-column-compat";

const inputClass =
  "w-full px-3 py-2.5 text-sm border border-[#E6E6E4] rounded-md bg-[#F7F7F5] text-[#191919] focus:outline-none focus:ring-2 focus:ring-[var(--site-primary,#4F46E5)]/20 focus:border-[var(--site-primary,#4F46E5)] transition-all";

interface BriefFormRendererProps {
  fields: BriefField[];
  answers: Record<string, unknown>;
  onChange: (answers: Record<string, unknown>) => void;
  errors?: Record<string, string>;
  readOnly?: boolean;
  onUpload?: (file: File) => Promise<{ url: string; name: string; size: number }>;
}

export default function BriefFormRenderer({
  fields,
  answers,
  onChange,
  errors = {},
  readOnly = false,
  onUpload,
}: BriefFormRendererProps) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const setValue = (key: string, value: unknown) => {
    onChange({ ...answers, [key]: value });
  };

  const handleFileUpload = async (fieldKey: string, file: File) => {
    if (!onUpload) return;
    setUploading((prev) => ({ ...prev, [fieldKey]: true }));
    try {
      const result = await onUpload(file);
      // Multi-file: append to existing array
      const current = answers[fieldKey];
      if (Array.isArray(current)) {
        setValue(fieldKey, [...current, result]);
      } else if (current && typeof current === "object" && "url" in (current as Record<string, unknown>)) {
        // Migrate single file to array
        setValue(fieldKey, [current, result]);
      } else {
        setValue(fieldKey, [result]);
      }
    } catch {
      // error handling left to parent
    } finally {
      setUploading((prev) => ({ ...prev, [fieldKey]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const error = errors[field.key];
        const value = answers[field.key];

        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-[#5A5A58] mb-1">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            {field.help && <p className="text-[11px] text-[#8A8A88] mb-1.5">{field.help}</p>}

            {/* text */}
            {field.type === "text" && (
              <input
                type="text"
                value={(value as string) || ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={inputClass}
                readOnly={readOnly}
              />
            )}

            {/* textarea */}
            {field.type === "textarea" && (
              <textarea
                value={(value as string) || ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={inputClass + " resize-none"}
                rows={4}
                readOnly={readOnly}
              />
            )}

            {/* email */}
            {field.type === "email" && (
              <input
                type="email"
                value={(value as string) || ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                placeholder={field.placeholder || "email@exemple.com"}
                className={inputClass}
                readOnly={readOnly}
              />
            )}

            {/* phone */}
            {field.type === "phone" && (
              <input
                type="tel"
                value={(value as string) || ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                placeholder={field.placeholder || "06 12 34 56 78"}
                className={inputClass}
                readOnly={readOnly}
              />
            )}

            {/* url */}
            {field.type === "url" && (
              <input
                type="url"
                value={(value as string) || ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                placeholder={field.placeholder || "https://..."}
                className={inputClass}
                readOnly={readOnly}
              />
            )}

            {/* number */}
            {field.type === "number" && (
              <input
                type="number"
                value={(value as number) ?? ""}
                onChange={(e) => setValue(field.key, e.target.value ? Number(e.target.value) : "")}
                placeholder={field.placeholder}
                className={inputClass}
                readOnly={readOnly}
              />
            )}

            {/* date */}
            {field.type === "date" && (
              <input
                type="date"
                value={(value as string) || ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                className={inputClass}
                readOnly={readOnly}
              />
            )}

            {/* select */}
            {field.type === "select" && (
              <select
                value={(value as string) || ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                className={inputClass}
                disabled={readOnly}
              >
                <option value="">Sélectionner...</option>
                {(field.options || []).map((opt, i) => (
                  <option key={`${opt}-${i}`} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {/* radio */}
            {field.type === "radio" && (
              <div className="space-y-1.5">
                {(field.options || []).map((opt, i) => (
                  <label key={`${opt}-${i}`} className="flex items-center gap-2 text-sm text-[#5A5A58] cursor-pointer">
                    <input
                      type="radio"
                      name={field.key}
                      checked={value === opt}
                      onChange={() => setValue(field.key, opt)}
                      disabled={readOnly}
                      className="text-[var(--site-primary,#4F46E5)]"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {/* checkbox */}
            {field.type === "checkbox" && (
              <div className="space-y-1.5">
                {(field.options || []).map((opt, i) => {
                  const selected = Array.isArray(value) ? (value as string[]).includes(opt) : false;
                  return (
                    <label key={`${opt}-${i}`} className="flex items-center gap-2 text-sm text-[#5A5A58] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => {
                          const arr = Array.isArray(value) ? [...(value as string[])] : [];
                          if (e.target.checked) arr.push(opt);
                          else {
                            const idx = arr.indexOf(opt);
                            if (idx >= 0) arr.splice(idx, 1);
                          }
                          setValue(field.key, arr);
                        }}
                        disabled={readOnly}
                        className="rounded border-[#E6E6E4] text-[var(--site-primary,#4F46E5)]"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            )}

            {/* file (multi-file + transfer links) */}
            {field.type === "file" && (
              <FileResourceField
                fieldKey={field.key}
                accept={field.accept}
                value={value}
                readOnly={readOnly}
                uploading={!!uploading[field.key]}
                onUploadFile={(file) => handleFileUpload(field.key, file)}
                onChange={(v) => setValue(field.key, v)}
              />
            )}

            {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Multi-file + transfer link sub-component ─── */

interface FileResourceFieldProps {
  fieldKey: string;
  accept?: string;
  value: unknown;
  readOnly: boolean;
  uploading: boolean;
  onUploadFile: (file: File) => void;
  onChange: (value: unknown) => void;
}

function FileResourceField({ fieldKey, accept, value, readOnly, uploading, onUploadFile, onChange }: FileResourceFieldProps) {
  const [linkInput, setLinkInput] = useState("");

  // Normalize value to array of items
  const items: { url: string; name?: string; type?: string }[] = [];
  if (Array.isArray(value)) {
    for (const v of value) {
      if (typeof v === "string") items.push({ url: v, name: v, type: "url" });
      else if (v && typeof v === "object" && "url" in v) items.push(v as { url: string; name?: string; type?: string });
    }
  } else if (value && typeof value === "object" && "url" in (value as Record<string, unknown>)) {
    items.push(value as { url: string; name?: string });
  }

  const addLink = () => {
    const url = linkInput.trim();
    if (!url) return;
    const provider = detectTransferProvider(url);
    const label = provider === "wetransfer" ? "WeTransfer" : provider === "swisstransfer" ? "SwissTransfer" : url;
    const newItem = { url, name: label, type: provider ? "transfer_link" : "url" };
    onChange([...items, newItem]);
    setLinkInput("");
  };

  const removeItem = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    onChange(next.length > 0 ? next : null);
  };

  const providerBadge = (url: string) => {
    const p = detectTransferProvider(url);
    if (p === "wetransfer") return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">WeTransfer</span>;
    if (p === "swisstransfer") return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium">SwissTransfer</span>;
    return null;
  };

  return (
    <div className="space-y-2.5">
      {/* Listed items */}
      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 group bg-[#FAFAF9] rounded-md px-2.5 py-1.5 border border-[#F0F0EE]">
              {item.type === "transfer_link" || detectTransferProvider(item.url) ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              )}
              <span className="flex-1 text-[13px] text-[#191919] truncate">{item.name || "Fichier"}</span>
              {providerBadge(item.url)}
              {!readOnly && (
                <button onClick={() => removeItem(idx)} className="opacity-0 group-hover:opacity-100 text-[#8A8A88] hover:text-red-500 transition-opacity cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <>
          {/* File upload */}
          <div>
            <input
              type="file"
              accept={accept}
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  for (let i = 0; i < files.length; i++) {
                    onUploadFile(files[i]);
                  }
                }
              }}
              disabled={uploading}
              className="text-sm text-[#5A5A58]"
            />
            {uploading && <p className="text-[12px] text-[#8A8A88] mt-1">Envoi en cours...</p>}
          </div>

          {/* Transfer link input */}
          <div className="flex gap-2">
            <input
              type="url"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
              placeholder="Coller un lien WeTransfer, SwissTransfer ou URL..."
              className={inputClass + " text-[13px]"}
            />
            <button
              onClick={addLink}
              disabled={!linkInput.trim()}
              className="shrink-0 text-[12px] px-3 py-2 rounded-md bg-[var(--site-primary,#4F46E5)] text-white hover:opacity-90 disabled:opacity-40 cursor-pointer disabled:cursor-default transition-opacity"
            >
              Ajouter
            </button>
          </div>
          <p className="text-[10px] text-[#8A8A88]">
            Privilegiez un lien WeTransfer ou SwissTransfer pour les fichiers lourds ou multiples.
          </p>
        </>
      )}
    </div>
  );
}
