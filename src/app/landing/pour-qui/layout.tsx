import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pour qui ? — Jestly",
  description:
    "Jestly est conçu pour les freelances créatifs : vidéastes, graphistes, motion designers, photographes et plus encore.",
  openGraph: {
    title: "Pour qui ? — Jestly",
    description:
      "Jestly est conçu pour les freelances créatifs : vidéastes, graphistes, motion designers, photographes et plus encore.",
    siteName: "Jestly",
  },
};

export default function PourQuiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
