"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getProductBySlug } from "@/lib/mock-data";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

const sectors = ["Tech / SaaS", "E-commerce", "Restauration", "Mode / Beauté", "Santé", "Éducation", "Autre"];

export default function OrderPage() {
  const params = useParams<{ slug: string }>();
  const product = getProductBySlug(params.slug);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    deadline: "",
    description: "",
    brand: "",
    sector: "",
  });
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [cgvAccepted, setCgvAccepted] = useState(false);
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
    if (!cgvAccepted) return;
    setSubmitted(true);
  };

  const addMockFile = () => {
    const mockFiles = [
      { name: "brief-projet.pdf", size: "800 Ko" },
      { name: "references-visuelles.zip", size: "2.4 Mo" },
      { name: "logo-actuel.png", size: "1.2 Mo" },
    ];
    const next = mockFiles[files.length % mockFiles.length];
    setFiles([...files, next]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const orderRef = `SCMD-${String(Math.floor(Math.random() * 900 + 100))}`;
  const deliveryDate = product.deliveryTimeDays
    ? new Date(Date.now() + product.deliveryTimeDays * 86400000).toLocaleDateString("fr-FR")
    : null;

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
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Commande confirmée !</h2>
            <div className="bg-white rounded-xl border border-[#E6E6E4] p-5 max-w-sm mx-auto mt-4 text-left space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#999]">Référence</span>
                <span className="font-mono font-medium text-[#1A1A1A]">{orderRef}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#999]">Service</span>
                <span className="font-medium text-[#1A1A1A]">{product.name}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#999]">Montant</span>
                <span className="font-bold text-[#4F46E5]">{product.price} &euro;</span>
              </div>
              {deliveryDate && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#999]">Livraison estimée</span>
                  <span className="text-[#1A1A1A]">{deliveryDate}</span>
                </div>
              )}
            </div>
            <p className="text-[12px] text-[#999] mt-4">
              Un email de confirmation a été envoyé à <span className="font-medium text-[#1A1A1A]">{form.email}</span>.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Section 1: Récapitulatif */}
            <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
              <h2 className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-3">Récapitulatif</h2>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-bold text-[#1A1A1A]">{product.name}</h1>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      product.type === "pack" ? "bg-[#4F46E5]/10 text-[#4F46E5]" :
                      product.type === "digital" ? "bg-emerald-50 text-emerald-600" :
                      "bg-blue-50 text-blue-600"
                    }`}>
                      {product.type === "pack" ? "Pack" : product.type === "digital" ? "Digital" : "Service"}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#999]">{product.shortDescription}</p>
                </div>
                <div className="text-2xl font-bold text-[#4F46E5] ml-4">{product.price} &euro;</div>
              </div>
              {product.features && product.features.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {product.features.map((f, i) => (
                    <li key={i} className="text-[11px] text-[#666] flex items-center gap-2">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {product.deliveryTimeDays && (
                <div className="mt-3 pt-3 border-t border-[#E6E6E4] text-[12px] text-[#999]">
                  Livraison estimée : ~{product.deliveryTimeDays} jour{product.deliveryTimeDays > 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* Section 2: Vos informations */}
            <div className="bg-white rounded-xl border border-[#E6E6E4] p-5 space-y-4">
              <h2 className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">Vos informations</h2>
              <div>
                <label className="block text-[11px] font-medium text-[#999] mb-1">Nom complet</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#999] mb-1">Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
              </div>
            </div>

            {/* Section 3: Brief conditionnel */}
            <div className="bg-white rounded-xl border border-[#E6E6E4] p-5 space-y-4">
              <h2 className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">Votre brief</h2>

              {product.type === "service" && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[#999] mb-1">Deadline souhaitée</label>
                    <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#999] mb-1">Description du projet</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Décrivez votre projet, vos attentes, votre vision..." className={inputClass} />
                  </div>
                </>
              )}

              {product.type === "pack" && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[#999] mb-1">Votre marque</label>
                    <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Nom de votre marque" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#999] mb-1">Secteur d&apos;activité</label>
                    <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className={inputClass}>
                      <option value="">Sélectionner...</option>
                      {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </>
              )}

              {product.type === "digital" && (
                <div>
                  <label className="block text-[11px] font-medium text-[#999] mb-1">Message (optionnel)</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={2} placeholder="Une question ou précision ?" className={inputClass} />
                </div>
              )}

              {/* File upload mock */}
              <div>
                <label className="block text-[11px] font-medium text-[#999] mb-1">Fichiers (optionnel)</label>
                <div
                  onClick={addMockFile}
                  className="border-2 border-dashed border-[#E6E6E4] rounded-lg p-4 text-center cursor-pointer hover:border-[#4F46E5]/30 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div className="text-[12px] text-[#999]">Cliquez pour ajouter un fichier</div>
                  <div className="text-[10px] text-[#BBB] mt-0.5">Formats acceptés : PDF, PNG, JPG, ZIP. Max 10 Mo</div>
                </div>
                {files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#F7F7F5] rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="text-[12px] text-[#1A1A1A]">{f.name}</span>
                          <span className="text-[10px] text-[#999]">{f.size}</span>
                        </div>
                        <button type="button" onClick={() => removeFile(i)} className="text-[#999] hover:text-red-500 text-sm">&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: CGV + Submit */}
            <div className="bg-white rounded-xl border border-[#E6E6E4] p-5 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cgvAccepted}
                  onChange={(e) => setCgvAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#E6E6E4] text-[#4F46E5] focus:ring-[#4F46E5]/20"
                />
                <span className="text-[12px] text-[#666]">
                  J&apos;accepte les <span className="text-[#4F46E5] underline">conditions générales de vente</span> et la <span className="text-[#4F46E5] underline">politique de confidentialité</span>.
                </span>
              </label>
              <button
                type="submit"
                disabled={!cgvAccepted}
                className={`w-full text-[14px] font-semibold py-3 rounded-lg transition-colors ${
                  cgvAccepted
                    ? "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                    : "bg-[#E6E6E4] text-[#999] cursor-not-allowed"
                }`}
              >
                Payer {product.price} &euro;
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
