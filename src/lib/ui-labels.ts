/**
 * ui-labels.ts — Centralized French UI labels for Jestly
 *
 * Purpose:
 * - Single source of truth for commonly used labels
 * - Prevents typos and missing accents on critical strings
 * - Easy to audit and maintain
 *
 * Usage:
 *   import { L } from "@/lib/ui-labels";
 *   <button>{L.create}</button>
 *   <h1>{L.settings}</h1>
 */

export const L = {
  // ── Navigation ──
  settings: "Paramètres",
  dashboard: "Tableau de bord",
  clients: "Clients",
  orders: "Commandes",
  products: "Produits",
  tasks: "Tâches",
  calendar: "Calendrier",
  invoicing: "Facturation",
  analytics: "Analytics",
  websites: "Sites web",
  support: "Support",
  guide: "Guide",

  // ── Actions ──
  create: "Créer",
  edit: "Modifier",
  delete: "Supprimer",
  save: "Sauvegarder",
  cancel: "Annuler",
  confirm: "Confirmer",
  download: "Télécharger",
  upload: "Téléverser",
  search: "Rechercher",
  filter: "Filtrer",
  publish: "Publier",
  archive: "Archiver",
  restore: "Restaurer",
  duplicate: "Dupliquer",
  send: "Envoyer",
  preview: "Aperçu",
  close: "Fermer",

  // ── Status ──
  created: "Créé",
  modified: "Modifié",
  deleted: "Supprimé",
  published: "Publié",
  archived: "Archivé",
  paid: "Payé",
  sent: "Envoyé",
  delivered: "Livré",
  completed: "Terminé",
  validated: "Validé",
  pending: "En attente",
  inProgress: "En cours",
  draft: "Brouillon",

  // ── Labels ──
  category: "Catégorie",
  deadline: "Échéance",
  event: "Événement",
  task: "Tâche",
  subtask: "Sous-tâche",
  template: "Modèle",
  identity: "Identité",
  security: "Sécurité",
  team: "Équipe",
  activity: "Activité",
  recentActivity: "Activité récente",
  results: "Résultats",
  searchResults: "Résultats de recherche",
  phone: "Téléphone",
  update: "Mise à jour",
  step: "Étape",
  state: "État",
  receipt: "Reçu",
  number: "Numéro",
  success: "Réussite",
  testimonial: "Témoignage",
  testimonials: "Témoignages",
  achievement: "Réalisation",

  // ── CTA ──
  startFree: "Commencer gratuitement",
  viewDemo: "Voir la démo",
  readyIn2Min: "Prêt en 2 minutes",
  noCommitment: "Aucun engagement",
  freeToStart: "Gratuit pour commencer",

  // ── Messages ──
  savedSuccess: "Sauvegardé avec succès",
  deleteConfirm: "Êtes-vous sûr de vouloir supprimer ?",
  noData: "Aucune donnée",
  loading: "Chargement...",
  error: "Une erreur est survenue",
} as const;

/**
 * Alias: use `t.settings` or `L.settings` — same thing.
 */
export const t = L;
