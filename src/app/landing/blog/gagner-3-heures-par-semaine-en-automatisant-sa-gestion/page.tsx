"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ArticleAutomatisation() {
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
                <span style={{ color: "#7C5CFF" }}>Productivité</span>
              </div>

              {/* Category badge */}
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#7C5CFF",
                  background: "rgba(124,92,255,0.08)",
                  border: "1px solid rgba(124,92,255,0.2)",
                  marginBottom: 20,
                }}
              >
                Productivité
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
              Gagner 3&nbsp;heures par semaine en automatisant sa gestion
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
              <span>1 mars 2026</span>
              <span>·</span>
              <span>5 min de lecture</span>
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
              3&nbsp;heures par semaine, ça ne semble pas énorme. Pourtant, ramenées à l&apos;année, c&apos;est plus de 150&nbsp;heures — l&apos;équivalent d&apos;un mois complet de travail productif. Un mois entier passé à copier-coller des données, mettre à jour des tableaux, envoyer des relances manuellement et chercher des fichiers dans des dossiers mal organisés.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              La bonne nouvelle&nbsp;: la majorité de ces tâches sont automatisables. Pas avec des outils complexes comme Zapier ou Make (même s&apos;ils ont leur place), mais en repensant la façon dont vous organisez votre activité. Voici comment identifier et éliminer ces micro-frictions qui grignote votre temps.
            </p>

            {/* H2 — Où part votre temps */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Où part réellement votre temps
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Avant d&apos;automatiser, il faut diagnostiquer. Prenez une semaine type et listez chaque tâche administrative que vous effectuez. Pas les tâches créatives — celles qui ne génèrent pas de valeur directe mais qui sont nécessaires au fonctionnement de votre activité.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Pour la plupart des freelances créatifs, l&apos;audit révèle les mêmes coupables&nbsp;: mettre à jour un tableur de suivi, recopier les coordonnées d&apos;un client entre deux outils, rédiger et envoyer des relances de paiement, synchroniser manuellement le calendrier avec les deadlines de projet, et passer 10&nbsp;minutes à retrouver un fichier envoyé par e-mail il y a trois semaines.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Individuellement, chacune de ces tâches prend 5&nbsp;à&nbsp;15 minutes. Mais cumulées sur une semaine, elles représentent entre 2&nbsp;et&nbsp;4&nbsp;heures de temps perdu. Et le pire, c&apos;est qu&apos;elles fragmentent votre concentration&nbsp;: chaque micro-interruption administrative casse votre flux créatif.
            </p>

            {/* H2 — Les 5 tâches répétitives */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Les 5&nbsp;tâches répétitives à éliminer
            </h2>

            <h3 className="text-[18px] font-bold text-[#111118] mt-8 mb-3">
              1. Copier les infos client entre outils
            </h3>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Vous recevez un message sur Instagram, vous notez le nom dans un tableur, vous créez un contact dans votre boîte mail, vous ajoutez une ligne dans votre suivi de projets. La même information saisie trois fois. C&apos;est la première source de perte de temps — et d&apos;erreurs. Quand toutes vos données client vivent au même endroit, cette duplication disparaît.
            </p>

            <h3 className="text-[18px] font-bold text-[#111118] mt-8 mb-3">
              2. Mettre à jour manuellement les statuts de commande
            </h3>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              &laquo;&nbsp;Devis accepté&nbsp;&raquo;, &laquo;&nbsp;en production&nbsp;&raquo;, &laquo;&nbsp;livré&nbsp;&raquo;, &laquo;&nbsp;facturé&nbsp;&raquo;… Chaque changement d&apos;étape nécessite une mise à jour manuelle dans votre système de suivi. Si l&apos;outil le fait automatiquement quand vous validez une action, vous gagnez du temps à chaque projet.
            </p>

            <h3 className="text-[18px] font-bold text-[#111118] mt-8 mb-3">
              3. Envoyer des relances de paiement à la main
            </h3>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Rédiger un e-mail de relance poli, retrouver le numéro de facture, vérifier la date d&apos;échéance, envoyer, noter que la relance a été faite. Ce processus prend facilement 10&nbsp;minutes par relance. Multiplié par 3&nbsp;ou&nbsp;4&nbsp;clients en retard par mois, ça s&apos;accumule vite. Une relance automatisée, déclenchée à J+7 après la date d&apos;échéance, résout le problème sans effort.
            </p>

            <h3 className="text-[18px] font-bold text-[#111118] mt-8 mb-3">
              4. Dupliquer les données dans le calendrier
            </h3>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Vous créez une tâche avec une deadline dans votre gestionnaire de projets, puis vous allez dans Google Agenda pour bloquer le créneau correspondant. Double saisie, risque d&apos;oubli. Quand tâches et calendrier sont synchronisés nativement, chaque deadline apparaît automatiquement dans votre vue agenda.
            </p>

            <h3 className="text-[18px] font-bold text-[#111118] mt-8 mb-3">
              5. Chercher des fichiers dispersés
            </h3>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Le brief est dans un e-mail, les assets dans Google Drive, les retours client dans WhatsApp, la facture dans un PDF sur le bureau. Retrouver le bon fichier au bon moment est une perte de temps invisible mais constante. Centraliser les documents par projet élimine cette friction.
            </p>

            {/* Callout — À retenir */}
            <div className="bg-[#F8F7FF] border-l-4 border-[#7C5CFF] rounded-r-xl p-5 my-8">
              <p className="text-[13px] font-bold text-[#7C5CFF] uppercase tracking-wide mb-1">
                À retenir
              </p>
              <p className="text-[14px] text-[#4A4A4A] leading-relaxed">
                Si vous faites la même action plus de 3&nbsp;fois par semaine, c&apos;est automatisable. Commencez par identifier ces répétitions avant de chercher des solutions.
              </p>
            </div>

            {/* H2 — Automatiser le passage d'étapes */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Automatiser le passage d&apos;étapes
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              L&apos;automatisation la plus rentable pour un freelance, c&apos;est la transition automatique entre les étapes d&apos;un projet. Quand vous marquez un livrable comme terminé, la facture devrait se générer. Quand la facture est envoyée, le statut du projet passe à &laquo;&nbsp;en attente de paiement&nbsp;&raquo;. Quand le paiement est reçu, le projet se clôture.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Ce type d&apos;enchaînement élimine les oublis. Plus besoin de se demander &laquo;&nbsp;Est-ce que j&apos;ai bien envoyé la facture pour ce projet&nbsp;?&nbsp;&raquo; ou &laquo;&nbsp;Ce client a-t-il été notifié de la livraison&nbsp;?&nbsp;&raquo;. Le système fait le travail de mémoire à votre place.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              L&apos;important, c&apos;est que ces automatisations restent transparentes. Vous devez toujours voir ce qui se passe et pouvoir intervenir. L&apos;objectif n&apos;est pas de tout déléguer aveuglément à une machine, mais d&apos;éliminer les tâches à faible valeur pour vous concentrer sur ce qui compte&nbsp;: créer et livrer.
            </p>

            {/* H2 — Centraliser */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Centraliser documents, suivi et rappels
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Le gain de temps le plus sous-estimé vient de la centralisation. Quand tout est au même endroit — clients, projets, fichiers, calendrier, factures — vous ne perdez plus de temps à naviguer entre les outils. Chaque information est accessible en deux clics maximum.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Cela ne veut pas dire qu&apos;il faut tout remplacer d&apos;un coup. Commencez par regrouper les données les plus utilisées&nbsp;: contacts clients et suivi de projets. Puis ajoutez progressivement les fichiers, le calendrier, la facturation. L&apos;adoption progressive est la clé d&apos;un changement durable.
            </p>

            {/* Checklist callout */}
            <div className="bg-[#F0FDF4] border-l-4 border-[#22c55e] rounded-r-xl p-5 my-8">
              <p className="text-[13px] font-bold text-[#22c55e] uppercase tracking-wide mb-1">
                Checklist
              </p>
              <p className="text-[14px] text-[#4A4A4A] leading-relaxed font-semibold mb-2">
                5&nbsp;gains rapides à mettre en place cette semaine&nbsp;:
              </p>
              <ul className="space-y-1.5">
                {[
                  "Configurer des rappels automatiques pour les relances client",
                  "Créer des modèles réutilisables pour devis et factures",
                  "Connecter le calendrier aux deadlines de vos tâches",
                  "Centraliser toutes les données client dans un seul outil",
                  "Automatiser les transitions de statut entre étapes de projet",
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

            {/* H2 — Pourquoi rester simple */}
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111118] mt-12 mb-4">
              Pourquoi l&apos;automatisation doit rester simple
            </h2>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Il est tentant de vouloir tout automatiser d&apos;un coup. Créer des workflows complexes avec des dizaines de conditions, des branches et des exceptions. Résistez à cette tentation. Une automatisation trop complexe est une automatisation que vous ne comprendrez plus dans trois mois — et que vous finirez par désactiver.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Commencez par 2&nbsp;ou&nbsp;3 automatisations simples. Mesurez le temps gagné. Puis ajoutez-en une nouvelle quand les premières fonctionnent bien. Cette approche progressive garantit que chaque automatisation vous sert réellement, au lieu de créer une usine à gaz que personne ne maintient.
            </p>
            <p className="text-[15px] leading-[1.8] text-[#4A4A4A] mb-6">
              Un outil comme Jestly intègre ces automatisations de base nativement&nbsp;: pas de configuration compliquée, pas de connecteurs tiers, juste des enchaînements logiques qui fonctionnent dès le premier jour. Découvrez toutes les{" "}
              <Link
                href="/fonctionnalites"
                className="text-[#7C5CFF] font-medium hover:underline"
              >
                fonctionnalités disponibles
              </Link>
              .
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
                Centralisez et automatisez votre gestion
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
                Arrêtez de perdre du temps sur des tâches répétitives. Jestly regroupe tout ce dont un freelance a besoin.
              </p>
              <TextSwapButton
                label="Centralisez et automatisez"
                href="/fonctionnalites"
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
                  href="/blog/comment-arreter-de-gerer-son-business-dans-6-outils"
                  className="block bg-white border border-[#EEEDF2] rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: "#F59E0B" }}
                  >
                    Organisation
                  </span>
                  <h4 className="text-[15px] font-bold text-[#111118] mt-2">
                    Comment arrêter de gérer son business dans 6&nbsp;outils
                  </h4>
                </Link>
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
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
