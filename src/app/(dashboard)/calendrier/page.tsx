"use client";

import dynamic from "next/dynamic";

const CalendarWorkspace = dynamic(
  () => import("@/components/calendrier/CalendarWorkspace"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function CalendrierPage() {
  return <CalendarWorkspace />;
}
