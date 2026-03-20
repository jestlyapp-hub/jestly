import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jestly pour développeurs freelance",
  description:
    "Devs freelance et indie hackers : gérez clients, projets et revenus sans quitter votre zone de productivité. Zéro config, 100% opérationnel.",
  openGraph: {
    title: "Jestly pour développeurs freelance",
    description:
      "Le système de gestion que vous auriez codé vous-même.",
    url: "https://jestly.fr/landing/pour-qui/developpeurs",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
