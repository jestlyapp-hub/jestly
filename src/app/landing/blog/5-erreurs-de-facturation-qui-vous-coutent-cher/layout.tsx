import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "5 erreurs de facturation qui vous coûtent cher — Blog Jestly",
  description:
    "Devis oubliés, relances absentes, paiements non suivis. Évitez ces erreurs courantes pour mieux gérer votre facturation freelance.",
  openGraph: {
    title: "5 erreurs de facturation qui vous coûtent cher — Blog Jestly",
    description:
      "Devis oubliés, relances absentes, paiements non suivis. Évitez ces erreurs courantes pour mieux gérer votre facturation freelance.",
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
