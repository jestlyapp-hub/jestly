"use client";
import { usePageTitle } from "@/lib/hooks/use-page-title";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatDate, formatFinancialStatus, formatFulfillmentStatus } from "@/lib/shopify/formatters";
import { ArrowLeft, ExternalLink } from "lucide-react";
import ChannelChip from "@/components/ecom/ChannelChip";
import TrackingStatusBadge from "@/components/ecom/TrackingStatusBadge";
import { CHANNEL_LABELS, CONFIDENCE_LABELS, resolveDisplayStatus, type Channel, type DisplayChannel, type ManualConfidence, type PixelResolvedSource } from "@/lib/gads/channels";

interface OrderAttribution {
  channel: DisplayChannel;
  origin: "native" | "pixel" | "manual" | "unattributed";
  tracking_status: "tracked" | "ghost" | "unmatched" | null;
  measured_channel: Exclude<Channel, "ghost"> | null;
  pixel: { resolved_source: PixelResolvedSource; match_method: string; confidence: number } | null;
  manual: { channel: Channel; confidence: ManualConfidence | null; note: string | null } | null;
}

const ORIGIN_META: Record<OrderAttribution["origin"], { label: string; cls: string }> = {
  native: { label: "Shopify natif", cls: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  pixel: { label: "Pixel Jestly", cls: "bg-sky-50 border-sky-200 text-sky-700" },
  manual: { label: "Manuel", cls: "bg-[#EDE9FE] border-[#DDD6FE] text-[#7C3AED]" },
  unattributed: { label: "Non résolu", cls: "bg-amber-50 border-amber-200 text-amber-700" },
};

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
  attribution?: OrderAttribution;
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

          {/* Attribution — deux dimensions distinctes, jamais fusionnées :
              la traçabilité technique (fait Shopify) ET le canal retenu (résolution). */}
          {o.attribution && <AttributionCard a={o.attribution} rawUtm={{ source: o.utm_source, medium: o.utm_medium, campaign: o.utm_campaign }} />}
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

function AttributionCard({
  a,
  rawUtm,
}: {
  a: OrderAttribution;
  rawUtm: { source: string | null; medium: string | null; campaign: string | null };
}) {
  const origin = ORIGIN_META[a.origin];
  const isGhost = a.tracking_status === "ghost" || a.tracking_status === "unmatched";
  const attributedManually = a.origin === "manual";
  const hasResolution = a.origin === "pixel" || a.origin === "manual";
  const displayStatus = resolveDisplayStatus(a.tracking_status, hasResolution);
  const statusTitle = displayStatus === "resolved_jestly"
    ? `Parcours non capté par Shopify — cette vente est comptée dans ${CHANNEL_LABELS[a.channel as Channel] ?? a.channel} via ${attributedManually ? "ton attribution manuelle" : "le pixel Jestly"}. La traçabilité en base reste « ${a.tracking_status} ».`
    : undefined;
  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <h3 className="text-[13px] font-bold text-[#191919] mb-3">Attribution</h3>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* Dimension A — statut d'affichage (dérivé : Trackée / Résolu Jestly / Fantôme) */}
        <div>
          <div className="text-[10px] text-[#8A8A88] mb-1">Statut</div>
          <TrackingStatusBadge status={displayStatus} title={statusTitle} className="text-[12px]" />
        </div>

        {/* Dimension B — canal retenu (résolution, coloré par origine) */}
        <div>
          <div className="text-[10px] text-[#8A8A88] mb-1">Canal retenu</div>
          <div className="flex items-center gap-1.5">
            <ChannelChip channel={a.channel} />
            <span className={`inline-flex px-1.5 py-0.5 rounded border text-[10px] font-semibold ${origin.cls}`}>
              {origin.label}
            </span>
            {attributedManually && a.manual?.confidence && (
              <span className="text-[10px] text-[#8A8A88]">· {CONFIDENCE_LABELS[a.manual.confidence].toLowerCase()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Le fantôme n'est PAS une exclusion : la vente compte dans le canal résolu. */}
      {isGhost && (
        <p className="text-[11px] text-[#8A8A88] mt-3 leading-relaxed">
          Parcours non capté par Shopify —{" "}
          {attributedManually
            ? <>mais cette vente est bien comptée dans <span className="text-[#7C3AED] font-medium">{CHANNEL_LABELS[a.manual!.channel]}</span> (ton attribution manuelle). La traçabilité décrit la captation, pas l&apos;exclusion.</>
            : a.origin === "pixel"
              ? <>mais cette vente est résolue par le pixel Jestly et comptée dans <span className="text-sky-700 font-medium">{a.channel === "direct" ? "Direct" : CHANNEL_LABELS[a.channel as Channel] ?? a.channel}</span>.</>
              : <>tu peux lui attribuer un canal depuis la vue Commandes ; elle sera alors comptée dans les stats sans changer sa traçabilité.</>}
        </p>
      )}

      {/* Détail technique brut (secondaire) — utile mais jamais utilisé comme canal. */}
      {(rawUtm.source || rawUtm.medium || rawUtm.campaign || a.pixel) && (
        <dl className="grid grid-cols-2 gap-y-1.5 text-[12px] mt-3 pt-3 border-t border-[#EFEFEF]">
          {rawUtm.source && <Item label="utm_source" value={rawUtm.source} />}
          {rawUtm.medium && <Item label="utm_medium" value={rawUtm.medium} />}
          {rawUtm.campaign && <Item label="utm_campaign" value={rawUtm.campaign} />}
          {a.pixel && (
            <Item
              label="Pixel Jestly"
              value={`${a.pixel.resolved_source === "direct" ? "Direct" : CHANNEL_LABELS[a.pixel.resolved_source as Channel] ?? a.pixel.resolved_source} · ${Math.round(a.pixel.confidence * 100)} %`}
            />
          )}
        </dl>
      )}
    </div>
  );
}
