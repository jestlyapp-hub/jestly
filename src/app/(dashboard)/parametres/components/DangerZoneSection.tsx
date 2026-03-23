"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Unplug, RotateCcw, Trash2, Globe, GraduationCap, AlertTriangle } from "lucide-react";
import { SectionCard } from "./shared";

function DangerAction({ icon: Icon, title, description, buttonLabel, buttonColor, onConfirm, implemented, confirmMessage }: {
  icon: typeof Unplug;
  title: string;
  description: string;
  buttonLabel: string;
  buttonColor: "amber" | "red";
  onConfirm: () => void | Promise<void>;
  implemented?: boolean;
  confirmMessage?: string;
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
                <span className="text-[12px] text-[#57534E]">{confirmMessage || "Êtes-vous sûr ?"}</span>
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
  const router = useRouter();
  const [siteId, setSiteId] = useState<string | null>(null);

  // Charger le siteId du premier site de l'utilisateur
  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.ok ? r.json() : [])
      .then((sites) => {
        const arr = Array.isArray(sites) ? sites : [];
        if (arr.length > 0) setSiteId(arr[0].id);
      })
      .catch(() => {});
  }, []);

  const handleDeleteSite = async () => {
    if (!siteId) return;
    const res = await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/site-web/nouveau");
    } else {
      const body = await res.json().catch(() => ({}));
      alert(body.error || "Erreur lors de la suppression du site");
    }
  };

  const handleResetGuide = () => {
    localStorage.removeItem("jestly_guide_v3");
    localStorage.removeItem("jestly_guide_v3_launch_dismissed");
    window.location.reload();
  };

  const handleResetAccount = async () => {
    if (!siteId) return;
    try {
      // Supprimer tous les produits
      const prodRes = await fetch("/api/products");
      if (prodRes.ok) {
        const products = await prodRes.json();
        const arr = Array.isArray(products) ? products : (products?.data || []);
        for (const p of arr) {
          await fetch(`/api/products/${p.id}`, { method: "DELETE" }).catch(() => {});
        }
      }
      // Supprimer tous les brief templates
      const briefRes = await fetch("/api/brief-templates");
      if (briefRes.ok) {
        const briefs = await briefRes.json();
        const arr = Array.isArray(briefs) ? briefs : [];
        for (const b of arr) {
          await fetch(`/api/brief-templates/${b.id}`, { method: "DELETE" }).catch(() => {});
        }
      }
      // Supprimer le site
      await fetch(`/api/sites/${siteId}`, { method: "DELETE" }).catch(() => {});
      // Reset guide + localStorage
      localStorage.removeItem("jestly_guide_v3");
      localStorage.removeItem("jestly_guide_v3_launch_dismissed");
      // Rediriger vers création de site
      router.push("/site-web/nouveau");
    } catch {
      alert("Erreur lors de la réinitialisation");
    }
  };

  return (
    <SectionCard id="danger" title="Zone dangereuse" description="Actions irréversibles — à utiliser avec précaution." danger>
      <div className="space-y-3">
        {/* Recommencer le guide */}
        <DangerAction
          icon={GraduationCap}
          title="Recommencer le guide"
          description="Remet le guide interactif à zéro. Vous pourrez le relancer depuis la sidebar."
          buttonLabel="Recommencer le guide"
          buttonColor="amber"
          onConfirm={handleResetGuide}
          implemented={true}
          confirmMessage="Le guide sera remis à zéro."
        />

        {/* Supprimer le site */}
        <DangerAction
          icon={Globe}
          title="Supprimer le site"
          description="Supprime votre site vitrine (pages, blocs, design). Vos offres, briefs et clients sont conservés."
          buttonLabel="Supprimer le site"
          buttonColor="red"
          onConfirm={handleDeleteSite}
          implemented={!!siteId}
          confirmMessage="Le site sera définitivement supprimé. Vos offres et briefs seront conservés."
        />

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

        {/* Réinitialiser tout le compte */}
        <DangerAction
          icon={AlertTriangle}
          title="Réinitialiser tout le compte"
          description="Supprime le site, tous les produits, tous les briefs et remet le guide à zéro. Vos clients et commandes sont conservés."
          buttonLabel="Tout réinitialiser"
          buttonColor="red"
          onConfirm={handleResetAccount}
          implemented={!!siteId}
          confirmMessage="Tout sera supprimé : site, produits, briefs. Cette action est irréversible."
        />

        <DangerAction
          icon={Trash2}
          title="Supprimer le compte"
          description="Supprime définitivement votre compte et toutes vos données. Cette action est irréversible."
          buttonLabel="Supprimer mon compte"
          buttonColor="red"
          onConfirm={async () => {
            const res = await fetch("/api/account/delete", { method: "DELETE" });
            if (res.ok) {
              // Clear all localStorage (guide state, preferences, etc.)
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = "/login";
            } else {
              const body = await res.json().catch(() => ({}));
              alert(body.error || "Erreur lors de la suppression du compte");
            }
          }}
          implemented={true}
          confirmMessage="Toutes vos données seront définitivement supprimées : site, produits, commandes, clients, tâches. Cette action est irréversible."
        />
      </div>
    </SectionCard>
  );
}
