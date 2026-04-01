import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fonctionnalités — Jestly",
  description:
    "Découvrez tous les modules Jestly : commandes, CRM, facturation, calendrier, tâches, analytics, site vitrine et portfolio.",
  openGraph: {
    title: "Fonctionnalités — Jestly",
    description:
      "Découvrez tous les modules Jestly : commandes, CRM, facturation, calendrier, tâches, analytics, site vitrine et portfolio.",
    siteName: "Jestly",
  },
};

export default function FonctionnalitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
