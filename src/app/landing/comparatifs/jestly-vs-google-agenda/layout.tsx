import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jestly vs Google Agenda — Comparatif",
  description:
    "Un calendrier connecté à vos commandes et clients, pas juste un agenda isolé.",
  openGraph: {
    title: "Jestly vs Google Agenda — Comparatif",
    description:
      "Un calendrier connecté à vos commandes et clients, pas juste un agenda isolé.",
    siteName: "Jestly",
  },
};

export default function JestlyVsGoogleAgendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
