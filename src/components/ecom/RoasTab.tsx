"use client";

export default function RoasTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[16px] font-bold text-[#191919]">Configuration ROAS</h2>
        <p className="text-[12px] text-[#8A8A88]">Seuil de rentabilité, marge, fenêtre d&apos;attribution.</p>
      </div>

      <div className="bg-white border border-[#E6E6E4] rounded-xl p-5 text-center">
        <div className="text-2xl mb-2">📊</div>
        <h3 className="text-[14px] font-bold text-[#191919] mb-1">Bientôt disponible</h3>
        <p className="text-[12px] text-[#8A8A88] max-w-md mx-auto">
          Configurez votre seuil ROAS, votre marge produit moyenne et votre fenêtre
          d&apos;attribution dès que les intégrations Pinterest + Shopify auront agrégé
          assez de données (~7 jours après connexion).
        </p>
      </div>
    </div>
  );
}
