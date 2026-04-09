import { buildMetadata } from "@/lib/seo/build-metadata";

export const metadata = buildMetadata({
  title: "Créer un portfolio freelance et site vitrine en 2 min | Jestly",
  description:
    "Créez votre portfolio freelance et site vitrine professionnel en quelques minutes. Portfolio, formulaire de contact, prise de commandes et paiements intégrés. Sans code.",
  path: "/fonctionnalites/site-vitrine",
});

export default function SiteWebLayout({ children }: { children: React.ReactNode }) {
  return children;
}
