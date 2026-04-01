import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jestly vs Notion — Comparatif",
  description:
    "Pourquoi Jestly est une meilleure alternative à Notion pour les freelances créatifs.",
  openGraph: {
    title: "Jestly vs Notion — Comparatif",
    description:
      "Pourquoi Jestly est une meilleure alternative à Notion pour les freelances créatifs.",
    siteName: "Jestly",
  },
};

export default function JestlyVsNotionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
