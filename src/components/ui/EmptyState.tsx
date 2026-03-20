"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const defaultIcon = (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="9" x2="15" y2="15" />
    <line x1="15" y1="9" x2="9" y2="15" />
  </svg>
);

export default function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="mb-4 text-[#D1D5DB]">
        {icon || defaultIcon}
      </div>
      <h3 className="text-[15px] font-semibold text-[#191919] mb-1.5">{title}</h3>
      <p className="text-[13px] text-[#999] max-w-sm mb-5">{description}</p>
      {actionLabel && (
        onAction ? (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-1.5 bg-[#4F46E5] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {actionLabel}
          </button>
        ) : (
          <a
            href={actionHref}
            className="inline-flex items-center gap-1.5 bg-[#4F46E5] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {actionLabel}
          </a>
        )
      )}
    </motion.div>
  );
}
