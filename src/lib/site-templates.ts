import type { BlockStyle, BlockSettings, NavConfig, FooterConfig, SiteTheme, SiteDesign, BriefField } from "@/types";

/* ─── Shared helpers ─── */

function darkStyle(accent: string, bg = "#0A0A0F", overrides?: Partial<BlockStyle>): BlockStyle {
  return {
    backgroundColor: bg,
    textColor: "#ffffff",
    paddingTop: 80,
    paddingBottom: 80,
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
   Cible: Miniamaker, designer, creatif, branding visuel
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
            title: "Je cree des visuels qui captent l'attention",
            subtitle: "Thumbnails, covers, identites visuelles. Des designs premium qui boostent votre visibilite.",
            primaryCtaLabel: "Voir mes creations",
            primaryBlockLink: { type: "none" },
            secondaryCtaLabel: "Me contacter",
            secondaryBlockLink: { type: "none" },
            glowColor: ORANGE,
          },
          style: s({ paddingTop: 100, paddingBottom: 100 }),
          settings: {},
          visible: true,
        },
        {
          type: "services-premium",
          content: {
            title: "Mes services",
            subtitle: "Des solutions creatives pour chaque besoin.",
            services: [
              { icon: "palette", title: "Thumbnails", description: "Des miniatures YouTube qui captent les clics.", features: ["Design accrocheur", "Optimise CTR", "Livraison 24h"] },
              { icon: "layers", title: "Identite visuelle", description: "Logo, charte graphique et branding complet.", features: ["Logo vectoriel", "Guide de style", "Fichiers source"] },
              { icon: "star", title: "Design premium", description: "Covers, bannieres et visuels sur mesure.", features: ["Multi-formats", "Revisions incluses", "HD / 4K"] },
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
            title: "Realisations",
            subtitle: "Une selection de mes meilleurs travaux.",
            items: [
              { imageUrl: "", title: "Gaming Thumbnails", category: "YouTube", description: "Serie de thumbnails pour chaine gaming" },
              { imageUrl: "", title: "Brand Identity", category: "Branding", description: "Identite complete pour startup tech" },
              { imageUrl: "", title: "Cover Art", category: "Design", description: "Pochettes et visuels pour artistes" },
              { imageUrl: "", title: "Social Media Kit", category: "Marketing", description: "Templates pour reseaux sociaux" },
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
            title: "Avant / Apres",
            subtitle: "La transformation parle d'elle-meme.",
            items: [
              { beforeImageUrl: "", afterImageUrl: "", label: "Refonte thumbnail YouTube" },
              { beforeImageUrl: "", afterImageUrl: "", label: "Identite visuelle startup" },
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
              { name: "Alex Morand", role: "YouTuber", company: "450K abonnes", text: "Mes thumbnails ont triple mon CTR en 2 semaines. Travail incroyable !", rating: 5 },
              { name: "Julie Pham", role: "CEO", company: "Studio Nova", text: "L'identite visuelle est parfaite. Exactement ce qu'on cherchait.", rating: 5 },
              { name: "Marc Tissot", role: "Streamer", company: "Twitch Partner", text: "Rapide, creatif et professionnel. Je recommande a 100%.", rating: 5 },
            ],
          },
          style: s(),
          settings: {},
          visible: true,
        },
        {
          type: "cta-banner",
          content: {
            title: "Pret a booster vos visuels ?",
            description: "Obtenez des designs premium qui font la difference. Premiere commande livree en 24h.",
            ctaLabel: "Commander maintenant",
            blockLink: { type: "none" },
            secondaryLabel: "Voir les tarifs",
            secondaryBlockLink: { type: "none" },
          },
          style: s({ paddingTop: 60, paddingBottom: 60 }),
          settings: {},
          visible: true,
        },
        {
          type: "contact-premium",
          content: {
            title: "Parlons de votre projet",
            subtitle: "Decrivez votre besoin et je reviens vers vous sous 24h.",
            fields: [
              { label: "Nom", type: "text", required: true, placeholder: "Votre nom" },
              { label: "Email", type: "email", required: true, placeholder: "votre@email.com" },
              { label: "Type de projet", type: "select", required: true, options: ["Thumbnails", "Logo / Branding", "Cover art", "Pack complet", "Autre"] },
              { label: "Message", type: "textarea", required: true, placeholder: "Decrivez votre projet, vos references, votre budget..." },
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
            description: "Design premium pour createurs de contenu.",
            columns: [
              { title: "Services", links: [{ label: "Thumbnails" }, { label: "Branding" }, { label: "Design" }] },
              { title: "Liens", links: [{ label: "Portfolio" }, { label: "Tarifs" }, { label: "Contact" }] },
              { title: "Legal", links: [{ label: "Mentions legales" }, { label: "CGV" }] },
            ],
            copyright: "Tous droits reserves.",
            showSocials: true,
            socials: { instagram: "#", twitter: "#" },
          },
          style: s({ paddingTop: 60, paddingBottom: 40 }),
          settings: {},
          visible: true,
        },
      ],
    },
  ];
}

/* ═══════════════════════════════════════════════════════
   TEMPLATE 2 — PRODUCT (Violet / Tech)
   Cible: Developpeur, consultant, SaaS builder
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
            subtitle: "Developpeur fullstack specialise Next.js, React et Supabase. Du MVP a la scale.",
            ctaLabel: "Discuter de votre projet",
            blockLink: { type: "none" },
            trustLogos: [{ name: "Next.js" }, { name: "React" }, { name: "Supabase" }, { name: "Stripe" }, { name: "Vercel" }],
          },
          style: s({ paddingTop: 100, paddingBottom: 100 }),
          settings: {},
          visible: true,
        },
        {
          type: "services-premium",
          content: {
            title: "Services",
            subtitle: "Solutions techniques sur mesure pour votre business.",
            services: [
              { icon: "code", title: "Developpement Web", description: "Applications modernes, performantes et scalables.", features: ["Next.js / React", "API REST & GraphQL", "Base de donnees"] },
              { icon: "zap", title: "MVP & Prototypage", description: "De l'idee au produit en un temps record.", features: ["Livraison rapide", "Iterations agiles", "Deploy continu"] },
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
            subtitle: "Les technologies que je maitrise au quotidien.",
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
              { name: "Pro", price: "4 000", period: "par projet", description: "Application web complete", features: ["Jusqu'a 10 pages", "Backend + API", "Auth utilisateurs", "Dashboard admin", "Livraison 30 jours"], isPopular: true, ctaLabel: "Choisir" },
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
              { name: "Pierre Duval", role: "CTO", company: "Fintech Pro", text: "Code propre, architecture solide, et livre dans les temps. Exactement ce qu'on cherchait.", rating: 5 },
              { name: "Sarah Cohen", role: "Fondatrice", company: "SaaSify", text: "Notre MVP a ete pret en 3 semaines. Les premiers clients sont arrives le mois suivant.", rating: 5 },
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
            secondaryLabel: "Voir mes realisations",
            secondaryBlockLink: { type: "none" },
          },
          style: s({ paddingTop: 60, paddingBottom: 60 }),
          settings: {},
          visible: true,
        },
        {
          type: "contact-premium",
          content: {
            title: "Contact",
            subtitle: "Decrivez votre projet et je vous recontacte sous 24h.",
            fields: [
              { label: "Nom", type: "text", required: true, placeholder: "Votre nom" },
              { label: "Email", type: "email", required: true, placeholder: "votre@email.com" },
              { label: "Type de projet", type: "select", required: true, options: ["Site vitrine", "Application web", "MVP / SaaS", "Consulting", "Autre"] },
              { label: "Budget", type: "select", required: false, options: ["< 2 000 EUR", "2 000 - 5 000 EUR", "5 000 - 15 000 EUR", "> 15 000 EUR"] },
              { label: "Message", type: "textarea", required: true, placeholder: "Objectifs, contraintes, delais..." },
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
            description: "Developpement web et consulting technique.",
            columns: [
              { title: "Services", links: [{ label: "Developpement" }, { label: "MVP" }, { label: "Consulting" }] },
              { title: "Stack", links: [{ label: "Next.js" }, { label: "React" }, { label: "Supabase" }] },
              { title: "Legal", links: [{ label: "Mentions legales" }, { label: "CGV" }] },
            ],
            copyright: "Tous droits reserves.",
            showSocials: true,
            socials: { github: "#", linkedin: "#", twitter: "#" },
          },
          style: s({ paddingTop: 60, paddingBottom: 40 }),
          settings: {},
          visible: true,
        },
      ],
    },
  ];
}

/* ═══════════════════════════════════════════════════════
   TEMPLATE 3 — CINEMA (Cyan / Cinematic)
   Cible: Monteur video, real, post-prod, reels
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
            title: "Des videos qui marquent les esprits",
            subtitle: "Montage, motion design et post-production. Des videos premium pour YouTube, TikTok et Instagram.",
            primaryCtaLabel: "Voir le showreel",
            primaryBlockLink: { type: "none" },
            secondaryCtaLabel: "Demander un devis",
            secondaryBlockLink: { type: "none" },
            glowColor: CYAN,
          },
          style: s({ paddingTop: 100, paddingBottom: 100 }),
          settings: {},
          visible: true,
        },
        {
          type: "video-showcase",
          content: {
            title: "Showreel 2025",
            subtitle: "60 secondes pour decouvrir mon univers creatif.",
            videoUrl: "",
            stats: [
              { value: "200+", label: "Videos montees" },
              { value: "50M+", label: "Vues generees" },
              { value: "98%", label: "Satisfaction" },
            ],
            ctaLabel: "Voir mes realisations",
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
            title: "Avant / Apres",
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
            title: "Temoignages",
            testimonials: [
              { name: "Lucas Moreau", role: "YouTuber", company: "1.2M abonnes", text: "Mon monteur attitré depuis 2 ans. Chaque video est un chef-d'oeuvre.", rating: 5 },
              { name: "Emma Zhang", role: "Brand Manager", company: "Nike France", text: "Des reels qui ont explose nos stats. Creatif et rigoureux.", rating: 5 },
              { name: "Romain Perret", role: "Realisateur", company: "Independant", text: "Post-prod impeccable. Un vrai professionnel.", rating: 5 },
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
              { name: "Short / Reel", price: "150", period: "par video", description: "Format court (< 60s)", features: ["Montage dynamique", "Sous-titres", "Musique libre", "1 revision"], isPopular: false, ctaLabel: "Commander" },
              { name: "YouTube", price: "350", period: "par video", description: "Format long (5-20 min)", features: ["Montage complet", "Habillage", "Color grading", "Musique + SFX", "3 revisions"], isPopular: true, ctaLabel: "Commander" },
              { name: "Premium", price: "Sur devis", period: "", description: "Corporate / Pub / Clip", features: ["Montage + motion", "VFX", "Sound design", "Multi-format", "Revisions illimitees"], isPopular: false, ctaLabel: "Devis gratuit" },
            ],
          },
          style: s({ backgroundGradient: `linear-gradient(180deg, ${DARK3} 0%, #080818 100%)` }),
          settings: {},
          visible: true,
        },
        {
          type: "cta-banner",
          content: {
            title: "Votre prochaine video commence ici",
            description: "Envoyez vos rushes, je m'occupe du reste. Premier montage en 48h.",
            ctaLabel: "Envoyer mes rushes",
            blockLink: { type: "none" },
            secondaryLabel: "Voir les tarifs",
            secondaryBlockLink: { type: "none" },
          },
          style: s({ paddingTop: 60, paddingBottom: 60 }),
          settings: {},
          visible: true,
        },
        {
          type: "contact-premium",
          content: {
            title: "Contact",
            subtitle: "Decrivez votre projet video et je vous reponds sous 24h.",
            fields: [
              { label: "Nom", type: "text", required: true, placeholder: "Votre nom" },
              { label: "Email", type: "email", required: true, placeholder: "votre@email.com" },
              { label: "Type de montage", type: "select", required: true, options: ["YouTube long", "Short / Reel", "Corporate", "Clip / Pub", "Motion design", "Autre"] },
              { label: "Message", type: "textarea", required: true, placeholder: "Decrivez votre projet, vos references..." },
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
            description: "Montage video premium pour createurs de contenu.",
            columns: [
              { title: "Services", links: [{ label: "Montage YouTube" }, { label: "Shorts / Reels" }, { label: "Motion Design" }] },
              { title: "Liens", links: [{ label: "Showreel" }, { label: "Tarifs" }, { label: "Contact" }] },
              { title: "Legal", links: [{ label: "Mentions legales" }, { label: "CGV" }] },
            ],
            copyright: "Tous droits reserves.",
            showSocials: true,
            socials: { youtube: "#", instagram: "#", twitter: "#" },
          },
          style: s({ paddingTop: 60, paddingBottom: 40 }),
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
  name: "Brief Design / Creatif",
  description: "Formulaire de brief pour commande de design visuel.",
  fields: [
    { key: "project_title", label: "Titre du projet", type: "text", required: true, placeholder: "ex: Thumbnail pour ma video YouTube", target_kind: "order_field", target_ref: "notes" },
    { key: "briefing", label: "Briefing creatif", type: "textarea", required: true, placeholder: "Style, couleurs, elements a inclure...", target_kind: "order_field", target_ref: "briefing" },
    { key: "deadline", label: "Deadline souhaitee", type: "date", required: false, target_kind: "order_field", target_ref: "deadline" },
    { key: "resources", label: "Fichiers / references", type: "file", required: false, multiple: true, target_kind: "order_field", target_ref: "resources" },
    { key: "style_type", label: "Type de creation", type: "select", required: true, options: ["Thumbnail", "Logo", "Cover art", "Pack branding", "Autre"], target_kind: "order_field", target_ref: "category" },
  ],
};

const PRODUCT_BRIEF: TemplateBriefDefinition = {
  name: "Brief Projet Dev",
  description: "Formulaire de cadrage pour un projet de developpement.",
  fields: [
    { key: "project_type", label: "Type de projet", type: "select", required: true, options: ["Site vitrine", "Application web", "MVP / SaaS", "API / Backend", "Consulting", "Autre"], target_kind: "order_field", target_ref: "category" },
    { key: "briefing", label: "Description du besoin", type: "textarea", required: true, placeholder: "Objectifs, fonctionnalites, contraintes...", target_kind: "order_field", target_ref: "briefing" },
    { key: "stack", label: "Stack souhaitee", type: "text", required: false, placeholder: "ex: Next.js, Supabase..." },
    { key: "deadline", label: "Delai souhaite", type: "date", required: false, target_kind: "order_field", target_ref: "deadline" },
    { key: "resources", label: "Docs / Figma / Repo", type: "file", required: false, multiple: true, target_kind: "order_field", target_ref: "resources" },
    { key: "budget", label: "Budget estimatif", type: "select", required: false, options: ["< 2 000 EUR", "2 000 - 5 000 EUR", "5 000 - 15 000 EUR", "> 15 000 EUR"] },
  ],
};

const CINEMA_BRIEF: TemplateBriefDefinition = {
  name: "Brief Montage Video",
  description: "Formulaire de brief pour montage video.",
  fields: [
    { key: "montage_type", label: "Type de montage", type: "select", required: true, options: ["YouTube long", "YouTube short", "Reel / TikTok", "Corporate", "Clip / Pub", "Motion design", "Autre"], target_kind: "order_field", target_ref: "category" },
    { key: "format", label: "Format final", type: "select", required: true, options: ["16:9 (YouTube)", "9:16 (Short/Reel)", "1:1 (Instagram)", "Custom"] },
    { key: "deadline", label: "Deadline", type: "date", required: false, target_kind: "order_field", target_ref: "deadline" },
    { key: "resources", label: "Rushes / fichiers", type: "file", required: false, multiple: true, target_kind: "order_field", target_ref: "resources" },
    { key: "briefing", label: "Briefing detaille", type: "textarea", required: true, placeholder: "Style, rythme, musique, references...", target_kind: "order_field", target_ref: "briefing" },
  ],
};

/* ═══════════════════════════════════════════════════════
   REGISTRY
   ═══════════════════════════════════════════════════════ */

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "creator",
    name: "Creator",
    description: "Template percutant pour designers visuels et createurs.",
    audience: "Designers, thumbnails, branding",
    bullets: ["Hero avec glow", "Portfolio masonry", "Services premium", "Avant/Apres", "Contact premium"],
    gradient: "from-orange-600 to-orange-400",
    theme: {
      primaryColor: ORANGE, secondaryColor: "#FF8F5E",
      backgroundColor: DARK1, surfaceColor: "#141419", textColor: "#ffffff", mutedTextColor: "#999999", borderColor: "#ffffff15",
      fontFamily: "'Space Grotesk', sans-serif", headingFont: "'Playfair Display', serif",
      borderRadius: "rounded", shadow: "md", mode: "dark",
      containerWidth: "default", buttonRadius: "full",
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
      copyright: "Tous droits reserves.",
    },
    pages: creatorPages(),
    brief: CREATOR_BRIEF,
  },
  {
    id: "product",
    name: "Product",
    description: "Template technique pour developpeurs et consultants.",
    audience: "Devs freelance, SaaS builders",
    bullets: ["Hero avec mesh", "Tech stack", "Pricing modern", "Temoignages dark", "Contact premium"],
    gradient: "from-violet-600 to-violet-400",
    theme: {
      primaryColor: VIOLET, secondaryColor: "#9F67FF",
      backgroundColor: DARK2, surfaceColor: "#111113", textColor: "#ffffff", mutedTextColor: "#999999", borderColor: "#ffffff15",
      fontFamily: "'Space Grotesk', sans-serif", headingFont: "'Space Grotesk', sans-serif",
      borderRadius: "rounded", shadow: "sm", mode: "dark",
      containerWidth: "default", buttonRadius: "md",
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
      copyright: "Tous droits reserves.",
    },
    pages: productPages(),
    brief: PRODUCT_BRIEF,
  },
  {
    id: "cinema",
    name: "Cinema",
    description: "Template cinematique pour monteurs video et motion designers.",
    audience: "Monteurs, motion designers, post-prod",
    bullets: ["Hero glow cinematic", "Showreel video", "Avant/Apres", "Pricing formules", "Contact premium"],
    gradient: "from-cyan-500 to-cyan-300",
    theme: {
      primaryColor: CYAN, secondaryColor: "#33DFFF",
      backgroundColor: DARK3, surfaceColor: "#0D0D1A", textColor: "#ffffff", mutedTextColor: "#999999", borderColor: "#ffffff15",
      fontFamily: "'Sora', sans-serif", headingFont: "'Outfit', sans-serif",
      borderRadius: "rounded", shadow: "lg", mode: "dark",
      containerWidth: "wide", buttonRadius: "sm",
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
      copyright: "Tous droits reserves.",
    },
    pages: cinemaPages(),
    brief: CINEMA_BRIEF,
  },
];

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
