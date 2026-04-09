import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suivi des paiements freelance — Encaissements et relances | Jestly",
  description:
    "Suivez chaque paiement freelance en temps réel : reçu, en attente, en retard. Relié à vos factures et clients. Plus de flou sur qui a payé quoi.",
  alternates: { canonical: "https://jestly.fr/fonctionnalites/paiements" },
  openGraph: {
    title: "Suivi des paiements freelance — Encaissements et relances | Jestly",
    description:
      "Des paiements suivis avec sérénité, reliés à vos factures et clients.",
    url: "https://jestly.fr/fonctionnalites/paiements",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
