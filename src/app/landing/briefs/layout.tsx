import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brief client freelance — Questionnaire et onboarding | Jestly",
  description:
    "Créez des briefs clients structurés et recevez toutes les informations nécessaires avant de commencer. Questionnaire intégré, onboarding client automatisé.",
  alternates: { canonical: "https://jestly.fr/fonctionnalites/briefs" },
  openGraph: {
    title: "Brief client freelance — Questionnaire et onboarding | Jestly",
    description:
      "Fini les allers-retours par email. Le client remplit le brief, vous avez toutes les infos pour travailler.",
    url: "https://jestly.fr/fonctionnalites/briefs",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
