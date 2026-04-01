import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gagner 3 heures par semaine en automatisant sa gestion — Blog Jestly",
  description:
    "Micro-frictions, tâches manuelles, oublis. Découvrez 5 automatisations simples pour gagner du temps chaque semaine.",
  openGraph: {
    title: "Gagner 3 heures par semaine en automatisant sa gestion — Blog Jestly",
    description:
      "Micro-frictions, tâches manuelles, oublis. Découvrez 5 automatisations simples pour gagner du temps chaque semaine.",
    siteName: "Jestly",
  },
};

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
