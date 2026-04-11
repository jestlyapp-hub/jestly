"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import {
  UserPlus,
  ClipboardList,
  Rocket,
  Check,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from "lucide-react";

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════

type Step = 1 | 2 | 3;

interface QuickStartProps {
  /** Appelé après complétion pour refresh le dashboard */
  onComplete: () => void;
}

// ═══════════════════════════════════════
// STEP INDICATOR
// ═══════════════════════════════════════

function StepIndicator({ current, total = 3 }: { current: Step; total?: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <motion.div
              initial={false}
              animate={{
                scale: active ? 1 : 0.9,
                backgroundColor: done ? "#10B981" : active ? "#4F46E5" : "#E6E6E4",
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
            >
              {done ? <Check size={14} strokeWidth={3} /> : step}
            </motion.div>
            {i < total - 1 && (
              <div className={`w-8 h-0.5 rounded-full transition-colors ${done ? "bg-emerald-400" : "bg-[#E6E6E4]"}`} />
            )}
          </div>
        );
      })}
      <span className="text-[11px] text-[#AAA] font-medium ml-2">{current}/{total}</span>
    </div>
  );
}

// ═══════════════════════════════════════
// STEP 1 — CLIENT
// ═══════════════════════════════════════

function StepClient({ onNext }: { onNext: (clientId: string, clientName: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const res = await apiFetch<{ id: string }>("/api/clients", {
        body: { name: name.trim(), email: email.trim() || undefined },
      });
      toast.success("Client créé !");
      onNext(res.id, name.trim());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <UserPlus size={20} className="text-blue-600" strokeWidth={1.7} />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-[#191919]">Ajouter votre premier client</h3>
          <p className="text-[12px] text-[#8A8A88]">Juste un nom suffit pour commencer</p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Nom du client"
          className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3.5 py-2.5 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Email (optionnel)"
          className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3.5 py-2.5 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
        />
        <motion.button
          onClick={handleSubmit}
          disabled={!name.trim() || saving}
          whileHover={!name.trim() || saving ? undefined : { scale: 1.02 }}
          whileTap={!name.trim() || saving ? undefined : { scale: 0.97 }}
          className="w-full py-2.5 rounded-lg bg-[#4F46E5] text-white text-[13px] font-semibold hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Créer le client
              <ChevronRight size={14} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// STEP 2 — COMMANDE
// ═══════════════════════════════════════

function StepOrder({ clientId, clientName, onNext }: { clientId: string; clientName: string; onNext: () => void }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Default deadline = dans 7 jours
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDeadline(d.toISOString().slice(0, 10));
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !price || saving) return;
    setSaving(true);
    try {
      await apiFetch("/api/orders", {
        body: {
          title: title.trim(),
          amount: Number(price),
          client_id: clientId,
          deadline: deadline || undefined,
          status: "new",
        },
      });
      toast.success("Commande créée !");
      onNext();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <ClipboardList size={20} className="text-emerald-600" strokeWidth={1.7} />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-[#191919]">Créer votre première commande</h3>
          <p className="text-[12px] text-[#8A8A88]">Pour <span className="font-medium text-[#5A5A58]">{clientName}</span></p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre (ex : Logo pour startup)"
          className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3.5 py-2.5 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Prix"
              min="0"
              className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3.5 py-2.5 pr-8 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#BBB]">&euro;</span>
          </div>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3.5 py-2.5 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
          />
        </div>
        <motion.button
          onClick={handleSubmit}
          disabled={!title.trim() || !price || saving}
          whileHover={!title.trim() || !price || saving ? undefined : { scale: 1.02 }}
          whileTap={!title.trim() || !price || saving ? undefined : { scale: 0.97 }}
          className="w-full py-2.5 rounded-lg bg-[#4F46E5] text-white text-[13px] font-semibold hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Créer la commande
              <ChevronRight size={14} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// STEP 3 — WOW MOMENT
// ═══════════════════════════════════════

function StepWow({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="text-center py-2"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: show ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200/50"
      >
        <Rocket size={28} className="text-white" strokeWidth={1.7} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
        transition={{ delay: 0.3 }}
        className="text-[18px] font-bold text-[#191919] mb-1.5"
      >
        Votre business commence ici
      </motion.h3>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-1.5 mb-5"
      >
        <p className="text-[13px] text-[#5A5A58]">
          Votre dashboard est maintenant actif avec de vraies données.
        </p>
        <div className="flex items-center justify-center gap-4 text-[12px] text-[#8A8A88] mt-3">
          <span className="flex items-center gap-1"><Check size={13} className="text-emerald-500" /> CA visible</span>
          <span className="flex items-center gap-1"><Check size={13} className="text-emerald-500" /> Deadline au calendrier</span>
          <span className="flex items-center gap-1"><Check size={13} className="text-emerald-500" /> Client enregistré</span>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
        transition={{ delay: 0.7 }}
        onClick={onComplete}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4F46E5] text-white text-[13px] font-semibold hover:bg-[#4338CA] transition-colors cursor-pointer"
      >
        Voir mon dashboard
        <ArrowRight size={14} />
      </motion.button>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════

const STORAGE_KEY = "jestly_quickstart_done";

export default function QuickStartBusiness({ onComplete }: QuickStartProps) {
  const [step, setStep] = useState<Step>(1);
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [dismissed, setDismissed] = useState(false);

  // Check if already completed
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) setDismissed(true);
  }, []);

  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
    onComplete();
  }, [onComplete]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="mb-6 bg-white rounded-2xl border border-[#E6E6E4] overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="px-7 pt-6 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
            <Sparkles size={18} className="text-[#4F46E5]" strokeWidth={1.7} />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-[#191919]">Quick Start</h2>
            <p className="text-[11px] text-[#AAA]">Lancez votre activité en 60 secondes</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StepIndicator current={step} />
          {step === 1 && (
            <button
              onClick={handleDismiss}
              className="text-[11px] text-[#BBB] hover:text-[#888] transition-colors cursor-pointer"
            >
              Passer
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-7 py-5">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepClient
              key="client"
              onNext={(id, name) => {
                setClientId(id);
                setClientName(name);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <StepOrder
              key="order"
              clientId={clientId}
              clientName={clientName}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepWow key="wow" onComplete={handleComplete} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
