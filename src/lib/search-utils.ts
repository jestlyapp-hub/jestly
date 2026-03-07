/* ─── Types ─── */

export interface SearchResult {
  id: string;
  type: "client" | "order" | "task" | "invoice" | "product";
  title: string;
  subtitle?: string;
  status?: string;
  date?: string;
  amount?: number;
  href: string;
}

/* ─── Status labels FR ─── */

export const statusLabels: Record<string, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  validated: "Valide",
  paid: "Paye",
  cancelled: "Annule",
  pending: "En attente",
  overdue: "En retard",
  active: "Actif",
  todo: "A faire",
  done: "Termine",
  delivered: "Livre",
};

/* ─── Entity type config ─── */

export const entityConfig: Record<
  SearchResult["type"],
  { label: string; color: string; bgColor: string }
> = {
  client: { label: "Client", color: "#2563EB", bgColor: "#EFF6FF" },
  order: { label: "Commande", color: "#4F46E5", bgColor: "#EEF2FF" },
  task: { label: "Tache", color: "#7C3AED", bgColor: "#F5F3FF" },
  invoice: { label: "Facture", color: "#16A34A", bgColor: "#F0FDF4" },
  product: { label: "Produit", color: "#EA580C", bgColor: "#FFF7ED" },
};

/* ─── Quick-access items (shown when input focused, query empty) ─── */

export function getQuickAccessItems(): SearchResult[] {
  return [
    {
      id: "qa-clients",
      type: "client",
      title: "Clients",
      subtitle: "Voir tous les clients",
      href: "/clients",
    },
    {
      id: "qa-commandes",
      type: "order",
      title: "Commandes",
      subtitle: "Voir les commandes",
      href: "/commandes",
    },
    {
      id: "qa-taches",
      type: "task",
      title: "Taches",
      subtitle: "Voir toutes les taches",
      href: "/taches",
    },
    {
      id: "qa-produits",
      type: "product",
      title: "Produits",
      subtitle: "Voir les produits",
      href: "/produits",
    },
  ];
}
