"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useApi } from "@/lib/hooks/use-api";
import { clientDetailFromRecord } from "@/lib/adapters";
import Tabs from "@/components/ui/Tabs";
import ClientDetailHeader from "@/components/clients/ClientDetailHeader";
import ClientOverviewTab from "@/components/clients/ClientOverviewTab";
import ClientOrdersTab from "@/components/clients/ClientOrdersTab";
import ClientNotesTab from "@/components/clients/ClientNotesTab";
import ClientSettingsTab from "@/components/clients/ClientSettingsTab";
import type { ClientDetail } from "@/types";

const TABS = ["Vue d'ensemble", "Commandes", "Notes & Historique", "Paramètres"];

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [tab, setTab] = useState(TABS[0]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: raw, loading, error, mutate } = useApi<any>(`/api/clients/${clientId}`);
  const client: ClientDetail | null = raw ? clientDetailFromRecord(raw) : null;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="h-[120px] bg-[#F7F7F5] rounded-xl animate-pulse mb-4" />
        <div className="h-10 w-80 bg-[#F7F7F5] rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#F7F7F5] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <p className="text-[14px] text-red-500 mb-2">Client introuvable</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ClientDetailHeader client={client} />
      </motion.div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </motion.div>

      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {tab === "Vue d'ensemble" && <ClientOverviewTab client={client} />}
        {tab === "Commandes" && <ClientOrdersTab clientId={client.id} />}
        {tab === "Notes & Historique" && <ClientNotesTab clientId={client.id} />}
        {tab === "Paramètres" && <ClientSettingsTab client={client} onUpdate={mutate} />}
      </motion.div>
    </div>
  );
}
