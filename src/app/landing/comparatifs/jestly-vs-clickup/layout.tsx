import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jestly vs ClickUp — Comparatif",
  description:
    "Pourquoi Jestly est plus adapté qu'ClickUp pour un freelance solo.",
  openGraph: {
    title: "Jestly vs ClickUp — Comparatif",
    description:
      "Pourquoi Jestly est plus adapté qu'ClickUp pour un freelance solo.",
    siteName: "Jestly",
  },
};

export default function JestlyVsClickupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
