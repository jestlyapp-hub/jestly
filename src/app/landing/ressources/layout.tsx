import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ressources — Jestly",
  description:
    "Blog, templates, centre d'aide, comparatifs et roadmap pour tirer le maximum de Jestly.",
  openGraph: {
    title: "Ressources — Jestly",
    description:
      "Blog, templates, centre d'aide, comparatifs et roadmap pour tirer le maximum de Jestly.",
    siteName: "Jestly",
  },
};

export default function RessourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
