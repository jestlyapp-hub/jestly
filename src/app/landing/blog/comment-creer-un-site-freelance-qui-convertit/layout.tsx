import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comment créer un site freelance qui convertit — Blog Jestly",
  description:
    "Votre site est votre vitrine. Découvrez comment le structurer pour rassurer, clarifier et convertir vos prospects.",
  openGraph: {
    title: "Comment créer un site freelance qui convertit — Blog Jestly",
    description:
      "Votre site est votre vitrine. Découvrez comment le structurer pour rassurer, clarifier et convertir vos prospects.",
    siteName: "Jestly",
  },
};

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
