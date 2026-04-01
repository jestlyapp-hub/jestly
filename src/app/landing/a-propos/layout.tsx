import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos — Jestly",
  description:
    "La mission de Jestly : centraliser le business des freelances créatifs dans un seul outil premium.",
  openGraph: {
    title: "À propos — Jestly",
    description:
      "La mission de Jestly : centraliser le business des freelances créatifs dans un seul outil premium.",
    siteName: "Jestly",
  },
};

export default function AProposLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
