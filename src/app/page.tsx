import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingPage from "./landing/page";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_URL, DEFAULT_OG } from "@/lib/seo/build-metadata";

const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-color.png`,
  sameAs: ["https://discord.gg/hnfkDJQKUU"],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@jestly.fr",
      areaServed: "FR",
      availableLanguage: ["French"],
    },
  ],
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "fr-FR",
  publisher: { "@type": "Organization", name: SITE_NAME },
};

const SOFTWARE_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Cockpit tout-en-un pour freelances créatifs : site vitrine, CRM, agenda, facturation, commandes, analytics, portfolio, paiements et briefs.",
  url: SITE_URL,
  image: DEFAULT_OG,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "Bêta gratuite, sans carte bancaire",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={[ORGANIZATION_LD, WEBSITE_LD, SOFTWARE_LD]} />
      <LandingHeader />
      <LandingPage />
      <LandingFooter />
    </>
  );
}
