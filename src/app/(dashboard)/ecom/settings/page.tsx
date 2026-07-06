"use client";

/**
 * ECOM — Réglages (refonte : fusion des Réglages ECOM et des Réglages coûts).
 * Onglets : Coûts & objectifs · Intégrations (Shopify, Google Ads, Pinterest
 * inactif, pixels par boutique) · Seuils & alertes · Général.
 */
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SettingsTabs, { type SettingsTabId } from "@/components/ecom/SettingsTabs";
import IntegrationsTab from "@/components/ecom/IntegrationsTab";
import GeneralTab from "@/components/ecom/GeneralTab";
import RoasTab from "@/components/ecom/RoasTab";
import CostsSettings from "@/components/ecom/gads/CostsSettings";

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as SettingsTabId | null;
  const active: SettingsTabId = tabParam && ["couts", "general", "integrations", "roas"].includes(tabParam) ? tabParam : "couts";

  return (
    <div className={active === "couts" ? "max-w-4xl" : "max-w-3xl"}>
      <h1 className="text-[22px] font-bold text-[#1a1535] tracking-tight mb-1">Réglages</h1>
      <p className="text-[12px] text-[#8A8A88] mb-4">Coûts, objectifs, intégrations et seuils du module</p>

      <SettingsTabs active={active} />

      {active === "couts" && <CostsSettings />}
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
