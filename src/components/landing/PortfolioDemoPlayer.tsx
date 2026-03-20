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
   TIMELINE — Portfolio demo
   Scene 1: Intro (0→3.5s) — shell + sidebar + gallery grid
   Scene 2: Add project (3.5→9.5s) — modal + fill + submit
   Scene 3: Edit project (9.5→15s) — inspector edit fields
   Scene 4: Reorder (15→20s) — drag card swap animation
   Scene 5: Preview (20→26s) — public portfolio view
   Scene 6: Outro (26→32s)
   ═══════════════════════════════════════════════════════════ */

function buildTimeline(): Keyframe[] {
  const K: Keyframe[] = [];
  const k = (t: number, apply: (ctx: DemoCtx) => void) => K.push({ t, apply });

  // ── SCENE 1: INTRO ──
  k(0, ctx => { ctx.q("shell").classList.add("vis"); });
  k(0.8, ctx => { ctx.q("cur").classList.add("vis"); ctx.cursorTo("pageTitle"); });
  k(1.2, ctx => { ctx.q("insp").classList.add("vis"); });
  k(1.8, ctx => { ctx.q("stats").classList.add("vis"); });
  k(2.4, ctx => { ctx.q("grid").classList.add("vis"); });

  // ── SCENE 2: ADD PROJECT ──
  k(3.5, ctx => { ctx.cursorTo("addBtn"); });
  k(4.0, ctx => { ctx.clickAt(); ctx.q("modal").classList.add("open"); });
  k(4.8, ctx => { ctx.cursorTo("fName"); });
  k(5.0, ctx => { ctx.clickAt(); ctx.q("fName").classList.add("ed"); ctx.q("fName").textContent = "Packaging Écovert"; ctx.q("fName").classList.remove("ed"); });
  k(5.5, ctx => { ctx.cursorTo("fCat"); });
  k(5.7, ctx => { ctx.clickAt(); ctx.q("fCat").classList.add("ed"); ctx.q("fCat").textContent = "UI Design"; ctx.q("fCat").classList.remove("ed"); });
  k(6.2, ctx => { ctx.cursorTo("fDesc"); });
  k(6.4, ctx => { ctx.clickAt(); ctx.q("fDesc").classList.add("ed"); ctx.q("fDesc").textContent = "Refonte packaging éco-responsable"; ctx.q("fDesc").classList.remove("ed"); });
  k(7.0, ctx => { ctx.cursorTo("modalSubmit"); });
  k(7.4, ctx => {
    ctx.clickAt(); ctx.q("modal").classList.remove("open");
    // Add new card to grid
    const card = document.createElement("div");
    card.className = "p-card entering"; card.setAttribute("data-el", "cardNew");
    card.innerHTML = '<div class="p-card-img" style="background:linear-gradient(135deg,#6366F1,#818CF8)"></div><div class="p-card-body"><div class="p-card-title">Packaging Écovert</div><div class="p-card-tag" style="background:#EDE9FE;color:#7C3AED">UI Design</div></div>';
    ctx.q("gridInner").appendChild(card);
  });
  k(8.0, ctx => { ctx.q("statCount").textContent = "5"; });

  // ── SCENE 3: EDIT PROJECT ──
  k(9.5, ctx => { ctx.cursorTo("card1"); });
  k(10.0, ctx => {
    ctx.clickAt();
    // Highlight selected card
    ctx.q("card1").classList.add("sel");
    // Show edit panel in inspector
    ctx.q("inspDefault").style.display = "none";
    ctx.q("inspEdit").classList.add("vis");
  });
  k(10.6, ctx => { ctx.q("editHead").classList.add("vis"); });
  k(11.0, ctx => { ctx.q("editFields").classList.add("vis"); });
  // Type new description
  k(11.6, ctx => { ctx.cursorTo("editDesc"); });
  k(11.9, ctx => { ctx.clickAt(); ctx.q("editDesc").classList.add("ed"); });
  k(12.2, ctx => { ctx.q("editDesc").textContent = "Identité complète pour un studio de yoga haut de gamme — logotype, palette, typographies et déclinaisons."; });
  k(12.8, ctx => { ctx.q("editDesc").classList.remove("ed"); });
  // Add tag
  k(13.2, ctx => { ctx.cursorTo("editAddTag"); });
  k(13.5, ctx => {
    ctx.clickAt();
    const tag = document.createElement("span");
    tag.className = "p-etag"; tag.textContent = "Identité";
    ctx.q("editTags").appendChild(tag);
  });
  k(14.2, ctx => { ctx.q("editSave").classList.add("ok"); ctx.q("editSaveLabel").textContent = "✓ Enregistré"; });

  // ── SCENE 4: REORDER ──
  k(15.0, ctx => {
    ctx.q("inspEdit").classList.remove("vis");
    ctx.q("inspDefault").style.display = "";
    ctx.q("card1").classList.remove("sel");
  });
  k(15.5, ctx => { ctx.cursorTo("card3", 0, -10); });
  k(16.0, ctx => {
    ctx.clickAt();
    ctx.q("card3").classList.add("dragging");
  });
  k(16.8, ctx => {
    // Move cursor to card1 position (visual drag)
    ctx.cursorTo("card1", 0, -10);
    ctx.q("card3").classList.add("lifting");
  });
  k(17.5, ctx => {
    // Perform the swap
    ctx.q("card3").classList.remove("dragging"); ctx.q("card3").classList.remove("lifting");
    const grid = ctx.q("gridInner");
    const c1 = ctx.q("card1");
    const c3 = ctx.q("card3");
    grid.insertBefore(c3, c1);
    c3.classList.add("swapped");
    c1.classList.add("swapped");
  });
  k(18.2, ctx => {
    ctx.q("card3").classList.remove("swapped");
    ctx.q("card1").classList.remove("swapped");
  });
  k(18.8, ctx => { ctx.q("reorderToast").classList.add("vis"); });
  k(19.5, ctx => { ctx.q("reorderToast").classList.remove("vis"); });

  // ── SCENE 5: PREVIEW ──
  k(20.0, ctx => {
    ctx.cursorTo("previewBtn");
  });
  k(20.5, ctx => {
    ctx.clickAt();
    ctx.q("previewBtn").classList.add("act");
    ctx.q("editModeBtn").classList.remove("act");
    // Switch canvas to preview mode
    ctx.q("canvas").classList.add("preview");
    ctx.q("grid").classList.add("preview");
  });
  k(21.2, ctx => { ctx.q("previewHeader").classList.add("vis"); });
  k(22.0, ctx => { ctx.q("previewGrid").classList.add("vis"); });
  k(23.0, ctx => { ctx.cursorTo("prevCard2"); });
  k(23.5, ctx => { ctx.clickAt(); ctx.q("prevCard2").classList.add("hover"); });
  k(24.5, ctx => { ctx.q("prevCard2").classList.remove("hover"); });

  // ── SCENE 6: OUTRO ──
  k(26.0, ctx => { ctx.q("overlay").classList.add("vis"); });
  k(31.0, ctx => { ctx.q("cur").classList.remove("vis"); });

  return K.sort((a, b) => a.t - b.t);
}

/* ═══════════════════════════════════════════════════════════
   REACT COMPONENT — identical engine
   ═══════════════════════════════════════════════════════════ */

export default function PortfolioDemoPlayer({ label = "Voir le portfolio en action", accentColor = "#A855F7" }: Props) {
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

  const SNAP = [3.5, 9.5, 15.0, 20.0, 26.0];
  const seekTo = useCallback((t: number) => { const root = containerRef.current; if (!root) return; const sn = [...snapshotsRef.current.keys()].sort((a,b)=>a-b); let rf = -1; for (const st of sn) { if (st<=t) rf=st; else break; } if (rf>=0&&snapshotsRef.current.has(rf)) { const d = root.querySelector(".p-root"); if (d) d.innerHTML = snapshotsRef.current.get(rf)!; } else { root.innerHTML = initialHtmlRef.current; rf = -1; } void root.offsetHeight; const ctx = makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=rf) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current = t; setCurrentTime(t); }, [makeCtx]);
  const initialize = useCallback(() => { const root = containerRef.current; if (!root) return; root.innerHTML = HTML; initialHtmlRef.current = HTML; timelineRef.current = buildTimeline(); snapshotsRef.current.clear(); lastAppliedRef.current = -1; void root.offsetHeight; const ctx = makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>0) break; try{kf.apply(ctx);}catch{} } const d = root.querySelector(".p-root"); if (d) snapshotsRef.current.set(0, d.innerHTML); }, [makeCtx]);
  const togglePlay = useCallback(() => { if (isPlaying) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; setIsPlaying(false); return; } let t = currentTime>=TOTAL_DURATION-0.5?0:currentTime; if (t===0) seekTo(0); setIsPlaying(true); const TK=100; timerRef.current = setInterval(()=>{ t+=TK/1000; if (t>=TOTAL_DURATION) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current=null; setIsPlaying(false); setCurrentTime(TOTAL_DURATION); return; } const root=containerRef.current; if (!root) return; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=lastAppliedRef.current) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} const d=root.querySelector(".p-root"); if (d&&SNAP.includes(kf.t)) snapshotsRef.current.set(kf.t,d.innerHTML); } lastAppliedRef.current=t; setCurrentTime(t); }, TK); }, [isPlaying, currentTime, seekTo, makeCtx, SNAP]);
  const handleStart = useCallback(() => { setStarted(true); setShowControls(true); setTimeout(()=>{ initialize(); setTimeout(()=>{ seekTo(0); setCurrentTime(0); setIsPlaying(true); }, 200); }, 100); }, [initialize, seekTo]);
  useEffect(() => { if (!started||!isPlaying||timerRef.current) return; let t=currentTime; const TK=100; timerRef.current=setInterval(()=>{ t+=TK/1000; if (t>=TOTAL_DURATION) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current=null; setIsPlaying(false); setCurrentTime(TOTAL_DURATION); return; } const root=containerRef.current; if (!root) return; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=lastAppliedRef.current) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} const d=root.querySelector(".p-root"); if (d&&SNAP.includes(kf.t)) snapshotsRef.current.set(kf.t,d.innerHTML); } lastAppliedRef.current=t; setCurrentTime(t); }, TK); return ()=>{ if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, isPlaying]);
  useEffect(()=>()=>{ if (timerRef.current) clearInterval(timerRef.current); }, []);
  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => { const r=e.currentTarget.getBoundingClientRect(); const t=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*TOTAL_DURATION; if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } setIsPlaying(false); const root=containerRef.current; if (!root) return; root.innerHTML=initialHtmlRef.current; snapshotsRef.current.clear(); lastAppliedRef.current=-1; void root.offsetHeight; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current=t; const d=root.querySelector(".p-root"); if (d) snapshotsRef.current.set(0,d.innerHTML); setCurrentTime(t); }, [makeCtx]);
  const skip = useCallback((d: number) => { const t=Math.max(0,Math.min(TOTAL_DURATION,currentTime+d)); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } setIsPlaying(false); const root=containerRef.current; if (!root) return; root.innerHTML=initialHtmlRef.current; lastAppliedRef.current=-1; void root.offsetHeight; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current=t; setCurrentTime(t); }, [currentTime, makeCtx]);
  const fmt = (s: number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;
  const scenes = [{t:0,label:"Intro"},{t:3.5,label:"Ajout"},{t:9.5,label:"Édition"},{t:15,label:"Réorganiser"},{t:20,label:"Aperçu"},{t:26,label:"Résultat"}];
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
                  <div style={{width:"14%",background:"#FFF",borderRight:"1px solid #E8E5F0",padding:6}}><div style={{fontSize:10,fontWeight:800,background:"linear-gradient(135deg,#7C5CFF,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:10}}>Jestly</div>{["Dashboard","Clients","Portfolio","Commandes"].map((l,i)=>(<div key={l} style={{padding:"3px 5px",borderRadius:3,fontSize:7,marginBottom:2,background:i===2?"#EDE9FE":"transparent",color:i===2?"#7C5CFF":"#6B7280",fontWeight:i===2?600:400}}>{l}</div>))}</div>
                  <div style={{flex:1,background:"#F1EFF7",padding:8}}><div style={{display:"flex",gap:4,marginBottom:6}}>{["Projets","Catégories","Vues"].map(l=>(<div key={l} style={{flex:1,background:"#FFF",border:"1px solid #E8E5F0",borderRadius:5,padding:4}}><div style={{fontSize:5,color:"#9CA3AF"}}>{l}</div><div style={{width:"50%",height:4,background:"#F0EDF7",borderRadius:2,marginTop:2}} /></div>))}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>{[0,1,2,3].map(i=>(<div key={i} style={{background:"#FFF",border:"1px solid #E8E5F0",borderRadius:5,overflow:"hidden"}}><div style={{height:24,background:["linear-gradient(135deg,#7C5CFF,#A78BFA)","linear-gradient(135deg,#F59E0B,#FBBF24)","linear-gradient(135deg,#1A1A2E,#374151)","linear-gradient(135deg,#10B981,#34D399)"][i]}} /><div style={{padding:3}}><div style={{width:"60%",height:3,background:"#F0EDF7",borderRadius:2,marginBottom:2}} /><div style={{width:16,height:6,background:"#F5F3FA",borderRadius:3}} /></div></div>))}</div></div>
                  <div style={{width:"16%",background:"#FFF",borderLeft:"1px solid #E8E5F0",padding:5}}><div style={{fontSize:6,fontWeight:600,color:"#9CA3AF",marginBottom:4}}>Détails</div>{[0,1,2].map(i=>(<div key={i} style={{marginBottom:4}}><div style={{width:"40%",height:3,background:"#F0EDF7",borderRadius:2,marginBottom:2}} /><div style={{height:10,background:"#FAFAFE",border:"1px solid #E8E5F0",borderRadius:3}} /></div>))}</div>
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
   PORTFOLIO DEMO HTML
   DA tokens: Shell #F8F7FC, Canvas #F1EFF7, Border #E8E5F0,
   Sidebar 170px, Inspector 190px, Toolbar 34px, Accent #7C5CFF
   Portfolio gallery editor: 2x2 grid of project cards
   with image placeholders, titles, category tags
   ═══════════════════════════════════════════════════════════ */

const HTML = `
<style>
  .p-root{width:100%;height:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;background:#0F0E17;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
  .p-root *,.p-root *::before,.p-root *::after{margin:0;padding:0;box-sizing:border-box}
  .p-shell{width:100%;height:100%;background:#F8F7FC;overflow:hidden;position:relative;opacity:0;transform:scale(0.96);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1),opacity 0.4s ease}
  .p-shell.vis{opacity:1;transform:scale(1)}
  .p-bar{height:28px;background:#FAFAFE;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;padding:0 10px;gap:6px}
  .p-bardot{width:8px;height:8px;border-radius:50%}
  .p-barurl{flex:1;margin-left:8px;height:17px;background:#F3F2F8;border-radius:4px;display:flex;align-items:center;padding:0 8px;font-size:9px;color:#9CA3AF}
  .p-builder{display:flex;height:calc(100% - 28px);position:relative}
  .p-toolbar{position:absolute;top:0;left:0;right:0;height:34px;background:#FFF;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;justify-content:space-between;padding:0 12px;z-index:20}
  .p-logo{font-size:11px;font-weight:800;background:linear-gradient(135deg,#7C5CFF,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .p-divider{width:1px;height:16px;background:#E8E5F0;margin:0 8px}
  .p-pagename{font-size:9px;color:#6B7280;padding:2px 7px;background:#F5F3FA;border-radius:4px}
  .p-tbl{display:flex;align-items:center;gap:6px}
  .p-addbtn{padding:4px 12px;background:#7C5CFF;color:#fff;border:none;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer}
  .p-modebtn{padding:3px 8px;border:1px solid #E8E5F0;border-radius:4px;font-size:8px;font-weight:500;cursor:pointer;background:#FAFAFE;color:#6B7280;transition:all 0.2s}
  .p-modebtn.act{background:#EDE9FE;border-color:#DDD6FE;color:#7C5CFF;font-weight:600}
  .p-side{width:170px;background:#FFF;border-right:1px solid #E8E5F0;margin-top:34px;overflow:hidden;padding:8px}
  .p-stitle{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#9CA3AF;margin-bottom:6px;margin-top:6px}
  .p-sitem{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:4px;font-size:10px;color:#1A1A2E}
  .p-sitem.act{background:#EDE9FE;color:#7C5CFF;font-weight:600}
  .p-sicon{width:14px;height:14px;border-radius:3px;background:#F0EDF7;display:flex;align-items:center;justify-content:center;font-size:7px;color:#9CA3AF}
  .p-sitem.act .p-sicon{background:rgba(124,92,255,0.15);color:#7C5CFF}
  .p-canvas{flex:1;margin-top:34px;background:#F1EFF7;overflow:hidden;padding:10px;display:flex;flex-direction:column;gap:8px}
  .p-canvas.preview{background:#FFFFFF}

  /* Stats bar */
  .p-stats{display:flex;gap:5px;opacity:0;transform:translateY(6px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .p-stats.vis{opacity:1;transform:translateY(0)}
  .p-stat{flex:1;padding:6px 8px;background:#FFF;border:1px solid #E8E5F0;border-radius:7px}
  .p-stat-label{font-size:6px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px}
  .p-stat-val{font-size:10px;font-weight:700;color:#1A1A2E}
  .p-stat-sub{font-size:5.5px;color:#9CA3AF;margin-top:1px}

  /* Gallery grid */
  .p-grid{flex:1;opacity:0;transform:translateY(8px);transition:all 0.5s cubic-bezier(0.22,1,0.36,1);overflow:hidden}
  .p-grid.vis{opacity:1;transform:translateY(0)}
  .p-grid.preview .p-grid-inner{gap:8px}
  .p-grid-inner{display:grid;grid-template-columns:1fr 1fr;gap:6px;height:100%}
  .p-card{background:#FFF;border:1px solid #E8E5F0;border-radius:7px;overflow:hidden;cursor:pointer;transition:all 0.3s cubic-bezier(0.22,1,0.36,1)}
  .p-card:hover{box-shadow:0 4px 12px rgba(0,0,0,0.06)}
  .p-card.sel{border-color:#7C5CFF;box-shadow:0 0 0 2px rgba(124,92,255,0.15)}
  .p-card.entering{animation:p-fadeIn 0.4s cubic-bezier(0.22,1,0.36,1)}
  .p-card.dragging{opacity:0.6;transform:scale(0.95);box-shadow:0 8px 24px rgba(0,0,0,0.12)}
  .p-card.lifting{transform:scale(0.92);opacity:0.4}
  .p-card.swapped{animation:p-swap 0.35s cubic-bezier(0.22,1,0.36,1)}
  @keyframes p-fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes p-swap{0%{opacity:0.5;transform:scale(0.95)}100%{opacity:1;transform:scale(1)}}
  .p-card-img{height:60%;min-height:40px;border-radius:6px 6px 0 0}
  .p-card-body{padding:5px 7px}
  .p-card-title{font-size:8px;font-weight:700;color:#1A1A2E;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .p-card-tag{display:inline-block;font-size:6px;font-weight:600;padding:2px 6px;border-radius:10px;background:#F5F3FA;color:#6B7280}

  /* Reorder toast */
  .p-toast{position:absolute;bottom:14px;left:50%;transform:translateX(-50%) translateY(10px);background:#1A1A2E;color:#FFF;font-size:8px;font-weight:500;padding:4px 12px;border-radius:14px;opacity:0;transition:all 0.3s cubic-bezier(0.22,1,0.36,1);z-index:30;white-space:nowrap}
  .p-toast.vis{opacity:1;transform:translateX(-50%) translateY(0)}

  /* Preview mode */
  .p-prev-header{opacity:0;transform:translateY(6px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1);margin-bottom:6px}
  .p-prev-header.vis{opacity:1;transform:translateY(0)}
  .p-prev-title{font-size:12px;font-weight:800;color:#1A1A2E;margin-bottom:2px}
  .p-prev-sub{font-size:7px;color:#9CA3AF}
  .p-prev-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;flex:1;opacity:0;transform:translateY(8px);transition:all 0.5s cubic-bezier(0.22,1,0.36,1)}
  .p-prev-grid.vis{opacity:1;transform:translateY(0)}
  .p-prev-card{border-radius:8px;overflow:hidden;cursor:pointer;transition:all 0.35s cubic-bezier(0.22,1,0.36,1);position:relative}
  .p-prev-card:hover,.p-prev-card.hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.1)}
  .p-prev-card-img{height:65%;min-height:40px}
  .p-prev-card-body{padding:5px 7px;background:#FFF}
  .p-prev-card-title{font-size:8px;font-weight:700;color:#1A1A2E;margin-bottom:2px}
  .p-prev-card-cat{font-size:6px;color:#9CA3AF}
  .p-prev-hidden{display:none}
  .p-canvas.preview .p-stats{display:none}
  .p-canvas.preview .p-grid{display:none}
  .p-canvas.preview .p-prev-header{display:block}
  .p-canvas.preview .p-prev-grid{display:grid}
  .p-prev-header{display:none}
  .p-prev-grid{display:none}

  /* Inspector 190px */
  .p-insp{width:190px;background:#FFF;border-left:1px solid #E8E5F0;margin-top:34px;overflow-y:auto;opacity:0;transform:translateX(8px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .p-insp.vis{opacity:1;transform:translateX(0)}
  .p-tabs{display:flex;border-bottom:1px solid #E8E5F0}
  .p-tab{flex:1;padding:7px 5px;font-size:8px;font-weight:600;text-align:center;color:#9CA3AF;border-bottom:2px solid transparent;cursor:pointer}
  .p-tab.act{color:#7C5CFF;border-bottom-color:#7C5CFF}
  .p-icont{padding:8px}
  .p-fl{font-size:7px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px}
  .p-fi{width:100%;padding:4px 6px;border:1px solid #E8E5F0;border-radius:4px;font-size:9px;color:#1A1A2E;background:#FAFAFE;transition:border-color 0.2s;min-height:20px}
  .p-fi.ed{border-color:#7C5CFF;box-shadow:0 0 0 2px rgba(124,92,255,0.1)}
  .p-irow{display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #F0EDF7}
  .p-irowl{font-size:7px;color:#9CA3AF}
  .p-irowv{font-size:8px;font-weight:600;color:#1A1A2E}

  /* Inspector panels */
  .p-ipanel{display:none;padding:8px}
  .p-ipanel.vis{display:block}
  .p-dsec{opacity:0;transform:translateY(6px);transition:all 0.35s cubic-bezier(0.22,1,0.36,1);margin-bottom:8px}
  .p-dsec.vis{opacity:1;transform:translateY(0)}
  .p-dh{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .p-davatar{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff}
  .p-dname{font-size:11px;font-weight:700;color:#1A1A2E}
  .p-demail{font-size:7px;color:#9CA3AF}
  .p-fg{margin-bottom:6px}
  .p-etag{display:inline-block;font-size:6px;font-weight:600;padding:2px 6px;border-radius:10px;background:#EDE9FE;color:#7C5CFF;margin-right:3px;margin-bottom:2px}
  .p-savebtn{width:100%;padding:5px;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;transition:all 0.4s;background:#7C5CFF;color:#fff;margin-top:6px}
  .p-savebtn.ok{background:#10B981}
  .p-addtagbtn{display:inline-block;font-size:6px;font-weight:600;padding:2px 6px;border-radius:10px;background:#F5F3FA;color:#9CA3AF;cursor:pointer;border:1px dashed #E8E5F0;transition:all 0.2s}
  .p-addtagbtn:hover{border-color:#7C5CFF;color:#7C5CFF}

  /* Modal */
  .p-modalbg{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.85);backdrop-filter:blur(4px);z-index:40;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s}
  .p-modalbg.open{opacity:1;pointer-events:all}
  .p-modal{width:260px;background:#FFF;border-radius:8px;padding:14px;box-shadow:0 12px 40px rgba(0,0,0,0.1);border:1px solid #E8E5F0;transform:translateY(8px) scale(0.97);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1)}
  .p-modalbg.open .p-modal{transform:translateY(0) scale(1)}
  .p-mt{font-size:11px;font-weight:700;color:#1A1A2E;margin-bottom:2px}
  .p-ms{font-size:8px;color:#9CA3AF;margin-bottom:8px}
  .p-mbtn{width:100%;padding:5px;background:#7C5CFF;color:#fff;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;margin-top:4px}

  /* Overlay */
  .p-overlay{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.95);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:50;opacity:0;pointer-events:none;transition:opacity 0.5s}
  .p-overlay.vis{opacity:1;pointer-events:all}
  .p-okicon{width:42px;height:42px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center;margin-bottom:12px;transform:scale(0);transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1)}
  .p-overlay.vis .p-okicon{transform:scale(1)}
  .p-okt{font-size:16px;font-weight:700;color:#1A1A2E;margin-bottom:4px}
  .p-oku{font-size:10px;color:#7C5CFF;background:#EDE9FE;padding:4px 12px;border-radius:14px;font-weight:500}

  /* Cursor */
  .p-cur{position:absolute;width:14px;height:17px;z-index:100;pointer-events:none;opacity:0;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.2));transition:opacity 0.3s}
  .p-cur.vis{opacity:1}
  .p-click{position:absolute;width:18px;height:18px;border-radius:50%;background:rgba(124,92,255,0.3);transform:translate(-2px,-1px) scale(0);pointer-events:none;z-index:99}
  .p-click.pop{animation:p-pop 0.35s ease-out forwards}
  @keyframes p-pop{0%{transform:translate(-2px,-1px) scale(0);opacity:1}100%{transform:translate(-2px,-1px) scale(2);opacity:0}}
</style>

<div class="p-root">
<div class="p-shell" data-el="shell">
  <div class="p-bar"><div class="p-bardot" style="background:#FF6159"></div><div class="p-bardot" style="background:#FFBF2F"></div><div class="p-bardot" style="background:#2ACB42"></div><div class="p-barurl"><span style="margin-right:3px">🔒</span>app.jestly.fr/portfolio</div></div>
  <div class="p-builder">
    <div class="p-toolbar">
      <div class="p-tbl"><span class="p-logo">Jestly</span><div class="p-divider"></div><span class="p-pagename" data-el="pageTitle">Portfolio</span></div>
      <div class="p-tbl"><button class="p-modebtn act" data-el="editModeBtn">Édition</button><button class="p-modebtn" data-el="previewBtn">Aperçu public</button><div class="p-divider"></div><button class="p-addbtn" data-el="addBtn">+ Nouveau projet</button></div>
    </div>
    <div class="p-side">
      <div class="p-stitle">Navigation</div>
      <div class="p-sitem"><div class="p-sicon">⌂</div>Dashboard</div>
      <div class="p-sitem"><div class="p-sicon">♦</div>Clients</div>
      <div class="p-sitem"><div class="p-sicon">☰</div>Commandes</div>
      <div class="p-sitem act"><div class="p-sicon">◈</div>Portfolio</div>
      <div class="p-sitem"><div class="p-sicon">✎</div>Facturation</div>
      <div class="p-stitle" style="margin-top:10px">Catégories</div>
      <div class="p-sitem" style="font-size:8px;color:#9CA3AF"><div class="p-sicon" style="width:8px;height:8px;border-radius:50%;background:#7C5CFF"></div>Branding</div>
      <div class="p-sitem" style="font-size:8px;color:#9CA3AF"><div class="p-sicon" style="width:8px;height:8px;border-radius:50%;background:#F59E0B"></div>Motion</div>
      <div class="p-sitem" style="font-size:8px;color:#9CA3AF"><div class="p-sicon" style="width:8px;height:8px;border-radius:50%;background:#374151"></div>Logo</div>
      <div class="p-sitem" style="font-size:8px;color:#9CA3AF"><div class="p-sicon" style="width:8px;height:8px;border-radius:50%;background:#10B981"></div>Web design</div>
    </div>
    <div class="p-canvas" data-el="canvas">
      <!-- Stats -->
      <div class="p-stats" data-el="stats">
        <div class="p-stat"><div class="p-stat-label">Projets</div><div class="p-stat-val" data-el="statCount">4</div><div class="p-stat-sub">dans le portfolio</div></div>
        <div class="p-stat"><div class="p-stat-label">Catégories</div><div class="p-stat-val">4</div><div class="p-stat-sub">actives</div></div>
        <div class="p-stat" style="background:#FAFAFF;border-color:#E8E5F5"><div class="p-stat-label" style="color:#7C5CFF">Vues</div><div class="p-stat-val" style="color:#6D28D9">1 247</div><div class="p-stat-sub">ce mois</div></div>
      </div>
      <!-- Gallery grid -->
      <div class="p-grid" data-el="grid">
        <div class="p-grid-inner" data-el="gridInner">
          <div class="p-card" data-el="card1">
            <div class="p-card-img" style="background:linear-gradient(135deg,#7C5CFF,#A78BFA)"></div>
            <div class="p-card-body"><div class="p-card-title">Refonte Studio Bloom</div><div class="p-card-tag" style="background:#EDE9FE;color:#7C5CFF">Branding</div></div>
          </div>
          <div class="p-card" data-el="card2">
            <div class="p-card-img" style="background:linear-gradient(135deg,#F59E0B,#FBBF24)"></div>
            <div class="p-card-body"><div class="p-card-title">Campagne TechFlow</div><div class="p-card-tag" style="background:#FEF3C7;color:#D97706">Motion</div></div>
          </div>
          <div class="p-card" data-el="card3">
            <div class="p-card-img" style="background:linear-gradient(135deg,#1A1A2E,#374151)"></div>
            <div class="p-card-body"><div class="p-card-title">Identité Maison Noire</div><div class="p-card-tag" style="background:#F3F4F6;color:#374151">Logo</div></div>
          </div>
          <div class="p-card" data-el="card4">
            <div class="p-card-img" style="background:linear-gradient(135deg,#10B981,#34D399)"></div>
            <div class="p-card-body"><div class="p-card-title">Site Artisan Local</div><div class="p-card-tag" style="background:#D1FAE5;color:#059669">Web design</div></div>
          </div>
        </div>
        <div class="p-toast" data-el="reorderToast">Ordre mis à jour</div>
      </div>
      <!-- Preview mode content (hidden by default) -->
      <div class="p-prev-header" data-el="previewHeader">
        <div class="p-prev-title">Mon Portfolio</div>
        <div class="p-prev-sub">Sélection de mes meilleurs projets — prenom.jestly.fr</div>
      </div>
      <div class="p-prev-grid" data-el="previewGrid">
        <div class="p-prev-card" data-el="prevCard1">
          <div class="p-prev-card-img" style="background:linear-gradient(135deg,#1A1A2E,#374151);height:65%;min-height:40px"></div>
          <div class="p-prev-card-body"><div class="p-prev-card-title">Identité Maison Noire</div><div class="p-prev-card-cat">Logo</div></div>
        </div>
        <div class="p-prev-card" data-el="prevCard2">
          <div class="p-prev-card-img" style="background:linear-gradient(135deg,#7C5CFF,#A78BFA);height:65%;min-height:40px"></div>
          <div class="p-prev-card-body"><div class="p-prev-card-title">Refonte Studio Bloom</div><div class="p-prev-card-cat">Branding</div></div>
        </div>
        <div class="p-prev-card" data-el="prevCard3">
          <div class="p-prev-card-img" style="background:linear-gradient(135deg,#F59E0B,#FBBF24);height:65%;min-height:40px"></div>
          <div class="p-prev-card-body"><div class="p-prev-card-title">Campagne TechFlow</div><div class="p-prev-card-cat">Motion</div></div>
        </div>
        <div class="p-prev-card" data-el="prevCard4">
          <div class="p-prev-card-img" style="background:linear-gradient(135deg,#10B981,#34D399);height:65%;min-height:40px"></div>
          <div class="p-prev-card-body"><div class="p-prev-card-title">Site Artisan Local</div><div class="p-prev-card-cat">Web design</div></div>
        </div>
      </div>
    </div>

    <!-- Inspector 190px -->
    <div class="p-insp" data-el="insp">
      <div class="p-tabs"><div class="p-tab act">Détails</div><div class="p-tab">Paramètres</div></div>
      <!-- Default -->
      <div class="p-icont" data-el="inspDefault">
        <div class="p-fl" style="margin-bottom:6px">Résumé</div>
        <div style="margin-bottom:8px">
          <div class="p-irow"><span class="p-irowl">Projets</span><span class="p-irowv">4</span></div>
          <div class="p-irow"><span class="p-irowl">Catégories</span><span class="p-irowv">4</span></div>
          <div class="p-irow"><span class="p-irowl">Vues totales</span><span class="p-irowv">1 247</span></div>
          <div class="p-irow"><span class="p-irowl">Dernière MAJ</span><span class="p-irowv">Aujourd'hui</span></div>
        </div>
        <div class="p-fl" style="margin-bottom:6px">Dernière activité</div>
        <div style="padding:5px 6px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:4px;font-size:8px;color:#6B7280;line-height:1.4">Projet « Refonte Studio Bloom » mis à jour</div>
      </div>
      <!-- Edit panel -->
      <div class="p-ipanel" data-el="inspEdit">
        <div class="p-dsec" data-el="editHead">
          <div class="p-dh"><div class="p-davatar" style="background:linear-gradient(135deg,#7C5CFF,#A78BFA)">SB</div><div><div class="p-dname">Studio Bloom</div><div class="p-demail">Refonte Studio Bloom</div></div></div>
        </div>
        <div class="p-dsec" data-el="editFields">
          <div class="p-fg"><div class="p-fl">Titre</div><div class="p-fi">Refonte Studio Bloom</div></div>
          <div class="p-fg"><div class="p-fl">Description</div><div class="p-fi" data-el="editDesc" style="min-height:36px;font-size:8px;line-height:1.3">Refonte complète de l'identité visuelle pour un studio créatif.</div></div>
          <div class="p-fg"><div class="p-fl">Tags</div><div data-el="editTags"><span class="p-etag">Branding</span><span class="p-etag">Identité</span><span class="p-addtagbtn" data-el="editAddTag">+ Ajouter</span></div></div>
          <button class="p-savebtn" data-el="editSave"><span data-el="editSaveLabel">Enregistrer</span></button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div class="p-modalbg" data-el="modal">
    <div class="p-modal">
      <div class="p-mt">Nouveau projet</div>
      <div class="p-ms">Ajoutez un projet à votre portfolio.</div>
      <div class="p-fg"><div class="p-fl">Nom du projet</div><div class="p-fi" data-el="fName"></div></div>
      <div style="display:flex;gap:6px">
        <div class="p-fg" style="flex:1"><div class="p-fl">Catégorie</div><div class="p-fi" data-el="fCat"></div></div>
      </div>
      <div class="p-fg"><div class="p-fl">Description</div><div class="p-fi" data-el="fDesc" style="min-height:28px"></div></div>
      <button class="p-mbtn" data-el="modalSubmit">Ajouter le projet</button>
    </div>
  </div>

  <!-- Overlay -->
  <div class="p-overlay" data-el="overlay"><div class="p-okicon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M5 13l4 4L19 7"/></svg></div><div class="p-okt">Portfolio publié !</div><div style="height:6px"></div><div class="p-oku">5 projets · prenom.jestly.fr</div></div>

  <!-- Cursor -->
  <div class="p-cur" data-el="cur"><svg viewBox="0 0 24 24" fill="none" width="14" height="17"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="#1A1A2E" stroke-width="1.5" stroke-linejoin="round"/></svg><div class="p-click" data-el="clk"></div></div>
</div>
</div>`;
