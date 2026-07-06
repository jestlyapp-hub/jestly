"use client";

/**
 * États de chargement et d'erreur du module Analytics (passe qualité C1-C2).
 * Skeletons discrets plutôt que « Chargement… », et jamais d'échec silencieux :
 * message clair + bouton Réessayer.
 */
import { RotateCcw } from "lucide-react";

export function KpiGridSkeleton({ cards = 10 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3" aria-busy>
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-[#E5E3F0]">
          <div className="h-3 w-20 rounded bg-[#EDE9FE] animate-pulse" />
          <div className="h-6 w-24 rounded bg-[#F0EEFF] animate-pulse mt-2" />
          <div className="h-2.5 w-28 rounded bg-[#F7F7F5] animate-pulse mt-2" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="bg-white border border-[#E5E3F0] rounded-xl p-4 space-y-3" aria-busy>
      <div className="h-4 w-1/3 rounded bg-[#EDE9FE] animate-pulse" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-8 rounded bg-[#F7F7F5] animate-pulse" />
      ))}
    </div>
  );
}

export function CardSkeleton({ height = "h-40" }: { height?: string }) {
  return <div className={`bg-white border border-[#E5E3F0] rounded-xl ${height} animate-pulse`} aria-busy />;
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-[12px] text-rose-800">
      <span className="flex-1 min-w-[200px]">
        <span className="font-semibold">Le chargement a échoué :</span> {message}
      </span>
      {onRetry && (
        <button onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white text-rose-800 border border-rose-300 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
          <RotateCcw size={12} /> Réessayer
        </button>
      )}
    </div>
  );
}
