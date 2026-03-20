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
   TIMELINE — Analytics demo
   Scene 1: Intro (0→3.5s) — shell + KPIs + chart + period selector
   Scene 2: KPIs animate (3.5→9s) — numbers count up, sparklines appear
   Scene 3: Chart reveal (9→15s) — bars grow, tooltip appears
   Scene 4: Period switch (15→20s) — click 90j, bars animate, KPIs update
   Scene 5: Inspector detail (20→26s) — top products, insights
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
  k(2.4, ctx => { ctx.q("periods").classList.add("vis"); });
  k(2.8, ctx => { ctx.q("chart").classList.add("vis"); });
  k(3.2, ctx => { ctx.q("toplist").classList.add("vis"); });

  // ── SCENE 2: KPIs ANIMATE (3.5→9s) ──
  k(3.5, ctx => { ctx.cursorTo("kpiCA"); });
  k(4.0, ctx => { ctx.q("kpiCA").classList.add("an-counting"); });
  k(4.5, ctx => { ctx.q("kpiCA").textContent = "8 210 €"; });
  k(5.0, ctx => { ctx.q("kpiCA").textContent = "14 680 €"; ctx.q("kpiCA").classList.remove("an-counting"); });
  k(5.3, ctx => { ctx.q("kpiCA").textContent = "18 420 €"; });
  k(5.5, ctx => { ctx.q("kpiCmd").classList.add("an-counting"); });
  k(5.8, ctx => { ctx.q("kpiCmd").textContent = "34"; ctx.q("kpiCmd").classList.remove("an-counting"); });
  k(6.0, ctx => { ctx.q("kpiConv").classList.add("an-counting"); });
  k(6.3, ctx => { ctx.q("kpiConv").textContent = "68 %"; ctx.q("kpiConv").classList.remove("an-counting"); });
  k(6.5, ctx => { ctx.q("kpiPanier").classList.add("an-counting"); });
  k(6.8, ctx => { ctx.q("kpiPanier").textContent = "542 €"; ctx.q("kpiPanier").classList.remove("an-counting"); });
  // Sparklines appear
  k(7.2, ctx => { ctx.q("spark1").classList.add("vis"); });
  k(7.5, ctx => { ctx.q("spark2").classList.add("vis"); });
  k(7.8, ctx => { ctx.q("spark3").classList.add("vis"); });
  k(8.1, ctx => { ctx.q("spark4").classList.add("vis"); });

  // ── SCENE 3: CHART REVEAL (9→15s) ──
  k(9.0, ctx => { ctx.cursorTo("bar4"); });
  // Bars grow one by one
  k(9.5, ctx => { ctx.q("bar1").classList.add("an-grow"); });
  k(9.8, ctx => { ctx.q("bar2").classList.add("an-grow"); });
  k(10.1, ctx => { ctx.q("bar3").classList.add("an-grow"); });
  k(10.4, ctx => { ctx.q("bar4").classList.add("an-grow"); });
  k(10.7, ctx => { ctx.q("bar5").classList.add("an-grow"); });
  k(11.0, ctx => { ctx.q("bar6").classList.add("an-grow"); });
  k(11.3, ctx => { ctx.q("bar7").classList.add("an-grow"); });
  // Tooltip on bar4
  k(12.0, ctx => { ctx.cursorTo("bar4", 0, -20); });
  k(12.5, ctx => { ctx.q("tooltip").classList.add("vis"); });
  k(14.0, ctx => { ctx.q("tooltip").classList.remove("vis"); });

  // ── SCENE 4: PERIOD SWITCH (15→20s) ──
  k(15.0, ctx => { ctx.cursorTo("period90"); });
  k(15.5, ctx => {
    ctx.clickAt();
    // Switch active period button
    ctx.q("period30").classList.remove("an-pact");
    ctx.q("period90").classList.add("an-pact");
  });
  // Animate bars to new values
  k(16.0, ctx => {
    ctx.q("bar1").style.height = "55%";
    ctx.q("bar2").style.height = "48%";
    ctx.q("bar3").style.height = "72%";
    ctx.q("bar4").style.height = "60%";
    ctx.q("bar5").style.height = "85%";
    ctx.q("bar6").style.height = "68%";
    ctx.q("bar7").style.height = "92%";
  });
  // Update KPIs
  k(16.8, ctx => { ctx.q("kpiCA").classList.add("an-counting"); });
  k(17.2, ctx => { ctx.q("kpiCA").textContent = "42 860 €"; ctx.q("kpiCA").classList.remove("an-counting"); });
  k(17.5, ctx => { ctx.q("kpiCmd").textContent = "87"; });
  k(17.8, ctx => { ctx.q("kpiConv").textContent = "72 %"; });
  k(18.1, ctx => { ctx.q("kpiPanier").textContent = "493 €"; });
  // Update period label in inspector
  k(18.5, ctx => { ctx.q("inspPeriodLabel").textContent = "90 derniers jours"; });
  k(19.0, ctx => { ctx.q("inspTotalVal").textContent = "42 860 €"; });
  k(19.3, ctx => { ctx.q("inspCmdVal").textContent = "87"; });

  // ── SCENE 5: INSPECTOR DETAIL (20→26s) ──
  k(20.0, ctx => {
    ctx.q("tabApercu").classList.remove("act");
    ctx.q("tabInsights").classList.add("act");
    ctx.q("inspDefault").style.display = "none";
    ctx.q("inspDetail").classList.add("vis");
  });
  k(20.6, ctx => { ctx.q("detailProd").classList.add("vis"); });
  k(21.2, ctx => { ctx.q("detailClients").classList.add("vis"); });
  k(22.0, ctx => { ctx.q("detailInsights").classList.add("vis"); });
  k(23.0, ctx => { ctx.cursorTo("insightTrend1"); });
  k(24.0, ctx => { ctx.cursorTo("insightTrend2"); });
  k(25.0, ctx => { ctx.cursorTo("insightTrend3"); });

  // ── SCENE 6: OUTRO ──
  k(26.0, ctx => { ctx.q("overlay").classList.add("vis"); });
  k(31.0, ctx => { ctx.q("cur").classList.remove("vis"); });

  return K.sort((a, b) => a.t - b.t);
}

/* ═══════════════════════════════════════════════════════════
   REACT COMPONENT — identical engine
   ═══════════════════════════════════════════════════════════ */

export default function AnalyticsDemoPlayer({ label = "Voir les analytics en action", accentColor = "#7c3aed" }: Props) {
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

  const SNAP = [3.5, 9.0, 15.0, 20.0, 26.0];
  const seekTo = useCallback((t: number) => { const root = containerRef.current; if (!root) return; const sn = [...snapshotsRef.current.keys()].sort((a,b)=>a-b); let rf = -1; for (const st of sn) { if (st<=t) rf=st; else break; } if (rf>=0&&snapshotsRef.current.has(rf)) { const d = root.querySelector(".an-root"); if (d) d.innerHTML = snapshotsRef.current.get(rf)!; } else { root.innerHTML = initialHtmlRef.current; rf = -1; } void root.offsetHeight; const ctx = makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=rf) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current = t; setCurrentTime(t); }, [makeCtx]);
  const initialize = useCallback(() => { const root = containerRef.current; if (!root) return; root.innerHTML = HTML; initialHtmlRef.current = HTML; timelineRef.current = buildTimeline(); snapshotsRef.current.clear(); lastAppliedRef.current = -1; void root.offsetHeight; const ctx = makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>0) break; try{kf.apply(ctx);}catch{} } const d = root.querySelector(".an-root"); if (d) snapshotsRef.current.set(0, d.innerHTML); }, [makeCtx]);
  const togglePlay = useCallback(() => { if (isPlaying) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; setIsPlaying(false); return; } let t = currentTime>=TOTAL_DURATION-0.5?0:currentTime; if (t===0) seekTo(0); setIsPlaying(true); const TK=100; timerRef.current = setInterval(()=>{ t+=TK/1000; if (t>=TOTAL_DURATION) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current=null; setIsPlaying(false); setCurrentTime(TOTAL_DURATION); return; } const root=containerRef.current; if (!root) return; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=lastAppliedRef.current) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} const d=root.querySelector(".an-root"); if (d&&SNAP.includes(kf.t)) snapshotsRef.current.set(kf.t,d.innerHTML); } lastAppliedRef.current=t; setCurrentTime(t); }, TK); }, [isPlaying, currentTime, seekTo, makeCtx, SNAP]);
  const handleStart = useCallback(() => { setStarted(true); setShowControls(true); setTimeout(()=>{ initialize(); setTimeout(()=>{ seekTo(0); setCurrentTime(0); setIsPlaying(true); }, 200); }, 100); }, [initialize, seekTo]);
  useEffect(() => { if (!started||!isPlaying||timerRef.current) return; let t=currentTime; const TK=100; timerRef.current=setInterval(()=>{ t+=TK/1000; if (t>=TOTAL_DURATION) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current=null; setIsPlaying(false); setCurrentTime(TOTAL_DURATION); return; } const root=containerRef.current; if (!root) return; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t<=lastAppliedRef.current) continue; if (kf.t>t) break; try{kf.apply(ctx);}catch{} const d=root.querySelector(".an-root"); if (d&&SNAP.includes(kf.t)) snapshotsRef.current.set(kf.t,d.innerHTML); } lastAppliedRef.current=t; setCurrentTime(t); }, TK); return ()=>{ if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, isPlaying]);
  useEffect(()=>()=>{ if (timerRef.current) clearInterval(timerRef.current); }, []);
  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => { const r=e.currentTarget.getBoundingClientRect(); const t=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*TOTAL_DURATION; if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } setIsPlaying(false); const root=containerRef.current; if (!root) return; root.innerHTML=initialHtmlRef.current; snapshotsRef.current.clear(); lastAppliedRef.current=-1; void root.offsetHeight; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current=t; const d=root.querySelector(".an-root"); if (d) snapshotsRef.current.set(0,d.innerHTML); setCurrentTime(t); }, [makeCtx]);
  const skip = useCallback((d: number) => { const t=Math.max(0,Math.min(TOTAL_DURATION,currentTime+d)); if (timerRef.current) { clearInterval(timerRef.current); timerRef.current=null; } setIsPlaying(false); const root=containerRef.current; if (!root) return; root.innerHTML=initialHtmlRef.current; lastAppliedRef.current=-1; void root.offsetHeight; const ctx=makeCtx(root); for (const kf of timelineRef.current) { if (kf.t>t) break; try{kf.apply(ctx);}catch{} } lastAppliedRef.current=t; setCurrentTime(t); }, [currentTime, makeCtx]);
  const fmt = (s: number) => `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;
  const scenes = [{t:0,label:"Intro"},{t:3.5,label:"KPIs"},{t:9,label:"Graphique"},{t:15,label:"Période"},{t:20,label:"Insights"},{t:26,label:"Résultat"}];
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
                  <div style={{width:"14%",background:"#FFF",borderRight:"1px solid #E8E5F0",padding:6}}><div style={{fontSize:10,fontWeight:800,background:"linear-gradient(135deg,#7C5CFF,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:10}}>Jestly</div>{["Dashboard","Clients","Facturation","Commandes","Analytics"].map((l,i)=>(<div key={l} style={{padding:"3px 5px",borderRadius:3,fontSize:7,marginBottom:2,background:i===4?"#EDE9FE":"transparent",color:i===4?"#7C5CFF":"#6B7280",fontWeight:i===4?600:400}}>{l}</div>))}</div>
                  <div style={{flex:1,background:"#F1EFF7",padding:8}}><div style={{display:"flex",gap:4,marginBottom:6}}>{["CA total","Commandes","Conversion","Panier moyen"].map(l=>(<div key={l} style={{flex:1,background:"#FFF",border:"1px solid #E8E5F0",borderRadius:5,padding:4}}><div style={{fontSize:5,color:"#9CA3AF"}}>{l}</div><div style={{width:"50%",height:4,background:"#F0EDF7",borderRadius:2,marginTop:2}} /></div>))}</div><div style={{background:"#FFF",border:"1px solid #E8E5F0",borderRadius:7,padding:5,display:"flex",alignItems:"flex-end",gap:3,height:40}}>{[40,55,35,70,50,65,80].map((h,i)=>(<div key={i} style={{flex:1,height:`${h}%`,background:"rgba(124,92,255,0.2)",borderRadius:2}} />))}</div></div>
                  <div style={{width:"16%",background:"#FFF",borderLeft:"1px solid #E8E5F0",padding:5}}><div style={{fontSize:6,fontWeight:600,color:"#9CA3AF",marginBottom:4}}>Résumé</div>{[0,1,2].map(i=>(<div key={i} style={{marginBottom:4}}><div style={{width:"40%",height:3,background:"#F0EDF7",borderRadius:2,marginBottom:2}} /><div style={{height:10,background:"#FAFAFE",border:"1px solid #E8E5F0",borderRadius:3}} /></div>))}</div>
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
   ANALYTICS DEMO HTML
   DA tokens: Shell #F8F7FC, Canvas #F1EFF7, Border #E8E5F0,
   Sidebar 170px, Inspector 190px, Toolbar 34px, Accent #7C5CFF
   Mirrors real analytics/page.tsx layout:
   - 4 KPI cards (CA total, Commandes, Conversion, Panier moyen)
   - Period selector (7j, 30j, 90j, 12m)
   - Bar chart (7 months)
   - Top produits list
   ═══════════════════════════════════════════════════════════ */

const HTML = `
<style>
  .an-root{width:100%;height:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;background:#0F0E17;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
  .an-root *,.an-root *::before,.an-root *::after{margin:0;padding:0;box-sizing:border-box}
  .an-shell{width:100%;height:100%;background:#F8F7FC;overflow:hidden;position:relative;opacity:0;transform:scale(0.96);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1),opacity 0.4s ease}
  .an-shell.vis{opacity:1;transform:scale(1)}
  .an-bar{height:28px;background:#FAFAFE;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;padding:0 10px;gap:6px}
  .an-bardot{width:8px;height:8px;border-radius:50%}
  .an-barurl{flex:1;margin-left:8px;height:17px;background:#F3F2F8;border-radius:4px;display:flex;align-items:center;padding:0 8px;font-size:9px;color:#9CA3AF}
  .an-builder{display:flex;height:calc(100% - 28px);position:relative}
  .an-toolbar{position:absolute;top:0;left:0;right:0;height:34px;background:#FFF;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;justify-content:space-between;padding:0 12px;z-index:20}
  .an-logo{font-size:11px;font-weight:800;background:linear-gradient(135deg,#7C5CFF,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .an-divider{width:1px;height:16px;background:#E8E5F0;margin:0 8px}
  .an-pagename{font-size:9px;color:#6B7280;padding:2px 7px;background:#F5F3FA;border-radius:4px}
  .an-tbl{display:flex;align-items:center;gap:6px}
  .an-side{width:170px;background:#FFF;border-right:1px solid #E8E5F0;margin-top:34px;overflow:hidden;padding:8px}
  .an-stitle{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#9CA3AF;margin-bottom:6px;margin-top:6px}
  .an-sitem{display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:4px;font-size:10px;color:#1A1A2E}
  .an-sitem.act{background:#EDE9FE;color:#7C5CFF;font-weight:600}
  .an-sicon{width:14px;height:14px;border-radius:3px;background:#F0EDF7;display:flex;align-items:center;justify-content:center;font-size:7px;color:#9CA3AF}
  .an-sitem.act .an-sicon{background:rgba(124,92,255,0.15);color:#7C5CFF}
  .an-canvas{flex:1;margin-top:34px;background:#F1EFF7;overflow:hidden;padding:10px;display:flex;flex-direction:column;gap:8px}

  /* KPIs */
  .an-kpis{display:flex;gap:5px;opacity:0;transform:translateY(6px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .an-kpis.vis{opacity:1;transform:translateY(0)}
  .an-kpi{flex:1;padding:6px 8px;background:#FFF;border:1px solid #E8E5F0;border-radius:7px;position:relative;overflow:hidden}
  .an-kpi-label{font-size:6px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px}
  .an-kpi-val{font-size:10px;font-weight:700;color:#1A1A2E;transition:all 0.3s}
  .an-kpi-val.an-counting{color:#7C5CFF}
  .an-kpi-sub{font-size:5.5px;color:#9CA3AF;margin-top:1px}
  .an-spark{position:absolute;bottom:3px;right:6px;opacity:0;transform:translateY(4px);transition:all 0.35s cubic-bezier(0.22,1,0.36,1)}
  .an-spark.vis{opacity:1;transform:translateY(0)}
  .an-spark-line{display:flex;align-items:flex-end;gap:1px;height:12px}
  .an-spark-bar{width:2px;border-radius:1px;background:#7C5CFF;opacity:0.3}

  /* Period selector */
  .an-periods{display:flex;gap:3px;opacity:0;transform:translateY(4px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .an-periods.vis{opacity:1;transform:translateY(0)}
  .an-pbtn{padding:3px 8px;border-radius:4px;font-size:7px;font-weight:600;background:#FFF;border:1px solid #E8E5F0;color:#6B7280;cursor:pointer;transition:all 0.3s}
  .an-pbtn.an-pact{background:#7C5CFF;color:#FFF;border-color:#7C5CFF}

  /* Chart area */
  .an-chart-wrap{background:#FFF;border:1px solid #E8E5F0;border-radius:7px;flex:1;display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(8px);transition:all 0.5s cubic-bezier(0.22,1,0.36,1);position:relative}
  .an-chart-wrap.vis{opacity:1;transform:translateY(0)}
  .an-chart-head{display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-bottom:1px solid #E8E5F0}
  .an-chart-title{font-size:8px;font-weight:700;color:#1A1A2E}
  .an-chart-sub{font-size:6px;color:#9CA3AF}
  .an-chart{flex:1;display:flex;align-items:flex-end;gap:6px;padding:8px 12px 4px 12px;position:relative}
  .an-chart-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;height:100%}
  .an-chart-bar-container{flex:1;width:100%;display:flex;align-items:flex-end;justify-content:center}
  .an-chart-bar{width:80%;border-radius:3px 3px 0 0;background:#7C5CFF;height:0%;transition:height 0.6s cubic-bezier(0.22,1,0.36,1)}
  .an-chart-bar.an-grow{height:var(--bar-h)}
  .an-chart-label{font-size:5.5px;color:#9CA3AF;font-weight:500}

  /* Tooltip */
  .an-tooltip{position:absolute;top:8px;left:50%;transform:translateX(-50%);background:#1A1A2E;color:#FFF;padding:4px 8px;border-radius:4px;font-size:7px;font-weight:600;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity 0.3s;z-index:10}
  .an-tooltip.vis{opacity:1}
  .an-tooltip::after{content:'';position:absolute;bottom:-3px;left:50%;transform:translateX(-50%);width:6px;height:6px;background:#1A1A2E;rotate:45deg}

  /* Top produits list */
  .an-toplist{background:#FFF;border:1px solid #E8E5F0;border-radius:7px;padding:6px 8px;opacity:0;transform:translateY(6px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .an-toplist.vis{opacity:1;transform:translateY(0)}
  .an-toplist-title{font-size:7px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px}
  .an-toplist-row{display:flex;align-items:center;padding:3px 0;border-bottom:1px solid #F0EDF7}
  .an-toplist-row:last-child{border-bottom:none}
  .an-toplist-rank{width:14px;height:14px;border-radius:3px;background:#F0EDF7;display:flex;align-items:center;justify-content:center;font-size:6px;font-weight:700;color:#7C5CFF;margin-right:6px}
  .an-toplist-name{flex:1;font-size:7px;color:#1A1A2E;font-weight:500}
  .an-toplist-val{font-size:7px;font-weight:700;color:#1A1A2E;font-variant-numeric:tabular-nums}

  /* Inspector 190px */
  .an-insp{width:190px;background:#FFF;border-left:1px solid #E8E5F0;margin-top:34px;overflow-y:auto;opacity:0;transform:translateX(8px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .an-insp.vis{opacity:1;transform:translateX(0)}
  .an-tabs{display:flex;border-bottom:1px solid #E8E5F0}
  .an-tab{flex:1;padding:7px 5px;font-size:8px;font-weight:600;text-align:center;color:#9CA3AF;border-bottom:2px solid transparent;cursor:pointer}
  .an-tab.act{color:#7C5CFF;border-bottom-color:#7C5CFF}
  .an-icont{padding:8px}
  .an-fl{font-size:7px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px}
  .an-irow{display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid #F0EDF7}
  .an-irowl{font-size:7px;color:#9CA3AF}
  .an-irowv{font-size:8px;font-weight:600;color:#1A1A2E}

  /* Inspector panels */
  .an-ipanel{display:none;padding:8px}
  .an-ipanel.vis{display:block}
  .an-dsec{opacity:0;transform:translateY(6px);transition:all 0.35s cubic-bezier(0.22,1,0.36,1);margin-bottom:8px}
  .an-dsec.vis{opacity:1;transform:translateY(0)}

  /* Insight items */
  .an-insight{display:flex;align-items:center;gap:6px;padding:5px 6px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:5px;margin-bottom:4px}
  .an-insight-icon{width:18px;height:18px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:8px}
  .an-insight-text{font-size:7px;color:#1A1A2E;line-height:1.3}
  .an-insight-val{font-size:7px;font-weight:700}
  .an-insight-up{color:#10B981}
  .an-insight-down{color:#EF4444}

  /* Detail product list in inspector */
  .an-dprod-row{display:flex;align-items:center;padding:3px 0;border-bottom:1px solid #F0EDF7}
  .an-dprod-dot{width:6px;height:6px;border-radius:50%;margin-right:5px}
  .an-dprod-name{flex:1;font-size:7px;color:#1A1A2E}
  .an-dprod-val{font-size:7px;font-weight:600;color:#1A1A2E}

  /* Overlay */
  .an-overlay{position:absolute;inset:28px 0 0 0;background:rgba(255,255,255,0.95);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:50;opacity:0;pointer-events:none;transition:opacity 0.5s}
  .an-overlay.vis{opacity:1;pointer-events:all}
  .an-okicon{width:42px;height:42px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center;margin-bottom:12px;transform:scale(0);transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1)}
  .an-overlay.vis .an-okicon{transform:scale(1)}
  .an-okt{font-size:16px;font-weight:700;color:#1A1A2E;margin-bottom:4px}
  .an-oku{font-size:10px;color:#7C5CFF;background:#EDE9FE;padding:4px 12px;border-radius:14px;font-weight:500}

  /* Cursor */
  .an-cur{position:absolute;width:14px;height:17px;z-index:100;pointer-events:none;opacity:0;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.2));transition:opacity 0.3s}
  .an-cur.vis{opacity:1}
  .an-click{position:absolute;width:18px;height:18px;border-radius:50%;background:rgba(124,92,255,0.3);transform:translate(-2px,-1px) scale(0);pointer-events:none;z-index:99}
  .an-click.pop{animation:an-pop 0.35s ease-out forwards}
  @keyframes an-pop{0%{transform:translate(-2px,-1px) scale(0);opacity:1}100%{transform:translate(-2px,-1px) scale(2);opacity:0}}
</style>

<div class="an-root">
<div class="an-shell" data-el="shell">
  <div class="an-bar"><div class="an-bardot" style="background:#FF6159"></div><div class="an-bardot" style="background:#FFBF2F"></div><div class="an-bardot" style="background:#2ACB42"></div><div class="an-barurl"><span style="margin-right:3px">🔒</span>app.jestly.fr/analytics</div></div>
  <div class="an-builder">
    <div class="an-toolbar">
      <div class="an-tbl"><span class="an-logo">Jestly</span><div class="an-divider"></div><span class="an-pagename" data-el="pageTitle">Analytics</span></div>
      <div class="an-tbl"><span style="font-size:8px;color:#9CA3AF">Mars 2026</span></div>
    </div>
    <div class="an-side">
      <div class="an-stitle">Navigation</div>
      <div class="an-sitem"><div class="an-sicon">⌂</div>Dashboard</div>
      <div class="an-sitem"><div class="an-sicon">♦</div>Clients</div>
      <div class="an-sitem"><div class="an-sicon">☰</div>Commandes</div>
      <div class="an-sitem"><div class="an-sicon">✎</div>Facturation</div>
      <div class="an-sitem act"><div class="an-sicon">◆</div>Analytics</div>
    </div>
    <div class="an-canvas">
      <!-- KPIs (4 cards) -->
      <div class="an-kpis" data-el="kpis">
        <div class="an-kpi" data-el="kpiCA-wrap">
          <div class="an-kpi-label">CA total</div>
          <div class="an-kpi-val" data-el="kpiCA">—</div>
          <div class="an-kpi-sub">+32 % vs mois préc.</div>
          <div class="an-spark" data-el="spark1"><div class="an-spark-line"><div class="an-spark-bar" style="height:4px"></div><div class="an-spark-bar" style="height:6px"></div><div class="an-spark-bar" style="height:5px"></div><div class="an-spark-bar" style="height:8px"></div><div class="an-spark-bar" style="height:7px"></div><div class="an-spark-bar" style="height:10px"></div><div class="an-spark-bar" style="height:12px"></div></div></div>
        </div>
        <div class="an-kpi">
          <div class="an-kpi-label">Commandes</div>
          <div class="an-kpi-val" data-el="kpiCmd">—</div>
          <div class="an-kpi-sub">payées ce mois</div>
          <div class="an-spark" data-el="spark2"><div class="an-spark-line"><div class="an-spark-bar" style="height:3px"></div><div class="an-spark-bar" style="height:5px"></div><div class="an-spark-bar" style="height:7px"></div><div class="an-spark-bar" style="height:6px"></div><div class="an-spark-bar" style="height:9px"></div><div class="an-spark-bar" style="height:8px"></div><div class="an-spark-bar" style="height:11px"></div></div></div>
        </div>
        <div class="an-kpi" style="background:#FAFAFF;border-color:#E8E5F5">
          <div class="an-kpi-label" style="color:#7C5CFF">Conversion</div>
          <div class="an-kpi-val" data-el="kpiConv" style="color:#6D28D9">—</div>
          <div class="an-kpi-sub">visiteurs → clients</div>
          <div class="an-spark" data-el="spark3"><div class="an-spark-line"><div class="an-spark-bar" style="height:6px;background:#6D28D9"></div><div class="an-spark-bar" style="height:7px;background:#6D28D9"></div><div class="an-spark-bar" style="height:8px;background:#6D28D9"></div><div class="an-spark-bar" style="height:7px;background:#6D28D9"></div><div class="an-spark-bar" style="height:9px;background:#6D28D9"></div><div class="an-spark-bar" style="height:10px;background:#6D28D9"></div><div class="an-spark-bar" style="height:11px;background:#6D28D9"></div></div></div>
        </div>
        <div class="an-kpi">
          <div class="an-kpi-label">Panier moyen</div>
          <div class="an-kpi-val" data-el="kpiPanier">—</div>
          <div class="an-kpi-sub">par commande</div>
          <div class="an-spark" data-el="spark4"><div class="an-spark-line"><div class="an-spark-bar" style="height:5px"></div><div class="an-spark-bar" style="height:7px"></div><div class="an-spark-bar" style="height:6px"></div><div class="an-spark-bar" style="height:8px"></div><div class="an-spark-bar" style="height:9px"></div><div class="an-spark-bar" style="height:8px"></div><div class="an-spark-bar" style="height:10px"></div></div></div>
        </div>
      </div>

      <!-- Period selector -->
      <div class="an-periods" data-el="periods">
        <div class="an-pbtn" data-el="period7">7j</div>
        <div class="an-pbtn an-pact" data-el="period30">30j</div>
        <div class="an-pbtn" data-el="period90">90j</div>
        <div class="an-pbtn" data-el="period12m">12m</div>
      </div>

      <!-- Bar chart -->
      <div class="an-chart-wrap" data-el="chart">
        <div class="an-chart-head">
          <div><div class="an-chart-title">Chiffre d'affaires</div><div class="an-chart-sub">7 derniers mois</div></div>
          <div style="font-size:7px;color:#7C5CFF;font-weight:600">Barres</div>
        </div>
        <div class="an-chart" style="min-height:0">
          <div class="an-chart-bar-wrap"><div class="an-chart-bar-container"><div class="an-chart-bar" data-el="bar1" style="--bar-h:40%"></div></div><div class="an-chart-label">Sep</div></div>
          <div class="an-chart-bar-wrap"><div class="an-chart-bar-container"><div class="an-chart-bar" data-el="bar2" style="--bar-h:58%"></div></div><div class="an-chart-label">Oct</div></div>
          <div class="an-chart-bar-wrap"><div class="an-chart-bar-container"><div class="an-chart-bar" data-el="bar3" style="--bar-h:45%"></div></div><div class="an-chart-label">Nov</div></div>
          <div class="an-chart-bar-wrap"><div class="an-chart-bar-container"><div class="an-chart-bar" data-el="bar4" style="--bar-h:72%"></div></div><div class="an-chart-label">Déc</div></div>
          <div class="an-chart-bar-wrap"><div class="an-chart-bar-container"><div class="an-chart-bar" data-el="bar5" style="--bar-h:65%"></div></div><div class="an-chart-label">Jan</div></div>
          <div class="an-chart-bar-wrap"><div class="an-chart-bar-container"><div class="an-chart-bar" data-el="bar6" style="--bar-h:78%"></div></div><div class="an-chart-label">Fév</div></div>
          <div class="an-chart-bar-wrap"><div class="an-chart-bar-container"><div class="an-chart-bar" data-el="bar7" style="--bar-h:88%"></div></div><div class="an-chart-label">Mar</div></div>
          <!-- Tooltip -->
          <div class="an-tooltip" data-el="tooltip">Déc 2025 · 4 320 €</div>
        </div>
      </div>

      <!-- Top produits -->
      <div class="an-toplist" data-el="toplist">
        <div class="an-toplist-title">Top produits</div>
        <div class="an-toplist-row"><div class="an-toplist-rank">1</div><div class="an-toplist-name">Branding complet</div><div class="an-toplist-val">6 800 €</div></div>
        <div class="an-toplist-row"><div class="an-toplist-rank">2</div><div class="an-toplist-name">Montage vidéo</div><div class="an-toplist-val">4 500 €</div></div>
        <div class="an-toplist-row"><div class="an-toplist-rank">3</div><div class="an-toplist-name">Logo + charte</div><div class="an-toplist-val">3 620 €</div></div>
      </div>
    </div>

    <!-- Inspector 190px -->
    <div class="an-insp" data-el="insp">
      <div class="an-tabs"><div class="an-tab act" data-el="tabApercu">Aperçu</div><div class="an-tab" data-el="tabInsights">Insights</div></div>
      <!-- Default -->
      <div class="an-icont" data-el="inspDefault">
        <div class="an-fl" style="margin-bottom:6px" data-el="inspPeriodLabel">30 derniers jours</div>
        <div style="margin-bottom:8px">
          <div class="an-irow"><span class="an-irowl">CA total</span><span class="an-irowv" data-el="inspTotalVal">18 420 €</span></div>
          <div class="an-irow"><span class="an-irowl">Commandes</span><span class="an-irowv" data-el="inspCmdVal">34</span></div>
          <div class="an-irow"><span class="an-irowl">Conversion</span><span class="an-irowv">68 %</span></div>
          <div class="an-irow"><span class="an-irowl">Panier moyen</span><span class="an-irowv">542 €</span></div>
        </div>
        <div class="an-fl" style="margin-bottom:6px">Répartition</div>
        <div style="margin-bottom:6px">
          <div class="an-dprod-row"><div class="an-dprod-dot" style="background:#7C5CFF"></div><div class="an-dprod-name">Design</div><div class="an-dprod-val">52 %</div></div>
          <div class="an-dprod-row"><div class="an-dprod-dot" style="background:#A78BFA"></div><div class="an-dprod-name">Vidéo</div><div class="an-dprod-val">31 %</div></div>
          <div class="an-dprod-row"><div class="an-dprod-dot" style="background:#C4B5FD"></div><div class="an-dprod-name">Autre</div><div class="an-dprod-val">17 %</div></div>
        </div>
        <div class="an-fl" style="margin-bottom:4px">Dernière activité</div>
        <div style="padding:5px 6px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:4px;font-size:8px;color:#6B7280;line-height:1.4">+3 commandes aujourd'hui</div>
      </div>
      <!-- Insights panel -->
      <div class="an-ipanel" data-el="inspDetail">
        <div class="an-dsec" data-el="detailProd">
          <div class="an-fl" style="margin-bottom:5px">Top produits</div>
          <div class="an-dprod-row"><div class="an-dprod-dot" style="background:#7C5CFF"></div><div class="an-dprod-name">Branding complet</div><div class="an-dprod-val">6 800 €</div></div>
          <div class="an-dprod-row"><div class="an-dprod-dot" style="background:#A78BFA"></div><div class="an-dprod-name">Montage vidéo</div><div class="an-dprod-val">4 500 €</div></div>
          <div class="an-dprod-row"><div class="an-dprod-dot" style="background:#C4B5FD"></div><div class="an-dprod-name">Logo + charte</div><div class="an-dprod-val">3 620 €</div></div>
        </div>
        <div class="an-dsec" data-el="detailClients">
          <div class="an-fl" style="margin-bottom:5px">Top clients</div>
          <div class="an-dprod-row"><div class="an-dprod-dot" style="background:#10B981"></div><div class="an-dprod-name">Claire Dupont</div><div class="an-dprod-val">5 200 €</div></div>
          <div class="an-dprod-row"><div class="an-dprod-dot" style="background:#34D399"></div><div class="an-dprod-name">Thomas Durand</div><div class="an-dprod-val">4 500 €</div></div>
          <div class="an-dprod-row"><div class="an-dprod-dot" style="background:#6EE7B7"></div><div class="an-dprod-name">Emma Rousseau</div><div class="an-dprod-val">3 100 €</div></div>
        </div>
        <div class="an-dsec" data-el="detailInsights">
          <div class="an-fl" style="margin-bottom:5px">Tendances</div>
          <div class="an-insight" data-el="insightTrend1"><div class="an-insight-icon" style="background:#D1FAE5;color:#059669">↑</div><div><div class="an-insight-text">CA en hausse</div><div class="an-insight-val an-insight-up">+32 % ce mois</div></div></div>
          <div class="an-insight" data-el="insightTrend2"><div class="an-insight-icon" style="background:#D1FAE5;color:#059669">↑</div><div><div class="an-insight-text">Clients récurrents</div><div class="an-insight-val an-insight-up">+18 % fidélisation</div></div></div>
          <div class="an-insight" data-el="insightTrend3"><div class="an-insight-icon" style="background:#FEF3C7;color:#D97706">→</div><div><div class="an-insight-text">Panier moyen</div><div class="an-insight-val" style="color:#D97706">Stable à 542 €</div></div></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Overlay -->
  <div class="an-overlay" data-el="overlay"><div class="an-okicon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M5 13l4 4L19 7"/></svg></div><div class="an-okt">Analytics à jour !</div><div style="height:6px"></div><div class="an-oku">+32 % croissance · 18 420 € CA</div></div>

  <!-- Cursor -->
  <div class="an-cur" data-el="cur"><svg viewBox="0 0 24 24" fill="none" width="14" height="17"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="#1A1A2E" stroke-width="1.5" stroke-linejoin="round"/></svg><div class="an-click" data-el="clk"></div></div>
</div>
</div>`;
