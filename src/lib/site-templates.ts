import type { BlockStyle, BlockSettings, NavConfig, FooterConfig, SiteTheme, SiteDesign, BriefField } from "@/types";

/* ─── Shared helpers ─── */

function darkStyle(accent: string, bg = "#0A0A0F", overrides?: Partial<BlockStyle>): BlockStyle {
  return {
    backgroundColor: bg,
    textColor: "#ffffff",
    paddingTop: 0,
    paddingBottom: 0,
    containerWidth: "boxed",
    buttonStyle: {
      bg: accent,
      text: "#ffffff",
      radius: 8,
      hoverShadow: "lg",
      hoverScale: 1.02,
      transitionMs: 200,
    },
    ...overrides,
  };
}

function ds(accent: string, bg?: string, ov?: Partial<BlockStyle>) {
  return darkStyle(accent, bg, ov);
}

/* ─── Types ─── */

export interface TemplateBriefDefinition {
  name: string;
  description: string;
  fields: BriefField[];
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  audience: string;
  bullets: string[];
  gradient: string;
  theme: SiteTheme;
  design: SiteDesign;
  nav: NavConfig;
  footer: FooterConfig;
  pages: TemplatePage[];
  brief: TemplateBriefDefinition;
}

export interface TemplatePage {
  title: string;
  slug: string;
  is_home: boolean;
  blocks: TemplateBlock[];
}

export interface TemplateBlock {
  type: string;
  content: Record<string, unknown>;
  style: BlockStyle;
  settings: BlockSettings;
  visible: boolean;
}

/* ═══════════════════════════════════════════════════════
   TEMPLATE 1 — CREATOR (Orange / Gold)
   Cible: Miniamaker, designer, créatif, branding visuel
   ═══════════════════════════════════════════════════════ */

const ORANGE = "#FF6B35";
const DARK1 = "#0A0A0F";

function creatorPages(): TemplatePage[] {
  const s = (ov?: Partial<BlockStyle>) => ds(ORANGE, DARK1, ov);

  return [
    {
      title: "Accueil",
      slug: "accueil",
      is_home: true,
      blocks: [
        {
          type: "hero-split-glow",
          content: {
            badge: "Disponible",
            title: "Je crée des visuels qui captent l'attention",
            subtitle: "Thumbnails, covers, identités visuelles. Des designs premium qui boostent votre visibilité.",
            primaryCtaLabel: "Voir mes créations",
            primaryBlockLink: { type: "none" },
            secondaryCtaLabel: "Me contacter",
            secondaryBlockLink: { type: "none" },
            glowColor: ORANGE,
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "services-premium",
          content: {
            title: "Mes services",
            subtitle: "Des solutions créatives pour chaque besoin.",
            services: [
              { icon: "palette", title: "Thumbnails", description: "Des miniatures YouTube qui captent les clics.", features: ["Design accrocheur", "Optimise CTR", "Livraison 24h"] },
              { icon: "layers", title: "Identité visuelle", description: "Logo, charte graphique et branding complet.", features: ["Logo vectoriel", "Guide de style", "Fichiers source"] },
              { icon: "star", title: "Design premium", description: "Covers, bannieres et visuels sur mesure.", features: ["Multi-formats", "Révisions incluses", "HD / 4K"] },
            ],
            columns: 3,
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, ${DARK1} 0%, #111118 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "portfolio-masonry",
          content: {
            title: "Réalisations",
            subtitle: "Une selection de mes meilleurs travaux.",
            items: [
              { imageUrl: "", title: "Gaming Thumbnails", category: "YouTube", description: "Serie de thumbnails pour chaine gaming" },
              { imageUrl: "", title: "Brand Identity", category: "Branding", description: "Identité complète pour startup tech" },
              { imageUrl: "", title: "Cover Art", category: "Design", description: "Pochettes et visuels pour artistes" },
              { imageUrl: "", title: "Social Media Kit", category: "Marketing", description: "Templates pour réseaux sociaux" },
            ],
            columns: 2,
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "before-after-pro",
          content: {
            title: "Avant / Après",
            subtitle: "La transformation parle d'elle-même.",
            items: [
              { beforeImageUrl: "", afterImageUrl: "", label: "Refonte thumbnail YouTube" },
              { beforeImageUrl: "", afterImageUrl: "", label: "Identité visuelle startup" },
            ],
            layout: "side-by-side",
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, ${DARK1} 0%, #0D0D14 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "testimonials-dark",
          content: {
            title: "Avis clients",
            testimonials: [
              { name: "Alex Morand", role: "YouTuber", company: "450K abonnés", text: "Mes thumbnails ont triplé mon CTR en 2 semaines. Travail incroyable !", rating: 5 },
              { name: "Julie Pham", role: "CEO", company: "Studio Nova", text: "L'identité visuelle est parfaite. Exactement ce qu'on cherchait.", rating: 5 },
              { name: "Marc Tissot", role: "Streamer", company: "Twitch Partner", text: "Rapide, créatif et professionnel. Je recommande à 100%.", rating: 5 },
            ],
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "cta-banner",
          content: {
            title: "Prêt à booster vos visuels ?",
            description: "Obtenez des designs premium qui font la différence. Première commande livrée en 24h.",
            ctaLabel: "Commander maintenant",
            blockLink: { type: "none" },
            secondaryLabel: "Voir les tarifs",
            secondaryBlockLink: { type: "none" },
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "contact-premium",
          content: {
            title: "Parlons de votre projet",
            subtitle: "Décrivez votre besoin et je reviens vers vous sous 24h.",
            fields: [
              { label: "Nom", type: "text", required: true, placeholder: "Votre nom" },
              { label: "Email", type: "email", required: true, placeholder: "votre@email.com" },
              { label: "Type de projet", type: "select", required: true, options: ["Thumbnails", "Logo / Branding", "Cover art", "Pack complet", "Autre"] },
              { label: "Message", type: "textarea", required: true, placeholder: "Décrivez votre projet, vos références, votre budget..." },
            ],
            submitLabel: "Envoyer",
            successMessage: "Merci ! Je reviens vers vous rapidement.",
            saveAsLead: true,
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, #0D0D14 0%, ${DARK1} 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "footer-block",
          content: {
            siteName: "Mon Studio",
            description: "Design premium pour créateurs de contenu.",
            columns: [
              { title: "Services", links: [{ label: "Thumbnails" }, { label: "Branding" }, { label: "Design" }] },
              { title: "Liens", links: [{ label: "Portfolio" }, { label: "Tarifs" }, { label: "Contact" }] },
              { title: "Legal", links: [{ label: "Mentions légales" }, { label: "CGV" }] },
            ],
            copyright: "Tous droits réservés.",
            showSocials: true,
            socials: { instagram: "#", twitter: "#" },
          },
          style: s(),
          settings: {},
          visible: true,
        },
      ],
    },
  ];
}

/* ═══════════════════════════════════════════════════════
   TEMPLATE 2 — PRODUCT (Violet / Tech)
   Cible: Développeur, consultant, SaaS builder
   ═══════════════════════════════════════════════════════ */

const VIOLET = "#7C3AED";
const DARK2 = "#09090B";

function productPages(): TemplatePage[] {
  const s = (ov?: Partial<BlockStyle>) => ds(VIOLET, DARK2, ov);

  return [
    {
      title: "Accueil",
      slug: "accueil",
      is_home: true,
      blocks: [
        {
          type: "hero-centered-mesh",
          content: {
            badge: "Freelance Dev",
            title: "Je construis des produits qui marchent",
            subtitle: "Développeur fullstack spécialisé Next.js, React et Supabase. Du MVP à la scale.",
            ctaLabel: "Discuter de votre projet",
            blockLink: { type: "none" },
            trustLogos: [{ name: "Next.js" }, { name: "React" }, { name: "Supabase" }, { name: "Stripe" }, { name: "Vercel" }],
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "services-premium",
          content: {
            title: "Services",
            subtitle: "Solutions techniques sur mesure pour votre business.",
            services: [
              { icon: "code", title: "Développement Web", description: "Applications modernes, performantes et scalables.", features: ["Next.js / React", "API REST & GraphQL", "Base de données"] },
              { icon: "zap", title: "MVP & Prototypage", description: "De l'idée au produit en un temps record.", features: ["Livraison rapide", "Iterations agiles", "Deploy continu"] },
              { icon: "shield", title: "Consulting", description: "Audit technique et conseil en architecture.", features: ["Code review", "Architecture", "Performance"] },
              { icon: "globe", title: "SaaS & Produit", description: "Construction de produits SaaS complets.", features: ["Stripe Billing", "Auth & RBAC", "Multi-tenant"] },
            ],
            columns: 4,
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, ${DARK2} 0%, #0F0F14 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "tech-stack",
          content: {
            title: "Stack technique",
            subtitle: "Les technologies que je maîtrise au quotidien.",
            categories: [
              { name: "Frontend", items: [{ name: "React" }, { name: "Next.js" }, { name: "TypeScript" }, { name: "Tailwind CSS" }] },
              { name: "Backend", items: [{ name: "Node.js" }, { name: "PostgreSQL" }, { name: "Supabase" }, { name: "Prisma" }] },
              { name: "Outils", items: [{ name: "Git / GitHub" }, { name: "Vercel" }, { name: "Stripe" }, { name: "Figma" }] },
            ],
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "pricing-modern",
          content: {
            title: "Tarifs",
            subtitle: "Des formules claires, sans surprise.",
            plans: [
              { name: "Starter", price: "1 500", period: "par projet", description: "Site vitrine ou landing page", features: ["1-3 pages", "Design responsive", "SEO de base", "Livraison 10 jours"], isPopular: false, ctaLabel: "Choisir" },
              { name: "Pro", price: "4 000", period: "par projet", description: "Application web complète", features: ["Jusqu'à 10 pages", "Backend + API", "Auth utilisateurs", "Dashboard admin", "Livraison 30 jours"], isPopular: true, ctaLabel: "Choisir" },
              { name: "Scale", price: "Sur devis", period: "", description: "Produit SaaS complet", features: ["Architecture sur mesure", "Stripe Billing", "Multi-tenant", "CI/CD", "Support continu"], isPopular: false, ctaLabel: "Me contacter" },
            ],
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, #0F0F14 0%, ${DARK2} 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "testimonials-dark",
          content: {
            title: "Retours clients",
            testimonials: [
              { name: "Pierre Duval", role: "CTO", company: "Fintech Pro", text: "Code propre, architecture solide, et livré dans les temps. Exactement ce qu'on cherchait.", rating: 5 },
              { name: "Sarah Cohen", role: "Fondatrice", company: "SaaSify", text: "Notre MVP a été prêt en 3 semaines. Les premiers clients sont arrivés le mois suivant.", rating: 5 },
              { name: "Karim Benzema", role: "Product Manager", company: "DataFlow", text: "Excellent consultant. A resolu nos problemes de performance en quelques jours.", rating: 5 },
            ],
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "cta-banner",
          content: {
            title: "Un projet en tete ?",
            description: "Discutons de votre idee. Premier appel gratuit, devis sous 48h.",
            ctaLabel: "Prendre rendez-vous",
            blockLink: { type: "none" },
            secondaryLabel: "Voir mes réalisations",
            secondaryBlockLink: { type: "none" },
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "contact-premium",
          content: {
            title: "Contact",
            subtitle: "Décrivez votre projet et je vous recontacte sous 24h.",
            fields: [
              { label: "Nom", type: "text", required: true, placeholder: "Votre nom" },
              { label: "Email", type: "email", required: true, placeholder: "votre@email.com" },
              { label: "Type de projet", type: "select", required: true, options: ["Site vitrine", "Application web", "MVP / SaaS", "Consulting", "Autre"] },
              { label: "Budget", type: "select", required: false, options: ["< 2 000 EUR", "2 000 - 5 000 EUR", "5 000 - 15 000 EUR", "> 15 000 EUR"] },
              { label: "Message", type: "textarea", required: true, placeholder: "Objectifs, contraintes, délais..." },
            ],
            submitLabel: "Envoyer",
            successMessage: "Merci ! Je reviens vers vous dans les 24h.",
            saveAsLead: true,
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, ${DARK2} 0%, #0F0F14 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "footer-block",
          content: {
            siteName: "Dev Studio",
            description: "Développement web et consulting technique.",
            columns: [
              { title: "Services", links: [{ label: "Développement" }, { label: "MVP" }, { label: "Consulting" }] },
              { title: "Stack", links: [{ label: "Next.js" }, { label: "React" }, { label: "Supabase" }] },
              { title: "Legal", links: [{ label: "Mentions légales" }, { label: "CGV" }] },
            ],
            copyright: "Tous droits réservés.",
            showSocials: true,
            socials: { github: "#", linkedin: "#", twitter: "#" },
          },
          style: s(),
          settings: {},
          visible: true,
        },
      ],
    },
  ];
}

/* ═══════════════════════════════════════════════════════
   TEMPLATE 3 — CINEMA (Cyan / Cinematic)
   Cible: Monteur vidéo, réal, post-prod, reels
   ═══════════════════════════════════════════════════════ */

const CYAN = "#00D4FF";
const DARK3 = "#050510";

function cinemaPages(): TemplatePage[] {
  const s = (ov?: Partial<BlockStyle>) => ds(CYAN, DARK3, ov);

  return [
    {
      title: "Accueil",
      slug: "accueil",
      is_home: true,
      blocks: [
        {
          type: "hero-split-glow",
          content: {
            badge: "Monteur Video",
            title: "Des vidéos qui marquent les esprits",
            subtitle: "Montage, motion design et post-production. Des vidéos premium pour YouTube, TikTok et Instagram.",
            primaryCtaLabel: "Voir le showreel",
            primaryBlockLink: { type: "none" },
            secondaryCtaLabel: "Demander un devis",
            secondaryBlockLink: { type: "none" },
            glowColor: CYAN,
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "video-showcase",
          content: {
            title: "Showreel 2025",
            subtitle: "60 secondes pour découvrir mon univers créatif.",
            videoUrl: "",
            stats: [
              { value: "200+", label: "Videos montees" },
              { value: "50M+", label: "Vues générées" },
              { value: "98%", label: "Satisfaction" },
            ],
            ctaLabel: "Voir mes réalisations",
            blockLink: { type: "none" },
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, ${DARK3} 0%, #0A0A18 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "services-premium",
          content: {
            title: "Services",
            subtitle: "Du rush au rendu final, je gere tout.",
            services: [
              { icon: "video", title: "Montage YouTube", description: "Montage dynamique, habillage et animations.", features: ["Long format", "Shorts / Reels", "Musique & SFX"] },
              { icon: "camera", title: "Motion Design", description: "Animations, transitions et effets visuels.", features: ["After Effects", "Animations 2D/3D", "Intros / Outros"] },
              { icon: "music", title: "Post-production", description: "Color grading, mixage audio et export.", features: ["DaVinci Resolve", "Mixage pro", "Multi-format"] },
            ],
            columns: 3,
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "before-after-pro",
          content: {
            title: "Avant / Après",
            subtitle: "La magie du montage en images.",
            items: [
              { beforeImageUrl: "", afterImageUrl: "", label: "Color grading cinematique" },
              { beforeImageUrl: "", afterImageUrl: "", label: "Montage dynamique YouTube" },
            ],
            layout: "side-by-side",
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, #0A0A18 0%, ${DARK3} 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "testimonials-dark",
          content: {
            title: "Témoignages",
            testimonials: [
              { name: "Lucas Moreau", role: "YouTuber", company: "1.2M abonnés", text: "Mon monteur attitré depuis 2 ans. Chaque vidéo est un chef-d'oeuvre.", rating: 5 },
              { name: "Emma Zhang", role: "Brand Manager", company: "Nike France", text: "Des reels qui ont explosé nos stats. Créatif et rigoureux.", rating: 5 },
              { name: "Romain Perret", role: "Réalisateur", company: "Indépendant", text: "Post-prod impeccable. Un vrai professionnel.", rating: 5 },
            ],
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "pricing-modern",
          content: {
            title: "Formules",
            subtitle: "Tarifs clairs pour chaque type de projet.",
            plans: [
              { name: "Short / Reel", price: "150", period: "par vidéo", description: "Format court (< 60s)", features: ["Montage dynamique", "Sous-titres", "Musique libre", "1 révision"], isPopular: false, ctaLabel: "Commander" },
              { name: "YouTube", price: "350", period: "par vidéo", description: "Format long (5-20 min)", features: ["Montage complet", "Habillage", "Color grading", "Musique + SFX", "3 révisions"], isPopular: true, ctaLabel: "Commander" },
              { name: "Premium", price: "Sur devis", period: "", description: "Corporate / Pub / Clip", features: ["Montage + motion", "VFX", "Sound design", "Multi-format", "Révisions illimitées"], isPopular: false, ctaLabel: "Devis gratuit" },
            ],
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, ${DARK3} 0%, #080818 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "cta-banner",
          content: {
            title: "Votre prochaine vidéo commence ici",
            description: "Envoyez vos rushes, je m'occupe du reste. Premier montage en 48h.",
            ctaLabel: "Envoyer mes rushes",
            blockLink: { type: "none" },
            secondaryLabel: "Voir les tarifs",
            secondaryBlockLink: { type: "none" },
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "contact-premium",
          content: {
            title: "Contact",
            subtitle: "Décrivez votre projet vidéo et je vous réponds sous 24h.",
            fields: [
              { label: "Nom", type: "text", required: true, placeholder: "Votre nom" },
              { label: "Email", type: "email", required: true, placeholder: "votre@email.com" },
              { label: "Type de montage", type: "select", required: true, options: ["YouTube long", "Short / Reel", "Corporate", "Clip / Pub", "Motion design", "Autre"] },
              { label: "Message", type: "textarea", required: true, placeholder: "Décrivez votre projet, vos références..." },
            ],
            submitLabel: "Envoyer",
            successMessage: "Merci ! Je reviens vers vous dans les 24h.",
            saveAsLead: true,
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, #080818 0%, ${DARK3} 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "footer-block",
          content: {
            siteName: "Video Studio",
            description: "Montage vidéo premium pour créateurs de contenu.",
            columns: [
              { title: "Services", links: [{ label: "Montage YouTube" }, { label: "Shorts / Reels" }, { label: "Motion Design" }] },
              { title: "Liens", links: [{ label: "Showreel" }, { label: "Tarifs" }, { label: "Contact" }] },
              { title: "Legal", links: [{ label: "Mentions légales" }, { label: "CGV" }] },
            ],
            copyright: "Tous droits réservés.",
            showSocials: true,
            socials: { youtube: "#", instagram: "#", twitter: "#" },
          },
          style: s(),
          settings: {},
          visible: true,
        },
      ],
    },
  ];
}

/* ═══════════════════════════════════════════════════════
   BRIEFS
   ═══════════════════════════════════════════════════════ */

const CREATOR_BRIEF: TemplateBriefDefinition = {
  name: "Brief Design / Créatif",
  description: "Formulaire de brief pour commande de design visuel.",
  fields: [
    { key: "project_title", label: "Titre du projet", type: "text", required: true, placeholder: "ex: Thumbnail pour ma vidéo YouTube", target_kind: "order_field", target_ref: "notes" },
    { key: "briefing", label: "Briefing créatif", type: "textarea", required: true, placeholder: "Style, couleurs, éléments à inclure...", target_kind: "order_field", target_ref: "briefing" },
    { key: "deadline", label: "Deadline souhaitée", type: "date", required: false, target_kind: "order_field", target_ref: "deadline" },
    { key: "resources", label: "Fichiers / références", type: "file", required: false, multiple: true, target_kind: "order_field", target_ref: "resources" },
    { key: "style_type", label: "Type de création", type: "select", required: true, options: ["Thumbnail", "Logo", "Cover art", "Pack branding", "Autre"], target_kind: "order_field", target_ref: "category" },
  ],
};

const PRODUCT_BRIEF: TemplateBriefDefinition = {
  name: "Brief Projet Dev",
  description: "Formulaire de cadrage pour un projet de développement.",
  fields: [
    { key: "project_type", label: "Type de projet", type: "select", required: true, options: ["Site vitrine", "Application web", "MVP / SaaS", "API / Backend", "Consulting", "Autre"], target_kind: "order_field", target_ref: "category" },
    { key: "briefing", label: "Description du besoin", type: "textarea", required: true, placeholder: "Objectifs, fonctionnalités, contraintes...", target_kind: "order_field", target_ref: "briefing" },
    { key: "stack", label: "Stack souhaitée", type: "text", required: false, placeholder: "ex: Next.js, Supabase..." },
    { key: "deadline", label: "Délai souhaité", type: "date", required: false, target_kind: "order_field", target_ref: "deadline" },
    { key: "resources", label: "Docs / Figma / Repo", type: "file", required: false, multiple: true, target_kind: "order_field", target_ref: "resources" },
    { key: "budget", label: "Budget estimatif", type: "select", required: false, options: ["< 2 000 EUR", "2 000 - 5 000 EUR", "5 000 - 15 000 EUR", "> 15 000 EUR"] },
  ],
};

const CINEMA_BRIEF: TemplateBriefDefinition = {
  name: "Brief Montage Vidéo",
  description: "Formulaire de brief pour montage vidéo.",
  fields: [
    { key: "montage_type", label: "Type de montage", type: "select", required: true, options: ["YouTube long", "YouTube short", "Reel / TikTok", "Corporate", "Clip / Pub", "Motion design", "Autre"], target_kind: "order_field", target_ref: "category" },
    { key: "format", label: "Format final", type: "select", required: true, options: ["16:9 (YouTube)", "9:16 (Short/Reel)", "1:1 (Instagram)", "Custom"] },
    { key: "deadline", label: "Deadline", type: "date", required: false, target_kind: "order_field", target_ref: "deadline" },
    { key: "resources", label: "Rushes / fichiers", type: "file", required: false, multiple: true, target_kind: "order_field", target_ref: "resources" },
    { key: "briefing", label: "Briefing détaillé", type: "textarea", required: true, placeholder: "Style, rythme, musique, références...", target_kind: "order_field", target_ref: "briefing" },
  ],
};

/* ═══════════════════════════════════════════════════════
   TEMPLATE 4 — STUDIO (Lime / Minimal Design)
   Cible: Designer, studio branding, DA, product designer
   ═══════════════════════════════════════════════════════ */

const LIME = "#C8FF2E";
const DARK4 = "#0F0F10";

function studioPages(): TemplatePage[] {
  const s = (ov?: Partial<BlockStyle>) => ds(LIME, DARK4, ov);

  return [
    {
      title: "Accueil",
      slug: "accueil",
      is_home: true,
      blocks: [
        {
          type: "hero-split-glow",
          content: {
            badge: "Studio Design",
            title: "Design that sells.",
            subtitle: "Identité visuelle, branding et direction artistique. Des designs minimalistes qui font la difference.",
            primaryCtaLabel: "Voir les projets",
            primaryBlockLink: { type: "none" },
            secondaryCtaLabel: "Collaborer",
            secondaryBlockLink: { type: "none" },
            glowColor: LIME,
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "services-premium",
          content: {
            title: "Expertise",
            subtitle: "Des solutions design pensées pour convertir.",
            services: [
              { icon: "palette", title: "Identité visuelle", description: "Logo, typographie et charte graphique complète.", features: ["Logo vectoriel", "Charte graphique", "Guide de marque"] },
              { icon: "layout", title: "UI / UX Design", description: "Interfaces modernes et parcours utilisateur optimisés.", features: ["Wireframes", "Maquettes HD", "Design system"] },
              { icon: "pen-tool", title: "Direction artistique", description: "Vision créative globale pour votre marque.", features: ["Concept créatif", "Storytelling visuel", "Cohérence de marque"] },
              { icon: "monitor", title: "Web Design", description: "Sites premium qui reflètent votre identité.", features: ["Landing pages", "Sites vitrines", "E-commerce"] },
            ],
            columns: 4,
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, ${DARK4} 0%, #141416 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "portfolio-masonry",
          content: {
            title: "Projets sélectionnés",
            subtitle: "Une sélection de travaux récents.",
            items: [
              { imageUrl: "", title: "Rebranding Startup", category: "Branding", description: "Refonte complète de l'identité visuelle" },
              { imageUrl: "", title: "App Mobile Finance", category: "UI/UX", description: "Design d'interface pour app fintech" },
              { imageUrl: "", title: "E-commerce Luxe", category: "Web Design", description: "Boutique en ligne haut de gamme" },
              { imageUrl: "", title: "Packaging Bio", category: "Direction artistique", description: "Gamme packaging pour marque bio" },
            ],
            columns: 2,
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "testimonials-dark",
          content: {
            title: "Ce qu'ils en disent",
            testimonials: [
              { name: "Thomas Renard", role: "CEO", company: "Finova", text: "Un oeil impeccable et une execution parfaite. Notre branding a transforme notre image.", rating: 5 },
              { name: "Lea Martin", role: "Fondatrice", company: "Maison Verte", text: "Le packaging est sublime. Les ventes ont augmenté de 40% depuis le rebranding.", rating: 5 },
              { name: "Antoine Giraud", role: "CTO", company: "TechWave", text: "L'interface est intuitive et elegante. Nos utilisateurs adorent.", rating: 5 },
            ],
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, #141416 0%, ${DARK4} 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "pricing-modern",
          content: {
            title: "Formules",
            subtitle: "Des offres adaptées à chaque besoin.",
            plans: [
              { name: "Essential", price: "800", period: "par projet", description: "Logo + charte de base", features: ["Logo vectoriel", "Palette couleurs", "2 typographies", "2 révisions"], isPopular: false, ctaLabel: "Choisir" },
              { name: "Premium", price: "2 500", period: "par projet", description: "Identité complète", features: ["Logo + variations", "Charte graphique", "Templates social media", "Guide de marque", "5 révisions"], isPopular: true, ctaLabel: "Choisir" },
              { name: "Studio", price: "Sur devis", period: "", description: "Direction artistique", features: ["Stratégie de marque", "Identité complète", "UI/UX design", "Motion design", "Support continu"], isPopular: false, ctaLabel: "Discuter" },
            ],
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "cta-banner",
          content: {
            title: "Un projet en tete ?",
            description: "Parlons de votre vision. Premier échange gratuit, proposition sous 48h.",
            ctaLabel: "Prendre rendez-vous",
            blockLink: { type: "none" },
            secondaryLabel: "Voir les projets",
            secondaryBlockLink: { type: "none" },
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "contact-premium",
          content: {
            title: "Parlons design",
            subtitle: "Décrivez votre projet et je reviens vers vous sous 24h.",
            fields: [
              { label: "Nom", type: "text", required: true, placeholder: "Votre nom" },
              { label: "Email", type: "email", required: true, placeholder: "votre@email.com" },
              { label: "Type de projet", type: "select", required: true, options: ["Identité visuelle", "UI/UX Design", "Web Design", "Direction artistique", "Autre"] },
              { label: "Message", type: "textarea", required: true, placeholder: "Votre vision, vos références, votre budget..." },
            ],
            submitLabel: "Envoyer",
            successMessage: "Merci ! Je reviens vers vous rapidement.",
            saveAsLead: true,
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, ${DARK4} 0%, #0D0D0E 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "footer-block",
          content: {
            siteName: "Studio",
            description: "Design & direction artistique.",
            columns: [
              { title: "Services", links: [{ label: "Branding" }, { label: "UI/UX" }, { label: "Web Design" }] },
              { title: "Liens", links: [{ label: "Projets" }, { label: "Tarifs" }, { label: "Contact" }] },
              { title: "Legal", links: [{ label: "Mentions légales" }, { label: "CGV" }] },
            ],
            copyright: "Tous droits réservés.",
            showSocials: true,
            socials: { instagram: "#", dribbble: "#", linkedin: "#" },
          },
          style: s(),
          settings: {},
          visible: true,
        },
      ],
    },
  ];
}

/* ═══════════════════════════════════════════════════════
   TEMPLATE 5 — NEON (Purple / Cyberpunk)
   Cible: YouTuber, streamer, gaming, AI, digital art
   ═══════════════════════════════════════════════════════ */

const NEON_PURPLE = "#7B61FF";
const DARK5 = "#050508";

function neonPages(): TemplatePage[] {
  const s = (ov?: Partial<BlockStyle>) => ds(NEON_PURPLE, DARK5, ov);

  return [
    {
      title: "Accueil",
      slug: "accueil",
      is_home: true,
      blocks: [
        {
          type: "hero-centered-mesh",
          content: {
            badge: "Digital Creator",
            title: "Create the future.",
            subtitle: "Contenu premium pour l'ère digitale. Vidéos, streams, designs et expériences immersives.",
            ctaLabel: "Découvrir",
            blockLink: { type: "none" },
            trustLogos: [{ name: "YouTube" }, { name: "Twitch" }, { name: "TikTok" }, { name: "Discord" }, { name: "Midjourney" }],
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "services-premium",
          content: {
            title: "Services",
            subtitle: "Du contenu qui marque les esprits.",
            services: [
              { icon: "video", title: "Montage Premium", description: "Montage dynamique et effets visuels.", features: ["YouTube / Shorts", "Motion design", "VFX & transitions"] },
              { icon: "image", title: "Thumbnails & Design", description: "Visuels accrocheurs qui maximisent les clics.", features: ["Thumbnails YouTube", "Bannieres", "Overlays stream"] },
              { icon: "zap", title: "Branding Creator", description: "Identité visuelle pour créateurs.", features: ["Logo animé", "Emotes / badges", "Pack complet"] },
            ],
            columns: 3,
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, ${DARK5} 0%, #0A0A14 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "video-showcase",
          content: {
            title: "Showreel 2026",
            subtitle: "Un aperçu de mes dernières créations.",
            videoUrl: "",
            stats: [
              { value: "500+", label: "Videos editees" },
              { value: "100M+", label: "Vues totales" },
              { value: "200+", label: "Clients" },
            ],
            ctaLabel: "Voir le portfolio",
            blockLink: { type: "none" },
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "portfolio-masonry",
          content: {
            title: "Portfolio",
            subtitle: "Mes réalisations récentes.",
            items: [
              { imageUrl: "", title: "Gaming Montage", category: "YouTube", description: "Serie de montages gaming viraux" },
              { imageUrl: "", title: "Stream Pack", category: "Twitch", description: "Pack complet overlays et alertes" },
              { imageUrl: "", title: "AI Art Collection", category: "Digital Art", description: "Collection generative premium" },
              { imageUrl: "", title: "Music Video", category: "Video", description: "Clip musical avec VFX" },
            ],
            columns: 2,
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, #0A0A14 0%, ${DARK5} 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "testimonials-dark",
          content: {
            title: "Retours",
            testimonials: [
              { name: "MaxGaming", role: "YouTuber", company: "2.5M abonnés", text: "Les montages sont insane. Mon audience a triplé en 6 mois.", rating: 5 },
              { name: "Luna_Art", role: "Streameuse", company: "Twitch Partner", text: "Le branding est parfait. Mon stream a un look pro maintenant.", rating: 5 },
              { name: "CyberKev", role: "Créateur AI", company: "500K followers", text: "Des thumbnails qui cartonnent. CTR multiplié par 3.", rating: 5 },
            ],
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "pricing-modern",
          content: {
            title: "Tarifs",
            subtitle: "Des offres claires pour chaque besoin.",
            plans: [
              { name: "Starter", price: "99", period: "par vidéo", description: "Montage Short / Reel", features: ["Montage dynamique", "Sous-titres", "Musique libre", "1 révision"], isPopular: false, ctaLabel: "Go" },
              { name: "Creator", price: "299", period: "par vidéo", description: "Montage YouTube complet", features: ["Montage + habillage", "Motion design", "Color grading", "Sound design", "3 révisions"], isPopular: true, ctaLabel: "Go" },
              { name: "Legend", price: "Sur devis", period: "", description: "Pack creator complet", features: ["Montage illimité", "Branding complet", "Thumbnails", "Overlays stream", "Support prioritaire"], isPopular: false, ctaLabel: "Contact" },
            ],
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, ${DARK5} 0%, #080812 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "cta-banner",
          content: {
            title: "Ready to level up ?",
            description: "Transformez votre contenu. Premier projet livré en 48h.",
            ctaLabel: "Let's go",
            blockLink: { type: "none" },
            secondaryLabel: "Voir les tarifs",
            secondaryBlockLink: { type: "none" },
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "contact-premium",
          content: {
            title: "Contact",
            subtitle: "Décrivez votre projet et je vous réponds en 24h.",
            fields: [
              { label: "Pseudo / Nom", type: "text", required: true, placeholder: "Votre pseudo ou nom" },
              { label: "Email", type: "email", required: true, placeholder: "votre@email.com" },
              { label: "Plateforme", type: "select", required: true, options: ["YouTube", "Twitch", "TikTok", "Instagram", "Discord", "Autre"] },
              { label: "Type de projet", type: "select", required: true, options: ["Montage vidéo", "Thumbnails", "Branding / Emotes", "Pack stream", "Autre"] },
              { label: "Message", type: "textarea", required: true, placeholder: "Votre projet, vos refs, votre budget..." },
            ],
            submitLabel: "Envoyer",
            successMessage: "GG ! Je reviens vers vous rapidement.",
            saveAsLead: true,
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, #080812 0%, ${DARK5} 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "footer-block",
          content: {
            siteName: "Neon Studio",
            description: "Contenu premium pour créateurs digitaux.",
            columns: [
              { title: "Services", links: [{ label: "Montage" }, { label: "Thumbnails" }, { label: "Branding" }] },
              { title: "Liens", links: [{ label: "Portfolio" }, { label: "Tarifs" }, { label: "Contact" }] },
              { title: "Social", links: [{ label: "YouTube" }, { label: "Twitter" }, { label: "Discord" }] },
            ],
            copyright: "All rights reserved.",
            showSocials: true,
            socials: { youtube: "#", twitter: "#", discord: "#" },
          },
          style: s(),
          settings: {},
          visible: true,
        },
      ],
    },
  ];
}

/* ═══════════════════════════════════════════════════════
   TEMPLATE 6 — EDITORIAL (Warm / Magazine)
   Cible: Photographe, écrivain, artiste visuel, studio créatif
   ═══════════════════════════════════════════════════════ */

const WARM = "#D48B5C";
const LIGHT6 = "#FAF7F2";

function editorialPages(): TemplatePage[] {
  const s = (ov?: Partial<BlockStyle>): BlockStyle => ({
    backgroundColor: LIGHT6,
    textColor: "#111111",
    paddingTop: 0,
    paddingBottom: 0,
    containerWidth: "boxed",
    buttonStyle: {
      bg: WARM,
      text: "#ffffff",
      radius: 4,
      hoverShadow: "md",
      hoverScale: 1.01,
      transitionMs: 250,
    },
    ...ov,
  });

  return [
    {
      title: "Accueil",
      slug: "accueil",
      is_home: true,
      blocks: [
        {
          type: "hero-split-glow",
          content: {
            badge: "Photographe",
            title: "Stories through images.",
            subtitle: "Photographie d'auteur, reportage et portraits. Des images qui racontent une histoire.",
            primaryCtaLabel: "Voir le portfolio",
            primaryBlockLink: { type: "none" },
            secondaryCtaLabel: "Me contacter",
            secondaryBlockLink: { type: "none" },
            glowColor: WARM,
          },
          style: s({ backgroundColor: "#F5F1EA" }),
          settings: {},
          visible: true,
        },
        {
          type: "services-premium",
          content: {
            title: "Prestations",
            subtitle: "Des images qui subliment votre histoire.",
            services: [
              { icon: "camera", title: "Reportage", description: "Couverture d'événements et reportages immersifs.", features: ["Événementiel", "Corporate", "Lifestyle"] },
              { icon: "user", title: "Portraits", description: "Portraits d'auteur et séances photo personnalisées.", features: ["Studio", "Extérieur", "Retouche fine"] },
              { icon: "image", title: "Produit", description: "Photos produit et packshot pour e-commerce.", features: ["Fond blanc", "Mise en scene", "Multi-angles"] },
            ],
            columns: 3,
          },
          style: s({ backgroundColor: LIGHT6 }),
          settings: {},
          visible: true,
        },
        {
          type: "portfolio-masonry",
          content: {
            title: "Portfolio",
            subtitle: "Une sélection de travaux récents.",
            items: [
              { imageUrl: "", title: "Mariage en Provence", category: "Reportage", description: "Couverture photo d'un mariage en extérieur" },
              { imageUrl: "", title: "Portrait Corporate", category: "Portrait", description: "Série portrait pour équipe dirigeante" },
              { imageUrl: "", title: "Collection Automne", category: "Mode", description: "Shooting mode pour marque éthique" },
              { imageUrl: "", title: "Gastronomie", category: "Produit", description: "Photos culinaires pour restaurant étoilé" },
              { imageUrl: "", title: "Voyage au Japon", category: "Reportage", description: "Carnet de voyage photographique" },
              { imageUrl: "", title: "Architecture", category: "Art", description: "Serie sur l'architecture contemporaine" },
            ],
            columns: 3,
          },
          style: s({ backgroundColor: "#F5F1EA" }),
          settings: {},
          visible: true,
        },
        {
          type: "testimonials-dark",
          content: {
            title: "Témoignages",
            testimonials: [
              { name: "Claire Beaumont", role: "Mariée", company: "", text: "Des photos magnifiques qui capturent parfaitement l'émotion de notre mariage.", rating: 5 },
              { name: "Jean-Pierre Morel", role: "Chef étoilé", company: "Le Jardin", text: "Mes plats n'ont jamais été aussi beaux en photo. Un vrai artiste.", rating: 5 },
              { name: "Sophie Laurent", role: "Directrice", company: "Maison Rivière", text: "Le shooting mode était parfait. Les images sont sublimes.", rating: 5 },
            ],
          },
          style: s({ backgroundColor: LIGHT6 }),
          settings: {},
          visible: true,
        },
        {
          type: "pricing-modern",
          content: {
            title: "Tarifs",
            subtitle: "Des formules adaptées à chaque projet.",
            plans: [
              { name: "Essentiel", price: "350", period: "par séance", description: "Séance photo 1h", features: ["1h de shooting", "20 photos retouchées", "Galerie en ligne", "1 révision"], isPopular: false, ctaLabel: "Réserver" },
              { name: "Premium", price: "900", period: "par séance", description: "Séance photo demi-journée", features: ["4h de shooting", "60 photos retouchées", "Galerie en ligne", "Tirages inclus", "3 révisions"], isPopular: true, ctaLabel: "Réserver" },
              { name: "Sur mesure", price: "Sur devis", period: "", description: "Événement / Reportage", features: ["Journée complète", "Photos illimitées", "Reportage complet", "Livre photo", "Livraison sous 7j"], isPopular: false, ctaLabel: "Me contacter" },
            ],
          },
          style: s({ backgroundColor: "#F5F1EA" }),
          settings: {},
          visible: true,
        },
        {
          type: "cta-banner",
          content: {
            title: "Racontons votre histoire",
            description: "Chaque image mérite d'être exceptionnelle. Parlons de votre prochain projet.",
            ctaLabel: "Prendre rendez-vous",
            blockLink: { type: "none" },
            secondaryLabel: "Voir le portfolio",
            secondaryBlockLink: { type: "none" },
          },
          style: s({ backgroundColor: LIGHT6 }),
          settings: {},
          visible: true,
        },
        {
          type: "contact-premium",
          content: {
            title: "Contact",
            subtitle: "Décrivez votre projet et je vous réponds sous 48h.",
            fields: [
              { label: "Nom", type: "text", required: true, placeholder: "Votre nom" },
              { label: "Email", type: "email", required: true, placeholder: "votre@email.com" },
              { label: "Type de projet", type: "select", required: true, options: ["Reportage", "Portrait", "Mariage", "Produit", "Mode", "Autre"] },
              { label: "Date souhaitée", type: "date", required: false },
              { label: "Message", type: "textarea", required: true, placeholder: "Lieu, ambiance, nombre de personnes..." },
            ],
            submitLabel: "Envoyer",
            successMessage: "Merci ! Je reviens vers vous dans les 48h.",
            saveAsLead: true,
          },
          style: s({ backgroundColor: "#F5F1EA" }),
          settings: {},
          visible: true,
        },
        {
          type: "footer-block",
          content: {
            siteName: "Studio Photo",
            description: "Photographie d'auteur & reportage.",
            columns: [
              { title: "Services", links: [{ label: "Reportage" }, { label: "Portraits" }, { label: "Produit" }] },
              { title: "Liens", links: [{ label: "Portfolio" }, { label: "Journal" }, { label: "Contact" }] },
              { title: "Legal", links: [{ label: "Mentions légales" }, { label: "CGV" }] },
            ],
            copyright: "Tous droits réservés.",
            showSocials: true,
            socials: { instagram: "#", pinterest: "#" },
          },
          style: s({ backgroundColor: "#111111", textColor: "#F5F5F5" }),
          settings: {},
          visible: true,
        },
      ],
    },
  ];
}

/* ═══════════════════════════════════════════════════════
   BRIEFS NEW THEMES
   ═══════════════════════════════════════════════════════ */

const STUDIO_BRIEF: TemplateBriefDefinition = {
  name: "Brief Design / Branding",
  description: "Formulaire de brief pour projet de design ou branding.",
  fields: [
    { key: "project_type", label: "Type de projet", type: "select", required: true, options: ["Identité visuelle", "UI/UX Design", "Web Design", "Direction artistique", "Packaging", "Autre"], target_kind: "order_field", target_ref: "category" },
    { key: "briefing", label: "Votre vision", type: "textarea", required: true, placeholder: "Objectifs, valeurs de marque, public cible, references visuelles...", target_kind: "order_field", target_ref: "briefing" },
    { key: "deadline", label: "Deadline souhaitée", type: "date", required: false, target_kind: "order_field", target_ref: "deadline" },
    { key: "resources", label: "Fichiers / références", type: "file", required: false, multiple: true, target_kind: "order_field", target_ref: "resources" },
    { key: "budget", label: "Budget estimatif", type: "select", required: false, options: ["< 1 000 EUR", "1 000 - 3 000 EUR", "3 000 - 10 000 EUR", "> 10 000 EUR"] },
  ],
};

const NEON_BRIEF: TemplateBriefDefinition = {
  name: "Brief Creator Digital",
  description: "Formulaire de brief pour contenu digital / gaming.",
  fields: [
    { key: "platform", label: "Plateforme", type: "select", required: true, options: ["YouTube", "Twitch", "TikTok", "Instagram", "Discord", "Autre"] },
    { key: "project_type", label: "Type de projet", type: "select", required: true, options: ["Montage vidéo", "Thumbnails", "Branding / Emotes", "Pack stream", "Motion design", "Autre"], target_kind: "order_field", target_ref: "category" },
    { key: "briefing", label: "Briefing", type: "textarea", required: true, placeholder: "Style, references, chaine YouTube...", target_kind: "order_field", target_ref: "briefing" },
    { key: "deadline", label: "Deadline", type: "date", required: false, target_kind: "order_field", target_ref: "deadline" },
    { key: "resources", label: "Fichiers / rushes", type: "file", required: false, multiple: true, target_kind: "order_field", target_ref: "resources" },
  ],
};

const EDITORIAL_BRIEF: TemplateBriefDefinition = {
  name: "Brief Photo / Reportage",
  description: "Formulaire de brief pour séance photo ou reportage.",
  fields: [
    { key: "project_type", label: "Type de prestation", type: "select", required: true, options: ["Reportage", "Portrait", "Mariage", "Produit / Packshot", "Mode", "Événementiel", "Autre"], target_kind: "order_field", target_ref: "category" },
    { key: "date", label: "Date souhaitée", type: "date", required: false, target_kind: "order_field", target_ref: "deadline" },
    { key: "briefing", label: "Description du projet", type: "textarea", required: true, placeholder: "Lieu, ambiance, nombre de personnes, style souhaité...", target_kind: "order_field", target_ref: "briefing" },
    { key: "resources", label: "Références / moodboard", type: "file", required: false, multiple: true, target_kind: "order_field", target_ref: "resources" },
  ],
};

/* ═══════════════════════════════════════════════════════
   REGISTRY
   ═══════════════════════════════════════════════════════ */

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "creator",
    name: "Creator",
    description: "Template percutant pour designers visuels et créateurs.",
    audience: "Designers, thumbnails, branding",
    bullets: ["Hero avec glow", "Portfolio masonry", "Services premium", "Avant/Après", "Contact premium"],
    gradient: "from-orange-600 to-orange-400",
    theme: {
      primaryColor: ORANGE, secondaryColor: "#FF8F5E",
      backgroundColor: DARK1, surfaceColor: "#141419", textColor: "#ffffff", mutedTextColor: "#999999", borderColor: "#ffffff15",
      fontFamily: "'Space Grotesk', sans-serif", headingFont: "'Playfair Display', serif",
      borderRadius: "rounded", shadow: "md", mode: "dark",
      containerWidth: "default", buttonRadius: "full", sectionGap: "none",
    },
    design: {
      designKey: "creator",
      backgroundPreset: "glow",
      heroVariant: "hero-split-glow",
      cardStyle: "elevated",
      buttonVariant: "solid",
      navStyle: "transparent",
      footerStyle: "minimal",
    },
    nav: {
      links: [{ label: "Accueil" }, { label: "Services" }, { label: "Portfolio" }, { label: "Contact" }],
      showCta: true,
      ctaLabel: "Commander",
    },
    footer: {
      links: [{ label: "Accueil" }, { label: "Services" }, { label: "Portfolio" }, { label: "Contact" }],
      showSocials: true,
      copyright: "Tous droits réservés.",
    },
    pages: creatorPages(),
    brief: CREATOR_BRIEF,
  },
  {
    id: "product",
    name: "Product",
    description: "Template technique pour développeurs et consultants.",
    audience: "Devs freelance, SaaS builders",
    bullets: ["Hero avec mesh", "Tech stack", "Pricing modern", "Témoignages dark", "Contact premium"],
    gradient: "from-violet-600 to-violet-400",
    theme: {
      primaryColor: VIOLET, secondaryColor: "#9F67FF",
      backgroundColor: DARK2, surfaceColor: "#111113", textColor: "#ffffff", mutedTextColor: "#999999", borderColor: "#ffffff15",
      fontFamily: "'Space Grotesk', sans-serif", headingFont: "'Space Grotesk', sans-serif",
      borderRadius: "rounded", shadow: "sm", mode: "dark",
      containerWidth: "default", buttonRadius: "md", sectionGap: "none",
    },
    design: {
      designKey: "product",
      backgroundPreset: "grid-tech",
      heroVariant: "hero-centered-mesh",
      cardStyle: "bordered",
      buttonVariant: "gradient",
      navStyle: "blur",
      footerStyle: "columns",
    },
    nav: {
      links: [{ label: "Accueil" }, { label: "Services" }, { label: "Stack" }, { label: "Tarifs" }, { label: "Contact" }],
      showCta: true,
      ctaLabel: "Me contacter",
    },
    footer: {
      links: [{ label: "Accueil" }, { label: "Services" }, { label: "Tarifs" }, { label: "Contact" }],
      showSocials: true,
      copyright: "Tous droits réservés.",
    },
    pages: productPages(),
    brief: PRODUCT_BRIEF,
  },
  {
    id: "cinema",
    name: "Cinema",
    description: "Template cinématique pour monteurs vidéo et motion designers.",
    audience: "Monteurs, motion designers, post-prod",
    bullets: ["Hero glow cinematic", "Showreel vidéo", "Avant/Après", "Pricing formules", "Contact premium"],
    gradient: "from-cyan-500 to-cyan-300",
    theme: {
      primaryColor: CYAN, secondaryColor: "#33DFFF",
      backgroundColor: DARK3, surfaceColor: "#0D0D1A", textColor: "#ffffff", mutedTextColor: "#999999", borderColor: "#ffffff15",
      fontFamily: "'Sora', sans-serif", headingFont: "'Outfit', sans-serif",
      borderRadius: "rounded", shadow: "lg", mode: "dark",
      containerWidth: "wide", buttonRadius: "sm", sectionGap: "none",
    },
    design: {
      designKey: "cinema",
      backgroundPreset: "mesh",
      heroVariant: "hero-split-glow",
      cardStyle: "glass",
      buttonVariant: "outline",
      navStyle: "blur",
      footerStyle: "centered",
    },
    nav: {
      links: [{ label: "Accueil" }, { label: "Showreel" }, { label: "Services" }, { label: "Tarifs" }, { label: "Contact" }],
      showCta: true,
      ctaLabel: "Devis gratuit",
    },
    footer: {
      links: [{ label: "Accueil" }, { label: "Showreel" }, { label: "Services" }, { label: "Contact" }],
      showSocials: true,
      copyright: "Tous droits réservés.",
    },
    pages: cinemaPages(),
    brief: CINEMA_BRIEF,
  },
  {
    id: "studio",
    name: "Studio",
    description: "Template minimaliste premium pour studios design et DA.",
    audience: "Designers, studios branding, DA",
    bullets: ["Hero minimal", "Portfolio masonry", "Pricing modern", "Témoignages", "Contact premium"],
    gradient: "from-lime-400 to-lime-300",
    theme: {
      primaryColor: LIME, secondaryColor: "#A8E600",
      backgroundColor: DARK4, surfaceColor: "#1A1A1C", textColor: "#F5F5F5", mutedTextColor: "#888888", borderColor: "#2A2A2C",
      fontFamily: "'Inter Tight', 'Inter', sans-serif", headingFont: "'Inter Tight', 'Inter', sans-serif",
      borderRadius: "rounded", shadow: "sm", mode: "dark",
      containerWidth: "default", buttonRadius: "md", sectionGap: "none",
    },
    design: {
      designKey: "studio",
      backgroundPreset: "noise",
      heroVariant: "hero-split-glow",
      cardStyle: "bordered",
      buttonVariant: "solid",
      navStyle: "solid",
      footerStyle: "minimal",
    },
    nav: {
      links: [{ label: "Accueil" }, { label: "Services" }, { label: "Projets" }, { label: "Tarifs" }, { label: "Contact" }],
      showCta: true,
      ctaLabel: "Collaborer",
    },
    footer: {
      links: [{ label: "Accueil" }, { label: "Projets" }, { label: "Tarifs" }, { label: "Contact" }],
      showSocials: true,
      copyright: "Tous droits réservés.",
    },
    pages: studioPages(),
    brief: STUDIO_BRIEF,
  },
  {
    id: "neon",
    name: "Neon",
    description: "Template cyberpunk futuriste pour créateurs digitaux.",
    audience: "YouTubers, streamers, gaming, AI",
    bullets: ["Hero neon mesh", "Showreel vidéo", "Portfolio masonry", "Pricing gaming", "Contact premium"],
    gradient: "from-purple-500 to-cyan-400",
    theme: {
      primaryColor: NEON_PURPLE, secondaryColor: "#00F0FF",
      backgroundColor: DARK5, surfaceColor: "#0D0D14", textColor: "#EEEEF0", mutedTextColor: "#7A7A8C", borderColor: "#1A1A2E",
      fontFamily: "'Space Grotesk', sans-serif", headingFont: "'Space Grotesk', sans-serif",
      borderRadius: "rounded", shadow: "lg", mode: "dark",
      containerWidth: "wide", buttonRadius: "md", sectionGap: "none",
      buttonHoverScale: 1.03,
    },
    design: {
      designKey: "neon",
      backgroundPreset: "mesh",
      heroVariant: "hero-centered-mesh",
      cardStyle: "glass",
      buttonVariant: "gradient",
      navStyle: "blur",
      footerStyle: "centered",
    },
    nav: {
      links: [{ label: "Accueil" }, { label: "Services" }, { label: "Portfolio" }, { label: "Tarifs" }, { label: "Contact" }],
      showCta: true,
      ctaLabel: "Let's go",
    },
    footer: {
      links: [{ label: "Accueil" }, { label: "Portfolio" }, { label: "Tarifs" }, { label: "Contact" }],
      showSocials: true,
      copyright: "All rights reserved.",
    },
    pages: neonPages(),
    brief: NEON_BRIEF,
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Template editorial haut de gamme pour photographes et artistes.",
    audience: "Photographes, écrivains, artistes visuels",
    bullets: ["Hero editorial", "Portfolio masonry 3 col", "Pricing séances", "Témoignages", "Contact premium"],
    gradient: "from-amber-600 to-amber-400",
    theme: {
      primaryColor: WARM, secondaryColor: "#A5A58D",
      backgroundColor: LIGHT6, surfaceColor: "#F0EDE6", textColor: "#111111", mutedTextColor: "#6B6B6B", borderColor: "#DDD8D0",
      fontFamily: "'Inter', sans-serif", headingFont: "'Playfair Display', serif",
      borderRadius: "rounded", shadow: "sm", mode: "light",
      containerWidth: "default", buttonRadius: "sm", sectionGap: "none",
    },
    design: {
      designKey: "editorial",
      backgroundPreset: "noise",
      heroVariant: "hero-split-glow",
      cardStyle: "flat",
      buttonVariant: "solid",
      navStyle: "solid",
      footerStyle: "columns",
    },
    nav: {
      links: [{ label: "Accueil" }, { label: "Portfolio" }, { label: "Prestations" }, { label: "Tarifs" }, { label: "Contact" }],
      showCta: true,
      ctaLabel: "Prendre rendez-vous",
    },
    footer: {
      links: [{ label: "Accueil" }, { label: "Portfolio" }, { label: "Tarifs" }, { label: "Contact" }],
      showSocials: true,
      copyright: "Tous droits réservés.",
    },
    pages: editorialPages(),
    brief: EDITORIAL_BRIEF,
  },
];

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
