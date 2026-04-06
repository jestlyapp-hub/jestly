import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiements freelance | Jestly",
  description:
    "Suivez chaque paiement reçu, en attente ou en retard — directement relié à vos factures et clients. Plus de flou sur qui a payé quoi.",
  openGraph: {
    title: "Paiements freelance | Jestly",
    description:
      "Des paiements suivis avec sérénité, reliés à vos factures et clients.",
    url: "https://jestly.fr/fonctionnalites/paiements",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
