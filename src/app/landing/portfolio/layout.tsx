import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un portfolio freelance professionnel en ligne | Jestly",
  description:
    "Créez un portfolio freelance professionnel intégré à votre site vitrine. Présentez vos projets, attirez des clients et convertissez vos visiteurs. Sans code.",
  alternates: { canonical: "https://jestly.fr/fonctionnalites/portfolio" },
  openGraph: {
    title: "Créer un portfolio freelance professionnel en ligne | Jestly",
    description:
      "Un portfolio qui fait le travail pour vous — intégré à votre site Jestly.",
    url: "https://jestly.fr/fonctionnalites/portfolio",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
