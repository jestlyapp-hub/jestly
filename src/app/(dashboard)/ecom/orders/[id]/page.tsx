"use client";
import { usePageTitle } from "@/lib/hooks/use-page-title";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatDate, formatFinancialStatus, formatFulfillmentStatus, formatSource } from "@/lib/shopify/formatters";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface OrderDetail {
  id: string;
  shopify_order_id: string;
  name: string;
  created_at: string;
  total_price: number;
  subtotal_price: number;
  total_tax: number;
  total_shipping: number;
  total_discounts: number;
  currency: string;
  financial_status: string | null;
  fulfillment_status: string | null;
  email: string | null;
  phone: string | null;
  line_items: Array<{ id: string; title: string; variant_title: string | null; quantity: number; price: number; image_url: string | null }>;
  shipping_address: { first_name?: string; last_name?: string; address1?: string; city?: string; country?: string; zip?: string } | null;
  source_name: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

const COLOR_CLASSES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  gray: "bg-[#F7F7F5] text-[#5A5A58] border-[#E6E6E4]",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  usePageTitle("Détail commande ECOM");
  const { id } = use(params);
  const { data: integ } = useApi<{ integration: { shop_domain: string } }>("/api/integrations/shopify/sync-state");
  const { data: order, loading } = useApi<{ data: OrderDetail }>(`/api/ecom/orders/${id}`);

  if (loading) return <div className="text-[13px] text-[#8A8A88] py-10 text-center">Chargement…</div>;
  if (!order?.data) return <div className="text-[13px] text-[#8A8A88] py-10 text-center">Commande introuvable</div>;

  const o = order.data;
  const fin = formatFinancialStatus(o.financial_status);
  const ful = formatFulfillmentStatus(o.fulfillment_status);

  return (
    <div className="max-w-4xl">
      <Link href="/ecom/orders" className="inline-flex items-center gap-1.5 text-[12px] text-[#5A5A58] hover:text-[#191919] mb-3">
        <ArrowLeft size={12} /> Toutes les commandes
      </Link>

      <header className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[24px] font-bold text-[#191919] tracking-tight">{o.name}</h1>
          <p className="text-[12px] text-[#8A8A88]">{formatDate(o.created_at)}</p>
        </div>
        {integ?.integration?.shop_domain && (
          <a
            href={`https://${integ.integration.shop_domain}/admin/orders/${o.shopify_order_id}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] hover:bg-[var(--ecom-surface-sunken)]"
          >
            <ExternalLink size={12} /> Voir dans Shopify
          </a>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {/* Line items */}
          <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
            <h3 className="text-[13px] font-bold text-[#191919] mb-3">Articles</h3>
            <ul className="divide-y divide-[#F7F7F5]">
              {o.line_items.map((li) => (
                <li key={li.id} className="py-2 flex items-center gap-3">
                  {li.image_url ? (
                    <Image src={li.image_url} alt={li.title} width={40} height={40} className="rounded object-cover w-10 h-10" unoptimized />
                  ) : (
                    <div className="w-10 h-10 rounded bg-[#F7F7F5]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-[#191919] line-clamp-1">{li.title}</div>
                    {li.variant_title && <div className="text-[11px] text-[#8A8A88]">{li.variant_title}</div>}
                  </div>
                  <div className="text-[12px] text-[#5A5A58] tabular-nums">×{li.quantity}</div>
                  <div className="text-[12px] font-semibold text-[#191919] tabular-nums w-20 text-right">
                    {formatCurrency(li.price * li.quantity, o.currency)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-[#EFEFEF] space-y-1 text-[12px]">
              <Row label="Sous-total" value={formatCurrency(o.subtotal_price, o.currency)} />
              <Row label="Livraison" value={formatCurrency(o.total_shipping, o.currency)} />
              <Row label="Taxes" value={formatCurrency(o.total_tax, o.currency)} />
              {o.total_discounts > 0 && <Row label="Remise" value={`−${formatCurrency(o.total_discounts, o.currency)}`} />}
              <Row label="Total" value={formatCurrency(o.total_price, o.currency)} bold />
            </div>
          </div>

          {/* Attribution */}
          {(o.utm_source || o.source_name) && (
            <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
              <h3 className="text-[13px] font-bold text-[#191919] mb-3">Attribution</h3>
              <dl className="grid grid-cols-2 gap-y-1.5 text-[12px]">
                <Item label="Source" value={formatSource(o.utm_source ?? o.source_name)} />
                {o.utm_medium && <Item label="Medium" value={o.utm_medium} />}
                {o.utm_campaign && <Item label="Campagne" value={o.utm_campaign} />}
              </dl>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
            <h3 className="text-[13px] font-bold text-[#191919] mb-2">Statuts</h3>
            <div className="flex gap-1.5 mb-3">
              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${COLOR_CLASSES[fin.color]}`}>{fin.label}</span>
              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${COLOR_CLASSES[ful.color]}`}>{ful.label}</span>
            </div>
          </div>
          <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
            <h3 className="text-[13px] font-bold text-[#191919] mb-2">Client</h3>
            <dl className="text-[12px] text-[#5A5A58] space-y-1">
              <div>{o.email ?? "—"}</div>
              {o.phone && <div>{o.phone}</div>}
              {o.shipping_address && (
                <div className="text-[11px] mt-2 pt-2 border-t border-[#EFEFEF]">
                  <div className="font-medium text-[#191919]">
                    {o.shipping_address.first_name} {o.shipping_address.last_name}
                  </div>
                  <div>{o.shipping_address.address1}</div>
                  <div>{o.shipping_address.zip} {o.shipping_address.city}</div>
                  <div>{o.shipping_address.country}</div>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-[#191919] text-[13px] pt-1" : "text-[#5A5A58]"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[#8A8A88]">{label}</dt>
      <dd className="text-[#191919] font-medium text-right">{value}</dd>
    </>
  );
}
