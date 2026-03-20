"use client";

import { useState } from "react";
import { Unplug, RotateCcw, Trash2 } from "lucide-react";
import { SectionCard } from "./shared";

function DangerAction({ icon: Icon, title, description, buttonLabel, buttonColor, onConfirm, implemented }: {
  icon: typeof Unplug;
  title: string;
  description: string;
  buttonLabel: string;
  buttonColor: "amber" | "red";
  onConfirm: () => void;
  implemented?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const colors = {
    amber: {
      btn: "text-amber-600 border-amber-200 hover:bg-amber-50",
      confirmBtn: "text-white bg-amber-600 hover:bg-amber-700",
    },
    red: {
      btn: "text-red-600 border-red-200 hover:bg-red-50",
      confirmBtn: "text-white bg-red-600 hover:bg-red-700",
    },
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex items-start gap-4 px-4 py-4 rounded-lg border border-[#E6E6E4]">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${buttonColor === "red" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#191919]">{title}</span>
          {!implemented && <span className="text-[10px] font-semibold text-[#A8A29E] bg-[#F5F5F4] px-1.5 py-0.5 rounded-full">Bientôt</span>}
        </div>
        <p className="text-[12px] text-[#A8A29E] mt-0.5">{description}</p>
        {implemented && (
          <div className="mt-3">
            {confirming ? (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#57534E]">Êtes-vous sûr ?</span>
                <button onClick={handleConfirm} disabled={loading} className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${colors[buttonColor].confirmBtn}`}>
                  {loading ? "..." : "Confirmer"}
                </button>
                <button onClick={() => setConfirming(false)} disabled={loading} className="text-[12px] font-medium text-[#A8A29E] px-3 py-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors">
                  Annuler
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)} className={`text-[12px] font-medium border px-3 py-1.5 rounded-lg transition-colors ${colors[buttonColor].btn}`}>
                {buttonLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function DangerZoneSection({ onResetPreferences }: {
  onResetPreferences?: () => void;
}) {
  return (
    <SectionCard id="danger" title="Zone dangereuse" description="Actions irréversibles — à utiliser avec précaution." danger>
      <div className="space-y-3">
        <DangerAction
          icon={Unplug}
          title="Déconnecter toutes les intégrations"
          description="Stripe, Google Calendar et autres seront déconnectés."
          buttonLabel="Déconnecter tout"
          buttonColor="amber"
          onConfirm={() => {}}
          implemented={false}
        />
        <DangerAction
          icon={RotateCcw}
          title="Réinitialiser les préférences"
          description="Remet toutes les préférences à leurs valeurs par défaut."
          buttonLabel="Réinitialiser"
          buttonColor="amber"
          onConfirm={() => onResetPreferences?.()}
          implemented={!!onResetPreferences}
        />
        <DangerAction
          icon={Trash2}
          title="Supprimer le compte"
          description="Supprime définitivement votre compte et toutes vos données. Cette action est irréversible. Contactez support@jestly.fr pour effectuer cette action."
          buttonLabel="Supprimer mon compte"
          buttonColor="red"
          onConfirm={() => {
            window.location.href = "mailto:support@jestly.fr?subject=Suppression%20de%20compte&body=Bonjour%2C%20je%20souhaite%20supprimer%20mon%20compte%20Jestly.";
          }}
          implemented={true}
        />
      </div>
    </SectionCard>
  );
}
