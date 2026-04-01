"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ArticleOrganisation() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-20 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #F8F8FC 0%, #F4F3FA 100%)" }} />
        <div
          className="absolute top-[-10%] right-[5%] w-[900px] h-[900px] rounded-full"
          style={{ background: "radial-gradient(450px circle, rgba(124,92,255,0.06), transparent 70%)" }}
        />
      </div>

      <main>
        {/* Article Hero */}
        <section className="pt-32 sm:pt-40 pb-10 px-6">
          <motion.div
            className="max-w-[720px] mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[12px] text-[#A8A8B0] mb-6">
              <Link href="/blog" className="hover:text-[#7C5CFF] transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-[#6B6F80]">Organisation</span>
            </div>
            {/* Category badge */}
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full mb-4"
              style={{ color: "#F59E0B", background: "#F59E0B12" }}
            >
              Organisation
            </span>
            {/* Title */}
            <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#111118] mb-5">
              Comment arrêter de gérer son business dans 6 outils
            </h1>
            {/* Meta */}
            <div className="flex items-center gap-4 text-[13px] text-[#A8A8B0]">
              <span>15 mars 2026</span>
              <span>·</span>
              <span>5 min de lecture</span>
            </div>
          </motion.div>
        </section>

        {/* Article Content */}
        <section className="px-6 pb-20">
          <motion.div
            className="max-w-[720px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.15 }}
          >
            <div>
              {/* Intro */}
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Notion pour les projets. Trello pour les tâches. Google Sheets pour la facturation. Google Agenda pour les rendez-vous.
                Slack pour les échanges. Et un dossier Drive quelque part avec vos contrats. Vous reconnaissez ce quotidien ?
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Si vous êtes freelance créatif, il y a de fortes chances que vous jongliez entre cinq, six, voire sept outils
                différents pour gérer votre activité. Chacun fait bien une chose. Mais aucun ne voit l&apos;ensemble. Et c&apos;est là
                que ça coince. Cette fragmentation a un coût réel : du temps perdu, de la charge mentale, et des opportunités ratées.
              </p>

              {/* Section 1 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Le vrai coût des outils dispersés
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                On parle souvent du prix des abonnements. Mais le véritable coût de la dispersion n&apos;est pas financier : il est
                cognitif. Chaque outil a sa propre logique, ses propres notifications, son propre système de navigation. Passer de l&apos;un
                à l&apos;autre, c&apos;est comme changer de langue plusieurs fois par jour. Votre cerveau perd le fil.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Et les conséquences sont concrètes : une échéance oubliée parce qu&apos;elle était dans Trello et pas dans votre agenda.
                Un devis non envoyé parce que le contact est dans un fichier Sheets et pas dans votre CRM. Un client mécontent parce que
                vous n&apos;avez pas vu sa demande, perdue entre deux outils de messagerie.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                La donnée dupliquée est un autre piège classique. Vous mettez à jour un prix dans Sheets mais oubliez Notion.
                Vous ajoutez un client dans votre CRM mais pas dans votre outil de facturation. Ces incohérences génèrent des erreurs,
                et les erreurs coûtent de l&apos;argent.
              </p>

              {/* Section 2 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Où se perd le temps chaque semaine
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Le &ldquo;switching cost&rdquo; est un concept bien documenté en productivité. À chaque fois que vous changez de
                contexte &mdash; d&apos;un outil à un autre, d&apos;un onglet à un autre &mdash; votre cerveau a besoin de temps pour se
                reconcentrer. En moyenne, ce temps est de 15 à 23 minutes. Multipliez ça par le nombre de transitions dans une journée.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Ajoutez la double saisie : vous entrez les informations d&apos;une commande dans un outil de gestion, puis vous les
                recopiez dans votre outil de facturation. Et si un détail change, il faut modifier les deux. C&apos;est du temps
                purement perdu, sans aucune valeur ajoutée.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Enfin, la recherche d&apos;information. Où est ce brief ? Dans quel email ? Quel Google Doc ? Quel message Slack ?
                Les freelances passent en moyenne 1h30 par semaine à chercher des informations éparpillées entre leurs outils.
                C&apos;est 6 heures par mois. 72 heures par an. Presque deux semaines de travail.
              </p>

              {/* Callout */}
              <div className="bg-[#F8F7FF] border-l-4 border-[#7C5CFF] rounded-r-xl p-5 my-8">
                <p className="text-[13px] font-bold text-[#7C5CFF] uppercase tracking-wide mb-1">À retenir</p>
                <p className="text-[14px] text-[#4A4A4A] leading-relaxed">
                  Chaque changement d&apos;outil coûte en moyenne 15 minutes de reconcentration. Sur une journée avec 10 changements
                  de contexte, c&apos;est 2h30 de productivité perdue.
                </p>
              </div>

              {/* Section 3 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Le problème Notion + Trello + Sheets + Agenda
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Chaque outil que vous utilisez a été conçu pour résoudre un problème spécifique. Notion excelle dans la documentation.
                Trello est excellent pour visualiser un workflow. Google Sheets est flexible pour les tableaux. Google Agenda gère bien
                les rendez-vous. Mais aucun de ces outils n&apos;a été pensé pour un freelance qui a besoin de tout voir d&apos;un coup.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Le résultat ? Votre activité est éclatée entre des silos qui ne se parlent pas. Votre vue &ldquo;projets&rdquo; dans
                Notion ne sait rien de vos factures dans Sheets. Votre agenda ne sait rien de vos tâches dans Trello. Vous devenez
                le seul lien entre tous ces systèmes &mdash; et c&apos;est épuisant.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Il ne s&apos;agit pas de dire que ces outils sont mauvais. Ils sont excellents dans leur domaine. Mais les assembler
                en &ldquo;stack freelance&rdquo; crée une complexité inutile. Vous passez plus de temps à maintenir votre système
                qu&apos;à travailler pour vos clients.
              </p>

              {/* Section 4 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Ce qu&apos;il faut centraliser en priorité
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Tout centraliser d&apos;un coup n&apos;est ni réaliste ni nécessaire. Il faut commencer par les éléments qui génèrent
                le plus de friction au quotidien. Voici les cinq piliers à réunir en priorité :
              </p>
              <ul className="space-y-2 my-6 ml-1">
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Les commandes</strong> : suivi des projets en cours, montants, statuts, dates de livraison.</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Les clients</strong> : coordonnées, historique, échanges, préférences.</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>La facturation</strong> : devis, factures, relances, suivi des paiements.</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Le calendrier</strong> : deadlines, rendez-vous, disponibilités.</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Les tâches</strong> : to-do quotidien, suivi de progression, priorisation.</span>
                </li>
              </ul>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Quand ces cinq éléments vivent dans un même espace, les connexions se font naturellement. Un client est lié
                à ses commandes, qui sont liées à ses factures, qui apparaissent dans votre calendrier.
              </p>

              {/* Section 5 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Reprendre le contrôle en 3 étapes
              </h2>

              <h3 className="text-[18px] font-bold text-[#111118] mt-8 mb-3">
                1. Faire l&apos;audit de vos outils actuels
              </h3>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Listez tous les outils que vous utilisez au quotidien. Pour chacun, notez : ce que vous y faites, combien de temps
                vous y passez, et ce qui vous frustre. Vous serez surpris de découvrir que certains outils ne servent qu&apos;à une
                seule chose, pour laquelle une solution intégrée ferait mieux.
              </p>

              <h3 className="text-[18px] font-bold text-[#111118] mt-8 mb-3">
                2. Identifier les redondances
              </h3>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Combien de fois saisissez-vous la même information dans deux endroits différents ? Combien de fois basculez-vous
                entre deux outils pour accomplir une seule action ? Ces doublons sont vos plus gros gisements de temps récupérable.
                Marquez-les clairement.
              </p>

              <h3 className="text-[18px] font-bold text-[#111118] mt-8 mb-3">
                3. Migrer vers une plateforme unique
              </h3>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                L&apos;objectif n&apos;est pas de tout migrer en une nuit. Commencez par le module qui vous fait perdre le plus de
                temps. Pour beaucoup de freelances, c&apos;est la facturation ou le suivi des commandes. Une fois ce premier pilier
                en place, ajoutez les suivants progressivement.
              </p>

              {/* Warning callout */}
              <div className="bg-[#FFFBF0] border-l-4 border-[#F59E0B] rounded-r-xl p-5 my-8">
                <p className="text-[13px] font-bold text-[#F59E0B] uppercase tracking-wide mb-1">Attention</p>
                <p className="text-[14px] text-[#4A4A4A] leading-relaxed">
                  Ne migrez pas tout d&apos;un coup. Une transition progressive est plus durable qu&apos;un big bang.
                  Commencez par un module, validez-le, puis passez au suivant.
                </p>
              </div>

              {/* Section 6 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Comment Jestly remplace ce chaos
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Jestly a été conçu exactement pour résoudre ce problème. Au lieu de connecter six outils entre eux, vous avez
                un seul espace où tout est intégré nativement : commandes, clients, facturation, calendrier, tâches, et même
                votre{" "}
                <Link href="/fonctionnalites" className="text-[#7C5CFF] font-medium hover:underline">
                  site vitrine
                </Link>.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Quand un client passe commande, la facture se génère. Quand une échéance approche, elle apparaît dans votre
                calendrier et vos tâches. Quand un paiement arrive, le statut se met à jour partout. Plus de double saisie.
                Plus de recherche entre les onglets. Plus de charge mentale inutile.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Et avec un{" "}
                <Link href="/tarifs" className="text-[#7C5CFF] font-medium hover:underline">
                  plan gratuit pour démarrer
                </Link>,
                vous pouvez tester sans engagement et migrer à votre rythme.
              </p>
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-20">
          <motion.div
            className="max-w-[720px] mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="bg-white border border-[#EEEDF2] rounded-2xl p-8 text-center">
              <h3 className="text-[20px] font-bold text-[#111118] mb-2">
                Prêt à tout centraliser ?
              </h3>
              <p className="text-[14px] text-[#6B6F80] mb-6 leading-relaxed">
                Découvrez comment Jestly réunit commandes, clients, facturation et calendrier en un seul espace.
              </p>
              <TextSwapButton
                label="Découvrez les fonctionnalités"
                href="/fonctionnalites"
                variant="primary"
                size="lg"
              />
            </div>
          </motion.div>
        </section>

        {/* Related Articles */}
        <section className="px-6 pb-24">
          <div className="max-w-[720px] mx-auto">
            <h3 className="text-[18px] font-bold text-[#111118] mb-6">À lire aussi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Article 2 */}
              <Link href="/blog/5-erreurs-de-facturation-qui-vous-coutent-cher" style={{ textDecoration: "none" }}>
                <div
                  className="bg-white border border-[#EEEDF2] rounded-xl p-5 h-full transition-shadow hover:shadow-[0_8px_30px_rgba(124,92,255,0.08)] hover:border-[rgba(124,92,255,0.15)]"
                >
                  <span
                    className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full mb-3"
                    style={{ color: "#22c55e", background: "#22c55e12" }}
                  >
                    Facturation
                  </span>
                  <h4 className="text-[15px] font-bold text-[#111118] leading-snug">
                    5 erreurs de facturation qui vous coûtent cher
                  </h4>
                </div>
              </Link>
              {/* Article 5 */}
              <Link href="/blog/gagner-3-heures-par-semaine-en-automatisant-sa-gestion" style={{ textDecoration: "none" }}>
                <div
                  className="bg-white border border-[#EEEDF2] rounded-xl p-5 h-full transition-shadow hover:shadow-[0_8px_30px_rgba(124,92,255,0.08)] hover:border-[rgba(124,92,255,0.15)]"
                >
                  <span
                    className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full mb-3"
                    style={{ color: "#7C5CFF", background: "#7C5CFF12" }}
                  >
                    Productivité
                  </span>
                  <h4 className="text-[15px] font-bold text-[#111118] leading-snug">
                    Gagner 3 heures par semaine en automatisant sa gestion
                  </h4>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
