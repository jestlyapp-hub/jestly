"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ArticleSuiviClients() {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #F8F8FC 0%, #F4F3FA 100%)",
      }}
    >
      {/* Violet radial glows */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,92,255,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── Hero ── */}
        <section className="pt-32 sm:pt-40 pb-12 px-4">
          <div className="max-w-[720px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              {/* Breadcrumb */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  color: "#6B6F80",
                  marginBottom: 20,
                }}
              >
                <Link
                  href="/blog"
                  className="text-[#6B6F80] hover:text-[#7C5CFF] transition-colors"
                >
                  Blog
                </Link>
                <span>/</span>
                <span style={{ color: "#EC4899" }}>Relation client</span>
              </div>

              {/* Category badge */}
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#EC4899",
                  background: "rgba(236,72,153,0.08)",
                  border: "1px solid rgba(236,72,153,0.2)",
                  marginBottom: 20,
                }}
              >
                Relation client
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.1 }}
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "#111118",
                marginBottom: 16,
              }}
            >
              La méthode pour suivre ses clients sans CRM complexe
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.2 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 14,
                color: "#A8A8B0",
              }}
            >
              <span>5 mars 2026</span>
              <span>·</span>
              <span>4 min de lecture</span>
            </motion.div>
          </div>
        </section>

        {/* ── Article content ── */}
        <section className="pb-16 px-4">
          <motion.div
            className="max-w-[720px] mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.3 }}
          >
            {/* Intro */}
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Quand on pense &laquo;&nbsp;suivi client&nbsp;&raquo;, on imagine souvent un tableau de bord ultra-sophistiqué avec des dizaines de colonnes, des pipelines colorés et des rapports automatisés. C&apos;est la promesse des grands CRM comme Salesforce ou HubSpot. Mais pour un freelance créatif qui gère entre 5 et 30 clients actifs, ce niveau de complexité est non seulement inutile — il est contre-productif.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Ce dont vous avez réellement besoin, c&apos;est de clarté. Savoir où en est chaque client, quand relancer, quel projet est en cours, et ne rien oublier. Pas besoin d&apos;un outil à 50&nbsp;€/mois pour ça. Voici une méthode simple, éprouvée, et adaptée à la réalité des indépendants.
            </p>

            {/* H2 — Pourquoi les gros CRM ne marchent pas en solo */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Pourquoi les gros CRM ne marchent pas en solo
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Les CRM enterprise sont conçus pour des équipes commerciales de 10, 50 ou 200 personnes. Chaque fonctionnalité — scoring de leads, séquences d&apos;e-mails automatisés, attribution multi-canal — répond à un besoin d&apos;organisation collective. Quand vous travaillez seul, ces fonctionnalités ne font qu&apos;ajouter de la friction.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Le problème le plus fréquent&nbsp;: la configuration initiale. Il faut souvent plusieurs heures pour paramétrer les champs, les étapes du pipeline, les automatisations. Et comme le freelance n&apos;a pas de temps à perdre, il abandonne au bout de deux semaines. L&apos;outil devient un énième onglet inutilisé.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              L&apos;autre écueil, c&apos;est la surcharge informationnelle. Quand chaque fiche client contient 30&nbsp;champs dont vous n&apos;utilisez que 5, la vue d&apos;ensemble devient illisible. Vous passez plus de temps à chercher l&apos;information qu&apos;à l&apos;exploiter. Le CRM, censé vous simplifier la vie, finit par la compliquer.
            </p>

            {/* H2 — Les infos essentielles */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Les informations essentielles à suivre
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Pour un suivi client efficace en freelance, vous n&apos;avez besoin que de quelques données clés. L&apos;objectif n&apos;est pas de tout documenter, mais de garder sous les yeux ce qui vous permet de prendre une décision rapide&nbsp;: relancer, facturer, proposer un nouveau service.
            </p>
            <ul className="space-y-2 my-6 ml-1">
              {[
                "Nom et prénom du contact principal",
                "Adresse e-mail (et téléphone si pertinent)",
                "Historique des projets réalisés ensemble",
                "Date du dernier échange ou de la dernière interaction",
                "Statut actuel : prospect, client actif, ancien client",
                "Notes libres : préférences, contexte, points d'attention",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              C&apos;est tout. Ces six informations couvrent 90&nbsp;% de vos besoins au quotidien. Le reste — chiffre d&apos;affaires par client, taux de conversion, cycle de vente — viendra naturellement si votre activité grossit. Mais au début, la simplicité prime.
            </p>

            {/* Callout — À retenir */}
            <div className="bg-[#F8F7FF] border-l-4 border-[#7C5CFF] rounded-r-xl p-5 my-8">
              <p className="text-[13px] font-bold text-[#7C5CFF] uppercase tracking-wide mb-1">
                À retenir
              </p>
              <p className="text-[14px] text-[#4A4A4A] leading-relaxed">
                Un bon CRM freelance tient sur 5&nbsp;colonnes, pas 50. La clarté bat toujours la complétude.
              </p>
            </div>

            {/* H2 — Structurer en 4 étapes */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Structurer son suivi en 4&nbsp;étapes
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              La méthode repose sur quatre actions concrètes, à mettre en place une bonne fois pour toutes. Pas besoin de revoir le système chaque mois — une fois posé, il roule.
            </p>

            <h3 className="text-[18px] font-bold text-[#111118] mt-8 mb-3">
              1. Lister tous vos contacts
            </h3>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Commencez par regrouper tous vos clients et prospects au même endroit. Fouillez vos e-mails, vos anciennes factures, vos échanges Instagram ou LinkedIn. L&apos;objectif&nbsp;: ne plus avoir de contact &laquo;&nbsp;perdu&nbsp;&raquo; quelque part dans un fil de conversation. Chaque personne avec qui vous avez travaillé ou échangé mérite une ligne dans votre système.
            </p>

            <h3 className="text-[18px] font-bold text-[#111118] mt-8 mb-3">
              2. Définir les étapes de la relation
            </h3>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Chaque contact passe par un cycle&nbsp;: prospect, devis envoyé, projet en cours, livré, payé. En formalisant ces étapes, vous visualisez instantanément votre pipeline. Qui attend un devis&nbsp;? Qui n&apos;a pas encore payé&nbsp;? Qui pourrait être recontacté pour un nouveau projet&nbsp;? Ce simple découpage change la donne.
            </p>

            <h3 className="text-[18px] font-bold text-[#111118] mt-8 mb-3">
              3. Noter chaque interaction
            </h3>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Pas besoin d&apos;un journal détaillé. Un simple &laquo;&nbsp;Appel le 12/02 — OK pour le devis, attend validation budget&nbsp;&raquo; suffit. Ces notes vous évitent de reposer les mêmes questions et montrent à votre client que vous suivez le dossier. C&apos;est aussi un filet de sécurité si un projet traîne pendant des semaines&nbsp;: vous retrouvez le contexte en deux secondes.
            </p>

            <h3 className="text-[18px] font-bold text-[#111118] mt-8 mb-3">
              4. Planifier les relances
            </h3>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              La relance est le nerf de la guerre en freelance. Un prospect qui ne répond pas n&apos;est pas forcément désintéressé — il est occupé. Une relance polie et bien timée transforme un silence en contrat. Définissez des rappels&nbsp;: J+3 après un devis, J+7 après une livraison, tous les 3&nbsp;mois pour les anciens clients. La régularité fait la différence.
            </p>

            {/* H2 — Ne plus oublier */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Ne plus oublier relances, devis et suivis
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Le coût réel d&apos;un suivi client défaillant ne se mesure pas en euros perdus sur une seule facture. Il se mesure en opportunités manquées. Un devis non relancé, c&apos;est un projet qui part chez un concurrent. Un ancien client jamais recontacté, c&apos;est une recommandation qui ne se fera jamais. La relation client, en freelance, est un actif à entretenir.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              La solution la plus simple&nbsp;: des rappels automatiques. Pas des séquences e-mail de growth hacking, juste un système qui vous dit &laquo;&nbsp;Tu n&apos;as pas eu de nouvelles de Marie depuis 2&nbsp;semaines&nbsp;&raquo;. Un rappel par jour, c&apos;est suffisant pour ne plus rien laisser filer.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Le meilleur moment pour mettre en place ce système, c&apos;est maintenant. Pas quand vous aurez 50&nbsp;clients. Pas le mois prochain. La discipline de suivi se construit sur un petit volume et devient un réflexe naturel à mesure que votre activité grandit.
            </p>

            {/* H2 — Le bon niveau de complexité */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Le bon niveau de complexité
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Il y a un piège dans lequel tombent beaucoup de freelances organisés&nbsp;: construire un système trop élaboré. On ajoute des tags, des catégories, des vues filtrées, des scores de satisfaction. Et petit à petit, le temps passé à maintenir le système dépasse le temps gagné grâce à lui.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Le bon CRM freelance est celui que vous utilisez vraiment. S&apos;il vous faut plus de 30&nbsp;secondes pour mettre à jour une fiche client après un appel, c&apos;est trop. S&apos;il faut cliquer 5&nbsp;fois pour ajouter une note, c&apos;est trop. La fluidité d&apos;usage détermine l&apos;adoption sur le long terme.
            </p>

            {/* Warning callout */}
            <div className="bg-[#FFFBF0] border-l-4 border-[#F59E0B] rounded-r-xl p-5 my-8">
              <p className="text-[13px] font-bold text-[#F59E0B] uppercase tracking-wide mb-1">
                Attention
              </p>
              <p className="text-[14px] text-[#4A4A4A] leading-relaxed">
                Trop de champs tue le CRM. Gardez uniquement ce que vous consultez vraiment. Chaque colonne inutile est une friction qui vous éloigne de l&apos;outil.
              </p>
            </div>

            {/* H2 — Comment Jestly simplifie */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Comment Jestly simplifie ce suivi
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Jestly a été conçu exactement pour ce cas d&apos;usage&nbsp;: un freelance créatif qui veut suivre ses clients sans y passer des heures. La fiche client regroupe les informations essentielles — contact, projets, historique, notes — sans champ superflu. Chaque interaction est tracée automatiquement quand elle passe par la plateforme.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Le système de statuts est pré-configuré mais personnalisable&nbsp;: prospect, en discussion, projet en cours, livré, payé. Les relances s&apos;intègrent au calendrier. Et surtout, le CRM n&apos;est pas un module isolé — il est connecté aux commandes, aux factures et aux briefs. Quand un client passe commande, sa fiche se met à jour toute seule.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Si vous utilisez aujourd&apos;hui un tableur, des notes éparpillées ou simplement votre mémoire pour suivre vos clients, il est temps de structurer tout ça. Découvrez le{" "}
              <Link
                href="/fonctionnalites/crm"
                className="text-[#7C5CFF] font-medium hover:underline"
              >
                CRM intégré de Jestly
              </Link>{" "}
              ou comparez avec{" "}
              <Link
                href="/comparatifs/jestly-vs-hubspot"
                className="text-[#7C5CFF] font-medium hover:underline"
              >
                HubSpot
              </Link>{" "}
              pour voir la différence en pratique.
            </p>

            {/* ── CTA Card ── */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #EEEDF2",
                borderRadius: 20,
                padding: "32px 28px",
                textAlign: "center",
                marginTop: 48,
                marginBottom: 48,
              }}
            >
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#111118",
                  marginBottom: 8,
                }}
              >
                Prêt à mieux suivre vos clients&nbsp;?
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: "#6B6F80",
                  lineHeight: 1.7,
                  marginBottom: 20,
                  maxWidth: 440,
                  margin: "0 auto 20px",
                }}
              >
                Découvrez le CRM Jestly, conçu pour les freelances créatifs qui veulent rester organisés sans usine à gaz.
              </p>
              <TextSwapButton
                label="Découvrir le CRM Jestly"
                href="/fonctionnalites/crm"
                variant="primary"
                size="lg"
              />
            </div>

            {/* ── Related articles ── */}
            <div style={{ marginTop: 48 }}>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#111118",
                  marginBottom: 20,
                }}
              >
                Articles similaires
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/blog/5-erreurs-de-facturation-qui-vous-coutent-cher"
                  className="block bg-white border border-[#EEEDF2] rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: "#22c55e" }}
                  >
                    Facturation
                  </span>
                  <h4 className="text-[15px] font-bold text-[#111118] mt-2">
                    5 erreurs de facturation qui vous coûtent cher
                  </h4>
                </Link>
                <Link
                  href="/blog/le-guide-complet-du-brief-client-reussi"
                  className="block bg-white border border-[#EEEDF2] rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: "#EC4899" }}
                  >
                    Relation client
                  </span>
                  <h4 className="text-[15px] font-bold text-[#111118] mt-2">
                    Le guide complet du brief client réussi
                  </h4>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
