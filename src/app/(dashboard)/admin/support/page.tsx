"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AdminTicket {
  id: string;
  title: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview: string | null;
  category: string | null;
  user_name: string | null;
  user_email: string;
}

interface TicketDetail extends AdminTicket {
  user_name: string | null;
  user_email: string;
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

interface TicketDetailResponse {
  ticket: TicketDetail;
  messages: Message[];
  attachments: Attachment[];
}

type StatusFilter = "all" | "open" | "in_progress" | "resolved" | "closed";
type TicketStatus = AdminTicket["status"];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const STATUS_MAP: Record<TicketStatus, { label: string; color: string; bg: string }> = {
  open: { label: "Ouvert", color: "#16A34A", bg: "#F0FDF4" },
  in_progress: { label: "En cours", color: "#2563EB", bg: "#EFF6FF" },
  resolved: { label: "Résolu", color: "#059669", bg: "#ECFDF5" },
  closed: { label: "Fermé", color: "#8A8A88", bg: "#F7F7F5" },
};

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "open", label: "Ouverts" },
  { key: "in_progress", label: "En cours" },
  { key: "resolved", label: "Résolus" },
  { key: "closed", label: "Fermés" },
];

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
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function isImageType(type: string): boolean {
  return type.startsWith("image/");
}

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: TicketStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// StatusDot (compact, for list items)
// ---------------------------------------------------------------------------
function StatusDot({ status }: { status: TicketStatus }) {
  const s = STATUS_MAP[status];
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />;
}

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------
function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconPaperclip() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------
function TicketListSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 bg-[#F7F7F5] rounded animate-pulse" />
            <div className="h-2.5 w-24 bg-[#F7F7F5] rounded animate-pulse" />
          </div>
          <div className="h-3 w-full bg-[#F7F7F5] rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-[#F7F7F5] rounded-full animate-pulse" />
            <div className="h-2.5 w-14 bg-[#F7F7F5] rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="flex-1 p-5 space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
          <div className="space-y-1.5" style={{ width: "60%" }}>
            <div className="h-2.5 w-16 bg-[#F7F7F5] rounded animate-pulse" />
            <div className="h-14 bg-[#F7F7F5] rounded-xl animate-pulse" />
            <div className="h-2.5 w-12 bg-[#F7F7F5] rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
export default function AdminSupportPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const apiUrl = useMemo(() => `/api/admin/support?status=${filter}`, [filter]);
  const { data: tickets, loading: ticketsLoading, mutate: refreshTickets } = useApi<AdminTicket[]>(apiUrl, []);

  const sorted = useMemo(
    () => [...(tickets ?? [])].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [tickets]
  );

  const handleSelectTicket = useCallback((id: string) => {
    setSelectedTicketId(id);
    setMobileView("detail");
  }, []);

  const handleBackToList = useCallback(() => {
    setMobileView("list");
    setSelectedTicketId(null);
    refreshTickets();
  }, [refreshTickets]);

  // -------------------------------------------------------------------------
  // LEFT COLUMN — Ticket List
  // -------------------------------------------------------------------------
  function LeftColumn() {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <h1 className="text-[18px] font-bold text-[#1A1A1A]">Support</h1>
          {sorted.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F7F7F5] text-[#5A5A58]">
              {sorted.length}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-0 px-2 border-b border-[#E6E6E4]">
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`relative px-3 py-2 text-[12px] font-medium transition-colors cursor-pointer ${
                  isActive ? "text-[#4F46E5]" : "text-[#8A8A88] hover:text-[#5A5A58]"
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="admin-support-tab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4F46E5] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Ticket list */}
        <div className="flex-1 overflow-y-auto">
          {ticketsLoading ? (
            <TicketListSkeleton />
          ) : sorted.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-[13px] text-[#8A8A88]">
                {filter === "all"
                  ? "Aucun ticket pour le moment."
                  : `Aucun ticket ${FILTER_TABS.find((t) => t.key === filter)?.label?.toLowerCase()}.`}
              </p>
            </div>
          ) : (
            <div className="py-1">
              {sorted.map((ticket) => {
                const isSelected = selectedTicketId === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket.id)}
                    className={`w-full text-left px-4 py-3 transition-colors cursor-pointer border-l-2 ${
                      isSelected
                        ? "bg-[#EEF2FF] border-l-[#4F46E5]"
                        : "border-l-transparent hover:bg-[#FBFBFA]"
                    }`}
                  >
                    {/* User name + email */}
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[13px] font-medium text-[#1A1A1A] truncate">
                        {ticket.user_name || "Utilisateur"}
                      </span>
                      <span className="text-[11px] text-[#8A8A88] truncate flex-shrink-0">
                        {ticket.user_email}
                      </span>
                    </div>

                    {/* Ticket title */}
                    <p className="text-[13px] text-[#1A1A1A] truncate mb-0.5">
                      {ticket.title}
                    </p>

                    {/* Last message preview */}
                    {ticket.last_message_preview && (
                      <p className="text-[11px] text-[#8A8A88] truncate mb-1.5">
                        {ticket.last_message_preview}
                      </p>
                    )}

                    {/* Status dot + date */}
                    <div className="flex items-center gap-2">
                      <StatusDot status={ticket.status} />
                      <span className="text-[11px] text-[#8A8A88]">
                        {relativeDate(ticket.updated_at)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // MIDDLE + RIGHT COLUMNS — Conversation + Info
  // -------------------------------------------------------------------------
  function DetailColumns() {
    if (!selectedTicketId) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[14px] text-[#8A8A88]">Sélectionnez un ticket</p>
        </div>
      );
    }

    return (
      <TicketDetailPanel
        ticketId={selectedTicketId}
        onBack={handleBackToList}
      />
    );
  }

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------
  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden -mx-6 -my-6">
      {/* LEFT COLUMN — Ticket List */}
      {/* Mobile: show only when mobileView=list */}
      <div
        className={`w-full md:w-[300px] flex-shrink-0 border-r border-[#E6E6E4] bg-white ${
          mobileView === "detail" ? "hidden md:flex md:flex-col" : "flex flex-col"
        }`}
      >
        <LeftColumn />
      </div>

      {/* MIDDLE + RIGHT — Detail */}
      <div
        className={`flex-1 flex min-w-0 ${
          mobileView === "list" ? "hidden md:flex" : "flex"
        }`}
      >
        <DetailColumns />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ticket Detail Panel (middle + right columns)
// ---------------------------------------------------------------------------
function TicketDetailPanel({
  ticketId,
  onBack,
}: {
  ticketId: string;
  onBack: () => void;
}) {
  const { data, loading, error, mutate } = useApi<TicketDetailResponse>(
    `/api/admin/support/${ticketId}`
  );

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (data?.messages) {
      scrollToBottom();
    }
  }, [data?.messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [reply]);

  // ---- Handlers ----

  const handleSend = useCallback(async () => {
    if (!reply.trim() && !attachmentFile) return;
    setSending(true);

    try {
      // Upload attachment first if present
      let uploadedAttachment: Attachment | null = null;
      if (attachmentFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", attachmentFile);
        formData.append("ticket_id", ticketId);

        const uploadRes = await fetch("/api/support/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const body = await uploadRes.json().catch(() => ({}));
          throw new Error(body.error || "Erreur lors de l\u2019upload");
        }
        uploadedAttachment = await uploadRes.json();
        setUploading(false);
      }

      // Send message
      if (reply.trim()) {
        await apiFetch(`/api/admin/support/${ticketId}/messages`, {
          method: "POST",
          body: {
            message: reply.trim(),
            attachment_id: uploadedAttachment?.id ?? undefined,
          },
        });
      }

      setReply("");
      setAttachmentFile(null);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l\u2019envoi");
    } finally {
      setSending(false);
      setUploading(false);
    }
  }, [reply, attachmentFile, ticketId, mutate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleStatusChange = useCallback(
    async (newStatus: TicketStatus) => {
      try {
        await apiFetch(`/api/admin/support/${ticketId}`, {
          method: "PATCH",
          body: { status: newStatus },
        });
        toast.success(`Statut mis \u00e0 jour : ${STATUS_MAP[newStatus].label}`);
        mutate();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    },
    [ticketId, mutate]
  );

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachmentFile(file);
    if (e.target) e.target.value = "";
  }, []);

  const handleAttachmentClick = useCallback(async (attachmentId: string) => {
    try {
      const res = await apiFetch<{ url: string }>(`/api/support/attachment/${attachmentId}`);
      window.open(res.url, "_blank");
    } catch {
      toast.error("Impossible d\u2019ouvrir le fichier");
    }
  }, []);

  // Group attachments by message_id for easy lookup
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

  // ---- Loading / Error ----
  if (loading) {
    return (
      <>
        <div className="flex-1 flex flex-col border-r border-[#E6E6E4]">
          <div className="px-5 py-4 border-b border-[#E6E6E4]">
            <div className="h-5 w-48 bg-[#F7F7F5] rounded animate-pulse" />
          </div>
          <ConversationSkeleton />
        </div>
        <div className="w-[260px] flex-shrink-0 hidden lg:block p-5">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#F7F7F5] animate-pulse" />
            <div className="h-4 w-24 bg-[#F7F7F5] rounded animate-pulse" />
            <div className="h-3 w-32 bg-[#F7F7F5] rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-16 bg-[#F7F7F5] rounded animate-pulse" />
                <div className="h-4 w-28 bg-[#F7F7F5] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
          <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { ticket, messages } = data;

  // ---- Render ----
  return (
    <>
      {/* MIDDLE COLUMN — Conversation */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#E6E6E4] lg:border-r">
        {/* Conversation header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#E6E6E4] bg-white flex-shrink-0">
          {/* Back button — mobile only */}
          <button
            onClick={onBack}
            className="md:hidden flex items-center justify-center text-[#5A5A58] hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <IconChevronLeft />
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-semibold text-[#1A1A1A] truncate">{ticket.title}</h2>
          </div>

          <StatusBadge status={ticket.status} />
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-[13px] text-[#8A8A88] text-center py-8">
              Aucun message pour l&apos;instant.
            </p>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const msgAttachments = attachmentsByMessage.get(msg.id) || [];

              if (msg.sender_type === "system") {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                  >
                    <p className="text-[11px] text-[#8A8A88] italic px-3 py-1">
                      {msg.message}
                    </p>
                  </motion.div>
                );
              }

              const isAdmin = msg.is_admin || msg.sender_type === "admin";

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[75%]">
                    {/* Sender label */}
                    <span
                      className={`block text-[11px] font-medium mb-1 ${
                        isAdmin ? "text-[#4F46E5] text-right" : "text-[#5A5A58]"
                      }`}
                    >
                      {isAdmin ? "Vous" : ticket.user_name || "Utilisateur"}
                    </span>

                    {/* Bubble */}
                    <div
                      className={`rounded-xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                        isAdmin
                          ? "bg-[#EEF2FF] text-[#1A1A1A] rounded-tr-sm"
                          : "bg-[#F7F7F5] text-[#1A1A1A] rounded-tl-sm"
                      }`}
                    >
                      {msg.message}
                    </div>

                    {/* Message attachments */}
                    {msgAttachments.length > 0 && (
                      <div className="mt-1.5 space-y-1.5">
                        {msgAttachments.map((att) =>
                          isImageType(att.file_type) ? (
                            <button
                              key={att.id}
                              onClick={() => handleAttachmentClick(att.id)}
                              className="block cursor-pointer"
                            >
                              <div className="w-40 h-28 rounded-lg bg-[#F7F7F5] border border-[#E6E6E4] overflow-hidden flex items-center justify-center">
                                <span className="text-[11px] text-[#8A8A88] flex items-center gap-1">
                                  <IconImage /> {att.file_name}
                                </span>
                              </div>
                            </button>
                          ) : (
                            <button
                              key={att.id}
                              onClick={() => handleAttachmentClick(att.id)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E6E6E4] hover:bg-[#FBFBFA] transition-colors cursor-pointer"
                            >
                              <IconFile />
                              <div className="min-w-0">
                                <p className="text-[12px] text-[#1A1A1A] truncate">{att.file_name}</p>
                                <p className="text-[10px] text-[#8A8A88]">{formatFileSize(att.file_size)}</p>
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <span
                      className={`block text-[11px] text-[#8A8A88] mt-1 ${
                        isAdmin ? "text-right" : "text-left"
                      }`}
                    >
                      {relativeDate(msg.created_at)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-[#EFEFEF] p-4 bg-white flex-shrink-0">
          {/* Attachment preview */}
          {attachmentFile && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-[#F7F7F5] rounded-lg border border-[#E6E6E4]">
              {isImageType(attachmentFile.type) ? <IconImage /> : <IconFile />}
              <span className="text-[12px] text-[#1A1A1A] truncate flex-1">
                {attachmentFile.name}
              </span>
              <span className="text-[11px] text-[#8A8A88] flex-shrink-0">
                {formatFileSize(attachmentFile.size)}
              </span>
              <button
                onClick={() => setAttachmentFile(null)}
                className="text-[#8A8A88] hover:text-[#1A1A1A] transition-colors cursor-pointer flex-shrink-0"
              >
                <IconX />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Paperclip */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-[#8A8A88] hover:text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors cursor-pointer flex-shrink-0"
            >
              <IconPaperclip />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Répondre..."
              rows={1}
              className="flex-1 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all resize-none"
              style={{ minHeight: "36px", maxHeight: "120px" }}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={(!reply.trim() && !attachmentFile) || sending}
              className="flex items-center justify-center w-9 h-9 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {sending || uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <IconSend />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN — Info Panel (lg+ only) */}
      <div className="w-[260px] flex-shrink-0 hidden lg:flex lg:flex-col overflow-y-auto bg-white">
        <div className="p-5 space-y-6">
          {/* User section */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center mb-2">
              <span className="text-[14px] font-semibold text-[#4F46E5]">
                {getInitials(ticket.user_name, ticket.user_email)}
              </span>
            </div>
            <p className="text-[14px] font-semibold text-[#1A1A1A]">
              {ticket.user_name || "Utilisateur"}
            </p>
            <p className="text-[12px] text-[#8A8A88]">{ticket.user_email}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E6E6E4]" />

          {/* Ticket info */}
          <div className="space-y-4">
            {/* Status selector */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1.5">
                Statut
              </label>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238A8A88' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                }}
              >
                {(Object.keys(STATUS_MAP) as TicketStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_MAP[s].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Created at */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1">
                Créé le
              </label>
              <p className="text-[13px] text-[#1A1A1A]">{formatDate(ticket.created_at)}</p>
            </div>

            {/* Last activity */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1">
                Dernière activité
              </label>
              <p className="text-[13px] text-[#1A1A1A]">{relativeDate(ticket.updated_at)}</p>
            </div>

            {/* Message count */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1">
                Messages
              </label>
              <p className="text-[13px] text-[#1A1A1A]">{ticket.message_count}</p>
            </div>

            {/* Category */}
            {ticket.category && (
              <div>
                <label className="block text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1">
                  Catégorie
                </label>
                <span className="inline-block px-2 py-0.5 rounded-md text-[12px] font-medium bg-[#F7F7F5] text-[#5A5A58] border border-[#E6E6E4]">
                  {ticket.category}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          {(data.attachments ?? []).length > 0 && (
            <>
              <div className="border-t border-[#E6E6E4]" />

              {/* Attachments section */}
              <div>
                <label className="block text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-2">
                  Pièces jointes
                </label>
                <div className="space-y-1.5">
                  {data.attachments.map((att) => (
                    <button
                      key={att.id}
                      onClick={() => handleAttachmentClick(att.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#FBFBFA] border border-transparent hover:border-[#E6E6E4] transition-all cursor-pointer text-left"
                    >
                      <div className="flex-shrink-0 text-[#8A8A88]">
                        {isImageType(att.file_type) ? <IconImage /> : <IconFile />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] text-[#1A1A1A] truncate">{att.file_name}</p>
                        <p className="text-[10px] text-[#8A8A88]">{formatFileSize(att.file_size)}</p>
                      </div>
                      <div className="flex-shrink-0 text-[#8A8A88] opacity-0 group-hover:opacity-100">
                        <IconDownload />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
