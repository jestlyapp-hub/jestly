"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;
const TOTAL_DURATION = 32;

interface CrmDemoPlayerProps {
  label?: string;
  accentColor?: string;
}

/* ═══════════════════════════════════════════════════════════
   TIMELINE — same keyframe system as BuilderDemoPlayer
   ═══════════════════════════════════════════════════════════ */

interface Keyframe { t: number; apply: (ctx: DemoCtx) => void; }
interface DemoCtx {
  root: HTMLElement;
  q: (s: string) => HTMLElement;
  cursorTo: (dataEl: string, offsetX?: number, offsetY?: number) => void;
  clickAt: () => void;
}

function buildTimeline(): Keyframe[] {
  const K: Keyframe[] = [];
  const k = (t: number, apply: (ctx: DemoCtx) => void) => K.push({ t, apply });

  // ── SCENE 1: INTRO (0 → 3.5s) — reveal shell then panels ──
  k(0, ctx => { ctx.q("shell").classList.add("vis"); });
  k(0.8, ctx => { ctx.q("cur").classList.add("vis"); ctx.cursorTo("pageTitle"); });
  k(1.2, ctx => { ctx.q("insp").classList.add("vis"); });
  k(1.8, ctx => { ctx.q("kpis").classList.add("vis"); });
  k(2.4, ctx => { ctx.q("board").classList.add("vis"); });

  // ── SCENE 2: ADD PROSPECT (3.5 → 9s) ──
  k(3.5, ctx => { ctx.cursorTo("addBtn"); });
  k(4.0, ctx => { ctx.clickAt(); ctx.q("modal").classList.add("open"); });
  // Fill fields
  k(4.8, ctx => { ctx.cursorTo("fName"); });
  k(5.0, ctx => { ctx.clickAt(); ctx.q("fName").classList.add("ed"); ctx.q("fName").textContent = "Emma"; });
  k(5.3, ctx => { ctx.q("fName").textContent = "Emma Rousseau"; ctx.q("fName").classList.remove("ed"); });
  k(5.6, ctx => { ctx.cursorTo("fEmail"); });
  k(5.8, ctx => { ctx.clickAt(); ctx.q("fEmail").classList.add("ed"); ctx.q("fEmail").textContent = "emma@bloom.fr"; ctx.q("fEmail").classList.remove("ed"); });
  k(6.1, ctx => { ctx.cursorTo("fProject"); });
  k(6.3, ctx => { ctx.clickAt(); ctx.q("fProject").classList.add("ed"); ctx.q("fProject").textContent = "Refonte identité"; ctx.q("fProject").classList.remove("ed"); });
  k(6.6, ctx => { ctx.cursorTo("fBudget"); });
  k(6.8, ctx => { ctx.clickAt(); ctx.q("fBudget").classList.add("ed"); ctx.q("fBudget").textContent = "2 500 €"; ctx.q("fBudget").classList.remove("ed"); });
  // Submit
  k(7.3, ctx => { ctx.cursorTo("modalSubmit"); });
  k(7.7, ctx => {
    ctx.clickAt();
    ctx.q("modal").classList.remove("open");
    const card = document.createElement("div");
    card.className = "c-card entering";
    card.setAttribute("data-el", "cardEmma");
    card.innerHTML = '<div class="c-dot" style="background:#EC4899"></div><div class="c-ci"><div class="c-cn">Emma Rousseau</div><div class="c-cp">2 500 €</div></div>';
    ctx.q("colNew").appendChild(card);
    ctx.q("kpiCount").textContent = "8";
  });

  // ── SCENE 3: PIPELINE — move cards (9 → 14.5s) ──
  k(9.5, ctx => { ctx.cursorTo("cardEmma"); });
  k(10.0, ctx => { ctx.clickAt(); ctx.q("cardEmma").classList.add("dragging"); });
  k(10.7, ctx => { ctx.cursorTo("colDiscuss", 0, 20); });
  k(11.2, ctx => {
    ctx.q("cardEmma").classList.remove("dragging", "entering");
    ctx.q("colDiscuss").appendChild(ctx.q("cardEmma"));
    ctx.q("countNew").textContent = "3";
    ctx.q("countDiscuss").textContent = "4";
  });
  // Move second card
  k(12.0, ctx => { ctx.cursorTo("cardThomas"); });
  k(12.4, ctx => { ctx.clickAt(); ctx.q("cardThomas").classList.add("dragging"); });
  k(12.9, ctx => { ctx.cursorTo("colPropo", 0, 20); });
  k(13.4, ctx => {
    ctx.q("cardThomas").classList.remove("dragging");
    ctx.q("colPropo").appendChild(ctx.q("cardThomas"));
    ctx.q("countDiscuss").textContent = "3";
    ctx.q("countPropo").textContent = "3";
  });

  // ── SCENE 4: DETAIL PANEL (14.5 → 21s) ──
  k(14.5, ctx => { ctx.cursorTo("cardEmma"); });
  k(15.0, ctx => {
    ctx.clickAt();
    // Switch inspector to detail mode
    ctx.q("inspDefault").style.display = "none";
    ctx.q("inspDetail").classList.add("vis");
  });
  k(15.6, ctx => { ctx.q("dHead").classList.add("vis"); });
  k(16.0, ctx => { ctx.q("dFields").classList.add("vis"); });
  k(16.5, ctx => { ctx.q("dTags").classList.add("vis"); });
  k(17.0, ctx => { ctx.q("dNotes").classList.add("vis"); });
  // Type a note
  k(17.5, ctx => { ctx.cursorTo("noteInput"); });
  k(17.8, ctx => { ctx.clickAt(); ctx.q("noteInput").classList.add("ed"); ctx.q("noteInput").textContent = "Brief reçu"; });
  k(18.3, ctx => { ctx.q("noteInput").textContent = "Brief reçu — devis en cours"; ctx.q("noteInput").classList.remove("ed"); });
  k(18.8, ctx => { ctx.q("dTimeline").classList.add("vis"); });
  k(19.5, ctx => { ctx.q("dRelance").classList.add("vis"); });

  // ── SCENE 5: CONVERT (21 → 26s) ──
  k(21.0, ctx => { ctx.cursorTo("convertBtn"); });
  k(21.5, ctx => { ctx.clickAt(); ctx.q("convertBtn").classList.add("ld"); ctx.q("convertLabel").textContent = "Conversion..."; });
  k(22.6, ctx => {
    ctx.q("convertBtn").classList.remove("ld");
    ctx.q("convertBtn").classList.add("ok");
    ctx.q("convertLabel").textContent = "✓ Client actif";
    ctx.q("statusBadge").textContent = "Client actif";
    ctx.q("statusBadge").classList.add("won");
  });
  k(23.5, ctx => {
    // Reset inspector
    ctx.q("inspDetail").classList.remove("vis");
    ctx.q("inspDefault").style.display = "";
  });
  k(24.0, ctx => {
    // Move card to Gagné
    const card = ctx.q("cardEmma");
    if (card) { card.classList.add("won"); ctx.q("colGagne").appendChild(card); }
    ctx.q("countGagne").textContent = "6";
    ctx.q("kpiClients").textContent = "24";
    ctx.q("kpiCA").textContent = "18 420 €";
  });

  // ── SCENE 6: OUTRO (26 → 32s) ──
  k(26.0, ctx => { ctx.q("overlay").classList.add("vis"); });
  k(31.0, ctx => { ctx.q("cur").classList.remove("vis"); });

  return K.sort((a, b) => a.t - b.t);
}

/* ═══════════════════════════════════════════════════════════
   REACT COMPONENT — identical engine to BuilderDemoPlayer
   ═══════════════════════════════════════════════════════════ */

export default function CrmDemoPlayer({
  label = "Découvrir le CRM en action",
  accentColor = "#EC4899",
}: CrmDemoPlayerProps) {
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<Keyframe[]>([]);
  const snapshotsRef = useRef<Map<number, string>>(new Map());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAppliedRef = useRef(-1);
  const initialHtmlRef = useRef("");

  const makeCtx = useCallback((root: HTMLElement): DemoCtx => {
    const q = (s: string) => root.querySelector<HTMLElement>(`[data-el="${s}"]`)!;
    const shell = root.querySelector<HTMLElement>("[data-el='shell']");
    return {
      root, q,
      cursorTo(dataEl, offsetX = 0, offsetY = 0) {
        const target = q(dataEl); const cur = q("cur");
        if (!target || !cur || !shell) return;
        void shell.offsetHeight;
        const sr = shell.getBoundingClientRect(); const tr = target.getBoundingClientRect();
        let x: number, y: number;
        if (tr.width > 0 && sr.width > 0) { x = tr.left - sr.left + tr.width / 2 + offsetX; y = tr.top - sr.top + tr.height / 2 + offsetY; }
        else { let el: HTMLElement | null = target; x = target.offsetWidth / 2 + offsetX; y = target.offsetHeight / 2 + offsetY; while (el && el !== shell) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent as HTMLElement | null; } }
        cur.style.transition = "left 0.4s cubic-bezier(0.22,1,0.36,1), top 0.4s cubic-bezier(0.22,1,0.36,1)";
        cur.style.left = x + "px"; cur.style.top = y + "px";
      },
      clickAt() {
        const cur = q("cur"); const clk = q("clk");
        if (!cur || !clk) return;
        clk.style.left = cur.style.left; clk.style.top = cur.style.top;
        clk.classList.remove("pop"); void clk.offsetWidth; clk.classList.add("pop");
      },
    };
  }, []);

  const SNAP_TIMES = [3.5, 9.5, 14.5, 21.0, 26.0];

  const seekTo = useCallback((t: number) => {
    const root = containerRef.current; if (!root) return;
    const snapTimes = [...snapshotsRef.current.keys()].sort((a, b) => a - b);
    let restoreFrom = -1;
    for (const st of snapTimes) { if (st <= t) restoreFrom = st; else break; }
    if (restoreFrom >= 0 && snapshotsRef.current.has(restoreFrom)) {
      const dRoot = root.querySelector(".c-root"); if (dRoot) dRoot.innerHTML = snapshotsRef.current.get(restoreFrom)!;
    } else { root.innerHTML = initialHtmlRef.current; restoreFrom = -1; }
    void root.offsetHeight;
    const ctx = makeCtx(root);
    for (const kf of timelineRef.current) { if (kf.t <= restoreFrom) continue; if (kf.t > t) break; try { kf.apply(ctx); } catch {} }
    lastAppliedRef.current = t; setCurrentTime(t);
  }, [makeCtx]);

  const initialize = useCallback(() => {
    const root = containerRef.current; if (!root) return;
    root.innerHTML = CRM_DEMO_HTML; initialHtmlRef.current = CRM_DEMO_HTML;
    timelineRef.current = buildTimeline(); snapshotsRef.current.clear(); lastAppliedRef.current = -1;
    void root.offsetHeight; const ctx = makeCtx(root);
    for (const kf of timelineRef.current) { if (kf.t > 0) break; try { kf.apply(ctx); } catch {} }
    const dRoot = root.querySelector(".c-root"); if (dRoot) snapshotsRef.current.set(0, dRoot.innerHTML);
  }, [makeCtx]);

  const togglePlay = useCallback(() => {
    if (isPlaying) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; setIsPlaying(false); return; }
    let t = currentTime >= TOTAL_DURATION - 0.5 ? 0 : currentTime;
    if (t === 0) seekTo(0);
    setIsPlaying(true);
    const TICK = 100;
    timerRef.current = setInterval(() => {
      t += TICK / 1000;
      if (t >= TOTAL_DURATION) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; setIsPlaying(false); setCurrentTime(TOTAL_DURATION); return; }
      const root = containerRef.current; if (!root) return;
      const ctx = makeCtx(root);
      for (const kf of timelineRef.current) {
        if (kf.t <= lastAppliedRef.current) continue; if (kf.t > t) break;
        try { kf.apply(ctx); } catch {}
        const dRoot = root.querySelector(".c-root");
        if (dRoot && SNAP_TIMES.includes(kf.t)) snapshotsRef.current.set(kf.t, dRoot.innerHTML);
      }
      lastAppliedRef.current = t; setCurrentTime(t);
    }, TICK);
  }, [isPlaying, currentTime, seekTo, makeCtx, SNAP_TIMES]);

  const handleStart = useCallback(() => {
    setStarted(true); setShowControls(true);
    setTimeout(() => { initialize(); setTimeout(() => { seekTo(0); setCurrentTime(0); setIsPlaying(true); }, 200); }, 100);
  }, [initialize, seekTo]);

  useEffect(() => {
    if (!started || !isPlaying || timerRef.current) return;
    let t = currentTime; const TICK = 100;
    timerRef.current = setInterval(() => {
      t += TICK / 1000;
      if (t >= TOTAL_DURATION) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; setIsPlaying(false); setCurrentTime(TOTAL_DURATION); return; }
      const root = containerRef.current; if (!root) return;
      const ctx = makeCtx(root);
      for (const kf of timelineRef.current) {
        if (kf.t <= lastAppliedRef.current) continue; if (kf.t > t) break;
        try { kf.apply(ctx); } catch {}
        const dRoot = root.querySelector(".c-root");
        if (dRoot && SNAP_TIMES.includes(kf.t)) snapshotsRef.current.set(kf.t, dRoot.innerHTML);
      }
      lastAppliedRef.current = t; setCurrentTime(t);
    }, TICK);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, isPlaying]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * TOTAL_DURATION;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } setIsPlaying(false);
    const root = containerRef.current; if (!root) return;
    root.innerHTML = initialHtmlRef.current; snapshotsRef.current.clear(); lastAppliedRef.current = -1;
    void root.offsetHeight; const ctx = makeCtx(root);
    for (const kf of timelineRef.current) { if (kf.t > t) break; try { kf.apply(ctx); } catch {} }
    lastAppliedRef.current = t;
    const dRoot = root.querySelector(".c-root"); if (dRoot) snapshotsRef.current.set(0, dRoot.innerHTML);
    setCurrentTime(t);
  }, [makeCtx]);

  const skip = useCallback((delta: number) => {
    const t = Math.max(0, Math.min(TOTAL_DURATION, currentTime + delta));
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } setIsPlaying(false);
    const root = containerRef.current; if (!root) return;
    root.innerHTML = initialHtmlRef.current; lastAppliedRef.current = -1;
    void root.offsetHeight; const ctx = makeCtx(root);
    for (const kf of timelineRef.current) { if (kf.t > t) break; try { kf.apply(ctx); } catch {} }
    lastAppliedRef.current = t; setCurrentTime(t);
  }, [currentTime, makeCtx]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  const scenes = [
    { t: 0, label: "Intro" }, { t: 3.5, label: "Prospect" }, { t: 9.5, label: "Pipeline" },
    { t: 14.5, label: "Fiche" }, { t: 21.0, label: "Conversion" }, { t: 26.0, label: "Résultat" },
  ];
  const currentScene = [...scenes].reverse().find(s => currentTime >= s.t)?.label ?? "Intro";

  return (
    <motion.div
      className="relative w-full max-w-[1100px] mx-auto rounded-2xl overflow-hidden"
      style={{ aspectRatio: "16/9", background: started ? "#0F0E17" : `linear-gradient(135deg, ${accentColor}08, ${accentColor}15)`, border: "1px solid #E5E7EB", boxShadow: "0 20px 60px rgba(124,58,237,0.12), 0 4px 16px rgba(0,0,0,0.04)" }}
      initial={{ opacity: 0, y: 28, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}
      onMouseEnter={() => started && setShowControls(true)} onMouseLeave={() => started && setShowControls(false)}
    >
      {/* Idle thumbnail */}
      <AnimatePresence>
        {!started && (
          <motion.div className="absolute inset-0 z-10 cursor-pointer group" onClick={handleStart} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <div className="absolute inset-0 overflow-hidden" style={{ filter: "blur(2px)", transform: "scale(1.02)" }}>
              <div style={{ width: "100%", height: "100%", background: "#F8F7FC", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif", fontSize: "9px", display: "flex", flexDirection: "column" as const }}>
                <div style={{ height: "5%", background: "#FAFAFE", borderBottom: "1px solid #E8E5F0", display: "flex", alignItems: "center", padding: "0 10px", gap: "4px" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6159" }} />
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFBF2F" }} />
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2ACB42" }} />
                  <div style={{ marginLeft: 8, flex: 1, height: 14, background: "#F3F2F8", borderRadius: 3 }} />
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: "14%", background: "#FFF", borderRight: "1px solid #E8E5F0", padding: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 10 }}>Jestly</div>
                    {["Dashboard", "Clients", "Commandes"].map((l, i) => (
                      <div key={l} style={{ padding: "3px 5px", borderRadius: 3, fontSize: 7, marginBottom: 2, background: i === 1 ? "#EDE9FE" : "transparent", color: i === 1 ? "#7C5CFF" : "#6B7280", fontWeight: i === 1 ? 600 : 400 }}>{l}</div>
                    ))}
                  </div>
                  <div style={{ flex: 1, background: "#F1EFF7", padding: 10, display: "flex", justifyContent: "center" }}>
                    <div style={{ width: "85%", display: "flex", gap: 5 }}>
                      {["Nouveau", "En discussion", "Proposition"].map(col => (
                        <div key={col} style={{ flex: 1, background: "#FFF", borderRadius: 7, padding: 5, border: "1px solid #E8E5F0" }}>
                          <div style={{ fontSize: 6, fontWeight: 600, color: "#9CA3AF", marginBottom: 4 }}>{col}</div>
                          {[0, 1].map(j => (
                            <div key={j} style={{ padding: 4, border: "1px solid #E8E5F0", borderRadius: 5, marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
                              <div style={{ width: 12, height: 12, borderRadius: 3, background: "#EDE9FE" }} />
                              <div><div style={{ width: 40, height: 3, background: "#F0EDF7", borderRadius: 2 }} /><div style={{ width: 25, height: 3, background: "#F5F3FA", borderRadius: 2, marginTop: 2 }} /></div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ width: "16%", background: "#FFF", borderLeft: "1px solid #E8E5F0", padding: 5 }}>
                    <div style={{ fontSize: 6, fontWeight: 600, color: "#9CA3AF", borderBottom: "1px solid #E8E5F0", paddingBottom: 3, marginBottom: 4 }}>Détail</div>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{ marginBottom: 4 }}><div style={{ width: "40%", height: 3, background: "#F0EDF7", borderRadius: 2, marginBottom: 2 }} /><div style={{ height: 10, background: "#FAFAFE", border: "1px solid #E8E5F0", borderRadius: 3 }} /></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0" style={{ background: "rgba(15,14,23,0.35)" }} />
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(124,92,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`, boxShadow: `0 12px 40px ${accentColor}40` }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <span className="text-[12px] sm:text-[13px] font-medium text-white/70">{label}</span>
              <span className="text-[10px] text-white/40">0:32</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={containerRef} className="w-full h-full" />

      {/* Controls — identical to BuilderDemoPlayer */}
      {started && (
        <div className="absolute bottom-0 left-0 right-0 z-40 transition-opacity duration-300" style={{ opacity: showControls ? 1 : 0 }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }} />
          <div className="relative px-4 pb-3 pt-8">
            <div className="w-full h-[6px] rounded-full cursor-pointer mb-3 group/bar relative" style={{ background: "rgba(255,255,255,0.2)" }} onClick={handleScrub}>
              {scenes.map(s => (<div key={s.t} className="absolute top-0 w-[2px] h-full rounded-full" style={{ left: `${(s.t / TOTAL_DURATION) * 100}%`, background: "rgba(255,255,255,0.25)" }} />))}
              <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%`, background: "linear-gradient(90deg, #7C5CFF, #A78BFA)" }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md transition-[left] duration-100 opacity-0 group-hover/bar:opacity-100" style={{ left: `${(currentTime / TOTAL_DURATION) * 100}%`, transform: "translate(-50%, -50%)" }} />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => skip(-5)} className="text-white/70 hover:text-white transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /><text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7" fontWeight="700">5</text></svg></button>
              <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                {isPlaying ? <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="ml-0.5"><path d="M8 5v14l11-7z" /></svg>}
              </button>
              <button onClick={() => skip(5)} className="text-white/70 hover:text-white transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /><text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7" fontWeight="700">5</text></svg></button>
              <span className="text-[11px] text-white/60 font-mono tabular-nums ml-1">{fmt(currentTime)} / {fmt(TOTAL_DURATION)}</span>
              <span className="ml-auto text-[10px] text-white/40 font-medium">{currentScene}</span>
              <button onClick={() => { seekTo(0); setIsPlaying(false); }} className="text-white/50 hover:text-white transition-colors ml-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg></button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CRM DEMO HTML
   ───────────────────────────────────────────────────────────
   DERIVED FROM BuilderDemoPlayer DA. Same tokens:
   - Shell bg: #F8F7FC   - Surface: #FFF
   - Border: #E8E5F0     - Border light: #F0EDF7
   - Canvas: #F1EFF7     - Input bg: #FAFAFE
   - Text: #1A1A2E       - Text2: #6B7280  - Muted: #9CA3AF
   - Accent: #7C5CFF     - Accent bg: #EDE9FE
   - Bar: #FAFAFE        - URL: #F3F2F8
   - Toolbar: 34px       - Sidebar: 170px  - Inspector: 190px
   - border-radius: 4-7px cards, 12px badges
   ═══════════════════════════════════════════════════════════ */

const CRM_DEMO_HTML = `
<style>
  /* ── Reset & Root (identical to d-root) ── */
  .c-root{width:100%;height:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;background:#0F0E17;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
  .c-root *,.c-root *::before,.c-root *::after{margin:0;padding:0;box-sizing:border-box}

  /* ── Shell (identical to d-shell) ── */
  .c-shell{width:100%;height:100%;background:#F8F7FC;overflow:hidden;position:relative;opacity:0;transform:scale(0.96);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1),opacity 0.4s ease}
  .c-shell.vis{opacity:1;transform:scale(1)}

  /* ── Browser bar (identical to d-bar) ── */
  .c-bar{height:28px;background:#FAFAFE;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;padding:0 10px;gap:6px}
  .c-bardot{width:8px;height:8px;border-radius:50%}
  .c-barurl{flex:1;margin-left:8px;height:17px;background:#F3F2F8;border-radius:4px;display:flex;align-items:center;padding:0 8px;font-size:9px;color:#9CA3AF}

  /* ── Layout: same 3-column as builder ── */
  .c-builder{display:flex;height:calc(100% - 28px);position:relative}

  /* ── Toolbar (identical to d-toolbar) ── */
  .c-toolbar{position:absolute;top:0;left:0;right:0;height:34px;background:#FFF;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;justify-content:space-between;padding:0 12px;z-index:20}
  .c-logo{font-size:11px;font-weight:800;background:linear-gradient(135deg,#7C5CFF,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .c-divider{width:1px;height:16px;background:#E8E5F0;margin:0 8px}
  .c-pagename{font-size:9px;color:#6B7280;padding:2px 7px;background:#F5F3FA;border-radius:4px}
  .c-tbl{display:flex;align-items:center;gap:6px}
  .c-addbtn{padding:4px 12px;background:#7C5CFF;color:#fff;border:none;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer;transition:all 0.3s;display:flex;align-items:center;gap:5px}

  /* ── Sidebar (identical to d-side: 170px) ── */
  .c-side{width:170px;background:#FFF;border-right:1px solid #E8E5F0;margin-top:34px;overflow:hidden;padding:8px}
  .c-stitle{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#9CA3AF;margin-bottom:6px;margin-top:6px}
  .c-sitem{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:4px;font-size:10px;color:#1A1A2E}
  .c-sitem.act{background:#EDE9FE;color:#7C5CFF;font-weight:600}
  .c-sicon{width:14px;height:14px;border-radius:3px;background:#F0EDF7;display:flex;align-items:center;justify-content:center;font-size:7px;color:#9CA3AF}
  .c-sitem.act .c-sicon{background:rgba(124,92,255,0.15);color:#7C5CFF}

  /* ── Canvas (identical to d-canvas) ── */
  .c-canvas{flex:1;margin-top:34px;background:#F1EFF7;overflow:hidden;padding:12px;display:flex;flex-direction:column;gap:10px}

  /* ── KPI strip (badge style, not heavy stat blocks) ── */
  .c-kpis{display:flex;gap:6px;opacity:0;transform:translateY(6px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .c-kpis.vis{opacity:1;transform:translateY(0)}
  .c-kpi{padding:5px 10px;background:#FFF;border:1px solid #E8E5F0;border-radius:7px;display:flex;align-items:center;gap:6px}
  .c-kpi-label{font-size:7px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px}
  .c-kpi-val{font-size:11px;font-weight:700;color:#1A1A2E}

  /* ── Pipeline board ── */
  .c-board{display:flex;gap:8px;flex:1;opacity:0;transform:translateY(8px);transition:all 0.5s cubic-bezier(0.22,1,0.36,1)}
  .c-board.vis{opacity:1;transform:translateY(0)}
  .c-col{flex:1;background:#FFF;border:1px solid #E8E5F0;border-radius:7px;padding:7px;display:flex;flex-direction:column}
  .c-colh{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;padding:0 2px}
  .c-colname{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#9CA3AF;display:flex;align-items:center;gap:4px}
  .c-coldot{width:5px;height:5px;border-radius:2px}
  .c-colcount{font-size:7px;font-weight:600;color:#9CA3AF;background:#F0EDF7;padding:1px 5px;border-radius:8px}

  /* ── Cards (light, airy — like d-scard / d-bitem) ── */
  .c-card{display:flex;align-items:center;gap:6px;padding:6px 7px;border:1px solid #E8E5F0;border-radius:5px;margin-bottom:3px;background:#FAFAFE;transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .c-card.entering{animation:c-fadeIn 0.4s cubic-bezier(0.22,1,0.36,1)}
  .c-card.dragging{opacity:0.5;transform:scale(0.96) rotate(-1deg);box-shadow:0 8px 20px rgba(124,92,255,0.15)}
  .c-card.won{border-color:#10B981;background:rgba(16,185,129,0.04)}
  @keyframes c-fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  .c-dot{width:18px;height:18px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:6px;font-weight:700;color:#fff;flex-shrink:0}
  .c-ci{flex:1;min-width:0}
  .c-cn{font-size:8px;font-weight:600;color:#1A1A2E}
  .c-cp{font-size:7px;color:#9CA3AF;margin-top:1px}

  /* ── Modal (like d-lib overlay) ── */
  .c-modalbg{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.85);backdrop-filter:blur(4px);z-index:40;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s}
  .c-modalbg.open{opacity:1;pointer-events:all}
  .c-modal{width:260px;background:#FFF;border-radius:8px;padding:14px;box-shadow:0 12px 40px rgba(0,0,0,0.1);border:1px solid #E8E5F0;transform:translateY(8px) scale(0.97);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1)}
  .c-modalbg.open .c-modal{transform:translateY(0) scale(1)}
  .c-mt{font-size:11px;font-weight:700;color:#1A1A2E;margin-bottom:2px}
  .c-ms{font-size:8px;color:#9CA3AF;margin-bottom:8px}
  .c-fg{margin-bottom:6px}
  .c-fl{font-size:7px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px}
  .c-fi{width:100%;padding:4px 6px;border:1px solid #E8E5F0;border-radius:4px;font-size:9px;color:#1A1A2E;background:#FAFAFE;transition:border-color 0.2s;min-height:20px}
  .c-fi.ed{border-color:#7C5CFF;box-shadow:0 0 0 2px rgba(124,92,255,0.1)}
  .c-mbtn{width:100%;padding:5px;background:#7C5CFF;color:#fff;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;margin-top:6px}

  /* ── Inspector (identical to d-insp: 190px) ── */
  .c-insp{width:190px;background:#FFF;border-left:1px solid #E8E5F0;margin-top:34px;overflow-y:auto;opacity:0;transform:translateX(8px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .c-insp.vis{opacity:1;transform:translateX(0)}
  .c-tabs{display:flex;border-bottom:1px solid #E8E5F0}
  .c-tab{flex:1;padding:7px 5px;font-size:8px;font-weight:600;text-align:center;color:#9CA3AF;border-bottom:2px solid transparent}
  .c-tab.act{color:#7C5CFF;border-bottom-color:#7C5CFF}
  .c-icont{padding:8px}

  /* Inspector default content */
  .c-istat{margin-bottom:8px}
  .c-istat-row{display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #F0EDF7}
  .c-istat-label{font-size:7px;color:#9CA3AF}
  .c-istat-val{font-size:8px;font-weight:600;color:#1A1A2E}

  /* Inspector detail (d-insp style panels) */
  .c-idetail{display:none;padding:8px}
  .c-idetail.vis{display:block}
  .c-dsec{opacity:0;transform:translateY(6px);transition:all 0.35s cubic-bezier(0.22,1,0.36,1);margin-bottom:8px}
  .c-dsec.vis{opacity:1;transform:translateY(0)}
  .c-dh{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .c-davatar{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;background:#7C5CFF}
  .c-dname{font-size:11px;font-weight:700;color:#1A1A2E}
  .c-demail{font-size:7px;color:#9CA3AF}
  .c-dbadge{display:inline-block;font-size:6px;font-weight:600;padding:2px 7px;border-radius:12px;background:#EDE9FE;color:#7C5CFF;margin-top:2px}
  .c-dbadge.won{background:rgba(16,185,129,0.12);color:#10B981}
  .c-dfields{display:grid;grid-template-columns:1fr 1fr;gap:4px}
  .c-df{padding:5px 6px;background:#FAFAFE;border-radius:4px;border:1px solid #F0EDF7}
  .c-dfl{font-size:6px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:1px}
  .c-dfv{font-size:8px;font-weight:600;color:#1A1A2E}
  .c-dtags{display:flex;gap:3px;flex-wrap:wrap}
  .c-dtag{font-size:6px;font-weight:600;padding:2px 6px;border-radius:8px}
  .c-dnote{width:100%;padding:4px 6px;border:1px solid #E8E5F0;border-radius:4px;font-size:8px;color:#1A1A2E;background:#FAFAFE;min-height:22px;transition:border-color 0.2s}
  .c-dnote.ed{border-color:#7C5CFF;box-shadow:0 0 0 2px rgba(124,92,255,0.1)}
  .c-tl{margin-top:4px}
  .c-tlitem{display:flex;gap:6px;padding:3px 0;position:relative}
  .c-tldot{width:5px;height:5px;border-radius:50%;background:#7C5CFF;margin-top:3px;flex-shrink:0}
  .c-tlline{position:absolute;left:2px;top:11px;width:1px;height:calc(100% - 6px);background:#F0EDF7}
  .c-tltext{font-size:7px;color:#6B7280;line-height:1.3}
  .c-tldate{font-size:5.5px;color:#9CA3AF;margin-top:1px}
  .c-relance{padding:5px 7px;background:rgba(124,92,255,0.04);border:1px solid #EDE9FE;border-radius:5px;display:flex;align-items:center;gap:5px;margin-bottom:6px}
  .c-relance-text{font-size:7px;color:#7C5CFF;font-weight:500}
  .c-convert{width:100%;padding:6px;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;transition:all 0.4s;background:#7C5CFF;color:#fff}
  .c-convert.ld{background:#5B3FD9}
  .c-convert.ok{background:#10B981}
  .c-convert .c-spinner{width:10px;height:10px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;display:none}
  .c-convert.ld .c-spinner{display:block;animation:c-spin 0.6s linear infinite}
  @keyframes c-spin{to{transform:rotate(360deg)}}

  /* ── Overlay (identical to d-overlay) ── */
  .c-overlay{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.95);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:50;opacity:0;pointer-events:none;transition:opacity 0.5s}
  .c-overlay.vis{opacity:1;pointer-events:all}
  .c-okicon{width:42px;height:42px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center;margin-bottom:12px;transform:scale(0);transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1)}
  .c-overlay.vis .c-okicon{transform:scale(1)}
  .c-okt{font-size:16px;font-weight:700;color:#1A1A2E;margin-bottom:4px}
  .c-oku{font-size:10px;color:#7C5CFF;background:#EDE9FE;padding:4px 12px;border-radius:14px;font-weight:500}

  /* ── Cursor (identical to d-cur) ── */
  .c-cur{position:absolute;width:14px;height:17px;z-index:100;pointer-events:none;opacity:0;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.2));transition:opacity 0.3s}
  .c-cur.vis{opacity:1}
  .c-click{position:absolute;width:18px;height:18px;border-radius:50%;background:rgba(124,92,255,0.3);transform:translate(-2px,-1px) scale(0);pointer-events:none;z-index:99}
  .c-click.pop{animation:c-pop 0.35s ease-out forwards}
  @keyframes c-pop{0%{transform:translate(-2px,-1px) scale(0);opacity:1}100%{transform:translate(-2px,-1px) scale(2);opacity:0}}
</style>

<div class="c-root">
<div class="c-shell" data-el="shell">
  <!-- Browser bar -->
  <div class="c-bar"><div class="c-bardot" style="background:#FF6159"></div><div class="c-bardot" style="background:#FFBF2F"></div><div class="c-bardot" style="background:#2ACB42"></div><div class="c-barurl"><span style="margin-right:3px">🔒</span>app.jestly.fr/clients</div></div>

  <div class="c-builder">
    <!-- Toolbar (identical to d-toolbar) -->
    <div class="c-toolbar">
      <div class="c-tbl"><span class="c-logo">Jestly</span><div class="c-divider"></div><span class="c-pagename" data-el="pageTitle">CRM clients</span></div>
      <div class="c-tbl"><button class="c-addbtn" data-el="addBtn">+ Nouveau prospect</button></div>
    </div>

    <!-- Sidebar (170px — identical to d-side) -->
    <div class="c-side">
      <div class="c-stitle">Navigation</div>
      <div class="c-sitem"><div class="c-sicon">⌂</div>Dashboard</div>
      <div class="c-sitem act"><div class="c-sicon">♦</div>Clients</div>
      <div class="c-sitem"><div class="c-sicon">☰</div>Commandes</div>
      <div class="c-sitem"><div class="c-sicon">✎</div>Facturation</div>
      <div class="c-sitem"><div class="c-sicon">◆</div>Analytics</div>
      <div class="c-stitle" style="margin-top:10px">Pipeline</div>
      <div class="c-sitem" style="font-size:8px;color:#6B7280"><div class="c-sicon" style="background:rgba(124,92,255,0.08)">●</div>Tous les contacts</div>
      <div class="c-sitem" style="font-size:8px;color:#6B7280"><div class="c-sicon" style="background:rgba(16,185,129,0.08)">✓</div>Clients actifs</div>
    </div>

    <!-- Canvas (identical bg to d-canvas) -->
    <div class="c-canvas">
      <!-- KPIs (badge-style, light) -->
      <div class="c-kpis" data-el="kpis">
        <div class="c-kpi"><div class="c-kpi-label">Prospects</div><div class="c-kpi-val" data-el="kpiCount">7</div></div>
        <div class="c-kpi"><div class="c-kpi-label">Clients</div><div class="c-kpi-val" data-el="kpiClients">23</div></div>
        <div class="c-kpi"><div class="c-kpi-label">CA pipeline</div><div class="c-kpi-val" data-el="kpiCA">15 920 €</div></div>
      </div>

      <!-- Pipeline board -->
      <div class="c-board" data-el="board">
        <!-- Nouveau -->
        <div class="c-col">
          <div class="c-colh"><div class="c-colname"><div class="c-coldot" style="background:#7C5CFF"></div>Nouveau</div><span class="c-colcount" data-el="countNew">4</span></div>
          <div data-el="colNew">
            <div class="c-card"><div class="c-dot" style="background:#A78BFA">AL</div><div class="c-ci"><div class="c-cn">Amélie Leroy</div><div class="c-cp">1 800 €</div></div></div>
            <div class="c-card"><div class="c-dot" style="background:#F59E0B">JP</div><div class="c-ci"><div class="c-cn">Julien Petit</div><div class="c-cp">3 200 €</div></div></div>
            <div class="c-card"><div class="c-dot" style="background:#10B981">SB</div><div class="c-ci"><div class="c-cn">Sophie Bernard</div><div class="c-cp">950 €</div></div></div>
            <div class="c-card"><div class="c-dot" style="background:#0EA5E9">ML</div><div class="c-ci"><div class="c-cn">Marc Laurent</div><div class="c-cp">2 400 €</div></div></div>
          </div>
        </div>
        <!-- En discussion -->
        <div class="c-col">
          <div class="c-colh"><div class="c-colname"><div class="c-coldot" style="background:#F59E0B"></div>En discussion</div><span class="c-colcount" data-el="countDiscuss">3</span></div>
          <div data-el="colDiscuss">
            <div class="c-card" data-el="cardThomas"><div class="c-dot" style="background:#6366F1">TD</div><div class="c-ci"><div class="c-cn">Thomas Durand</div><div class="c-cp">4 500 €</div></div></div>
            <div class="c-card"><div class="c-dot" style="background:#EC4899">LM</div><div class="c-ci"><div class="c-cn">Léa Martin</div><div class="c-cp">1 200 €</div></div></div>
            <div class="c-card"><div class="c-dot" style="background:#8B5CF6">NR</div><div class="c-ci"><div class="c-cn">Nicolas Roy</div><div class="c-cp">800 €</div></div></div>
          </div>
        </div>
        <!-- Proposition -->
        <div class="c-col">
          <div class="c-colh"><div class="c-colname"><div class="c-coldot" style="background:#A855F7"></div>Proposition</div><span class="c-colcount" data-el="countPropo">2</span></div>
          <div data-el="colPropo">
            <div class="c-card"><div class="c-dot" style="background:#14B8A6">CD</div><div class="c-ci"><div class="c-cn">Claire Dupont</div><div class="c-cp">3 800 €</div></div></div>
            <div class="c-card"><div class="c-dot" style="background:#F97316">RG</div><div class="c-ci"><div class="c-cn">Romain Garcia</div><div class="c-cp">1 500 €</div></div></div>
          </div>
        </div>
        <!-- Gagné -->
        <div class="c-col">
          <div class="c-colh"><div class="c-colname"><div class="c-coldot" style="background:#10B981"></div>Gagné</div><span class="c-colcount" data-el="countGagne">5</span></div>
          <div data-el="colGagne">
            <div class="c-card won"><div class="c-dot" style="background:#059669">MB</div><div class="c-ci"><div class="c-cn">Marie Blanc</div><div class="c-cp">5 200 €</div></div></div>
            <div class="c-card won"><div class="c-dot" style="background:#0D9488">PL</div><div class="c-ci"><div class="c-cn">Pierre Lefèvre</div><div class="c-cp">2 800 €</div></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inspector (190px — identical to d-insp) -->
    <div class="c-insp" data-el="insp">
      <div class="c-tabs"><div class="c-tab act">Aperçu</div><div class="c-tab">Activité</div></div>
      <!-- Default content -->
      <div class="c-icont" data-el="inspDefault">
        <div class="c-fl" style="margin-bottom:6px">Résumé pipeline</div>
        <div class="c-istat">
          <div class="c-istat-row"><span class="c-istat-label">Nouveau</span><span class="c-istat-val">4 contacts</span></div>
          <div class="c-istat-row"><span class="c-istat-label">En discussion</span><span class="c-istat-val">3 contacts</span></div>
          <div class="c-istat-row"><span class="c-istat-label">Proposition</span><span class="c-istat-val">2 contacts</span></div>
          <div class="c-istat-row"><span class="c-istat-label">Gagné</span><span class="c-istat-val">5 contacts</span></div>
        </div>
        <div class="c-fl" style="margin-bottom:6px">Dernière activité</div>
        <div style="padding:5px 6px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:4px;font-size:8px;color:#6B7280;line-height:1.4">
          Thomas Durand — appel planifié demain à 14h
        </div>
      </div>
      <!-- Detail content (hidden, shown on card click) -->
      <div class="c-idetail" data-el="inspDetail">
        <div class="c-dsec" data-el="dHead">
          <div class="c-dh"><div class="c-davatar">ER</div><div><div class="c-dname">Emma Rousseau</div><div class="c-demail">emma@bloom.fr</div><div class="c-dbadge" data-el="statusBadge">Prospect</div></div></div>
        </div>
        <div class="c-dsec" data-el="dFields">
          <div class="c-dfields">
            <div class="c-df"><div class="c-dfl">Projet</div><div class="c-dfv">Refonte identité</div></div>
            <div class="c-df"><div class="c-dfl">Budget</div><div class="c-dfv">2 500 €</div></div>
            <div class="c-df"><div class="c-dfl">Source</div><div class="c-dfv">Instagram</div></div>
            <div class="c-df"><div class="c-dfl">Créé le</div><div class="c-dfv">19 mars</div></div>
          </div>
        </div>
        <div class="c-dsec" data-el="dTags">
          <div class="c-dtags">
            <span class="c-dtag" style="background:#EDE9FE;color:#7C5CFF">Design</span>
            <span class="c-dtag" style="background:#F5F3FA;color:#8B5CF6">Branding</span>
          </div>
        </div>
        <div class="c-dsec" data-el="dNotes">
          <div class="c-fl">Notes</div>
          <div class="c-dnote" data-el="noteInput"></div>
        </div>
        <div class="c-dsec" data-el="dTimeline">
          <div class="c-fl">Historique</div>
          <div class="c-tl">
            <div class="c-tlitem"><div class="c-tldot"></div><div class="c-tlline"></div><div><div class="c-tltext">Prospect ajouté</div><div class="c-tldate">19 mars · 10h24</div></div></div>
            <div class="c-tlitem"><div class="c-tldot" style="background:#F59E0B"></div><div class="c-tlline"></div><div><div class="c-tltext">En discussion</div><div class="c-tldate">19 mars · 10h26</div></div></div>
            <div class="c-tlitem"><div class="c-tldot" style="background:#A78BFA"></div><div><div class="c-tltext">Note ajoutée</div><div class="c-tldate">19 mars · 10h28</div></div></div>
          </div>
        </div>
        <div class="c-dsec" data-el="dRelance">
          <div class="c-relance"><span style="font-size:9px">🔔</span><div class="c-relance-text">Relance : 22 mars</div></div>
          <button class="c-convert" data-el="convertBtn"><span class="c-spinner"></span><span data-el="convertLabel">Convertir en client</span></button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div class="c-modalbg" data-el="modal">
    <div class="c-modal">
      <div class="c-mt">Nouveau prospect</div>
      <div class="c-ms">Ajoutez un contact à votre pipeline.</div>
      <div class="c-fg"><div class="c-fl">Nom</div><div class="c-fi" data-el="fName"></div></div>
      <div class="c-fg"><div class="c-fl">Email</div><div class="c-fi" data-el="fEmail"></div></div>
      <div class="c-fg"><div class="c-fl">Projet</div><div class="c-fi" data-el="fProject"></div></div>
      <div class="c-fg"><div class="c-fl">Budget</div><div class="c-fi" data-el="fBudget"></div></div>
      <button class="c-mbtn" data-el="modalSubmit">Ajouter</button>
    </div>
  </div>

  <!-- Overlay (identical to d-overlay) -->
  <div class="c-overlay" data-el="overlay"><div class="c-okicon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M5 13l4 4L19 7"/></svg></div><div class="c-okt">CRM à jour !</div><div style="height:6px"></div><div class="c-oku">24 clients · 18 420 € pipeline</div></div>

  <!-- Cursor (identical to d-cur) -->
  <div class="c-cur" data-el="cur"><svg viewBox="0 0 24 24" fill="none" width="14" height="17"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="#1A1A2E" stroke-width="1.5" stroke-linejoin="round"/></svg><div class="c-click" data-el="clk"></div></div>
</div>
</div>`;
