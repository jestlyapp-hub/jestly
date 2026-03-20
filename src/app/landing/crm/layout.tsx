import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM pour freelances | Jestly",
  description:
    "Centralisez vos prospects et clients dans un CRM pensé pour les freelances. Fini les contacts éparpillés entre DMs, mails et tableurs.",
  openGraph: {
    title: "CRM pour freelances | Jestly",
    description:
      "Centralisez vos prospects et clients dans un CRM pensé pour les freelances.",
    url: "https://jestly.fr/landing/crm",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
