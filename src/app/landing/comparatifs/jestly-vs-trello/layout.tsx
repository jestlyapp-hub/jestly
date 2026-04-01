import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jestly vs Trello — Comparatif",
  description:
    "Pourquoi Jestly est une meilleure alternative à Trello pour gérer un business freelance.",
  openGraph: {
    title: "Jestly vs Trello — Comparatif",
    description:
      "Pourquoi Jestly est une meilleure alternative à Trello pour gérer un business freelance.",
    siteName: "Jestly",
  },
};

export default function JestlyVsTrelloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
