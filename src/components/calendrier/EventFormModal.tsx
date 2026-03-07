"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/hooks/use-api";
import {
  ALL_CATEGORIES,
  CATEGORY_CONFIG,
  PRIORITY_CONFIG,
  EVENT_PALETTE,
  CATEGORY_SOLID,
  toDateStr,
  type CalendarEvent,
  type EventCategory,
  type EventPriority,
} from "@/lib/calendar-utils";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: Partial<CalendarEvent>) => void;
  initialEvent?: CalendarEvent | null;
  defaultDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

/* ─── Time options: 07:00 to 22:00 in 30-min steps ─── */
const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 22; h++) {
  TIME_OPTIONS.push(`${h.toString().padStart(2, "0")}:00`);
  if (h < 22) TIME_OPTIONS.push(`${h.toString().padStart(2, "0")}:30`);
}

export default function EventFormModal({
  open,
  onClose,
  onSubmit,
  initialEvent,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
}: EventFormModalProps) {
  const isEditing = !!initialEvent;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventCategory>("appel");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<EventPriority>("medium");
  const [color, setColor] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const startPickerRef = useRef<HTMLDivElement>(null);
  const endPickerRef = useRef<HTMLDivElement>(null);

  // Fetch clients for the searchable picker
  const { data: clients } = useApi<Client[]>(open ? "/api/clients" : null);

  const filteredClients = useMemo(() => {
    if (!clients || !clientSearch.trim()) return clients || [];
    const q = clientSearch.toLowerCase();
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [clients, clientSearch]);

  // Date quick-select helpers
  const todayStr = useMemo(() => toDateStr(new Date()), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); return toDateStr(d);
  }, []);
  const dayAfterStr = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 2); return toDateStr(d);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (initialEvent) {
        setTitle(initialEvent.title);
        setCategory(initialEvent.category);
        setDate(initialEvent.date);
        setStartTime(initialEvent.startTime || "");
        setEndTime(initialEvent.endTime || "");
        setAllDay(initialEvent.allDay);
        setNotes(initialEvent.notes || "");
        setPriority(initialEvent.priority);
        setColor(initialEvent.color || "");
        setClientId(initialEvent.clientId || "");
        setClientName(initialEvent.clientName || "");
        setClientSearch(initialEvent.clientName || "");
      } else {
        setTitle("");
        setCategory("appel");
        setDate(defaultDate || todayStr);
        setStartTime(defaultStartTime || "");
        setEndTime(defaultEndTime || (defaultStartTime ? addOneHour(defaultStartTime) : ""));
        setAllDay(!defaultStartTime);
        setNotes("");
        setPriority("medium");
        setColor("");
        setClientId("");
        setClientName("");
        setClientSearch("");
      }
      setShowClientDropdown(false);
      setShowStartPicker(false);
      setShowEndPicker(false);
    }
  }, [open, initialEvent, defaultDate, defaultStartTime, defaultEndTime, todayStr]);

  // Close pickers on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (startPickerRef.current && !startPickerRef.current.contains(e.target as Node)) {
        setShowStartPicker(false);
      }
      if (endPickerRef.current && !endPickerRef.current.contains(e.target as Node)) {
        setShowEndPicker(false);
      }
    }
    if (showStartPicker || showEndPicker) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showStartPicker, showEndPicker]);

  function addOneHour(time: string): string {
    const [h, m] = time.split(":").map(Number);
    const newH = Math.min(h + 1, 22);
    return `${newH.toString().padStart(2, "0")}:${(m || 0).toString().padStart(2, "0")}`;
  }

  function handleSelectClient(client: Client) {
    setClientId(client.id);
    setClientName(client.name);
    setClientSearch(client.name);
    setShowClientDropdown(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSubmit({
      id: initialEvent?.id,
      title: title.trim(),
      category,
      date,
      startTime: allDay ? undefined : startTime || undefined,
      endTime: allDay ? undefined : endTime || undefined,
      allDay,
      notes: notes.trim() || undefined,
      priority,
      source: "manual",
      color: color || undefined,
      clientId: clientId || undefined,
      clientName: clientName.trim() || clientSearch.trim() || undefined,
    });
    onClose();
  }

  // Preview color for the header
  const previewColor = color || CATEGORY_SOLID[category];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/25 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={isEditing ? "Modifier l'evenement" : "Nouvel evenement"}
              className="bg-white rounded-xl border border-[#E6E6E4] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Color preview header */}
              <div
                className="h-2 rounded-t-xl transition-colors"
                style={{ backgroundColor: previewColor }}
              />

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#E6E6E4]">
                <h2 className="text-[14px] font-semibold text-[#1A1A1A]">
                  {isEditing ? "Modifier l'evenement" : "Nouvel evenement"}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Fermer"
                  className="p-1 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Appel decouverte avec Marie"
                    required
                    autoFocus
                    className="w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
                  />
                </div>

                {/* Row: Category + Color */}
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  {/* Category chips */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                      Categorie
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {ALL_CATEGORIES.filter((c) => c !== "deadline").map((cat) => {
                        const config = CATEGORY_CONFIG[cat];
                        const selected = category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setCategory(cat);
                              if (!color) setColor(""); // Reset to use category default
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                              selected
                                ? "ring-2 ring-offset-1 ring-[#4F46E5]/30 text-white"
                                : "bg-[#F7F7F5] text-[#999] hover:bg-[#EFEFEF]"
                            }`}
                            style={selected ? { backgroundColor: CATEGORY_SOLID[cat] } : undefined}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: selected ? "rgba(255,255,255,0.5)" : CATEGORY_SOLID[cat] }}
                            />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color picker */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                      Couleur
                    </label>
                    <div className="flex flex-wrap gap-1 max-w-[120px]">
                      {EVENT_PALETTE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(color === c ? "" : c)}
                          className={`w-5 h-5 rounded-full transition-all cursor-pointer ${
                            color === c ? "ring-2 ring-offset-1 ring-[#1A1A1A] scale-110" : "hover:scale-110"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date with quick-select chips */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <div className="flex gap-1.5 mb-2">
                    {[
                      { label: "Aujourd'hui", value: todayStr },
                      { label: "Demain", value: tomorrowStr },
                      { label: "Apres-demain", value: dayAfterStr },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDate(opt.value)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer border ${
                          date === opt.value
                            ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                            : "border-[#E6E6E4] bg-white text-[#666] hover:bg-[#F7F7F5]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="flex-1 bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAllDay(!allDay)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                          allDay ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                            allDay ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                      <span className="text-[12px] text-[#666] whitespace-nowrap">Journee</span>
                    </div>
                  </div>
                </div>

                {/* Time fields — custom chip picker */}
                {!allDay && (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Start time */}
                    <div ref={startPickerRef} className="relative">
                      <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                        Debut
                      </label>
                      <button
                        type="button"
                        onClick={() => { setShowStartPicker(!showStartPicker); setShowEndPicker(false); }}
                        className={`w-full text-left bg-white border rounded-lg px-3 py-2 text-[13px] transition-all cursor-pointer ${
                          showStartPicker
                            ? "border-[#4F46E5] ring-1 ring-[#4F46E5]/20"
                            : "border-[#E6E6E4] hover:border-[#CCC]"
                        } ${startTime ? "text-[#1A1A1A] font-medium" : "text-[#BBB]"}`}
                      >
                        {startTime || "Choisir l'heure"}
                      </button>
                      {showStartPicker && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg z-30 p-2 max-h-[200px] overflow-y-auto">
                          <div className="grid grid-cols-4 gap-1">
                            {TIME_OPTIONS.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => {
                                  setStartTime(t);
                                  if (!endTime || endTime <= t) setEndTime(addOneHour(t));
                                  setShowStartPicker(false);
                                }}
                                className={`px-1 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                  startTime === t
                                    ? "bg-[#4F46E5] text-white"
                                    : "text-[#666] hover:bg-[#F7F7F5]"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* End time */}
                    <div ref={endPickerRef} className="relative">
                      <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                        Fin
                      </label>
                      <button
                        type="button"
                        onClick={() => { setShowEndPicker(!showEndPicker); setShowStartPicker(false); }}
                        className={`w-full text-left bg-white border rounded-lg px-3 py-2 text-[13px] transition-all cursor-pointer ${
                          showEndPicker
                            ? "border-[#4F46E5] ring-1 ring-[#4F46E5]/20"
                            : "border-[#E6E6E4] hover:border-[#CCC]"
                        } ${endTime ? "text-[#1A1A1A] font-medium" : "text-[#BBB]"}`}
                      >
                        {endTime || "Choisir l'heure"}
                      </button>
                      {showEndPicker && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg z-30 p-2 max-h-[200px] overflow-y-auto">
                          <div className="grid grid-cols-4 gap-1">
                            {TIME_OPTIONS.filter((t) => !startTime || t > startTime).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => { setEndTime(t); setShowEndPicker(false); }}
                                className={`px-1 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                                  endTime === t
                                    ? "bg-[#4F46E5] text-white"
                                    : "text-[#666] hover:bg-[#F7F7F5]"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Row: Priority + Client */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Priority */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                      Priorite
                    </label>
                    <div className="flex gap-1">
                      {(Object.keys(PRIORITY_CONFIG) as EventPriority[]).map((p) => {
                        const config = PRIORITY_CONFIG[p];
                        const selected = priority === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer border ${
                              selected
                                ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                                : "border-[#E6E6E4] bg-white text-[#666] hover:bg-[#F7F7F5]"
                            }`}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: config.color }}
                            />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Client picker */}
                  <div className="relative">
                    <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                      Client
                    </label>
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setClientName(e.target.value);
                        setClientId("");
                        setShowClientDropdown(true);
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                      placeholder="Rechercher..."
                      className="w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
                    />
                    {/* Client dropdown */}
                    {showClientDropdown && filteredClients.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg z-20 max-h-[150px] overflow-y-auto">
                        {filteredClients.slice(0, 8).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectClient(c)}
                            className={`w-full text-left px-3 py-2 text-[12px] hover:bg-[#F7F7F5] transition-colors cursor-pointer ${
                              clientId === c.id ? "bg-[#EEF2FF]" : ""
                            }`}
                          >
                            <div className="font-medium text-[#1A1A1A]">{c.name}</div>
                            <div className="text-[10px] text-[#999]">{c.email}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ajouter des notes..."
                    rows={2}
                    className="w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-3 py-2 rounded-md border border-[#E6E6E4] text-[12px] font-medium text-[#666] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!title.trim() || !date}
                    className="flex-1 text-white rounded-md px-3 py-2 text-[12px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
                    style={{ backgroundColor: previewColor }}
                  >
                    {isEditing ? "Enregistrer" : "Creer l'evenement"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
