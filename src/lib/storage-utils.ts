/**
 * Utilitaires pour les URLs Supabase Storage.
 *
 * Le bucket "order-uploads" est public — on utilise getPublicUrl (permanent).
 * Les anciennes URLs signées (token=...) expirent après 1h et cassent les images.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/order-uploads`;

// Regex pour détecter une signed URL du bucket order-uploads
// Ex: https://xxx.supabase.co/storage/v1/object/sign/order-uploads/path/file.png?token=...
const SIGNED_URL_RE = /\/storage\/v1\/object\/sign\/order-uploads\/([^?]+)/;

/**
 * Normalise une URL Supabase Storage :
 * - Convertit les signed URLs expirées en URLs publiques permanentes
 * - Retourne null si l'input est vide/invalide
 * - Laisse les URLs non-Supabase intactes
 */
export function normalizeStorageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Signed URL → public URL
  const match = url.match(SIGNED_URL_RE);
  if (match) {
    return `${PUBLIC_BASE}/${match[1]}`;
  }

  return url;
}

// ── Attachments (tâches) ──

interface Attachment {
  url: string;
  storagePath?: string;
  [key: string]: unknown;
}

/**
 * Reconstruit les URLs publiques permanentes pour les attachments
 * qui ont encore une URL signée expirée.
 */
export function fixAttachmentUrls<T extends Attachment>(attachments: T[]): T[] {
  return attachments.map((att) => {
    // Priorité 1 : reconstruire depuis storagePath
    if (att.storagePath && att.url?.includes("token=")) {
      return { ...att, url: `${PUBLIC_BASE}/${att.storagePath}` };
    }
    if (att.storagePath && !att.url) {
      return { ...att, url: `${PUBLIC_BASE}/${att.storagePath}` };
    }
    // Priorité 2 : normaliser l'URL directement
    const normalized = normalizeStorageUrl(att.url);
    if (normalized !== att.url) {
      return { ...att, url: normalized! };
    }
    return att;
  });
}

/**
 * Construit l'URL publique pour un fichier dans order-uploads.
 */
export function getPublicStorageUrl(storagePath: string): string {
  return `${PUBLIC_BASE}/${storagePath}`;
}

/**
 * Normalise les file_url dans les order_files.
 */
export function fixOrderFileUrls<T extends { file_url: string; [key: string]: unknown }>(files: T[]): T[] {
  return files.map((f) => {
    const normalized = normalizeStorageUrl(f.file_url);
    if (normalized && normalized !== f.file_url) {
      return { ...f, file_url: normalized };
    }
    return f;
  });
}
