"use client";

import { AlertTriangle, LogOut } from "lucide-react";
import { useAccountMemory } from "@/lib/hooks/use-account-memory";

/**
 * Banner d'avertissement affiché quand l'utilisateur connecté diffère du dernier
 * compte ayant utilisé l'ecom sur ce navigateur. Explique pourquoi ses
 * intégrations Pinterest/Shopify semblent "oubliées".
 */
export default function AccountMemoryBanner() {
  const { accountMismatch, currentEmail, rememberedEmail } = useAccountMemory();

  if (!accountMismatch || !rememberedEmail) return null;

  return (
    <div className="mb-4 flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
      <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-amber-800">
          Compte différent détecté
        </p>
        <p className="text-[12px] text-amber-700 mt-0.5 leading-snug">
          Tu es connecté avec <strong>{currentEmail ?? "ce compte"}</strong>, mais tes
          intégrations Pinterest et Shopify ont été configurées sur{" "}
          <strong>{rememberedEmail}</strong>. Les intégrations sont liées à un compte —
          reconnecte-toi avec <strong>{rememberedEmail}</strong> pour les retrouver.
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-semibold text-amber-800 hover:underline"
        >
          <LogOut size={12} />
          Se reconnecter avec {rememberedEmail}
        </a>
      </div>
    </div>
  );
}
