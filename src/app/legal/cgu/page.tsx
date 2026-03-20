import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Jestly",
  description: "Conditions générales d'utilisation de la plateforme Jestly.",
};

export default function CGUPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href="/landing"
        className="text-sm text-[#4F46E5] hover:text-[#4338CA] transition-colors mb-8 inline-block"
      >
        &larr; Retour à l&apos;accueil
      </Link>

      <h1 className="text-3xl font-bold text-[#191919] mb-8">
        Conditions Générales d&apos;Utilisation
      </h1>

      {/* 1. Objet */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">1. Objet</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») ont pour objet de
        définir les modalités et conditions d&apos;utilisation de la plateforme Jestly, accessible à
        l&apos;adresse <strong>jestly.fr</strong> (ci-après « la Plateforme »), ainsi que les droits
        et obligations des parties dans ce cadre.
      </p>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        Toute inscription ou utilisation de la Plateforme implique l&apos;acceptation sans réserve
        des présentes CGU. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser la
        Plateforme.
      </p>

      {/* 2. Définitions */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">2. Définitions</h2>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2">
        <li>
          <strong>Plateforme</strong> : le service en ligne Jestly accessible via le site jestly.fr
          et ses sous-domaines.
        </li>
        <li>
          <strong>Utilisateur</strong> : toute personne physique ou morale ayant créé un compte sur
          la Plateforme.
        </li>
        <li>
          <strong>Contenu</strong> : l&apos;ensemble des informations, textes, images, données et
          fichiers publiés par l&apos;Utilisateur via la Plateforme.
        </li>
        <li>
          <strong>Abonnement</strong> : la formule tarifaire choisie par l&apos;Utilisateur (Free ou
          Pro).
        </li>
        <li>
          <strong>Services</strong> : l&apos;ensemble des fonctionnalités proposées par la
          Plateforme (site web, CRM, commandes, facturation, analytics, etc.).
        </li>
      </ul>

      {/* 3. Accès au service */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">3. Accès au service</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        La Plateforme est accessible 24 heures sur 24, 7 jours sur 7, sous réserve des opérations
        de maintenance nécessaires au bon fonctionnement du service. Jestly met en œuvre tous les
        moyens raisonnables pour assurer un accès continu, mais ne saurait être tenu responsable en
        cas d&apos;interruption, qu&apos;elle soit temporaire ou prolongée.
      </p>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        L&apos;accès à la Plateforme nécessite une connexion internet à la charge de
        l&apos;Utilisateur. Jestly se réserve le droit de modifier, suspendre ou interrompre tout ou
        partie du service, à tout moment, avec ou sans préavis.
      </p>

      {/* 4. Inscription et compte */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        4. Inscription et compte
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Pour utiliser la Plateforme, l&apos;Utilisateur doit créer un compte en fournissant des
        informations exactes et à jour (adresse e-mail, nom, etc.). L&apos;Utilisateur est
        responsable de la confidentialité de ses identifiants et de toutes les activités réalisées
        depuis son compte.
      </p>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        En cas d&apos;utilisation non autorisée de son compte, l&apos;Utilisateur doit en informer
        Jestly immédiatement à l&apos;adresse{" "}
        <a href="mailto:jestlyapp@gmail.com" className="text-[#4F46E5] hover:underline">
          jestlyapp@gmail.com
        </a>
        . Jestly ne saurait être tenu responsable de toute perte ou dommage résultant du
        non-respect de cette obligation.
      </p>

      {/* 5. Abonnements et tarification */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        5. Abonnements et tarification
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        La Plateforme propose deux formules d&apos;abonnement :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>
          <strong>Free</strong> : accès gratuit avec une limite de 10 commandes par mois et
          l&apos;ensemble des fonctionnalités de base.
        </li>
        <li>
          <strong>Pro</strong> : abonnement à 7 €/mois offrant un accès illimité à toutes les
          fonctionnalités de la Plateforme (commandes illimitées, analytics avancés, support
          prioritaire).
        </li>
      </ul>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        L&apos;abonnement Pro est facturé mensuellement. Le paiement est effectué via notre
        prestataire de paiement sécurisé (Stripe). L&apos;Utilisateur peut résilier son abonnement
        à tout moment ; la résiliation prend effet à la fin de la période de facturation en cours.
      </p>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        Jestly se réserve le droit de modifier ses tarifs. Toute modification tarifaire sera
        communiquée à l&apos;Utilisateur au moins 30 jours avant son entrée en vigueur.
      </p>

      {/* 6. Obligations de l'utilisateur */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        6. Obligations de l&apos;Utilisateur
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">L&apos;Utilisateur s&apos;engage à :</p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>Utiliser la Plateforme conformément à sa destination et aux présentes CGU.</li>
        <li>
          Ne pas publier de contenu illicite, diffamatoire, injurieux, discriminatoire ou portant
          atteinte aux droits de tiers.
        </li>
        <li>
          Ne pas tenter de compromettre la sécurité, l&apos;intégrité ou la disponibilité de la
          Plateforme.
        </li>
        <li>
          Fournir des informations exactes et maintenir son profil à jour.
        </li>
        <li>
          Respecter les droits de propriété intellectuelle de Jestly et des tiers.
        </li>
      </ul>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        Tout manquement à ces obligations pourra entraîner la suspension ou la suppression du
        compte, sans préjudice des éventuelles poursuites.
      </p>

      {/* 7. Propriété intellectuelle */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        7. Propriété intellectuelle
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        L&apos;ensemble des éléments constituant la Plateforme (marque, logo, interface, textes,
        code source, design, etc.) sont protégés par le droit de la propriété intellectuelle et
        restent la propriété exclusive de Jestly. Toute reproduction, modification ou utilisation non
        autorisée est strictement interdite.
      </p>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        L&apos;Utilisateur conserve la propriété intellectuelle des contenus qu&apos;il publie via
        la Plateforme. En publiant du contenu, il accorde à Jestly une licence limitée, non
        exclusive et révocable, strictement nécessaire au fonctionnement du service (affichage,
        hébergement, diffusion sur le site public de l&apos;Utilisateur).
      </p>

      {/* 8. Données personnelles */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">8. Données personnelles</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Jestly collecte et traite des données personnelles dans le cadre de l&apos;utilisation de la
        Plateforme. Le détail des traitements, des finalités, des droits des utilisateurs et des
        mesures de protection est décrit dans notre{" "}
        <Link href="/legal/confidentialite" className="text-[#4F46E5] hover:underline">
          Politique de Confidentialité
        </Link>
        , qui fait partie intégrante des présentes CGU.
      </p>

      {/* 9. Responsabilité et garanties */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        9. Responsabilité et garanties
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        La Plateforme est fournie « en l&apos;état ». Jestly ne garantit pas que le service sera
        exempt de bugs, d&apos;erreurs ou d&apos;interruptions. Jestly met en œuvre tous les moyens
        raisonnables pour assurer la fiabilité et la sécurité du service, mais ne saurait être tenu
        responsable :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>Des dommages indirects résultant de l&apos;utilisation de la Plateforme.</li>
        <li>De la perte de données imputable à l&apos;Utilisateur.</li>
        <li>
          Des contenus publiés par les Utilisateurs ou de l&apos;utilisation faite par des tiers.
        </li>
        <li>
          Des interruptions de service dues à des cas de force majeure ou à des maintenances
          planifiées.
        </li>
      </ul>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        En tout état de cause, la responsabilité de Jestly est limitée au montant des sommes versées
        par l&apos;Utilisateur au cours des 12 derniers mois.
      </p>

      {/* 10. Résiliation */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">10. Résiliation</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        L&apos;Utilisateur peut résilier son compte à tout moment depuis les paramètres de son
        espace personnel ou en contactant Jestly par e-mail. La résiliation entraîne la suppression
        du compte et des données associées dans un délai raisonnable, sous réserve des obligations
        légales de conservation.
      </p>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        Jestly se réserve le droit de suspendre ou supprimer un compte en cas de violation des
        présentes CGU, après notification à l&apos;Utilisateur sauf en cas d&apos;urgence ou de
        violation grave.
      </p>

      {/* 11. Modification des CGU */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        11. Modification des CGU
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Jestly se réserve le droit de modifier les présentes CGU à tout moment. Les Utilisateurs
        seront informés de toute modification substantielle par e-mail ou par notification dans
        l&apos;interface de la Plateforme, au moins 15 jours avant l&apos;entrée en vigueur des
        nouvelles conditions.
      </p>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        La poursuite de l&apos;utilisation de la Plateforme après cette date vaut acceptation des
        nouvelles CGU.
      </p>

      {/* 12. Droit applicable et juridiction */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        12. Droit applicable et juridiction
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Les présentes CGU sont régies par le droit français. En cas de litige, les parties
        s&apos;engagent à rechercher une solution amiable avant toute action judiciaire. À défaut
        d&apos;accord amiable, les tribunaux compétents seront ceux du ressort du siège social de
        Jestly.
      </p>

      {/* 13. Contact */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">13. Contact</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Pour toute question relative aux présentes CGU, vous pouvez contacter Jestly à l&apos;adresse
        suivante :{" "}
        <a href="mailto:jestlyapp@gmail.com" className="text-[#4F46E5] hover:underline">
          jestlyapp@gmail.com
        </a>
      </p>

      {/* Dernière mise à jour */}
      <div className="mt-16 pt-8 border-t border-[#E6E6E4]">
        <p className="text-sm text-[#8A8A88]">Dernière mise à jour : 19 mars 2026</p>
      </div>
    </div>
  );
}
