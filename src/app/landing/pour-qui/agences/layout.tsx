import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jestly pour agences créatives",
  description:
    "Multi-clients, multi-projets, multi-factures. Structurez toute votre activité dans un cockpit unifié qui grandit avec vous.",
  openGraph: {
    title: "Jestly pour agences créatives",
    description:
      "Le système qui scale avec votre agence.",
    url: "https://jestly.fr/pour-qui/agences",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
