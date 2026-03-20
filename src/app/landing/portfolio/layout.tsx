import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio professionnel freelance | Jestly",
  description:
    "Présentez vos meilleurs projets avec une mise en scène premium. Votre portfolio vit dans votre site Jestly et impressionne vos prospects.",
  openGraph: {
    title: "Portfolio professionnel freelance | Jestly",
    description:
      "Un portfolio qui fait le travail pour vous — intégré à votre site Jestly.",
    url: "https://jestly.fr/landing/portfolio",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
