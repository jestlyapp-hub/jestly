"use client";

type HealthLevel = "overdue" | "today" | "soon" | "safe" | "none";

interface DeadlineHealthProps {
  deadline?: string;
  compact?: boolean;
}

function getHealthLevel(deadline?: string): HealthLevel {
  if (!deadline) return "none";
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays <= 3) return "soon";
  return "safe";
}

const healthConfig: Record<HealthLevel, { label: string; dotColor: string; textColor: string; bgColor: string }> = {
  overdue: { label: "En retard", dotColor: "bg-red-500", textColor: "text-red-600", bgColor: "bg-red-50" },
  today: { label: "Aujourd'hui", dotColor: "bg-amber-500", textColor: "text-amber-600", bgColor: "bg-amber-50" },
  soon: { label: "Bientôt", dotColor: "bg-orange-400", textColor: "text-orange-600", bgColor: "bg-orange-50" },
  safe: { label: "En bonne voie", dotColor: "bg-emerald-500", textColor: "text-emerald-600", bgColor: "bg-emerald-50" },
  none: { label: "Pas de deadline", dotColor: "bg-gray-300", textColor: "text-gray-500", bgColor: "bg-gray-50" },
};

export default function DeadlineHealth({ deadline, compact = false }: DeadlineHealthProps) {
  const level = getHealthLevel(deadline);
  const config = healthConfig[level];

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1`} title={config.label}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${config.bgColor} ${config.textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}

export { getHealthLevel, healthConfig };
export type { HealthLevel };
