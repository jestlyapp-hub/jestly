import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jestly — Le cockpit du freelance moderne",
  description:
    "Plateforme tout-en-un pour vendre, gerer et scaler votre activite freelance.",
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
