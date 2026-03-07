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

  const { data: clients } = useApi<Client[]>(open ? "/api/clients" : null);

  const filteredClients = useMemo(() => {
    if (!clients || !clientSearch.trim()) return clients || [];
    const q = clientSearch.toLowerCase();
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [clients, clientSearch]);

  const todayStr = useMemo(() => toDateStr(new Date()), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); return toDateStr(d);
  }, []);
  const dayAfterStr = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 2); return toDateStr(d);
  }, []);

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

  const previewColor = color || CATEGORY_SOLID[category];
  const canSubmit = title.trim() && date;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={isEditing ? "Modifier l'evenement" : "Nouvel evenement"}
              className="bg-white rounded-2xl border border-[#E2E2E0] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Accent bar */}
              <div
                className="h-1.5 rounded-t-2xl transition-colors"
                style={{ backgroundColor: previewColor }}
              />

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
                <h2 className="text-[15px] font-bold text-[#1A1A1A] tracking-[-0.01em]">
                  {isEditing ? "Modifier l'evenement" : "Nouvel evenement"}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Fermer"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F4F2] transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold text-[#A0A09E] uppercase tracking-widest mb-1.5">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Appel decouverte avec Marie"
                    required
                    autoFocus
                    className="w-full bg-[#FAFAF9] border border-[#E6E6E4] rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-[#1A1A1A] placeholder-[#C0C0BE] focus:outline-none focus:bg-white focus:border-[#4F46E5]/40 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all"
                  />
                </div>

                {/* Category + Color row */}
                <div className="grid grid-cols-[1fr_auto] gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#A0A09E] uppercase tracking-widest mb-1.5">
                      Categorie
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_CATEGORIES.filter((c) => c !== "deadline").map((cat) => {
                        const config = CATEGORY_CONFIG[cat];
                        const selected = category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setCategory(cat);
                              if (!color) setColor("");
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              selected
                                ? "text-white shadow-sm"
                                : "bg-[#F4F4F2] text-[#888] hover:bg-[#EEEEED] hover:text-[#666]"
                            }`}
                            style={selected ? { backgroundColor: CATEGORY_SOLID[cat] } : undefined}
                          >
                            {!selected && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: CATEGORY_SOLID[cat] }}
                              />
                            )}
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#A0A09E] uppercase tracking-widest mb-1.5">
                      Couleur
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-w-[120px]">
                      {EVENT_PALETTE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(color === c ? "" : c)}
                          className={`w-5 h-5 rounded-full transition-all cursor-pointer ${
                            color === c ? "ring-2 ring-offset-2 ring-[#1A1A1A]/30 scale-110" : "hover:scale-110"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-[#F0F0EE]" />

                {/* Date */}
                <div>
                  <label className="block text-[11px] font-bold text-[#A0A09E] uppercase tracking-widest mb-1.5">
                    Date *
                  </label>
                  <div className="flex gap-1.5 mb-2.5">
                    {[
                      { label: "Aujourd'hui", value: todayStr },
                      { label: "Demain", value: tomorrowStr },
                      { label: "Apres-demain", value: dayAfterStr },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDate(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                          date === opt.value
                            ? "border-[#4F46E5] bg-[#4F46E5]/[0.06] text-[#4F46E5]"
                            : "border-[#E6E6E4] bg-[#FAFAF9] text-[#888] hover:bg-[#F4F4F2] hover:text-[#666]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="flex-1 bg-[#FAFAF9] border border-[#E6E6E4] rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-[#1A1A1A] focus:outline-none focus:bg-white focus:border-[#4F46E5]/40 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all"
                    />
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setAllDay(!allDay)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                          allDay ? "bg-[#4F46E5]" : "bg-[#E0E0DE]"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                            allDay ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                      <span className="text-[12px] font-semibold text-[#666] whitespace-nowrap">Journee</span>
                    </label>
                  </div>
                </div>

                {/* Time pickers */}
                {!allDay && (
                  <div className="grid grid-cols-2 gap-3">
                    <div ref={startPickerRef} className="relative">
                      <label className="block text-[11px] font-bold text-[#A0A09E] uppercase tracking-widest mb-1.5">
                        Debut
                      </label>
                      <button
                        type="button"
                        onClick={() => { setShowStartPicker(!showStartPicker); setShowEndPicker(false); }}
                        className={`w-full text-left bg-[#FAFAF9] border rounded-lg px-3.5 py-2.5 text-[13px] font-medium transition-all cursor-pointer ${
                          showStartPicker
                            ? "border-[#4F46E5] ring-2 ring-[#4F46E5]/10 bg-white"
                            : "border-[#E6E6E4] hover:border-[#D0D0CE]"
                        } ${startTime ? "text-[#1A1A1A]" : "text-[#C0C0BE]"}`}
                      >
                        {startTime || "Choisir l'heure"}
                      </button>
                      {showStartPicker && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E2E2E0] rounded-xl shadow-xl z-30 p-2 max-h-[200px] overflow-y-auto">
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
                                className={`px-1.5 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                  startTime === t
                                    ? "bg-[#4F46E5] text-white shadow-sm"
                                    : "text-[#666] hover:bg-[#F4F4F2]"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div ref={endPickerRef} className="relative">
                      <label className="block text-[11px] font-bold text-[#A0A09E] uppercase tracking-widest mb-1.5">
                        Fin
                      </label>
                      <button
                        type="button"
                        onClick={() => { setShowEndPicker(!showEndPicker); setShowStartPicker(false); }}
                        className={`w-full text-left bg-[#FAFAF9] border rounded-lg px-3.5 py-2.5 text-[13px] font-medium transition-all cursor-pointer ${
                          showEndPicker
                            ? "border-[#4F46E5] ring-2 ring-[#4F46E5]/10 bg-white"
                            : "border-[#E6E6E4] hover:border-[#D0D0CE]"
                        } ${endTime ? "text-[#1A1A1A]" : "text-[#C0C0BE]"}`}
                      >
                        {endTime || "Choisir l'heure"}
                      </button>
                      {showEndPicker && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E2E2E0] rounded-xl shadow-xl z-30 p-2 max-h-[200px] overflow-y-auto">
                          <div className="grid grid-cols-4 gap-1">
                            {TIME_OPTIONS.filter((t) => !startTime || t > startTime).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => { setEndTime(t); setShowEndPicker(false); }}
                                className={`px-1.5 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                  endTime === t
                                    ? "bg-[#4F46E5] text-white shadow-sm"
                                    : "text-[#666] hover:bg-[#F4F4F2]"
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

                {/* Separator */}
                <div className="h-px bg-[#F0F0EE]" />

                {/* Priority + Client row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#A0A09E] uppercase tracking-widest mb-1.5">
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
                            className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                              selected
                                ? "border-[#4F46E5] bg-[#4F46E5]/[0.06] text-[#4F46E5]"
                                : "border-[#E6E6E4] bg-[#FAFAF9] text-[#888] hover:bg-[#F4F4F2]"
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

                  <div className="relative">
                    <label className="block text-[11px] font-bold text-[#A0A09E] uppercase tracking-widest mb-1.5">
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
                      className="w-full bg-[#FAFAF9] border border-[#E6E6E4] rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-[#1A1A1A] placeholder-[#C0C0BE] focus:outline-none focus:bg-white focus:border-[#4F46E5]/40 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all"
                    />
                    {showClientDropdown && filteredClients.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E2E2E0] rounded-xl shadow-xl z-20 max-h-[150px] overflow-y-auto py-1">
                        {filteredClients.slice(0, 8).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectClient(c)}
                            className={`w-full text-left px-3.5 py-2 text-[12px] hover:bg-[#F7F7F5] transition-colors cursor-pointer ${
                              clientId === c.id ? "bg-[#4F46E5]/[0.04]" : ""
                            }`}
                          >
                            <div className="font-bold text-[#1A1A1A]">{c.name}</div>
                            <div className="text-[10px] text-[#999] font-medium">{c.email}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-[#A0A09E] uppercase tracking-widest mb-1.5">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ajouter des notes..."
                    rows={2}
                    className="w-full bg-[#FAFAF9] border border-[#E6E6E4] rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-[#1A1A1A] placeholder-[#C0C0BE] focus:outline-none focus:bg-white focus:border-[#4F46E5]/40 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all resize-none"
                  />
                </div>

                {/* Footer actions */}
                <div className="flex gap-2.5 pt-2 border-t border-[#F0F0EE]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-[#E2E2E0] text-[12px] font-bold text-[#666] hover:bg-[#F7F7F5] hover:text-[#444] transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`flex-1 text-white rounded-lg px-4 py-2.5 text-[12px] font-bold transition-all cursor-pointer ${
                      canSubmit
                        ? "hover:brightness-110 shadow-sm"
                        : "opacity-35 cursor-not-allowed"
                    }`}
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
