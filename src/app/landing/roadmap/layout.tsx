import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap — Jestly",
  description:
    "Découvrez ce que Jestly construit : fonctionnalités en cours, à venir et planifiées.",
  openGraph: {
    title: "Roadmap — Jestly",
    description:
      "Découvrez ce que Jestly construit : fonctionnalités en cours, à venir et planifiées.",
    siteName: "Jestly",
  },
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
