/* ═══════════════════════════════════════════════════════════
   Jestly — Global Search Utilities V2
   Universal search engine: types, config, scoring, parsing
   ═══════════════════════════════════════════════════════════ */

/* ─── Result types ─── */

export type EntityType =
  | "page"
  | "client"
  | "order"
  | "task"
  | "event"
  | "project"
  | "product"
  | "brief"
  | "invoice"
  | "file"
  | "lead"
  | "note";

export interface SearchResult {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: string[];
  status?: string;
  date?: string;
  amount?: number;
  href: string;
  archived?: boolean;
  priority?: string;
  tags?: string[];
  score?: number;
  /** Extra metadata for display */
  meta?: Record<string, string>;
}

/* ─── Entity config — SINGLE SOURCE OF TRUTH ─── */

export interface EntityTypeConfig {
  label: string;
  labelPlural: string;
  color: string;
  bgColor: string;
  /** Default icon key (matches EntityIcon) */
  iconKey: string;
}

export const entityConfig: Record<EntityType, EntityTypeConfig> = {
  page:    { label: "Page",       labelPlural: "Pages",       color: "#5A5A58", bgColor: "#F7F7F5", iconKey: "page" },
  client:  { label: "Client",     labelPlural: "Clients",     color: "#2563EB", bgColor: "#EFF6FF", iconKey: "client" },
  order:   { label: "Commande",   labelPlural: "Commandes",   color: "#4F46E5", bgColor: "#EEF2FF", iconKey: "order" },
  task:    { label: "Tâche",      labelPlural: "Tâches",      color: "#7C3AED", bgColor: "#F5F3FF", iconKey: "task" },
  event:   { label: "Événement",  labelPlural: "Calendrier",  color: "#0891B2", bgColor: "#ECFEFF", iconKey: "event" },
  project: { label: "Projet",     labelPlural: "Projets",     color: "#059669", bgColor: "#ECFDF5", iconKey: "project" },
  product: { label: "Produit",    labelPlural: "Produits",    color: "#EA580C", bgColor: "#FFF7ED", iconKey: "product" },
  brief:   { label: "Brief",      labelPlural: "Briefs",      color: "#D946EF", bgColor: "#FDF4FF", iconKey: "brief" },
  invoice: { label: "Facture",    labelPlural: "Factures",    color: "#16A34A", bgColor: "#F0FDF4", iconKey: "invoice" },
  file:    { label: "Fichier",    labelPlural: "Fichiers",    color: "#6B7280", bgColor: "#F3F4F6", iconKey: "file" },
  lead:    { label: "Lead",       labelPlural: "Leads",       color: "#F59E0B", bgColor: "#FFFBEB", iconKey: "lead" },
  note:    { label: "Note",       labelPlural: "Notes",       color: "#8B5CF6", bgColor: "#F5F3FF", iconKey: "note" },
};

/* ─── Status labels FR ─── */

export const statusLabels: Record<string, string> = {
  // Orders
  new: "Nouveau",
  brief_received: "Brief reçu",
  in_progress: "En cours",
  in_review: "En révision",
  validated: "Validé",
  delivered: "Livré",
  invoiced: "Facturé",
  paid: "Payé",
  cancelled: "Annulé",
  refunded: "Remboursé",
  dispute: "Litige",
  // Tasks
  todo: "À faire",
  done: "Terminé",
  completed: "Terminé",
  // General
  active: "Actif",
  inactive: "Inactif",
  archived: "Archivé",
  draft: "Brouillon",
  pending: "En attente",
  overdue: "En retard",
  sent: "Envoyé",
  // Products
  lead_magnet: "Lead magnet",
};

/* ─── Priority labels FR ─── */

export const priorityLabels: Record<string, string> = {
  low: "Basse",
  normal: "Normale",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente",
};

/* ─── Type display order — determines group ordering ─── */

export const typeDisplayOrder: EntityType[] = [
  "page",
  "client",
  "project",
  "order",
  "task",
  "invoice",
  "product",
  "event",
  "file",
  "lead",
  "brief",
  "note",
];

/* ─── Pages / Navigation items ─── */

export interface PageItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
}

export const navigationPages: PageItem[] = [
  { id: "page-dashboard",   title: "Dashboard",        subtitle: "Tableau de bord principal",  href: "/dashboard",    keywords: ["accueil", "home", "tableau de bord", "overview"] },
  { id: "page-commandes",   title: "Commandes",        subtitle: "Gérer les commandes",        href: "/commandes",    keywords: ["orders", "ventes", "sales", "achats", "purchases"] },
  { id: "page-clients",     title: "Clients",          subtitle: "Liste des clients",          href: "/clients",      keywords: ["customers", "contacts", "carnet", "crm"] },
  { id: "page-projets",     title: "Projets",          subtitle: "Projets créatifs",           href: "/projets",      keywords: ["projects", "workspace", "créatif"] },
  { id: "page-produits",    title: "Produits / Services", subtitle: "Catalogue de services",   href: "/produits",     keywords: ["services", "prestations", "offres", "shop", "boutique", "catalogue"] },
  { id: "page-briefs",      title: "Briefs",           subtitle: "Modèles de brief",           href: "/briefs",       keywords: ["questionnaires", "templates", "formulaires"] },
  { id: "page-calendrier",  title: "Calendrier",       subtitle: "Agenda et événements",       href: "/calendrier",   keywords: ["agenda", "planning", "events", "rdv", "rendez-vous", "calendar"] },
  { id: "page-taches",      title: "Tâches",           subtitle: "To-do et suivi",             href: "/taches",       keywords: ["tasks", "todo", "to-do", "checklist", "à faire"] },
  { id: "page-facturation", title: "Facturation",      subtitle: "Factures et paiements",      href: "/facturation",  keywords: ["invoices", "factures", "billing", "paiements", "comptabilité"] },
  { id: "page-analytics",   title: "Analytics",        subtitle: "Statistiques et rapports",   href: "/analytics",    keywords: ["stats", "statistiques", "rapports", "chiffres", "kpi"] },
  { id: "page-parametres",  title: "Paramètres",       subtitle: "Configuration du compte",    href: "/parametres",   keywords: ["settings", "config", "configuration", "compte", "profil"] },
  { id: "page-site-web",    title: "Site web",         subtitle: "Gérer vos sites",            href: "/site-web",     keywords: ["website", "sites", "builder", "portfolio"] },
  { id: "page-archives",    title: "Archives (tâches)", subtitle: "Tâches archivées",          href: "/taches/archive", keywords: ["archives", "archivé", "ancien", "old", "supprimé"] },
];

/* ─── Synonymes de statuts ─── */

const statusSynonyms: Record<string, string[]> = {
  new:          ["nouveau", "nouvelle", "neuf", "new"],
  in_progress:  ["en cours", "cours", "wip", "working", "in progress"],
  todo:         ["à faire", "a faire", "todo", "to-do", "backlog"],
  done:         ["terminé", "termine", "fini", "fait", "done", "completed", "complété"],
  completed:    ["terminé", "termine", "fini", "fait", "done", "completed"],
  validated:    ["validé", "valide", "approved", "approuvé"],
  delivered:    ["livré", "livre", "delivered", "envoyé"],
  paid:         ["payé", "paye", "paid", "reglé", "réglé"],
  cancelled:    ["annulé", "annule", "cancelled", "canceled"],
  draft:        ["brouillon", "draft"],
  overdue:      ["en retard", "retard", "late", "overdue", "dépassé", "depasse"],
  archived:     ["archivé", "archive", "archived"],
  active:       ["actif", "active"],
  pending:      ["en attente", "attente", "pending", "waiting"],
  urgent:       ["urgent", "urgente", "asap", "critique", "critical"],
  high:         ["haute", "high", "important", "importante", "prioritaire"],
};

/* ─── Jours de la semaine FR ─── */

const dayNames: Record<string, number> = {
  lundi: 1, mardi: 2, mercredi: 3, jeudi: 4,
  vendredi: 5, samedi: 6, dimanche: 0,
};

const monthNames: Record<string, number> = {
  janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3,
  mai: 4, juin: 5, juillet: 6, août: 7, aout: 7,
  septembre: 8, octobre: 9, novembre: 10, décembre: 11, decembre: 11,
};

/* ─── Query normalization ─── */

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ─── Smart query parser ─── */

export interface ParsedQuery {
  raw: string;
  normalized: string;
  amount?: number;
  dateValue?: string;
  dateRange?: [string, string];
  timeValue?: string;
  statusKeys: string[];
  priorityKeys: string[];
  entityFilter?: EntityType;
  textQuery: string;
  isRelativeDate: boolean;
}

export function parseSearchQuery(raw: string): ParsedQuery {
  const normalized = normalizeText(raw);
  const result: ParsedQuery = {
    raw,
    normalized,
    statusKeys: [],
    priorityKeys: [],
    textQuery: normalized,
    isRelativeDate: false,
  };

  let text = normalized;

  // Extract entity type filter (type:client, type:task, etc.)
  const typeMatch = text.match(/\btype:(\w+)/);
  if (typeMatch) {
    const typeMap: Record<string, EntityType> = {
      client: "client", clients: "client",
      order: "order", commande: "order", commandes: "order",
      task: "task", tache: "task", tâche: "task", taches: "task", tâches: "task",
      event: "event", calendrier: "event", evenement: "event", événement: "event",
      project: "project", projet: "project", projets: "project",
      product: "product", produit: "product", produits: "product", service: "product", services: "product",
      brief: "brief", briefs: "brief",
      invoice: "invoice", facture: "invoice", factures: "invoice",
      file: "file", fichier: "file", fichiers: "file",
      lead: "lead", leads: "lead",
      note: "note", notes: "note",
      page: "page", pages: "page",
    };
    result.entityFilter = typeMap[typeMatch[1]] || undefined;
    text = text.replace(typeMatch[0], "").trim();
  }

  // Extract amount: "60€", "60 EUR", "60 eur", "120.50€"
  const amountMatch = text.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:€|eur|euros?)\b/i);
  if (amountMatch) {
    result.amount = parseFloat(amountMatch[1].replace(",", "."));
    text = text.replace(amountMatch[0], "").trim();
  } else {
    const standaloneAmount = text.match(/\b(\d{2,}(?:[.,]\d{1,2})?)\b/);
    if (standaloneAmount && !text.match(/\d{2}[/:]\d{2}/)) {
      result.amount = parseFloat(standaloneAmount[1].replace(",", "."));
    }
  }

  // Extract time: "08:00", "6:00", "14h30"
  const timeMatch = text.match(/\b(\d{1,2})[h:](\d{2})\b/);
  if (timeMatch) {
    const h = timeMatch[1].padStart(2, "0");
    const m = timeMatch[2];
    result.timeValue = `${h}:${m}`;
  }

  // Relative dates
  const today = new Date();
  const relDates: Record<string, () => void> = {
    "aujourd'hui": () => { result.dateValue = fmtDate(today); result.isRelativeDate = true; },
    "aujourdhui": () => { result.dateValue = fmtDate(today); result.isRelativeDate = true; },
    "demain": () => { const d = new Date(today); d.setDate(d.getDate() + 1); result.dateValue = fmtDate(d); result.isRelativeDate = true; },
    "hier": () => { const d = new Date(today); d.setDate(d.getDate() - 1); result.dateValue = fmtDate(d); result.isRelativeDate = true; },
    "cette semaine": () => {
      const start = new Date(today);
      const day = start.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + diff);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      result.dateRange = [fmtDate(start), fmtDate(end)];
      result.isRelativeDate = true;
    },
    "semaine prochaine": () => {
      const start = new Date(today);
      const day = start.getDay();
      const diff = day === 0 ? 1 : 8 - day;
      start.setDate(start.getDate() + diff);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      result.dateRange = [fmtDate(start), fmtDate(end)];
      result.isRelativeDate = true;
    },
  };
  for (const [key, fn] of Object.entries(relDates)) {
    if (normalized.includes(key)) { fn(); text = text.replace(key, "").trim(); break; }
  }

  // Day name → next occurrence
  if (!result.dateValue && !result.dateRange) {
    for (const [name, dayNum] of Object.entries(dayNames)) {
      if (normalized.includes(name)) {
        const d = new Date(today);
        const curr = d.getDay();
        let diff = dayNum - curr;
        if (diff <= 0) diff += 7;
        if (curr === dayNum) diff = 0;
        d.setDate(d.getDate() + diff);
        result.dateValue = fmtDate(d);
        result.isRelativeDate = true;
        text = text.replace(name, "").trim();
        break;
      }
    }
  }

  // Month name → month range
  if (!result.dateValue && !result.dateRange) {
    for (const [name, monthNum] of Object.entries(monthNames)) {
      if (normalized.includes(name)) {
        const dayMonth = normalized.match(new RegExp(`(\\d{1,2})\\s+${name}`)) ||
                         normalized.match(new RegExp(`${name}\\s+(\\d{1,2})`));
        if (dayMonth) {
          const d = new Date(today.getFullYear(), monthNum, parseInt(dayMonth[1]));
          result.dateValue = fmtDate(d);
          text = text.replace(dayMonth[0], "").trim();
        } else {
          const year = today.getFullYear();
          const start = new Date(year, monthNum, 1);
          const end = new Date(year, monthNum + 1, 0);
          result.dateRange = [fmtDate(start), fmtDate(end)];
          text = text.replace(name, "").trim();
        }
        result.isRelativeDate = true;
        break;
      }
    }
  }

  // Date patterns: "09/03", "09-03-2026", "2026-03-09"
  if (!result.dateValue) {
    const dateSlash = text.match(/\b(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?\b/);
    if (dateSlash) {
      const day = parseInt(dateSlash[1]);
      const month = parseInt(dateSlash[2]) - 1;
      const year = dateSlash[3] ? (dateSlash[3].length === 2 ? 2000 + parseInt(dateSlash[3]) : parseInt(dateSlash[3])) : today.getFullYear();
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11) {
        result.dateValue = fmtDate(new Date(year, month, day));
        text = text.replace(dateSlash[0], "").trim();
      }
    }
  }

  // Detect status keywords
  for (const [status, synonyms] of Object.entries(statusSynonyms)) {
    for (const syn of synonyms) {
      if (normalized.includes(syn)) {
        if (status === "urgent" || status === "high") {
          result.priorityKeys.push(status);
        } else {
          result.statusKeys.push(status);
        }
        break;
      }
    }
  }

  result.textQuery = text.replace(/\s+/g, " ").trim();

  return result;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/* ─── Search pages ─── */

export function searchPages(query: string): SearchResult[] {
  if (!query || query.length < 1) return [];
  const norm = normalizeText(query);
  const results: SearchResult[] = [];

  for (const page of navigationPages) {
    const titleNorm = normalizeText(page.title);
    const subtitleNorm = normalizeText(page.subtitle);
    const keywordsNorm = page.keywords.map(normalizeText);

    let score = 0;
    if (titleNorm === norm) score = 100;
    else if (titleNorm.startsWith(norm)) score = 90;
    else if (titleNorm.includes(norm)) score = 70;
    else if (subtitleNorm.includes(norm)) score = 50;
    else if (keywordsNorm.some((k) => k.includes(norm) || norm.includes(k))) score = 60;
    else continue;

    results.push({
      id: page.id,
      type: "page",
      title: page.title,
      subtitle: page.subtitle,
      href: page.href,
      score,
    });
  }

  return results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

/* ─── Recent searches (localStorage keys) ─── */

export const RECENT_SEARCHES_KEY = "jestly_recent_searches";
export const RECENT_ITEMS_KEY = "jestly_recent_items";
export const MAX_RECENT = 8;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch { return []; }
}

export function saveRecentSearch(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function getRecentItems(): SearchResult[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_ITEMS_KEY) || "[]");
  } catch { return []; }
}

export function saveRecentItem(item: SearchResult) {
  if (typeof window === "undefined") return;
  const recent = getRecentItems().filter((r) => r.id !== item.id);
  recent.unshift(item);
  localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}
