import { buildMetadata } from "@/lib/seo/build-metadata";

export const metadata = buildMetadata({
  title: "Jestly pour les designers — Brief, devis, facturation, portfolio",
  description:
    "Le cockpit pensé pour les designers freelances : briefs clients structurés, devis, facturation, portfolio en ligne et CRM léger. Tout en un.",
  path: "/pour-qui/designers",
});

export default function DesignersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
