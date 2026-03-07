"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
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
  type Task,
  type TaskStatus,
  type FilterType,
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
              Aucune tache
            </div>
          )}
        </div>
      </SortableContext>
    </div>
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

  const updateTaskLocally = useCallback(
    (updatedTask: Task) => {
      setData((prev) =>
        (prev || []).map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      // Also update selectedTask in drawer
      setSelectedTask(updatedTask);
      // Persist — send only the fields the API knows how to map
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
      window.location.href = `/taches/${task.id}`;
      return;
    }
    setSelectedTask(task);
    setDrawerOpen(true);
  }

  function handleAddQuick(title: string, status: TaskStatus) {
    const newTask = createEmptyTask(status);
    newTask.title = title;
    setData((prev) => [newTask, ...(prev || [])]);
    apiFetch("/api/tasks", { method: "POST", body: newTask }).catch((e) => console.error("Task sync error:", e));
  }

  function handleAddNew() {
    const newTask = createEmptyTask("todo");
    newTask.title = "Nouvelle tache";
    setData((prev) => [newTask, ...(prev || [])]);
    setSelectedTask(newTask);
    setDrawerOpen(true);
    apiFetch("/api/tasks", { method: "POST", body: newTask }).catch((e) => console.error("Task sync error:", e));
  }

  function handleDelete(id: string) {
    setData((prev) => (prev || []).filter((t) => t.id !== id));
    setDrawerOpen(false);
    apiFetch("/api/tasks", { method: "DELETE", body: { id } }).catch((e) => console.error("Task sync error:", e));
  }

  function handleArchive(id: string) {
    setData((prev) =>
      (prev || []).map((t) =>
        t.id === id ? { ...t, archived: true, updatedAt: new Date().toISOString() } : t
      )
    );
    setDrawerOpen(false);
    apiFetch("/api/tasks", { method: "PATCH", body: { id, archived: true } }).catch(
      (e) => console.error("Task sync error:", e)
    );
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

    // Check if over is a column (droppable)
    const overStatus = COLUMNS_ORDER.includes(over.id as TaskStatus)
      ? (over.id as TaskStatus)
      : null;

    // Or over is a task in a different column
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

    // Persist the status change
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

  const filters: { key: FilterType; label: string; badge?: number }[] = [
    { key: "all", label: "Toutes" },
    { key: "overdue", label: "En retard", badge: overdueCount },
    { key: "urgent", label: "Urgentes" },
    { key: "week", label: "Cette semaine" },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-32 bg-[#F7F7F5] rounded animate-pulse mb-6" />
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
        <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer">
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
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
            href="/taches/archive"
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
                  <span className="ml-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full w-4 h-4 inline-flex items-center justify-center">
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

          {/* New task button */}
          <button
            onClick={handleAddNew}
            className="bg-[#4F46E5] text-white rounded-lg px-3 py-2 text-[13px] font-medium hover:bg-[#4338CA] transition-colors cursor-pointer whitespace-nowrap"
          >
            + Nouvelle tache
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
      />
    </div>
  );
}
