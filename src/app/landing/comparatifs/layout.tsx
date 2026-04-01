import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comparatifs — Jestly",
  description:
    "Comparez Jestly avec Notion, Trello, ClickUp, Google Sheets et d'autres outils.",
  openGraph: {
    title: "Comparatifs — Jestly",
    description:
      "Comparez Jestly avec Notion, Trello, ClickUp, Google Sheets et d'autres outils.",
    siteName: "Jestly",
  },
};

export default function ComparatifsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
