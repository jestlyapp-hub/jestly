"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ArticleFacturation() {
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
              <span className="text-[#6B6F80]">Facturation</span>
            </div>
            {/* Category badge */}
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full mb-4"
              style={{ color: "#22c55e", background: "#22c55e12" }}
            >
              Facturation
            </span>
            {/* Title */}
            <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#111118] mb-5">
              5 erreurs de facturation qui vous coûtent cher
            </h1>
            {/* Meta */}
            <div className="flex items-center gap-4 text-[13px] text-[#A8A8B0]">
              <span>12 mars 2026</span>
              <span>·</span>
              <span>4 min de lecture</span>
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
                La facturation, pour beaucoup de freelances, c&apos;est la corvée qu&apos;on repousse. On préfère travailler
                sur un projet que de rédiger un devis. On oublie de relancer. On perd le fil des paiements. Pourtant, la facturation
                n&apos;est pas juste de la paperasse : c&apos;est la trésorerie de votre activité. Chaque erreur a un impact direct
                sur votre chiffre d&apos;affaires.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Voici les cinq erreurs les plus courantes que nous observons chez les freelances créatifs &mdash; et comment les éviter.
              </p>

              {/* Erreur 1 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Erreur 1 : Envoyer ses devis trop tard
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Un prospect vous contacte, enthousiaste. Vous discutez du projet, vous échangez des idées, tout semble aligné.
                Puis vous dites : &ldquo;Je vous envoie un devis cette semaine.&rdquo; Et cette semaine devient dix jours. Puis deux
                semaines. Le temps que votre devis arrive, le prospect a trouvé quelqu&apos;un d&apos;autre. Ou pire : il a perdu
                l&apos;urgence et le projet est reporté.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                La rapidité d&apos;envoi d&apos;un devis est directement corrélée au taux de conversion. Un devis envoyé dans les
                24 heures a deux fois plus de chances d&apos;être accepté qu&apos;un devis envoyé après une semaine. C&apos;est
                mathématique : l&apos;enthousiasme se dissipe, les alternatives apparaissent, et votre prospect passe à autre chose.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                La solution ? Avoir des modèles de devis prêts à l&apos;emploi, avec vos prestations types déjà rédigées.
                Il ne reste qu&apos;à personnaliser le détail et envoyer. Cinq minutes au lieu de deux heures.
              </p>

              {/* Erreur 2 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Erreur 2 : Ne jamais relancer
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Beaucoup de freelances ont un blocage psychologique avec la relance. Ils ont peur de &ldquo;déranger&rdquo;,
                de paraître insistants, de donner une mauvaise impression. Résultat : ils envoient un devis ou une facture,
                puis attendent. Indéfiniment.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                La réalité est très différente de cette crainte. Dans la grande majorité des cas, un client qui ne répond pas
                n&apos;a tout simplement pas vu votre email. Il est occupé. Il a 200 messages non lus. Ce n&apos;est pas du
                désintérêt, c&apos;est de la surcharge. Une relance polie et professionnelle est non seulement acceptable,
                elle est attendue.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Les données montrent qu&apos;une relance envoyée 7 jours après un devis augmente le taux d&apos;acceptation
                de 35 %. Et une deuxième relance à J+14 ajoute encore 15 %. Ne pas relancer, c&apos;est littéralement laisser
                de l&apos;argent sur la table.
              </p>

              {/* Callout */}
              <div className="bg-[#F8F7FF] border-l-4 border-[#7C5CFF] rounded-r-xl p-5 my-8">
                <p className="text-[13px] font-bold text-[#7C5CFF] uppercase tracking-wide mb-1">Bon réflexe</p>
                <p className="text-[14px] text-[#4A4A4A] leading-relaxed">
                  Programmez une relance automatique 7 jours après l&apos;envoi de chaque devis. C&apos;est professionnel,
                  efficace, et cela évite les oublis.
                </p>
              </div>

              {/* Erreur 3 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Erreur 3 : Perdre le suivi des paiements
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                &ldquo;Est-ce que cette facture a été payée ?&rdquo; Si vous devez ouvrir votre banque, chercher le virement,
                croiser avec votre tableur, et vérifier le montant... vous avez un problème de suivi. Ce n&apos;est pas un
                détail : c&apos;est la base de la santé financière de votre activité.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Sans suivi clair, vous ne savez pas où vous en êtes. Vous ne savez pas qui vous doit de l&apos;argent.
                Vous ne savez pas si un paiement est en retard depuis 3 jours ou 3 semaines. Et quand vous réalisez enfin
                qu&apos;un paiement manque, il est souvent trop tard pour réagir efficacement.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Un bon système de facturation doit vous montrer en un coup d&apos;oeil : les factures en attente,
                celles en retard, et celles payées. Avec des alertes automatiques quand un délai est dépassé.
              </p>

              {/* Erreur 4 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Erreur 4 : Mal nommer et mal ranger ses documents
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                &ldquo;Devis_final_v3_corrigé_VRAIVERSION.pdf&rdquo; &mdash; ça vous parle ? Le nommage chaotique des
                documents est un classique chez les freelances. Quand tout va bien, ce n&apos;est qu&apos;un inconfort mineur.
                Mais quand un client demande une copie de sa facture de mars, ou quand votre comptable a besoin de vos
                justificatifs, le chaos devient un vrai problème.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                La solution est simple mais demande de la discipline : une convention de nommage claire
                (ex : &ldquo;2026-03_Devis_NomClient_Projet.pdf&rdquo;) et un rangement par client ou par mois.
                Mieux encore : un outil qui génère automatiquement vos documents avec le bon nom et le bon classement.
              </p>

              {/* Erreur 5 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Erreur 5 : Ne pas relier facturation et commandes
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Votre outil de gestion de projets dit que la commande est &ldquo;livrée&rdquo;. Mais avez-vous facturé ?
                Votre tableur de facturation montre une facture &ldquo;envoyée&rdquo;. Mais à quelle commande correspond-elle ?
                Quand la facturation et les commandes vivent dans des outils séparés, les erreurs sont inévitables.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Des prestations non facturées, des factures en double, des montants incohérents... Ces erreurs sont
                embarrassantes devant un client et coûteuses pour votre activité. La facturation doit être connectée
                à vos commandes. Quand une commande est validée, la facture correspondante doit être prête.
              </p>

              {/* Warning callout */}
              <div className="bg-[#FFFBF0] border-l-4 border-[#F59E0B] rounded-r-xl p-5 my-8">
                <p className="text-[13px] font-bold text-[#F59E0B] uppercase tracking-wide mb-1">Obligation légale</p>
                <p className="text-[14px] text-[#4A4A4A] leading-relaxed">
                  En France, les factures doivent respecter des mentions obligatoires (numéro séquentiel, SIRET, TVA...).
                  Un outil adapté vous assure la conformité sans y penser.
                </p>
              </div>

              {/* Section finale */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Comment éviter ces erreurs
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                La plupart de ces erreurs ont une cause commune : des outils déconnectés et des processus manuels.
                Quand la facturation est intégrée à votre gestion de commandes et de clients, les devis se créent en
                quelques clics, les relances sont automatiques, et le suivi des paiements est en temps réel.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                C&apos;est exactement ce que propose Jestly. Votre facturation est liée à vos commandes, vos clients,
                et votre calendrier. Plus de doublons, plus d&apos;oublis, plus de recherche dans les dossiers.
                Découvrez comment simplifier votre facturation avec les{" "}
                <Link href="/fonctionnalites" className="text-[#7C5CFF] font-medium hover:underline">
                  fonctionnalités dédiées
                </Link>.
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
                Simplifiez votre facturation
              </h3>
              <p className="text-[14px] text-[#6B6F80] mb-6 leading-relaxed">
                Devis, factures, relances et suivi des paiements. Tout est connecté, tout est simple.
              </p>
              <TextSwapButton
                label="Découvrir la facturation"
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
              {/* Article 1 */}
              <Link href="/blog/comment-arreter-de-gerer-son-business-dans-6-outils" style={{ textDecoration: "none" }}>
                <div
                  className="bg-white border border-[#EEEDF2] rounded-xl p-5 h-full transition-shadow hover:shadow-[0_8px_30px_rgba(124,92,255,0.08)] hover:border-[rgba(124,92,255,0.15)]"
                >
                  <span
                    className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full mb-3"
                    style={{ color: "#F59E0B", background: "#F59E0B12" }}
                  >
                    Organisation
                  </span>
                  <h4 className="text-[15px] font-bold text-[#111118] leading-snug">
                    Comment arrêter de gérer son business dans 6 outils
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
