import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jestly pour créateurs de contenu",
  description:
    "Monteurs, photographes, vidéastes : arrêtez de jongler entre 10 outils. Portfolio, clients, projets, factures et paiements — un seul système.",
  openGraph: {
    title: "Jestly pour créateurs de contenu",
    description:
      "Le cockpit qui centralise tout votre business créatif.",
    url: "https://jestly.fr/pour-qui/createurs",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
