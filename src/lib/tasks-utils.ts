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

