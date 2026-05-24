"use client";

interface Props {
  profitable: number;
  warning: number;
  unprofitable: number;
  total: number;
}

export default function AdsStatusBadges({ profitable, warning, unprofitable, total }: Props) {
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-3 text-[12px]">
      <span className="font-semibold text-[#191919]">{total} campagne{total > 1 ? "s" : ""} :</span>
      <Badge dot="bg-emerald-500" label="rentable" count={profitable} />
      <Badge dot="bg-amber-500" label="limite" count={warning} />
      <Badge dot="bg-rose-500" label="perd" count={unprofitable} />
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
