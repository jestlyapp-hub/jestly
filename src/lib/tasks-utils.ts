// ── Task types & utilities ──

export type TaskStatus = "todo" | "in_progress" | "done" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  clientId?: string;
  clientName?: string;
  orderId?: string;
  orderTitle?: string;
  tags: string[];
  subtasks: Subtask[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Status config ──

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string }
> = {
  todo: { label: "A faire", color: "#666", bg: "#F0F0F0" },
  in_progress: { label: "En cours", color: "#4F46E5", bg: "#EEF2FF" },
  done: { label: "Fait", color: "#F59E0B", bg: "#FEF3C7" },
  completed: { label: "Termine", color: "#10B981", bg: "#D1FAE5" },
};

export const COLUMNS_ORDER: TaskStatus[] = [
  "todo",
  "in_progress",
  "done",
  "completed",
];

// ── Priority config ──

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; bg: string; dot: string }
> = {
  low: { label: "Basse", color: "#999", bg: "#F5F5F5", dot: "#CCC" },
  medium: { label: "Moyenne", color: "#3B82F6", bg: "#EFF6FF", dot: "#3B82F6" },
  high: { label: "Haute", color: "#F97316", bg: "#FFF7ED", dot: "#F97316" },
  urgent: { label: "Urgente", color: "#EF4444", bg: "#FEF2F2", dot: "#EF4444" },
};

// ── Helpers ──

export type FilterType = "all" | "urgent" | "week" | "overdue";

export function filterTasks(
  tasks: Task[],
  filter: FilterType
): Task[] {
  if (filter === "urgent") {
    return tasks.filter((t) => t.priority === "urgent" || t.priority === "high");
  }
  if (filter === "week") {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d <= endOfWeek;
    });
  }
  if (filter === "overdue") {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      if (t.status === "done" || t.status === "completed") return false;
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      return d < now;
    });
  }
  return tasks;
}

export function getOverdueCount(tasks: Task[]): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return tasks.filter((t) => {
    if (t.archived) return false;
    if (!t.dueDate) return false;
    if (t.status === "done" || t.status === "completed") return false;
    const d = new Date(t.dueDate);
    d.setHours(0, 0, 0, 0);
    return d < now;
  }).length;
}

export function sortByPriority(tasks: Task[]): Task[] {
  const order: Record<TaskPriority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  return [...tasks].sort((a, b) => order[a.priority] - order[b.priority]);
}

export function getSubtaskProgress(subtasks: Subtask[]): {
  done: number;
  total: number;
  percent: number;
} {
  const total = subtasks.length;
  const done = subtasks.filter((s) => s.done).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function getDueDateStatus(
  dueDate?: string
): "overdue" | "soon" | "normal" | null {
  if (!dueDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dueDate);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 0) return "overdue";
  if (diffDays <= 2) return "soon";
  return "normal";
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function createId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function createEmptyTask(status: TaskStatus = "todo"): Task {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: "",
    status,
    priority: "medium",
    tags: [],
    subtasks: [],
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

// ── Mock data ──

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    title: "Finaliser la maquette du site vitrine",
    description: "Finir les dernieres pages (contact, a propos) et envoyer au client pour validation.",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-03-09",
    clientName: "Marie Dupont",
    clientId: "c1",
    tags: ["design", "site-web"],
    subtasks: [
      { id: "s1", text: "Page d'accueil", done: true },
      { id: "s2", text: "Page contact", done: true },
      { id: "s3", text: "Page a propos", done: false },
      { id: "s4", text: "Version mobile", done: false },
    ],
    archived: false,
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-06T14:30:00Z",
  },
  {
    id: "t2",
    title: "Envoyer le devis pour le rebranding",
    status: "todo",
    priority: "urgent",
    dueDate: "2026-03-05",
    clientName: "Lucas Martin",
    clientId: "c2",
    tags: ["devis"],
    subtasks: [],
    archived: false,
    createdAt: "2026-03-04T09:00:00Z",
    updatedAt: "2026-03-04T09:00:00Z",
  },
  {
    id: "t3",
    title: "Retoucher les photos produit",
    description: "Lot de 15 photos pour la boutique en ligne.",
    status: "todo",
    priority: "medium",
    dueDate: "2026-03-12",
    clientName: "Sophie Leroy",
    clientId: "c3",
    tags: ["photo", "retouche"],
    subtasks: [
      { id: "s5", text: "Detourage", done: false },
      { id: "s6", text: "Colorimetrie", done: false },
      { id: "s7", text: "Export web", done: false },
    ],
    archived: false,
    createdAt: "2026-03-05T11:00:00Z",
    updatedAt: "2026-03-05T11:00:00Z",
  },
  {
    id: "t4",
    title: "Mettre a jour le portfolio",
    status: "todo",
    priority: "low",
    tags: ["perso"],
    subtasks: [],
    archived: false,
    createdAt: "2026-03-02T08:00:00Z",
    updatedAt: "2026-03-02T08:00:00Z",
  },
  {
    id: "t5",
    title: "Creer les stories Instagram",
    status: "in_progress",
    priority: "medium",
    dueDate: "2026-03-10",
    clientName: "Marie Dupont",
    clientId: "c1",
    tags: ["social-media"],
    subtasks: [
      { id: "s8", text: "Story 1 - Teaser", done: true },
      { id: "s9", text: "Story 2 - Behind the scenes", done: false },
      { id: "s10", text: "Story 3 - CTA", done: false },
    ],
    archived: false,
    createdAt: "2026-03-03T15:00:00Z",
    updatedAt: "2026-03-06T10:00:00Z",
  },
  {
    id: "t6",
    title: "Preparer la facture mars",
    status: "done",
    priority: "medium",
    clientName: "Lucas Martin",
    clientId: "c2",
    tags: ["admin"],
    subtasks: [],
    archived: false,
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-05T16:00:00Z",
  },
  {
    id: "t7",
    title: "Livraison logo final",
    status: "done",
    priority: "high",
    dueDate: "2026-03-06",
    clientName: "Sophie Leroy",
    clientId: "c3",
    tags: ["design", "logo"],
    subtasks: [
      { id: "s11", text: "Version couleur", done: true },
      { id: "s12", text: "Version N&B", done: true },
      { id: "s13", text: "Favicon", done: true },
      { id: "s14", text: "Charte graphique PDF", done: true },
      { id: "s15", text: "Fichiers sources", done: true },
    ],
    archived: false,
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: "2026-03-06T12:00:00Z",
  },
  {
    id: "t8",
    title: "Relancer le client pour validation",
    status: "todo",
    priority: "high",
    dueDate: "2026-03-04",
    clientName: "Thomas Petit",
    clientId: "c4",
    tags: ["relance"],
    subtasks: [],
    archived: false,
    createdAt: "2026-03-04T14:00:00Z",
    updatedAt: "2026-03-04T14:00:00Z",
  },
  {
    id: "t9",
    title: "Configurer le domaine personnalise",
    status: "completed",
    priority: "medium",
    clientName: "Marie Dupont",
    clientId: "c1",
    tags: ["tech"],
    subtasks: [],
    archived: false,
    createdAt: "2026-02-25T09:00:00Z",
    updatedAt: "2026-03-03T11:00:00Z",
  },
  {
    id: "t10",
    title: "Creer le kit de bienvenue",
    status: "completed",
    priority: "low",
    tags: ["template", "perso"],
    subtasks: [
      { id: "s16", text: "PDF de bienvenue", done: true },
      { id: "s17", text: "Email automatique", done: true },
    ],
    archived: false,
    createdAt: "2026-02-18T10:00:00Z",
    updatedAt: "2026-02-28T15:00:00Z",
  },
  {
    id: "t11",
    title: "Audit SEO du site client",
    status: "in_progress",
    priority: "medium",
    dueDate: "2026-03-14",
    clientName: "Thomas Petit",
    clientId: "c4",
    tags: ["seo", "audit"],
    subtasks: [
      { id: "s18", text: "Analyse technique", done: true },
      { id: "s19", text: "Analyse de contenu", done: false },
      { id: "s20", text: "Rapport final", done: false },
    ],
    archived: false,
    createdAt: "2026-03-02T13:00:00Z",
    updatedAt: "2026-03-06T09:00:00Z",
  },
  {
    id: "t12",
    title: "Animer le banner promo",
    status: "todo",
    priority: "low",
    dueDate: "2026-03-20",
    clientName: "Sophie Leroy",
    clientId: "c3",
    tags: ["animation", "design"],
    subtasks: [],
    archived: false,
    createdAt: "2026-03-05T16:00:00Z",
    updatedAt: "2026-03-05T16:00:00Z",
  },
];
