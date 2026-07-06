/**
 * Miroir TypeScript des tokens ECOM premium (src/styles/ecom-premium.css).
 * Sert au JS qui ne peut pas lire les variables CSS : couleurs de séries
 * Recharts, calculs de jauge, durées d'animation programmatiques.
 *
 * RÈGLE : ne jamais réécrire un hex / une durée ailleurs — importer d'ici.
 * Toute valeur ci-dessous DOIT rester synchrone avec le fichier CSS.
 */

export const ecomColor = {
  surface0: "#f0eff5",
  surface1: "#ffffff",
  surface2: "#ffffff",
  surfaceSunken: "#faf9fc",
  cardBorder: "#E5E3F0",

  brandViolet: "#7C3AED",
  brandVioletHover: "#6D28D9",
  violetLight: "#EDE9FE",
  violetMid: "#A78BFA",
  navy: "#1a1535",

  pos: "#0F9D6B",
  posSoft: "#E6F5EF",
  neg: "#E5484D",
  negSoft: "#FDECEC",
  warn: "#E8A33D",
  warnSoft: "#FBF1E3",
  muted: "#6B6880",
  mutedSoft: "#F3F2F7",
} as const;

/** Couleurs de canal figées — la SEULE source pour chips / donuts / barres. */
export const channelColor = {
  google_ads: "#7C3AED",
  seo: "#0F9D6B",
  pinterest: "#E60023",
  direct: "#94919F",
  pixel: "#3B82F6",
  survey: "#E8A33D",
  ghost: "#C4C1D0",
  other: "#8B5CF6",
  unattributed: "#C4C1D0",
} as const;

/** Durées en ms (mêmes valeurs que les variables CSS --ecom-t-*). */
export const ecomDuration = {
  fast: 120,
  base: 180,
  slow: 320,
  hero: 600,
} as const;

export const ecomEase = {
  out: "cubic-bezier(.22,1,.36,1)",
  inOut: "cubic-bezier(.65,0,.35,1)",
} as const;

/** Grille des graphes (horizontale seule, très discrète). */
export const chartGrid = "rgba(26,21,53,.06)";

export type ChannelColorKey = keyof typeof channelColor;
