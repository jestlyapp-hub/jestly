"use client";

import { Sparkles } from "lucide-react";

interface Props { message: string | null }

export default function InsightsBar({ message }: Props) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-[#F0EEFF] to-[#FAFAFF] border border-[#DDD6FE] rounded-xl text-[12px] text-[#191919]">
      <Sparkles size={14} className="text-[#7C3AED] mt-0.5 flex-shrink-0" />
      <span className="leading-relaxed"><strong className="text-[#5B21B6]">Cette semaine :</strong> {message}</span>
    </div>
  );
}
