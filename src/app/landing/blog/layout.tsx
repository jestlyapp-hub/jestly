import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Jestly",
  description:
    "Conseils, guides et bonnes pratiques pour les freelances créatifs qui veulent développer leur activité.",
  openGraph: {
    title: "Blog — Jestly",
    description:
      "Conseils, guides et bonnes pratiques pour les freelances créatifs qui veulent développer leur activité.",
    siteName: "Jestly",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
