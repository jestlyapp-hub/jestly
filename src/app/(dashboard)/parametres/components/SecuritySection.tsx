"use client";

import { Smartphone, Monitor, Globe, Lock } from "lucide-react";
import type { ProfileData } from "./shared";
import { SectionCard } from "./shared";

export function SecuritySection({ profile }: {
  profile: ProfileData;
}) {
  return (
    <SectionCard id="securite" title="Sécurité" description="Protégez votre compte et gérez vos accès.">
      <div className="space-y-5">
        {/* Password — via Supabase Auth, not custom form */}
        <div>
          <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-3">Mot de passe</p>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#E6E6E4] bg-[#FBFBFA]">
            <div className="w-9 h-9 rounded-lg bg-[#F5F5F4] flex items-center justify-center flex-shrink-0">
              <Lock size={16} className="text-[#A8A29E]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-medium text-[#191919]">Modifier le mot de passe</span>
              <p className="text-[12px] text-[#A8A29E]">Un email de réinitialisation sera envoyé à votre adresse.</p>
            </div>
            <span className="text-[10px] font-semibold text-[#A8A29E] bg-[#F5F5F4] px-2 py-0.5 rounded-full">Bientôt</span>
          </div>
        </div>

        <div className="h-px bg-[#F0F0EE]" />

        {/* 2FA */}
        <div>
          <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-3">Authentification à deux facteurs (2FA)</p>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#E6E6E4] bg-[#FBFBFA]">
            <div className="w-9 h-9 rounded-lg bg-[#F5F5F4] flex items-center justify-center flex-shrink-0">
              <Smartphone size={16} className="text-[#A8A29E]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-medium text-[#191919]">Application d&apos;authentification</span>
              <p className="text-[12px] text-[#A8A29E]">Google Authenticator, Authy...</p>
            </div>
            <span className="text-[10px] font-semibold text-[#A8A29E] bg-[#F5F5F4] px-2 py-0.5 rounded-full">Bientôt</span>
          </div>
        </div>

        <div className="h-px bg-[#F0F0EE]" />

        {/* Sessions */}
        <div>
          <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-3">Sessions actives</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#7C3AED]/20 bg-[#FAFAFF]">
              <Monitor size={16} className="text-[#7C3AED] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[#191919]">Session actuelle</span>
                  <span className="text-[10px] font-semibold text-[#7C3AED] bg-[#F0EEFF] px-1.5 py-0.5 rounded-full">Cet appareil</span>
                </div>
                <p className="text-[12px] text-[#A8A29E]">Connecté maintenant</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#F0F0EE]" />

        {/* Connected auth providers */}
        <div>
          <p className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-3">Connexion</p>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#E6E6E4]">
            <Globe size={16} className="text-[#A8A29E] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-medium text-[#191919]">Google</span>
              <p className="text-[12px] text-[#A8A29E]">{profile.email}</p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Connecté</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
