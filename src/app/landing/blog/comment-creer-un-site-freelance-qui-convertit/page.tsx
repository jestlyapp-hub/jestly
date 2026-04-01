"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ArticlePortfolio() {
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
              <span className="text-[#6B6F80]">Portfolio</span>
            </div>
            {/* Category badge */}
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full mb-4"
              style={{ color: "#A855F7", background: "#A855F712" }}
            >
              Portfolio
            </span>
            {/* Title */}
            <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#111118] mb-5">
              Comment créer un site freelance qui convertit
            </h1>
            {/* Meta */}
            <div className="flex items-center gap-4 text-[13px] text-[#A8A8B0]">
              <span>8 mars 2026</span>
              <span>·</span>
              <span>6 min de lecture</span>
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
                Votre site est votre vitrine. C&apos;est souvent le premier point de contact entre vous et un prospect.
                Et pourtant, la plupart des sites de freelances ne convertissent pas. Ils sont jolis, parfois même
                impressionnants visuellement, mais ils ne transforment pas les visiteurs en clients.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Le problème n&apos;est presque jamais le design. C&apos;est la structure, le message, et la clarté.
                Un site qui convertit n&apos;est pas un site &ldquo;beau&rdquo;. C&apos;est un site qui répond aux
                bonnes questions, dans le bon ordre, au bon moment.
              </p>

              {/* Section 1 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Ce que les prospects veulent voir en premier
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Quand un prospect arrive sur votre site, il a trois questions en tête. Premièrement : &ldquo;Est-ce que
                cette personne fait ce dont j&apos;ai besoin ?&rdquo; Deuxièmement : &ldquo;Est-ce qu&apos;elle est
                compétente ?&rdquo; Troisièmement : &ldquo;Comment je la contacte ?&rdquo;
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Si votre site ne répond pas à ces trois questions dans les premières secondes, vous perdez le visiteur.
                Pas dans cinq minutes. Dans cinq secondes. C&apos;est le temps moyen qu&apos;un utilisateur passe
                avant de décider s&apos;il reste ou s&apos;il ferme l&apos;onglet.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                La clarté de votre offre doit être immédiate. Pas de métaphores abstraites, pas de &ldquo;je crée des
                expériences digitales sur mesure&rdquo;. Dites clairement ce que vous faites, pour qui, et quel
                résultat vous apportez. Par exemple : &ldquo;Je crée des sites vitrines pour les artisans qui veulent
                plus de clients locaux.&rdquo; C&apos;est clair, c&apos;est spécifique, ça parle.
              </p>

              {/* Section 2 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Comment clarifier votre offre
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                La première étape est de définir une proposition de valeur unique. Pas trois. Pas cinq. Une seule phrase
                qui résume ce que vous apportez. Cette phrase doit être visible dès l&apos;arrivée sur votre site,
                dans votre section héro, en gros caractères.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Ensuite, listez vos services de manière concrète. Pas &ldquo;branding&rdquo; ou &ldquo;UX design&rdquo;
                sans contexte. Mais &ldquo;Création d&apos;identité visuelle complète (logo, charte, supports print)&rdquo;
                ou &ldquo;Refonte de site web avec optimisation mobile et SEO&rdquo;. Le prospect doit comprendre
                exactement ce qu&apos;il obtient.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Évitez le jargon technique. Vos prospects ne sont pas des designers ou des développeurs. Parlez leur
                langue : résultats, bénéfices, problèmes résolus. &ldquo;Un site rapide qui apparaît sur Google&rdquo;
                vaut mieux que &ldquo;Optimisation Core Web Vitals et stratégie SEO on-page&rdquo;.
              </p>

              {/* Callout */}
              <div className="bg-[#F8F7FF] border-l-4 border-[#7C5CFF] rounded-r-xl p-5 my-8">
                <p className="text-[13px] font-bold text-[#7C5CFF] uppercase tracking-wide mb-1">À retenir</p>
                <p className="text-[14px] text-[#4A4A4A] leading-relaxed">
                  Un visiteur décide en 5 secondes s&apos;il reste ou part. Votre proposition de valeur doit être
                  visible et compréhensible instantanément.
                </p>
              </div>

              {/* Section 3 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Portfolio, preuve sociale et crédibilité
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Votre portfolio est votre argument le plus puissant. Mais attention : montrer 50 projets n&apos;est pas
                mieux que d&apos;en montrer 6 bien présentés. Choisissez vos meilleurs travaux, ceux qui correspondent
                au type de client que vous voulez attirer, et présentez-les avec contexte.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Pour chaque projet, ne montrez pas juste le visuel. Expliquez le problème du client, votre approche, et
                le résultat obtenu. Un prospect ne veut pas juste voir que vous savez faire du joli. Il veut comprendre
                que vous savez résoudre des problèmes similaires au sien.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Les témoignages clients sont un accélérateur de confiance considérable. Un avis authentique, avec le nom
                et la photo du client, vaut plus que n&apos;importe quel argumentaire commercial. Si vous n&apos;en avez
                pas encore, demandez-en à vos trois derniers clients satisfaits. La plupart seront ravis de vous aider.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Les logos de clients ou de marques avec lesquelles vous avez travaillé sont un autre signal fort. Même
                si ce sont de petites entreprises, voir des logos reconnaissables rassure instantanément.
              </p>

              {/* Section 4 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                L&apos;anatomie d&apos;un site freelance qui convertit
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Un site qui convertit suit une structure logique, pensée pour guider le visiteur vers l&apos;action.
                Voici les sections essentielles, dans l&apos;ordre :
              </p>
              <ul className="space-y-2 my-6 ml-1">
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Héro</strong> : votre proposition de valeur + un bouton d&apos;action clair (&ldquo;Demander un devis&rdquo;, &ldquo;Me contacter&rdquo;).</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Services</strong> : ce que vous proposez, clairement listé, avec les bénéfices pour le client.</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Portfolio</strong> : vos meilleurs travaux avec contexte (problème, solution, résultat).</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Témoignages</strong> : avis clients authentiques avec nom et contexte.</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>À propos</strong> : qui vous êtes, votre parcours, ce qui vous différencie. Humanisez votre marque.</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Contact / CTA final</strong> : un formulaire simple ou un bouton visible. Pas caché dans le footer.</span>
                </li>
              </ul>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Chaque section doit naturellement mener à la suivante. Le visiteur descend, sa confiance grandit, et
                quand il arrive au formulaire de contact, il est prêt à passer à l&apos;action.
              </p>

              {/* Section 5 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Les 5 erreurs qui font fuir les prospects
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Même avec une bonne structure, certaines erreurs techniques ou stratégiques peuvent ruiner vos efforts.
                Voici les plus courantes :
              </p>
              <ul className="space-y-2 my-6 ml-1">
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Un site trop lent</strong> : au-delà de 3 secondes de chargement, 53 % des visiteurs mobiles quittent la page. Optimisez vos images et choisissez un hébergement performant.</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Aucun appel à l&apos;action</strong> : si le visiteur ne sait pas quoi faire, il ne fera rien. Chaque page doit avoir un CTA visible et clair.</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Une offre floue</strong> : &ldquo;Je fais du design&rdquo; ne dit rien. Soyez spécifique sur ce que vous proposez et à qui.</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Pas de version mobile</strong> : plus de 60 % du trafic web est mobile. Si votre site n&apos;est pas responsive, vous perdez la majorité de vos visiteurs.</span>
                </li>
                <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] mt-2.5 flex-shrink-0" />
                  <span><strong>Un contact caché</strong> : votre formulaire ou votre email ne doit pas être uniquement dans le footer. Rendez-le accessible depuis chaque section.</span>
                </li>
              </ul>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Corrigez ces cinq points et vous verrez une différence immédiate dans le comportement de vos visiteurs.
                Plus de temps passé sur le site, plus de pages vues, et surtout plus de prises de contact.
              </p>

              {/* Section 6 */}
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
                Construire son site sans complexité
              </h2>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Beaucoup de freelances repoussent la création de leur site parce qu&apos;ils pensent que c&apos;est
                compliqué. Et c&apos;est vrai que configurer un WordPress avec des plugins, un thème, un hébergement,
                un nom de domaine, et maintenir tout ça à jour... c&apos;est un projet en soi.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Mais il existe aujourd&apos;hui des solutions qui éliminent cette complexité. Avec{" "}
                <Link href="/fonctionnalites" className="text-[#7C5CFF] font-medium hover:underline">
                  Jestly
                </Link>,
                vous construisez votre site vitrine directement depuis votre espace de gestion. Pas de code, pas de
                plugin, pas de configuration technique. Vous choisissez vos blocs (héro, services, portfolio,
                témoignages, contact), vous personnalisez le contenu, et votre site est en ligne.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                L&apos;avantage d&apos;un site intégré à votre outil de gestion est considérable : vos produits et
                services sont synchronisés, vos formulaires de contact alimentent directement votre base clients,
                et vos témoignages se mettent à jour en un clic. Plus besoin de jongler entre votre site et votre
                back-office. Tout est au même endroit.
              </p>
              <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
                Et avec un sous-domaine personnalisé (prenom.jestly.fr), vous avez une adresse professionnelle sans
                avoir à gérer de nom de domaine. Idéal pour démarrer rapidement et se concentrer sur ce qui compte :
                trouver des clients et faire du bon travail.
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
                Créez votre site vitrine
              </h3>
              <p className="text-[14px] text-[#6B6F80] mb-6 leading-relaxed">
                Un site professionnel, intégré à votre gestion, en quelques minutes. Sans code, sans prise de tête.
              </p>
              <TextSwapButton
                label="Découvrir le site vitrine"
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
              {/* Article 4 */}
              <Link href="/blog/la-methode-pour-suivre-ses-clients-sans-crm-complexe" style={{ textDecoration: "none" }}>
                <div
                  className="bg-white border border-[#EEEDF2] rounded-xl p-5 h-full transition-shadow hover:shadow-[0_8px_30px_rgba(124,92,255,0.08)] hover:border-[rgba(124,92,255,0.15)]"
                >
                  <span
                    className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full mb-3"
                    style={{ color: "#EC4899", background: "#EC489912" }}
                  >
                    Relation client
                  </span>
                  <h4 className="text-[15px] font-bold text-[#111118] leading-snug">
                    La méthode pour suivre ses clients sans CRM complexe
                  </h4>
                </div>
              </Link>
              {/* Article 6 */}
              <Link href="/blog/le-guide-complet-du-brief-client-reussi" style={{ textDecoration: "none" }}>
                <div
                  className="bg-white border border-[#EEEDF2] rounded-xl p-5 h-full transition-shadow hover:shadow-[0_8px_30px_rgba(124,92,255,0.08)] hover:border-[rgba(124,92,255,0.15)]"
                >
                  <span
                    className="inline-block text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-full mb-3"
                    style={{ color: "#EC4899", background: "#EC489912" }}
                  >
                    Relation client
                  </span>
                  <h4 className="text-[15px] font-bold text-[#111118] leading-snug">
                    Le guide complet du brief client réussi
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
