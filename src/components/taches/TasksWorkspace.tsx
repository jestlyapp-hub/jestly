"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import {
  STATUS_CONFIG,
  COLUMNS_ORDER,
  filterTasks,
  sortByPriority,
  createEmptyTask,
  getOverdueCount,
  duplicateTask,
  TASK_TEMPLATES,
  createTaskFromTemplate,
  type Task,
  type TaskStatus,
  type FilterType,
  type TaskTemplate,
} from "@/lib/tasks-utils";
import TaskCard from "./TaskCard";
import TaskDetailDrawer from "./TaskDetailDrawer";
import TaskListView from "./TaskListView";
import Link from "next/link";

type ViewType = "board" | "list";

/* ── Droppable Column wrapper ── */
function KanbanColumn({
  status,
  tasks,
  onAddQuick,
  onSelectTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  onAddQuick: (title: string, status: TaskStatus) => void;
  onSelectTask: (task: Task) => void;
}) {
  const cfg = STATUS_CONFIG[status];
  const [quickInput, setQuickInput] = useState("");
  const { setNodeRef, isOver } = useDroppable({ id: status });

  function handleQuickAdd() {
    if (!quickInput.trim()) return;
    onAddQuick(quickInput.trim(), status);
    setQuickInput("");
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[260px] max-w-[340px] bg-[#F7F7F5] rounded-xl p-3 flex flex-col transition-colors ${
        isOver ? "ring-2 ring-[#4F46E5]/20" : ""
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: cfg.color }}
          />
          <span className="text-[13px] font-semibold text-[#1A1A1A]">
            {cfg.label}
          </span>
          <span className="text-[12px] text-[#BBB] bg-white rounded-full w-5 h-5 flex items-center justify-center">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Quick add */}
      <div className="mb-3">
        <input
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
          placeholder="+ Ajouter..."
          className="w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#1A1A1A] placeholder-[#CCC] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
        />
      </div>

      {/* Cards */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-2 min-h-[60px]">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onSelectTask(task)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-[60px] text-[12px] text-[#CCC] border border-dashed border-[#E6E6E4] rounded-lg">
              Aucune tâche
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

/* ── Global Quick Capture Bar ── */
function QuickCaptureBar({ onAdd }: { onAdd: (title: string) => void }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: N to focus
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleSubmit() {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  }

  return (
    <div className={`relative transition-all ${focused ? "ring-2 ring-[#4F46E5]/20 rounded-xl" : ""}`}>
      <div className="flex items-center bg-white border border-[#E6E6E4] rounded-xl overflow-hidden">
        <div className="pl-4 pr-2 text-[#BBB]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") { setValue(""); inputRef.current?.blur(); }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Nouvelle tâche... (appuyer N)"
          className="flex-1 py-3 px-2 text-[14px] text-[#1A1A1A] placeholder-[#CCC] border-none outline-none bg-transparent"
        />
        {value.trim() && (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 mr-1 text-[12px] font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors cursor-pointer"
          >
            Créer
          </button>
        )}
        <div className="pr-3">
          <kbd className="text-[10px] text-[#BBB] bg-[#F7F7F5] px-1.5 py-0.5 rounded border border-[#EFEFEF]">
            Enter
          </kbd>
        </div>
      </div>
    </div>
  );
}

/* ── Template Picker Modal ── */
function TemplatePicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (template: TaskTemplate) => void;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/10 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl border border-[#E6E6E4] shadow-xl z-50">
        <div className="px-5 py-4 border-b border-[#E6E6E4] flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[#1A1A1A]">Créer depuis un modèle</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F7F7F5] cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-3 space-y-1 max-h-[60vh] overflow-y-auto">
          {TASK_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => { onSelect(tpl); onClose(); }}
              className="w-full text-left p-3 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#1A1A1A] group-hover:text-[#4F46E5] transition-colors">
                  {tpl.name}
                </span>
                <span className="text-[11px] text-[#BBB]">{tpl.subtasks.length} sous-tâches</span>
              </div>
              <p className="text-[12px] text-[#999] mt-0.5">{tpl.description}</p>
              <div className="flex gap-1 mt-1.5">
                {tpl.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-[#666] bg-[#F0F0F0] px-1.5 py-[1px] rounded">{tag}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Main Workspace ── */
export default function TasksWorkspace() {
  const { data: rawTasks, loading, error, setData, mutate } = useApi<Task[]>("/api/tasks");
  const [filter, setFilter] = useState<FilterType>("all");
  const [view, setView] = useState<ViewType>("board");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const tasks = rawTasks || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Filtered + sorted tasks
  const visibleTasks = useMemo(() => {
    const filtered = filterTasks(tasks.filter((t) => !t.archived), filter);
    return sortByPriority(filtered);
  }, [tasks, filter]);

  // Group by status for kanban
  const columns = useMemo(() => {
    return COLUMNS_ORDER.map((st) => ({
      status: st,
      tasks: visibleTasks.filter((t) => t.status === st),
    }));
  }, [visibleTasks]);

  // ── Handlers ──

  const persistNewTask = useCallback(async (newTask: Task) => {
    setData((prev) => [newTask, ...(prev || [])]);
    try {
      const saved = await apiFetch<Task>("/api/tasks", { method: "POST", body: newTask });
      setData((prev) => (prev || []).map((t) => (t.id === newTask.id ? saved : t)));
      return saved;
    } catch (e) {
      console.error("Task create error:", e);
      setData((prev) => (prev || []).filter((t) => t.id !== newTask.id));
      return null;
    }
  }, [setData]);

  const updateTaskLocally = useCallback(
    (updatedTask: Task) => {
      setData((prev) =>
        (prev || []).map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      setSelectedTask(updatedTask);
      apiFetch("/api/tasks", {
        method: "PATCH",
        body: {
          id: updatedTask.id,
          title: updatedTask.title,
          description: updatedTask.description || "",
          status: updatedTask.status,
          priority: updatedTask.priority,
          dueDate: updatedTask.dueDate || null,
          clientId: updatedTask.clientId || null,
          clientName: updatedTask.clientName || null,
          orderId: updatedTask.orderId || null,
          orderTitle: updatedTask.orderTitle || null,
          tags: updatedTask.tags,
          subtasks: updatedTask.subtasks,
        },
      }).catch((e) => console.error("Task sync error:", e));
    },
    [setData]
  );

  function handleSelectTask(task: Task, fullPage = false) {
    if (fullPage) {
      window.location.href = `/tâches/${task.id}`;
      return;
    }
    setSelectedTask(task);
    setDrawerOpen(true);
  }

  async function handleQuickCapture(title: string) {
    const newTask = createEmptyTask("todo");
    newTask.title = title;
    await persistNewTask(newTask);
  }

  async function handleAddQuick(title: string, status: TaskStatus) {
    const newTask = createEmptyTask(status);
    newTask.title = title;
    await persistNewTask(newTask);
  }

  async function handleAddNew() {
    const newTask = createEmptyTask("todo");
    newTask.title = "Nouvelle tâche";
    setSelectedTask(newTask);
    setDrawerOpen(true);
    const saved = await persistNewTask(newTask);
    if (saved) setSelectedTask(saved);
    else setDrawerOpen(false);
  }

  async function handleCreateFromTemplate(template: TaskTemplate) {
    const newTask = createTaskFromTemplate(template);
    setSelectedTask(newTask);
    setDrawerOpen(true);
    const saved = await persistNewTask(newTask);
    if (saved) setSelectedTask(saved);
    else setDrawerOpen(false);
  }

  async function handleDuplicate(task: Task) {
    const dup = duplicateTask(task);
    setDrawerOpen(false);
    const saved = await persistNewTask(dup);
    if (saved) {
      setSelectedTask(saved);
      setDrawerOpen(true);
    }
  }

  async function handleScheduleTask(task: Task, date: string, startTime?: string) {
    try {
      await apiFetch("/api/calendar/events", {
        method: "POST",
        body: {
          title: task.title,
          category: "session",
          date,
          startTime: startTime || null,
          endTime: startTime ? (() => {
            const [h, m] = startTime.split(":").map(Number);
            return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
          })() : null,
          allDay: !startTime,
          notes: `Tache liee: ${task.title}`,
          priority: task.priority,
          clientName: task.clientName || null,
          clientId: task.clientId || null,
        },
      });
      // Update task due date if not set
      if (!task.dueDate) {
        const updated = { ...task, dueDate: date, updatedAt: new Date().toISOString() };
        updateTaskLocally(updated);
      }
    } catch (e) {
      console.error("Schedule error:", e);
    }
  }

  function handleDelete(id: string) {
    if (!window.confirm("Supprimer cette tâche ? Cette action est irréversible.")) return;
    setData((prev) => (prev || []).filter((t) => t.id !== id));
    setDrawerOpen(false);
    apiFetch("/api/tasks", { method: "DELETE", body: { id } }).catch((e) => console.error("Task delete error:", e));
  }

  async function handleArchive(id: string) {
    // Optimistic update
    setData((prev) =>
      (prev || []).map((t) =>
        t.id === id ? { ...t, archived: true, updatedAt: new Date().toISOString() } : t
      )
    );
    setDrawerOpen(false);
    try {
      await apiFetch("/api/tasks", { method: "PATCH", body: { id, archived: true } });
    } catch (e) {
      console.error("Archive error:", e);
      // Rollback optimistic update — archive failed
      setData((prev) =>
        (prev || []).map((t) =>
          t.id === id ? { ...t, archived: false } : t
        )
      );
    }
  }

  function handleStatusChange(taskId: string, status: TaskStatus) {
    setData((prev) =>
      (prev || []).map((t) =>
        t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t
      )
    );
    apiFetch("/api/tasks", { method: "PATCH", body: { id: taskId, status } }).catch(
      (e) => console.error("Task sync error:", e)
    );
  }

  // ── DnD handlers ──

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overStatus = COLUMNS_ORDER.includes(over.id as TaskStatus)
      ? (over.id as TaskStatus)
      : null;

    const overTask = tasks.find((t) => t.id === over.id);
    const targetStatus = overStatus || overTask?.status;

    if (targetStatus && activeTask.status !== targetStatus) {
      setData((prev) =>
        (prev || []).map((t) =>
          t.id === activeTask.id
            ? { ...t, status: targetStatus, updatedAt: new Date().toISOString() }
            : t
        )
      );
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active } = event;
    setActiveId(null);

    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      apiFetch("/api/tasks", {
        method: "PATCH",
        body: { id: task.id, status: task.status },
      }).catch((e) => console.error("Task sync error:", e));
    }
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) || null : null;

  const overdueCount = useMemo(() => getOverdueCount(tasks), [tasks]);

  const todayCount = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return tasks.filter((t) => {
      if (t.archived || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === now.getTime();
    }).length;
  }, [tasks]);

  const filters: { key: FilterType; label: string; badge?: number }[] = [
    { key: "all", label: "Toutes" },
    { key: "today", label: "Aujourd'hui", badge: todayCount },
    { key: "upcoming", label: "A venir" },
    { key: "overdue", label: "En retard", badge: overdueCount },
    { key: "urgent", label: "Urgentes" },
  ];

  // Keyboard shortcut: Escape to close drawer
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [drawerOpen]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-32 bg-[#F7F7F5] rounded animate-pulse mb-6" />
        <div className="h-12 bg-[#F7F7F5] rounded-xl animate-pulse mb-6" />
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-1 min-w-[240px] bg-[#F7F7F5] rounded-xl p-3 space-y-3"
            >
              <div className="h-4 w-20 bg-[#ECECEA] rounded animate-pulse" />
              <div className="h-24 bg-white rounded-lg animate-pulse" />
              <div className="h-20 bg-white rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <div className="inline-flex flex-col items-center gap-3 bg-white border border-red-200 rounded-xl p-8 max-w-md">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-[14px] font-medium text-[#1A1A1A]">Impossible de charger les tâches</p>
          <p className="text-[12px] text-[#999]">{error}</p>
          <button onClick={mutate} className="mt-2 text-[13px] font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg px-4 py-2 transition-colors cursor-pointer">
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Quick Capture Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-5"
      >
        <QuickCaptureBar onAdd={handleQuickCapture} />
      </motion.div>

      {/* Top bar */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Taches</h1>
          <Link
            href="/tâches/archive"
            className="text-[12px] text-[#999] hover:text-[#666] transition-colors ml-2"
            title="Voir les archives"
            aria-label="Voir les archives"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" rx="1" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
          </Link>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Filters */}
          <div className="flex bg-[#F7F7F5] rounded-lg p-0.5">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[12px] font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  filter === f.key
                    ? "bg-white text-[#1A1A1A] shadow-sm"
                    : "text-[#999] hover:text-[#666]"
                }`}
              >
                {f.label}
                {f.badge !== undefined && f.badge > 0 && (
                  <span className={`ml-1 text-white text-[10px] font-bold rounded-full w-4 h-4 inline-flex items-center justify-center ${
                    f.key === "overdue" ? "bg-[#EF4444]" : "bg-[#4F46E5]"
                  }`}>
                    {f.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex bg-[#F7F7F5] rounded-lg p-0.5">
            <button
              onClick={() => setView("board")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                view === "board" ? "bg-white shadow-sm" : ""
              }`}
              title="Vue Kanban"
              aria-label="Vue Kanban"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={view === "board" ? "#1A1A1A" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="18" rx="1" />
                <rect x="14" y="3" width="7" height="10" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                view === "list" ? "bg-white shadow-sm" : ""
              }`}
              title="Vue Liste"
              aria-label="Vue Liste"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={view === "list" ? "#1A1A1A" : "#999"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>

          {/* Template button */}
          <button
            onClick={() => setTemplatePickerOpen(true)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666] bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            title="Créer depuis un modèle"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            Modele
          </button>

          {/* New task button */}
          <button
            onClick={handleAddNew}
            className="bg-[#4F46E5] text-white rounded-lg px-3 py-2 text-[13px] font-medium hover:bg-[#4338CA] transition-colors cursor-pointer whitespace-nowrap"
          >
            + Nouvelle tâche
          </button>
        </div>
      </motion.div>

      {/* Board / List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {view === "board" ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {columns.map((col) => (
                <KanbanColumn
                  key={col.status}
                  status={col.status}
                  tasks={col.tasks}
                  onAddQuick={handleAddQuick}
                  onSelectTask={handleSelectTask}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <TaskCard task={activeTask} onClick={() => {}} overlay />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <TaskListView
            tasks={visibleTasks}
            onSelectTask={handleSelectTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </motion.div>

      {/* Detail drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={updateTaskLocally}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onDuplicate={handleDuplicate}
        onSchedule={handleScheduleTask}
      />

      {/* Template picker */}
      <AnimatePresence>
        <TemplatePicker
          open={templatePickerOpen}
          onClose={() => setTemplatePickerOpen(false)}
          onSelect={handleCreateFromTemplate}
        />
      </AnimatePresence>
    </div>
  );
}
