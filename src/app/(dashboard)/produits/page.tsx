"use client";

import { motion } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { serviceToProduct } from "@/lib/adapters";
import { products as mockProducts } from "@/lib/mock-data";
import type { Product } from "@/types";
import type { Service } from "@/types/database";

export default function ProduitsPage() {
  const { data: rawServices, loading, error, mutate } = useApi<Service[]>("/api/products");
  const products: Product[] = rawServices ? rawServices.map(serviceToProduct) : mockProducts;

  const toggleActive = async (id: string, currentActive: boolean) => {
    await apiFetch(`/api/products/${id}`, { method: "PATCH", body: { is_active: !currentActive } });
    mutate();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-32 bg-[#F7F7F5] rounded animate-pulse" />
          <div className="h-10 w-44 bg-[#F7F7F5] rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E6E6E4] p-5 h-44 animate-pulse">
              <div className="h-4 w-20 bg-[#F7F7F5] rounded mb-3" />
              <div className="h-5 w-36 bg-[#F7F7F5] rounded mb-2" />
              <div className="h-3 w-full bg-[#F7F7F5] rounded mb-2" />
              <div className="h-6 w-16 bg-[#F7F7F5] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center">
        <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Produits</h1>
        <button className="flex items-center gap-1.5 bg-[#4F46E5] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un produit
        </button>
      </motion.div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[14px] text-[#BBB]">Aucun produit pour le moment.</p>
          <p className="text-[12px] text-[#CCC] mt-1">Créez votre premier produit pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              className={`bg-white rounded-xl border border-[#E6E6E4] p-5 hover:shadow-sm hover:-translate-y-0.5 transition-all ${
                !p.active ? "opacity-60" : ""
              }`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-[#999] bg-[#F7F7F5] px-2 py-0.5 rounded">
                    {p.category}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    p.type === "pack" ? "bg-[#4F46E5]/10 text-[#4F46E5]" :
                    p.type === "digital" ? "bg-emerald-50 text-emerald-600" :
                    "bg-blue-50 text-blue-600"
                  }`}>
                    {p.type === "pack" ? "Pack" : p.type === "digital" ? "Digital" : "Service"}
                  </span>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => toggleActive(p.id, p.active)}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                    p.active ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      p.active ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-1">
                {p.name}
              </h3>
              <p className="text-[11px] text-[#999] mb-2 line-clamp-2">
                {p.shortDescription}
              </p>
              <div className="text-xl font-bold text-[#1A1A1A] mb-3">
                {p.price} &euro;
              </div>
              <div className="text-[12px] text-[#999]">
                {p.sales} ventes
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
