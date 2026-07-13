"use client";

/**
 * Connexion Google Ads PAR BOUTIQUE (multi-comptes, même MCC).
 * Réservé au propriétaire du compte manager : pour chaque boutique Shopify,
 * saisie du customer_id (10 chiffres) de son sous-compte Google Ads. La dépense
 * remonte alors scopée à cette boutique. Non-propriétaire → carte informative.
 */
import { useState } from "react";
import { Loader2, Plus, Check, Trash2, RefreshCw } from "lucide-react";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";

interface GadsAccount {
  id: string;
  integration_id: string;
  customer_id: string;
  login_customer_id: string | null;
  currency: string | null;
  is_active: boolean;
}
interface ShopLite {
  id: string;
  shop_domain: string;
  metadata?: { shop_name?: string };
}

const fmtCid = (c: string) => c.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");

export default function GadsAccountsCard() {
  const accountsApi = useApi<{ accounts: GadsAccount[]; is_owner: boolean }>("/api/ecom/gads/accounts");
  const shopsApi = useApi<{ integrations?: ShopLite[] }>("/api/integrations/shopify/sync-state");
  const accounts = accountsApi.data?.accounts ?? [];
  const shops = shopsApi.data?.integrations ?? [];
  const isOwner = accountsApi.data?.is_owner === true;

  const [editing, setEditing] = useState<string | null>(null);
  const [cid, setCid] = useState("");
  const [busy, setBusy] = useState(false);

  const accountByShop = new Map(accounts.map((a) => [a.integration_id, a]));
  const shopName = (s: ShopLite) => s.metadata?.shop_name ?? s.shop_domain;

  const connect = async (integrationId: string) => {
    const clean = cid.replace(/-/g, "");
    if (!/^\d{10}$/.test(clean)) { toast.error("Le customer_id fait 10 chiffres (ex. 123-456-7890)."); return; }
    setBusy(true);
    try {
      const res = await apiFetch<{ ok: boolean; shop_name?: string }>("/api/ecom/gads/accounts", {
        method: "POST",
        body: { integration_id: integrationId, customer_id: clean },
      });
      toast.success(`Google Ads connecté${res.shop_name ? ` · ${res.shop_name}` : ""} — sync en cours`);
      setEditing(null); setCid("");
      void accountsApi.mutate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de la connexion Google Ads");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async (integrationId: string) => {
    if (!confirm("Déconnecter Google Ads de cette boutique ? Les données déjà synchronisées restent en base.")) return;
    try {
      await apiFetch(`/api/ecom/gads/accounts?integration_id=${integrationId}`, { method: "DELETE" });
      toast.success("Google Ads déconnecté");
      void accountsApi.mutate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec");
    }
  };

  const resync = async (integrationId: string) => {
    try {
      await apiFetch("/api/ecom/gads/sync-api", { method: "POST", body: { integration_id: integrationId, days: 30 } });
      toast.success("Sync Google Ads lancée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec");
    }
  };

  return (
    <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-[20px]">🔵</span>
        <div className="flex-1">
          <h3 className="text-[14px] font-bold text-[var(--ecom-navy)]">Google Ads par boutique</h3>
          <p className="text-[12px] text-[var(--ecom-muted)]">
            Un compte Google Ads (customer_id) par boutique — sous-comptes du même compte manager. La dépense et les
            campagnes remontent scopées à chaque boutique, jamais mélangées.
          </p>
        </div>
      </div>

      {!isOwner ? (
        <p className="text-[12px] text-[var(--ecom-muted)] bg-[var(--ecom-surface-sunken)] rounded-[var(--ecom-r-sm)] px-3 py-2">
          La connexion Google Ads est gérée par le propriétaire du compte manager. Tes données Ads apparaissent
          automatiquement une fois la boutique rattachée.
        </p>
      ) : (
        <div className="space-y-2">
          {shops.length === 0 && <p className="text-[12px] text-[var(--ecom-muted)]">Aucune boutique connectée.</p>}
          {shops.map((s) => {
            const acc = accountByShop.get(s.id);
            const isEditing = editing === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-wrap border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-sm)] px-3 py-2">
                <span className="text-[13px] font-medium text-[var(--ecom-navy)] min-w-[120px]">{shopName(s)}</span>
                {acc ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-[12px] text-emerald-700">
                      <Check size={13} /> {fmtCid(acc.customer_id)}
                    </span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <button onClick={() => resync(s.id)} className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-[var(--ecom-r-sm)] border border-[var(--ecom-card-border)] text-[var(--ecom-muted)] hover:text-[var(--ecom-navy)]">
                        <RefreshCw size={11} /> Resync
                      </button>
                      <button onClick={() => disconnect(s.id)} className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-[var(--ecom-r-sm)] text-rose-600 hover:bg-rose-50">
                        <Trash2 size={11} /> Déconnecter
                      </button>
                    </div>
                  </>
                ) : isEditing ? (
                  <div className="flex items-center gap-2 ml-auto flex-wrap">
                    <input
                      autoFocus
                      value={cid}
                      onChange={(e) => setCid(e.target.value)}
                      placeholder="123-456-7890"
                      className="px-2.5 py-1.5 text-[13px] font-mono border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-sm)] focus:outline-none focus:border-[var(--ecom-brand-violet)] w-[140px]"
                    />
                    <button disabled={busy} onClick={() => connect(s.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium rounded-[var(--ecom-r-sm)] bg-[var(--ecom-brand-violet)] text-white disabled:opacity-50">
                      {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Connecter
                    </button>
                    <button onClick={() => { setEditing(null); setCid(""); }} className="text-[12px] text-[var(--ecom-muted)] hover:text-[var(--ecom-navy)]">Annuler</button>
                  </div>
                ) : (
                  <button onClick={() => { setEditing(s.id); setCid(""); }} className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium rounded-[var(--ecom-r-sm)] border border-[var(--ecom-card-border)] text-[var(--ecom-brand-violet)] hover:bg-[var(--ecom-violet-light)]">
                    <Plus size={12} /> Connecter Google Ads
                  </button>
                )}
              </div>
            );
          })}
          <p className="text-[11px] text-[var(--ecom-muted)] pt-1">
            Le customer_id (10 chiffres) est en haut à droite de l&apos;admin Google Ads du sous-compte de la boutique.
          </p>
        </div>
      )}
    </div>
  );
}
