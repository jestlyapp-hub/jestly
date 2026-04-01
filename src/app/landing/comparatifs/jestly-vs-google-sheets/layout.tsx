import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jestly vs Google Sheets — Comparatif",
  description:
    "Arrêtez de gérer votre business dans un tableur. Jestly est fait pour ça.",
  openGraph: {
    title: "Jestly vs Google Sheets — Comparatif",
    description:
      "Arrêtez de gérer votre business dans un tableur. Jestly est fait pour ça.",
    siteName: "Jestly",
  },
};

export default function JestlyVsGoogleSheetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
