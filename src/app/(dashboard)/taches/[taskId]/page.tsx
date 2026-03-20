"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/hooks/use-api";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  COLUMNS_ORDER,
  getSubtaskProgress,
  getDueDateStatus,
  formatDate,
  createId,
  duplicateTask,
  type Task,
  type TaskStatus,
  type TaskPriority,
  type Subtask,
} from "@/lib/tasks-utils";
import ClientAutocomplete from "@/components/taches/ClientAutocomplete";
import RelationBadge from "@/components/ui/RelationBadge";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load task from real DB — try active tasks, then archived
  useEffect(() => {
    async function loadTask() {
      setLoading(true);
      try {
        // First try active tasks
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          const tasks: Task[] = Array.isArray(data) ? data : [];
          const found = tasks.find((t) => t.id === taskId);
          if (found) {
            setTask(found);
            setLoading(false);
            return;
          }
        }

        // Try archived tasks
        const res2 = await fetch("/api/tasks?archived=true");
        if (res2.ok) {
          const data2 = await res2.json();
          const archived: Task[] = Array.isArray(data2) ? data2 : [];
          const found2 = archived.find((t) => t.id === taskId);
          if (found2) {
            setTask(found2);
            setLoading(false);
            return;
          }
        }

        // Task not found in DB — will show "introuvable" state
      } catch (e) {
        console.error("Task load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [taskId]);

  // Auto-resize textarea
  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, [task?.description]);

  // Debounced save — sends only changed fields, not the entire task
  const lastSavedRef = useRef<Task | null>(null);
  const persistTask = useCallback(
    (updated: Task) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      const prev = task; // capture current state for rollback
      saveTimeout.current = setTimeout(async () => {
        setSaving(true);
        try {
          // Send the full task with id — API will extract and map fields
          const res = await apiFetch("/api/tasks", {
            method: "PATCH",
            body: {
              id: updated.id,
              title: updated.title,
              description: updated.description || "",
              status: updated.status,
              priority: updated.priority,
              dueDate: updated.dueDate || null,
              clientId: updated.clientId || null,
              clientName: updated.clientName || null,
              orderId: updated.orderId || null,
              orderTitle: updated.orderTitle || null,
              tags: updated.tags,
              subtasks: updated.subtasks,
            },
          });
          lastSavedRef.current = updated;
        } catch (e) {
          console.error("[Task] Save failed:", e);
          if (prev) setTask(prev); // rollback optimistic update
        } finally {
          setSaving(false);
        }
      }, 500);
    },
    [task]
  );

  // Cleanup pending saves on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  function update(patch: Partial<Task>) {
    if (!task) return;
    const updated = { ...task, ...patch, updatedAt: new Date().toISOString() };
    setTask(updated);
    persistTask(updated);
  }

  function toggleSubtask(subId: string) {
    if (!task) return;
    const subs = task.subtasks.map((s) =>
      s.id === subId ? { ...s, done: !s.done } : s
    );
    update({ subtasks: subs });
  }

  function deleteSubtask(subId: string) {
    if (!task) return;
    update({ subtasks: task.subtasks.filter((s) => s.id !== subId) });
  }

  function addSubtask() {
    if (!task || !newSubtaskText.trim()) return;
    const sub: Subtask = { id: createId(), text: newSubtaskText.trim(), done: false };
    update({ subtasks: [...task.subtasks, sub] });
    setNewSubtaskText("");
  }

  function addTag() {
    if (!task || !newTag.trim() || task.tags.includes(newTag.trim())) return;
    update({ tags: [...task.tags, newTag.trim()] });
    setNewTag("");
  }

  function removeTag(tag: string) {
    if (!task) return;
    update({ tags: task.tags.filter((t) => t !== tag) });
  }

  async function handleDuplicate() {
    if (!task) return;
    const dup = duplicateTask(task);
    try {
      const saved = await apiFetch<Task>("/api/tasks", { method: "POST", body: dup });
      router.push(`/taches/${saved.id}`);
    } catch (e) {
      console.error("Duplicate error:", e);
    }
  }

  async function handleSchedule(date: string, startTime?: string) {
    if (!task) return;
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
          notes: `Tâche liée: ${task.title}`,
          priority: task.priority,
          clientName: task.clientName || null,
          clientId: task.clientId || null,
        },
      });
      if (!task.dueDate) {
        update({ dueDate: date });
      }
    } catch (e) {
      console.error("Schedule error:", e);
    }
  }

  async function handleArchive() {
    if (!task) return;
    try {
      await apiFetch("/api/tasks", {
        method: "PATCH",
        body: { id: task.id, archived: true },
      });
      router.push("/taches");
    } catch (e) {
      console.error("Archive error:", e);
      alert("Erreur lors de l'archivage. Verifiez que la migration 024 est appliquee.");
    }
  }

  async function handleDelete() {
    if (!task) return;
    await apiFetch("/api/tasks", {
      method: "DELETE",
      body: { id: task.id },
    });
    router.push("/taches");
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="h-8 w-48 bg-[#F7F7F5] rounded animate-pulse mb-6" />
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-8 space-y-6">
          <div className="h-8 w-96 bg-[#F7F7F5] rounded animate-pulse" />
          <div className="h-4 w-64 bg-[#F7F7F5] rounded animate-pulse" />
          <div className="h-32 bg-[#F7F7F5] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-[#F7F7F5] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-[15px] text-[#999] mb-3">Tâche introuvable</p>
        <button
          onClick={() => router.push("/taches")}
          className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer"
        >
          Retour aux taches
        </button>
      </div>
    );
  }

  const subProgress = task.subtasks.length > 0 ? getSubtaskProgress(task.subtasks) : null;
  const dueStat = getDueDateStatus(task.dueDate);

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Breadcrumb + save indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-[13px]">
          <button
            onClick={() => router.push("/taches")}
            className="text-[#999] hover:text-[#666] transition-colors cursor-pointer flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Taches
          </button>
          <span className="text-[#CCC]">/</span>
          <span className="text-[#191919] font-medium truncate max-w-[300px]">
            {task.title || "Sans titre"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-[11px] text-[#999] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              Sauvegarde...
            </span>
          )}
          {!saving && task.updatedAt && (
            <span className="text-[11px] text-[#CCC]">
              Modifie {formatDate(task.updatedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left column — Main workspace */}
        <div className="space-y-6">
          {/* Title */}
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-6">
            <input
              ref={titleRef}
              value={task.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Titre de la tâche..."
              className="w-full text-[22px] font-bold text-[#191919] placeholder-[#CCC] border-none outline-none bg-transparent"
            />

            {/* Status + Priority inline */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <div className="flex gap-1">
                {COLUMNS_ORDER.map((st) => {
                  const cfg = STATUS_CONFIG[st];
                  const active = task.status === st;
                  return (
                    <button
                      key={st}
                      onClick={() => update({ status: st as TaskStatus })}
                      className="text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-all cursor-pointer"
                      style={{
                        background: active ? cfg.bg : "transparent",
                        color: active ? cfg.color : "#BBB",
                        border: active ? "none" : "1px solid #EFEFEF",
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
              <div className="w-px h-5 bg-[#EFEFEF]" />
              <div className="flex gap-1">
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((pr) => {
                  const cfg = PRIORITY_CONFIG[pr];
                  const active = task.priority === pr;
                  return (
                    <button
                      key={pr}
                      onClick={() => update({ priority: pr })}
                      className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-all cursor-pointer"
                      style={{
                        background: active ? cfg.bg : "transparent",
                        color: active ? cfg.color : "#BBB",
                        border: active ? "none" : "1px solid #EFEFEF",
                      }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Description / Notes */}
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-6">
            <label className="text-[11px] text-[#999] font-semibold uppercase tracking-wider block mb-3">
              Notes
            </label>
            <textarea
              ref={descRef}
              value={task.description || ""}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Ajouter des notes, instructions, contexte..."
              rows={6}
              className="w-full bg-[#FBFBFA] border border-[#E6E6E4] rounded-lg px-4 py-3 text-[14px] text-[#191919] placeholder-[#CCC] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all resize-none leading-relaxed"
              style={{ minHeight: "120px" }}
            />
          </div>

          {/* Subtasks */}
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] text-[#999] font-semibold uppercase tracking-wider">
                Sous-taches
              </label>
              {subProgress && (
                <span className="text-[12px] text-[#999] font-medium">
                  {subProgress.done}/{subProgress.total} ({subProgress.percent}%)
                </span>
              )}
            </div>

            {/* Progress bar */}
            {subProgress && subProgress.total > 0 && (
              <div className="w-full h-2 bg-[#EFEFEF] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-[#4F46E5] rounded-full transition-all duration-300"
                  style={{ width: `${subProgress.percent}%` }}
                />
              </div>
            )}

            {/* Subtask list */}
            <div className="space-y-1 mb-3">
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 group px-3 py-2.5 rounded-lg hover:bg-[#FBFBFA] transition-colors"
                >
                  <button
                    onClick={() => toggleSubtask(sub.id)}
                    aria-label={sub.done ? "Marquer comme non fait" : "Marquer comme fait"}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${
                      sub.done
                        ? "bg-[#4F46E5] border-[#4F46E5]"
                        : "border-[#D0D0CE] hover:border-[#4F46E5]"
                    }`}
                  >
                    {sub.done && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`flex-1 text-[14px] ${
                      sub.done ? "text-[#BBB] line-through" : "text-[#191919]"
                    }`}
                  >
                    {sub.text}
                  </span>
                  <button
                    onClick={() => deleteSubtask(sub.id)}
                    aria-label="Supprimer"
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#FEF2F2] transition-all cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask */}
            <div className="flex items-center gap-2">
              <input
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                placeholder="Ajouter une sous-tâche..."
                className="flex-1 bg-white border border-[#E6E6E4] rounded-lg px-3 py-2.5 text-[13px] text-[#191919] placeholder-[#CCC] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
              />
              <button
                onClick={addSubtask}
                disabled={!newSubtaskText.trim()}
                className="text-[13px] text-[#4F46E5] font-medium px-4 py-2.5 rounded-lg hover:bg-[#EEF2FF] transition-colors disabled:opacity-30 cursor-pointer"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Right column — Metadata */}
        <div className="space-y-4">
          {/* Due date */}
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-4">
            <label className="text-[11px] text-[#999] font-semibold uppercase tracking-wider block mb-2">
              Échéance
            </label>
            <input
              type="date"
              value={task.dueDate || ""}
              onChange={(e) => update({ dueDate: e.target.value || undefined })}
              className="w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
            />
            {dueStat === "overdue" && (
              <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#EF4444] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                En retard
              </div>
            )}
            {dueStat === "soon" && (
              <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#F59E0B] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                Bientot
              </div>
            )}
          </div>

          {/* Client */}
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-4">
            <label className="text-[11px] text-[#999] font-semibold uppercase tracking-wider block mb-2">
              Client
            </label>
            <ClientAutocomplete
              clientId={task.clientId}
              clientName={task.clientName}
              onChange={(clientId, clientName) =>
                update({ clientId, clientName })
              }
            />
            {task.clientName && task.clientId && (
              <div className="mt-2">
                <RelationBadge
                  type="client"
                  label={task.clientName}
                  href={`/clients?id=${task.clientId}`}
                />
              </div>
            )}
          </div>

          {/* Order link */}
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-4">
            <label className="text-[11px] text-[#999] font-semibold uppercase tracking-wider block mb-2">
              Commande liée
            </label>
            <input
              value={task.orderTitle || ""}
              onChange={(e) => update({ orderTitle: e.target.value || undefined })}
              placeholder="Titre de la commande..."
              className="w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] placeholder-[#CCC] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
            />
            {task.orderTitle && task.orderId && (
              <div className="mt-2">
                <RelationBadge
                  type="order"
                  label={task.orderTitle}
                  href={`/commandes?id=${task.orderId}`}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-4">
            <label className="text-[11px] text-[#999] font-semibold uppercase tracking-wider block mb-2">
              Tags
            </label>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[11px] text-[#666] bg-[#F7F7F5] px-2 py-1 rounded-md"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    aria-label={`Supprimer le tag ${tag}`}
                    className="hover:text-[#EF4444] transition-colors cursor-pointer"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="Ajouter un tag..."
                className="flex-1 bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#191919] placeholder-[#CCC] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
              />
              <button
                onClick={addTag}
                disabled={!newTag.trim()}
                className="text-[12px] text-[#4F46E5] font-medium px-3 py-2 rounded-lg hover:bg-[#EEF2FF] transition-colors disabled:opacity-30 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-4 space-y-2">
            <label className="text-[11px] text-[#999] font-semibold uppercase tracking-wider block mb-2">
              Actions
            </label>

            {/* Schedule */}
            <ScheduleButton onSchedule={handleSchedule} defaultDate={task.dueDate} />

            {/* Duplicate */}
            <button
              onClick={handleDuplicate}
              className="w-full flex items-center gap-2 text-[13px] text-[#666] font-medium px-3 py-2.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Dupliquer
            </button>

            <button
              onClick={handleArchive}
              className="w-full flex items-center gap-2 text-[13px] text-[#666] font-medium px-3 py-2.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" rx="1" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
              Archiver
            </button>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center gap-2 text-[13px] text-[#EF4444] font-medium px-3 py-2.5 rounded-lg hover:bg-[#FEF2F2] transition-colors cursor-pointer"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Supprimer
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="text-[12px] text-[#EF4444] font-medium">Confirmer ?</span>
                <button
                  onClick={handleDelete}
                  className="text-[12px] text-white bg-[#EF4444] hover:bg-[#DC2626] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Oui
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-[12px] text-[#666] px-2 py-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                >
                  Non
                </button>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="text-[11px] text-[#CCC] px-4 space-y-1">
            <p>Créé le {formatDate(task.createdAt)}</p>
            <p>Modifié le {formatDate(task.updatedAt)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Schedule Button (inline in task page sidebar) ── */
function ScheduleButton({
  onSchedule,
  defaultDate,
}: {
  onSchedule: (date: string, startTime?: string) => void;
  defaultDate?: string;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(defaultDate || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("");

  if (!open) {
    return (
      <button
        onClick={() => { setDate(defaultDate || new Date().toISOString().slice(0, 10)); setOpen(true); }}
        className="w-full flex items-center gap-2 text-[13px] text-[#4F46E5] font-medium px-3 py-2.5 rounded-lg hover:bg-[#EEF2FF] transition-colors cursor-pointer"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Planifier au calendrier
      </button>
    );
  }

  return (
    <div className="bg-[#FBFBFA] border border-[#E6E6E4] rounded-lg p-3 space-y-2">
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 bg-white border border-[#E6E6E4] rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:border-[#4F46E5]/30"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-24 bg-white border border-[#E6E6E4] rounded-lg px-2 py-1.5 text-[12px] focus:outline-none focus:border-[#4F46E5]/30"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { onSchedule(date, time || undefined); setOpen(false); }}
          disabled={!date}
          className="text-[11px] text-white bg-[#4F46E5] hover:bg-[#4338CA] px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
        >
          Ajouter
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-[11px] text-[#666] px-2 py-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
