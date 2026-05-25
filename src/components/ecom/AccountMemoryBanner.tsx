"use client";

import { AlertTriangle, LogOut } from "lucide-react";
import { useAccountMemory } from "@/lib/hooks/use-account-memory";

/**
 * Banner d'avertissement affiché quand le compte courant n'a aucune intégration
 * ecom alors qu'un autre compte connu de ce navigateur en a. Explique pourquoi
 * les intégrations semblent "oubliées" et propose de revenir sur le bon compte.
 * Fonctionne pour tous les comptes (registre multi-comptes).
 */
export default function AccountMemoryBanner() {
  const { shouldSuggestSwitch, currentEmail, accountsWithIntegrations } = useAccountMemory();

  if (!shouldSuggestSwitch || accountsWithIntegrations.length === 0) return null;

  // Compte le plus récemment vu qui a des intégrations
  const target = accountsWithIntegrations[0];
  const targetLabel = target.email ?? "un autre compte";
  const integrationsLabel = [
    target.hasShopify ? "Shopify" : null,
    target.hasPinterest ? "Pinterest" : null,
  ].filter(Boolean).join(" et ");

  return (
    <div className="mb-4 flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
      <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-amber-800">Compte sans intégration</p>
        <p className="text-[12px] text-amber-700 mt-0.5 leading-snug">
          Tu es connecté avec <strong>{currentEmail ?? "ce compte"}</strong>, qui n&apos;a
          aucune intégration. Tes connexions {integrationsLabel || "ecom"} sont sur{" "}
          <strong>{targetLabel}</strong>. Reconnecte-toi avec ce compte pour les retrouver.
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-semibold text-amber-800 hover:underline"
        >
          <LogOut size={12} />
          Se reconnecter avec {targetLabel}
        </a>
      </div>
    </div>
  );
}
