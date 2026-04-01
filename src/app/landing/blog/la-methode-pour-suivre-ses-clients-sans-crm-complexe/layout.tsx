import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La méthode pour suivre ses clients sans CRM complexe — Blog Jestly",
  description:
    "Pas besoin d'un CRM enterprise. Découvrez comment suivre vos clients simplement et efficacement en freelance.",
  openGraph: {
    title: "La méthode pour suivre ses clients sans CRM complexe — Blog Jestly",
    description:
      "Pas besoin d'un CRM enterprise. Découvrez comment suivre vos clients simplement et efficacement en freelance.",
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
