"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Settings, Plug, TrendingUp, Wallet } from "lucide-react";

export type SettingsTabId = "couts" | "integrations" | "roas" | "general";

interface Props {
  active: SettingsTabId;
}

const TABS: { id: SettingsTabId; label: string; icon: typeof Settings }[] = [
  { id: "couts", label: "Coûts & objectifs", icon: Wallet },
  { id: "integrations", label: "Intégrations", icon: Plug },
  { id: "roas", label: "Seuils & alertes", icon: TrendingUp },
  { id: "general", label: "Général", icon: Settings },
];

export default function SettingsTabs({ active }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goTo = useMemo(() => (tab: SettingsTabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/ecom/settings?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="border-b border-[#E6E6E4] mb-6 -mx-6 px-6">
      <nav className="flex items-center gap-1">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => goTo(tab.id)}
              className={`relative inline-flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium transition-colors ${
                isActive ? "text-[#7C3AED]" : "text-[#5A5A58] hover:text-[#191919]"
              }`}
            >
              <Icon size={14} strokeWidth={1.8} />
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#7C3AED] rounded-t-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
