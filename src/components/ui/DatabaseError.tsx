"use client";

import { motion } from "framer-motion";

type ErrorVariant = "database" | "migration" | "not_found" | "network";

interface DatabaseErrorProps {
  variant?: ErrorVariant;
  title?: string;
  message?: string;
  migrationFile?: string;
  onRetry?: () => void;
  onBack?: () => void;
  backLabel?: string;
  backHref?: string;
}

const VARIANT_CONFIG: Record<ErrorVariant, {
  icon: React.ReactNode;
  defaultTitle: string;
  defaultMessage: string;
  iconBg: string;
  iconColor: string;
  accentBg: string;
  accentBorder: string;
}> = {
  database: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <line x1="12" y1="12" x2="12" y2="15" /><circle cx="12" cy="17" r="1" />
      </svg>
    ),
    defaultTitle: "Erreur de base de données",
    defaultMessage: "Impossible de charger les données. Vérifiez votre connexion ou réessayez.",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    accentBg: "bg-red-50",
    accentBorder: "border-red-100",
  },
  migration: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    defaultTitle: "Migration requise",
    defaultMessage: "La table nécessaire n'existe pas encore dans la base de données.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
  },
  not_found: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    defaultTitle: "Introuvable",
    defaultMessage: "La ressource demandée n'existe pas ou a été supprimée.",
    iconBg: "bg-gray-100",
    iconColor: "text-[#8A8A88]",
    accentBg: "bg-gray-50",
    accentBorder: "border-[#E6E6E4]",
  },
  network: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" /><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    ),
    defaultTitle: "Erreur réseau",
    defaultMessage: "Impossible de contacter le serveur. Vérifiez votre connexion internet.",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    accentBg: "bg-orange-50",
    accentBorder: "border-orange-100",
  },
};

/**
 * Detects error variant from an error message string.
 */
export function detectErrorVariant(errorMsg: string | null): ErrorVariant {
  if (!errorMsg) return "not_found";
  const lower = errorMsg.toLowerCase();
  // Migration needed — match specific phrases from API errorType="migration" responses
  if (lower.includes("migration") || lower.includes("n'existe pas encore") || lower.includes("exécutez la migration")) {
    return "migration";
  }
  if (lower.includes("réseau") || lower.includes("network") || lower.includes("fetch")) {
    return "network";
  }
  if (lower.includes("introuvable") || lower.includes("not found")) {
    return "not_found";
  }
  return "database";
}

export default function DatabaseError({
  variant = "database",
  title,
  message,
  migrationFile,
  onRetry,
  onBack,
  backLabel = "Retour",
  backHref,
}: DatabaseErrorProps) {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex-1 flex items-center justify-center bg-[#FAFAF9] p-6"
    >
      <div className="text-center max-w-sm">
        <div className={`w-16 h-16 rounded-2xl ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center mx-auto mb-4`}>
          {cfg.icon}
        </div>

        <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-1.5">
          {title || cfg.defaultTitle}
        </h2>

        <p className="text-[13px] text-[#8A8A88] mb-4">
          {message || cfg.defaultMessage}
        </p>

        {variant === "migration" && migrationFile && (
          <div className={`${cfg.accentBg} border ${cfg.accentBorder} rounded-xl p-3 mb-4 text-left`}>
            <p className="text-[11px] font-semibold text-amber-800 mb-1">Fichier de migration :</p>
            <code className="block text-[11px] bg-amber-100 rounded px-2 py-1 text-amber-900 font-mono">
              {migrationFile}
            </code>
            <p className="text-[10px] text-amber-700 mt-1.5">
              Exécutez ce fichier dans le SQL Editor de Supabase puis réessayez.
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
              </svg>
              Réessayer
            </button>
          )}
          {onBack ? (
            <button
              onClick={onBack}
              className="px-4 py-2 text-[13px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] rounded-lg transition-colors cursor-pointer"
            >
              {backLabel}
            </button>
          ) : backHref ? (
            <a
              href={backHref}
              className="px-4 py-2 text-[13px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] rounded-lg transition-colors"
            >
              {backLabel}
            </a>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
