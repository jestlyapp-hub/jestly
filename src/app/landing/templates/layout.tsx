import { buildMetadata } from "@/lib/seo/build-metadata";

export const metadata = buildMetadata({
  title: "Templates freelance — Devis, factures, briefs, propositions | Jestly",
  description:
    "Bibliothèque de templates pour freelances créatifs : devis, factures, briefs clients, propositions commerciales et pages de commande. Prêts à l'emploi dans Jestly.",
  path: "/templates",
});

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
