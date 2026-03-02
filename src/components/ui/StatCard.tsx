interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

export default function StatCard({ label, value, change, positive = true }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E6E8F0] p-5 hover:shadow-sm hover:-translate-y-0.5 transition-all">
      <div className="text-[12px] font-medium text-[#999] uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="text-2xl font-bold text-[#1A1A1A]">{value}</div>
      {change && (
        <div className={`text-[12px] font-medium mt-1 ${positive ? "text-emerald-500" : "text-red-500"}`}>
          {change}
        </div>
      )}
    </div>
  );
}
