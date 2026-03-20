"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;
const TOTAL_DURATION = 32;

interface AgendaDemoPlayerProps { label?: string; accentColor?: string; }
interface Keyframe { t: number; apply: (ctx: DemoCtx) => void; }
interface DemoCtx {
  root: HTMLElement;
  q: (s: string) => HTMLElement;
  cursorTo: (dataEl: string, offsetX?: number, offsetY?: number) => void;
  clickAt: () => void;
}

/* ═══════════════════════════════════════════════════════════
   TIMELINE
   ═══════════════════════════════════════════════════════════ */

function buildTimeline(): Keyframe[] {
  const K: Keyframe[] = [];
  const k = (t: number, apply: (ctx: DemoCtx) => void) => K.push({ t, apply });

  // ── SCENE 1: INTRO (0 → 3.5s) ──
  k(0, ctx => { ctx.q("shell").classList.add("vis"); });
  k(0.8, ctx => { ctx.q("cur").classList.add("vis"); ctx.cursorTo("viewWeek"); });
  k(1.2, ctx => { ctx.q("insp").classList.add("vis"); });
  k(1.8, ctx => { ctx.q("miniCal").classList.add("vis"); });
  k(2.4, ctx => { ctx.q("weekGrid").classList.add("vis"); });

  // ── SCENE 2: ADD EVENT (3.5 → 9.5s) ──
  k(3.5, ctx => { ctx.cursorTo("slot10"); });
  k(4.0, ctx => { ctx.clickAt(); ctx.q("modal").classList.add("open"); });
  // Fill title
  k(4.8, ctx => { ctx.cursorTo("fTitle"); });
  k(5.0, ctx => { ctx.clickAt(); ctx.q("fTitle").classList.add("ed"); ctx.q("fTitle").textContent = "Call découverte"; });
  k(5.4, ctx => { ctx.q("fTitle").textContent = "Call découverte — Emma R."; ctx.q("fTitle").classList.remove("ed"); });
  // Fill client
  k(5.7, ctx => { ctx.cursorTo("fClient"); });
  k(5.9, ctx => { ctx.clickAt(); ctx.q("fClient").classList.add("ed"); ctx.q("fClient").textContent = "Emma Rousseau"; ctx.q("fClient").classList.remove("ed"); });
  // Fill time
  k(6.2, ctx => { ctx.cursorTo("fTime"); });
  k(6.4, ctx => { ctx.clickAt(); ctx.q("fTime").classList.add("ed"); ctx.q("fTime").textContent = "10h00 — 10h45"; ctx.q("fTime").classList.remove("ed"); });
  // Select type tag
  k(6.8, ctx => { ctx.cursorTo("tagCall"); });
  k(7.1, ctx => { ctx.clickAt(); ctx.q("tagCall").classList.add("sel"); });
  // Submit
  k(7.6, ctx => { ctx.cursorTo("modalSubmit"); });
  k(8.0, ctx => {
    ctx.clickAt();
    ctx.q("modal").classList.remove("open");
    // Insert event block in week grid
    const ev = document.createElement("div");
    ev.className = "a-ev entering";
    ev.setAttribute("data-el", "evCall");
    ev.setAttribute("style", "background:rgba(124,92,255,0.08);border-left:2px solid #7C5CFF");
    ev.innerHTML = '<div class="a-evt">Call découverte</div><div class="a-evs">Emma R. · 10h00</div>';
    ctx.q("slot10").appendChild(ev);
    ctx.q("inspCount").textContent = "6";
  });

  // ── SCENE 3: WEEK VIEW NAVIGATION (9.5 → 14.5s) ──
  k(9.5, ctx => { ctx.cursorTo("viewWeek"); });
  k(9.8, ctx => { ctx.clickAt(); ctx.q("viewWeek").classList.add("act"); ctx.q("viewDay").classList.remove("act"); });
  // Highlight Thursday
  k(10.5, ctx => { ctx.cursorTo("dayJeu"); });
  k(10.8, ctx => { ctx.clickAt(); ctx.q("dayJeu").classList.add("today"); });
  // Reveal more events
  k(11.3, ctx => { ctx.q("evDeadline").classList.add("vis"); });
  k(11.8, ctx => { ctx.q("evLivraison").classList.add("vis"); });
  k(12.3, ctx => { ctx.q("evReview").classList.add("vis"); });

  // ── SCENE 4: TIME BLOCKING (14.5 → 21s) ──
  k(14.5, ctx => { ctx.cursorTo("slot14"); });
  k(15.0, ctx => { ctx.clickAt(); });
  k(15.4, ctx => {
    // Add deep work block
    const block = document.createElement("div");
    block.className = "a-ev entering a-block";
    block.setAttribute("data-el", "blockDeep");
    block.innerHTML = '<div class="a-evt">Travail profond</div><div class="a-evs">14h — 16h30</div>';
    ctx.q("slot14").appendChild(block);
  });
  k(16.2, ctx => { ctx.cursorTo("slot16"); });
  k(16.6, ctx => {
    ctx.clickAt();
    const block2 = document.createElement("div");
    block2.className = "a-ev entering a-block";
    block2.innerHTML = '<div class="a-evt">Indisponible</div><div class="a-evs">16h30 — 17h</div>';
    ctx.q("slot16").appendChild(block2);
  });
  // Update inspector
  k(17.2, ctx => {
    ctx.q("inspOccupe").textContent = "4h30";
    ctx.q("inspDispo").textContent = "3h30";
  });

  // ── SCENE 5: PRIORITIES PANEL (18 → 24s) ──
  k(18.0, ctx => { ctx.cursorTo("tabPrio"); });
  k(18.3, ctx => {
    ctx.clickAt();
    ctx.q("tabPrio").classList.add("act");
    ctx.q("tabApercu").classList.remove("act");
    ctx.q("inspDefault").style.display = "none";
    ctx.q("inspPrio").classList.add("vis");
  });
  k(18.9, ctx => { ctx.q("prioToday").classList.add("vis"); });
  k(19.5, ctx => { ctx.q("prioNext").classList.add("vis"); });
  k(20.2, ctx => { ctx.q("prioTasks").classList.add("vis"); });

  // check a task
  k(21.0, ctx => { ctx.cursorTo("taskCheck"); });
  k(21.3, ctx => {
    ctx.clickAt();
    ctx.q("taskCheck").classList.add("done");
    ctx.q("taskLabel").style.textDecoration = "line-through";
    ctx.q("taskLabel").style.color = "#9CA3AF";
  });

  // ── SCENE 6: OUTRO (24 → 32s) ──
  k(24.5, ctx => { ctx.q("overlay").classList.add("vis"); });
  k(31.0, ctx => { ctx.q("cur").classList.remove("vis"); });

  return K.sort((a, b) => a.t - b.t);
}

/* ═══════════════════════════════════════════════════════════
   REACT COMPONENT — identical engine
   ═══════════════════════════════════════════════════════════ */

export default function AgendaDemoPlayer({
  label = "Voir l'agenda en action",
  accentColor = "#4C8DFF",
}: AgendaDemoPlayerProps) {
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

  const SNAP_TIMES = [3.5, 9.5, 14.5, 18.0, 24.5];

  const seekTo = useCallback((t: number) => {
    const root = containerRef.current; if (!root) return;
    const snapTimes = [...snapshotsRef.current.keys()].sort((a, b) => a - b);
    let restoreFrom = -1;
    for (const st of snapTimes) { if (st <= t) restoreFrom = st; else break; }
    if (restoreFrom >= 0 && snapshotsRef.current.has(restoreFrom)) {
      const dRoot = root.querySelector(".a-root"); if (dRoot) dRoot.innerHTML = snapshotsRef.current.get(restoreFrom)!;
    } else { root.innerHTML = initialHtmlRef.current; restoreFrom = -1; }
    void root.offsetHeight;
    const ctx = makeCtx(root);
    for (const kf of timelineRef.current) { if (kf.t <= restoreFrom) continue; if (kf.t > t) break; try { kf.apply(ctx); } catch {} }
    lastAppliedRef.current = t; setCurrentTime(t);
  }, [makeCtx]);

  const initialize = useCallback(() => {
    const root = containerRef.current; if (!root) return;
    root.innerHTML = AGENDA_DEMO_HTML; initialHtmlRef.current = AGENDA_DEMO_HTML;
    timelineRef.current = buildTimeline(); snapshotsRef.current.clear(); lastAppliedRef.current = -1;
    void root.offsetHeight; const ctx = makeCtx(root);
    for (const kf of timelineRef.current) { if (kf.t > 0) break; try { kf.apply(ctx); } catch {} }
    const dRoot = root.querySelector(".a-root"); if (dRoot) snapshotsRef.current.set(0, dRoot.innerHTML);
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
        const dRoot = root.querySelector(".a-root");
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
        const dRoot = root.querySelector(".a-root");
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
    const dRoot = root.querySelector(".a-root"); if (dRoot) snapshotsRef.current.set(0, dRoot.innerHTML);
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
    { t: 0, label: "Intro" }, { t: 3.5, label: "Événement" }, { t: 9.5, label: "Semaine" },
    { t: 14.5, label: "Blocage" }, { t: 18.0, label: "Priorités" }, { t: 24.5, label: "Résultat" },
  ];
  const currentScene = [...scenes].reverse().find(s => currentTime >= s.t)?.label ?? "Intro";

  return (
    <motion.div
      className="relative w-full max-w-[1100px] mx-auto rounded-2xl overflow-hidden"
      style={{ aspectRatio: "16/9", background: started ? "#0F0E17" : `linear-gradient(135deg, ${accentColor}08, ${accentColor}15)`, border: "1px solid #E5E7EB", boxShadow: "0 20px 60px rgba(124,58,237,0.12), 0 4px 16px rgba(0,0,0,0.04)" }}
      initial={{ opacity: 0, y: 28, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}
      onMouseEnter={() => started && setShowControls(true)} onMouseLeave={() => started && setShowControls(false)}
    >
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
                    {["Dashboard", "Clients", "Agenda", "Commandes"].map((l, i) => (
                      <div key={l} style={{ padding: "3px 5px", borderRadius: 3, fontSize: 7, marginBottom: 2, background: i === 2 ? "#EDE9FE" : "transparent", color: i === 2 ? "#7C5CFF" : "#6B7280", fontWeight: i === 2 ? 600 : 400 }}>{l}</div>
                    ))}
                  </div>
                  <div style={{ flex: 1, background: "#F1EFF7", padding: 8 }}>
                    <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                      {["Lun", "Mar", "Mer", "Jeu", "Ven"].map((d, i) => (
                        <div key={d} style={{ flex: 1, background: "#FFF", borderRadius: 5, padding: 4, border: "1px solid #E8E5F0", textAlign: "center" as const }}>
                          <div style={{ fontSize: 5, color: "#9CA3AF", marginBottom: 2 }}>{d}</div>
                          {[0, 1].map(j => (
                            <div key={j} style={{ height: j === 0 && i === 1 ? 14 : 8, background: j === 0 && i === 1 ? "rgba(124,92,255,0.08)" : "#F5F3FA", borderRadius: 3, marginBottom: 2, borderLeft: j === 0 && i === 1 ? "2px solid #7C5CFF" : "none" }} />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ width: "16%", background: "#FFF", borderLeft: "1px solid #E8E5F0", padding: 5 }}>
                    <div style={{ fontSize: 6, fontWeight: 600, color: "#9CA3AF", marginBottom: 4 }}>Aujourd'hui</div>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ padding: 3, border: "1px solid #E8E5F0", borderRadius: 4, marginBottom: 3 }}>
                        <div style={{ width: "60%", height: 3, background: "#F0EDF7", borderRadius: 2, marginBottom: 2 }} />
                        <div style={{ width: "40%", height: 3, background: "#F5F3FA", borderRadius: 2 }} />
                      </div>
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
   AGENDA DEMO HTML
   Same DA tokens as BuilderDemoPlayer / CrmDemoPlayer:
   Shell #F8F7FC, Canvas #F1EFF7, Border #E8E5F0,
   Accent #7C5CFF, Sidebar 170px, Inspector 190px
   ═══════════════════════════════════════════════════════════ */

const AGENDA_DEMO_HTML = `
<style>
  .a-root{width:100%;height:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;background:#0F0E17;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
  .a-root *,.a-root *::before,.a-root *::after{margin:0;padding:0;box-sizing:border-box}
  .a-shell{width:100%;height:100%;background:#F8F7FC;overflow:hidden;position:relative;opacity:0;transform:scale(0.96);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1),opacity 0.4s ease}
  .a-shell.vis{opacity:1;transform:scale(1)}
  .a-bar{height:28px;background:#FAFAFE;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;padding:0 10px;gap:6px}
  .a-bardot{width:8px;height:8px;border-radius:50%}
  .a-barurl{flex:1;margin-left:8px;height:17px;background:#F3F2F8;border-radius:4px;display:flex;align-items:center;padding:0 8px;font-size:9px;color:#9CA3AF}
  .a-builder{display:flex;height:calc(100% - 28px);position:relative}
  .a-toolbar{position:absolute;top:0;left:0;right:0;height:34px;background:#FFF;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;justify-content:space-between;padding:0 12px;z-index:20}
  .a-logo{font-size:11px;font-weight:800;background:linear-gradient(135deg,#7C5CFF,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .a-divider{width:1px;height:16px;background:#E8E5F0;margin:0 8px}
  .a-pagename{font-size:9px;color:#6B7280;padding:2px 7px;background:#F5F3FA;border-radius:4px}
  .a-tbl{display:flex;align-items:center;gap:6px}
  .a-viewbtn{padding:3px 7px;border-radius:4px;font-size:8px;color:#9CA3AF;border:none;background:none;cursor:pointer}
  .a-viewbtn.act{background:#EDE9FE;color:#7C5CFF;font-weight:600}

  /* Sidebar 170px */
  .a-side{width:170px;background:#FFF;border-right:1px solid #E8E5F0;margin-top:34px;overflow:hidden;padding:8px}
  .a-stitle{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#9CA3AF;margin-bottom:6px;margin-top:6px}
  .a-sitem{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:4px;font-size:10px;color:#1A1A2E}
  .a-sitem.act{background:#EDE9FE;color:#7C5CFF;font-weight:600}
  .a-sicon{width:14px;height:14px;border-radius:3px;background:#F0EDF7;display:flex;align-items:center;justify-content:center;font-size:7px;color:#9CA3AF}
  .a-sitem.act .a-sicon{background:rgba(124,92,255,0.15);color:#7C5CFF}

  /* Mini calendar */
  .a-minical{margin-top:10px;opacity:0;transform:translateY(6px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .a-minical.vis{opacity:1;transform:translateY(0)}
  .a-mchead{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
  .a-mcmonth{font-size:8px;font-weight:700;color:#1A1A2E}
  .a-mcnav{font-size:8px;color:#9CA3AF;cursor:pointer}
  .a-mcgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px}
  .a-mcday{width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:6px;color:#6B7280;border-radius:3px}
  .a-mcday.hd{font-weight:700;color:#9CA3AF;font-size:5.5px}
  .a-mcday.today{background:#7C5CFF;color:#fff;font-weight:700}
  .a-mcday.has{position:relative}
  .a-mcday.has::after{content:'';position:absolute;bottom:1px;width:3px;height:3px;border-radius:50%;background:#7C5CFF}

  /* Canvas */
  .a-canvas{flex:1;margin-top:34px;background:#F1EFF7;overflow:hidden;padding:10px;display:flex;flex-direction:column}

  /* Week header */
  .a-weekhead{display:flex;gap:4px;margin-bottom:6px}
  .a-dayh{flex:1;text-align:center;padding:4px 0;font-size:7px;font-weight:600;color:#9CA3AF;border-radius:4px;cursor:pointer;transition:all 0.2s}
  .a-dayh.today{background:#7C5CFF;color:#fff}
  .a-daynum{font-size:10px;font-weight:700;color:#1A1A2E;display:block}
  .a-dayh.today .a-daynum{color:#fff}

  /* Week grid */
  .a-weekgrid{display:flex;gap:4px;flex:1;opacity:0;transform:translateY(8px);transition:all 0.5s cubic-bezier(0.22,1,0.36,1)}
  .a-weekgrid.vis{opacity:1;transform:translateY(0)}
  .a-daycol{flex:1;background:#FFF;border:1px solid #E8E5F0;border-radius:7px;padding:4px;display:flex;flex-direction:column;gap:2px}

  /* Time slots */
  .a-slot{min-height:22px;padding:2px 3px;border-radius:3px;position:relative}
  .a-slottime{font-size:5.5px;color:#9CA3AF;margin-bottom:1px}

  /* Events */
  .a-ev{padding:4px 5px;border-radius:4px;margin-bottom:2px;transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .a-ev.entering{animation:a-fadeIn 0.4s cubic-bezier(0.22,1,0.36,1)}
  @keyframes a-fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .a-evt{font-size:7px;font-weight:600;color:#1A1A2E}
  .a-evs{font-size:5.5px;color:#9CA3AF;margin-top:1px}
  .a-ev.a-block{background:repeating-linear-gradient(135deg,rgba(124,92,255,0.04),rgba(124,92,255,0.04) 3px,rgba(124,92,255,0.08) 3px,rgba(124,92,255,0.08) 6px);border-left:2px solid #A78BFA}
  .a-ev.vis-ev{opacity:0;animation:a-fadeIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards}

  /* Hidden events revealed by timeline */
  .a-hidden{opacity:0;transform:translateY(4px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .a-hidden.vis{opacity:1;transform:translateY(0)}

  /* Inspector 190px */
  .a-insp{width:190px;background:#FFF;border-left:1px solid #E8E5F0;margin-top:34px;overflow-y:auto;opacity:0;transform:translateX(8px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .a-insp.vis{opacity:1;transform:translateX(0)}
  .a-tabs{display:flex;border-bottom:1px solid #E8E5F0}
  .a-tab{flex:1;padding:7px 5px;font-size:8px;font-weight:600;text-align:center;color:#9CA3AF;border-bottom:2px solid transparent;cursor:pointer}
  .a-tab.act{color:#7C5CFF;border-bottom-color:#7C5CFF}
  .a-icont{padding:8px}
  .a-fl{font-size:7px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px}
  .a-fi{width:100%;padding:4px 6px;border:1px solid #E8E5F0;border-radius:4px;font-size:9px;color:#1A1A2E;background:#FAFAFE;transition:border-color 0.2s;min-height:20px}
  .a-fi.ed{border-color:#7C5CFF;box-shadow:0 0 0 2px rgba(124,92,255,0.1)}

  /* Inspector stats */
  .a-irow{display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #F0EDF7}
  .a-irowl{font-size:7px;color:#9CA3AF}
  .a-irowv{font-size:8px;font-weight:600;color:#1A1A2E}

  /* Inspector priorities panel */
  .a-iprio{display:none;padding:8px}
  .a-iprio.vis{display:block}
  .a-dsec{opacity:0;transform:translateY(6px);transition:all 0.35s cubic-bezier(0.22,1,0.36,1);margin-bottom:8px}
  .a-dsec.vis{opacity:1;transform:translateY(0)}
  .a-pitem{display:flex;align-items:center;gap:5px;padding:4px 5px;border:1px solid #E8E5F0;border-radius:4px;margin-bottom:3px;background:#FAFAFE}
  .a-pdot{width:5px;height:5px;border-radius:2px;flex-shrink:0}
  .a-ptext{font-size:7px;color:#1A1A2E;flex:1}
  .a-ptime{font-size:6px;color:#9CA3AF}
  .a-taskrow{display:flex;align-items:center;gap:5px;padding:4px 5px;border:1px solid #E8E5F0;border-radius:4px;margin-bottom:3px;background:#FAFAFE}
  .a-taskcheck{width:10px;height:10px;border:1.5px solid #E8E5F0;border-radius:2px;flex-shrink:0;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center}
  .a-taskcheck.done{background:#10B981;border-color:#10B981}
  .a-taskcheck.done::after{content:'✓';font-size:6px;color:#fff}
  .a-tasklabel{font-size:7px;color:#1A1A2E;transition:all 0.3s}

  /* Modal */
  .a-modalbg{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.85);backdrop-filter:blur(4px);z-index:40;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s}
  .a-modalbg.open{opacity:1;pointer-events:all}
  .a-modal{width:260px;background:#FFF;border-radius:8px;padding:14px;box-shadow:0 12px 40px rgba(0,0,0,0.1);border:1px solid #E8E5F0;transform:translateY(8px) scale(0.97);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1)}
  .a-modalbg.open .a-modal{transform:translateY(0) scale(1)}
  .a-mt{font-size:11px;font-weight:700;color:#1A1A2E;margin-bottom:2px}
  .a-ms{font-size:8px;color:#9CA3AF;margin-bottom:8px}
  .a-fg{margin-bottom:6px}
  .a-tags{display:flex;gap:3px;margin-bottom:6px}
  .a-tag{font-size:6px;font-weight:600;padding:2px 6px;border-radius:8px;cursor:pointer;border:1px solid #E8E5F0;color:#6B7280;transition:all 0.2s}
  .a-tag.sel{border-color:#7C5CFF;background:#EDE9FE;color:#7C5CFF}
  .a-mbtn{width:100%;padding:5px;background:#7C5CFF;color:#fff;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;margin-top:4px}

  /* Overlay */
  .a-overlay{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.95);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:50;opacity:0;pointer-events:none;transition:opacity 0.5s}
  .a-overlay.vis{opacity:1;pointer-events:all}
  .a-okicon{width:42px;height:42px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center;margin-bottom:12px;transform:scale(0);transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1)}
  .a-overlay.vis .a-okicon{transform:scale(1)}
  .a-okt{font-size:16px;font-weight:700;color:#1A1A2E;margin-bottom:4px}
  .a-oku{font-size:10px;color:#7C5CFF;background:#EDE9FE;padding:4px 12px;border-radius:14px;font-weight:500}

  /* Cursor */
  .a-cur{position:absolute;width:14px;height:17px;z-index:100;pointer-events:none;opacity:0;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.2));transition:opacity 0.3s}
  .a-cur.vis{opacity:1}
  .a-click{position:absolute;width:18px;height:18px;border-radius:50%;background:rgba(124,92,255,0.3);transform:translate(-2px,-1px) scale(0);pointer-events:none;z-index:99}
  .a-click.pop{animation:a-pop 0.35s ease-out forwards}
  @keyframes a-pop{0%{transform:translate(-2px,-1px) scale(0);opacity:1}100%{transform:translate(-2px,-1px) scale(2);opacity:0}}
</style>

<div class="a-root">
<div class="a-shell" data-el="shell">
  <div class="a-bar"><div class="a-bardot" style="background:#FF6159"></div><div class="a-bardot" style="background:#FFBF2F"></div><div class="a-bardot" style="background:#2ACB42"></div><div class="a-barurl"><span style="margin-right:3px">🔒</span>app.jestly.fr/agenda</div></div>

  <div class="a-builder">
    <div class="a-toolbar">
      <div class="a-tbl"><span class="a-logo">Jestly</span><div class="a-divider"></div><span class="a-pagename">Agenda</span></div>
      <div class="a-tbl">
        <button class="a-viewbtn" data-el="viewDay">Jour</button>
        <button class="a-viewbtn act" data-el="viewWeek">Semaine</button>
        <button class="a-viewbtn">Mois</button>
      </div>
      <div class="a-tbl"><span style="font-size:9px;font-weight:600;color:#1A1A2E">Mars 2026</span></div>
    </div>

    <!-- Sidebar -->
    <div class="a-side">
      <div class="a-stitle">Navigation</div>
      <div class="a-sitem"><div class="a-sicon">⌂</div>Dashboard</div>
      <div class="a-sitem"><div class="a-sicon">♦</div>Clients</div>
      <div class="a-sitem act"><div class="a-sicon">◈</div>Agenda</div>
      <div class="a-sitem"><div class="a-sicon">☰</div>Commandes</div>
      <div class="a-sitem"><div class="a-sicon">✎</div>Facturation</div>

      <!-- Mini calendar -->
      <div class="a-minical" data-el="miniCal">
        <div class="a-mchead"><span class="a-mcnav">‹</span><span class="a-mcmonth">Mars 2026</span><span class="a-mcnav">›</span></div>
        <div class="a-mcgrid">
          <div class="a-mcday hd">L</div><div class="a-mcday hd">M</div><div class="a-mcday hd">M</div><div class="a-mcday hd">J</div><div class="a-mcday hd">V</div><div class="a-mcday hd">S</div><div class="a-mcday hd">D</div>
          <div class="a-mcday"></div><div class="a-mcday"></div><div class="a-mcday"></div><div class="a-mcday"></div><div class="a-mcday"></div><div class="a-mcday"></div><div class="a-mcday">1</div>
          <div class="a-mcday">2</div><div class="a-mcday has">3</div><div class="a-mcday">4</div><div class="a-mcday has">5</div><div class="a-mcday">6</div><div class="a-mcday">7</div><div class="a-mcday">8</div>
          <div class="a-mcday">9</div><div class="a-mcday has">10</div><div class="a-mcday">11</div><div class="a-mcday has">12</div><div class="a-mcday">13</div><div class="a-mcday">14</div><div class="a-mcday">15</div>
          <div class="a-mcday has">16</div><div class="a-mcday has">17</div><div class="a-mcday has">18</div><div class="a-mcday today">19</div><div class="a-mcday has">20</div><div class="a-mcday">21</div><div class="a-mcday">22</div>
          <div class="a-mcday">23</div><div class="a-mcday has">24</div><div class="a-mcday">25</div><div class="a-mcday">26</div><div class="a-mcday has">27</div><div class="a-mcday">28</div><div class="a-mcday">29</div>
          <div class="a-mcday">30</div><div class="a-mcday">31</div>
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div class="a-canvas">
      <!-- Week day headers -->
      <div class="a-weekhead">
        <div class="a-dayh"><span>Lun</span><span class="a-daynum">16</span></div>
        <div class="a-dayh"><span>Mar</span><span class="a-daynum">17</span></div>
        <div class="a-dayh"><span>Mer</span><span class="a-daynum">18</span></div>
        <div class="a-dayh today" data-el="dayJeu"><span>Jeu</span><span class="a-daynum">19</span></div>
        <div class="a-dayh"><span>Ven</span><span class="a-daynum">20</span></div>
      </div>

      <!-- Week grid -->
      <div class="a-weekgrid" data-el="weekGrid">
        <!-- Lundi -->
        <div class="a-daycol">
          <div class="a-slot"><div class="a-slottime">9h</div></div>
          <div class="a-slot"><div class="a-slottime">10h</div>
            <div class="a-ev" style="background:rgba(236,72,153,0.06);border-left:2px solid #EC4899"><div class="a-evt">Brief client</div><div class="a-evs">Léa M. · 10h</div></div>
          </div>
          <div class="a-slot"><div class="a-slottime">14h</div>
            <div class="a-ev" style="background:rgba(16,185,129,0.06);border-left:2px solid #10B981"><div class="a-evt">Livraison logo</div><div class="a-evs">Deadline · 14h</div></div>
          </div>
        </div>
        <!-- Mardi -->
        <div class="a-daycol">
          <div class="a-slot"><div class="a-slottime">9h</div>
            <div class="a-ev" style="background:rgba(124,92,255,0.06);border-left:2px solid #7C5CFF"><div class="a-evt">Réunion équipe</div><div class="a-evs">Hebdo · 9h30</div></div>
          </div>
          <div class="a-slot"><div class="a-slottime">11h</div></div>
          <div class="a-slot"><div class="a-slottime">15h</div>
            <div class="a-ev" style="background:rgba(245,158,11,0.06);border-left:2px solid #F59E0B"><div class="a-evt">Call Thomas</div><div class="a-evs">Suivi projet · 15h</div></div>
          </div>
        </div>
        <!-- Mercredi -->
        <div class="a-daycol">
          <div class="a-slot"><div class="a-slottime">9h</div></div>
          <div class="a-slot"><div class="a-slottime">10h</div>
            <div class="a-ev a-hidden" data-el="evReview" style="background:rgba(139,92,246,0.06);border-left:2px solid #8B5CF6"><div class="a-evt">Review design</div><div class="a-evs">Claire D. · 10h30</div></div>
          </div>
          <div class="a-slot"><div class="a-slottime">14h</div></div>
        </div>
        <!-- Jeudi (today) -->
        <div class="a-daycol" style="background:rgba(124,92,255,0.02)">
          <div class="a-slot"><div class="a-slottime">9h</div>
            <div class="a-ev" style="background:rgba(124,92,255,0.06);border-left:2px solid #7C5CFF"><div class="a-evt">Compta mensuelle</div><div class="a-evs">9h — 9h45</div></div>
          </div>
          <div class="a-slot" data-el="slot10"><div class="a-slottime">10h</div></div>
          <div class="a-slot" data-el="slot14"><div class="a-slottime">14h</div></div>
          <div class="a-slot" data-el="slot16"><div class="a-slottime">16h</div></div>
        </div>
        <!-- Vendredi -->
        <div class="a-daycol">
          <div class="a-slot"><div class="a-slottime">9h</div></div>
          <div class="a-slot"><div class="a-slottime">11h</div>
            <div class="a-ev a-hidden" data-el="evDeadline" style="background:rgba(239,68,68,0.06);border-left:2px solid #EF4444"><div class="a-evt">Deadline branding</div><div class="a-evs">Romain G. · 11h</div></div>
          </div>
          <div class="a-slot"><div class="a-slottime">14h</div>
            <div class="a-ev a-hidden" data-el="evLivraison" style="background:rgba(16,185,129,0.06);border-left:2px solid #10B981"><div class="a-evt">Livraison vidéo</div><div class="a-evs">Marc L. · 14h</div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Inspector 190px -->
    <div class="a-insp" data-el="insp">
      <div class="a-tabs">
        <div class="a-tab act" data-el="tabApercu">Aperçu</div>
        <div class="a-tab" data-el="tabPrio">Priorités</div>
      </div>
      <!-- Default panel -->
      <div class="a-icont" data-el="inspDefault">
        <div class="a-fl" style="margin-bottom:6px">Aujourd'hui — Jeu 19</div>
        <div style="margin-bottom:8px">
          <div class="a-irow"><span class="a-irowl">Événements</span><span class="a-irowv" data-el="inspCount">5</span></div>
          <div class="a-irow"><span class="a-irowl">Occupé</span><span class="a-irowv" data-el="inspOccupe">2h45</span></div>
          <div class="a-irow"><span class="a-irowl">Disponible</span><span class="a-irowv" data-el="inspDispo">5h15</span></div>
        </div>
        <div class="a-fl" style="margin-bottom:6px">Prochain</div>
        <div style="padding:5px 6px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:4px;font-size:8px;color:#6B7280;line-height:1.4;margin-bottom:6px">
          Compta mensuelle — 9h
        </div>
        <div class="a-fl" style="margin-bottom:6px">Légende</div>
        <div style="display:flex;flex-direction:column;gap:3px">
          <div style="display:flex;align-items:center;gap:5px"><div style="width:8px;height:3px;border-radius:1px;background:#7C5CFF"></div><span style="font-size:7px;color:#6B7280">Rendez-vous</span></div>
          <div style="display:flex;align-items:center;gap:5px"><div style="width:8px;height:3px;border-radius:1px;background:#10B981"></div><span style="font-size:7px;color:#6B7280">Deadline</span></div>
          <div style="display:flex;align-items:center;gap:5px"><div style="width:8px;height:3px;border-radius:1px;background:#F59E0B"></div><span style="font-size:7px;color:#6B7280">Call</span></div>
          <div style="display:flex;align-items:center;gap:5px"><div style="width:8px;height:3px;border-radius:1px;background:#EF4444"></div><span style="font-size:7px;color:#6B7280">Urgent</span></div>
          <div style="display:flex;align-items:center;gap:5px"><div style="width:8px;height:3px;border-radius:1px;background:#A78BFA"></div><span style="font-size:7px;color:#6B7280">Bloc temps</span></div>
        </div>
      </div>
      <!-- Priorities panel -->
      <div class="a-iprio" data-el="inspPrio">
        <div class="a-dsec" data-el="prioToday">
          <div class="a-fl" style="margin-bottom:4px">Aujourd'hui</div>
          <div class="a-pitem"><div class="a-pdot" style="background:#7C5CFF"></div><div class="a-ptext">Compta mensuelle</div><div class="a-ptime">9h</div></div>
          <div class="a-pitem"><div class="a-pdot" style="background:#7C5CFF"></div><div class="a-ptext">Call découverte — Emma</div><div class="a-ptime">10h</div></div>
          <div class="a-pitem"><div class="a-pdot" style="background:#A78BFA"></div><div class="a-ptext">Travail profond</div><div class="a-ptime">14h</div></div>
        </div>
        <div class="a-dsec" data-el="prioNext">
          <div class="a-fl" style="margin-bottom:4px">Demain</div>
          <div class="a-pitem"><div class="a-pdot" style="background:#EF4444"></div><div class="a-ptext">Deadline branding</div><div class="a-ptime">11h</div></div>
          <div class="a-pitem"><div class="a-pdot" style="background:#10B981"></div><div class="a-ptext">Livraison vidéo</div><div class="a-ptime">14h</div></div>
        </div>
        <div class="a-dsec" data-el="prioTasks">
          <div class="a-fl" style="margin-bottom:4px">Tâches</div>
          <div class="a-taskrow"><div class="a-taskcheck" data-el="taskCheck"></div><span class="a-tasklabel" data-el="taskLabel">Envoyer devis Emma</span></div>
          <div class="a-taskrow"><div class="a-taskcheck"></div><span class="a-tasklabel">Finaliser maquette Claire</span></div>
          <div class="a-taskrow"><div class="a-taskcheck done"></div><span class="a-tasklabel" style="text-decoration:line-through;color:#9CA3AF">Relancer Thomas</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div class="a-modalbg" data-el="modal">
    <div class="a-modal">
      <div class="a-mt">Nouvel événement</div>
      <div class="a-ms">Jeudi 19 mars · 10h00</div>
      <div class="a-fg"><div class="a-fl">Titre</div><div class="a-fi" data-el="fTitle"></div></div>
      <div class="a-fg"><div class="a-fl">Client</div><div class="a-fi" data-el="fClient"></div></div>
      <div class="a-fg"><div class="a-fl">Horaire</div><div class="a-fi" data-el="fTime"></div></div>
      <div class="a-fl">Type</div>
      <div class="a-tags">
        <span class="a-tag" data-el="tagCall">Call</span>
        <span class="a-tag">RDV</span>
        <span class="a-tag">Deadline</span>
        <span class="a-tag">Livraison</span>
      </div>
      <button class="a-mbtn" data-el="modalSubmit">Ajouter</button>
    </div>
  </div>

  <!-- Overlay -->
  <div class="a-overlay" data-el="overlay"><div class="a-okicon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M5 13l4 4L19 7"/></svg></div><div class="a-okt">Semaine organisée !</div><div style="height:6px"></div><div class="a-oku">6 événements · 4h30 occupé · Tout sous contrôle</div></div>

  <!-- Cursor -->
  <div class="a-cur" data-el="cur"><svg viewBox="0 0 24 24" fill="none" width="14" height="17"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="#1A1A2E" stroke-width="1.5" stroke-linejoin="round"/></svg><div class="a-click" data-el="clk"></div></div>
</div>
</div>`;
