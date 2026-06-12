"use client";

interface Props {
  profitable: number;
  warning: number;
  unprofitable: number;
  /** Campagnes au volume insuffisant pour juger la rentabilité sur la période. */
  insufficient?: number;
  total: number;
}

export default function AdsStatusBadges({ profitable, warning, unprofitable, insufficient = 0, total }: Props) {
  if (total === 0) return null;
  return (
    <div
      className="flex items-center gap-3 text-[12px]"
      title={insufficient > 0 ? "Données partielles : volume insuffisant sur la période pour juger la rentabilité" : undefined}
    >
      <span className="font-semibold text-[#191919]">{total} campagne{total > 1 ? "s" : ""} :</span>
      <Badge dot="bg-emerald-500" label="rentable" count={profitable} />
      <Badge dot="bg-amber-500" label="limite" count={warning} />
      <Badge dot="bg-rose-500" label="perd" count={unprofitable} />
      {insufficient > 0 && (
        <span className="inline-flex items-center gap-1.5 text-[#5A5A58]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span className="tabular-nums font-medium text-[#191919]">{insufficient}</span>
          <span className="text-[#8A8A88]">données partielles</span>
        </span>
      )}
    </div>
  );
}

function Badge({ dot, label, count }: { dot: string; label: string; count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#5A5A58]">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className="tabular-nums font-medium text-[#191919]">{count}</span>
      <span className="text-[#8A8A88]">{label}{count > 1 ? "s" : ""}</span>
    </span>
  );
}
