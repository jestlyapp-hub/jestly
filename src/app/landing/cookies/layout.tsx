import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de cookies — Jestly",
  description:
    "Informations sur les cookies utilisés par Jestly et comment les gérer.",
  openGraph: {
    title: "Politique de cookies — Jestly",
    description:
      "Informations sur les cookies utilisés par Jestly et comment les gérer.",
    siteName: "Jestly",
  },
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
