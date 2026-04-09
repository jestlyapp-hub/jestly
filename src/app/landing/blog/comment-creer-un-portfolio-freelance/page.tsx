"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ArticlePortfolioFreelance() {
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
              <span className="text-[#6B6F80]">Site vitrine</span>
            </div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full mb-4" style={{ color: "#FF8A3D", background: "#FF8A3D12" }}>Site vitrine</span>
            <h1 className="text-[32px] sm:text-[42px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#111118] mb-4">Comment créer un portfolio freelance qui attire des clients</h1>
            <div className="flex items-center gap-4 text-[13px] text-[#A8A8B0] mb-8">
              <span>5 avril 2026</span>
              <span>·</span>
              <span>9 min de lecture</span>
            </div>
          </motion.div>
        </section>

        <article className="max-w-[720px] mx-auto px-6 pb-20">
          <div className="prose-jestly space-y-6 text-[15px] leading-[1.8] text-[#4B5563]">

            <p>Votre portfolio est votre meilleur outil de vente en freelance. Avant de vous contacter, un prospect va chercher à voir votre travail. Un portfolio bien construit peut transformer un visiteur curieux en client convaincu. À l'inverse, un portfolio absent, mal structuré ou pas mis à jour vous fait perdre des opportunités chaque semaine.</p>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">Pourquoi un portfolio est essentiel en freelance</h2>

            <p>Le portfolio n'est pas qu'une galerie d'images. C'est votre preuve de compétence. Il répond aux questions qu'un prospect se pose avant de vous contacter :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Quel type de travail faites-vous ?</li>
              <li>Avez-vous déjà travaillé dans mon secteur ?</li>
              <li>Quel est le niveau de qualité que je peux attendre ?</li>
              <li>Êtes-vous fiable et professionnel ?</li>
            </ul>

            <p>Un freelance sans portfolio visible dépend à 100 % du bouche-à-oreille. C'est un canal puissant, mais fragile. Un portfolio en ligne travaille pour vous 24h/24.</p>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">Les éléments d'un portfolio qui convertit</h2>

            <p>Un portfolio efficace ne montre pas juste de jolis visuels. Il raconte une histoire et facilite le passage à l'action :</p>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Une présentation claire</strong> : qui vous êtes, ce que vous faites, pour qui</li>
              <li><strong>Vos meilleurs projets</strong> (5 à 10 max) : avec contexte, brief, résultat</li>
              <li><strong>Vos services et tarifs</strong> : transparence = confiance</li>
              <li><strong>Des témoignages clients</strong> : la preuve sociale est décisive</li>
              <li><strong>Un formulaire de contact simple</strong> : pas plus de 3-4 champs</li>
              <li><strong>Un appel à l'action visible</strong> : "Demandez un devis", "Contactez-moi"</li>
            </ul>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">Où héberger son portfolio freelance ?</h2>

            <p>Plusieurs options existent, chacune avec ses avantages :</p>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Behance / Dribbble</strong> : visibilité communautaire, mais vous ne contrôlez pas l'expérience et le SEO est limité</li>
              <li><strong>WordPress / Webflow</strong> : flexibilité totale, mais maintenance et coût d'hébergement</li>
              <li><strong>Carrd / Wix</strong> : rapide à créer, mais déconnecté de votre gestion client</li>
              <li><strong><Link href="/fonctionnalites/site-vitrine" className="text-[#7C3AED] font-medium hover:underline">Jestly</Link></strong> : portfolio intégré à votre CRM, commandes et facturation — tout est connecté</li>
            </ul>

            <div className="rounded-xl p-5 my-6" style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
              <p className="text-[14px] text-[#4338CA] font-medium">Avec Jestly, votre portfolio est alimenté par vos vrais projets. Un visiteur vous contacte ? Il atterrit dans votre CRM. Il commande ? La facturation suit automatiquement.</p>
            </div>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">Les erreurs qui plombent un portfolio freelance</h2>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Trop de projets</strong> : montrez vos 5-10 meilleurs, pas tout ce que vous avez fait</li>
              <li><strong>Pas de contexte</strong> : "Logo pour X" ne dit rien. Expliquez le brief, votre approche, le résultat</li>
              <li><strong>Pas de CTA</strong> : si le visiteur ne sait pas quoi faire après avoir vu votre travail, il part</li>
              <li><strong>Design daté</strong> : un portfolio de designer avec un design de 2018, c'est contre-productif</li>
              <li><strong>Pas de mise à jour</strong> : un portfolio avec des projets de plus de 2 ans donne l'impression d'inactivité</li>
            </ul>

            <h2 className="text-[22px] font-bold text-[#111118] mt-10 mb-4">Checklist : créer votre portfolio freelance</h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>Sélectionner 5 à 10 projets représentatifs</li>
              <li>Rédiger un court texte de présentation (qui, quoi, pour qui)</li>
              <li>Ajouter des visuels de qualité pour chaque projet</li>
              <li>Décrire le contexte et les résultats de chaque projet</li>
              <li>Lister vos services avec des tarifs indicatifs</li>
              <li>Ajouter 2-3 témoignages clients</li>
              <li>Intégrer un formulaire de contact</li>
              <li>Tester sur mobile (60 %+ du trafic)</li>
              <li>Publier et partager le lien dans votre bio</li>
            </ul>
          </div>

          <div className="mt-16 rounded-2xl p-8 text-center" style={{ background: "#F3F0FF", border: "1px solid #E5E7EB" }}>
            <h3 className="text-[20px] font-bold text-[#111118] mb-3">Créez votre portfolio avec Jestly</h3>
            <p className="text-[14px] text-[#6B7280] mb-6 max-w-md mx-auto">Site vitrine + portfolio + CRM + facturation en un seul outil. Gratuit pendant la bêta.</p>
            <TextSwapButton label="Créer mon portfolio" href="/login" variant="primary" size="lg" />
          </div>

          <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
            <h3 className="text-[16px] font-bold text-[#111118] mb-4">Articles liés</h3>
            <div className="space-y-3">
              <Link href="/blog/comment-creer-un-site-freelance-qui-convertit" className="block text-[14px] text-[#7C3AED] hover:underline">Comment créer un site freelance qui convertit</Link>
              <Link href="/fonctionnalites/site-vitrine" className="block text-[14px] text-[#7C3AED] hover:underline">Portfolio et site vitrine → Jestly</Link>
              <Link href="/pour-qui/designers" className="block text-[14px] text-[#7C3AED] hover:underline">Jestly pour designers</Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
