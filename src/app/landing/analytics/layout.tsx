import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord freelance — Suivi activité et revenus | Jestly",
  description:
    "Pilotez votre activité freelance avec un tableau de bord clair : revenus, commandes, clients actifs, tendances. Décidez avec des données, pas au feeling.",
  alternates: { canonical: "https://jestly.fr/fonctionnalites/analytics" },
  openGraph: {
    title: "Tableau de bord freelance — Suivi activité et revenus | Jestly",
    description:
      "Des chiffres qui éclairent vos décisions — revenus, activité, tendances.",
    url: "https://jestly.fr/fonctionnalites/analytics",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
