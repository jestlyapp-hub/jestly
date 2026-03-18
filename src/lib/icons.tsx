import type { ReactNode } from "react";

export interface IconDef {
  key: string;
  label: string;
  keywords: string[];
  svg: ReactNode;
}

function I({ d, children }: { d?: string; children?: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d ? <path d={d} /> : children}
    </svg>
  );
}

export const ICON_REGISTRY: IconDef[] = [
  // --- Video / Media ---
  { key: "vidéo", label: "Vidéo", keywords: ["vidéo", "film", "clip"], svg: <I><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></I> },
  { key: "camera", label: "Camera", keywords: ["camera", "photo", "picture"], svg: <I><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></I> },
  { key: "film", label: "Film", keywords: ["film", "cinema", "montage", "movie"], svg: <I><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /><line x1="17" y1="17" x2="22" y2="17" /></I> },
  { key: "play", label: "Play", keywords: ["play", "lecture", "lancer"], svg: <I><polygon points="5 3 19 12 5 21 5 3" /></I> },
  { key: "pause", label: "Pause", keywords: ["pause", "stop"], svg: <I><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></I> },
  { key: "music", label: "Musique", keywords: ["music", "musique", "son", "audio"], svg: <I><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></I> },
  { key: "mic", label: "Micro", keywords: ["micro", "mic", "podcast", "voix"], svg: <I><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></I> },
  { key: "image", label: "Image", keywords: ["image", "photo", "picture", "galerie"], svg: <I><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></I> },

  // --- Design / Creative ---
  { key: "palette", label: "Palette", keywords: ["palette", "design", "couleur", "art"], svg: <I><circle cx="13.5" cy="6.5" r="1.5" /><circle cx="17.5" cy="10.5" r="1.5" /><circle cx="8.5" cy="7.5" r="1.5" /><circle cx="6.5" cy="12.5" r="1.5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.38-.15-.74-.39-1.01-.24-.27-.39-.63-.39-1.01 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.17-4.49-9-10-9z" /></I> },
  { key: "pen-tool", label: "Crayon", keywords: ["crayon", "pen", "dessin", "ecrire"], svg: <I><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" /></I> },
  { key: "edit", label: "Edit", keywords: ["edit", "modifier", "stylo"], svg: <I><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></I> },
  { key: "wand", label: "Baguette", keywords: ["wand", "baguette", "magic", "magie", "sparkle"], svg: <I><path d="M15 4V2" /><path d="M15 16v-2" /><path d="M8 9h2" /><path d="M20 9h2" /><path d="M17.8 11.8L19 13" /><path d="M15 9h0" /><path d="M17.8 6.2L19 5" /><path d="M11 6.2L9.7 5" /><path d="M11 11.8L9.7 13" /><path d="M3 21l9-9" /></I> },
  { key: "layers", label: "Calques", keywords: ["layers", "calques", "stack", "empiler"], svg: <I><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></I> },

  // --- Tech / Dev ---
  { key: "code", label: "Code", keywords: ["code", "dev", "développeur", "programmation"], svg: <I><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></I> },
  { key: "globe", label: "Globe", keywords: ["globe", "web", "site", "monde", "internet"], svg: <I><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></I> },
  { key: "smartphone", label: "Smartphone", keywords: ["smartphone", "mobile", "téléphone", "phone"], svg: <I><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></I> },
  { key: "monitor", label: "Desktop", keywords: ["desktop", "écran", "monitor", "ordinateur"], svg: <I><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></I> },
  { key: "tablet", label: "Tablette", keywords: ["tablet", "tablette", "ipad"], svg: <I><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></I> },
  { key: "terminal", label: "Terminal", keywords: ["terminal", "console", "cli", "commande"], svg: <I><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></I> },
  { key: "settings", label: "Paramètres", keywords: ["settings", "paramètres", "engrenage", "config"], svg: <I><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></I> },

  // --- Business / Commerce ---
  { key: "zap", label: "Éclair", keywords: ["zap", "éclair", "lightning", "rapide", "énergie"], svg: <I><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></I> },
  { key: "target", label: "Cible", keywords: ["target", "cible", "objectif", "but"], svg: <I><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></I> },
  { key: "rocket", label: "Fusée", keywords: ["rocket", "fusée", "lancement", "startup"], svg: <I><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></I> },
  { key: "briefcase", label: "Mallette", keywords: ["briefcase", "mallette", "business", "travail", "pro"], svg: <I><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></I> },
  { key: "dollar-sign", label: "Paiement", keywords: ["dollar", "paiement", "argent", "vente", "prix"], svg: <I><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></I> },
  { key: "shopping-cart", label: "Vente", keywords: ["shopping", "vente", "panier", "achat", "ecommerce"], svg: <I><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></I> },
  { key: "trending-up", label: "Croissance", keywords: ["trending", "croissance", "analytics", "hausse", "chart"], svg: <I><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></I> },
  { key: "bar-chart", label: "Statistiques", keywords: ["bar", "chart", "stats", "statistiques", "analytics", "graphique"], svg: <I><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></I> },
  { key: "pie-chart", label: "Répartition", keywords: ["pie", "chart", "camembert", "répartition"], svg: <I><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></I> },
  { key: "funnel", label: "Funnel", keywords: ["funnel", "entonnoir", "conversion", "filtre"], svg: <I><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></I> },

  // --- Communication ---
  { key: "mail", label: "Email", keywords: ["mail", "email", "message", "courrier", "enveloppe"], svg: <I><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></I> },
  { key: "message-circle", label: "Message", keywords: ["message", "chat", "bulle", "conversation", "commentaire"], svg: <I><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></I> },
  { key: "phone", label: "Téléphone", keywords: ["phone", "téléphone", "appel", "contact"], svg: <I><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></I> },
  { key: "send", label: "Envoyer", keywords: ["send", "envoyer", "avion", "soumettre"], svg: <I><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></I> },

  // --- Organisation / Productivite ---
  { key: "calendar", label: "Calendrier", keywords: ["calendar", "calendrier", "date", "planning", "agenda"], svg: <I><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></I> },
  { key: "check-circle", label: "Checklist", keywords: ["check", "checklist", "valide", "done", "termine", "ok"], svg: <I><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></I> },
  { key: "clipboard", label: "Presse-papier", keywords: ["clipboard", "presse-papier", "copier", "tache", "liste"], svg: <I><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></I> },
  { key: "clock", label: "Horloge", keywords: ["clock", "horloge", "temps", "durée", "delai"], svg: <I><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></I> },
  { key: "folder", label: "Dossier", keywords: ["folder", "dossier", "fichier", "repertoire"], svg: <I><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></I> },
  { key: "search", label: "Recherche", keywords: ["search", "recherche", "loupe", "chercher", "seo"], svg: <I><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></I> },

  // --- People ---
  { key: "user", label: "Utilisateur", keywords: ["user", "utilisateur", "personne", "profil", "compte"], svg: <I><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></I> },
  { key: "users", label: "Équipe", keywords: ["users", "équipe", "groupe", "team", "personnes"], svg: <I><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></I> },
  { key: "crown", label: "Premium", keywords: ["crown", "couronne", "premium", "vip", "roi"], svg: <I><path d="M2 4l3 12h14l3-12-5 4-5-4-5 4-5-4z" /><line x1="2" y1="20" x2="22" y2="20" /></I> },

  // --- Misc ---
  { key: "star", label: "Étoile", keywords: ["star", "étoile", "favori", "note", "avis"], svg: <I><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></I> },
  { key: "heart", label: "Coeur", keywords: ["heart", "coeur", "like", "amour", "favori"], svg: <I><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></I> },
  { key: "thumbs-up", label: "Pouce", keywords: ["thumbs", "pouce", "like", "ok", "valider"], svg: <I><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></I> },
  { key: "shield", label: "Bouclier", keywords: ["shield", "bouclier", "sécurité", "protection", "confiance"], svg: <I><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></I> },
  { key: "sparkles", label: "Étincelles", keywords: ["sparkles", "étincelles", "magie", "ia", "ai", "nouveau"], svg: <I><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" /><path d="M19 14l.9 3.1L23 18l-3.1.9L19 22l-.9-3.1L15 18l3.1-.9L19 14z" /></I> },
  { key: "box", label: "Colis", keywords: ["box", "colis", "paquet", "livraison", "produit"], svg: <I><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></I> },
  { key: "upload", label: "Upload", keywords: ["upload", "télécharger", "envoyer", "importer"], svg: <I><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></I> },
  { key: "download", label: "Download", keywords: ["download", "télécharger", "recevoir", "exporter"], svg: <I><polyline points="8 17 12 21 16 17" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></I> },
  { key: "award", label: "Trophée", keywords: ["award", "trophée", "prix", "medaille", "récompense"], svg: <I><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></I> },
  { key: "eye", label: "Vue", keywords: ["eye", "oeil", "vue", "voir", "visibilité"], svg: <I><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></I> },
  { key: "lock", label: "Verrou", keywords: ["lock", "verrou", "sécurité", "privé", "mot de passe"], svg: <I><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></I> },
  { key: "link", label: "Lien", keywords: ["link", "lien", "url", "chaine"], svg: <I><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></I> },
  { key: "map-pin", label: "Localisation", keywords: ["map", "pin", "localisation", "lieu", "adresse", "gps"], svg: <I><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></I> },
  { key: "compass", label: "Boussole", keywords: ["compass", "boussole", "direction", "navigation", "explorer"], svg: <I><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></I> },
  { key: "headphones", label: "Casque", keywords: ["headphones", "casque", "audio", "écoute", "musique"], svg: <I><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></I> },
  { key: "wifi", label: "Connexion", keywords: ["wifi", "connexion", "réseau", "internet", "signal"], svg: <I><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></I> },
  { key: "gift", label: "Cadeau", keywords: ["gift", "cadeau", "offre", "bonus", "promo"], svg: <I><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></I> },
  { key: "coffee", label: "Café", keywords: ["coffee", "café", "pause", "detente"], svg: <I><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></I> },
];

const iconMap = new Map(ICON_REGISTRY.map((i) => [i.key, i]));

/**
 * Get an icon's SVG by key. Falls back to "star" if not found.
 */
export function getIcon(key: string): ReactNode {
  return iconMap.get(key)?.svg ?? iconMap.get("star")!.svg;
}

/**
 * Get icon label by key.
 */
export function getIconLabel(key: string): string {
  return iconMap.get(key)?.label ?? key;
}
