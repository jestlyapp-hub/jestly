"use client";

interface KanbanStats {
  caMonth: number;
  enProduction: number;
  attentePaiement: number;
  total: number;
}

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function KanbanStatsBar({ stats }: { stats: KanbanStats | null }) {
  const cards = [
    { label: "CA ce mois", value: stats ? `${fmt(stats.caMonth)} \u20AC` : "...", icon: "trending-up" },
    { label: "En production", value: stats ? `${fmt(stats.enProduction)} \u20AC` : "...", icon: "zap" },
    { label: "Attente paiement", value: stats ? `${fmt(stats.attentePaiement)} \u20AC` : "...", icon: "clock" },
    { label: "Total commandes", value: stats ? String(stats.total) : "...", icon: "layers" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-lg border border-[#E6E6E4] px-4 py-3"
        >
          <div className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wider mb-1">
            {c.label}
          </div>
          <div className="text-[18px] font-bold text-[#191919]">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
