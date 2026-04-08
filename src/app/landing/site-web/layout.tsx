import { buildMetadata } from "@/lib/seo/build-metadata";

export const metadata = buildMetadata({
  title: "Site vitrine pour freelance — Créez votre site en 2 min | Jestly",
  description:
    "Le site vitrine intégré de Jestly : portfolio, formulaire de contact, prise de commandes et paiements en ligne. Sans code, sans abonnement séparé.",
  path: "/fonctionnalites/site-vitrine",
});

export default function SiteWebLayout({ children }: { children: React.ReactNode }) {
  return children;
}
