import { buildMetadata } from "@/lib/seo/build-metadata";

export const metadata = buildMetadata({
  title: "Connexion — Jestly",
  description:
    "Connectez-vous à votre cockpit Jestly : commandes, facturation, CRM, site, agenda et analytics réunis dans un seul outil.",
  path: "/login",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
