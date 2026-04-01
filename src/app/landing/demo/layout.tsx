import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Démo — Jestly",
  description:
    "Découvrez Jestly en action : un tour guidé des fonctionnalités principales.",
  openGraph: {
    title: "Démo — Jestly",
    description:
      "Découvrez Jestly en action : un tour guidé des fonctionnalités principales.",
    siteName: "Jestly",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
