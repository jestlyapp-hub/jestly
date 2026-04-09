"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ArticleCrmFreelance() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-20 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #F8F8FC 0%, #F4F3FA 100%)" }} />
      </div>

      <main>
        <section className="pt-32 sm:pt-40 pb-10 px-6">
          <motion.div className="max-w-[720px] mx-auto" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
            <div className="flex items-center gap-2 text-[12px] text-[#A8A8B0] mb-6">
              <Link href="/blog" className="hover:text-[#7C5CFF] transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-[#6B6F80]">CRM</span>
            </div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full mb-4" style={{ color: "#EC4899", background: "#EC489912" }}>CRM</span>
            <h1 className="text-[32px] sm:text-[42px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#111118] mb-4">Quel CRM choisir quand on est freelance ?</h1>
            <div className="flex items-center gap-4 text-[13px] text-[#A8A8B0] mb-8">
              <span>7 avril 2026</span>
              <span>·</span>
              <span>8 min de lecture</span>
            </div>
          </motion.div>
        </section>

        <article className="max-w-[720px] mx-auto px-6 pb-20">
          <div className="prose-jestly space-y-6 text-[15px] leading-[1.8] text-[#4B5563]">

            <p>Quand on est freelance, la question du CRM se pose dès qu'on dépasse 5 à 10 clients. Les contacts s'accumulent dans les DMs, les emails, les carnets de notes — et les oublis commencent. Un prospect non relancé, c'est potentiellement une mission perdue.</p>

            <p>Mais quel CRM choisir quand on n'est pas une équipe commerciale de 20 personnes ? La plupart des CRM du marché sont trop complexes, trop chers, et mal adaptés au workflow freelance. Voici un comparatif honnête des options disponibles.</p>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">Ai-je vraiment besoin d'un CRM en freelance ?</h2>

            <p>Si vous gérez plus de 5 clients simultanément et que vous faites de la prospection active, un CRM est indispensable. Sans lui, vous perdez des leads entre les canaux (email, DM, téléphone), vous oubliez de relancer, et vous n'avez aucune vision claire de votre pipeline commercial.</p>

            <p>Un bon CRM freelance doit être simple : une fiche par contact, un statut clair (prospect / en discussion / signé / terminé), un historique des échanges, et idéalement un lien direct avec votre facturation.</p>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">Les options CRM pour freelances en 2026</h2>

            <h3 className="text-[18px] font-bold text-[#111118] mt-6 mb-3">HubSpot CRM (gratuit)</h3>
            <p><strong>Pour</strong> : puissant, version gratuite généreuse, pipelines visuels.</p>
            <p><strong>Contre</strong> : interface complexe, courbe d'apprentissage, conçu pour des équipes commerciales, pas de facturation intégrée. Les fonctionnalités avancées coûtent cher (à partir de 45 €/mois).</p>
            <p><strong>Verdict</strong> : adapté si vous avez besoin d'un CRM pur et que la complexité ne vous rebute pas. Surdimensionné pour la plupart des freelances.</p>

            <h3 className="text-[18px] font-bold text-[#111118] mt-6 mb-3">Notion comme CRM</h3>
            <p><strong>Pour</strong> : flexible, gratuit, vous pouvez tout personnaliser.</p>
            <p><strong>Contre</strong> : vous devez tout construire vous-même (bases de données, vues, formules). Rien n'est connecté nativement à votre facturation ou vos commandes. Le temps de setup est considérable.</p>
            <p><strong>Verdict</strong> : viable si vous aimez construire vos systèmes. Chronophage à mettre en place et à maintenir.</p>

            <h3 className="text-[18px] font-bold text-[#111118] mt-6 mb-3">Jestly</h3>
            <p><strong>Pour</strong> : CRM intégré à la facturation, commandes, site vitrine et analytics. Conçu pour les freelances. Interface simple. Prêt dès l'inscription.</p>
            <p><strong>Contre</strong> : en bêta, certaines fonctionnalités avancées (import CSV, intégrations) arrivent progressivement.</p>
            <p><strong>Verdict</strong> : le meilleur rapport simplicité / fonctionnalité pour un freelance qui veut un outil tout-en-un sans complexité.</p>

            <div className="rounded-xl p-5 my-6" style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
              <p className="text-[14px] text-[#4338CA] font-medium">Découvrez le <Link href="/fonctionnalites/crm" className="underline font-semibold">CRM de Jestly</Link> : simple, connecté à votre facturation, gratuit pendant la bêta.</p>
            </div>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">Comment choisir le bon CRM freelance ?</h2>

            <p>Posez-vous ces questions :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ai-je besoin d'un CRM isolé ou d'un outil qui gère aussi ma facturation ?</li>
              <li>Combien de temps suis-je prêt à investir dans la configuration ?</li>
              <li>Ai-je besoin de pipelines complexes ou d'un suivi simple par statut ?</li>
              <li>Mon CRM doit-il être connecté à mon site vitrine et mes commandes ?</li>
            </ul>

            <p>Si vous répondez "outil complet, peu de config, suivi simple, tout connecté" — <Link href="/" className="text-[#7C3AED] font-medium hover:underline">Jestly</Link> est fait pour vous.</p>
          </div>

          <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: "#F3F0FF", border: "1px solid #E5E7EB" }}>
            <h3 className="text-[20px] font-bold text-[#111118] mb-3">Testez le CRM Jestly gratuitement</h3>
            <p className="text-[14px] text-[#6B7280] mb-6 max-w-md mx-auto">CRM simple + facturation + commandes + site vitrine. Tout en un, zéro configuration.</p>
            <TextSwapButton label="Commencer gratuitement" href="/login" variant="primary" size="lg" />
          </div>

          <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
            <h3 className="text-[16px] font-bold text-[#111118] mb-4">Articles liés</h3>
            <div className="space-y-3">
              <Link href="/blog/la-methode-pour-suivre-ses-clients-sans-crm-complexe" className="block text-[14px] text-[#7C3AED] hover:underline">La méthode pour suivre ses clients sans CRM complexe</Link>
              <Link href="/fonctionnalites/crm" className="block text-[14px] text-[#7C3AED] hover:underline">CRM pour freelance → Jestly</Link>
              <Link href="/comparatifs/jestly-vs-hubspot" className="block text-[14px] text-[#7C3AED] hover:underline">Jestly vs HubSpot — Comparatif</Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
