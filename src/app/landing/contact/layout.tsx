import { buildMetadata } from "@/lib/seo/build-metadata";

export const metadata = buildMetadata({
  title: "Contacter Jestly — Support & questions sur le cockpit freelance",
  description:
    "Une question sur Jestly ? Contactez l'équipe par formulaire, email (support@jestly.fr) ou Discord. Réponse sous 24 h ouvrées.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
