"use client";

import type { ProfileData } from "./shared";
import { SectionCard, INTEGRATIONS } from "./shared";

export function IntegrationsSection({ profile }: {
  profile: ProfileData;
}) {
  const connected = new Set<string>();
  if (profile.stripe_customer_id) connected.add("stripe");

  const grouped = INTEGRATIONS.reduce((acc, i) => {
    (acc[i.category] ??= []).push(i);
    return acc;
  }, {} as Record<string, typeof INTEGRATIONS>);

  return (
    <SectionCard id="integrations" title="Intégrations" description="Connectez vos outils pour automatiser votre workflow.">
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-3">{category}</p>
            <div className="space-y-2">
              {items.map(item => {
                const isConnected = connected.has(item.key);
                const isSoon = item.status === "soon";

                return (
                  <div key={item.key} className="flex items-center justify-between px-4 py-3 rounded-lg border border-[#E6E6E4] hover:bg-[#FBFBFA] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold flex-shrink-0 ${
                        isConnected ? "bg-emerald-50 text-emerald-600" : isSoon ? "bg-[#F5F5F4] text-[#C4C4C2]" : "bg-[#F0EEFF] text-[#7C3AED]"
                      }`}>
                        {item.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-[#1A1A1A]">{item.name}</span>
                          {isConnected && (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Connecté</span>
                          )}
                          {isSoon && (
                            <span className="text-[10px] font-semibold text-[#A8A29E] bg-[#F5F5F4] px-1.5 py-0.5 rounded-full">Bientôt</span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#A8A29E] truncate">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 ml-3">
                      {isConnected ? (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Actif</span>
                      ) : isSoon ? (
                        <span className="text-[12px] text-[#D6D3D1]">—</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#A8A29E] bg-[#F5F5F4] px-2 py-0.5 rounded-full">Bientôt</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
