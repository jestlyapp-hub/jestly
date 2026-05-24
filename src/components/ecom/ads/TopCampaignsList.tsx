"use client";

import Link from "next/link";
import { formatCurrency, formatRoas, providerEmoji } from "@/lib/ads/formatters";
import type { CampaignRow } from "@/lib/ads/types";

interface Props {
  title: string;
  type: "profitable" | "unprofitable";
  campaigns: CampaignRow[];
}

export default function TopCampaignsList({ title, type, campaigns }: Props) {
  const titleColor = type === "profitable" ? "text-emerald-700" : "text-rose-700";
  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <h3 className={`text-[13px] font-bold ${titleColor} mb-3`}>{title}</h3>
      {campaigns.length === 0 ? (
        <p className="text-[12px] text-[#8A8A88] py-3 text-center">Aucune campagne</p>
      ) : (
        <ol className="space-y-2">
          {campaigns.map((c, i) => (
            <li key={`${c.provider}|${c.campaign_id}`}>
              <Link
                href={`/ecom/ads/campaigns/${c.campaign_id}?provider=${c.provider}`}
                className="flex items-center justify-between gap-2 px-2 py-1.5 -mx-2 rounded hover:bg-[#FBFBFA] transition-colors"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] tabular-nums text-[#8A8A88] w-3 flex-shrink-0">{i + 1}.</span>
                  <span className="text-[14px]">{providerEmoji(c.provider)}</span>
                  <span className="text-[12px] font-medium text-[#191919] truncate">{c.campaign_name}</span>
                </span>
                <span className="flex items-center gap-2 flex-shrink-0 text-[11px] tabular-nums">
                  <span className="text-[#8A8A88]">{formatCurrency(c.spend_cents)}</span>
                  <span className={`font-semibold ${type === "profitable" ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatRoas(c.real_roas)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
