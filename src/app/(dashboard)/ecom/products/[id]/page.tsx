"use client";
import { usePageTitle } from "@/lib/hooks/use-page-title";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatNumber, formatDate } from "@/lib/shopify/formatters";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface ProductDetail {
  id: string;
  shopify_product_id: string;
  title: string;
  handle: string;
  description: string;
  status: string;
  vendor: string | null;
  product_type: string | null;
  tags: string[];
  total_inventory: number | null;
  price_min: number | null;
  price_max: number | null;
  featured_image_url: string | null;
  images: { url: string; alt: string | null }[];
  variants: { id: string; title: string; sku: string | null; price: number; inventory_quantity: number }[];
  created_at: string;
  updated_at: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  usePageTitle("Détail produit ECOM");
  const { id } = use(params);
  const { data: integ } = useApi<{ integration: { shop_domain: string } }>("/api/integrations/shopify/sync-state");
  const { data, loading } = useApi<{ data: ProductDetail }>(`/api/ecom/products/${id}`);

  if (loading) return <div className="text-[13px] text-[#8A8A88] py-10 text-center">Chargement…</div>;
  if (!data?.data) return <div className="text-[13px] text-[#8A8A88] py-10 text-center">Produit introuvable</div>;
  const p = data.data;

  return (
    <div className="max-w-5xl">
      <Link href="/ecom/products" className="inline-flex items-center gap-1.5 text-[12px] text-[#5A5A58] hover:text-[#191919] mb-3">
        <ArrowLeft size={12} /> Tous les produits
      </Link>
      <header className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-[#191919] tracking-tight">{p.title}</h1>
          <p className="text-[12px] text-[#8A8A88]">/{p.handle} · {p.vendor ?? "—"}</p>
        </div>
        {integ?.integration?.shop_domain && (
          <a href={`https://${integ.integration.shop_domain}/admin/products/${p.shopify_product_id}`}
             target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] hover:bg-[var(--ecom-surface-sunken)]">
            <ExternalLink size={12} /> Shopify
          </a>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {p.images.slice(0, 6).map((img, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[#F7F7F5] relative">
                <Image src={img.url} alt={img.alt ?? p.title} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
          <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
            <h3 className="text-[13px] font-bold text-[#191919] mb-2">Description</h3>
            <p className="text-[12px] text-[#5A5A58] whitespace-pre-wrap">{p.description || "Aucune description"}</p>
          </div>

          {p.variants.length > 0 && (
            <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
              <h3 className="text-[13px] font-bold text-[#191919] mb-3">Variantes ({p.variants.length})</h3>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[#8A8A88] border-b border-[#EFEFEF]">
                    <th className="pb-2">Variante</th>
                    <th className="pb-2">SKU</th>
                    <th className="pb-2 text-right">Prix</th>
                    <th className="pb-2 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {p.variants.map((v) => (
                    <tr key={v.id} className="border-b border-[#F7F7F5] last:border-0">
                      <td className="py-1.5 text-[12px] text-[#191919]">{v.title}</td>
                      <td className="py-1.5 text-[11px] text-[#8A8A88]">{v.sku ?? "—"}</td>
                      <td className="py-1.5 text-[12px] tabular-nums text-right text-[#191919]">{formatCurrency(v.price)}</td>
                      <td className={`py-1.5 text-[12px] tabular-nums text-right ${v.inventory_quantity < 5 ? "text-rose-600 font-semibold" : "text-[#5A5A58]"}`}>
                        {formatNumber(v.inventory_quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
            <h3 className="text-[13px] font-bold text-[#191919] mb-2">Infos</h3>
            <dl className="text-[12px] space-y-1.5">
              <Info label="Statut" value={p.status} />
              <Info label="Type" value={p.product_type ?? "—"} />
              <Info label="Stock total" value={p.total_inventory != null ? formatNumber(p.total_inventory) : "—"} />
              <Info label="Prix" value={
                p.price_min === p.price_max
                  ? formatCurrency(p.price_min ?? 0)
                  : `${formatCurrency(p.price_min ?? 0)} – ${formatCurrency(p.price_max ?? 0)}`
              } />
              <Info label="Créé le" value={formatDate(p.created_at)} />
              <Info label="MAJ" value={formatDate(p.updated_at)} />
            </dl>
          </div>
          {p.tags.length > 0 && (
            <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
              <h3 className="text-[13px] font-bold text-[#191919] mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="inline-flex px-2 py-0.5 rounded bg-[#F0EEFF] text-[#7C3AED] text-[10px] font-medium">{t}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-[#8A8A88]">{label}</dt>
      <dd className="text-[#191919] font-medium text-right">{value}</dd>
    </div>
  );
}
