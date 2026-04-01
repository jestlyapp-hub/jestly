import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Le guide complet du brief client réussi — Blog Jestly",
  description:
    "Un bon brief évite 80 % des problèmes. Découvrez comment structurer, poser les bonnes questions et exploiter les réponses.",
  openGraph: {
    title: "Le guide complet du brief client réussi — Blog Jestly",
    description:
      "Un bon brief évite 80 % des problèmes. Découvrez comment structurer, poser les bonnes questions et exploiter les réponses.",
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
