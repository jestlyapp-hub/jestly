"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { products as initialProducts } from "@/lib/mock-data";

export default function ProduitsPage() {
  const [products, setProducts] = useState(initialProducts);

  const toggleActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

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
        <button className="flex items-center gap-1.5 bg-[#6a18f1] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-[#5a12d9] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un produit
        </button>
      </motion.div>

      {/* Product cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            className={`bg-white rounded-xl border border-[#E6E8F0] p-5 hover:shadow-sm hover:-translate-y-0.5 transition-all ${
              !p.active ? "opacity-60" : ""
            }`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-medium text-[#999] bg-[#F8F9FC] px-2 py-0.5 rounded">
                {p.category}
              </span>
              {/* Toggle */}
              <button
                onClick={() => toggleActive(p.id)}
                className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                  p.active ? "bg-[#6a18f1]" : "bg-[#E6E8F0]"
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
            <div className="text-xl font-bold text-[#1A1A1A] mb-3">
              {p.price} &euro;
            </div>
            <div className="text-[12px] text-[#999]">
              {p.sales} ventes
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
