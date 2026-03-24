"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModKey } from "@/lib/hooks/use-platform";
import {
  PRIORITY_CONFIG,
  createId,
  type Subtask,
  type TaskPriority,
  type ChecklistItem,
  type SubtaskComment,
} from "@/lib/tasks-utils";

/* ── Timer formatting ── */
function fmtTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `il y a ${days}j`;
}

/* ── Props ── */
interface SubtaskDetailPanelProps {
  subtask: Subtask | null;
  index: number;
  total: number;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: Subtask) => void;
  onDelete: (id: string) => void;
  onNavigate: (direction: "prev" | "next") => void;
}

export default function SubtaskDetailPanel({
  subtask,
  index,
  total,
  open,
  onClose,
  onUpdate,
  onDelete,
  onNavigate,
}: SubtaskDetailPanelProps) {
  const modKey = useModKey();
  const [local, setLocal] = useState<Subtask | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newComment, setNewComment] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [activeSection, setActiveSection] = useState<"notes" | "checklist" | "comments">("notes");
  const titleRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const commentRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (subtask) {
      // If timer was running on previous subtask, save elapsed time before switching
      if (timerRunning && local && timerElapsed > 0) {
        onUpdate({ ...local, timeSpent: (local.timeSpent || 0) + timerElapsed });
      }
      setLocal({ ...subtask });
      setShowDeleteConfirm(false);
      setNewCheckItem("");
      setNewTag("");
      setNewComment("");
      setTimerElapsed(0);
      setTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtask]);

  // Auto-resize notes
  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.style.height = "auto";
      notesRef.current.style.height = notesRef.current.scrollHeight + "px";
    }
  }, [local?.notes]);

  // Timer interval
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerElapsed((e) => e + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  // Save timer on panel close
  useEffect(() => {
    if (!open && timerRunning && local && timerElapsed > 0) {
      onUpdate({ ...local, timeSpent: (local.timeSpent || 0) + timerElapsed });
      setTimerRunning(false);
      setTimerElapsed(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && local) onUpdate(local);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, local, onClose, onUpdate]);

  if (!local) return null;

  const update = (patch: Partial<Subtask>) => {
    const updated = { ...local, ...patch };
    setLocal(updated);
    onUpdate(updated);
  };

  // ── Checklist ──
  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    const item: ChecklistItem = { id: createId(), text: newCheckItem.trim(), done: false };
    update({ checklist: [...(local.checklist || []), item] });
    setNewCheckItem("");
  };
  const toggleCheckItem = (id: string) => {
    update({ checklist: (local.checklist || []).map((c) => c.id === id ? { ...c, done: !c.done } : c) });
  };
  const deleteCheckItem = (id: string) => {
    update({ checklist: (local.checklist || []).filter((c) => c.id !== id) });
  };

  // ── Tags ──
  const addTag = () => {
    if (!newTag.trim() || (local.tags || []).includes(newTag.trim())) return;
    update({ tags: [...(local.tags || []), newTag.trim()] });
    setNewTag("");
  };
  const removeTag = (tag: string) => update({ tags: (local.tags || []).filter((t) => t !== tag) });

  // ── Comments ──
  const addComment = () => {
    if (!newComment.trim()) return;
    const comment: SubtaskComment = { id: createId(), content: newComment.trim(), createdAt: new Date().toISOString() };
    update({ comments: [...(local.comments || []), comment] });
    setNewComment("");
  };
  const deleteComment = (id: string) => {
    update({ comments: (local.comments || []).filter((c) => c.id !== id) });
  };

  // ── Timer ──
  const toggleTimer = () => {
    if (timerRunning) {
      // Stop → save elapsed
      update({ timeSpent: (local.timeSpent || 0) + timerElapsed });
      setTimerElapsed(0);
      setTimerRunning(false);
    } else {
      setTimerRunning(true);
    }
  };

  const checkProgress = local.checklist && local.checklist.length > 0
    ? { done: local.checklist.filter((c) => c.done).length, total: local.checklist.length }
    : null;
  const priorityCfg = PRIORITY_CONFIG[local.priority || "medium"];
  const totalTime = (local.timeSpent || 0) + timerElapsed;
  const comments = local.comments || [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/10 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Détail de la sous-tâche"
            className="fixed top-0 right-0 bottom-0 w-full sm:max-w-lg bg-white border-l border-[#E6E6E4] border-l-[3px] z-50 flex flex-col shadow-xl"
            style={{ borderLeftColor: priorityCfg.dot }}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#E6E6E4] bg-[#FAFAF9]">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-0.5">
                  <button onClick={() => onNavigate("prev")} disabled={index === 0} aria-label="Précédente" className="p-1 rounded hover:bg-white cursor-pointer disabled:opacity-20 disabled:cursor-default transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                  </button>
                  <button onClick={() => onNavigate("next")} disabled={index === total - 1} aria-label="Suivante" className="p-1 rounded hover:bg-white cursor-pointer disabled:opacity-20 disabled:cursor-default transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                </div>
                <span className="text-[11px] text-[#999] font-medium">Sous-tâche {index + 1}/{total}</span>

                {/* Timer */}
                <button
                  onClick={toggleTimer}
                  className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-all cursor-pointer ${
                    timerRunning ? "bg-[#FEF2F2] text-[#EF4444]" : totalTime > 0 ? "bg-[#F7F7F5] text-[#666]" : "bg-[#F7F7F5] text-[#BBB] hover:text-[#666]"
                  }`}
                >
                  {timerRunning ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  )}
                  {totalTime > 0 || timerRunning ? fmtTime(totalTime) : "Timer"}
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="text-[9px] text-[#CCC] bg-[#F7F7F5] px-1 py-0.5 rounded border border-[#EFEFEF] hidden sm:inline">Esc</kbd>
                <button onClick={onClose} aria-label="Fermer" className="p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-5 space-y-4">
                {/* Title */}
                <input
                  ref={titleRef}
                  value={local.text}
                  onChange={(e) => update({ text: e.target.value })}
                  placeholder="Titre de la sous-tâche..."
                  className="w-full text-[17px] sm:text-[18px] font-bold text-[#191919] placeholder-[#CCC] border-none outline-none bg-transparent"
                />

                {/* Priority + Date */}
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-[180px]">
                    <label className="text-[10px] text-[#999] font-semibold uppercase tracking-wider block mb-1">Priorité</label>
                    <div className="flex gap-1 flex-wrap">
                      {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((pr) => {
                        const cfg = PRIORITY_CONFIG[pr];
                        const active = (local.priority || "medium") === pr;
                        return (
                          <button key={pr} onClick={() => update({ priority: pr })}
                            className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-all cursor-pointer"
                            style={{ background: active ? cfg.bg : "transparent", color: active ? cfg.color : "#BBB", border: active ? "none" : "1px solid #EFEFEF" }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#999] font-semibold uppercase tracking-wider block mb-1">Échéance</label>
                    <input type="date" value={local.dueDate || ""} onChange={(e) => update({ dueDate: e.target.value || undefined })}
                      className="bg-white border border-[#E6E6E4] rounded-lg px-2.5 py-1.5 text-[12px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all" />
                  </div>
                </div>

                {/* Tags inline */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(local.tags || []).map((tag, i) => (
                    <span key={`${tag}-${i}`} className="flex items-center gap-1 text-[10px] text-[#666] bg-[#F7F7F5] px-1.5 py-0.5 rounded-md">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-[#EF4444] cursor-pointer transition-colors">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </span>
                  ))}
                  <input value={newTag} onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
                    placeholder="+ tag"
                    className="w-16 bg-transparent border-none text-[10px] text-[#999] placeholder-[#CCC] outline-none focus:text-[#191919]" />
                </div>

                {/* ── Section tabs ── */}
                <div className="flex gap-0.5 border-b border-[#EFEFEF]">
                  {([["notes", "Notes"], ["checklist", `Liste${checkProgress ? ` (${checkProgress.done}/${checkProgress.total})` : ""}`], ["comments", `Commentaires${comments.length > 0 ? ` (${comments.length})` : ""}`]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setActiveSection(key as typeof activeSection)}
                      className={`px-3 py-2 text-[11px] font-medium transition-colors cursor-pointer ${activeSection === key ? "text-[#4F46E5] border-b-2 border-[#4F46E5]" : "text-[#999] hover:text-[#666]"}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* ── Notes section ── */}
                {activeSection === "notes" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                    <textarea
                      ref={notesRef}
                      value={local.notes || ""}
                      onChange={(e) => update({ notes: e.target.value })}
                      placeholder="Notes, instructions, contexte...&#10;&#10;Supporte le formatage simple :&#10;- listes avec tiret&#10;**gras** / *italique*"
                      rows={6}
                      className="w-full bg-[#FBFBFA] border border-[#E6E6E4] rounded-lg px-3 py-2.5 text-[13px] text-[#191919] placeholder-[#CCC] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all resize-none leading-relaxed font-mono"
                      style={{ minHeight: "120px" }}
                    />
                  </motion.div>
                )}

                {/* ── Checklist section ── */}
                {activeSection === "checklist" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                    {checkProgress && checkProgress.total > 0 && (
                      <div className="w-full h-1.5 bg-[#EFEFEF] rounded-full overflow-hidden mb-3">
                        <motion.div className="h-full bg-[#4F46E5] rounded-full" initial={false}
                          animate={{ width: `${Math.round((checkProgress.done / checkProgress.total) * 100)}%` }}
                          transition={{ duration: 0.3 }} />
                      </div>
                    )}

                    <div className="space-y-0.5 mb-2">
                      {(local.checklist || []).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-[#FBFBFA] transition-colors">
                          <button onClick={() => toggleCheckItem(item.id)}
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${item.done ? "bg-[#4F46E5] border-[#4F46E5]" : "border-[#D0D0CE] hover:border-[#4F46E5]"}`}>
                            {item.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                          </button>
                          <span className={`flex-1 text-[13px] ${item.done ? "text-[#BBB] line-through" : "text-[#191919]"}`}>{item.text}</span>
                          <button onClick={() => deleteCheckItem(item.id)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#FEF2F2] cursor-pointer transition-all">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    {(local.checklist || []).length === 0 && (
                      <div className="text-center py-6 text-[12px] text-[#CCC] border border-dashed border-[#E6E6E4] rounded-lg mb-2">
                        Aucun élément — ajoutez-en un ci-dessous
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input value={newCheckItem} onChange={(e) => setNewCheckItem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCheckItem()}
                        placeholder="Ajouter un élément..."
                        className="flex-1 bg-white border border-[#E6E6E4] rounded-lg px-3 py-1.5 text-[12px] text-[#191919] placeholder-[#CCC] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all" />
                      <button onClick={addCheckItem} disabled={!newCheckItem.trim()}
                        className="text-[11px] text-[#4F46E5] font-medium px-2.5 py-1.5 rounded-lg hover:bg-[#EEF2FF] disabled:opacity-30 cursor-pointer transition-colors">+</button>
                    </div>
                  </motion.div>
                )}

                {/* ── Comments section ── */}
                {activeSection === "comments" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="space-y-3">
                    {/* Comment list */}
                    {comments.length === 0 && (
                      <div className="text-center py-6 text-[12px] text-[#CCC] border border-dashed border-[#E6E6E4] rounded-lg">
                        Aucun commentaire
                      </div>
                    )}

                    <div className="space-y-2">
                      {comments.map((c) => (
                        <div key={c.id} className="group bg-[#FBFBFA] rounded-lg px-3 py-2.5 border border-[#EFEFEF]">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-full bg-[#4F46E5] flex items-center justify-center flex-shrink-0">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                </svg>
                              </div>
                              <span className="text-[10px] text-[#999]">{relativeTime(c.createdAt)}</span>
                            </div>
                            <button onClick={() => deleteComment(c.id)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#FEF2F2] cursor-pointer transition-all">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                          </div>
                          <p className="text-[13px] text-[#191919] leading-relaxed whitespace-pre-wrap">{c.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add comment */}
                    <div className="flex items-center gap-2">
                      <input
                        ref={commentRef}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(); } }}
                        placeholder="Écrire un commentaire..."
                        className="flex-1 bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#191919] placeholder-[#CCC] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
                      />
                      <button onClick={addComment} disabled={!newComment.trim()}
                        className="text-[12px] text-white bg-[#4F46E5] hover:bg-[#4338CA] font-medium px-3 py-2 rounded-lg disabled:opacity-30 cursor-pointer transition-colors">
                        Envoyer
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-[#E6E6E4] px-4 sm:px-5 py-3 bg-[#FAFAF9]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => update({ done: !local.done })}
                    className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      local.done ? "bg-[#D1FAE5] text-[#10B981]" : "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                    }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {local.done ? "Terminée" : "Terminer"}
                  </button>
                  <kbd className="text-[9px] text-[#CCC] bg-[#F7F7F5] px-1 py-0.5 rounded border border-[#EFEFEF] hidden sm:inline">{modKey}+Enter</kbd>
                </div>

                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1 text-[12px] text-[#999] font-medium px-2.5 py-2 rounded-lg hover:bg-[#FEF2F2] hover:text-[#EF4444] cursor-pointer transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    Supprimer
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#EF4444]">Supprimer ?</span>
                    <button onClick={() => { onDelete(local.id); onClose(); }} className="text-[11px] text-white bg-[#EF4444] hover:bg-[#DC2626] px-2.5 py-1.5 rounded-lg cursor-pointer">Oui</button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="text-[11px] text-[#666] px-2 py-1.5 rounded-lg hover:bg-[#F7F7F5] cursor-pointer">Non</button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
