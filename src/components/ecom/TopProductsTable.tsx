"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatNumber } from "@/lib/shopify/formatters";

interface Props {
  data: { id: string; title: string; image_url: string | null; units: number; revenue: number }[];
}

export default function TopProductsTable({ data }: Props) {
  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-[#191919]">Top produits</h3>
        <Link href="/ecom/products" className="text-[11px] text-[#7C3AED] hover:underline font-semibold">
          Voir tous →
        </Link>
      </div>
      {data.length === 0 ? (
        <p className="text-[12px] text-[#8A8A88] py-6 text-center">Aucune vente sur la période</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[#8A8A88] border-b border-[#EFEFEF]">
              <th className="pb-2">Produit</th>
              <th className="pb-2 text-right w-16">Unités</th>
              <th className="pb-2 text-right w-24">CA</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((p) => (
              <tr key={p.id} className="border-b border-[#F7F7F5] last:border-0 hover:bg-[#FBFBFA]">
                <td className="py-2 pr-2">
                  <div className="flex items-center gap-2.5">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.title} width={32} height={32} className="rounded object-cover w-8 h-8" unoptimized />
                    ) : (
                      <div className="w-8 h-8 rounded bg-[#F7F7F5] flex-shrink-0" />
                    )}
                    <Link href={`/ecom/products/${p.id}`} className="text-[12px] font-medium text-[#191919] hover:text-[#7C3AED] line-clamp-1">
                      {p.title}
                    </Link>
                  </div>
                </td>
                <td className="py-2 text-right text-[12px] tabular-nums text-[#5A5A58]">{formatNumber(p.units)}</td>
                <td className="py-2 text-right text-[12px] tabular-nums font-semibold text-[#191919]">{formatCurrency(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
