"use client";

import type { BriefField } from "@/types";

interface BriefAnswersDisplayProps {
  fields: BriefField[];
  answers: Record<string, unknown>;
  pinnedOnly?: boolean;
  fieldSources?: Record<string, { target_kind: string; target_ref: string }>;
  hideMapped?: boolean;
}

export default function BriefAnswersDisplay({ fields, answers, pinnedOnly = false, fieldSources, hideMapped = false }: BriefAnswersDisplayProps) {
  let visibleFields = pinnedOnly ? fields.filter((f) => f.pinned) : fields;

  if (hideMapped && fieldSources) {
    visibleFields = visibleFields.filter((f) => {
      const src = fieldSources[f.key];
      return !src || src.target_kind === "custom_answer";
    });
  }

  if (visibleFields.length === 0) return null;

  const formatValue = (field: BriefField, value: unknown): React.ReactNode => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-[#8A8A88]">—</span>;
    }

    switch (field.type) {
      case "date":
        try {
          return <span>{new Date(value as string).toLocaleDateString("fr-FR")}</span>;
        } catch {
          return <span>{String(value)}</span>;
        }

      case "file": {
        // Support both single file {url, name} and array of items
        const items: { url: string; name?: string; type?: string }[] = [];
        if (Array.isArray(value)) {
          for (const v of value) {
            if (typeof v === "string") items.push({ url: v, name: v });
            else if (v && typeof v === "object" && "url" in v) items.push(v as { url: string; name?: string; type?: string });
          }
        } else if (value && typeof value === "object" && "url" in (value as Record<string, unknown>)) {
          items.push(value as { url: string; name?: string });
        }
        if (items.length === 0) return <span className="text-[#8A8A88]">—</span>;
        return (
          <div className="space-y-1">
            {items.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4F46E5] hover:underline inline-flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                {item.name || "Telecharger"}
              </a>
            ))}
          </div>
        );
      }

      case "checkbox": {
        const arr = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div className="flex flex-wrap gap-1">
            {arr.map((v) => (
              <span key={v} className="text-[11px] px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5] font-medium">
                {v}
              </span>
            ))}
          </div>
        );
      }

      default:
        return <span>{String(value)}</span>;
    }
  };

  return (
    <div className="space-y-3">
      {visibleFields.map((field) => (
        <div key={field.key} className="flex items-start justify-between gap-4">
          <span className="text-[13px] text-[#5A5A58] flex-shrink-0">
            {field.label}
            {field.pinned && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" className="inline ml-1 -mt-0.5">
                <path d="M12 17v5" /><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
              </svg>
            )}
          </span>
          <div className="text-[13px] text-[#191919] text-right">
            {formatValue(field, answers[field.key])}
          </div>
        </div>
      ))}
    </div>
  );
}
