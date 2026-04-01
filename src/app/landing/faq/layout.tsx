import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Jestly",
  description:
    "Toutes les réponses à vos questions sur Jestly : abonnements, fonctionnalités, sécurité et données.",
  openGraph: {
    title: "FAQ — Jestly",
    description:
      "Toutes les réponses à vos questions sur Jestly : abonnements, fonctionnalités, sécurité et données.",
    siteName: "Jestly",
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
