import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agenda freelance intégré | Jestly",
  description:
    "Planifiez rendez-vous et deadlines avec clarté. Un calendrier pensé pour les freelances, relié à vos commandes et clients.",
  openGraph: {
    title: "Agenda freelance intégré | Jestly",
    description:
      "Vos rendez-vous, deadlines et tâches dans une vue unique.",
    url: "https://jestly.fr/landing/agenda",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
