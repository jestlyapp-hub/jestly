import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions Légales — Jestly",
  description: "Mentions légales du site jestly.fr.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href="/landing"
        className="text-sm text-[#4F46E5] hover:text-[#4338CA] transition-colors mb-8 inline-block"
      >
        &larr; Retour à l&apos;accueil
      </Link>

      <h1 className="text-3xl font-bold text-[#191919] mb-8">Mentions Légales</h1>

      {/* 1. Éditeur du site */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">1. Éditeur du site</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Le site <strong>jestly.fr</strong> est édité par :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>
          <strong>Nom</strong> : Jestly
        </li>
        <li>
          <strong>Forme</strong> : Service en ligne (SaaS)
        </li>
        <li>
          <strong>Adresse e-mail</strong> :{" "}
          <a href="mailto:jestlyapp@gmail.com" className="text-[#4F46E5] hover:underline">
            jestlyapp@gmail.com
          </a>
        </li>
        <li>
          <strong>Site web</strong> :{" "}
          <a href="https://jestly.fr" className="text-[#4F46E5] hover:underline">
            jestly.fr
          </a>
        </li>
        <li>
          <strong>Directeur de la publication</strong> : le représentant légal de Jestly
        </li>
      </ul>

      {/* 2. Hébergeur */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">2. Hébergeur</h2>
      <p className="text-[#5A5A58] leading-relaxed">Le site est hébergé par :</p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>
          <strong>Vercel Inc.</strong>
        </li>
        <li>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
        <li>
          Site web :{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4F46E5] hover:underline"
          >
            vercel.com
          </a>
        </li>
      </ul>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        La base de données est hébergée par{" "}
        <strong>Supabase</strong> (serveurs en Union européenne).
      </p>

      {/* 3. Contact */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">3. Contact</h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Pour toute question ou réclamation concernant le site, vous pouvez nous contacter :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>
          Par e-mail :{" "}
          <a href="mailto:jestlyapp@gmail.com" className="text-[#4F46E5] hover:underline">
            jestlyapp@gmail.com
          </a>
        </li>
        <li>Via le formulaire de contact disponible sur le site</li>
      </ul>

      {/* 4. Propriété intellectuelle */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        4. Propriété intellectuelle
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        L&apos;ensemble du contenu du site jestly.fr (textes, images, graphismes, logo, icônes,
        code source, interface, design) est protégé par les lois françaises et internationales
        relatives à la propriété intellectuelle.
      </p>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        Toute reproduction, représentation, modification, publication, adaptation ou exploitation
        de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est
        interdite sans l&apos;autorisation écrite préalable de Jestly.
      </p>
      <p className="text-[#5A5A58] leading-relaxed mt-3">
        La marque « Jestly », le logo et l&apos;ensemble des signes distinctifs associés sont la
        propriété exclusive de Jestly. Toute utilisation non autorisée constitue une contrefaçon
        sanctionnée par le Code de la propriété intellectuelle.
      </p>

      {/* 5. Crédits */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">5. Crédits</h2>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2">
        <li>
          <strong>Conception et développement</strong> : Jestly
        </li>
        <li>
          <strong>Hébergement</strong> : Vercel Inc.
        </li>
        <li>
          <strong>Police de caractères</strong> : Inter (Google Fonts), distribuée sous licence
          SIL Open Font License
        </li>
        <li>
          <strong>Icônes</strong> : Lucide Icons, distribuées sous licence ISC
        </li>
      </ul>

      {/* Liens vers les autres pages légales */}
      <h2 className="text-xl font-semibold text-[#191919] mt-10 mb-4">
        6. Informations complémentaires
      </h2>
      <p className="text-[#5A5A58] leading-relaxed">
        Pour en savoir plus sur nos conditions et notre gestion des données :
      </p>
      <ul className="list-disc pl-6 text-[#5A5A58] leading-relaxed space-y-2 mt-3">
        <li>
          <Link href="/legal/cgu" className="text-[#4F46E5] hover:underline">
            Conditions Générales d&apos;Utilisation
          </Link>
        </li>
        <li>
          <Link href="/legal/confidentialite" className="text-[#4F46E5] hover:underline">
            Politique de Confidentialité
          </Link>
        </li>
      </ul>

      {/* Dernière mise à jour */}
      <div className="mt-16 pt-8 border-t border-[#E6E6E4]">
        <p className="text-sm text-[#8A8A88]">Dernière mise à jour : 19 mars 2026</p>
      </div>
    </div>
  );
}
