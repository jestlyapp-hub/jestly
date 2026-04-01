// ── Task types & utilities ──

export type TaskStatus = "todo" | "in_progress" | "done" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface SubtaskComment {
  id: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
  priority?: TaskPriority;
  dueDate?: string;
  notes?: string;
  checklist?: ChecklistItem[];
  tags?: string[];
  comments?: SubtaskComment[];
  attachments?: TaskAttachment[];
  timeSpent?: number; // total seconds tracked
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
  attachments?: TaskAttachment[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Status config ──

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string }
> = {
  todo: { label: "À faire", color: "#666", bg: "#F0F0F0" },
  in_progress: { label: "En cours", color: "#4F46E5", bg: "#EEF2FF" },
  done: { label: "Fait", color: "#F59E0B", bg: "#FEF3C7" },
  completed: { label: "Terminé", color: "#10B981", bg: "#D1FAE5" },
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

export type FilterType = "all" | "today" | "upcoming" | "overdue" | "urgent";

export function filterTasks(
  tasks: Task[],
  filter: FilterType
): Task[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (filter === "today") {
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === now.getTime();
    });
  }
  if (filter === "upcoming") {
    const inSevenDays = new Date(now);
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      if (t.status === "done" || t.status === "completed") return false;
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      return d >= now && d <= inSevenDays;
    });
  }
  if (filter === "overdue") {
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      if (t.status === "done" || t.status === "completed") return false;
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      return d < now;
    });
  }
  if (filter === "urgent") {
    return tasks.filter((t) => t.priority === "urgent" || t.priority === "high");
  }
  return tasks;
}

// ── Task Templates ──

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  subtasks: string[];
  tags: string[];
  priority: TaskPriority;
  isSystem?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const SYSTEM_TEMPLATES: TaskTemplate[] = [
  {
    id: "tpl-video",
    name: "Vidéo YouTube",
    description: "Workflow complet pour une vidéo YouTube",
    subtasks: ["Écrire le script", "Montage vidéo", "Créer la thumbnail", "Upload + SEO", "Publier"],
    tags: ["video", "youtube"],
    priority: "high",
    isSystem: true,
  },
  {
    id: "tpl-seo",
    name: "Audit SEO",
    description: "Audit SEO complet d'un site client",
    subtasks: ["Analyse technique", "Audit de contenu", "Analyse backlinks", "Rapport + recommandations"],
    tags: ["seo", "audit"],
    priority: "medium",
    isSystem: true,
  },
  {
    id: "tpl-design",
    name: "Livraison design",
    description: "Livraison d'un projet design client",
    subtasks: ["Concept initial", "Révisions client", "Version finale", "Export fichiers sources", "Livraison"],
    tags: ["design", "livraison"],
    priority: "high",
    isSystem: true,
  },
  {
    id: "tpl-social",
    name: "Pack réseaux sociaux",
    description: "Création d'un pack de contenu social",
    subtasks: ["Briefing client", "Création visuels", "Rédaction textes", "Révisions", "Livraison"],
    tags: ["social-media", "contenu"],
    priority: "medium",
    isSystem: true,
  },
  {
    id: "tpl-motion",
    name: "Animation / Motion",
    description: "Projet d'animation ou motion design",
    subtasks: ["Storyboard", "Design des assets", "Animation", "Sound design", "Export final"],
    tags: ["motion", "animation"],
    priority: "high",
    isSystem: true,
  },
];

/** @deprecated Use SYSTEM_TEMPLATES instead */
export const TASK_TEMPLATES = SYSTEM_TEMPLATES;

/** Convert a DB template row (camelCase) to TaskTemplate */
export function dbTemplateToTaskTemplate(row: {
  id: string;
  name: string;
  description?: string;
  defaultPriority?: string;
  subtasks?: string[];
  tags?: string[];
  notes?: string;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}): TaskTemplate {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    priority: (row.defaultPriority as TaskPriority) || "medium",
    subtasks: row.subtasks || [],
    tags: row.tags || [],
    isSystem: row.isSystem || false,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Convert a Task to a TaskTemplate (for "Save as template") */
export function taskToTemplate(task: Task): Omit<TaskTemplate, "id"> {
  return {
    name: task.title,
    description: task.description || "",
    priority: task.priority,
    subtasks: task.subtasks.map(s => s.text),
    tags: [...task.tags],
    isSystem: false,
    notes: "",
  };
}

export function createTaskFromTemplate(template: TaskTemplate, clientName?: string): Task {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: template.name + (clientName ? ` — ${clientName}` : ""),
    description: template.description,
    status: "todo",
    priority: template.priority,
    tags: [...template.tags],
    subtasks: template.subtasks.map((text) => ({
      id: createId(),
      text,
      done: false,
    })),
    clientName,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function duplicateTask(task: Task): Task {
  const now = new Date().toISOString();
  return {
    ...task,
    id: createId(),
    title: `${task.title} (copie)`,
    status: "todo",
    archived: false,
    subtasks: task.subtasks.map((s) => ({ ...s, id: createId(), done: false })),
    createdAt: now,
    updatedAt: now,
  };
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

