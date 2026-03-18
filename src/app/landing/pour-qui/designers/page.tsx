"use client";

import PersonaPageLayout from "@/components/landing/PersonaPageLayout";
import type { PersonaPageData } from "@/components/landing/PersonaPageLayout";

const DATA: PersonaPageData = {
  persona: "designers",
  accentColor: "#A855F7",
  accentBg: "#FAF5FF",

  badge: "Conçu pour les designers",
  title: "Un espace de travail",
  titleGradient: "aussi beau que vos créations.",
  subtitle: "UI/UX, branding, graphisme : un système qui respecte votre sensibilité visuelle tout en structurant votre business de freelance.",
  heroMetrics: [
    { value: "4h", label: "gagnées / semaine" },
    { value: "10", label: "outils remplacés" },
    { value: "100%", label: "image pro" },
  ],
  reassurance: ["Gratuit pour commencer", "Design premium", "Prêt en 2 min"],

  painTitle: "Le paradoxe du designer :",
  painGradient: "un business mal designé.",
  painSubtitle: "Vos maquettes sont pixel-perfect. Votre gestion ressemble à un wireframe jamais terminé.",
  painTools: [
    { name: "Behance", emoji: "🎨" },
    { name: "Dribbble", emoji: "🏀" },
    { name: "Figma", emoji: "✏️" },
    { name: "Notion", emoji: "📝" },
    { name: "Google Forms", emoji: "📋" },
    { name: "Excel", emoji: "📊" },
    { name: "WeTransfer", emoji: "📦" },
    { name: "Gmail", emoji: "📧" },
    { name: "PayPal", emoji: "💳" },
    { name: "WhatsApp", emoji: "💬" },
  ],

  transformTitle: "Un système pensé",
  transformGradient: "pour les esprits visuels.",
  beforeItems: [
    "Portfolio sur Behance, sans aucune conversion",
    "Devis envoyés en PDF par mail à la main",
    "Suivi client sur Notes ou Notion",
    "Facturation sur Excel ou Google Sheets",
    "Briefs reçus par mail sans structure",
  ],
  afterItems: [
    "Portfolio intégré qui génère des leads directs",
    "Devis et factures en 2 clics, design pro",
    "CRM visuel avec timeline par client",
    "Facturation automatique liée aux projets",
    "Briefs structurés dans un formulaire clair",
  ],

  features: [
    { title: "Portfolio", gradient: "premium.", description: "Présentez vos projets dans une galerie élégante. Filtres, catégories, mise en scène. Convertissez les visiteurs.", bullets: ["Galerie multi-projets", "Catégorisation intelligente", "Formulaire de contact intégré"], icon: "M4 4h16v16H4zM4 12h16M12 4v16", color: "#A855F7" },
    { title: "CRM", gradient: "visuel.", description: "Chaque client a une fiche avec projets, factures, briefs et historique complet.", bullets: ["Timeline par client", "Notes et fichiers attachés", "Historique complet"], icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", color: "#EC4899" },
    { title: "Devis et factures", gradient: "design.", description: "Des documents propres, conformes, générés en quelques clics. Votre image de marque respectée.", bullets: ["Templates professionnels", "Conformité automatique", "Relances programmées"], icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 14l2 2 4-4", color: "#22C55E" },
    { title: "Gestion", gradient: "de projets.", description: "Brief, itérations, validation, livraison : chaque étape est trackée et claire.", bullets: ["Pipeline par statut", "Validation client intégrée", "Deadlines automatiques"], icon: "M9 5H2v7l6.29 6.29a1 1 0 001.42 0l5.58-5.58a1 1 0 000-1.42z", color: "#F59E0B" },
    { title: "Site", gradient: "intégré.", description: "Un vrai site pro avec votre domaine. Portfolio + pages + contact + paiement.", bullets: ["Domaine personnalisé", "Pages illimitées", "SEO intégré"], icon: "M3 3h18v18H3zM3 9h18M9 21V9", color: "#FF8A3D" },
  ],

  proofTitle: "Des designers",
  proofGradient: "qui ont structuré leur business.",
  metrics: [
    { value: "4h", label: "gagnées / semaine", description: "Moins de temps admin, plus de temps design" },
    { value: "x2", label: "plus de projets", description: "Meilleure organisation = plus de capacité" },
    { value: "100%", label: "image pro", description: "Factures aussi propres que vos livrables" },
  ],
  testimonials: [
    { name: "Emma Rousseau", role: "UI/UX designer, Paris", initials: "ER", color: "#A855F7", quote: "Jestly respecte ma sensibilité visuelle. L'interface est clean, le workflow logique. Premier outil de gestion que je trouve vraiment beau." },
    { name: "Paul Lefebvre", role: "DA freelance, Lyon", initials: "PL", color: "#3B82F6", quote: "Portfolio, CRM et facturation au même endroit. Je passe enfin plus de temps à designer qu'à gérer de l'admin." },
  ],

  ctaTitle: "Votre business mérite le même soin",
  ctaGradient: "que vos créations.",
  ctaSubtitle: "Essayez Jestly gratuitement. Premier outil de gestion aussi beau que vos maquettes.",
};

export default function DesignersPage() {
  return <PersonaPageLayout data={DATA} />;
}
