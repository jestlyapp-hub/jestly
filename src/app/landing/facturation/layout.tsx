import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facturation freelance simplifiée | Jestly",
  description:
    "Créez, envoyez et suivez vos devis et factures depuis le même espace que vos clients et commandes. Plus de jonglage entre cinq outils.",
  openGraph: {
    title: "Facturation freelance simplifiée | Jestly",
    description:
      "Pilotez devis, factures et relances sans vous éparpiller.",
    url: "https://jestly.fr/fonctionnalites/facturation",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
