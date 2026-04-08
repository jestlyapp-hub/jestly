import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import { buildMetadata } from "@/lib/seo/build-metadata";

export const metadata = buildMetadata({
  title: "Tarifs Jestly — Bêta 100 % gratuite, sans carte bancaire",
  description:
    "Pendant la bêta, toutes les fonctionnalités Jestly sont gratuites et sans limite : site, CRM, facturation, agenda, commandes, paiements. Aucune carte bancaire requise.",
  path: "/tarifs",
});

export default function TarifsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingHeader />
      {children}
      <LandingFooter />
    </>
  );
}
