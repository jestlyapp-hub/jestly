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
   TIMELINE — Facturation demo
   Scene 1: Intro (0→3.5s) — shell + KPIs + table
   Scene 2: Create quote (3.5→9.5s) — modal + fill + submit
   Scene 3: Status flow (9.5→14.5s) — Brouillon → Envoyé → Facturé
   Scene 4: Payment (14.5→20s) — En attente → relance → Payé
   Scene 5: Financial health (20→26s) — inspector summary
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

  // ── SCENE 2: CREATE QUOTE ──
  k(3.5, ctx => { ctx.cursorTo("addBtn"); });
  k(4.0, ctx => { ctx.clickAt(); ctx.q("modal").classList.add("open"); });
  k(4.8, ctx => { ctx.cursorTo("fClient"); });
  k(5.0, ctx => { ctx.clickAt(); ctx.q("fClient").classList.add("ed"); ctx.q("fClient").textContent = "Emma Rousseau"; ctx.q("fClient").classList.remove("ed"); });
  k(5.4, ctx => { ctx.cursorTo("fPresta"); });
  k(5.6, ctx => { ctx.clickAt(); ctx.q("fPresta").classList.add("ed"); ctx.q("fPresta").textContent = "Refonte identité visuelle"; ctx.q("fPresta").classList.remove("ed"); });
  k(6.0, ctx => { ctx.cursorTo("fAmount"); });
  k(6.2, ctx => { ctx.clickAt(); ctx.q("fAmount").classList.add("ed"); ctx.q("fAmount").textContent = "2 500,00 €"; ctx.q("fAmount").classList.remove("ed"); });
  k(6.6, ctx => { ctx.cursorTo("fDate"); });
  k(6.8, ctx => { ctx.clickAt(); ctx.q("fDate").classList.add("ed"); ctx.q("fDate").textContent = "31 mars 2026"; ctx.q("fDate").classList.remove("ed"); });
  k(7.3, ctx => { ctx.cursorTo("modalSubmit"); });
  k(7.7, ctx => {
    ctx.clickAt(); ctx.q("modal").classList.remove("open");
    // Add row to table
    const row = document.createElement("div");
    row.className = "f-row entering"; row.setAttribute("data-el", "rowNew");
    row.innerHTML = '<div class="f-cell f-cname">Refonte identité visuelle</div><div class="f-cell f-cclient">Emma Rousseau</div><div class="f-cell"><span class="f-badge f-b-draft">Brouillon</span></div><div class="f-cell f-camount">2 500,00 €</div><div class="f-cell f-cdate">31 mars</div>';
    ctx.q("tbody").prepend(row);
  });

  // ── SCENE 3: STATUS FLOW ──
  k(9.5, ctx => { ctx.cursorTo("rowNew"); });
  k(10.0, ctx => {
    ctx.clickAt();
    const badge = ctx.q("rowNew").querySelector(".f-badge") as HTMLElement;
    if (badge) { badge.className = "f-badge f-b-sent"; badge.textContent = "Envoyé"; }
  });
  k(11.0, ctx => {
    // Select existing row and convert to invoice
    ctx.cursorTo("rowPropo");
  });
  k(11.5, ctx => {
    ctx.clickAt();
    // Show convert action in inspector
    ctx.q("inspDefault").style.display = "none";
    ctx.q("inspConvert").classList.add("vis");
  });
  k(12.2, ctx => { ctx.q("convertHead").classList.add("vis"); });
  k(12.6, ctx => { ctx.q("convertFields").classList.add("vis"); });
  k(13.0, ctx => { ctx.cursorTo("convertBtn"); });
  k(13.4, ctx => {
    ctx.clickAt();
    ctx.q("convertBtn").classList.add("ld");
    ctx.q("convertLabel").textContent = "Conversion...";
  });
  k(14.0, ctx => {
    ctx.q("convertBtn").classList.remove("ld"); ctx.q("convertBtn").classList.add("ok");
    ctx.q("convertLabel").textContent = "✓ Facture créée";
    // Update row badge
    const badge = ctx.q("rowPropo").querySelector(".f-badge") as HTMLElement;
    if (badge) { badge.className = "f-badge f-b-invoiced"; badge.textContent = "Facturée"; }
    ctx.q("kpiInvoiced").textContent = "4 200 €";
  });

  // ── SCENE 4: PAYMENT ──
  k(14.5, ctx => {
    ctx.q("inspConvert").classList.remove("vis");
    ctx.q("inspDefault").style.display = "";
  });
  k(15.2, ctx => { ctx.cursorTo("rowPending"); });
  k(15.7, ctx => {
    ctx.clickAt();
    ctx.q("inspDefault").style.display = "none";
    ctx.q("inspPay").classList.add("vis");
  });
  k(16.2, ctx => { ctx.q("payHead").classList.add("vis"); });
  k(16.6, ctx => { ctx.q("payRelance").classList.add("vis"); });
  // Click relance
  k(17.2, ctx => { ctx.cursorTo("relanceBtn"); });
  k(17.5, ctx => {
    ctx.clickAt();
    ctx.q("relanceBtn").classList.add("sent");
    ctx.q("relanceLabel").textContent = "✓ Relance envoyée";
  });
  // Mark as paid
  k(18.2, ctx => { ctx.cursorTo("payBtn"); });
  k(18.6, ctx => {
    ctx.clickAt(); ctx.q("payBtn").classList.add("ok");
    ctx.q("payLabel").textContent = "✓ Payée";
    const badge = ctx.q("rowPending").querySelector(".f-badge") as HTMLElement;
    if (badge) { badge.className = "f-badge f-b-paid"; badge.textContent = "Payée"; }
    ctx.q("kpiPaid").textContent = "12 850 €";
  });

  // ── SCENE 5: FINANCIAL HEALTH ──
  k(20.0, ctx => {
    ctx.q("inspPay").classList.remove("vis");
    ctx.q("inspDefault").style.display = "";
    // Switch to health tab
    ctx.q("tabHealth").classList.add("act");
    ctx.q("tabApercu").classList.remove("act");
    ctx.q("inspDefault").style.display = "none";
    ctx.q("inspHealth").classList.add("vis");
  });
  k(20.6, ctx => { ctx.q("healthScore").classList.add("vis"); });
  k(21.2, ctx => { ctx.q("healthBars").classList.add("vis"); });
  k(21.8, ctx => { ctx.q("healthRecent").classList.add("vis"); });

  // ── SCENE 6: OUTRO ──
  k(26.0, ctx => { ctx.q("overlay").classList.add("vis"); });
  k(31.0, ctx => { ctx.q("cur").classList.remove("vis"); });

  return K.sort((a, b) => a.t - b.t);
}

/* ═══════════════════════════════════════════════════════════
   REACT COMPONENT — identical engine
   ═══════════════════════════════════════════════════════════ */

export default function FacturationDemoPlayer({ label = "Voir la facturation en action", accentColor = "#22c55e" }: Props) {
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
  const seekTo = useCallback((t: number) => { const root = containerRef.current; if (!root) return; const sn = [...snapshotsRef.current.keys()].sort((a,b)=>a-b); let rf = -1; for (const st of sn) { if (st<=t) rf=st; else break; } if (rf>=0&&snapshotsRef.current.has(rf)) { const d = root.querySelector(".f-root"); if (d) d.innerHTML = snapshotsRef.current.get(rf)!; } else { root.innerHTML = initialHtmlRef.current; rf = -1; } void root.offsetHeight; const ctx = makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=rf) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current = t; setCurrentTime(t); }, [makeCtx]);
  const initialize = useCallback(() => { const root = containerRef.current; if (!root) return; root.innerHTML = HTML; initialHtmlRef.current = HTML; timelineRef.current = buildTimeline(); snapshotsRef.current.clear(); lastAppliedRef.current = -1; void root.offsetHeight; const ctx = makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>0) break; try{kf.apply(ctx);}catch{} } const d = root.querySelector(".f-root"); if (d) snapshotsRef.current.set(0, d.innerHTML); }, [makeCtx]);
  const togglePlay = useCallback(() => { if (isPlaying) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; setIsPlaying(false); return; } let t = currentTime>=TOTAL_DURATION-0.5?0:currentTime; if (t===0) seekTo(0); setIsPlaying(true); const TK=100; timerRef.current = setInterval(()=>{ t+=TK/1000; if (t>=TOTAL_DURATION) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current=null; setIsPlaying(false); setCurrentTime(TOTAL_DURATION); return; } const root=containerRef.current; if (!root) return; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=lastAppliedRef.current) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} const d=root.querySelector(".f-root"); if (d&&SNAP.includes(kf.t)) snapshotsRef.current.set(kf.t,d.innerHTML); } lastAppliedRef.current=t; setCurrentTime(t); }, TK); }, [isPlaying, currentTime, seekTo, makeCtx, SNAP]);
  const handleStart = useCallback(() => { setStarted(true); setShowControls(true); setTimeout(()=>{ initialize(); setTimeout(()=>{ seekTo(0); setCurrentTime(0); setIsPlaying(true); }, 200); }, 100); }, [initialize, seekTo]);
  useEffect(() => { if (!started||!isPlaying||timerRef.current) return; let t=currentTime; const TK=100; timerRef.current=setInterval(()=>{ t+=TK/1000; if (t>=TOTAL_DURATION) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current=null; setIsPlaying(false); setCurrentTime(TOTAL_DURATION); return; } const root=containerRef.current; if (!root) return; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=lastAppliedRef.current) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} const d=root.querySelector(".f-root"); if (d&&SNAP.includes(kf.t)) snapshotsRef.current.set(kf.t,d.innerHTML); } lastAppliedRef.current=t; setCurrentTime(t); }, TK); return ()=>{ if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, isPlaying]);
  useEffect(()=>()=>{ if (timerRef.current) clearInterval(timerRef.current); }, []);
  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => { const r=e.currentTarget.getBoundingClientRect(); const t=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*TOTAL_DURATION; if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } setIsPlaying(false); const root=containerRef.current; if (!root) return; root.innerHTML=initialHtmlRef.current; snapshotsRef.current.clear(); lastAppliedRef.current=-1; void root.offsetHeight; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current=t; const d=root.querySelector(".f-root"); if (d) snapshotsRef.current.set(0,d.innerHTML); setCurrentTime(t); }, [makeCtx]);
  const skip = useCallback((d: number) => { const t=Math.max(0,Math.min(TOTAL_DURATION,currentTime+d)); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } setIsPlaying(false); const root=containerRef.current; if (!root) return; root.innerHTML=initialHtmlRef.current; lastAppliedRef.current=-1; void root.offsetHeight; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current=t; setCurrentTime(t); }, [currentTime, makeCtx]);
  const fmt = (s: number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;
  const scenes = [{t:0,label:"Intro"},{t:3.5,label:"Devis"},{t:9.5,label:"Statuts"},{t:14.5,label:"Paiement"},{t:20,label:"Santé"},{t:26,label:"Résultat"}];
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
                  <div style={{width:"14%",background:"#FFF",borderRight:"1px solid #E8E5F0",padding:6}}><div style={{fontSize:10,fontWeight:800,background:"linear-gradient(135deg,#7C5CFF,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:10}}>Jestly</div>{["Dashboard","Clients","Facturation","Commandes"].map((l,i)=>(<div key={l} style={{padding:"3px 5px",borderRadius:3,fontSize:7,marginBottom:2,background:i===2?"#EDE9FE":"transparent",color:i===2?"#7C5CFF":"#6B7280",fontWeight:i===2?600:400}}>{l}</div>))}</div>
                  <div style={{flex:1,background:"#F1EFF7",padding:8}}><div style={{display:"flex",gap:4,marginBottom:6}}>{["CA total","En cours","Prêtes","Facturées","Payées"].map(l=>(<div key={l} style={{flex:1,background:"#FFF",border:"1px solid #E8E5F0",borderRadius:5,padding:4}}><div style={{fontSize:5,color:"#9CA3AF"}}>{l}</div><div style={{width:"50%",height:4,background:"#F0EDF7",borderRadius:2,marginTop:2}} /></div>))}</div><div style={{background:"#FFF",border:"1px solid #E8E5F0",borderRadius:7,padding:5}}>{[0,1,2].map(i=>(<div key={i} style={{display:"flex",gap:4,padding:"3px 0",borderBottom:"1px solid #F0EDF7"}}><div style={{width:"30%",height:3,background:"#F0EDF7",borderRadius:2}} /><div style={{width:"20%",height:3,background:"#F5F3FA",borderRadius:2}} /><div style={{width:20,height:8,background:i===0?"rgba(124,92,255,0.08)":"#F5F3FA",borderRadius:3}} /><div style={{width:"15%",height:3,background:"#F0EDF7",borderRadius:2,marginLeft:"auto"}} /></div>))}</div></div>
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
   FACTURATION DEMO HTML
   DA tokens: Shell #F8F7FC, Canvas #F1EFF7, Border #E8E5F0,
   Sidebar 170px, Inspector 190px, Toolbar 34px, Accent #7C5CFF
   Mirrors real facturation/page.tsx layout:
   - 5 KPI cards (CA total, En cours, Prêtes, Facturées, Payées)
   - Table with columns: Commande, Client, Statut, Montant, Échéance
   - Status badges: Brouillon, Envoyé, Facturée, Payée
   ═══════════════════════════════════════════════════════════ */

const HTML = `
<style>
  .f-root{width:100%;height:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;background:#0F0E17;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
  .f-root *,.f-root *::before,.f-root *::after{margin:0;padding:0;box-sizing:border-box}
  .f-shell{width:100%;height:100%;background:#F8F7FC;overflow:hidden;position:relative;opacity:0;transform:scale(0.96);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1),opacity 0.4s ease}
  .f-shell.vis{opacity:1;transform:scale(1)}
  .f-bar{height:28px;background:#FAFAFE;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;padding:0 10px;gap:6px}
  .f-bardot{width:8px;height:8px;border-radius:50%}
  .f-barurl{flex:1;margin-left:8px;height:17px;background:#F3F2F8;border-radius:4px;display:flex;align-items:center;padding:0 8px;font-size:9px;color:#9CA3AF}
  .f-builder{display:flex;height:calc(100% - 28px);position:relative}
  .f-toolbar{position:absolute;top:0;left:0;right:0;height:34px;background:#FFF;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;justify-content:space-between;padding:0 12px;z-index:20}
  .f-logo{font-size:11px;font-weight:800;background:linear-gradient(135deg,#7C5CFF,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .f-divider{width:1px;height:16px;background:#E8E5F0;margin:0 8px}
  .f-pagename{font-size:9px;color:#6B7280;padding:2px 7px;background:#F5F3FA;border-radius:4px}
  .f-tbl{display:flex;align-items:center;gap:6px}
  .f-addbtn{padding:4px 12px;background:#7C5CFF;color:#fff;border:none;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer}
  .f-side{width:170px;background:#FFF;border-right:1px solid #E8E5F0;margin-top:34px;overflow:hidden;padding:8px}
  .f-stitle{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#9CA3AF;margin-bottom:6px;margin-top:6px}
  .f-sitem{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:4px;font-size:10px;color:#1A1A2E}
  .f-sitem.act{background:#EDE9FE;color:#7C5CFF;font-weight:600}
  .f-sicon{width:14px;height:14px;border-radius:3px;background:#F0EDF7;display:flex;align-items:center;justify-content:center;font-size:7px;color:#9CA3AF}
  .f-sitem.act .f-sicon{background:rgba(124,92,255,0.15);color:#7C5CFF}
  .f-canvas{flex:1;margin-top:34px;background:#F1EFF7;overflow:hidden;padding:10px;display:flex;flex-direction:column;gap:8px}

  /* KPIs — mirrors real 5-card layout */
  .f-kpis{display:flex;gap:5px;opacity:0;transform:translateY(6px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .f-kpis.vis{opacity:1;transform:translateY(0)}
  .f-kpi{flex:1;padding:6px 8px;background:#FFF;border:1px solid #E8E5F0;border-radius:7px}
  .f-kpi-label{font-size:6px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px}
  .f-kpi-val{font-size:10px;font-weight:700;color:#1A1A2E}
  .f-kpi-sub{font-size:5.5px;color:#9CA3AF;margin-top:1px}

  /* Table */
  .f-table{background:#FFF;border:1px solid #E8E5F0;border-radius:7px;flex:1;display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(8px);transition:all 0.5s cubic-bezier(0.22,1,0.36,1)}
  .f-table.vis{opacity:1;transform:translateY(0)}
  .f-thead{display:flex;padding:5px 8px;border-bottom:1px solid #E8E5F0;background:#FAFAFE}
  .f-th{font-size:6px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px}
  .f-tbody{flex:1;overflow:hidden}
  .f-row{display:flex;align-items:center;padding:5px 8px;border-bottom:1px solid #F0EDF7;transition:all 0.3s}
  .f-row:hover{background:#FAFAFF}
  .f-row.entering{animation:f-fadeIn 0.4s cubic-bezier(0.22,1,0.36,1)}
  @keyframes f-fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .f-cell{font-size:8px;color:#1A1A2E}
  .f-cname{flex:2;font-weight:600}
  .f-cclient{flex:1.5;color:#6B7280}
  .f-camount{flex:1;font-weight:700;text-align:right;font-variant-numeric:tabular-nums}
  .f-cdate{flex:1;color:#9CA3AF;text-align:right;font-size:7px}

  /* Badges — matches real billing statuses */
  .f-badge{display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:4px;font-size:6px;font-weight:600;border:1px solid}
  .f-badge::before{content:'';width:4px;height:4px;border-radius:50%}
  .f-b-draft{background:#F5F5F4;color:#78716C;border-color:#E7E5E4}.f-b-draft::before{background:#A8A29E}
  .f-b-sent{background:#EFF6FF;color:#2563EB;border-color:#BFDBFE}.f-b-sent::before{background:#60A5FA}
  .f-b-invoiced{background:#FEF3C7;color:#D97706;border-color:#FDE68A}.f-b-invoiced::before{background:#FBBF24}
  .f-b-paid{background:#D1FAE5;color:#059669;border-color:#A7F3D0}.f-b-paid::before{background:#34D399}
  .f-b-pending{background:#EDE9FE;color:#7C3AED;border-color:#DDD6FE}.f-b-pending::before{background:#A78BFA}

  /* Inspector 190px */
  .f-insp{width:190px;background:#FFF;border-left:1px solid #E8E5F0;margin-top:34px;overflow-y:auto;opacity:0;transform:translateX(8px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .f-insp.vis{opacity:1;transform:translateX(0)}
  .f-tabs{display:flex;border-bottom:1px solid #E8E5F0}
  .f-tab{flex:1;padding:7px 5px;font-size:8px;font-weight:600;text-align:center;color:#9CA3AF;border-bottom:2px solid transparent;cursor:pointer}
  .f-tab.act{color:#7C5CFF;border-bottom-color:#7C5CFF}
  .f-icont{padding:8px}
  .f-fl{font-size:7px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px}
  .f-fi{width:100%;padding:4px 6px;border:1px solid #E8E5F0;border-radius:4px;font-size:9px;color:#1A1A2E;background:#FAFAFE;transition:border-color 0.2s;min-height:20px}
  .f-fi.ed{border-color:#7C5CFF;box-shadow:0 0 0 2px rgba(124,92,255,0.1)}
  .f-irow{display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #F0EDF7}
  .f-irowl{font-size:7px;color:#9CA3AF}
  .f-irowv{font-size:8px;font-weight:600;color:#1A1A2E}

  /* Inspector panels */
  .f-ipanel{display:none;padding:8px}
  .f-ipanel.vis{display:block}
  .f-dsec{opacity:0;transform:translateY(6px);transition:all 0.35s cubic-bezier(0.22,1,0.36,1);margin-bottom:8px}
  .f-dsec.vis{opacity:1;transform:translateY(0)}
  .f-dh{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .f-davatar{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;background:#7C5CFF}
  .f-dname{font-size:11px;font-weight:700;color:#1A1A2E}
  .f-demail{font-size:7px;color:#9CA3AF}
  .f-dbadge{display:inline-block;font-size:6px;font-weight:600;padding:2px 7px;border-radius:12px;margin-top:2px}
  .f-convertbtn{width:100%;padding:6px;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;transition:all 0.4s;background:#7C5CFF;color:#fff}
  .f-convertbtn.ld{background:#5B3FD9}
  .f-convertbtn.ok{background:#10B981}
  .f-convertbtn .f-spinner{width:10px;height:10px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;display:none}
  .f-convertbtn.ld .f-spinner{display:block;animation:f-spin 0.6s linear infinite}
  @keyframes f-spin{to{transform:rotate(360deg)}}
  .f-relancebtn{width:100%;padding:5px;border:1px solid #E8E5F0;border-radius:4px;font-size:8px;font-weight:500;cursor:pointer;background:#FAFAFE;color:#6B7280;margin-bottom:4px;transition:all 0.3s}
  .f-relancebtn.sent{background:#EDE9FE;border-color:#DDD6FE;color:#7C5CFF}

  /* Health panel */
  .f-score{display:flex;align-items:center;gap:8px;padding:8px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:6px;margin-bottom:8px}
  .f-score-ring{width:32px;height:32px;border-radius:50%;border:3px solid #10B981;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#10B981}
  .f-score-label{font-size:7px;color:#6B7280}
  .f-score-title{font-size:9px;font-weight:700;color:#1A1A2E}
  .f-hbar{display:flex;align-items:center;gap:4px;margin-bottom:4px}
  .f-hbar-label{font-size:6px;color:#9CA3AF;width:40px}
  .f-hbar-track{flex:1;height:4px;background:#F0EDF7;border-radius:2px;overflow:hidden}
  .f-hbar-fill{height:100%;border-radius:2px;transition:width 0.5s}

  /* Modal */
  .f-modalbg{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.85);backdrop-filter:blur(4px);z-index:40;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s}
  .f-modalbg.open{opacity:1;pointer-events:all}
  .f-modal{width:260px;background:#FFF;border-radius:8px;padding:14px;box-shadow:0 12px 40px rgba(0,0,0,0.1);border:1px solid #E8E5F0;transform:translateY(8px) scale(0.97);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1)}
  .f-modalbg.open .f-modal{transform:translateY(0) scale(1)}
  .f-mt{font-size:11px;font-weight:700;color:#1A1A2E;margin-bottom:2px}
  .f-ms{font-size:8px;color:#9CA3AF;margin-bottom:8px}
  .f-fg{margin-bottom:6px}
  .f-mbtn{width:100%;padding:5px;background:#7C5CFF;color:#fff;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;margin-top:4px}

  /* Overlay */
  .f-overlay{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.95);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:50;opacity:0;pointer-events:none;transition:opacity 0.5s}
  .f-overlay.vis{opacity:1;pointer-events:all}
  .f-okicon{width:42px;height:42px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center;margin-bottom:12px;transform:scale(0);transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1)}
  .f-overlay.vis .f-okicon{transform:scale(1)}
  .f-okt{font-size:16px;font-weight:700;color:#1A1A2E;margin-bottom:4px}
  .f-oku{font-size:10px;color:#7C5CFF;background:#EDE9FE;padding:4px 12px;border-radius:14px;font-weight:500}

  /* Cursor */
  .f-cur{position:absolute;width:14px;height:17px;z-index:100;pointer-events:none;opacity:0;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.2));transition:opacity 0.3s}
  .f-cur.vis{opacity:1}
  .f-click{position:absolute;width:18px;height:18px;border-radius:50%;background:rgba(124,92,255,0.3);transform:translate(-2px,-1px) scale(0);pointer-events:none;z-index:99}
  .f-click.pop{animation:f-pop 0.35s ease-out forwards}
  @keyframes f-pop{0%{transform:translate(-2px,-1px) scale(0);opacity:1}100%{transform:translate(-2px,-1px) scale(2);opacity:0}}
</style>

<div class="f-root">
<div class="f-shell" data-el="shell">
  <div class="f-bar"><div class="f-bardot" style="background:#FF6159"></div><div class="f-bardot" style="background:#FFBF2F"></div><div class="f-bardot" style="background:#2ACB42"></div><div class="f-barurl"><span style="margin-right:3px">🔒</span>app.jestly.fr/facturation</div></div>
  <div class="f-builder">
    <div class="f-toolbar">
      <div class="f-tbl"><span class="f-logo">Jestly</span><div class="f-divider"></div><span class="f-pagename" data-el="pageTitle">Facturation</span></div>
      <div class="f-tbl"><button class="f-addbtn" data-el="addBtn">+ Nouveau devis</button></div>
    </div>
    <div class="f-side">
      <div class="f-stitle">Navigation</div>
      <div class="f-sitem"><div class="f-sicon">⌂</div>Dashboard</div>
      <div class="f-sitem"><div class="f-sicon">♦</div>Clients</div>
      <div class="f-sitem"><div class="f-sicon">☰</div>Commandes</div>
      <div class="f-sitem act"><div class="f-sicon">✎</div>Facturation</div>
      <div class="f-sitem"><div class="f-sicon">◆</div>Analytics</div>
    </div>
    <div class="f-canvas">
      <!-- KPIs (5 cards — matches real page) -->
      <div class="f-kpis" data-el="kpis">
        <div class="f-kpi"><div class="f-kpi-label">CA total</div><div class="f-kpi-val">24 650 €</div><div class="f-kpi-sub">42 commandes</div></div>
        <div class="f-kpi"><div class="f-kpi-label">En cours</div><div class="f-kpi-val">3 800 €</div><div class="f-kpi-sub">6 en production</div></div>
        <div class="f-kpi" style="background:#FAFAFF;border-color:#E8E5F5"><div class="f-kpi-label" style="color:#7C5CFF">Prêtes</div><div class="f-kpi-val" style="color:#6D28D9">5 200 €</div><div class="f-kpi-sub">8 à facturer</div></div>
        <div class="f-kpi"><div class="f-kpi-label">Facturées</div><div class="f-kpi-val" data-el="kpiInvoiced">3 500 €</div><div class="f-kpi-sub">en attente</div></div>
        <div class="f-kpi"><div class="f-kpi-label">Payées</div><div class="f-kpi-val" data-el="kpiPaid">12 150 €</div><div class="f-kpi-sub">encaissées</div></div>
      </div>
      <!-- Table -->
      <div class="f-table" data-el="table">
        <div class="f-thead">
          <div class="f-th" style="flex:2">Commande</div>
          <div class="f-th" style="flex:1.5">Client</div>
          <div class="f-th" style="flex:1">Statut</div>
          <div class="f-th" style="flex:1;text-align:right">Montant</div>
          <div class="f-th" style="flex:1;text-align:right">Échéance</div>
        </div>
        <div class="f-tbody" data-el="tbody">
          <div class="f-row" data-el="rowPending"><div class="f-cell f-cname">Montage vidéo promo</div><div class="f-cell f-cclient">Thomas Durand</div><div class="f-cell"><span class="f-badge f-b-pending">En attente</span></div><div class="f-cell f-camount">4 500,00 €</div><div class="f-cell f-cdate">22 mars</div></div>
          <div class="f-row" data-el="rowPropo"><div class="f-cell f-cname">Branding complet</div><div class="f-cell f-cclient">Claire Dupont</div><div class="f-cell"><span class="f-badge f-b-sent">Envoyé</span></div><div class="f-cell f-camount">3 800,00 €</div><div class="f-cell f-cdate">28 mars</div></div>
          <div class="f-row"><div class="f-cell f-cname">Logo + charte graphique</div><div class="f-cell f-cclient">Amélie Leroy</div><div class="f-cell"><span class="f-badge f-b-invoiced">Facturée</span></div><div class="f-cell f-camount">1 800,00 €</div><div class="f-cell f-cdate">15 mars</div></div>
          <div class="f-row"><div class="f-cell f-cname">Motion design pack</div><div class="f-cell f-cclient">Marc Laurent</div><div class="f-cell"><span class="f-badge f-b-paid">Payée</span></div><div class="f-cell f-camount">2 400,00 €</div><div class="f-cell f-cdate">10 mars</div></div>
          <div class="f-row"><div class="f-cell f-cname">Site vitrine</div><div class="f-cell f-cclient">Julien Petit</div><div class="f-cell"><span class="f-badge f-b-paid">Payée</span></div><div class="f-cell f-camount">3 200,00 €</div><div class="f-cell f-cdate">5 mars</div></div>
          <div class="f-row"><div class="f-cell f-cname">Illustrations x6</div><div class="f-cell f-cclient">Sophie Bernard</div><div class="f-cell"><span class="f-badge f-b-draft">Brouillon</span></div><div class="f-cell f-camount">950,00 €</div><div class="f-cell f-cdate">—</div></div>
        </div>
      </div>
    </div>

    <!-- Inspector 190px -->
    <div class="f-insp" data-el="insp">
      <div class="f-tabs"><div class="f-tab act" data-el="tabApercu">Aperçu</div><div class="f-tab" data-el="tabHealth">Santé</div></div>
      <!-- Default -->
      <div class="f-icont" data-el="inspDefault">
        <div class="f-fl" style="margin-bottom:6px">Résumé du mois</div>
        <div style="margin-bottom:8px">
          <div class="f-irow"><span class="f-irowl">Documents</span><span class="f-irowv">42</span></div>
          <div class="f-irow"><span class="f-irowl">CA encaissé</span><span class="f-irowv">12 150 €</span></div>
          <div class="f-irow"><span class="f-irowl">En attente</span><span class="f-irowv">4 500 €</span></div>
          <div class="f-irow"><span class="f-irowl">À facturer</span><span class="f-irowv">5 200 €</span></div>
        </div>
        <div class="f-fl" style="margin-bottom:6px">Dernière activité</div>
        <div style="padding:5px 6px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:4px;font-size:8px;color:#6B7280;line-height:1.4">Facture #041 envoyée à Thomas D.</div>
      </div>
      <!-- Convert panel -->
      <div class="f-ipanel" data-el="inspConvert">
        <div class="f-dsec" data-el="convertHead">
          <div class="f-dh"><div class="f-davatar">CD</div><div><div class="f-dname">Claire Dupont</div><div class="f-demail">Branding complet</div><div class="f-dbadge" style="background:#EFF6FF;color:#2563EB">Devis envoyé</div></div></div>
        </div>
        <div class="f-dsec" data-el="convertFields">
          <div class="f-fl">Montant</div>
          <div style="font-size:16px;font-weight:800;color:#1A1A2E;margin-bottom:6px">3 800,00 €</div>
          <div class="f-fl">Échéance</div>
          <div style="font-size:9px;color:#6B7280;margin-bottom:8px">28 mars 2026</div>
          <button class="f-convertbtn" data-el="convertBtn"><span class="f-spinner"></span><span data-el="convertLabel">Convertir en facture</span></button>
        </div>
      </div>
      <!-- Pay panel -->
      <div class="f-ipanel" data-el="inspPay">
        <div class="f-dsec" data-el="payHead">
          <div class="f-dh"><div class="f-davatar" style="background:#6366F1">TD</div><div><div class="f-dname">Thomas Durand</div><div class="f-demail">Montage vidéo promo</div><div class="f-dbadge" style="background:#EDE9FE;color:#7C3AED">En attente</div></div></div>
          <div style="font-size:16px;font-weight:800;color:#1A1A2E;margin:6px 0">4 500,00 €</div>
        </div>
        <div class="f-dsec" data-el="payRelance">
          <button class="f-relancebtn" data-el="relanceBtn"><span data-el="relanceLabel">Envoyer une relance</span></button>
          <button class="f-convertbtn" data-el="payBtn" style="background:#10B981"><span class="f-spinner"></span><span data-el="payLabel">Marquer payée</span></button>
        </div>
      </div>
      <!-- Health panel -->
      <div class="f-ipanel" data-el="inspHealth">
        <div class="f-dsec" data-el="healthScore">
          <div class="f-score"><div class="f-score-ring">87</div><div><div class="f-score-title">Bonne santé</div><div class="f-score-label">Score facturation</div></div></div>
        </div>
        <div class="f-dsec" data-el="healthBars">
          <div class="f-fl">Pipeline</div>
          <div class="f-hbar"><span class="f-hbar-label">Prêtes</span><div class="f-hbar-track"><div class="f-hbar-fill" style="width:65%;background:#7C5CFF"></div></div></div>
          <div class="f-hbar"><span class="f-hbar-label">Facturées</span><div class="f-hbar-track"><div class="f-hbar-fill" style="width:40%;background:#FBBF24"></div></div></div>
          <div class="f-hbar"><span class="f-hbar-label">Payées</span><div class="f-hbar-track"><div class="f-hbar-fill" style="width:80%;background:#10B981"></div></div></div>
        </div>
        <div class="f-dsec" data-el="healthRecent">
          <div class="f-fl">Ce mois</div>
          <div class="f-irow"><span class="f-irowl">Encaissé</span><span class="f-irowv" style="color:#10B981">12 150 €</span></div>
          <div class="f-irow"><span class="f-irowl">En attente</span><span class="f-irowv" style="color:#D97706">4 500 €</span></div>
          <div class="f-irow"><span class="f-irowl">Score</span><span class="f-irowv" style="color:#10B981">87/100</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div class="f-modalbg" data-el="modal">
    <div class="f-modal">
      <div class="f-mt">Nouveau devis</div>
      <div class="f-ms">Créez un devis pour votre client.</div>
      <div class="f-fg"><div class="f-fl">Client</div><div class="f-fi" data-el="fClient"></div></div>
      <div class="f-fg"><div class="f-fl">Prestation</div><div class="f-fi" data-el="fPresta"></div></div>
      <div style="display:flex;gap:6px">
        <div class="f-fg" style="flex:1"><div class="f-fl">Montant</div><div class="f-fi" data-el="fAmount"></div></div>
        <div class="f-fg" style="flex:1"><div class="f-fl">Échéance</div><div class="f-fi" data-el="fDate"></div></div>
      </div>
      <button class="f-mbtn" data-el="modalSubmit">Créer le devis</button>
    </div>
  </div>

  <!-- Overlay -->
  <div class="f-overlay" data-el="overlay"><div class="f-okicon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M5 13l4 4L19 7"/></svg></div><div class="f-okt">Facturation à jour !</div><div style="height:6px"></div><div class="f-oku">12 850 € encaissés · 87/100 santé</div></div>

  <!-- Cursor -->
  <div class="f-cur" data-el="cur"><svg viewBox="0 0 24 24" fill="none" width="14" height="17"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="#1A1A2E" stroke-width="1.5" stroke-linejoin="round"/></svg><div class="f-click" data-el="clk"></div></div>
</div>
</div>`;
