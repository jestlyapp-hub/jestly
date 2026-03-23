import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jestly — Le cockpit du freelance moderne",
  description:
    "Plateforme tout-en-un pour vendre, gérer et scaler votre activité freelance. Commandes, facturation, CRM, site vitrine, agenda.",
  metadataBase: new URL("https://jestly.fr"),
  openGraph: {
    title: "Jestly — Le cockpit du freelance moderne",
    description:
      "Commandes, facturation, CRM, site vitrine, agenda et analytics. Un seul outil remplace vos 10 abonnements.",
    url: "https://jestly.fr",
    siteName: "Jestly",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jestly — Le cockpit du freelance moderne",
    description:
      "Commandes, facturation, CRM, site vitrine, agenda et analytics. Un seul outil remplace vos 10 abonnements.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head suppressHydrationWarning />
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
