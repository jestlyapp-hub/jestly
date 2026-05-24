"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SettingsTabs, { type SettingsTabId } from "@/components/ecom/SettingsTabs";
import IntegrationsTab from "@/components/ecom/IntegrationsTab";
import GeneralTab from "@/components/ecom/GeneralTab";
import RoasTab from "@/components/ecom/RoasTab";

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as SettingsTabId | null;
  const active: SettingsTabId = tabParam && ["general", "integrations", "roas"].includes(tabParam) ? tabParam : "integrations";

  return (
    <div className="max-w-3xl">
      <h1 className="text-[22px] font-bold text-[#191919] tracking-tight mb-1">Réglages</h1>
      <p className="text-[12px] text-[#8A8A88] mb-4">Intégrations, configuration et préférences ROAS</p>

      <SettingsTabs active={active} />

      {active === "integrations" && <IntegrationsTab />}
      {active === "general" && <GeneralTab />}
      {active === "roas" && <RoasTab />}
    </div>
  );
}

export default function EcomSettingsPage() {
  return (
    <Suspense fallback={<div className="text-[13px] text-[#8A8A88] py-10 text-center">Chargement…</div>}>
      <SettingsContent />
    </Suspense>
  );
}
