import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logiciel de facturation freelance simple et complet | Jestly",
  description:
    "Logiciel de facturation freelance tout-en-un : créez devis et factures, automatisez vos relances, suivez vos paiements. Conforme, gratuit en bêta. Essayez Jestly.",
  alternates: { canonical: "https://jestly.fr/fonctionnalites/facturation" },
  openGraph: {
    title: "Logiciel de facturation freelance simple et complet | Jestly",
    description:
      "Créez devis et factures en quelques secondes, automatisez vos relances clients et suivez vos paiements. Le meilleur outil de facturation freelance.",
    url: "https://jestly.fr/fonctionnalites/facturation",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
