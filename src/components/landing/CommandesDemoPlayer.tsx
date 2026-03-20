"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;
const TOTAL_DURATION = 32;

interface Props { label?: string; accentColor?: string; }
interface Keyframe { t: number; apply: (ctx: DemoCtx) => void; }
interface DemoCtx {
  root: HTMLElement;
  q: (s: string) => HTMLElement;
  cursorTo: (dataEl: string, offsetX?: number, offsetY?: number) => void;
  clickAt: () => void;
}

/* ═══════════════════════════════════════════════════════════
   TIMELINE — Commandes demo
   Scene 1: Intro (0→3.5s) — shell + pipeline cards + tabs + table
   Scene 2: Create order (3.5→9.5s) — modal + fill + submit
   Scene 3: Status flow (9.5→14.5s) — À faire → En cours, En cours → Livré
   Scene 4: Detail panel (14.5→20s) — inspector detail + add note
   Scene 5: Delivery (20→26s) — check deliverable + badge update + KPI
   Scene 6: Outro (26→32s)
   ═══════════════════════════════════════════════════════════ */

function buildTimeline(): Keyframe[] {
  const K: Keyframe[] = [];
  const k = (t: number, apply: (ctx: DemoCtx) => void) => K.push({ t, apply });

  // ── SCENE 1: INTRO ──
  k(0, ctx => { ctx.q("shell").classList.add("vis"); });
  k(0.8, ctx => { ctx.q("cur").classList.add("vis"); ctx.cursorTo("pageTitle"); });
  k(1.2, ctx => { ctx.q("insp").classList.add("vis"); });
  k(1.8, ctx => { ctx.q("kpis").classList.add("vis"); });
  k(2.2, ctx => { ctx.q("tabs").classList.add("vis"); });
  k(2.6, ctx => { ctx.q("table").classList.add("vis"); });

  // ── SCENE 2: CREATE ORDER ──
  k(3.5, ctx => { ctx.cursorTo("addBtn"); });
  k(4.0, ctx => { ctx.clickAt(); ctx.q("modal").classList.add("open"); });
  k(4.8, ctx => { ctx.cursorTo("fTitre"); });
  k(5.0, ctx => { ctx.clickAt(); ctx.q("fTitre").classList.add("ed"); ctx.q("fTitre").textContent = "Refonte identité visuelle"; ctx.q("fTitre").classList.remove("ed"); });
  k(5.4, ctx => { ctx.cursorTo("fClient"); });
  k(5.6, ctx => { ctx.clickAt(); ctx.q("fClient").classList.add("ed"); ctx.q("fClient").textContent = "Emma Rousseau"; ctx.q("fClient").classList.remove("ed"); });
  k(6.0, ctx => { ctx.cursorTo("fMontant"); });
  k(6.2, ctx => { ctx.clickAt(); ctx.q("fMontant").classList.add("ed"); ctx.q("fMontant").textContent = "2 500 €"; ctx.q("fMontant").classList.remove("ed"); });
  k(6.6, ctx => { ctx.cursorTo("fDeadline"); });
  k(6.8, ctx => { ctx.clickAt(); ctx.q("fDeadline").classList.add("ed"); ctx.q("fDeadline").textContent = "31 mars 2026"; ctx.q("fDeadline").classList.remove("ed"); });
  k(7.3, ctx => { ctx.cursorTo("modalSubmit"); });
  k(7.7, ctx => {
    ctx.clickAt(); ctx.q("modal").classList.remove("open");
    const row = document.createElement("div");
    row.className = "o-row entering"; row.setAttribute("data-el", "rowNew");
    row.innerHTML = '<div class="o-cell o-cname">Refonte identité visuelle</div><div class="o-cell o-cclient">Emma Rousseau</div><div class="o-cell o-camount">2 500 €</div><div class="o-cell"><span class="o-badge o-b-todo">À faire</span></div><div class="o-cell o-cdate">31 mars</div>';
    ctx.q("tbody").prepend(row);
    // Update tab count
    const todoCount = ctx.q("tabTodoCount");
    if (todoCount) todoCount.textContent = "3";
  });
  k(8.5, ctx => {
    // Update KPI
    ctx.q("kpiTotal").textContent = "15 350 €";
  });

  // ── SCENE 3: STATUS FLOW ──
  // Advance "Branding complet" from À faire → En cours
  k(9.5, ctx => { ctx.cursorTo("row2"); });
  k(10.0, ctx => {
    ctx.clickAt();
    const badge = ctx.q("row2").querySelector(".o-badge") as HTMLElement;
    if (badge) { badge.className = "o-badge o-b-progress"; badge.textContent = "En cours"; }
    const todoCount = ctx.q("tabTodoCount");
    if (todoCount) todoCount.textContent = "2";
    const progressCount = ctx.q("tabProgressCount");
    if (progressCount) progressCount.textContent = "3";
  });
  // Advance "Montage vidéo promo" from En cours → Livré
  k(11.5, ctx => { ctx.cursorTo("row1"); });
  k(12.0, ctx => {
    ctx.clickAt();
    const badge = ctx.q("row1").querySelector(".o-badge") as HTMLElement;
    if (badge) { badge.className = "o-badge o-b-done"; badge.textContent = "Livré"; }
    const progressCount = ctx.q("tabProgressCount");
    if (progressCount) progressCount.textContent = "2";
    const doneCount = ctx.q("tabDoneCount");
    if (doneCount) doneCount.textContent = "2";
  });
  k(13.0, ctx => {
    ctx.q("kpiProgress").textContent = "5 700 €";
    ctx.q("kpiReady").textContent = "6 300 €";
  });

  // ── SCENE 4: DETAIL PANEL ──
  k(14.5, ctx => { ctx.cursorTo("row1"); });
  k(15.0, ctx => {
    ctx.clickAt();
    ctx.q("inspDefault").style.display = "none";
    ctx.q("inspDetail").classList.add("vis");
  });
  k(15.6, ctx => { ctx.q("detailHead").classList.add("vis"); });
  k(16.2, ctx => { ctx.q("detailFields").classList.add("vis"); });
  k(16.8, ctx => { ctx.q("detailChecklist").classList.add("vis"); });
  k(17.4, ctx => { ctx.q("detailNotes").classList.add("vis"); });
  // Add a note
  k(18.0, ctx => { ctx.cursorTo("noteInput"); });
  k(18.3, ctx => {
    ctx.clickAt();
    ctx.q("noteInput").classList.add("ed");
    ctx.q("noteInput").textContent = "Fichiers livrés au client ✓";
    ctx.q("noteInput").classList.remove("ed");
  });
  k(19.0, ctx => { ctx.cursorTo("noteBtn"); });
  k(19.3, ctx => {
    ctx.clickAt();
    const note = document.createElement("div");
    note.className = "o-note entering";
    note.innerHTML = '<span class="o-note-time">À l\'instant</span><span class="o-note-text">Fichiers livrés au client ✓</span>';
    ctx.q("noteList").prepend(note);
    ctx.q("noteInput").textContent = "";
  });

  // ── SCENE 5: DELIVERY ──
  k(20.0, ctx => {
    ctx.q("inspDetail").classList.remove("vis");
    ctx.q("inspDefault").style.display = "";
    ctx.cursorTo("row5");
  });
  k(20.5, ctx => {
    ctx.clickAt();
    ctx.q("inspDefault").style.display = "none";
    ctx.q("inspDelivery").classList.add("vis");
  });
  k(21.0, ctx => { ctx.q("delivHead").classList.add("vis"); });
  k(21.5, ctx => { ctx.q("delivChecks").classList.add("vis"); });
  // Check a deliverable
  k(22.0, ctx => { ctx.cursorTo("checkItem1"); });
  k(22.4, ctx => {
    ctx.clickAt();
    ctx.q("checkItem1").classList.add("checked");
  });
  k(23.0, ctx => { ctx.cursorTo("checkItem2"); });
  k(23.4, ctx => {
    ctx.clickAt();
    ctx.q("checkItem2").classList.add("checked");
  });
  // Mark as Livré
  k(24.0, ctx => { ctx.cursorTo("delivBtn"); });
  k(24.4, ctx => {
    ctx.clickAt();
    ctx.q("delivBtn").classList.add("ok");
    ctx.q("delivLabel").textContent = "✓ Marquée livrée";
    const badge = ctx.q("row5").querySelector(".o-badge") as HTMLElement;
    if (badge) { badge.className = "o-badge o-b-done"; badge.textContent = "Livré"; }
    ctx.q("kpiReady").textContent = "9 500 €";
  });

  // ── SCENE 6: OUTRO ──
  k(26.0, ctx => { ctx.q("overlay").classList.add("vis"); });
  k(31.0, ctx => { ctx.q("cur").classList.remove("vis"); });

  return K.sort((a, b) => a.t - b.t);
}

/* ═══════════════════════════════════════════════════════════
   REACT COMPONENT — identical engine
   ═══════════════════════════════════════════════════════════ */

export default function CommandesDemoPlayer({ label = "Voir les commandes en action", accentColor = "#F59E0B" }: Props) {
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
      cursorTo(dataEl, ox = 0, oy = 0) {
        const t = q(dataEl), c = q("cur"); if (!t||!c||!shell) return;
        void shell.offsetHeight; const sr = shell.getBoundingClientRect(), tr = t.getBoundingClientRect();
        let x: number, y: number;
        if (tr.width > 0 && sr.width > 0) { x = tr.left-sr.left+tr.width/2+ox; y = tr.top-sr.top+tr.height/2+oy; }
        else { let el: HTMLElement|null = t; x = t.offsetWidth/2+ox; y = t.offsetHeight/2+oy; while (el && el !== shell) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent as HTMLElement|null; } }
        c.style.transition = "left 0.4s cubic-bezier(0.22,1,0.36,1), top 0.4s cubic-bezier(0.22,1,0.36,1)";
        c.style.left = x+"px"; c.style.top = y+"px";
      },
      clickAt() { const c = q("cur"), k = q("clk"); if (!c||!k) return; k.style.left = c.style.left; k.style.top = c.style.top; k.classList.remove("pop"); void k.offsetWidth; k.classList.add("pop"); },
    };
  }, []);

  const SNAP = [3.5, 9.5, 14.5, 20.0, 26.0];
  const seekTo = useCallback((t: number) => { const root = containerRef.current; if (!root) return; const sn = [...snapshotsRef.current.keys()].sort((a,b)=>a-b); let rf = -1; for (const st of sn) { if (st<=t) rf=st; else break; } if (rf>=0&&snapshotsRef.current.has(rf)) { const d = root.querySelector(".o-root"); if (d) d.innerHTML = snapshotsRef.current.get(rf)!; } else { root.innerHTML = initialHtmlRef.current; rf = -1; } void root.offsetHeight; const ctx = makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=rf) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current = t; setCurrentTime(t); }, [makeCtx]);
  const initialize = useCallback(() => { const root = containerRef.current; if (!root) return; root.innerHTML = HTML; initialHtmlRef.current = HTML; timelineRef.current = buildTimeline(); snapshotsRef.current.clear(); lastAppliedRef.current = -1; void root.offsetHeight; const ctx = makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>0) break; try{kf.apply(ctx);}catch{} } const d = root.querySelector(".o-root"); if (d) snapshotsRef.current.set(0, d.innerHTML); }, [makeCtx]);
  const togglePlay = useCallback(() => { if (isPlaying) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; setIsPlaying(false); return; } let t = currentTime>=TOTAL_DURATION-0.5?0:currentTime; if (t===0) seekTo(0); setIsPlaying(true); const TK=100; timerRef.current = setInterval(()=>{ t+=TK/1000; if (t>=TOTAL_DURATION) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current=null; setIsPlaying(false); setCurrentTime(TOTAL_DURATION); return; } const root=containerRef.current; if (!root) return; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=lastAppliedRef.current) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} const d=root.querySelector(".o-root"); if (d&&SNAP.includes(kf.t)) snapshotsRef.current.set(kf.t,d.innerHTML); } lastAppliedRef.current=t; setCurrentTime(t); }, TK); }, [isPlaying, currentTime, seekTo, makeCtx, SNAP]);
  const handleStart = useCallback(() => { setStarted(true); setShowControls(true); setTimeout(()=>{ initialize(); setTimeout(()=>{ seekTo(0); setCurrentTime(0); setIsPlaying(true); }, 200); }, 100); }, [initialize, seekTo]);
  useEffect(() => { if (!started||!isPlaying||timerRef.current) return; let t=currentTime; const TK=100; timerRef.current=setInterval(()=>{ t+=TK/1000; if (t>=TOTAL_DURATION) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current=null; setIsPlaying(false); setCurrentTime(TOTAL_DURATION); return; } const root=containerRef.current; if (!root) return; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=lastAppliedRef.current) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} const d=root.querySelector(".o-root"); if (d&&SNAP.includes(kf.t)) snapshotsRef.current.set(kf.t,d.innerHTML); } lastAppliedRef.current=t; setCurrentTime(t); }, TK); return ()=>{ if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, isPlaying]);
  useEffect(()=>()=>{ if (timerRef.current) clearInterval(timerRef.current); }, []);
  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => { const r=e.currentTarget.getBoundingClientRect(); const t=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*TOTAL_DURATION; if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } setIsPlaying(false); const root=containerRef.current; if (!root) return; root.innerHTML=initialHtmlRef.current; snapshotsRef.current.clear(); lastAppliedRef.current=-1; void root.offsetHeight; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current=t; const d=root.querySelector(".o-root"); if (d) snapshotsRef.current.set(0,d.innerHTML); setCurrentTime(t); }, [makeCtx]);
  const skip = useCallback((d: number) => { const t=Math.max(0,Math.min(TOTAL_DURATION,currentTime+d)); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } setIsPlaying(false); const root=containerRef.current; if (!root) return; root.innerHTML=initialHtmlRef.current; lastAppliedRef.current=-1; void root.offsetHeight; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current=t; setCurrentTime(t); }, [currentTime, makeCtx]);
  const fmt = (s: number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;
  const scenes = [{t:0,label:"Intro"},{t:3.5,label:"Créer"},{t:9.5,label:"Statuts"},{t:14.5,label:"Détail"},{t:20,label:"Livraison"},{t:26,label:"Résultat"}];
  const cur = [...scenes].reverse().find(s=>currentTime>=s.t)?.label??"Intro";

  return (
    <motion.div className="relative w-full max-w-[1100px] mx-auto rounded-2xl overflow-hidden" style={{ aspectRatio:"16/9", background:started?"#0F0E17":`linear-gradient(135deg,${accentColor}08,${accentColor}15)`, border:"1px solid #E5E7EB", boxShadow:"0 20px 60px rgba(124,58,237,0.12),0 4px 16px rgba(0,0,0,0.04)" }} initial={{opacity:0,y:28,scale:0.98}} whileInView={{opacity:1,y:0,scale:1}} viewport={{once:true}} transition={{duration:0.8,ease}} onMouseEnter={()=>started&&setShowControls(true)} onMouseLeave={()=>started&&setShowControls(false)}>
      <AnimatePresence>
        {!started && (
          <motion.div className="absolute inset-0 z-10 cursor-pointer group" onClick={handleStart} exit={{opacity:0}} transition={{duration:0.4}}>
            <div className="absolute inset-0 overflow-hidden" style={{filter:"blur(2px)",transform:"scale(1.02)"}}>
              <div style={{width:"100%",height:"100%",background:"#F8F7FC",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif",fontSize:"9px",display:"flex",flexDirection:"column" as const}}>
                <div style={{height:"5%",background:"#FAFAFE",borderBottom:"1px solid #E8E5F0",display:"flex",alignItems:"center",padding:"0 10px",gap:"4px"}}><div style={{width:7,height:7,borderRadius:"50%",background:"#FF6159"}} /><div style={{width:7,height:7,borderRadius:"50%",background:"#FFBF2F"}} /><div style={{width:7,height:7,borderRadius:"50%",background:"#2ACB42"}} /><div style={{marginLeft:8,flex:1,height:14,background:"#F3F2F8",borderRadius:3}} /></div>
                <div style={{flex:1,display:"flex"}}>
                  <div style={{width:"14%",background:"#FFF",borderRight:"1px solid #E8E5F0",padding:6}}><div style={{fontSize:10,fontWeight:800,background:"linear-gradient(135deg,#7C5CFF,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:10}}>Jestly</div>{["Dashboard","Clients","Commandes","Facturation"].map((l,i)=>(<div key={l} style={{padding:"3px 5px",borderRadius:3,fontSize:7,marginBottom:2,background:i===2?"#EDE9FE":"transparent",color:i===2?"#7C5CFF":"#6B7280",fontWeight:i===2?600:400}}>{l}</div>))}</div>
                  <div style={{flex:1,background:"#F1EFF7",padding:8}}><div style={{display:"flex",gap:4,marginBottom:6}}>{["CA total","En cours","Prêtes"].map(l=>(<div key={l} style={{flex:1,background:"#FFF",border:"1px solid #E8E5F0",borderRadius:5,padding:4}}><div style={{fontSize:5,color:"#9CA3AF"}}>{l}</div><div style={{width:"50%",height:4,background:"#F0EDF7",borderRadius:2,marginTop:2}} /></div>))}</div><div style={{background:"#FFF",border:"1px solid #E8E5F0",borderRadius:7,padding:5}}>{[0,1,2].map(i=>(<div key={i} style={{display:"flex",gap:4,padding:"3px 0",borderBottom:"1px solid #F0EDF7"}}><div style={{width:"30%",height:3,background:"#F0EDF7",borderRadius:2}} /><div style={{width:"20%",height:3,background:"#F5F3FA",borderRadius:2}} /><div style={{width:20,height:8,background:i===0?"rgba(124,92,255,0.08)":"#F5F3FA",borderRadius:3}} /><div style={{width:"15%",height:3,background:"#F0EDF7",borderRadius:2,marginLeft:"auto"}} /></div>))}</div></div>
                  <div style={{width:"16%",background:"#FFF",borderLeft:"1px solid #E8E5F0",padding:5}}><div style={{fontSize:6,fontWeight:600,color:"#9CA3AF",marginBottom:4}}>Détail</div>{[0,1,2].map(i=>(<div key={i} style={{marginBottom:4}}><div style={{width:"40%",height:3,background:"#F0EDF7",borderRadius:2,marginBottom:2}} /><div style={{height:10,background:"#FAFAFE",border:"1px solid #E8E5F0",borderRadius:3}} /></div>))}</div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0" style={{background:"rgba(15,14,23,0.35)"}} />
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage:"linear-gradient(rgba(124,92,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(124,92,255,1) 1px,transparent 1px)",backgroundSize:"40px 40px"}} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl" style={{background:`linear-gradient(135deg,${accentColor},${accentColor}CC)`,boxShadow:`0 12px 40px ${accentColor}40`}}><svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1"><path d="M8 5v14l11-7z"/></svg></div>
              <span className="text-[12px] sm:text-[13px] font-medium text-white/70">{label}</span>
              <span className="text-[10px] text-white/40">0:32</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={containerRef} className="w-full h-full" />
      {started && (
        <div className="absolute bottom-0 left-0 right-0 z-40 transition-opacity duration-300" style={{opacity:showControls?1:0}}>
          <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(transparent,rgba(0,0,0,0.7))"}} />
          <div className="relative px-4 pb-3 pt-8">
            <div className="w-full h-[6px] rounded-full cursor-pointer mb-3 group/bar relative" style={{background:"rgba(255,255,255,0.2)"}} onClick={handleScrub}>{scenes.map(s=>(<div key={s.t} className="absolute top-0 w-[2px] h-full rounded-full" style={{left:`${(s.t/TOTAL_DURATION)*100}%`,background:"rgba(255,255,255,0.25)"}} />))}<div className="h-full rounded-full transition-[width] duration-100" style={{width:`${(currentTime/TOTAL_DURATION)*100}%`,background:"linear-gradient(90deg,#7C5CFF,#A78BFA)"}} /><div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md transition-[left] duration-100 opacity-0 group-hover/bar:opacity-100" style={{left:`${(currentTime/TOTAL_DURATION)*100}%`,transform:"translate(-50%,-50%)"}} /></div>
            <div className="flex items-center gap-3">
              <button onClick={()=>skip(-5)} className="text-white/70 hover:text-white transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/><text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7" fontWeight="700">5</text></svg></button>
              <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">{isPlaying?<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>:<svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="ml-0.5"><path d="M8 5v14l11-7z"/></svg>}</button>
              <button onClick={()=>skip(5)} className="text-white/70 hover:text-white transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/><text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7" fontWeight="700">5</text></svg></button>
              <span className="text-[11px] text-white/60 font-mono tabular-nums ml-1">{fmt(currentTime)} / {fmt(TOTAL_DURATION)}</span>
              <span className="ml-auto text-[10px] text-white/40 font-medium">{cur}</span>
              <button onClick={()=>{seekTo(0);setIsPlaying(false);}} className="text-white/50 hover:text-white transition-colors ml-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg></button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMMANDES DEMO HTML
   DA tokens: Shell #F8F7FC, Canvas #F1EFF7, Border #E8E5F0,
   Sidebar 170px, Inspector 190px, Toolbar 34px, Accent #7C5CFF
   Mirrors real commandes/page.tsx layout:
   - 3 KPI cards (CA total, En cours, Prêtes)
   - Tabs: À faire | En cours | Livré | Payé | Tous
   - Table: Titre, Client, Prix, Statut, Deadline
   - Status badges: À faire (rose), En cours (blue), Livré (emerald), Payé (amber)
   ═══════════════════════════════════════════════════════════ */

const HTML = `
<style>
  .o-root{width:100%;height:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;background:#0F0E17;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
  .o-root *,.o-root *::before,.o-root *::after{margin:0;padding:0;box-sizing:border-box}
  .o-shell{width:100%;height:100%;background:#F8F7FC;overflow:hidden;position:relative;opacity:0;transform:scale(0.96);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1),opacity 0.4s ease}
  .o-shell.vis{opacity:1;transform:scale(1)}
  .o-bar{height:28px;background:#FAFAFE;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;padding:0 10px;gap:6px}
  .o-bardot{width:8px;height:8px;border-radius:50%}
  .o-barurl{flex:1;margin-left:8px;height:17px;background:#F3F2F8;border-radius:4px;display:flex;align-items:center;padding:0 8px;font-size:9px;color:#9CA3AF}
  .o-builder{display:flex;height:calc(100% - 28px);position:relative}
  .o-toolbar{position:absolute;top:0;left:0;right:0;height:34px;background:#FFF;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;justify-content:space-between;padding:0 12px;z-index:20}
  .o-logo{font-size:11px;font-weight:800;background:linear-gradient(135deg,#7C5CFF,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .o-divider{width:1px;height:16px;background:#E8E5F0;margin:0 8px}
  .o-pagename{font-size:9px;color:#6B7280;padding:2px 7px;background:#F5F3FA;border-radius:4px}
  .o-tbl{display:flex;align-items:center;gap:6px}
  .o-addbtn{padding:4px 12px;background:#7C5CFF;color:#fff;border:none;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer}
  .o-side{width:170px;background:#FFF;border-right:1px solid #E8E5F0;margin-top:34px;overflow:hidden;padding:8px}
  .o-stitle{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#9CA3AF;margin-bottom:6px;margin-top:6px}
  .o-sitem{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:4px;font-size:10px;color:#1A1A2E}
  .o-sitem.act{background:#EDE9FE;color:#7C5CFF;font-weight:600}
  .o-sicon{width:14px;height:14px;border-radius:3px;background:#F0EDF7;display:flex;align-items:center;justify-content:center;font-size:7px;color:#9CA3AF}
  .o-sitem.act .o-sicon{background:rgba(124,92,255,0.15);color:#7C5CFF}
  .o-canvas{flex:1;margin-top:34px;background:#F1EFF7;overflow:hidden;padding:10px;display:flex;flex-direction:column;gap:8px}

  /* KPIs — 3-card pipeline summary */
  .o-kpis{display:flex;gap:5px;opacity:0;transform:translateY(6px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .o-kpis.vis{opacity:1;transform:translateY(0)}
  .o-kpi{flex:1;padding:6px 8px;background:#FFF;border:1px solid #E8E5F0;border-radius:7px}
  .o-kpi-label{font-size:6px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px}
  .o-kpi-val{font-size:10px;font-weight:700;color:#1A1A2E}
  .o-kpi-sub{font-size:5.5px;color:#9CA3AF;margin-top:1px}

  /* Tabs bar */
  .o-tabsbar{display:flex;gap:2px;background:#FFF;border:1px solid #E8E5F0;border-radius:7px;padding:3px 5px;opacity:0;transform:translateY(4px);transition:all 0.3s cubic-bezier(0.22,1,0.36,1)}
  .o-tabsbar.vis{opacity:1;transform:translateY(0)}
  .o-tabitem{padding:3px 8px;border-radius:4px;font-size:7px;font-weight:500;color:#6B7280;cursor:pointer;display:flex;align-items:center;gap:3px}
  .o-tabitem.act{background:#EDE9FE;color:#7C5CFF;font-weight:600}
  .o-tabcount{font-size:6px;background:#F0EDF7;color:#9CA3AF;padding:1px 4px;border-radius:3px;font-weight:600}
  .o-tabitem.act .o-tabcount{background:rgba(124,92,255,0.15);color:#7C5CFF}

  /* Table */
  .o-table{background:#FFF;border:1px solid #E8E5F0;border-radius:7px;flex:1;display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(8px);transition:all 0.5s cubic-bezier(0.22,1,0.36,1)}
  .o-table.vis{opacity:1;transform:translateY(0)}
  .o-thead{display:flex;padding:5px 8px;border-bottom:1px solid #E8E5F0;background:#FAFAFE}
  .o-th{font-size:6px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px}
  .o-tbody{flex:1;overflow:hidden}
  .o-row{display:flex;align-items:center;padding:5px 8px;border-bottom:1px solid #F0EDF7;transition:all 0.3s}
  .o-row:hover{background:#FAFAFF}
  .o-row.entering{animation:o-fadeIn 0.4s cubic-bezier(0.22,1,0.36,1)}
  @keyframes o-fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .o-cell{font-size:8px;color:#1A1A2E}
  .o-cname{flex:2;font-weight:600}
  .o-cclient{flex:1.5;color:#6B7280}
  .o-camount{flex:1;font-weight:700;font-variant-numeric:tabular-nums}
  .o-cdate{flex:1;color:#9CA3AF;text-align:right;font-size:7px}

  /* Badges — order statuses */
  .o-badge{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:4px;font-size:6px;font-weight:600;border:1px solid}
  .o-badge::before{content:'';width:4px;height:4px;border-radius:50%}
  .o-b-todo{background:#FFF1F2;color:#E11D48;border-color:#FECDD3}.o-b-todo::before{background:#FB7185}
  .o-b-progress{background:#EFF6FF;color:#2563EB;border-color:#BFDBFE}.o-b-progress::before{background:#60A5FA}
  .o-b-done{background:#ECFDF5;color:#059669;border-color:#A7F3D0}.o-b-done::before{background:#34D399}
  .o-b-paid{background:#FFFBEB;color:#D97706;border-color:#FDE68A}.o-b-paid::before{background:#FBBF24}

  /* Inspector 190px */
  .o-insp{width:190px;background:#FFF;border-left:1px solid #E8E5F0;margin-top:34px;overflow-y:auto;opacity:0;transform:translateX(8px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .o-insp.vis{opacity:1;transform:translateX(0)}
  .o-itabs{display:flex;border-bottom:1px solid #E8E5F0}
  .o-itab{flex:1;padding:7px 5px;font-size:8px;font-weight:600;text-align:center;color:#9CA3AF;border-bottom:2px solid transparent;cursor:pointer}
  .o-itab.act{color:#7C5CFF;border-bottom-color:#7C5CFF}
  .o-icont{padding:8px}
  .o-fl{font-size:7px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px}
  .o-fi{width:100%;padding:4px 6px;border:1px solid #E8E5F0;border-radius:4px;font-size:9px;color:#1A1A2E;background:#FAFAFE;transition:border-color 0.2s;min-height:20px}
  .o-fi.ed{border-color:#7C5CFF;box-shadow:0 0 0 2px rgba(124,92,255,0.1)}
  .o-irow{display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #F0EDF7}
  .o-irowl{font-size:7px;color:#9CA3AF}
  .o-irowv{font-size:8px;font-weight:600;color:#1A1A2E}

  /* Inspector panels */
  .o-ipanel{display:none;padding:8px}
  .o-ipanel.vis{display:block}
  .o-dsec{opacity:0;transform:translateY(6px);transition:all 0.35s cubic-bezier(0.22,1,0.36,1);margin-bottom:8px}
  .o-dsec.vis{opacity:1;transform:translateY(0)}
  .o-dh{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .o-davatar{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;background:#7C5CFF}
  .o-dname{font-size:11px;font-weight:700;color:#1A1A2E}
  .o-demail{font-size:7px;color:#9CA3AF}
  .o-dbadge{display:inline-block;font-size:6px;font-weight:600;padding:2px 7px;border-radius:12px;margin-top:2px}

  /* Checklist items */
  .o-checklist{display:flex;flex-direction:column;gap:3px}
  .o-checkitem{display:flex;align-items:center;gap:5px;padding:3px 5px;border:1px solid #E8E5F0;border-radius:4px;font-size:7px;color:#1A1A2E;cursor:pointer;transition:all 0.3s}
  .o-checkbox{width:10px;height:10px;border:1.5px solid #D1D5DB;border-radius:2px;display:flex;align-items:center;justify-content:center;transition:all 0.3s;flex-shrink:0}
  .o-checkitem.checked .o-checkbox{background:#10B981;border-color:#10B981}
  .o-checkitem.checked .o-checkbox::after{content:'✓';font-size:6px;color:#fff;font-weight:700}
  .o-checkitem.checked{color:#9CA3AF;text-decoration:line-through}

  /* Notes */
  .o-notelist{display:flex;flex-direction:column;gap:3px}
  .o-note{padding:4px 6px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:4px;font-size:7px;color:#6B7280;line-height:1.4}
  .o-note.entering{animation:o-fadeIn 0.4s cubic-bezier(0.22,1,0.36,1)}
  .o-note-time{font-size:5.5px;color:#9CA3AF;display:block;margin-bottom:1px}
  .o-note-text{color:#1A1A2E}
  .o-noteinput{width:100%;padding:4px 6px;border:1px solid #E8E5F0;border-radius:4px;font-size:7px;color:#1A1A2E;background:#FAFAFE;transition:border-color 0.2s;min-height:18px;margin-bottom:3px}
  .o-noteinput.ed{border-color:#7C5CFF;box-shadow:0 0 0 2px rgba(124,92,255,0.1)}
  .o-notebtn{width:100%;padding:4px;background:#7C5CFF;color:#fff;border:none;border-radius:4px;font-size:7px;font-weight:600;cursor:pointer;transition:all 0.3s}

  /* Delivery button */
  .o-delivbtn{width:100%;padding:6px;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;transition:all 0.4s;background:#10B981;color:#fff}
  .o-delivbtn.ok{background:#059669}

  /* Modal */
  .o-modalbg{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.85);backdrop-filter:blur(4px);z-index:40;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s}
  .o-modalbg.open{opacity:1;pointer-events:all}
  .o-modal{width:260px;background:#FFF;border-radius:8px;padding:14px;box-shadow:0 12px 40px rgba(0,0,0,0.1);border:1px solid #E8E5F0;transform:translateY(8px) scale(0.97);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1)}
  .o-modalbg.open .o-modal{transform:translateY(0) scale(1)}
  .o-mt{font-size:11px;font-weight:700;color:#1A1A2E;margin-bottom:2px}
  .o-ms{font-size:8px;color:#9CA3AF;margin-bottom:8px}
  .o-fg{margin-bottom:6px}
  .o-mbtn{width:100%;padding:5px;background:#7C5CFF;color:#fff;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;margin-top:4px}

  /* Overlay */
  .o-overlay{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.95);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:50;opacity:0;pointer-events:none;transition:opacity 0.5s}
  .o-overlay.vis{opacity:1;pointer-events:all}
  .o-okicon{width:42px;height:42px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center;margin-bottom:12px;transform:scale(0);transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1)}
  .o-overlay.vis .o-okicon{transform:scale(1)}
  .o-okt{font-size:16px;font-weight:700;color:#1A1A2E;margin-bottom:4px}
  .o-oku{font-size:10px;color:#7C5CFF;background:#EDE9FE;padding:4px 12px;border-radius:14px;font-weight:500}

  /* Cursor */
  .o-cur{position:absolute;width:14px;height:17px;z-index:100;pointer-events:none;opacity:0;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.2));transition:opacity 0.3s}
  .o-cur.vis{opacity:1}
  .o-click{position:absolute;width:18px;height:18px;border-radius:50%;background:rgba(124,92,255,0.3);transform:translate(-2px,-1px) scale(0);pointer-events:none;z-index:99}
  .o-click.pop{animation:o-pop 0.35s ease-out forwards}
  @keyframes o-pop{0%{transform:translate(-2px,-1px) scale(0);opacity:1}100%{transform:translate(-2px,-1px) scale(2);opacity:0}}
</style>

<div class="o-root">
<div class="o-shell" data-el="shell">
  <div class="o-bar"><div class="o-bardot" style="background:#FF6159"></div><div class="o-bardot" style="background:#FFBF2F"></div><div class="o-bardot" style="background:#2ACB42"></div><div class="o-barurl"><span style="margin-right:3px">🔒</span>app.jestly.fr/commandes</div></div>
  <div class="o-builder">
    <div class="o-toolbar">
      <div class="o-tbl"><span class="o-logo">Jestly</span><div class="o-divider"></div><span class="o-pagename" data-el="pageTitle">Commandes</span></div>
      <div class="o-tbl"><button class="o-addbtn" data-el="addBtn">+ Nouvelle commande</button></div>
    </div>
    <div class="o-side">
      <div class="o-stitle">Navigation</div>
      <div class="o-sitem"><div class="o-sicon">⌂</div>Dashboard</div>
      <div class="o-sitem"><div class="o-sicon">♦</div>Clients</div>
      <div class="o-sitem act"><div class="o-sicon">☰</div>Commandes</div>
      <div class="o-sitem"><div class="o-sicon">✎</div>Facturation</div>
      <div class="o-sitem"><div class="o-sicon">◆</div>Analytics</div>
    </div>
    <div class="o-canvas">
      <!-- KPIs (3 pipeline summary cards) -->
      <div class="o-kpis" data-el="kpis">
        <div class="o-kpi"><div class="o-kpi-label">CA total</div><div class="o-kpi-val" data-el="kpiTotal">12 850 €</div><div class="o-kpi-sub">34 commandes</div></div>
        <div class="o-kpi"><div class="o-kpi-label">En cours</div><div class="o-kpi-val" data-el="kpiProgress">7 700 €</div><div class="o-kpi-sub">8 en production</div></div>
        <div class="o-kpi" style="background:#FAFAFF;border-color:#E8E5F5"><div class="o-kpi-label" style="color:#7C5CFF">Prêtes</div><div class="o-kpi-val" style="color:#6D28D9" data-el="kpiReady">5 150 €</div><div class="o-kpi-sub">6 à livrer</div></div>
      </div>
      <!-- Tabs bar -->
      <div class="o-tabsbar" data-el="tabs">
        <div class="o-tabitem act">À faire <span class="o-tabcount" data-el="tabTodoCount">2</span></div>
        <div class="o-tabitem">En cours <span class="o-tabcount" data-el="tabProgressCount">2</span></div>
        <div class="o-tabitem">Livré <span class="o-tabcount" data-el="tabDoneCount">1</span></div>
        <div class="o-tabitem">Payé <span class="o-tabcount">1</span></div>
        <div class="o-tabitem">Tous <span class="o-tabcount">6</span></div>
      </div>
      <!-- Table -->
      <div class="o-table" data-el="table">
        <div class="o-thead">
          <div class="o-th" style="flex:2">Titre</div>
          <div class="o-th" style="flex:1.5">Client</div>
          <div class="o-th" style="flex:1">Prix</div>
          <div class="o-th" style="flex:1">Statut</div>
          <div class="o-th" style="flex:1;text-align:right">Deadline</div>
        </div>
        <div class="o-tbody" data-el="tbody">
          <div class="o-row" data-el="row1"><div class="o-cell o-cname">Montage vidéo promo</div><div class="o-cell o-cclient">Thomas Durand</div><div class="o-cell o-camount">4 500 €</div><div class="o-cell"><span class="o-badge o-b-progress">En cours</span></div><div class="o-cell o-cdate">22 mars</div></div>
          <div class="o-row" data-el="row2"><div class="o-cell o-cname">Branding complet</div><div class="o-cell o-cclient">Claire Dupont</div><div class="o-cell o-camount">3 800 €</div><div class="o-cell"><span class="o-badge o-b-todo">À faire</span></div><div class="o-cell o-cdate">28 mars</div></div>
          <div class="o-row" data-el="row3"><div class="o-cell o-cname">Logo + charte</div><div class="o-cell o-cclient">Amélie Leroy</div><div class="o-cell o-camount">1 800 €</div><div class="o-cell"><span class="o-badge o-b-done">Livré</span></div><div class="o-cell o-cdate">15 mars</div></div>
          <div class="o-row" data-el="row4"><div class="o-cell o-cname">Motion design pack</div><div class="o-cell o-cclient">Marc Laurent</div><div class="o-cell o-camount">2 400 €</div><div class="o-cell"><span class="o-badge o-b-paid">Payé</span></div><div class="o-cell o-cdate">10 mars</div></div>
          <div class="o-row" data-el="row5"><div class="o-cell o-cname">Site vitrine</div><div class="o-cell o-cclient">Julien Petit</div><div class="o-cell o-camount">3 200 €</div><div class="o-cell"><span class="o-badge o-b-progress">En cours</span></div><div class="o-cell o-cdate">25 mars</div></div>
          <div class="o-row" data-el="row6"><div class="o-cell o-cname">Illustrations x6</div><div class="o-cell o-cclient">Sophie Bernard</div><div class="o-cell o-camount">950 €</div><div class="o-cell"><span class="o-badge o-b-todo">À faire</span></div><div class="o-cell o-cdate">—</div></div>
        </div>
      </div>
    </div>

    <!-- Inspector 190px -->
    <div class="o-insp" data-el="insp">
      <div class="o-itabs"><div class="o-itab act" data-el="tabApercu">Aperçu</div><div class="o-itab" data-el="tabDetail">Détail</div></div>
      <!-- Default -->
      <div class="o-icont" data-el="inspDefault">
        <div class="o-fl" style="margin-bottom:6px">Résumé du mois</div>
        <div style="margin-bottom:8px">
          <div class="o-irow"><span class="o-irowl">Commandes</span><span class="o-irowv">34</span></div>
          <div class="o-irow"><span class="o-irowl">CA total</span><span class="o-irowv">12 850 €</span></div>
          <div class="o-irow"><span class="o-irowl">En cours</span><span class="o-irowv">7 700 €</span></div>
          <div class="o-irow"><span class="o-irowl">Prêtes</span><span class="o-irowv">5 150 €</span></div>
        </div>
        <div class="o-fl" style="margin-bottom:6px">Dernière activité</div>
        <div style="padding:5px 6px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:4px;font-size:8px;color:#6B7280;line-height:1.4">Commande #034 livrée à Amélie L.</div>
      </div>
      <!-- Detail panel (Scene 4) -->
      <div class="o-ipanel" data-el="inspDetail">
        <div class="o-dsec" data-el="detailHead">
          <div class="o-dh"><div class="o-davatar">TD</div><div><div class="o-dname">Thomas Durand</div><div class="o-demail">Montage vidéo promo</div><div class="o-dbadge" style="background:#EFF6FF;color:#2563EB">En cours</div></div></div>
        </div>
        <div class="o-dsec" data-el="detailFields">
          <div class="o-fl">Montant</div>
          <div style="font-size:16px;font-weight:800;color:#1A1A2E;margin-bottom:6px">4 500 €</div>
          <div class="o-fl">Deadline</div>
          <div style="font-size:9px;color:#6B7280;margin-bottom:6px">22 mars 2026</div>
          <div class="o-fl">Catégorie</div>
          <div style="font-size:9px;color:#6B7280;margin-bottom:8px">Vidéo</div>
        </div>
        <div class="o-dsec" data-el="detailChecklist">
          <div class="o-fl">Livrables</div>
          <div class="o-checklist">
            <div class="o-checkitem checked"><div class="o-checkbox"></div>Script validé</div>
            <div class="o-checkitem checked"><div class="o-checkbox"></div>Rushes montés</div>
            <div class="o-checkitem"><div class="o-checkbox"></div>Export final</div>
          </div>
        </div>
        <div class="o-dsec" data-el="detailNotes">
          <div class="o-fl">Notes</div>
          <div class="o-notelist" data-el="noteList">
            <div class="o-note"><span class="o-note-time">18 mars</span><span class="o-note-text">Retour client positif sur le pré-montage</span></div>
          </div>
          <div style="margin-top:4px">
            <div class="o-noteinput" data-el="noteInput"></div>
            <button class="o-notebtn" data-el="noteBtn">Ajouter une note</button>
          </div>
        </div>
      </div>
      <!-- Delivery panel (Scene 5) -->
      <div class="o-ipanel" data-el="inspDelivery">
        <div class="o-dsec" data-el="delivHead">
          <div class="o-dh"><div class="o-davatar" style="background:#6366F1">JP</div><div><div class="o-dname">Julien Petit</div><div class="o-demail">Site vitrine</div><div class="o-dbadge" style="background:#EFF6FF;color:#2563EB">En cours</div></div></div>
          <div style="font-size:16px;font-weight:800;color:#1A1A2E;margin:6px 0">3 200 €</div>
        </div>
        <div class="o-dsec" data-el="delivChecks">
          <div class="o-fl">Livrables à valider</div>
          <div class="o-checklist" style="margin-bottom:8px">
            <div class="o-checkitem" data-el="checkItem1"><div class="o-checkbox"></div>Maquettes validées</div>
            <div class="o-checkitem" data-el="checkItem2"><div class="o-checkbox"></div>Intégration terminée</div>
            <div class="o-checkitem checked"><div class="o-checkbox"></div>Hébergement configuré</div>
          </div>
          <button class="o-delivbtn" data-el="delivBtn"><span data-el="delivLabel">Marquer livrée</span></button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div class="o-modalbg" data-el="modal">
    <div class="o-modal">
      <div class="o-mt">Nouvelle commande</div>
      <div class="o-ms">Créez une commande pour votre client.</div>
      <div class="o-fg"><div class="o-fl">Titre</div><div class="o-fi" data-el="fTitre"></div></div>
      <div class="o-fg"><div class="o-fl">Client</div><div class="o-fi" data-el="fClient"></div></div>
      <div style="display:flex;gap:6px">
        <div class="o-fg" style="flex:1"><div class="o-fl">Montant</div><div class="o-fi" data-el="fMontant"></div></div>
        <div class="o-fg" style="flex:1"><div class="o-fl">Deadline</div><div class="o-fi" data-el="fDeadline"></div></div>
      </div>
      <button class="o-mbtn" data-el="modalSubmit">Créer la commande</button>
    </div>
  </div>

  <!-- Overlay -->
  <div class="o-overlay" data-el="overlay"><div class="o-okicon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M5 13l4 4L19 7"/></svg></div><div class="o-okt">Commandes à jour !</div><div style="height:6px"></div><div class="o-oku">12 850 € CA · 34 commandes</div></div>

  <!-- Cursor -->
  <div class="o-cur" data-el="cur"><svg viewBox="0 0 24 24" fill="none" width="14" height="17"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="#1A1A2E" stroke-width="1.5" stroke-linejoin="round"/></svg><div class="o-click" data-el="clk"></div></div>
</div>
</div>`;
