import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion de commandes freelance | Jestly",
  description:
    "Transformez chaque demande client en commande structurée avec brief, statut, livrables et suivi. Plus de briefs perdus dans les messages.",
  openGraph: {
    title: "Gestion de commandes freelance | Jestly",
    description:
      "Gérez vos commandes et briefs dans un seul flux clair, pensé pour les freelances.",
    url: "https://jestly.fr/landing/commandes",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
