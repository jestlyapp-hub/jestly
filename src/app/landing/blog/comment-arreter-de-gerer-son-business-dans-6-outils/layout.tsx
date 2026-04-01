import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comment arrêter de gérer son business dans 6 outils — Blog Jestly",
  description:
    "Notion, Trello, Google Sheets, Agenda... Découvrez comment centraliser votre activité freelance et gagner en clarté.",
  openGraph: {
    title: "Comment arrêter de gérer son business dans 6 outils — Blog Jestly",
    description:
      "Notion, Trello, Google Sheets, Agenda... Découvrez comment centraliser votre activité freelance et gagner en clarté.",
    siteName: "Jestly",
  },
};

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
