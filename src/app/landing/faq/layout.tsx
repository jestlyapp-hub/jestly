import { buildMetadata } from "@/lib/seo/build-metadata";
import JsonLd from "@/components/seo/JsonLd";
import { FAQ_QUESTIONS_FLAT } from "./faq-data";

export const metadata = buildMetadata({
  title: "FAQ Jestly — Questions fréquentes sur le cockpit freelance",
  description:
    "Toutes les réponses sur Jestly : tarifs, bêta gratuite, sécurité, RGPD, fonctionnalités, support, démarrage et alternatives à Notion / Trello.",
  path: "/faq",
});

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_QUESTIONS_FLAT.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
  return (
    <>
      <JsonLd data={data} />
      {children}
    </>
  );
}
