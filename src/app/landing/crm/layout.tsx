import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM pour freelance simple et efficace | Jestly",
  description:
    "Le CRM pour freelance qui centralise vos prospects, clients et historique en un seul endroit. Fini les contacts éparpillés. Gratuit en bêta.",
  alternates: { canonical: "https://jestly.fr/fonctionnalites/crm" },
  openGraph: {
    title: "CRM pour freelance simple et efficace | Jestly",
    description:
      "Centralisez prospects et clients dans un CRM pensé pour les freelances. Suivi, relances, historique — tout est connecté.",
    url: "https://jestly.fr/fonctionnalites/crm",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
