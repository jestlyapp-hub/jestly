import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jestly pour consultants",
  description:
    "Consultants, coachs, formateurs : structurez votre activité avec un système qui professionnalise chaque interaction client.",
  openGraph: {
    title: "Jestly pour consultants",
    description:
      "Gérez vos missions comme un vrai business avec Jestly.",
    url: "https://jestly.fr/landing/pour-qui/consultants",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
