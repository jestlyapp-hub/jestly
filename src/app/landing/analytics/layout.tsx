import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics business freelance | Jestly",
  description:
    "Suivez vos performances et revenus en temps réel. Tableaux de bord lisibles pour décider avec clarté.",
  openGraph: {
    title: "Analytics business freelance | Jestly",
    description:
      "Des chiffres qui éclairent vos décisions — revenus, activité, tendances.",
    url: "https://jestly.fr/landing/analytics",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
