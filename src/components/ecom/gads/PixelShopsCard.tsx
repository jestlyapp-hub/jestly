"use client";

/**
 * Pixels first-party par boutique (Réglages → Intégrations, refonte ECOM).
 * Chaque boutique a son pixel_id et son snippet copiable — un collage dans
 * le thème et c'est branché.
 */
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";

interface PixelShop {
  id: string;
  shop_domain: string;
  label: string | null;
  is_active: boolean;
}

const snippetFor = (pixelId: string): string =>
  `<script src="https://jestly.fr/jestly-pixel.js" data-pixel-id="${pixelId}" defer></script>`;

export default function PixelShopsCard() {
  const { data } = useApi<{ shops: PixelShop[] }>("/api/ecom/gads/shops");
  const shops = data?.shops ?? [];
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(snippetFor(id));
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* presse-papier indisponible */ }
  };

  return (
    <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
      <div className="flex items-start gap-3 mb-2">
        <div className="text-2xl leading-none mt-0.5">🛰️</div>
        <div>
          <h3 className="text-[14px] font-bold text-[#1a1535]">Pixel first-party Jestly</h3>
          <p className="text-[12px] text-[#5A5A58] leading-snug mt-0.5">
            Récupère la source des ventes fantômes (consentement-aware). Un snippet par boutique,
            à coller dans le thème avant <code>&lt;/head&gt;</code>.
          </p>
        </div>
      </div>
      <div className="space-y-2 mt-3">
        {shops.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-2 bg-[#FBFBFA] border border-[#EFEFEF] rounded-lg px-3 py-2">
            <span className="text-[12px] font-semibold text-[#1a1535]">{s.label ?? s.shop_domain}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${s.is_active ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-[#F7F7F5] border-[#E5E3F0] text-[#8A8A88]"}`}>
              {s.is_active ? "Actif" : "Désactivé"}
            </span>
            <code className="text-[10px] text-[#5A5A58] truncate flex-1 min-w-[180px]">{snippetFor(s.id)}</code>
            <button onClick={() => void copy(s.id)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-white text-[#1a1535] border border-[#E5E3F0] hover:bg-[#F7F7F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]">
              {copied === s.id ? <><Check size={11} className="text-emerald-600" /> Copié</> : <><Copy size={11} /> Copier</>}
            </button>
          </div>
        ))}
        {shops.length === 0 && (
          <p className="text-[12px] text-[#8A8A88]">Aucune boutique pixel enregistrée.</p>
        )}
        {!shops.some((s) => (s.label ?? s.shop_domain).toLowerCase().includes("mignou")) && (
          <p className="text-[11px] text-[#8A8A88]">
            Mignou : pixel non enregistré — <code>node scripts/pixel-register-shop.mjs &lt;domaine&gt; &quot;Mignou&quot;</code> puis son snippet apparaîtra ici.
          </p>
        )}
      </div>
    </div>
  );
}
