"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Ticket {
  id: string;
  title: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_at: string | null;
  last_message_preview: string | null;
  category: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  is_admin: boolean;
  sender_type: "user" | "admin" | "system";
  created_at: string;
}

interface Attachment {
  id: string;
  ticket_id: string;
  message_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface TicketDetail {
  ticket: Ticket;
  messages: Message[];
  attachments: Attachment[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const STATUS_MAP: Record<
  Ticket["status"],
  { label: string; color: string; bg: string }
> = {
  open: { label: "Ouvert", color: "#16A34A", bg: "#F0FDF4" },
  in_progress: { label: "En cours", color: "#2563EB", bg: "#EFF6FF" },
  resolved: { label: "R\u00e9solu", color: "#059669", bg: "#ECFDF5" },
  closed: { label: "Ferm\u00e9", color: "#8A8A88", bg: "#F7F7F5" },
};

const CATEGORIES = [
  { value: "", label: "Aucune cat\u00e9gorie" },
  { value: "general", label: "G\u00e9n\u00e9ral" },
  { value: "bug", label: "Bug" },
  { value: "billing", label: "Facturation" },
  { value: "feature", label: "Fonctionnalit\u00e9" },
];

type FilterTab = "all" | "open" | "resolved";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function relativeDate(iso: string | null): string {
  if (!iso) return "\u2014";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "\u00e0 l\u2019instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function isImageType(type: string): boolean {
  return type.startsWith("image/");
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: Ticket["status"] }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: s.color }}
      />
      {s.label}
    </span>
  );
}

function StatusDot({ status }: { status: Ticket["status"] }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: s.color }}
    />
  );
}

// ---------------------------------------------------------------------------
// Icons (inline SVGs)
// ---------------------------------------------------------------------------
function IconChat({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconSend({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconPaperclip({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function IconBack({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconMail({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconFile({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IconX({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconPlus({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------
function TicketListSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg p-3">
          <div className="h-4 w-3/4 bg-[#F7F7F5] rounded animate-pulse mb-2" />
          <div className="h-3 w-1/2 bg-[#F7F7F5] rounded animate-pulse mb-2" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-[#F7F7F5] rounded-full animate-pulse" />
            <div className="h-3 w-16 bg-[#F7F7F5] rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Ticket Modal
// ---------------------------------------------------------------------------
function CreateTicketModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (ticket: Ticket) => void;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const created = await apiFetch<Ticket>("/api/support", {
        method: "POST",
        body: {
          title: title.trim(),
          message: message.trim() || undefined,
          category: category || undefined,
        },
      });
      toast.success("Ticket cr\u00e9\u00e9");
      onCreated(created);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la cr\u00e9ation"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/10" onClick={onClose} />

      <motion.div
        className="relative bg-white rounded-xl border border-[#E6E6E4] shadow-lg w-full max-w-md mx-4 p-6"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-[16px] font-semibold text-[#191919] mb-4">
          Nouveau ticket
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#5A5A58] mb-1.5">
              Titre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="D\u00e9crivez votre probl\u00e8me..."
              className="w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#5A5A58] mb-1.5">
              Cat\u00e9gorie{" "}
              <span className="text-[#8A8A88]">(optionnel)</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#5A5A58] mb-1.5">
              Message <span className="text-[#8A8A88]">(optionnel)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="D\u00e9tails suppl\u00e9mentaires..."
              rows={4}
              className="w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[#5A5A58] hover:text-[#191919] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="bg-[#4F46E5] text-white rounded-lg px-4 py-2 text-[13px] font-medium hover:bg-[#4338CA] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Cr\u00e9ation..." : "Cr\u00e9er le ticket"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Ticket Conversation (right panel)
// ---------------------------------------------------------------------------
function TicketConversation({
  ticketId,
  onBack,
  onStatusChange,
}: {
  ticketId: string;
  onBack: () => void;
  onStatusChange: () => void;
}) {
  const { data, loading, error, mutate } = useApi<TicketDetail>(
    `/api/support/${ticketId}`
  );
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingFilePreview, setPendingFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    if (data?.messages) scrollToBottom();
  }, [data?.messages, scrollToBottom]);

  // Reset state when ticket changes
  useEffect(() => {
    setReply("");
    setPendingFile(null);
    setPendingFilePreview(null);
  }, [ticketId]);

  // Auto-resize textarea
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setReply(e.target.value);
      const ta = e.target;
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 96) + "px";
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPendingFile(file);
      if (isImageType(file.type)) {
        const url = URL.createObjectURL(file);
        setPendingFilePreview(url);
      } else {
        setPendingFilePreview(null);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    []
  );

  const clearPendingFile = useCallback(() => {
    if (pendingFilePreview) URL.revokeObjectURL(pendingFilePreview);
    setPendingFile(null);
    setPendingFilePreview(null);
  }, [pendingFilePreview]);

  const handleSend = useCallback(async () => {
    if (!reply.trim() && !pendingFile) return;
    setSending(true);
    try {
      // 1. Upload attachment if present
      if (pendingFile) {
        const formData = new FormData();
        formData.append("file", pendingFile);
        formData.append("ticket_id", ticketId);
        const res = await fetch("/api/support/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Erreur upload");
        }
      }
      // 2. Send message
      if (reply.trim()) {
        await apiFetch(`/api/support/${ticketId}/messages`, {
          method: "POST",
          body: { message: reply.trim() },
        });
      }
      setReply("");
      clearPendingFile();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      mutate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l\u2019envoi"
      );
    } finally {
      setSending(false);
    }
  }, [reply, pendingFile, ticketId, clearPendingFile, mutate]);

  const handleResolve = useCallback(async () => {
    setResolving(true);
    try {
      await apiFetch(`/api/support/${ticketId}`, {
        method: "PATCH",
        body: { status: "resolved" },
      });
      toast.success("Ticket marqu\u00e9 comme r\u00e9solu");
      mutate();
      onStatusChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setResolving(false);
    }
  }, [ticketId, mutate, onStatusChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleAttachmentClick = useCallback(
    async (attachmentId: string) => {
      try {
        const res = await fetch(`/api/support/attachment/${attachmentId}`);
        if (!res.ok) throw new Error("Erreur");
        const { url } = await res.json();
        window.open(url, "_blank");
      } catch {
        toast.error("Impossible d\u2019ouvrir le fichier");
      }
    },
    []
  );

  // Build a map of attachments by message_id
  const attachmentsByMessage = useMemo(() => {
    const map = new Map<string, Attachment[]>();
    if (!data?.attachments) return map;
    for (const att of data.attachments) {
      const key = att.message_id || "__ticket__";
      const list = map.get(key) || [];
      list.push(att);
      map.set(key, list);
    }
    return map;
  }, [data?.attachments]);

  // Loading
  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="border-b border-[#E6E6E4] px-5 py-4">
          <div className="h-5 w-48 bg-[#F7F7F5] rounded animate-pulse" />
        </div>
        <div className="flex-1 p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <div className="h-16 w-56 bg-[#F7F7F5] rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
          <button
            onClick={mutate}
            className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer"
          >
            R\u00e9essayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { ticket, messages } = data;
  const isClosed = ticket.status === "closed";
  const canCompose =
    ticket.status === "open" ||
    ticket.status === "in_progress" ||
    ticket.status === "resolved";

  return (
    <motion.div
      className="flex-1 flex flex-col min-h-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      key={ticketId}
    >
      {/* Header bar */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#E6E6E4] flex-shrink-0">
        {/* Back button — mobile only */}
        <button
          onClick={onBack}
          className="flex sm:hidden items-center justify-center w-8 h-8 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer flex-shrink-0"
        >
          <IconBack size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-semibold text-[#191919] truncate">
            {ticket.title}
          </h2>
        </div>

        <StatusBadge status={ticket.status} />

        {!isClosed && ticket.status !== "resolved" && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="hidden sm:inline-flex px-3 py-1.5 text-[12px] font-medium text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg hover:bg-[#D1FAE5] transition-colors cursor-pointer disabled:opacity-40 whitespace-nowrap"
          >
            {resolving ? "..." : "Marquer r\u00e9solu"}
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 && (
          <p className="text-[13px] text-[#8A8A88] text-center py-8">
            Aucun message pour l&apos;instant.
          </p>
        )}

        {messages.map((msg) => {
          const msgAttachments = attachmentsByMessage.get(msg.id) || [];

          // System message
          if (msg.sender_type === "system") {
            return (
              <div key={msg.id} className="flex justify-center py-1">
                <span className="text-[12px] italic text-[#8A8A88]">
                  {msg.message}
                </span>
              </div>
            );
          }

          const isAdmin = msg.sender_type === "admin" || msg.is_admin;
          const isUser = !isAdmin;

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[75%]">
                {isAdmin && (
                  <span className="block text-[11px] font-medium text-[#4F46E5] mb-1">
                    Support Jestly
                  </span>
                )}
                <div
                  className={`rounded-xl px-4 py-2.5 text-[13px] leading-relaxed ${
                    isAdmin
                      ? "bg-[#F7F7F5] text-[#191919] rounded-tl-sm"
                      : "bg-[#EEF2FF] text-[#191919] rounded-tr-sm"
                  }`}
                >
                  {msg.message}
                </div>

                {/* Attachments for this message */}
                {msgAttachments.length > 0 && (
                  <div className="mt-1.5 space-y-1.5">
                    {msgAttachments.map((att) =>
                      isImageType(att.file_type) ? (
                        <button
                          key={att.id}
                          onClick={() => handleAttachmentClick(att.id)}
                          className="block cursor-pointer"
                        >
                          <div className="max-w-[240px] rounded-lg border border-[#E6E6E4] overflow-hidden hover:border-[#4F46E5]/30 transition-colors">
                            {/* We show a placeholder since we need a signed URL */}
                            <div className="bg-[#F7F7F5] px-3 py-2 flex items-center gap-2">
                              <IconFile size={14} />
                              <span className="text-[12px] text-[#5A5A58] truncate">
                                {att.file_name}
                              </span>
                              <span className="text-[11px] text-[#8A8A88] ml-auto whitespace-nowrap">
                                {formatFileSize(att.file_size)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <button
                          key={att.id}
                          onClick={() => handleAttachmentClick(att.id)}
                          className="flex items-center gap-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 hover:border-[#4F46E5]/30 transition-colors cursor-pointer"
                        >
                          <IconFile size={14} />
                          <span className="text-[12px] text-[#5A5A58] truncate max-w-[160px]">
                            {att.file_name}
                          </span>
                          <span className="text-[11px] text-[#8A8A88] whitespace-nowrap">
                            {formatFileSize(att.file_size)}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                )}

                <span
                  className={`block text-[11px] text-[#8A8A88] mt-1 ${
                    isUser ? "text-right" : "text-left"
                  }`}
                >
                  {relativeDate(msg.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-[#EFEFEF] flex-shrink-0">
        {isClosed ? (
          <div className="px-5 py-4">
            <p className="text-[13px] text-[#8A8A88] text-center">
              Ce ticket est ferm\u00e9
            </p>
          </div>
        ) : canCompose ? (
          <div className="px-4 py-3">
            {/* Pending file preview */}
            {pendingFile && (
              <div className="flex items-center gap-2 mb-2 bg-[#F7F7F5] rounded-lg px-3 py-2">
                {pendingFilePreview ? (
                  <Image
                    src={pendingFilePreview}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                    unoptimized
                  />
                ) : (
                  <IconFile size={16} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[#191919] truncate">
                    {pendingFile.name}
                  </p>
                  <p className="text-[11px] text-[#8A8A88]">
                    {formatFileSize(pendingFile.size)}
                  </p>
                </div>
                <button
                  onClick={clearPendingFile}
                  className="text-[#8A8A88] hover:text-[#191919] transition-colors cursor-pointer flex-shrink-0"
                >
                  <IconX size={14} />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Attachment button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-[#8A8A88] hover:text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors cursor-pointer flex-shrink-0 mb-px"
              >
                <IconPaperclip size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={reply}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="\u00c9crivez votre message..."
                rows={1}
                className="flex-1 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all resize-none"
                style={{ maxHeight: 96 }}
              />

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={(!reply.trim() && !pendingFile) || sending}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 mb-px"
              >
                <IconSend size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Welcome state (right panel, no ticket selected)
// ---------------------------------------------------------------------------
function WelcomePanel({ onNewTicket }: { onNewTicket: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        className="text-center max-w-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 rounded-full bg-[#F7F7F5] flex items-center justify-center mx-auto mb-5 text-[#BBB]">
          <IconChat size={32} />
        </div>
        <p className="text-[14px] text-[#5A5A58] mb-6 leading-relaxed">
          S\u00e9lectionnez un ticket ou cr\u00e9ez-en un nouveau
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onNewTicket}
            className="bg-[#4F46E5] text-white rounded-lg px-4 py-2.5 text-[13px] font-medium hover:bg-[#4338CA] transition-colors cursor-pointer"
          >
            Nouveau ticket
          </button>
          <a
            href="mailto:jestly@gmail.com"
            className="inline-flex items-center gap-2 bg-white border border-[#E6E6E4] text-[#191919] rounded-lg px-4 py-2.5 text-[13px] font-medium hover:bg-[#FBFBFA] transition-colors"
          >
            <IconMail size={15} />
            Envoyer un email
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function SupportPage() {
  const {
    data: tickets,
    loading,
    error,
    mutate,
  } = useApi<Ticket[]>("/api/support", []);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");
  // Mobile: when a ticket is selected, show conversation full-screen
  const [mobileShowConversation, setMobileShowConversation] = useState(false);

  // Sort tickets by updated_at desc
  const sorted = useMemo(() => {
    const list = [...(tickets ?? [])];
    return list.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [tickets]);

  // Filter tickets
  const filtered = useMemo(() => {
    if (filter === "open")
      return sorted.filter(
        (t) => t.status === "open" || t.status === "in_progress"
      );
    if (filter === "resolved")
      return sorted.filter(
        (t) => t.status === "resolved" || t.status === "closed"
      );
    return sorted;
  }, [sorted, filter]);

  const handleSelectTicket = useCallback((id: string) => {
    setSelectedTicketId(id);
    setMobileShowConversation(true);
  }, []);

  const handleBack = useCallback(() => {
    setMobileShowConversation(false);
    setSelectedTicketId(null);
  }, []);

  const handleTicketCreated = useCallback(
    (ticket: Ticket) => {
      setShowCreate(false);
      mutate();
      setSelectedTicketId(ticket.id);
      setMobileShowConversation(true);
    },
    [mutate]
  );

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "open", label: "Ouverts" },
    { key: "resolved", label: "R\u00e9solus" },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      <div className="h-full flex" style={{ minHeight: "calc(100vh - 64px)" }}>
        {/* ================================================================ */}
        {/* LEFT PANEL                                                       */}
        {/* ================================================================ */}
        <div
          className={`w-full sm:w-[340px] sm:flex-shrink-0 border-r border-[#E6E6E4] flex flex-col bg-white ${
            mobileShowConversation ? "hidden sm:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="px-4 pt-5 pb-3 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-[18px] font-bold text-[#191919]">Support</h1>
              <p className="text-[12px] text-[#8A8A88] mt-0.5 mb-3">
                Besoin d&apos;aide ?
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#4F46E5] text-white rounded-lg px-4 py-2.5 text-[13px] font-medium hover:bg-[#4338CA] transition-colors cursor-pointer"
              >
                <IconPlus size={15} />
                Nouveau ticket
              </button>
            </motion.div>
          </div>

          {/* Quick contact */}
          <div className="px-4 pb-3 flex-shrink-0">
            <a
              href="mailto:jestly@gmail.com"
              className="text-[12px] text-[#8A8A88] hover:text-[#4F46E5] transition-colors"
            >
              Ou envoyez-nous un email &rarr;{" "}
              <span className="underline">jestly@gmail.com</span>
            </a>
          </div>

          {/* Filter tabs */}
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="flex items-center gap-1 bg-[#F7F7F5] rounded-lg p-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex-1 text-[12px] font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    filter === tab.key
                      ? "bg-white text-[#191919] shadow-sm"
                      : "text-[#8A8A88] hover:text-[#5A5A58]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <TicketListSkeleton />
            ) : error ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[13px] text-red-500 mb-2">
                  Erreur : {error}
                </p>
                <button
                  onClick={mutate}
                  className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer"
                >
                  R\u00e9essayer
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-[13px] text-[#8A8A88]">Aucun ticket</p>
              </div>
            ) : (
              <div className="px-2 py-1">
                {filtered.map((ticket) => {
                  const isSelected = ticket.id === selectedTicketId;
                  return (
                    <motion.button
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket.id)}
                      className={`w-full text-left rounded-lg px-3 py-3 transition-all cursor-pointer mb-0.5 ${
                        isSelected
                          ? "bg-[#EEF2FF] border-l-2 border-[#4F46E5]"
                          : "hover:bg-[#FBFBFA] border-l-2 border-transparent"
                      }`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`text-[14px] font-medium truncate flex-1 ${
                            isSelected ? "text-[#4F46E5]" : "text-[#191919]"
                          }`}
                        >
                          {ticket.title}
                        </span>
                      </div>
                      {ticket.last_message_preview && (
                        <p className="text-[12px] text-[#8A8A88] truncate mt-1">
                          {ticket.last_message_preview}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <StatusDot status={ticket.status} />
                        <span className="text-[11px] text-[#8A8A88]">
                          {relativeDate(
                            ticket.last_message_at || ticket.updated_at
                          )}
                        </span>
                        {ticket.message_count > 0 && (
                          <span className="text-[11px] text-[#8A8A88] ml-auto">
                            {ticket.message_count} msg
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* RIGHT PANEL                                                      */}
        {/* ================================================================ */}
        <div
          className={`flex-1 flex flex-col bg-white min-w-0 ${
            mobileShowConversation ? "flex" : "hidden sm:flex"
          }`}
        >
          {selectedTicketId ? (
            <TicketConversation
              ticketId={selectedTicketId}
              onBack={handleBack}
              onStatusChange={mutate}
            />
          ) : (
            <WelcomePanel onNewTicket={() => setShowCreate(true)} />
          )}
        </div>
      </div>

      {/* Create ticket modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateTicketModal
            onClose={() => setShowCreate(false)}
            onCreated={handleTicketCreated}
          />
        )}
      </AnimatePresence>
    </>
  );
}
