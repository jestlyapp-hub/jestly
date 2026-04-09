import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion de commandes et suivi de projets freelance | Jestly",
  description:
    "Organisez votre activité freelance : transformez chaque demande en commande structurée avec brief, statut, deadlines et suivi. Fini le chaos des messages.",
  alternates: { canonical: "https://jestly.fr/fonctionnalites/commandes" },
  openGraph: {
    title: "Gestion de commandes et suivi de projets freelance | Jestly",
    description:
      "Gérez vos commandes et briefs dans un seul flux clair, pensé pour les freelances.",
    url: "https://jestly.fr/fonctionnalites/commandes",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
