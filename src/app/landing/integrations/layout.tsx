import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intégrations — Jestly",
  description:
    "Tous les modules Jestly sont connectés nativement. Pas de plugins, pas de bricolage.",
  openGraph: {
    title: "Intégrations — Jestly",
    description:
      "Tous les modules Jestly sont connectés nativement. Pas de plugins, pas de bricolage.",
    siteName: "Jestly",
  },
};

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
