"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ArticleBriefClient() {
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
              Le guide complet du brief client réussi
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
              <span>25 février 2026</span>
              <span>·</span>
              <span>7 min de lecture</span>
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
              Un projet mal briefé, c&apos;est un projet qui déraille. Des allers-retours interminables, des révisions non prévues, un client frustré, un freelance épuisé, et un retard de paiement en prime. À l&apos;inverse, un brief bien structuré pose les fondations d&apos;une collaboration fluide&nbsp;: objectifs clairs, attentes alignées, exécution efficace.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Pourtant, la majorité des freelances créatifs n&apos;ont pas de processus de brief formalisé. Ils se contentent d&apos;un échange par e-mail ou d&apos;un appel rapide, en espérant avoir compris l&apos;essentiel. Ce guide vous donne une méthode complète pour collecter les bonnes informations, poser les bonnes questions, et transformer un brief en plan d&apos;action concret.
            </p>

            {/* H2 — Pourquoi les briefs ratés coûtent cher */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Pourquoi les briefs ratés coûtent si cher
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Le coût d&apos;un brief incomplet ne se limite pas au temps perdu en révisions. Il affecte l&apos;ensemble de la relation client. Un livrable qui ne correspond pas aux attentes génère de la frustration des deux côtés. Le client pense que vous n&apos;avez pas écouté. Vous pensez que le client ne sait pas ce qu&apos;il veut. En réalité, le problème vient du cadre initial.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Les conséquences sont concrètes et mesurables. Chaque aller-retour non prévu consomme entre 30&nbsp;minutes et 2&nbsp;heures de travail. Sur un projet moyen, un brief flou peut générer 3&nbsp;à&nbsp;5 cycles de révisions supplémentaires. C&apos;est autant de temps non facturé, qui réduit votre rentabilité effective et repousse les projets suivants.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Plus insidieux encore&nbsp;: un brief raté détériore la relation de confiance. Le client se met à micro-manager, à douter de vos choix créatifs. Vous perdez en autonomie et en plaisir. Le cercle vicieux s&apos;installe&nbsp;: moins de confiance, plus de contrôle, moins de créativité, moins de satisfaction. Tout ça parce que le cadre de départ n&apos;était pas posé.
            </p>

            {/* Callout — À retenir */}
            <div className="bg-[#F8F7FF] border-l-4 border-[#7C5CFF] rounded-r-xl p-5 my-8">
              <p className="text-[13px] font-bold text-[#7C5CFF] uppercase tracking-wide mb-1">
                À retenir
              </p>
              <p className="text-[14px] text-[#4A4A4A] leading-relaxed">
                80&nbsp;% des problèmes de livraison viennent d&apos;un brief flou ou incomplet. Investir 30&nbsp;minutes dans un bon brief vous économise des jours de corrections.
              </p>
            </div>

            {/* H2 — Les informations indispensables */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Les informations indispensables à collecter
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Un bon brief repose sur un ensemble d&apos;informations structurées qui couvrent le &laquo;&nbsp;quoi&nbsp;&raquo;, le &laquo;&nbsp;pour qui&nbsp;&raquo;, le &laquo;&nbsp;comment&nbsp;&raquo; et le &laquo;&nbsp;quand&nbsp;&raquo; du projet. Voici la liste des éléments essentiels à systématiquement recueillir&nbsp;:
            </p>
            <ul className="space-y-2 my-6 ml-1">
              {[
                "Objectif du projet : quel résultat concret le client attend-il ? (augmenter les ventes, refaire son identité, lancer un produit...)",
                "Cible et audience : à qui s'adresse le livrable ? Âge, profil, habitudes, attentes.",
                "Références visuelles : exemples aimés, exemples détestés, univers graphique souhaité.",
                "Contraintes techniques : formats, dimensions, outils imposés, charte existante.",
                "Délais : date de livraison souhaitée, jalons intermédiaires, dépendances externes.",
                "Budget : enveloppe disponible, flexibilité, conditions de paiement.",
                "Livrables attendus : liste précise de ce qui doit être livré (fichiers, formats, versions).",
                "Contact décisionnaire : qui valide ? Qui a le dernier mot ? Combien de valideurs ?",
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
              Il ne s&apos;agit pas de poser toutes ces questions lors d&apos;un même appel. Certaines informations peuvent être collectées via un formulaire structuré, d&apos;autres pendant une conversation. L&apos;essentiel, c&apos;est qu&apos;aucune ne soit oubliée avant de commencer la production.
            </p>

            {/* H2 — Poser les bonnes questions */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Poser les bonnes questions
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              La qualité d&apos;un brief dépend autant des questions posées que des réponses obtenues. La règle d&apos;or&nbsp;: privilégiez les questions ouvertes qui poussent le client à exprimer sa vision, plutôt que les questions fermées qui appellent un simple oui ou non.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Au lieu de demander &laquo;&nbsp;Vous voulez un design moderne&nbsp;?&nbsp;&raquo;, demandez &laquo;&nbsp;Montrez-moi 3&nbsp;exemples de sites ou visuels qui vous inspirent, et dites-moi ce qui vous plaît dans chacun&nbsp;&raquo;. Au lieu de &laquo;&nbsp;Le logo doit être coloré&nbsp;?&nbsp;&raquo;, essayez &laquo;&nbsp;Quelles émotions votre marque doit-elle évoquer chez votre client idéal&nbsp;?&nbsp;&raquo;. La nuance est subtile mais le résultat est radicalement différent.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Adaptez aussi vos questions au type de projet. Pour une vidéo, demandez le ton souhaité, le message clé, les scènes obligatoires et les contraintes de durée. Pour un projet de design, concentrez-vous sur les références visuelles, la charte existante et les supports de diffusion. Pour de la photographie, clarifiez l&apos;ambiance, le lieu, le nombre de photos et les retouches incluses.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Un piège courant&nbsp;: submerger le client avec trop de questions d&apos;un coup. Structurez votre questionnaire en sections courtes et progressives. Commencez par le contexte général, puis affinez vers les détails techniques. Le client doit sentir qu&apos;il est guidé, pas interrogé.
            </p>

            {/* H2 — Rendre le brief simple à remplir */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Rendre le brief simple à remplir
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Si votre brief prend la forme d&apos;un e-mail vide avec &laquo;&nbsp;Dites-moi ce que vous souhaitez&nbsp;&raquo;, vous obtiendrez des réponses vagues. La solution&nbsp;: un formulaire structuré, avec des sections claires, des exemples de réponses et des champs adaptés au type d&apos;information demandé.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Utilisez des listes déroulantes pour les choix prédéfinis (type de projet, urgence, budget approximatif). Laissez des champs de texte libre pour les réponses qui nécessitent de la nuance (vision créative, contexte, références). Et surtout, proposez des exemples pour chaque question&nbsp;: &laquo;&nbsp;Ex. : nous ciblons des femmes de 25-35 ans, urbaines, sensibles à l&apos;éco-responsabilité&nbsp;&raquo;.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Le format du brief compte aussi. Un formulaire en ligne est plus facile à remplir qu&apos;un PDF à télécharger, remplir et renvoyer. Il est aussi plus facile à exploiter&nbsp;: les réponses sont structurées, comparables d&apos;un projet à l&apos;autre, et directement intégrables dans votre workflow.
            </p>

            {/* H2 — Transformer les réponses en exécution */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Transformer les réponses en exécution
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Un brief bien rempli ne sert à rien s&apos;il reste dans un dossier. La valeur du brief se réalise quand il alimente directement votre plan d&apos;exécution. Chaque réponse doit se traduire en action concrète&nbsp;: l&apos;objectif devient le fil directeur créatif, les délais deviennent des jalons dans votre calendrier, les livrables deviennent une checklist de production.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Créez un lien direct entre le brief et votre gestion de projet. Quand une tâche est ambiguë pendant la production, revenez au brief. Quand le client demande une modification qui sort du périmètre, montrez-lui le brief validé. Ce document devient votre référence commune, un contrat moral qui protège les deux parties.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              L&apos;idéal, c&apos;est de pouvoir passer du brief à la création de tâches en un clic. Les réponses du client alimentent automatiquement la fiche projet&nbsp;: objectif, deadline, livrables, références. Vous gagnez du temps sur le setup et vous vous assurez que rien n&apos;est perdu en route entre la collecte et la production.
            </p>

            {/* Checklist callout */}
            <div className="bg-[#F0FDF4] border-l-4 border-[#22c55e] rounded-r-xl p-5 my-8">
              <p className="text-[13px] font-bold text-[#22c55e] uppercase tracking-wide mb-1">
                Checklist
              </p>
              <p className="text-[14px] text-[#4A4A4A] leading-relaxed font-semibold mb-2">
                Le brief parfait contient&nbsp;:
              </p>
              <ul className="space-y-1.5">
                {[
                  "Objectif clair et mesurable",
                  "Références visuelles fournies par le client",
                  "Délais définis avec jalons intermédiaires",
                  "Livrables listés précisément (formats, quantités)",
                  "Budget validé et conditions de paiement clarifiées",
                  "Contact décisionnaire identifié",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[14px] text-[#4A4A4A] leading-relaxed"
                  >
                    <span className="text-[#22c55e] mt-0.5">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* H2 — Comment Jestly relie brief, commande et production */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Comment Jestly relie brief, commande et production
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Chez Jestly, le brief n&apos;est pas un document isolé. Il fait partie intégrante du parcours de commande. Quand un client remplit un formulaire de brief, les réponses alimentent directement la fiche commande&nbsp;: objectif, deadline, livrables, références. Vous retrouvez tout au même endroit, sans recopier quoi que ce soit.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Le lien entre brief et production se fait naturellement. Les éléments du brief deviennent des tâches dans votre espace projet. Les fichiers de référence fournis par le client sont attachés à la commande. Et quand vous avez besoin de vérifier une information pendant la production, elle est accessible en deux clics — pas enfouie dans un e-mail de la semaine dernière.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Découvrez comment structurer vos{" "}
              <Link
                href="/fonctionnalites/commandes"
                className="text-[#7C5CFF] font-medium hover:underline"
              >
                commandes
              </Link>{" "}
              et vos{" "}
              <Link
                href="/fonctionnalites/briefs"
                className="text-[#7C5CFF] font-medium hover:underline"
              >
                briefs
              </Link>{" "}
              dans Jestly pour gagner du temps sur chaque projet.
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
                Structurez vos briefs, simplifiez vos projets
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
                Avec Jestly, le brief alimente directement la commande et le suivi de production. Plus rien ne se perd.
              </p>
              <TextSwapButton
                label="Structurez vos briefs"
                href="/fonctionnalites/briefs"
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
                  href="/blog/la-methode-pour-suivre-ses-clients-sans-crm-complexe"
                  className="block bg-white border border-[#EEEDF2] rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: "#EC4899" }}
                  >
                    Relation client
                  </span>
                  <h4 className="text-[15px] font-bold text-[#111118] mt-2">
                    La méthode pour suivre ses clients sans CRM complexe
                  </h4>
                </Link>
                <Link
                  href="/blog/comment-creer-un-site-freelance-qui-convertit"
                  className="block bg-white border border-[#EEEDF2] rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: "#A855F7" }}
                  >
                    Portfolio
                  </span>
                  <h4 className="text-[15px] font-bold text-[#111118] mt-2">
                    Comment créer un site freelance qui convertit
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
