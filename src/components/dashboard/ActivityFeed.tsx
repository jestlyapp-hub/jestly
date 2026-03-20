"use client";

// No mock data — show empty state until real activity tracking exists

export default function ActivityFeed() {
  return (
    <div className="bg-white rounded-xl border border-[#E6E6E4]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E6E6E4] flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#191919]">Activité récente</h2>
      </div>

      {/* Empty state */}
      <div className="p-5">
        <div className="py-8 text-center">
          <svg
            className="w-8 h-8 text-[#DDD] mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-[13px] text-[#999]">Aucune activité récente</p>
        </div>
      </div>
    </div>
  );
}
