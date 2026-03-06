import type { BriefFieldType, BoardFieldType, ResourceItem } from "@/types";

/**
 * Compatibility map: which column types each brief field type can feed into.
 * Used both in the UI (BriefFieldEditor) and at checkout (validation).
 */
export const BRIEF_TO_COLUMN_COMPAT: Record<BriefFieldType, BoardFieldType[]> = {
  text:     ["text"],
  textarea: ["text"],
  number:   ["number", "money"],
  date:     ["date"],
  select:   ["select", "text"],
  radio:    ["select", "text"],
  checkbox: ["multi_select", "boolean", "text"],
  file:     ["text", "url"],
  url:      ["text", "url"],
  email:    ["text"],
  phone:    ["text"],
};

export function isCompatible(briefType: BriefFieldType, columnType: BoardFieldType): boolean {
  return BRIEF_TO_COLUMN_COMPAT[briefType]?.includes(columnType) ?? false;
}

/**
 * Normalize a label for dedup comparison:
 * trim, lowercase, strip accents.
 */
export function normalizeLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Find an existing option by normalized label match.
 * Returns the original option label if found, null otherwise.
 */
export function findExistingOption(
  needle: string,
  options: { label: string }[]
): string | null {
  const norm = normalizeLabel(needle);
  const match = options.find((o) => normalizeLabel(o.label) === norm);
  return match?.label ?? null;
}

/**
 * Detect transfer link provider from a URL.
 */
export function detectTransferProvider(url: string): ResourceItem["provider"] | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("wetransfer.com") || host.includes("we.tl")) return "wetransfer";
    if (host.includes("swisstransfer.com")) return "swisstransfer";
    return null;
  } catch {
    return null;
  }
}

/**
 * Create a ResourceItem from a URL string.
 */
export function urlToResourceItem(url: string, label?: string): ResourceItem {
  const provider = detectTransferProvider(url);
  return {
    id: crypto.randomUUID(),
    type: provider ? "transfer_link" : "url",
    label: label || (provider === "wetransfer" ? "WeTransfer" : provider === "swisstransfer" ? "SwissTransfer" : url),
    url,
    provider: provider ?? "other",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create a ResourceItem from an uploaded file.
 */
export function fileToResourceItem(file: { url: string; name?: string }): ResourceItem {
  return {
    id: crypto.randomUUID(),
    type: "file",
    label: file.name || "Fichier",
    url: file.url,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Normalize legacy string[] resources to ResourceItem[].
 */
export function normalizeResources(raw: unknown): ResourceItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return urlToResourceItem(item);
    if (item && typeof item === "object" && "url" in item && "id" in item) return item as ResourceItem;
    if (item && typeof item === "object" && "url" in item) return urlToResourceItem((item as { url: string }).url, (item as { name?: string }).name);
    return null;
  }).filter(Boolean) as ResourceItem[];
}
