"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  COLUMNS_ORDER,
  getSubtaskProgress,
  formatDate,
  createId,
  type Task,
  type TaskStatus,
  type TaskPriority,
  type Subtask,
} from "@/lib/tasks-utils";
import RelationBadge from "@/components/ui/RelationBadge";
import ClientAutocomplete from "./ClientAutocomplete";
import SubtaskDetailPanel from "./SubtaskDetailPanel";
import TaskAttachments from "./TaskAttachments";

interface TaskDetailDrawerProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate?: (task: Task) => void;
  onSchedule?: (task: Task, date: string, startTime?: string) => void;
  onSaveAsTemplate?: (task: Task) => void;
}

/* ── SubtaskText: 1 clic = ouvrir panel, 2 clics = éditer le nom ── */
function SubtaskText({ text, done, onRename, onOpen }: {
  text: string; done: boolean;
  onRename: (text: string) => void;
  onOpen: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setValue(text); }, [text]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => { setEditing(false); if (value.trim() && value !== text) onRename(value); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { setEditing(false); if (value.trim() && value !== text) onRename(value); }
          if (e.key === "Escape") { setEditing(false); setValue(text); }
        }}
        className={`flex-1 text-[13px] bg-white border border-[#4F46E5]/30 rounded px-1.5 py-0.5 outline-none ring-1 ring-[#4F46E5]/20 min-w-0 ${
          done ? "text-[#BBB]" : "text-[#191919]"
        }`}
      />
    );
  }

  return (
    <span
      onClick={onOpen}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      className={`flex-1 text-[13px] cursor-pointer hover:text-[#4F46E5] transition-colors select-none min-w-0 truncate ${
        done ? "text-[#BBB] line-through" : "text-[#191919]"
      }`}
      title="Cliquer pour ouvrir · Double-cliquer pour renommer"
    >
      {text}
    </span>
  );
}

export default function TaskDetailDrawer({
  task,
  open,
  onClose,
  onUpdate,
  onDelete,
  onArchive,
  onDuplicate,
  onSchedule,
  onSaveAsTemplate,
}: TaskDetailDrawerProps) {
  const [local, setLocal] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savedAsTemplate, setSavedAsTemplate] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [subtaskPanelOpen, setSubtaskPanelOpen] = useState(false);
  const [selectedSubIdx, setSelectedSubIdx] = useState(0);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const prevTaskIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (task) {
      // Only reset panel state when opening a DIFFERENT task
      const isNewTask = task.id !== prevTaskIdRef.current;
      prevTaskIdRef.current = task.id;

      setLocal({ ...task });
      setShowDeleteConfirm(false);
      if (isNewTask) {
        setNewSubtaskText("");
        setNewTag("");
        setShowSchedule(false);
        setSubtaskPanelOpen(false);
      }
    }
  }, [task]);

  // Auto-resize textarea
  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, [local?.description]);

  if (!local) return null;

  function update(patch: Partial<Task>) {
    const updated = { ...local!, ...patch, updatedAt: new Date().toISOString() };
    setLocal(updated);
    onUpdate(updated);
  }

  function toggleSubtask(subId: string) {
    const subs = local!.subtasks.map((s) =>
      s.id === subId ? { ...s, done: !s.done } : s
    );
    update({ subtasks: subs });
  }

  function deleteSubtask(subId: string) {
    update({ subtasks: local!.subtasks.filter((s) => s.id !== subId) });
  }

  function moveSubtaskUp(subId: string) {
    const subs = [...local!.subtasks];
    const idx = subs.findIndex((s) => s.id === subId);
    if (idx <= 0) return;
    [subs[idx], subs[idx - 1]] = [subs[idx - 1], subs[idx]];
    update({ subtasks: subs });
  }

  function moveSubtaskDown(subId: string) {
    const subs = [...local!.subtasks];
    const idx = subs.findIndex((s) => s.id === subId);
    if (idx === -1 || idx >= subs.length - 1) return;
    [subs[idx], subs[idx + 1]] = [subs[idx + 1], subs[idx]];
    update({ subtasks: subs });
  }

  function addSubtask() {
    if (!newSubtaskText.trim()) return;
    const sub: Subtask = { id: createId(), text: newSubtaskText.trim(), done: false };
    update({ subtasks: [...local!.subtasks, sub] });
    setNewSubtaskText("");
  }

  function addTag() {
    if (!newTag.trim() || local!.tags.includes(newTag.trim())) return;
    update({ tags: [...local!.tags, newTag.trim()] });
    setNewTag("");
  }

  function removeTag(tag: string) {
    update({ tags: local!.tags.filter((t) => t !== tag) });
  }

  function handleScheduleSubmit() {
    if (!scheduleDate || !onSchedule) return;
    onSchedule(local!, scheduleDate, scheduleTime || undefined);
    setShowSchedule(false);
    setScheduleDate("");
    setScheduleTime("");
  }

  const subProgress = local.subtasks.length > 0 ? getSubtaskProgress(local.subtasks) : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/10 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Détail de la tâche"
            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-xl border-l-[3px]"
            style={{ borderLeftColor: PRIORITY_CONFIG[local.priority].dot }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E6E4]">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#999] uppercase tracking-wider font-semibold">
                  Détail de la tâche
                </span>
                <a
                  href={`/tâches/${local.id}`}
                  className="text-[11px] text-[#4F46E5] hover:text-[#4338CA] font-medium flex items-center gap-1 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Ouvrir
                </a>
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="p-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                {/* Title */}
                <input
                  ref={titleRef}
                  value={local.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="Titre de la tâche..."
                  className="w-full text-[18px] font-bold text-[#191919] placeholder-[#CCC] border-none outline-none bg-transparent"
                />

                {/* Status + Priority row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <label className="text-[11px] text-[#999] font-medium block mb-1">
                      Statut
                    </label>
                    <div className="flex gap-1">
                      {COLUMNS_ORDER.map((st) => {
                        const cfg = STATUS_CONFIG[st];
                        const active = local.status === st;
                        return (
                          <button
                            key={st}
                            onClick={() => update({ status: st as TaskStatus })}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer"
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
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-[11px] text-[#999] font-medium block mb-1">
                    Priorité
                  </label>
                  <div className="flex gap-1">
                    {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((pr) => {
                      const cfg = PRIORITY_CONFIG[pr];
                      const active = local.priority === pr;
                      return (
                        <button
                          key={pr}
                          onClick={() => update({ priority: pr })}
                          className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer"
                          style={{
                            background: active ? cfg.bg : "transparent",
                            color: active ? cfg.color : "#BBB",
                            border: active ? "none" : "1px solid #EFEFEF",
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: cfg.dot }}
                          />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Due date */}
                <div>
                  <label className="text-[11px] text-[#999] font-medium block mb-1">
                    Échéance
                  </label>
                  <input
                    type="date"
                    value={local.dueDate || ""}
                    onChange={(e) => update({ dueDate: e.target.value || undefined })}
                    className="bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
                  />
                </div>

                {/* Schedule to calendar */}
                {onSchedule && (
                  <div>
                    {!showSchedule ? (
                      <button
                        onClick={() => {
                          setScheduleDate(local.dueDate || new Date().toISOString().slice(0, 10));
                          setShowSchedule(true);
                        }}
                        className="flex items-center gap-2 text-[12px] text-[#4F46E5] font-medium px-3 py-2 rounded-lg hover:bg-[#EEF2FF] transition-colors cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Planifier dans le calendrier
                      </button>
                    ) : (
                      <div className="bg-[#FBFBFA] border border-[#E6E6E4] rounded-lg p-3 space-y-2">
                        <label className="text-[11px] text-[#999] font-medium block">Planifier</label>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="flex-1 bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30"
                          />
                          <input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            placeholder="Heure"
                            className="w-28 bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleScheduleSubmit}
                            disabled={!scheduleDate}
                            className="text-[12px] text-white bg-[#4F46E5] hover:bg-[#4338CA] px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                          >
                            Ajouter au calendrier
                          </button>
                          <button
                            onClick={() => setShowSchedule(false)}
                            className="text-[12px] text-[#666] px-3 py-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Client */}
                <div>
                  <label className="text-[11px] text-[#999] font-medium block mb-1">
                    Client
                  </label>
                  <ClientAutocomplete
                    clientId={local.clientId}
                    clientName={local.clientName}
                    onChange={(clientId, clientName) =>
                      update({ clientId, clientName })
                    }
                  />
                  {local.clientName && local.clientId && (
                    <div className="mt-1.5">
                      <RelationBadge
                        type="client"
                        label={local.clientName}
                        href={`/clients?id=${local.clientId}`}
                      />
                    </div>
                  )}
                </div>

                {/* Order link */}
                <div>
                  <label className="text-[11px] text-[#999] font-medium block mb-1">
                    Commande liée
                  </label>
                  <input
                    value={local.orderTitle || ""}
                    onChange={(e) => update({ orderTitle: e.target.value || undefined })}
                    placeholder="Titre de la commande..."
                    className="w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] placeholder-[#CCC] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
                  />
                  {local.orderTitle && (
                    <div className="mt-1.5">
                      <RelationBadge
                        type="order"
                        label={local.orderTitle}
                        href={local.orderId ? `/commandes?id=${local.orderId}` : undefined}
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-[11px] text-[#999] font-medium block mb-1">
                    Notes
                  </label>
                  <textarea
                    ref={descRef}
                    value={local.description || ""}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Ajouter des notes..."
                    rows={3}
                    className="w-full bg-[#FBFBFA] border border-[#E6E6E4] rounded-lg px-3 py-2.5 text-[13px] text-[#191919] placeholder-[#CCC] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all resize-none"
                    style={{ minHeight: "80px" }}
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="text-[11px] text-[#999] font-medium block mb-2">
                    Photos
                  </label>
                  <TaskAttachments
                    attachments={local.attachments || []}
                    onChange={(attachments) => update({ attachments })}
                  />
                </div>

                {/* Subtasks */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] text-[#999] font-medium">
                      Sous-tâches
                    </label>
                    {subProgress && (
                      <span className="text-[11px] text-[#999]">
                        {subProgress.done}/{subProgress.total} ({subProgress.percent}%)
                      </span>
                    )}
                  </div>

                  {subProgress && subProgress.total > 0 && (
                    <div className="w-full h-1.5 bg-[#EFEFEF] rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-[#4F46E5] rounded-full transition-all duration-300"
                        style={{ width: `${subProgress.percent}%` }}
                      />
                    </div>
                  )}

                  {local.subtasks.length === 0 && (
                    <div className="text-center py-4 text-[12px] text-[#CCC] border border-dashed border-[#E6E6E4] rounded-lg mb-2">
                      Aucune sous-tâche
                    </div>
                  )}

                  <div className="space-y-0.5 mb-2">
                    {local.subtasks.map((sub, i) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-1.5 group px-2 py-1.5 rounded-lg hover:bg-[#FBFBFA] transition-colors"
                      >
                        <span className="text-[10px] text-[#CCC] font-mono w-3 text-right flex-shrink-0 select-none">
                          {i + 1}
                        </span>
                        <button
                          onClick={() => toggleSubtask(sub.id)}
                          aria-label={sub.done ? "Marquer comme non fait" : "Marquer comme fait"}
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${
                            sub.done
                              ? "bg-[#4F46E5] border-[#4F46E5]"
                              : "border-[#D0D0CE] hover:border-[#4F46E5]"
                          }`}
                        >
                          {sub.done && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                        <SubtaskText
                          text={sub.text}
                          done={sub.done}
                          onRename={(text) => {
                            const subs = local.subtasks.map((s) => s.id === sub.id ? { ...s, text } : s);
                            update({ subtasks: subs });
                          }}
                          onOpen={() => { setSelectedSubIdx(i); setSubtaskPanelOpen(true); }}
                        />
                        {(sub.notes || sub.checklist?.length || sub.attachments?.length || (sub.priority && sub.priority !== "medium")) && (
                          <span className="flex items-center gap-0.5 flex-shrink-0">
                            {sub.priority && sub.priority !== "medium" && (
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY_CONFIG[sub.priority].dot }} />
                            )}
                            {sub.checklist && sub.checklist.length > 0 && (
                              <span className="text-[9px] text-[#BBB]">{sub.checklist.filter((c) => c.done).length}/{sub.checklist.length}</span>
                            )}
                            {sub.attachments && sub.attachments.length > 0 && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            )}
                          </span>
                        )}
                        <button
                          onClick={() => moveSubtaskUp(sub.id)}
                          disabled={i === 0}
                          aria-label="Monter"
                          className="p-0.5 rounded hover:bg-[#EEF2FF] transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-default"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveSubtaskDown(sub.id)}
                          disabled={i === local.subtasks.length - 1}
                          aria-label="Descendre"
                          className="p-0.5 rounded hover:bg-[#EEF2FF] transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-default"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteSubtask(sub.id)}
                          aria-label="Supprimer"
                          className="p-0.5 rounded hover:bg-[#FEF2F2] transition-colors cursor-pointer opacity-30 hover:opacity-100"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      value={newSubtaskText}
                      onChange={(e) => setNewSubtaskText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                      placeholder="Ajouter une sous-tâche..."
                      className="flex-1 bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#191919] placeholder-[#CCC] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
                    />
                    <button
                      onClick={addSubtask}
                      disabled={!newSubtaskText.trim()}
                      className="text-[12px] text-[#4F46E5] font-medium px-3 py-2 rounded-lg hover:bg-[#EEF2FF] transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-[11px] text-[#999] font-medium block mb-2">
                    Tags
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    {local.tags.map((tag, i) => (
                      <span
                        key={`${tag}-${i}`}
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
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#E6E6E4] px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[11px] text-[#BBB] space-x-3">
                  <span>Créé le {formatDate(local.createdAt)}</span>
                  <span>Modifié le {formatDate(local.updatedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Duplicate */}
                {onDuplicate && (
                  <button
                    onClick={() => onDuplicate(local)}
                    className="flex items-center gap-1.5 text-[12px] text-[#666] font-medium px-3 py-2 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Dupliquer
                  </button>
                )}

                {/* Save as template */}
                {onSaveAsTemplate && (
                  <button
                    onClick={() => {
                      onSaveAsTemplate(local);
                      setSavedAsTemplate(true);
                      setTimeout(() => setSavedAsTemplate(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-[12px] text-[#666] font-medium px-3 py-2 rounded-lg hover:bg-[#EEF2FF] hover:text-[#4F46E5] transition-colors cursor-pointer"
                  >
                    {savedAsTemplate ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-[#10B981]">Modèle enregistré</span>
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                        </svg>
                        Enregistrer comme modèle
                      </>
                    )}
                  </button>
                )}

                {/* Archive */}
                <button
                  onClick={() => onArchive(local.id)}
                  className="flex items-center gap-1.5 text-[12px] text-[#666] font-medium px-3 py-2 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="21 8 21 21 3 21 3 8" />
                    <rect x="1" y="3" width="22" height="5" rx="1" />
                    <line x1="10" y1="12" x2="14" y2="12" />
                  </svg>
                  Archiver
                </button>

                {/* Delete */}
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 text-[12px] text-[#EF4444] font-medium px-3 py-2 rounded-lg hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Supprimer
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#EF4444]">Confirmer ?</span>
                    <button
                      onClick={() => {
                        onDelete(local.id);
                        onClose();
                      }}
                      className="text-[12px] text-white bg-[#EF4444] hover:bg-[#DC2626] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Oui, supprimer
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-[12px] text-[#666] px-2 py-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Subtask Detail Panel */}
          <SubtaskDetailPanel
            subtask={local.subtasks[selectedSubIdx] || null}
            index={selectedSubIdx}
            total={local.subtasks.length}
            open={subtaskPanelOpen}
            onClose={() => setSubtaskPanelOpen(false)}
            onUpdate={(updated) => {
              const subs = local.subtasks.map((s) => (s.id === updated.id ? updated : s));
              update({ subtasks: subs });
            }}
            onDelete={(id) => {
              update({ subtasks: local.subtasks.filter((s) => s.id !== id) });
              setSubtaskPanelOpen(false);
            }}
            onNavigate={(dir) => {
              const next = dir === "prev" ? selectedSubIdx - 1 : selectedSubIdx + 1;
              if (next >= 0 && next < local.subtasks.length) setSelectedSubIdx(next);
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
