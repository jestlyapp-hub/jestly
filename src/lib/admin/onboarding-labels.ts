/**
 * Labels FR + couleurs pour les réponses du questionnaire d'inscription.
 * Utilisé dans l'admin pour afficher des badges et filtres lisibles.
 */

export const DISCOVERY_SOURCE_LABELS: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  google: "Google",
  recommendation: "Recommandation",
  other: "Autre",
};

export const FREELANCE_TYPE_LABELS: Record<string, string> = {
  videaste: "Vidéaste",
  graphiste: "Graphiste",
  motion_designer: "Motion Designer",
  photographe: "Photographe",
  thumbnail_designer: "Miniaturiste",
  community_manager: "Community Manager",
  web_designer: "Web Designer",
  developpeur: "Développeur",
  other: "Autre",
};

export const FREELANCE_TYPE_COLORS: Record<string, string> = {
  videaste: "bg-red-50 text-red-600 border-red-200",
  graphiste: "bg-violet-50 text-violet-600 border-violet-200",
  motion_designer: "bg-blue-50 text-blue-600 border-blue-200",
  photographe: "bg-amber-50 text-amber-600 border-amber-200",
  thumbnail_designer: "bg-pink-50 text-pink-600 border-pink-200",
  community_manager: "bg-cyan-50 text-cyan-600 border-cyan-200",
  web_designer: "bg-indigo-50 text-indigo-600 border-indigo-200",
  developpeur: "bg-emerald-50 text-emerald-600 border-emerald-200",
  other: "bg-gray-50 text-gray-600 border-gray-200",
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Débutant",
  less_1y: "< 1 an",
  "1_3y": "1-3 ans",
  "3_5y": "3-5 ans",
  "5y_plus": "5+ ans",
};

export const CLIENT_VOLUME_LABELS: Record<string, string> = {
  "0": "Aucun client",
  "1_5": "1-5 clients",
  "6_15": "6-15 clients",
  "16_50": "16-50 clients",
  "50_plus": "50+ clients",
};

export const MAIN_GOAL_LABELS: Record<string, string> = {
  save_time: "Gagner du temps",
  organize_clients: "Organiser ses clients",
  automate_billing: "Automatiser la facturation",
  create_site: "Créer un site vitrine",
  structure_business: "Structurer son activité",
  other: "Autre",
};

export function getOnboardingLabel(field: string, value: string | null | undefined): string {
  if (!value) return "—";
  const maps: Record<string, Record<string, string>> = {
    discovery_source: DISCOVERY_SOURCE_LABELS,
    freelance_type: FREELANCE_TYPE_LABELS,
    freelance_experience: EXPERIENCE_LABELS,
    client_volume: CLIENT_VOLUME_LABELS,
    main_goal: MAIN_GOAL_LABELS,
  };
  return maps[field]?.[value] ?? value;
}
