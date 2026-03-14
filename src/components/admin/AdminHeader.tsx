"use client";

import Link from "next/link";
import { ChevronRight, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  section?: string;
  actions?: React.ReactNode;
}

export default function AdminHeader({ title, description, section, actions }: AdminHeaderProps) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    setLastRefresh(new Date());
  }, []);

  const formattedTime = lastRefresh.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-[#8A8A88] mb-2">
        <Link
          href="/admin"
          className="hover:text-[#5A5A58] transition-colors duration-150"
        >
          Admin
        </Link>
        {section && (
          <>
            <ChevronRight size={12} className="text-[#CCCCCC]" />
            <span className="text-[#5A5A58]">{section}</span>
          </>
        )}
      </div>

      {/* Titre + actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#191919] tracking-[-0.02em]">
            {title}
          </h1>
          {description && (
            <p className="text-[14px] text-[#5A5A58] mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#8A8A88]">
            <RefreshCw size={12} strokeWidth={1.7} />
            <span>{formattedTime}</span>
          </div>
          {actions}
        </div>
      </div>
    </div>
  );
}
