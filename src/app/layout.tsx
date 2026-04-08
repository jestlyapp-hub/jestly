import type { Metadata } from "next";
import "./globals.css";
import { DEFAULT_OG, SITE_NAME, SITE_URL } from "@/lib/seo/build-metadata";

export const metadata: Metadata = {
  title: "Jestly — Le cockpit du freelance moderne",
  description:
    "Plateforme tout-en-un pour vendre, gérer et scaler votre activité freelance. Commandes, facturation, CRM, site vitrine, agenda.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Jestly — Le cockpit du freelance moderne",
    description:
      "Commandes, facturation, CRM, site vitrine, agenda et analytics. Un seul outil remplace vos 10 abonnements.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "fr_FR",
    type: "website",
    images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: "Jestly — Cockpit freelance" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jestly — Le cockpit du freelance moderne",
    description:
      "Commandes, facturation, CRM, site vitrine, agenda et analytics. Un seul outil remplace vos 10 abonnements.",
    images: [DEFAULT_OG],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head suppressHydrationWarning />
      <body className="antialiased" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#7C3AED] focus:text-white focus:shadow-lg focus:font-semibold"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
