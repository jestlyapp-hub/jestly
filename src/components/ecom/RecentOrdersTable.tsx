"use client";

import Link from "next/link";
import { formatCurrency, formatRelativeDate, formatFinancialStatus, formatFulfillmentStatus, formatSource } from "@/lib/shopify/formatters";

interface OrderItem {
  id: string;
  name: string;
  created_at: string;
  total_price: number;
  currency: string;
  email: string | null;
  financial_status: string | null;
  fulfillment_status: string | null;
  source: string | null;
  is_test?: boolean;
}

const COLOR_CLASSES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  gray: "bg-[#F7F7F5] text-[#5A5A58] border-[#E6E6E4]",
};

function Badge({ label, color }: { label: string; color: string }) {
  const cls = COLOR_CLASSES[color] ?? COLOR_CLASSES.gray;
  return <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${cls}`}>{label}</span>;
}

export default function RecentOrdersTable({ data }: { data: OrderItem[] }) {
  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-[#191919]">Commandes récentes</h3>
        <Link href="/ecom/orders" className="text-[11px] text-[#7C3AED] hover:underline font-semibold">
          Voir toutes →
        </Link>
      </div>
      {data.length === 0 ? (
        <p className="text-[12px] text-[#8A8A88] py-6 text-center">Aucune commande</p>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[#8A8A88] border-b border-[#EFEFEF]">
                <th className="pb-2">N°</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Client</th>
                <th className="pb-2 text-right">Montant</th>
                <th className="pb-2">Paiement</th>
                <th className="pb-2">Envoi</th>
                <th className="pb-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {data.map((o) => {
                const fin = formatFinancialStatus(o.financial_status);
                const ful = formatFulfillmentStatus(o.fulfillment_status);
                return (
                  <tr key={o.id} className="border-b border-[#F7F7F5] last:border-0 hover:bg-[#FBFBFA]">
                    <td className="py-2 pr-2 text-[12px] font-semibold text-[#191919]">
                      <Link href={`/ecom/orders/${o.id}`} className="hover:text-[#7C3AED]">{o.name}</Link>
                      {o.is_test && (
                        <span className="ml-1.5 inline-flex px-1 py-0.5 rounded bg-[#F7F7F5] text-[#8A8A88] text-[9px] font-medium border border-[#E6E6E4]">Test</span>
                      )}
                    </td>
                    <td className="py-2 pr-2 text-[12px] text-[#8A8A88] whitespace-nowrap">{formatRelativeDate(o.created_at)}</td>
                    <td className="py-2 pr-2 text-[12px] text-[#5A5A58] truncate max-w-[180px]">{o.email ?? "—"}</td>
                    <td className="py-2 pr-2 text-[12px] font-semibold text-[#191919] tabular-nums text-right whitespace-nowrap">
                      {formatCurrency(o.total_price, o.currency)}
                    </td>
                    <td className="py-2 pr-2"><Badge label={fin.label} color={fin.color} /></td>
                    <td className="py-2 pr-2"><Badge label={ful.label} color={ful.color} /></td>
                    <td className="py-2 text-[11px] text-[#8A8A88]">{formatSource(o.source)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
