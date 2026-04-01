import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Centre d'aide — Jestly",
  description:
    "Guides de démarrage, articles d'aide et FAQ pour bien utiliser Jestly.",
  openGraph: {
    title: "Centre d'aide — Jestly",
    description:
      "Guides de démarrage, articles d'aide et FAQ pour bien utiliser Jestly.",
    siteName: "Jestly",
  },
};

export default function CentreAideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
