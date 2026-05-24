"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, AlertCircle } from "lucide-react";

export type IntegrationStatus = "connected" | "disconnected" | "error" | "coming_soon";

export interface IntegrationCardAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
}

export interface IntegrationCardProps {
  /** Émoji ou ReactNode pour l'icône (ex: "🛍️", "📌", "🔵") */
  icon: React.ReactNode;
  name: string;
  description: string;
  status: IntegrationStatus;
  /** Sous-ligne contextuelle, ex: "L'Horloge Murale · 0crvzb-fn.myshopify.com" */
  contextLine?: string;
  /** 2e ligne, ex: "Dernière sync : il y a 3 min · 9 commandes" */
  metaLine?: string;
  /** Message d'erreur (status='error') */
  errorMessage?: string;
  actions?: IntegrationCardAction[];
}

const STATUS_CONFIG: Record<IntegrationStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  connected: { label: "Connecté", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  disconnected: { label: "Non connecté", color: "text-[#8A8A88] bg-[#F7F7F5] border-[#E6E6E4]", icon: Circle },
  error: { label: "Erreur", color: "text-rose-600 bg-rose-50 border-rose-200", icon: AlertCircle },
  coming_soon: { label: "Bientôt", color: "text-[#8A8A88] bg-[#F7F7F5] border-[#E6E6E4]", icon: Lock },
};

const BUTTON_CLASSES: Record<NonNullable<IntegrationCardAction["variant"]>, string> = {
  primary: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-[#7C3AED]",
  secondary: "border-[#E6E6E4] text-[#5A5A58] hover:bg-[#FBFBFA]",
  danger: "border-rose-200 text-rose-600 hover:bg-rose-50",
};

export default function IntegrationCard(props: IntegrationCardProps) {
  const cfg = STATUS_CONFIG[props.status];
  const StatusIcon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#E6E6E4] rounded-xl p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="text-2xl leading-none flex-shrink-0 mt-0.5">{props.icon}</div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold text-[#191919]">{props.name}</h3>
            <p className="text-[12px] text-[#5A5A58] leading-snug mt-0.5">{props.description}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border whitespace-nowrap ${cfg.color}`}>
          <StatusIcon size={10} />
          {cfg.label}
        </span>
      </div>

      {(props.contextLine || props.metaLine) && (
        <div className="ml-9 mt-2 space-y-0.5 text-[11px] text-[#5A5A58]">
          {props.contextLine && <div className="font-medium text-[#191919]">{props.contextLine}</div>}
          {props.metaLine && <div className="text-[#8A8A88]">{props.metaLine}</div>}
        </div>
      )}

      {props.errorMessage && (
        <div className="ml-9 mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-700">
          {props.errorMessage}
        </div>
      )}

      {props.actions && props.actions.length > 0 && (
        <div className="ml-9 mt-3 flex flex-wrap gap-2">
          {props.actions.map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              disabled={a.disabled || a.loading}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${BUTTON_CLASSES[a.variant ?? "secondary"]}`}
            >
              {a.loading && (
                <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
