"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getProductBySlug } from "@/lib/mock-data";

export default function OrderPage() {
  const params = useParams<{ slug: string }>();
  const product = getProductBySlug(params.slug);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  if (!product) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-5xl mb-4">404</div>
        <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">Produit introuvable</h1>
        <p className="text-[13px] text-[#999]">Ce produit n&apos;existe pas ou a été retiré.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Commande envoyée !</h2>
            <p className="text-[13px] text-[#999] max-w-sm mx-auto">
              Votre demande pour <span className="font-medium text-[#1A1A1A]">{product.name}</span> a été enregistrée. Vous recevrez un email de confirmation à <span className="font-medium text-[#1A1A1A]">{form.email}</span>.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Product summary */}
            <div className="bg-white rounded-xl border border-[#E6E8F0] p-5 mb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-bold text-[#1A1A1A]">{product.name}</h1>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      product.type === "pack" ? "bg-[#6a18f1]/10 text-[#6a18f1]" :
                      product.type === "digital" ? "bg-emerald-50 text-emerald-600" :
                      "bg-blue-50 text-blue-600"
                    }`}>
                      {product.type === "pack" ? "Pack" : product.type === "digital" ? "Digital" : "Service"}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#999]">{product.shortDescription}</p>
                  {product.longDescription && (
                    <p className="text-[12px] text-[#999] mt-2">{product.longDescription}</p>
                  )}
                </div>
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-3">
                  <div className="text-[11px] font-semibold text-[#999] uppercase mb-1.5">Inclus</div>
                  <ul className="space-y-1">
                    {product.features.map((f, i) => (
                      <li key={i} className="text-[12px] text-[#666] flex items-center gap-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6a18f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price + delivery */}
              <div className="flex items-center gap-4 pt-3 border-t border-[#E6E8F0]">
                <div className="text-xl font-bold text-[#6a18f1]">{product.price} €</div>
                {product.deliveryTimeDays && (
                  <div className="text-[12px] text-[#999]">
                    Livraison en ~{product.deliveryTimeDays} jour{product.deliveryTimeDays > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>

            {/* Order form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E6E8F0] p-5 space-y-4">
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Passer commande</h2>

              <div>
                <label className="block text-[11px] font-medium text-[#999] mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#999] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#999] mb-1">Message (optionnel)</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  placeholder="Décrivez votre projet, vos attentes…"
                  className="w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all"
                />
              </div>

              {/* Upload placeholder */}
              <div>
                <label className="block text-[11px] font-medium text-[#999] mb-1">Fichiers (optionnel)</label>
                <div className="border-2 border-dashed border-[#E6E8F0] rounded-lg p-4 text-center cursor-pointer hover:border-[#6a18f1]/30 transition-colors">
                  <div className="text-[12px] text-[#999]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Glissez vos fichiers ici ou cliquez pour parcourir
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#6a18f1] text-white text-[14px] font-semibold py-3 rounded-lg hover:bg-[#5a12d9] transition-colors"
              >
                Payer {product.price} €
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
