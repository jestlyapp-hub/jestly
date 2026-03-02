import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jestly — Le cockpit du freelance moderne",
  description:
    "La plateforme tout-en-un pour freelances creatifs. Site web, commandes, clients, factures, agenda — tout centralise.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
