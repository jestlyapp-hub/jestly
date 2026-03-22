// ═══════════════════════════════════════════════════════════════════
// Adaptive Guide — Adjusts experience based on frustration level
//
// SAFE ADDITIVE: No existing signatures modified.
// This module sits ON TOP of the existing guide system.
//
// 3 modes:
// - calm    (score 0-2): Full pedagogical guide
// - assisted (score 3-4): Shorter texts, faster hints
// - rescue  (score ≥5):  Ultra-direct, minimal text, fast help
// ═══════════════════════════════════════════════════════════════════

import { getFrustrationScore } from "./frustration";

// ── Experience Mode ──────────────────────────────────────────────

export type GuideExperienceMode = "calm" | "assisted" | "rescue";

export function getGuideExperienceMode(): GuideExperienceMode {
  const score = getFrustrationScore();
  if (score >= 5) return "rescue";
  if (score >= 3) return "assisted";
  return "calm";
}

// ── Adaptive Copy ────────────────────────────────────────────────
// Steps can define copy variants per mode.
// If a variant doesn't exist, falls back: rescue → assisted → calm.

export interface AdaptiveCopy {
  title?: string;
  body?: string;
  why?: string;
  ctaLabel?: string;
}

export type AdaptiveCopyMap = Partial<Record<GuideExperienceMode, AdaptiveCopy>>;

/**
 * Resolve the best copy for the current mode.
 * Falls back through: rescue → assisted → calm → original.
 */
export function resolveAdaptiveCopy(
  copyMap: AdaptiveCopyMap | undefined,
  mode: GuideExperienceMode,
): AdaptiveCopy | null {
  if (!copyMap) return null;
  const fallbackOrder: GuideExperienceMode[] =
    mode === "rescue" ? ["rescue", "assisted", "calm"] :
    mode === "assisted" ? ["assisted", "calm"] :
    ["calm"];

  for (const m of fallbackOrder) {
    if (copyMap[m]) return copyMap[m]!;
  }
  return null;
}

// ── Adaptive Hint Delay ──────────────────────────────────────────
// How long to wait before showing a contextual hint.

export function getAdaptiveHintDelay(): number {
  const mode = getGuideExperienceMode();
  switch (mode) {
    case "rescue": return 3500;
    case "assisted": return 6000;
    case "calm": return 9000;
  }
}

// ── Educational Weight ───────────────────────────────────────────
// Whether an educational step should be shortened in the current mode.

export type EducationalWeight = "low" | "medium" | "high";

/**
 * Should an educational step be shortened?
 * In rescue mode, high-weight educational steps get simplified.
 * In assisted mode, only high-weight steps get slightly shortened.
 * In calm mode, everything is shown fully.
 */
export function shouldShortenEducational(
  weight: EducationalWeight,
  mode?: GuideExperienceMode,
): boolean {
  const m = mode ?? getGuideExperienceMode();
  if (m === "rescue") return weight === "high" || weight === "medium";
  if (m === "assisted") return weight === "high";
  return false;
}

// ── Adaptive Copy Registry ───────────────────────────────────────
// Pre-defined copy variants for key steps.
// Only steps that benefit from adaptation are listed here.
// All others use their original text unchanged.

export const STEP_COPY_VARIANTS: Record<string, AdaptiveCopyMap> = {
  // ── Builder: select product ────────────────────────────────────
  builder_select_product: {
    calm: {
      title: "Ajoutez votre produit au bloc",
      body: "Dans la liste à droite, cliquez sur le produit que vous avez créé.\nUne fois sélectionné, il apparaîtra automatiquement sur votre site.",
      why: "S'il n'apparaît pas, utilisez le champ de recherche juste au-dessus.",
    },
    assisted: {
      title: "Ajoutez votre produit",
      body: "Cliquez sur votre produit dans la liste à droite.",
    },
    rescue: {
      title: "Cliquez sur votre produit",
      body: "Sélectionnez-le dans la liste pour continuer.",
    },
  },

  // ── Create site: choose template ───────────────────────────────
  create_site_choose: {
    calm: {
      title: "Choisissez votre point de départ",
      body: "Cliquez sur le template qui vous plaît.\nTout sera modifiable ensuite.",
    },
    assisted: {
      title: "Choisissez un template",
      body: "Cliquez sur un template pour créer votre site.",
    },
    rescue: {
      title: "Cliquez sur un template",
      body: "N'importe lequel. Tout est modifiable ensuite.",
    },
  },

  // ── Publish site ───────────────────────────────────────────────
  pub_click: {
    calm: {
      title: "Cliquez ici pour publier",
      body: "Cliquez sur « Publier » pour mettre votre site en ligne.\nVotre produit sera commandable avec le brief associé.",
    },
    assisted: {
      title: "Publiez votre site",
      body: "Cliquez sur Publier pour le rendre accessible.",
    },
    rescue: {
      title: "Cliquez sur Publier",
      body: "Votre site sera en ligne immédiatement.",
    },
  },

  // ── Builder intro ──────────────────────────────────────────────
  builder_intro: {
    calm: {
      title: "Ajouter un bloc de vente produit",
      body: "Votre produit est créé, mais il n'est pas encore visible sur votre site.\n\nProduit = la donnée commerciale (nom, prix, description).\nBloc de vente = l'affichage sur la page.\n\nOn va ajouter un bloc de vente à votre site, puis y sélectionner le produit que vous venez de créer.",
    },
    assisted: {
      title: "Affichons votre produit",
      body: "On va ajouter un bloc de vente puis y mettre votre produit.",
    },
    rescue: {
      title: "Ajoutons le produit au site",
      body: "Quelques clics et votre produit sera visible.",
    },
  },

  // ── Welcome ────────────────────────────────────────────────────
  create_site_intro: {
    calm: {
      title: "Bienvenue sur Jestly !",
      body: "Nous allons créer votre système de vente en ligne en quelques étapes.\n\nD'abord, créons votre site. C'est la base de tout le reste : il accueillera vos offres, vos formulaires et vos pages.",
    },
    assisted: {
      title: "Bienvenue !",
      body: "Créons votre site en quelques étapes.",
    },
    rescue: {
      title: "C'est parti",
      body: "Créons votre site.",
    },
  },

  // ── Site: add first block ──────────────────────────────────────
  site_add_block_cta: {
    assisted: {
      title: "Ajoutez un bloc",
      body: "Cliquez sur « + Ajouter un bloc ».",
    },
    rescue: {
      title: "Cliquez ici",
      body: "Ajoutez un bloc à votre page.",
    },
  },

  site_pick_block: {
    assisted: {
      title: "Choisissez un bloc",
      body: "Cliquez sur n'importe quel bloc dans le catalogue.",
    },
    rescue: {
      title: "Cliquez sur un bloc",
      body: "N'importe lequel.",
    },
  },
};

/**
 * Get the adapted copy for a step, falling back to original if no variant exists.
 */
export function getStepCopy(
  stepId: string,
  originalTitle: string,
  originalBody: string,
  originalWhy?: string,
  originalCtaLabel?: string,
): { title: string; body: string; why?: string; ctaLabel?: string } {
  const mode = getGuideExperienceMode();
  const variants = STEP_COPY_VARIANTS[stepId];
  const resolved = resolveAdaptiveCopy(variants, mode);

  if (!resolved) {
    return { title: originalTitle, body: originalBody, why: originalWhy, ctaLabel: originalCtaLabel };
  }

  return {
    title: resolved.title ?? originalTitle,
    body: resolved.body ?? originalBody,
    why: resolved.why ?? (mode === "rescue" ? undefined : originalWhy), // Drop why in rescue
    ctaLabel: resolved.ctaLabel ?? originalCtaLabel,
  };
}
