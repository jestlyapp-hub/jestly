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
   TIMELINE — Paiements demo
   Scene 1: Intro (0→3.5s) — shell + KPIs + payment list
   Scene 2: Create payment link (3.5→9.5s) — modal + fill + submit
   Scene 3: Checkout preview (9.5→15s) — mini checkout card
   Scene 4: Payment confirmation (15→20s) — pay + spinner + success
   Scene 5: Summary update (20→26s) — KPIs animate + list updates
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
  k(2.4, ctx => { ctx.q("table").classList.add("vis"); });

  // ── SCENE 2: CREATE PAYMENT LINK ──
  k(3.5, ctx => { ctx.cursorTo("addBtn"); });
  k(4.0, ctx => { ctx.clickAt(); ctx.q("modal").classList.add("open"); });
  k(4.8, ctx => { ctx.cursorTo("fClient"); });
  k(5.0, ctx => { ctx.clickAt(); ctx.q("fClient").classList.add("ed"); ctx.q("fClient").textContent = "Emma Rousseau"; ctx.q("fClient").classList.remove("ed"); });
  k(5.4, ctx => { ctx.cursorTo("fObjet"); });
  k(5.6, ctx => { ctx.clickAt(); ctx.q("fObjet").classList.add("ed"); ctx.q("fObjet").textContent = "Refonte identité visuelle"; ctx.q("fObjet").classList.remove("ed"); });
  k(6.0, ctx => { ctx.cursorTo("fAmount"); });
  k(6.2, ctx => { ctx.clickAt(); ctx.q("fAmount").classList.add("ed"); ctx.q("fAmount").textContent = "2 500,00 €"; ctx.q("fAmount").classList.remove("ed"); });
  k(6.8, ctx => { ctx.cursorTo("modalSubmit"); });
  k(7.2, ctx => {
    ctx.clickAt(); ctx.q("modal").classList.remove("open");
    // Add link card to canvas
    const card = document.createElement("div");
    card.className = "pm-linkcard entering"; card.setAttribute("data-el", "linkCard");
    card.innerHTML = '<div class="pm-linkicon">🔗</div><div class="pm-linkinfo"><div class="pm-linkname">Refonte identité visuelle</div><div class="pm-linkclient">Emma Rousseau · 2 500,00 €</div></div><div class="pm-linkbadge pm-b-sent">Envoyé</div><div class="pm-linkcopy" data-el="copyBtn">Copier le lien</div>';
    const canvas = ctx.q("linkcards");
    if (canvas) canvas.prepend(card);
  });
  k(8.0, ctx => { ctx.cursorTo("copyBtn"); });
  k(8.4, ctx => {
    ctx.clickAt();
    const btn = ctx.q("copyBtn");
    if (btn) { btn.textContent = "✓ Copié"; btn.classList.add("copied"); }
  });

  // ── SCENE 3: CHECKOUT PREVIEW ──
  k(9.5, ctx => {
    ctx.cursorTo("linkCard");
  });
  k(10.0, ctx => {
    ctx.clickAt();
    // Show checkout preview in inspector
    ctx.q("inspDefault").style.display = "none";
    ctx.q("inspCheckout").classList.add("vis");
  });
  k(10.6, ctx => { ctx.q("checkoutHead").classList.add("vis"); });
  k(11.2, ctx => { ctx.q("checkoutForm").classList.add("vis"); });
  k(12.0, ctx => { ctx.q("checkoutCard").classList.add("vis"); });
  k(13.0, ctx => { ctx.q("checkoutBtn").classList.add("vis"); });

  // ── SCENE 4: PAYMENT CONFIRMATION ──
  k(15.0, ctx => { ctx.cursorTo("payBtn"); });
  k(15.5, ctx => {
    ctx.clickAt();
    ctx.q("payBtn").classList.add("ld");
    ctx.q("payLabel").textContent = "Traitement...";
  });
  k(16.5, ctx => {
    ctx.q("payBtn").classList.remove("ld");
    ctx.q("payBtn").classList.add("ok");
    ctx.q("payLabel").textContent = "✓ Paiement reçu";
  });
  k(17.2, ctx => {
    // Update the link card badge
    const card = ctx.q("linkCard");
    if (card) {
      const badge = card.querySelector(".pm-linkbadge") as HTMLElement;
      if (badge) { badge.className = "pm-linkbadge pm-b-paid"; badge.textContent = "Payé"; }
    }
  });
  k(17.8, ctx => {
    // Update row in table — Thomas Durand → Payé
    const badge = ctx.q("rowPending").querySelector(".pm-badge") as HTMLElement;
    if (badge) { badge.className = "pm-badge pm-b-paid"; badge.textContent = "Payé"; }
  });
  k(18.5, ctx => {
    // Show success checkmark in inspector
    ctx.q("checkoutSuccess").classList.add("vis");
  });

  // ── SCENE 5: SUMMARY UPDATE ──
  k(20.0, ctx => {
    ctx.q("inspCheckout").classList.remove("vis");
    ctx.q("inspDefault").style.display = "";
    // Switch to summary tab
    ctx.q("tabApercu").classList.remove("act");
    ctx.q("tabSuivi").classList.add("act");
    ctx.q("inspDefault").style.display = "none";
    ctx.q("inspSummary").classList.add("vis");
  });
  k(20.6, ctx => { ctx.q("summaryKpis").classList.add("vis"); });
  k(21.2, ctx => { ctx.q("summaryBars").classList.add("vis"); });
  k(21.8, ctx => { ctx.q("summaryRecent").classList.add("vis"); });
  // Update main KPIs
  k(22.5, ctx => {
    ctx.q("kpiEncaisse").textContent = "11 150 €";
    ctx.q("kpiAttente").textContent = "2 000 €";
    ctx.q("kpiMois").textContent = "5 700 €";
  });
  k(23.5, ctx => {
    // Add new row at top of payment list
    const row = document.createElement("div");
    row.className = "pm-row entering";
    row.innerHTML = '<div class="pm-cell pm-cname">Refonte identité visuelle</div><div class="pm-cell pm-cclient">Emma Rousseau</div><div class="pm-cell pm-cobjet">Branding</div><div class="pm-cell"><span class="pm-badge pm-b-paid">Payé</span></div><div class="pm-cell pm-camount">2 500 €</div>';
    ctx.q("tbody").prepend(row);
  });

  // ── SCENE 6: OUTRO ──
  k(26.0, ctx => { ctx.q("overlay").classList.add("vis"); });
  k(31.0, ctx => { ctx.q("cur").classList.remove("vis"); });

  return K.sort((a, b) => a.t - b.t);
}

/* ═══════════════════════════════════════════════════════════
   REACT COMPONENT — identical engine
   ═══════════════════════════════════════════════════════════ */

export default function PaiementsDemoPlayer({ label = "Voir les paiements en action", accentColor = "#10B981" }: Props) {
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
  const seekTo = useCallback((t: number) => { const root = containerRef.current; if (!root) return; const sn = [...snapshotsRef.current.keys()].sort((a,b)=>a-b); let rf = -1; for (const st of sn) { if (st<=t) rf=st; else break; } if (rf>=0&&snapshotsRef.current.has(rf)) { const d = root.querySelector(".pm-root"); if (d) d.innerHTML = snapshotsRef.current.get(rf)!; } else { root.innerHTML = initialHtmlRef.current; rf = -1; } void root.offsetHeight; const ctx = makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=rf) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current = t; setCurrentTime(t); }, [makeCtx]);
  const initialize = useCallback(() => { const root = containerRef.current; if (!root) return; root.innerHTML = HTML; initialHtmlRef.current = HTML; timelineRef.current = buildTimeline(); snapshotsRef.current.clear(); lastAppliedRef.current = -1; void root.offsetHeight; const ctx = makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>0) break; try{kf.apply(ctx);}catch{} } const d = root.querySelector(".pm-root"); if (d) snapshotsRef.current.set(0, d.innerHTML); }, [makeCtx]);
  const togglePlay = useCallback(() => { if (isPlaying) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; setIsPlaying(false); return; } let t = currentTime>=TOTAL_DURATION-0.5?0:currentTime; if (t===0) seekTo(0); setIsPlaying(true); const TK=100; timerRef.current = setInterval(()=>{ t+=TK/1000; if (t>=TOTAL_DURATION) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current=null; setIsPlaying(false); setCurrentTime(TOTAL_DURATION); return; } const root=containerRef.current; if (!root) return; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=lastAppliedRef.current) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} const d=root.querySelector(".pm-root"); if (d&&SNAP.includes(kf.t)) snapshotsRef.current.set(kf.t,d.innerHTML); } lastAppliedRef.current=t; setCurrentTime(t); }, TK); }, [isPlaying, currentTime, seekTo, makeCtx, SNAP]);
  const handleStart = useCallback(() => { setStarted(true); setShowControls(true); setTimeout(()=>{ initialize(); setTimeout(()=>{ seekTo(0); setCurrentTime(0); setIsPlaying(true); }, 200); }, 100); }, [initialize, seekTo]);
  useEffect(() => { if (!started||!isPlaying||timerRef.current) return; let t=currentTime; const TK=100; timerRef.current=setInterval(()=>{ t+=TK/1000; if (t>=TOTAL_DURATION) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current=null; setIsPlaying(false); setCurrentTime(TOTAL_DURATION); return; } const root=containerRef.current; if (!root) return; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=lastAppliedRef.current) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} const d=root.querySelector(".pm-root"); if (d&&SNAP.includes(kf.t)) snapshotsRef.current.set(kf.t,d.innerHTML); } lastAppliedRef.current=t; setCurrentTime(t); }, TK); return ()=>{ if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, isPlaying]);
  useEffect(()=>()=>{ if (timerRef.current) clearInterval(timerRef.current); }, []);
  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => { const r=e.currentTarget.getBoundingClientRect(); const t=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*TOTAL_DURATION; if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } setIsPlaying(false); const root=containerRef.current; if (!root) return; root.innerHTML=initialHtmlRef.current; snapshotsRef.current.clear(); lastAppliedRef.current=-1; void root.offsetHeight; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current=t; const d=root.querySelector(".pm-root"); if (d) snapshotsRef.current.set(0,d.innerHTML); setCurrentTime(t); }, [makeCtx]);
  const skip = useCallback((d: number) => { const t=Math.max(0,Math.min(TOTAL_DURATION,currentTime+d)); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } setIsPlaying(false); const root=containerRef.current; if (!root) return; root.innerHTML=initialHtmlRef.current; lastAppliedRef.current=-1; void root.offsetHeight; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current=t; setCurrentTime(t); }, [currentTime, makeCtx]);
  const fmt = (s: number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;
  const scenes = [{t:0,label:"Intro"},{t:3.5,label:"Lien"},{t:9.5,label:"Checkout"},{t:15,label:"Paiement"},{t:20,label:"Résumé"},{t:26,label:"Résultat"}];
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
                  <div style={{width:"14%",background:"#FFF",borderRight:"1px solid #E8E5F0",padding:6}}><div style={{fontSize:10,fontWeight:800,background:"linear-gradient(135deg,#7C5CFF,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:10}}>Jestly</div>{["Dashboard","Clients","Paiements","Commandes"].map((l,i)=>(<div key={l} style={{padding:"3px 5px",borderRadius:3,fontSize:7,marginBottom:2,background:i===2?"#ECFDF5":"transparent",color:i===2?"#10B981":"#6B7280",fontWeight:i===2?600:400}}>{l}</div>))}</div>
                  <div style={{flex:1,background:"#F1EFF7",padding:8}}><div style={{display:"flex",gap:4,marginBottom:6}}>{["Encaissé","En attente","Ce mois"].map(l=>(<div key={l} style={{flex:1,background:"#FFF",border:"1px solid #E8E5F0",borderRadius:5,padding:4}}><div style={{fontSize:5,color:"#9CA3AF"}}>{l}</div><div style={{width:"50%",height:4,background:"#F0EDF7",borderRadius:2,marginTop:2}} /></div>))}</div><div style={{background:"#FFF",border:"1px solid #E8E5F0",borderRadius:7,padding:5}}>{[0,1,2].map(i=>(<div key={i} style={{display:"flex",gap:4,padding:"3px 0",borderBottom:"1px solid #F0EDF7"}}><div style={{width:"30%",height:3,background:"#F0EDF7",borderRadius:2}} /><div style={{width:"20%",height:3,background:"#F5F3FA",borderRadius:2}} /><div style={{width:20,height:8,background:i===0?"rgba(16,185,129,0.08)":"#F5F3FA",borderRadius:3}} /><div style={{width:"15%",height:3,background:"#F0EDF7",borderRadius:2,marginLeft:"auto"}} /></div>))}</div></div>
                  <div style={{width:"16%",background:"#FFF",borderLeft:"1px solid #E8E5F0",padding:5}}><div style={{fontSize:6,fontWeight:600,color:"#9CA3AF",marginBottom:4}}>Checkout</div>{[0,1,2].map(i=>(<div key={i} style={{marginBottom:4}}><div style={{width:"40%",height:3,background:"#F0EDF7",borderRadius:2,marginBottom:2}} /><div style={{height:10,background:"#FAFAFE",border:"1px solid #E8E5F0",borderRadius:3}} /></div>))}</div>
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
   PAIEMENTS DEMO HTML
   DA tokens: Shell #F8F7FC, Canvas #F1EFF7, Border #E8E5F0,
   Sidebar 170px, Inspector 190px, Toolbar 34px, Accent #7C5CFF
   Layout:
   - 3 KPI cards (Encaissé, En attente, Ce mois)
   - Payment list: client, objet, montant, status badge
   - Inspector: payment detail + checkout preview
   ═══════════════════════════════════════════════════════════ */

const HTML = `
<style>
  .pm-root{width:100%;height:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;background:#0F0E17;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
  .pm-root *,.pm-root *::before,.pm-root *::after{margin:0;padding:0;box-sizing:border-box}
  .pm-shell{width:100%;height:100%;background:#F8F7FC;overflow:hidden;position:relative;opacity:0;transform:scale(0.96);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1),opacity 0.4s ease}
  .pm-shell.vis{opacity:1;transform:scale(1)}
  .pm-bar{height:28px;background:#FAFAFE;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;padding:0 10px;gap:6px}
  .pm-bardot{width:8px;height:8px;border-radius:50%}
  .pm-barurl{flex:1;margin-left:8px;height:17px;background:#F3F2F8;border-radius:4px;display:flex;align-items:center;padding:0 8px;font-size:9px;color:#9CA3AF}
  .pm-builder{display:flex;height:calc(100% - 28px);position:relative}
  .pm-toolbar{position:absolute;top:0;left:0;right:0;height:34px;background:#FFF;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;justify-content:space-between;padding:0 12px;z-index:20}
  .pm-logo{font-size:11px;font-weight:800;background:linear-gradient(135deg,#7C5CFF,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .pm-divider{width:1px;height:16px;background:#E8E5F0;margin:0 8px}
  .pm-pagename{font-size:9px;color:#6B7280;padding:2px 7px;background:#F5F3FA;border-radius:4px}
  .pm-tbl{display:flex;align-items:center;gap:6px}
  .pm-addbtn{padding:4px 12px;background:#10B981;color:#fff;border:none;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer}
  .pm-side{width:170px;background:#FFF;border-right:1px solid #E8E5F0;margin-top:34px;overflow:hidden;padding:8px}
  .pm-stitle{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#9CA3AF;margin-bottom:6px;margin-top:6px}
  .pm-sitem{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:4px;font-size:10px;color:#1A1A2E}
  .pm-sitem.act{background:#ECFDF5;color:#10B981;font-weight:600}
  .pm-sicon{width:14px;height:14px;border-radius:3px;background:#F0EDF7;display:flex;align-items:center;justify-content:center;font-size:7px;color:#9CA3AF}
  .pm-sitem.act .pm-sicon{background:rgba(16,185,129,0.15);color:#10B981}
  .pm-canvas{flex:1;margin-top:34px;background:#F1EFF7;overflow:hidden;padding:10px;display:flex;flex-direction:column;gap:8px}

  /* KPIs */
  .pm-kpis{display:flex;gap:5px;opacity:0;transform:translateY(6px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .pm-kpis.vis{opacity:1;transform:translateY(0)}
  .pm-kpi{flex:1;padding:6px 8px;background:#FFF;border:1px solid #E8E5F0;border-radius:7px}
  .pm-kpi-label{font-size:6px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px}
  .pm-kpi-val{font-size:10px;font-weight:700;color:#1A1A2E;transition:all 0.4s}
  .pm-kpi-sub{font-size:5.5px;color:#9CA3AF;margin-top:1px}

  /* Link cards area */
  .pm-linkcards{display:flex;gap:5px;flex-wrap:wrap}
  .pm-linkcard{display:flex;align-items:center;gap:6px;padding:5px 8px;background:#FFF;border:1px solid #E8E5F0;border-radius:6px;font-size:8px;flex:1;min-width:140px}
  .pm-linkcard.entering{animation:pm-fadeIn 0.4s cubic-bezier(0.22,1,0.36,1)}
  .pm-linkicon{font-size:10px}
  .pm-linkinfo{flex:1;min-width:0}
  .pm-linkname{font-size:8px;font-weight:600;color:#1A1A2E;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .pm-linkclient{font-size:6.5px;color:#9CA3AF}
  .pm-linkbadge{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:4px;font-size:6px;font-weight:600;border:1px solid;white-space:nowrap}
  .pm-linkcopy{padding:2px 6px;border:1px solid #E8E5F0;border-radius:3px;font-size:6px;color:#6B7280;cursor:pointer;white-space:nowrap;transition:all 0.3s}
  .pm-linkcopy.copied{background:#ECFDF5;border-color:#A7F3D0;color:#10B981}

  /* Table */
  .pm-table{background:#FFF;border:1px solid #E8E5F0;border-radius:7px;flex:1;display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(8px);transition:all 0.5s cubic-bezier(0.22,1,0.36,1)}
  .pm-table.vis{opacity:1;transform:translateY(0)}
  .pm-thead{display:flex;padding:5px 8px;border-bottom:1px solid #E8E5F0;background:#FAFAFE}
  .pm-th{font-size:6px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px}
  .pm-tbody{flex:1;overflow:hidden}
  .pm-row{display:flex;align-items:center;padding:5px 8px;border-bottom:1px solid #F0EDF7;transition:all 0.3s}
  .pm-row:hover{background:#FAFAFF}
  .pm-row.entering{animation:pm-fadeIn 0.4s cubic-bezier(0.22,1,0.36,1)}
  @keyframes pm-fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .pm-cell{font-size:8px;color:#1A1A2E}
  .pm-cname{flex:2;font-weight:600}
  .pm-cclient{flex:1.5;color:#6B7280}
  .pm-cobjet{flex:1.5;color:#9CA3AF;font-size:7px}
  .pm-camount{flex:1;font-weight:700;text-align:right;font-variant-numeric:tabular-nums}

  /* Badges */
  .pm-badge{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:4px;font-size:6px;font-weight:600;border:1px solid}
  .pm-badge::before{content:'';width:4px;height:4px;border-radius:50%}
  .pm-b-pending{background:#EDE9FE;color:#7C3AED;border-color:#DDD6FE}.pm-b-pending::before{background:#A78BFA}
  .pm-b-sent{background:#EFF6FF;color:#2563EB;border-color:#BFDBFE}.pm-b-sent::before{background:#60A5FA}
  .pm-b-paid{background:#D1FAE5;color:#059669;border-color:#A7F3D0}.pm-b-paid::before{background:#34D399}

  /* Inspector 190px */
  .pm-insp{width:190px;background:#FFF;border-left:1px solid #E8E5F0;margin-top:34px;overflow-y:auto;opacity:0;transform:translateX(8px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .pm-insp.vis{opacity:1;transform:translateX(0)}
  .pm-tabs{display:flex;border-bottom:1px solid #E8E5F0}
  .pm-tab{flex:1;padding:7px 5px;font-size:8px;font-weight:600;text-align:center;color:#9CA3AF;border-bottom:2px solid transparent;cursor:pointer}
  .pm-tab.act{color:#10B981;border-bottom-color:#10B981}
  .pm-icont{padding:8px}
  .pm-fl{font-size:7px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px}
  .pm-fi{width:100%;padding:4px 6px;border:1px solid #E8E5F0;border-radius:4px;font-size:9px;color:#1A1A2E;background:#FAFAFE;transition:border-color 0.2s;min-height:20px}
  .pm-fi.ed{border-color:#10B981;box-shadow:0 0 0 2px rgba(16,185,129,0.1)}
  .pm-irow{display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #F0EDF7}
  .pm-irowl{font-size:7px;color:#9CA3AF}
  .pm-irowv{font-size:8px;font-weight:600;color:#1A1A2E}

  /* Inspector panels */
  .pm-ipanel{display:none;padding:8px}
  .pm-ipanel.vis{display:block}
  .pm-dsec{opacity:0;transform:translateY(6px);transition:all 0.35s cubic-bezier(0.22,1,0.36,1);margin-bottom:8px}
  .pm-dsec.vis{opacity:1;transform:translateY(0)}

  /* Checkout preview */
  .pm-checkout{background:#FAFAFE;border:1px solid #E8E5F0;border-radius:6px;padding:8px;margin-bottom:6px}
  .pm-checkout-header{font-size:9px;font-weight:700;color:#1A1A2E;margin-bottom:6px;display:flex;align-items:center;gap:4px}
  .pm-checkout-logo{width:14px;height:14px;border-radius:3px;background:linear-gradient(135deg,#7C5CFF,#A78BFA);display:flex;align-items:center;justify-content:center;font-size:6px;color:#fff;font-weight:800}
  .pm-checkout-amount{font-size:18px;font-weight:800;color:#1A1A2E;text-align:center;margin:8px 0}
  .pm-checkout-field{width:100%;padding:5px 6px;border:1px solid #E8E5F0;border-radius:4px;font-size:8px;color:#9CA3AF;background:#FFF;margin-bottom:5px}
  .pm-paybtn{width:100%;padding:6px;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;transition:all 0.4s;background:#10B981;color:#fff}
  .pm-paybtn.ld{background:#059669}
  .pm-paybtn.ok{background:#059669}
  .pm-paybtn .pm-spinner{width:10px;height:10px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;display:none}
  .pm-paybtn.ld .pm-spinner{display:block;animation:pm-spin 0.6s linear infinite}
  @keyframes pm-spin{to{transform:rotate(360deg)}}

  /* Checkout success */
  .pm-checkout-success{display:none;text-align:center;padding:8px 0}
  .pm-checkout-success.vis{display:block}
  .pm-checkout-success .pm-checkmark{width:24px;height:24px;border-radius:50%;background:#10B981;display:inline-flex;align-items:center;justify-content:center;margin-bottom:4px;transform:scale(0);transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1)}
  .pm-checkout-success.vis .pm-checkmark{transform:scale(1)}
  .pm-checkout-success .pm-success-text{font-size:8px;font-weight:600;color:#059669}

  /* Summary panel */
  .pm-score{display:flex;align-items:center;gap:8px;padding:8px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:6px;margin-bottom:8px}
  .pm-score-ring{width:32px;height:32px;border-radius:50%;border:3px solid #10B981;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#10B981}
  .pm-score-label{font-size:7px;color:#6B7280}
  .pm-score-title{font-size:9px;font-weight:700;color:#1A1A2E}
  .pm-hbar{display:flex;align-items:center;gap:4px;margin-bottom:4px}
  .pm-hbar-label{font-size:6px;color:#9CA3AF;width:40px}
  .pm-hbar-track{flex:1;height:4px;background:#F0EDF7;border-radius:2px;overflow:hidden}
  .pm-hbar-fill{height:100%;border-radius:2px;transition:width 0.5s}

  /* Modal */
  .pm-modalbg{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.85);backdrop-filter:blur(4px);z-index:40;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s}
  .pm-modalbg.open{opacity:1;pointer-events:all}
  .pm-modal{width:260px;background:#FFF;border-radius:8px;padding:14px;box-shadow:0 12px 40px rgba(0,0,0,0.1);border:1px solid #E8E5F0;transform:translateY(8px) scale(0.97);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1)}
  .pm-modalbg.open .pm-modal{transform:translateY(0) scale(1)}
  .pm-mt{font-size:11px;font-weight:700;color:#1A1A2E;margin-bottom:2px}
  .pm-ms{font-size:8px;color:#9CA3AF;margin-bottom:8px}
  .pm-fg{margin-bottom:6px}
  .pm-mbtn{width:100%;padding:5px;background:#10B981;color:#fff;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;margin-top:4px}

  /* Overlay */
  .pm-overlay{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.95);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:50;opacity:0;pointer-events:none;transition:opacity 0.5s}
  .pm-overlay.vis{opacity:1;pointer-events:all}
  .pm-okicon{width:42px;height:42px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center;margin-bottom:12px;transform:scale(0);transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1)}
  .pm-overlay.vis .pm-okicon{transform:scale(1)}
  .pm-okt{font-size:16px;font-weight:700;color:#1A1A2E;margin-bottom:4px}
  .pm-oku{font-size:10px;color:#10B981;background:#ECFDF5;padding:4px 12px;border-radius:14px;font-weight:500}

  /* Cursor */
  .pm-cur{position:absolute;width:14px;height:17px;z-index:100;pointer-events:none;opacity:0;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.2));transition:opacity 0.3s}
  .pm-cur.vis{opacity:1}
  .pm-click{position:absolute;width:18px;height:18px;border-radius:50%;background:rgba(16,185,129,0.3);transform:translate(-2px,-1px) scale(0);pointer-events:none;z-index:99}
  .pm-click.pop{animation:pm-pop 0.35s ease-out forwards}
  @keyframes pm-pop{0%{transform:translate(-2px,-1px) scale(0);opacity:1}100%{transform:translate(-2px,-1px) scale(2);opacity:0}}
</style>

<div class="pm-root">
<div class="pm-shell" data-el="shell">
  <div class="pm-bar"><div class="pm-bardot" style="background:#FF6159"></div><div class="pm-bardot" style="background:#FFBF2F"></div><div class="pm-bardot" style="background:#2ACB42"></div><div class="pm-barurl"><span style="margin-right:3px">🔒</span>app.jestly.fr/paiements</div></div>
  <div class="pm-builder">
    <div class="pm-toolbar">
      <div class="pm-tbl"><span class="pm-logo">Jestly</span><div class="pm-divider"></div><span class="pm-pagename" data-el="pageTitle">Paiements</span></div>
      <div class="pm-tbl"><button class="pm-addbtn" data-el="addBtn">+ Créer un lien</button></div>
    </div>
    <div class="pm-side">
      <div class="pm-stitle">Navigation</div>
      <div class="pm-sitem"><div class="pm-sicon">⌂</div>Dashboard</div>
      <div class="pm-sitem"><div class="pm-sicon">♦</div>Clients</div>
      <div class="pm-sitem"><div class="pm-sicon">☰</div>Commandes</div>
      <div class="pm-sitem"><div class="pm-sicon">✎</div>Facturation</div>
      <div class="pm-sitem act"><div class="pm-sicon">◈</div>Paiements</div>
      <div class="pm-sitem"><div class="pm-sicon">◆</div>Analytics</div>
    </div>
    <div class="pm-canvas">
      <!-- KPIs (3 cards) -->
      <div class="pm-kpis" data-el="kpis">
        <div class="pm-kpi" style="background:#FAFAFF;border-color:#E8E5F5"><div class="pm-kpi-label" style="color:#10B981">Encaissé</div><div class="pm-kpi-val" style="color:#059669" data-el="kpiEncaisse">8 650 €</div><div class="pm-kpi-sub">total encaissé</div></div>
        <div class="pm-kpi"><div class="pm-kpi-label">En attente</div><div class="pm-kpi-val" data-el="kpiAttente">4 500 €</div><div class="pm-kpi-sub">3 liens actifs</div></div>
        <div class="pm-kpi"><div class="pm-kpi-label">Ce mois</div><div class="pm-kpi-val" data-el="kpiMois">3 200 €</div><div class="pm-kpi-sub">mars 2026</div></div>
      </div>
      <!-- Link cards -->
      <div class="pm-linkcards" data-el="linkcards"></div>
      <!-- Payment table -->
      <div class="pm-table" data-el="table">
        <div class="pm-thead">
          <div class="pm-th" style="flex:2">Client</div>
          <div class="pm-th" style="flex:1.5">Objet</div>
          <div class="pm-th" style="flex:1">Statut</div>
          <div class="pm-th" style="flex:1;text-align:right">Montant</div>
        </div>
        <div class="pm-tbody" data-el="tbody">
          <div class="pm-row" data-el="rowPending"><div class="pm-cell pm-cname">Thomas Durand</div><div class="pm-cell pm-cobjet">Montage vidéo</div><div class="pm-cell"><span class="pm-badge pm-b-pending">En attente</span></div><div class="pm-cell pm-camount">4 500 €</div></div>
          <div class="pm-row"><div class="pm-cell pm-cname">Claire Dupont</div><div class="pm-cell pm-cobjet">Branding</div><div class="pm-cell"><span class="pm-badge pm-b-sent">Envoyé</span></div><div class="pm-cell pm-camount">3 800 €</div></div>
          <div class="pm-row"><div class="pm-cell pm-cname">Amélie Leroy</div><div class="pm-cell pm-cobjet">Logo</div><div class="pm-cell"><span class="pm-badge pm-b-paid">Payé</span></div><div class="pm-cell pm-camount">1 800 €</div></div>
          <div class="pm-row"><div class="pm-cell pm-cname">Marc Laurent</div><div class="pm-cell pm-cobjet">Motion design</div><div class="pm-cell"><span class="pm-badge pm-b-paid">Payé</span></div><div class="pm-cell pm-camount">2 400 €</div></div>
        </div>
      </div>
    </div>

    <!-- Inspector 190px -->
    <div class="pm-insp" data-el="insp">
      <div class="pm-tabs"><div class="pm-tab act" data-el="tabApercu">Aperçu</div><div class="pm-tab" data-el="tabSuivi">Suivi</div></div>
      <!-- Default -->
      <div class="pm-icont" data-el="inspDefault">
        <div class="pm-fl" style="margin-bottom:6px">Résumé</div>
        <div style="margin-bottom:8px">
          <div class="pm-irow"><span class="pm-irowl">Liens actifs</span><span class="pm-irowv">3</span></div>
          <div class="pm-irow"><span class="pm-irowl">Taux conversion</span><span class="pm-irowv">68 %</span></div>
          <div class="pm-irow"><span class="pm-irowl">Délai moyen</span><span class="pm-irowv">2,4 j</span></div>
          <div class="pm-irow"><span class="pm-irowl">Ce mois</span><span class="pm-irowv">3 200 €</span></div>
        </div>
        <div class="pm-fl" style="margin-bottom:6px">Dernière activité</div>
        <div style="padding:5px 6px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:4px;font-size:8px;color:#6B7280;line-height:1.4">Paiement reçu de Marc L. — 2 400 €</div>
      </div>
      <!-- Checkout preview panel -->
      <div class="pm-ipanel" data-el="inspCheckout">
        <div class="pm-dsec" data-el="checkoutHead">
          <div class="pm-fl" style="margin-bottom:4px">Aperçu checkout</div>
        </div>
        <div class="pm-dsec" data-el="checkoutForm">
          <div class="pm-checkout">
            <div class="pm-checkout-header"><div class="pm-checkout-logo">J</div>Checkout Jestly</div>
            <div class="pm-checkout-amount">2 500,00 €</div>
            <div class="pm-fl">Objet</div>
            <div style="font-size:8px;color:#1A1A2E;margin-bottom:6px;font-weight:500">Refonte identité visuelle</div>
          </div>
        </div>
        <div class="pm-dsec" data-el="checkoutCard">
          <div class="pm-checkout-field">•••• •••• •••• 4242</div>
          <div style="display:flex;gap:4px">
            <div class="pm-checkout-field" style="flex:1">12 / 28</div>
            <div class="pm-checkout-field" style="flex:1">•••</div>
          </div>
        </div>
        <div class="pm-dsec" data-el="checkoutBtn">
          <button class="pm-paybtn" data-el="payBtn"><span class="pm-spinner"></span><span data-el="payLabel">Payer 2 500 €</span></button>
        </div>
        <div class="pm-checkout-success" data-el="checkoutSuccess">
          <div class="pm-checkmark"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M5 13l4 4L19 7"/></svg></div>
          <div class="pm-success-text">Paiement confirmé !</div>
        </div>
      </div>
      <!-- Summary panel -->
      <div class="pm-ipanel" data-el="inspSummary">
        <div class="pm-dsec" data-el="summaryKpis">
          <div class="pm-score"><div class="pm-score-ring">92</div><div><div class="pm-score-title">Excellent</div><div class="pm-score-label">Score paiements</div></div></div>
        </div>
        <div class="pm-dsec" data-el="summaryBars">
          <div class="pm-fl">Répartition</div>
          <div class="pm-hbar"><span class="pm-hbar-label">Payés</span><div class="pm-hbar-track"><div class="pm-hbar-fill" style="width:75%;background:#10B981"></div></div></div>
          <div class="pm-hbar"><span class="pm-hbar-label">En attente</span><div class="pm-hbar-track"><div class="pm-hbar-fill" style="width:20%;background:#7C5CFF"></div></div></div>
          <div class="pm-hbar"><span class="pm-hbar-label">Envoyés</span><div class="pm-hbar-track"><div class="pm-hbar-fill" style="width:15%;background:#60A5FA"></div></div></div>
        </div>
        <div class="pm-dsec" data-el="summaryRecent">
          <div class="pm-fl">Ce mois</div>
          <div class="pm-irow"><span class="pm-irowl">Encaissé</span><span class="pm-irowv" style="color:#10B981">11 150 €</span></div>
          <div class="pm-irow"><span class="pm-irowl">En attente</span><span class="pm-irowv" style="color:#7C3AED">2 000 €</span></div>
          <div class="pm-irow"><span class="pm-irowl">Score</span><span class="pm-irowv" style="color:#10B981">92/100</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div class="pm-modalbg" data-el="modal">
    <div class="pm-modal">
      <div class="pm-mt">Créer un lien de paiement</div>
      <div class="pm-ms">Envoyez un lien sécurisé à votre client.</div>
      <div class="pm-fg"><div class="pm-fl">Client</div><div class="pm-fi" data-el="fClient"></div></div>
      <div class="pm-fg"><div class="pm-fl">Objet</div><div class="pm-fi" data-el="fObjet"></div></div>
      <div class="pm-fg"><div class="pm-fl">Montant</div><div class="pm-fi" data-el="fAmount"></div></div>
      <button class="pm-mbtn" data-el="modalSubmit">Générer le lien</button>
    </div>
  </div>

  <!-- Overlay -->
  <div class="pm-overlay" data-el="overlay"><div class="pm-okicon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M5 13l4 4L19 7"/></svg></div><div class="pm-okt">Paiement reçu !</div><div style="height:6px"></div><div class="pm-oku">2 500 € encaissé · Expérience fluide</div></div>

  <!-- Cursor -->
  <div class="pm-cur" data-el="cur"><svg viewBox="0 0 24 24" fill="none" width="14" height="17"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="#1A1A2E" stroke-width="1.5" stroke-linejoin="round"/></svg><div class="pm-click" data-el="clk"></div></div>
</div>
</div>`;
