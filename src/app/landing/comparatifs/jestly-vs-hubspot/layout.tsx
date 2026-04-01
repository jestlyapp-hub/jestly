import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jestly vs HubSpot — Comparatif",
  description:
    "Un CRM pensé freelance, pas un outil enterprise complexe et cher.",
  openGraph: {
    title: "Jestly vs HubSpot — Comparatif",
    description:
      "Un CRM pensé freelance, pas un outil enterprise complexe et cher.",
    siteName: "Jestly",
  },
};

export default function JestlyVsHubspotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
