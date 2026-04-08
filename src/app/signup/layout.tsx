import { buildMetadata } from "@/lib/seo/build-metadata";

export const metadata = buildMetadata({
  title: "Créer un compte gratuit — Jestly",
  description:
    "Inscrivez-vous gratuitement à Jestly. Bêta sans carte bancaire : commandes, facturation, CRM, site et agenda en moins de 2 minutes.",
  path: "/signup",
  noIndex: true,
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
