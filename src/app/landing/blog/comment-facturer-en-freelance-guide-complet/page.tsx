"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ArticleFacturerFreelance() {
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
              <span className="text-[#6B6F80]">Facturation</span>
            </div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full mb-4" style={{ color: "#22c55e", background: "#22c55e12" }}>Facturation</span>
            <h1 className="text-[32px] sm:text-[42px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#111118] mb-4">Comment facturer en freelance : le guide complet 2026</h1>
            <div className="flex items-center gap-4 text-[13px] text-[#A8A8B0] mb-8">
              <span>9 avril 2026</span>
              <span>·</span>
              <span>10 min de lecture</span>
            </div>
          </motion.div>
        </section>

        <article className="max-w-[720px] mx-auto px-6 pb-20">
          <div className="prose-jestly space-y-6 text-[15px] leading-[1.8] text-[#4B5563]">

            <p>La facturation est l'une des premières obligations légales d'un freelance en France. Pourtant, beaucoup de freelances débutants — et même certains expérimentés — commettent des erreurs qui peuvent coûter cher : factures non conformes, numérotation incohérente, mentions manquantes, relances oubliées.</p>

            <p>Ce guide couvre tout ce que vous devez savoir pour facturer correctement en freelance, avec les outils et méthodes adaptés.</p>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">Les mentions obligatoires sur une facture freelance</h2>

            <p>En France, une facture doit contenir obligatoirement :</p>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Numéro de facture</strong> unique et séquentiel (pas de trou dans la numérotation)</li>
              <li><strong>Date d'émission</strong></li>
              <li><strong>Identité du prestataire</strong> : nom, adresse, SIRET, statut juridique</li>
              <li><strong>Identité du client</strong> : nom ou raison sociale, adresse</li>
              <li><strong>Description détaillée</strong> de la prestation</li>
              <li><strong>Montant HT et TTC</strong> (ou mention "TVA non applicable, art. 293 B du CGI" pour les auto-entrepreneurs en franchise de base)</li>
              <li><strong>Conditions de paiement</strong> : délai, moyen de paiement</li>
              <li><strong>Pénalités de retard</strong> et indemnité forfaitaire de recouvrement (40 €)</li>
            </ul>

            <div className="rounded-xl p-5 my-6" style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
              <p className="text-[14px] text-[#4338CA] font-medium">Avec un <Link href="/fonctionnalites/facturation" className="underline font-semibold">logiciel de facturation freelance</Link> comme Jestly, toutes ces mentions sont ajoutées automatiquement. Vous n'avez qu'à renseigner la prestation et le montant.</p>
            </div>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">La numérotation des factures : les règles à respecter</h2>

            <p>La numérotation doit être chronologique et sans rupture. Vous pouvez utiliser un format de type <code className="bg-[#F3F0FF] px-2 py-0.5 rounded text-[#7C3AED] text-[13px]">FACT-2026-001</code>, <code className="bg-[#F3F0FF] px-2 py-0.5 rounded text-[#7C3AED] text-[13px]">2026-04-001</code> ou tout autre format cohérent. L'important est de ne jamais sauter un numéro et de ne jamais réutiliser un numéro déjà attribué.</p>

            <p>Un logiciel de facturation gère cela automatiquement. Si vous facturez sur Word ou Excel, vous prenez le risque d'erreurs de numérotation qui peuvent poser problème en cas de contrôle fiscal.</p>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">TVA et auto-entrepreneur : ce qu'il faut savoir</h2>

            <p>Si vous êtes auto-entrepreneur en franchise en base de TVA (CA inférieur aux seuils), vos factures doivent porter la mention : "TVA non applicable, article 293 B du CGI". Vous ne facturez pas de TVA et ne la récupérez pas non plus.</p>

            <p>Si vous dépassez les seuils ou si vous êtes en société (EURL, SASU), vous collectez la TVA (généralement 20 %) et devez la reverser à l'État. Votre facture doit alors mentionner le taux de TVA, le montant HT, le montant de la TVA et le montant TTC.</p>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">Comment relancer un client qui ne paie pas</h2>

            <p>Les retards de paiement sont malheureusement fréquents en freelance. Voici la bonne pratique :</p>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong>J+1 après échéance</strong> : rappel courtois par email</li>
              <li><strong>J+7</strong> : relance formelle avec copie de la facture</li>
              <li><strong>J+15</strong> : mise en demeure (lettre recommandée)</li>
              <li><strong>J+30</strong> : recours au recouvrement ou médiation</li>
            </ul>

            <p>Avec un outil comme <Link href="/fonctionnalites/facturation" className="text-[#7C3AED] font-medium hover:underline">la facturation Jestly</Link>, vous pouvez suivre le statut de chaque facture (envoyée, en retard, payée) et programmer des relances automatiques.</p>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">Quel outil de facturation choisir en freelance ?</h2>

            <p>Plusieurs options existent pour facturer en freelance :</p>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Outils spécialisés facturation</strong> (Henrri, Freebe, Abby) : bons pour la facturation pure, mais pas connectés à votre gestion client ou vos commandes</li>
              <li><strong>Outils tout-en-un</strong> (<Link href="/" className="text-[#7C3AED] font-medium hover:underline">Jestly</Link>) : facturation + CRM + commandes + site vitrine dans un seul outil</li>
              <li><strong>Word/Excel</strong> : déconseillé — pas de numérotation automatique, pas de conformité garantie, pas de suivi de paiement</li>
            </ul>

            <div className="rounded-xl p-5 my-6" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
              <p className="text-[14px] text-[#166534] font-medium">Jestly est gratuit pendant la bêta avec facturation illimitée, CRM intégré et site vitrine. <Link href="/login" className="underline font-semibold">Essayez gratuitement →</Link></p>
            </div>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">Checklist facturation freelance</h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>Utiliser un logiciel de facturation avec numérotation automatique</li>
              <li>Vérifier les mentions obligatoires sur chaque facture</li>
              <li>Envoyer la facture dès la livraison du projet</li>
              <li>Définir des conditions de paiement claires (30 jours, virement, etc.)</li>
              <li>Relancer systématiquement dès le premier jour de retard</li>
              <li>Archiver toutes les factures pendant 10 ans (obligation légale)</li>
              <li>Séparer compte pro et compte perso</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: "#F3F0FF", border: "1px solid #E5E7EB" }}>
            <h3 className="text-[20px] font-bold text-[#111118] mb-3">Facturez mieux avec Jestly</h3>
            <p className="text-[14px] text-[#6B7280] mb-6 max-w-md mx-auto">Facturation conforme, relances automatiques, CRM intégré. Tout est connecté dans un seul outil freelance.</p>
            <TextSwapButton label="Commencer gratuitement" href="/login" variant="primary" size="lg" />
          </div>

          {/* Related */}
          <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
            <h3 className="text-[16px] font-bold text-[#111118] mb-4">Articles liés</h3>
            <div className="space-y-3">
              <Link href="/blog/5-erreurs-de-facturation-qui-vous-coutent-cher" className="block text-[14px] text-[#7C3AED] hover:underline">5 erreurs de facturation qui vous coûtent cher</Link>
              <Link href="/fonctionnalites/facturation" className="block text-[14px] text-[#7C3AED] hover:underline">Logiciel de facturation freelance → Jestly</Link>
              <Link href="/comparatifs/jestly-vs-notion" className="block text-[14px] text-[#7C3AED] hover:underline">Jestly vs Notion — Comparatif</Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
