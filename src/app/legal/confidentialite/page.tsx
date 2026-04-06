import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — Jestly",
  description: "Politique de confidentialité et protection des données personnelles de Jestly.",
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href="/"
        className="text-sm text-[#4F46E5] hover:text-[#4338CA] transition-colors mb-8 inline-block"
      >
        &larr; Retour à l&apos;accueil
      </Link>

      <h1 className="text-3xl font-bold text-[#191919] mb-8">
        Politique de Confidentialité
      </h1>

      <p className="text-[#5A5A58] leading-relaxed">
        Jestly accorde une importance fondamentale à la protection de vos données personnelles. La
        présente politique de confidentialité décrit les données que nous collectons, pourquoi nous
        les collectons, comment nous les utilisons et quels sont vos droits, conformément au
        Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
      </p>

      {/* 1. Responsable du traitement */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        1. Responsable du traitement
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Le responsable du traitement des données personnelles est :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>
          <strong>Jestly</strong>
        </li>
        <li>Site web : jestly.fr</li>
        <li>
          E-mail de contact :{" "}
          <a href="mailto:jestlyapp@gmail.com" className="text-[#4F46E5] hover:underline">
            jestlyapp@gmail.com
          </a>
        </li>
      </ul>

      {/* 2. Données collectées */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">2. Données collectées</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Dans le cadre de l&apos;utilisation de la Plateforme, nous sommes amenés à collecter les
        catégories de données suivantes :
      </p>

      <h3 className="text-lg font-medium text-[#191919] mt-6 mb-3">
        Données liées au compte
      </h3>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2">
        <li>Adresse e-mail</li>
        <li>Nom et prénom</li>
        <li>Nom d&apos;activité / nom commercial</li>
        <li>Photo de profil (facultatif)</li>
      </ul>

      <h3 className="text-lg font-medium text-[#191919] mt-6 mb-3">
        Données d&apos;utilisation
      </h3>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2">
        <li>Pages consultées et fonctionnalités utilisées</li>
        <li>Adresse IP et données de connexion</li>
        <li>Type de navigateur et système d&apos;exploitation</li>
        <li>Date et heure des visites</li>
      </ul>

      <h3 className="text-lg font-medium text-[#191919] mt-6 mb-3">
        Données liées au paiement
      </h3>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2">
        <li>
          Les informations de paiement (numéro de carte, etc.) sont traitées exclusivement par notre
          prestataire <strong>Stripe</strong> et ne sont jamais stockées sur nos serveurs.
        </li>
        <li>Nous conservons uniquement l&apos;historique des transactions (montant, date, statut).</li>
      </ul>

      <h3 className="text-lg font-medium text-[#191919] mt-6 mb-3">
        Données métier
      </h3>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2">
        <li>Informations relatives à vos clients, commandes, produits et projets saisies dans la Plateforme</li>
        <li>Contenus de vos sites web créés via Jestly</li>
        <li>Messages et formulaires de contact reçus via vos sites publics</li>
      </ul>

      {/* 3. Finalités du traitement */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        3. Finalités du traitement
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Vos données personnelles sont collectées et traitées pour les finalités suivantes :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>Création et gestion de votre compte utilisateur</li>
        <li>Fourniture, maintenance et amélioration des services de la Plateforme</li>
        <li>Gestion des abonnements et de la facturation</li>
        <li>Communication relative au service (notifications, mises à jour, support)</li>
        <li>Analyse d&apos;utilisation et statistiques anonymisées pour améliorer l&apos;expérience</li>
        <li>Respect des obligations légales et réglementaires</li>
        <li>Prévention de la fraude et sécurité du service</li>
      </ul>

      {/* 4. Base légale */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">4. Base légale</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Le traitement de vos données repose sur les bases légales suivantes :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>
          <strong>Exécution du contrat</strong> : le traitement est nécessaire à la fourniture du
          service auquel vous avez souscrit.
        </li>
        <li>
          <strong>Consentement</strong> : pour les cookies non essentiels et les communications
          marketing.
        </li>
        <li>
          <strong>Intérêt légitime</strong> : pour l&apos;amélioration du service, les statistiques
          d&apos;utilisation et la prévention de la fraude.
        </li>
        <li>
          <strong>Obligation légale</strong> : pour la conservation des données de facturation et le
          respect des obligations fiscales.
        </li>
      </ul>

      {/* 5. Durée de conservation */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        5. Durée de conservation
      </h2>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2">
        <li>
          <strong>Données de compte</strong> : conservées pendant toute la durée de votre
          inscription, puis supprimées dans un délai de 30 jours après la suppression du compte.
        </li>
        <li>
          <strong>Données de facturation</strong> : conservées pendant 10 ans conformément aux
          obligations comptables et fiscales françaises.
        </li>
        <li>
          <strong>Données d&apos;utilisation</strong> : conservées pendant 13 mois maximum.
        </li>
        <li>
          <strong>Logs de connexion</strong> : conservés pendant 12 mois conformément à la
          législation en vigueur.
        </li>
      </ul>

      {/* 6. Destinataires */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">6. Destinataires</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Vos données peuvent être partagées avec les sous-traitants suivants, strictement dans le
        cadre des finalités décrites ci-dessus :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>
          <strong>Supabase</strong> (hébergement de la base de données et authentification) — serveurs
          en Union européenne.
        </li>
        <li>
          <strong>Stripe</strong> (traitement des paiements) — certifié PCI-DSS, données traitées
          conformément au RGPD.
        </li>
        <li>
          <strong>Vercel</strong> (hébergement de l&apos;application web) — réseau de diffusion mondial
          avec des nœuds en Europe.
        </li>
      </ul>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        Jestly ne vend, ne loue et ne cède jamais vos données personnelles à des tiers à des fins
        commerciales.
      </p>

      {/* 7. Transferts hors UE */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        7. Transferts hors Union européenne
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Certains de nos sous-traitants (Stripe, Vercel) peuvent traiter des données en dehors de
        l&apos;Union européenne, notamment aux États-Unis. Dans ce cas, ces transferts sont encadrés
        par des garanties appropriées :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>Clauses contractuelles types approuvées par la Commission européenne</li>
        <li>Cadre de protection des données UE-États-Unis (EU-U.S. Data Privacy Framework)</li>
      </ul>

      {/* 8. Droits des utilisateurs */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        8. Droits des utilisateurs
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>
          <strong>Droit d&apos;accès</strong> : obtenir la confirmation que vos données sont traitées et
          en recevoir une copie.
        </li>
        <li>
          <strong>Droit de rectification</strong> : faire corriger vos données inexactes ou
          incomplètes.
        </li>
        <li>
          <strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données, sous
          réserve des obligations légales de conservation.
        </li>
        <li>
          <strong>Droit à la limitation</strong> : demander la restriction du traitement dans
          certains cas prévus par le RGPD.
        </li>
        <li>
          <strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré,
          couramment utilisé et lisible par machine.
        </li>
        <li>
          <strong>Droit d&apos;opposition</strong> : vous opposer au traitement de vos données pour des
          motifs légitimes.
        </li>
        <li>
          <strong>Droit de retirer votre consentement</strong> : à tout moment, pour les traitements
          fondés sur le consentement.
        </li>
      </ul>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        Pour exercer ces droits, contactez-nous à{" "}
        <a href="mailto:jestlyapp@gmail.com" className="text-[#4F46E5] hover:underline">
          jestlyapp@gmail.com
        </a>
        . Nous nous engageons à répondre dans un délai de 30 jours.
      </p>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        Vous disposez également du droit d&apos;introduire une réclamation auprès de la CNIL
        (Commission Nationale de l&apos;Informatique et des Libertés) :{" "}
        <a
          href="https://www.cnil.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4F46E5] hover:underline"
        >
          www.cnil.fr
        </a>
      </p>

      {/* 9. Cookies */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">9. Cookies</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        La Plateforme utilise des cookies pour assurer son bon fonctionnement et améliorer
        l&apos;expérience utilisateur.
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>
          <strong>Cookies essentiels</strong> : nécessaires au fonctionnement du service
          (authentification, session, sécurité). Ils ne requièrent pas votre consentement.
        </li>
        <li>
          <strong>Cookies analytiques</strong> : permettent de mesurer l&apos;audience et
          d&apos;analyser l&apos;utilisation du service. Ces cookies sont déposés uniquement avec
          votre consentement.
        </li>
      </ul>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        Vous pouvez à tout moment modifier vos préférences en matière de cookies via les paramètres
        de votre navigateur.
      </p>

      {/* 10. Sécurité */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">10. Sécurité</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Jestly met en œuvre des mesures techniques et organisationnelles appropriées pour protéger
        vos données personnelles contre tout accès non autorisé, perte, altération ou divulgation :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>Chiffrement des données en transit (HTTPS/TLS)</li>
        <li>Chiffrement des données au repos</li>
        <li>Authentification sécurisée et gestion des sessions</li>
        <li>Contrôle d&apos;accès basé sur les rôles (Row Level Security via Supabase)</li>
        <li>Sauvegardes régulières et plan de reprise d&apos;activité</li>
      </ul>

      {/* 11. Modification de la politique */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        11. Modification de la politique
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Jestly peut être amené à modifier la présente politique de confidentialité pour
        l&apos;adapter aux évolutions légales, réglementaires ou techniques. En cas de modification
        substantielle, les Utilisateurs seront informés par e-mail ou notification dans
        l&apos;interface, au moins 15 jours avant l&apos;entrée en vigueur.
      </p>

      {/* 12. Contact DPO */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">12. Contact</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Pour toute question relative à la protection de vos données personnelles ou pour exercer vos
        droits, vous pouvez nous contacter :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>
          Par e-mail :{" "}
          <a href="mailto:jestlyapp@gmail.com" className="text-[#4F46E5] hover:underline">
            jestlyapp@gmail.com
          </a>
        </li>
        <li>Objet : « Protection des données — [votre demande] »</li>
      </ul>

      {/* Dernière mise à jour */}
      <div className="mt-16 pt-8 border-t border-[#E6E6E4]">
        <p className="text-sm text-[#8A8A88]">Dernière mise à jour : 19 mars 2026</p>
      </div>
    </div>
  );
}
