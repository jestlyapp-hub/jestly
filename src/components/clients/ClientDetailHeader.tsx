"use client";

import { useRouter } from "next/navigation";
import BadgeStatus from "@/components/ui/BadgeStatus";
import type { ClientDetail } from "@/types";

interface Props {
  client: ClientDetail;
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  return `${years} an${years > 1 ? "s" : ""}`;
}

export default function ClientDetailHeader({ client }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
      {/* Back link */}
      <button
        onClick={() => router.push("/clients")}
        className="text-[13px] text-[#999] hover:text-[#4F46E5] transition-colors mb-4 flex items-center gap-1 cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Clients
      </button>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center text-base font-bold text-[#4F46E5] shrink-0">
          {client.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-[#1A1A1A] truncate">{client.name}</h1>
            <BadgeStatus status={client.status} />
          </div>

          <p className="text-[13px] text-[#999] mb-3">{client.email}</p>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F7F7F5] text-[11px] text-[#666]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Client depuis {timeAgo(client.createdAt)}
            </span>
            {client.lastOrderAt && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F7F7F5] text-[11px] text-[#666]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Dernière commande : {timeAgo(client.lastOrderAt)}
              </span>
            )}
            {client.company && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F7F7F5] text-[11px] text-[#666]">
                {client.company}
              </span>
            )}
            {client.source && client.source !== "manual" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[11px] text-[#4F46E5]">
                {client.source}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
