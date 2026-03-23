"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;
const TOTAL_DURATION = 75;

interface BriefsDemoPlayerProps {
  label?: string;
  accentColor?: string;
}

/* ═══════════════════════════════════════════════════════════
   TIMELINE — 11 chapitres, 75 secondes
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

  // ══════════════════════════════════════════════════════════
  // SCENE 1: INTRO (0 → 3s)
  // ══════════════════════════════════════════════════════════
  k(0, ctx => { ctx.q("shell").classList.add("vis"); });
  k(0.6, ctx => { ctx.q("cur").classList.add("vis"); ctx.cursorTo("pageTitle"); });
  k(1.0, ctx => { ctx.q("insp").classList.add("vis"); });
  k(1.5, ctx => { ctx.q("tabs").classList.add("vis"); });
  k(2.0, ctx => { ctx.q("prodList").classList.add("vis"); });

  // ══════════════════════════════════════════════════════════
  // SCENE 2: CREATE PRODUCT (3 → 11s)
  // ══════════════════════════════════════════════════════════
  k(3.0, ctx => { ctx.cursorTo("addProdBtn"); });
  k(3.5, ctx => { ctx.clickAt(); ctx.q("modalProd").classList.add("open"); });
  // Type name
  k(4.2, ctx => { ctx.cursorTo("pName"); });
  k(4.4, ctx => { ctx.clickAt(); ctx.q("pName").classList.add("ed"); ctx.q("pName").textContent = "Mini"; });
  k(4.7, ctx => { ctx.q("pName").textContent = "Miniature You"; });
  k(5.0, ctx => { ctx.q("pName").textContent = "Miniature YouTube Premium"; ctx.q("pName").classList.remove("ed"); });
  // Price
  k(5.3, ctx => { ctx.cursorTo("pPrice"); });
  k(5.5, ctx => { ctx.clickAt(); ctx.q("pPrice").classList.add("ed"); ctx.q("pPrice").textContent = "50 €"; ctx.q("pPrice").classList.remove("ed"); });
  // Description
  k(5.8, ctx => { ctx.cursorTo("pDesc"); });
  k(6.0, ctx => { ctx.clickAt(); ctx.q("pDesc").classList.add("ed"); ctx.q("pDesc").textContent = "Création de miniature YouTube"; });
  k(6.5, ctx => { ctx.q("pDesc").textContent = "Création de miniature YouTube professionnelle, dynamique et optimisée pour le clic."; ctx.q("pDesc").classList.remove("ed"); });
  // Type dropdown
  k(7.0, ctx => { ctx.cursorTo("pType"); });
  k(7.3, ctx => { ctx.clickAt(); ctx.q("pTypeDrop").classList.add("open"); });
  k(7.7, ctx => { ctx.cursorTo("pTypeSvc"); });
  k(8.0, ctx => { ctx.clickAt(); ctx.q("pTypeDrop").classList.remove("open"); ctx.q("pTypeVal").textContent = "Service"; ctx.q("pTypeVal").style.color = "#1A1A2E"; });
  // Submit
  k(8.5, ctx => { ctx.cursorTo("prodSubmit"); });
  k(8.9, ctx => {
    ctx.clickAt(); ctx.q("modalProd").classList.remove("open");
    const c = document.createElement("div");
    c.className = "b-pcard entering"; c.setAttribute("data-el", "cardMini");
    c.innerHTML = '<div class="b-picon" style="background:#F97316">🎨</div><div class="b-pi"><div class="b-pn">Miniature YouTube Premium</div><div class="b-pp">50 € · Service</div></div><div class="b-pbadge">Nouveau</div>';
    ctx.q("prodList").insertBefore(c, ctx.q("prodList").firstChild);
  });
  k(9.5, ctx => { const c = ctx.q("cardMini"); if (c) c.classList.add("hl"); });
  k(10.2, ctx => { const c = ctx.q("cardMini"); if (c) c.classList.remove("hl"); });

  // ══════════════════════════════════════════════════════════
  // SCENE 3: CREATE BRIEF (11 → 14s)
  // ══════════════════════════════════════════════════════════
  k(11.0, ctx => { ctx.cursorTo("briefSec"); });
  k(11.3, ctx => {
    // scroll to briefs area
    ctx.q("scrollArea").scrollTop = 999;
  });
  k(11.8, ctx => { ctx.cursorTo("addBriefBtn"); });
  k(12.2, ctx => { ctx.clickAt(); ctx.q("modalBrief").classList.add("open"); });
  k(12.8, ctx => { ctx.cursorTo("bName"); });
  k(13.0, ctx => { ctx.clickAt(); ctx.q("bName").classList.add("ed"); ctx.q("bName").textContent = "Brief Miniature YouTube"; ctx.q("bName").classList.remove("ed"); });
  k(13.5, ctx => { ctx.cursorTo("briefCreateBtn"); });
  k(13.8, ctx => {
    ctx.clickAt(); ctx.q("modalBrief").classList.remove("open");
    // Add brief card
    const bc = document.createElement("div");
    bc.className = "b-bcard entering"; bc.setAttribute("data-el", "briefCard");
    bc.innerHTML = '<div class="b-bico">📋</div><div class="b-bci"><div class="b-bcn">Brief Miniature YouTube</div><div class="b-bcp">0 champs · Créé à l\'instant</div></div>';
    ctx.q("briefList").insertBefore(bc, ctx.q("briefList").firstChild);
  });

  // ══════════════════════════════════════════════════════════
  // SCENE 4: OPEN & EXPLAIN BRIEF (14 → 26s)
  // ══════════════════════════════════════════════════════════
  k(14.5, ctx => { ctx.cursorTo("briefCard"); });
  k(15.0, ctx => {
    ctx.clickAt();
    ctx.q("briefEditor").classList.add("vis");
    ctx.q("briefCard").classList.add("sel");
  });
  // Field 1: Titre du projet
  k(15.8, ctx => { ctx.q("bf1").classList.add("vis"); });
  k(16.4, ctx => {
    ctx.q("bf1val").classList.add("ed");
    ctx.q("bf1val").textContent = "Miniature vidéo MrBeast";
    ctx.q("bf1val").classList.remove("ed");
  });
  // Field 2: Briefing créatif
  k(17.2, ctx => { ctx.q("bf2").classList.add("vis"); });
  k(17.8, ctx => {
    ctx.q("bf2val").classList.add("ed");
    ctx.q("bf2val").textContent = "Miniature dynamique, visage surpris, texte jaune, fond sombre, style énergique.";
    ctx.q("bf2val").classList.remove("ed");
  });
  // Field 3: Deadline
  k(18.8, ctx => { ctx.q("bf3").classList.add("vis"); });
  k(19.2, ctx => { ctx.cursorTo("bf3val"); });
  k(19.5, ctx => {
    ctx.clickAt();
    ctx.q("calPop").classList.add("vis");
  });
  k(20.0, ctx => { ctx.cursorTo("cal25"); });
  k(20.3, ctx => {
    ctx.clickAt(); ctx.q("calPop").classList.remove("vis");
    ctx.q("bf3date").textContent = "25 mars"; ctx.q("bf3date").style.color = "#1A1A2E";
  });
  // Field 4: Fichiers
  k(21.0, ctx => { ctx.q("bf4").classList.add("vis"); });
  k(21.5, ctx => {
    ctx.q("bf4zone").innerHTML = '<div class="b-upf"><div class="b-upt" style="background:#FFF7ED">🖼</div><div class="b-upn">image_ref.jpg</div><div class="b-ups">245 Ko</div></div><div class="b-upf entering"><div class="b-upt" style="background:#EDE9FE">🎨</div><div class="b-upn">thumbnail_style.png</div><div class="b-ups">1.2 Mo</div></div>';
  });
  // Field 5: Type dropdown
  k(22.2, ctx => { ctx.q("bf5").classList.add("vis"); });
  k(22.6, ctx => { ctx.cursorTo("bf5sel"); });
  k(22.9, ctx => { ctx.clickAt(); ctx.q("bf5drop").classList.add("vis"); });
  k(23.3, ctx => { ctx.cursorTo("bf5optMini"); });
  k(23.6, ctx => {
    ctx.clickAt(); ctx.q("bf5drop").classList.remove("vis");
    ctx.q("bf5text").textContent = "Miniature YouTube"; ctx.q("bf5text").style.color = "#1A1A2E";
  });
  // Update brief card count
  k(24.2, ctx => {
    const p = ctx.q("briefCard")?.querySelector(".b-bcp") as HTMLElement;
    if (p) p.textContent = "5 champs · Complet";
  });
  // Close brief editor
  k(25.0, ctx => {
    ctx.q("briefEditor").classList.remove("vis");
    ctx.q("briefCard").classList.remove("sel");
  });

  // ══════════════════════════════════════════════════════════
  // SCENE 5: ASSOCIATE BRIEF TO PRODUCT (26 → 31s)
  // ══════════════════════════════════════════════════════════
  k(26.0, ctx => {
    ctx.q("scrollArea").scrollTop = 0;
    ctx.cursorTo("cardMini");
  });
  k(26.5, ctx => {
    ctx.clickAt();
    // Show product detail in inspector
    ctx.q("inspDefault").style.display = "none";
    ctx.q("inspProd").classList.add("vis");
  });
  k(27.0, ctx => { ctx.q("ipHead").classList.add("vis"); });
  k(27.4, ctx => { ctx.q("ipFields").classList.add("vis"); });
  k(28.0, ctx => { ctx.cursorTo("assocBtn"); });
  k(28.4, ctx => { ctx.clickAt(); ctx.q("assocDrop").classList.add("vis"); });
  k(28.9, ctx => { ctx.cursorTo("assocOpt"); });
  k(29.3, ctx => {
    ctx.clickAt(); ctx.q("assocDrop").classList.remove("vis");
    ctx.q("assocBtn").innerHTML = '<span style="font-size:9px">📋</span> Brief Miniature YouTube';
    ctx.q("assocBtn").classList.add("linked");
    ctx.q("briefBadge").classList.add("vis");
  });
  // Badge on product card
  k(30.0, ctx => {
    const c = ctx.q("cardMini");
    if (c) { const b = document.createElement("div"); b.className = "b-cbb entering"; b.textContent = "📋 Brief requis"; c.appendChild(b); }
  });

  // ══════════════════════════════════════════════════════════
  // SCENE 6: GO TO SITE BUILDER (31 → 34s)
  // ══════════════════════════════════════════════════════════
  k(31.5, ctx => {
    // Switch to builder view
    ctx.q("inspProd").classList.remove("vis");
    ctx.q("inspDefault").style.display = "";
    ctx.q("prodView").style.display = "none";
    ctx.q("builderView").classList.add("vis");
    ctx.q("sideBuilder").classList.add("act");
    ctx.q("sideProd").classList.remove("act");
    ctx.q("barUrl").innerHTML = '<span style="margin-right:3px">🔒</span>app.jestly.fr/createur';
    ctx.q("pageTitle").textContent = "Créateur";
    // Update inspector
    ctx.q("inspDefault").innerHTML = '<div class="b-fl" style="margin-bottom:6px">Aperçu du site</div><div style="padding:5px 6px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:4px;font-size:8px;color:#6B7280;line-height:1.4">3 blocs · Hero, À propos, Contact</div>';
  });
  k(32.0, ctx => { ctx.q("builderCanvas").classList.add("vis"); });

  // ══════════════════════════════════════════════════════════
  // SCENE 7: ADD SERVICE BLOCK (34 → 40s)
  // ══════════════════════════════════════════════════════════
  k(34.0, ctx => { ctx.cursorTo("addBlockBtn"); });
  k(34.5, ctx => { ctx.clickAt(); ctx.q("blockLib").classList.add("open"); });
  // Focus on "Vente" category
  k(35.2, ctx => { ctx.cursorTo("catVente"); });
  k(35.5, ctx => { ctx.clickAt(); ctx.q("catVente").classList.add("act"); ctx.q("catContenu").classList.remove("act"); });
  // Show vente blocks
  k(35.8, ctx => { ctx.q("venteBlocks").classList.add("vis"); ctx.q("contenuBlocks").style.display = "none"; });
  // Click "Bloc Service"
  k(36.5, ctx => { ctx.cursorTo("blockSvc"); });
  k(36.9, ctx => {
    ctx.clickAt(); ctx.q("blockLib").classList.remove("open");
    // Insert block in canvas
    const bl = document.createElement("div");
    bl.className = "b-cblock entering"; bl.setAttribute("data-el", "svcBlock");
    bl.innerHTML = '<div class="b-cblabel">🏷 Bloc Service</div><div class="b-cbsub">Aucun produit sélectionné</div>';
    ctx.q("builderBlocks").appendChild(bl);
  });

  // ══════════════════════════════════════════════════════════
  // SCENE 8: SELECT PRODUCT FROM DB (40 → 46s)
  // ══════════════════════════════════════════════════════════
  k(40.0, ctx => {
    // Open block settings in inspector
    ctx.q("inspDefault").innerHTML = '';
    ctx.q("blockSettings").classList.add("vis");
  });
  k(40.5, ctx => { ctx.q("bsHead").classList.add("vis"); });
  k(41.0, ctx => { ctx.q("bsFields").classList.add("vis"); });
  k(41.5, ctx => { ctx.cursorTo("prodDbSelect"); });
  k(42.0, ctx => { ctx.clickAt(); ctx.q("prodDbDrop").classList.add("vis"); });
  k(42.5, ctx => { ctx.cursorTo("prodDbOpt"); });
  k(43.0, ctx => {
    ctx.clickAt(); ctx.q("prodDbDrop").classList.remove("vis");
    ctx.q("prodDbVal").textContent = "Miniature YouTube Premium"; ctx.q("prodDbVal").style.color = "#1A1A2E";
    // Update canvas block
    const bl = ctx.q("svcBlock");
    if (bl) { bl.innerHTML = '<div class="b-cblabel">🏷 Miniature YouTube Premium</div><div class="b-cbprice">50 €</div><div class="b-cbbtn">Commander</div>'; bl.classList.add("linked"); }
  });

  // ══════════════════════════════════════════════════════════
  // SCENE 9: SAVE BLOCK (46 → 49s)
  // ══════════════════════════════════════════════════════════
  k(46.0, ctx => { ctx.cursorTo("saveBlockBtn"); });
  k(46.5, ctx => {
    ctx.clickAt();
    ctx.q("saveBlockBtn").classList.add("ok");
    ctx.q("saveBlockLabel").textContent = "✓ Enregistré";
  });
  k(47.5, ctx => {
    ctx.q("saveBlockBtn").classList.remove("ok");
    ctx.q("saveBlockLabel").textContent = "Enregistrer";
  });

  // ══════════════════════════════════════════════════════════
  // SCENE 10: PUBLISH SITE (49 → 54s)
  // ══════════════════════════════════════════════════════════
  k(49.0, ctx => { ctx.cursorTo("publishBtn"); });
  k(49.5, ctx => {
    ctx.clickAt();
    ctx.q("publishBtn").classList.add("ld");
    ctx.q("pubLabel").textContent = "Publication...";
  });
  k(50.5, ctx => {
    ctx.q("publishBtn").classList.remove("ld");
    ctx.q("publishBtn").classList.add("ok");
    ctx.q("pubLabel").textContent = "✓ Site en ligne";
  });
  k(51.5, ctx => { ctx.q("pubConfirm").classList.add("vis"); });
  k(53.0, ctx => { ctx.q("pubConfirm").classList.remove("vis"); });

  // ══════════════════════════════════════════════════════════
  // SCENE 11: CLIENT VIEW — ORDER + BRIEF (54 → 68s)
  // ══════════════════════════════════════════════════════════
  k(54.0, ctx => { ctx.q("shell").classList.remove("vis"); });
  k(54.5, ctx => {
    ctx.q("shell").style.display = "none";
    ctx.q("clientShell").style.display = "";
    ctx.q("clientShell").classList.add("vis");
  });
  k(55.5, ctx => { ctx.q("cProduct").classList.add("vis"); });
  k(56.2, ctx => { ctx.q("cForm").classList.add("vis"); });
  // Fill brief fields quickly
  k(57.0, ctx => { ctx.cursorTo("cF1"); });
  k(57.3, ctx => { ctx.clickAt(); ctx.q("cF1").classList.add("ed"); ctx.q("cF1").textContent = "Miniature vidéo MrBeast"; ctx.q("cF1").classList.remove("ed"); });
  k(57.8, ctx => { ctx.cursorTo("cF2"); });
  k(58.1, ctx => { ctx.clickAt(); ctx.q("cF2").classList.add("ed"); ctx.q("cF2").textContent = "Miniature dynamique, visage surpris, texte jaune…"; ctx.q("cF2").classList.remove("ed"); });
  k(58.6, ctx => { ctx.q("cF3").textContent = "25 mars"; ctx.q("cF3").style.color = "#1A1A2E"; });
  k(59.0, ctx => {
    ctx.q("cF4").innerHTML = '<div class="b-upf" style="padding:2px 4px"><div class="b-upt" style="width:12px;height:12px;font-size:5px;background:#FFF7ED">🖼</div><div class="b-upn" style="font-size:6px">image_ref.jpg</div></div>';
  });
  k(59.4, ctx => { ctx.q("cF5").textContent = "Miniature YouTube"; ctx.q("cF5").style.color = "#1A1A2E"; });
  // Click order
  k(60.0, ctx => { ctx.cursorTo("orderBtn"); });
  k(60.5, ctx => { ctx.clickAt(); ctx.q("orderBtn").classList.add("ld"); ctx.q("orderLabel").textContent = "Envoi…"; });
  k(61.5, ctx => { ctx.q("orderBtn").classList.remove("ld"); ctx.q("orderBtn").classList.add("ok"); ctx.q("orderLabel").textContent = "✓ Commande envoyée"; });
  k(62.5, ctx => { ctx.q("orderOk").classList.add("vis"); });

  // ══════════════════════════════════════════════════════════
  // OUTRO (68 → 75s)
  // ══════════════════════════════════════════════════════════
  k(68.0, ctx => { ctx.q("overlay").classList.add("vis"); });
  k(74.0, ctx => { ctx.q("cur").classList.remove("vis"); });

  return K.sort((a, b) => a.t - b.t);
}

/* ═══════════════════════════════════════════════════════════
   REACT COMPONENT — identical engine to CrmDemoPlayer
   ═══════════════════════════════════════════════════════════ */

export default function BriefsDemoPlayer({
  label = "Créer une offre commandable avec brief intégré",
  accentColor = "#F97316",
}: BriefsDemoPlayerProps) {
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
    const shell = root.querySelector<HTMLElement>("[data-el='shell']") || root.querySelector<HTMLElement>("[data-el='clientShell']");
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

  const SNAP_TIMES = [3.0, 11.0, 14.5, 26.0, 31.5, 40.0, 49.0, 54.0, 68.0];

  const seekTo = useCallback((t: number) => {
    const root = containerRef.current; if (!root) return;
    const snapTimes = [...snapshotsRef.current.keys()].sort((a, b) => a - b);
    let restoreFrom = -1;
    for (const st of snapTimes) { if (st <= t) restoreFrom = st; else break; }
    if (restoreFrom >= 0 && snapshotsRef.current.has(restoreFrom)) {
      const dRoot = root.querySelector(".b-root"); if (dRoot) dRoot.innerHTML = snapshotsRef.current.get(restoreFrom)!;
    } else { root.innerHTML = initialHtmlRef.current; restoreFrom = -1; }
    void root.offsetHeight;
    const ctx = makeCtx(root);
    for (const kf of timelineRef.current) { if (kf.t <= restoreFrom) continue; if (kf.t > t) break; try { kf.apply(ctx); } catch {} }
    lastAppliedRef.current = t; setCurrentTime(t);
  }, [makeCtx]);

  const initialize = useCallback(() => {
    const root = containerRef.current; if (!root) return;
    root.innerHTML = DEMO_HTML; initialHtmlRef.current = DEMO_HTML;
    timelineRef.current = buildTimeline(); snapshotsRef.current.clear(); lastAppliedRef.current = -1;
    void root.offsetHeight; const ctx = makeCtx(root);
    for (const kf of timelineRef.current) { if (kf.t > 0) break; try { kf.apply(ctx); } catch {} }
    const dRoot = root.querySelector(".b-root"); if (dRoot) snapshotsRef.current.set(0, dRoot.innerHTML);
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
        const dRoot = root.querySelector(".b-root");
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
        const dRoot = root.querySelector(".b-root");
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
    const dRoot = root.querySelector(".b-root"); if (dRoot) snapshotsRef.current.set(0, dRoot.innerHTML);
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
    { t: 0, label: "Intro" }, { t: 3, label: "Produit" }, { t: 11, label: "Brief" },
    { t: 14.5, label: "Champs brief" }, { t: 26, label: "Association" }, { t: 31.5, label: "Éditeur" },
    { t: 34, label: "Bloc service" }, { t: 40, label: "Produit BD" }, { t: 46, label: "Enregistrer" },
    { t: 49, label: "Publier" }, { t: 54, label: "Commande" }, { t: 68, label: "Résultat" },
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
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6159" }} /><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFBF2F" }} /><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2ACB42" }} />
                  <div style={{ marginLeft: 8, flex: 1, height: 14, background: "#F3F2F8", borderRadius: 3 }} />
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                  <div style={{ width: "14%", background: "#FFF", borderRight: "1px solid #E8E5F0", padding: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 10 }}>Jestly</div>
                    {["Dashboard", "Produits", "Créateur"].map((l, i) => (
                      <div key={l} style={{ padding: "3px 5px", borderRadius: 3, fontSize: 7, marginBottom: 2, background: i === 1 ? "#FFF7ED" : "transparent", color: i === 1 ? "#F97316" : "#6B7280", fontWeight: i === 1 ? 600 : 400 }}>{l}</div>
                    ))}
                  </div>
                  <div style={{ flex: 1, background: "#F1EFF7", padding: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                      {["Miniature Premium", "Logo Pro"].map(n => (
                        <div key={n} style={{ flex: 1, background: "#FFF", borderRadius: 6, padding: 5, border: "1px solid #E8E5F0" }}>
                          <div style={{ fontSize: 7, fontWeight: 600, color: "#1A1A2E" }}>{n}</div>
                          <div style={{ fontSize: 6, color: "#9CA3AF" }}>50 € · Service</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#FFF", borderRadius: 6, padding: 5, border: "1px solid #E8E5F0" }}>
                      <div style={{ fontSize: 7, fontWeight: 600, color: "#9CA3AF", marginBottom: 3 }}>Brief Miniature YouTube</div>
                      {["Titre", "Briefing", "Deadline", "Fichiers", "Type"].map(f => (
                        <div key={f} style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 2 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: "#FFF7ED" }} />
                          <div style={{ fontSize: 5, color: "#6B7280" }}>{f}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ width: "15%", background: "#FFF", borderLeft: "1px solid #E8E5F0", padding: 4 }}>
                    {[0, 1, 2].map(i => (<div key={i} style={{ marginBottom: 3 }}><div style={{ width: "40%", height: 2, background: "#F0EDF7", borderRadius: 2, marginBottom: 1 }} /><div style={{ height: 8, background: "#FAFAFE", border: "1px solid #E8E5F0", borderRadius: 2 }} /></div>))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0" style={{ background: "rgba(15,14,23,0.35)" }} />
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(249,115,22,1) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`, boxShadow: `0 12px 40px ${accentColor}40` }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <span className="text-[12px] sm:text-[13px] font-medium text-white/70">{label}</span>
              <span className="text-[10px] text-white/40">1:15</span>
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
              <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%`, background: "linear-gradient(90deg, #F97316, #FB923C)" }} />
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
   DEMO HTML — Full flow: Product → Brief → Builder → Publish → Order
   ═══════════════════════════════════════════════════════════ */

const DEMO_HTML = `
<style>
  .b-root{width:100%;height:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;background:#0F0E17;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
  .b-root *,.b-root *::before,.b-root *::after{margin:0;padding:0;box-sizing:border-box}
  .b-shell{width:100%;height:100%;background:#F8F7FC;overflow:hidden;position:relative;opacity:0;transform:scale(0.96);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1),opacity 0.4s ease}
  .b-shell.vis{opacity:1;transform:scale(1)}
  .b-bar{height:26px;background:#FAFAFE;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;padding:0 8px;gap:5px}
  .b-dot{width:7px;height:7px;border-radius:50%}
  .b-url{flex:1;margin-left:6px;height:15px;background:#F3F2F8;border-radius:3px;display:flex;align-items:center;padding:0 6px;font-size:8px;color:#9CA3AF}
  .b-main{display:flex;height:calc(100% - 26px);position:relative}
  .b-tb{position:absolute;top:0;left:0;right:0;height:30px;background:#FFF;border-bottom:1px solid #E8E5F0;display:flex;align-items:center;justify-content:space-between;padding:0 10px;z-index:20}
  .b-logo{font-size:10px;font-weight:800;background:linear-gradient(135deg,#7C5CFF,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .b-div{width:1px;height:14px;background:#E8E5F0;margin:0 6px}
  .b-pn{font-size:8px;color:#6B7280;padding:2px 6px;background:#F5F3FA;border-radius:3px}
  .b-tbl{display:flex;align-items:center;gap:5px}
  .b-abtn{padding:3px 10px;background:#F97316;color:#fff;border:none;border-radius:3px;font-size:9px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px}
  .b-side{width:150px;background:#FFF;border-right:1px solid #E8E5F0;margin-top:30px;overflow:hidden;padding:6px}
  .b-st{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#9CA3AF;margin:5px 0 4px}
  .b-si{display:flex;align-items:center;gap:5px;padding:3px 5px;border-radius:3px;font-size:9px;color:#1A1A2E}
  .b-si.act{background:#FFF7ED;color:#F97316;font-weight:600}
  .b-sic{width:12px;height:12px;border-radius:2px;background:#F0EDF7;display:flex;align-items:center;justify-content:center;font-size:6px;color:#9CA3AF}
  .b-si.act .b-sic{background:rgba(249,115,22,0.1);color:#F97316}
  .b-canvas{flex:1;margin-top:30px;background:#F1EFF7;overflow:hidden;padding:8px;display:flex;flex-direction:column;gap:6px}
  .b-tabbar{display:flex;gap:2px;background:#FFF;border:1px solid #E8E5F0;border-radius:5px;padding:2px;opacity:0;transform:translateY(5px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .b-tabbar.vis{opacity:1;transform:translateY(0)}
  .b-tab{flex:1;padding:4px 8px;border-radius:4px;font-size:8px;font-weight:600;text-align:center;color:#9CA3AF;cursor:pointer;transition:all 0.3s}
  .b-tab.act{background:#FFF7ED;color:#F97316}
  .b-plist{display:flex;flex-direction:column;gap:3px;opacity:0;transform:translateY(6px);transition:all 0.5s cubic-bezier(0.22,1,0.36,1)}
  .b-plist.vis{opacity:1;transform:translateY(0)}
  .b-pcard{display:flex;align-items:center;gap:6px;padding:6px 8px;background:#FFF;border:1px solid #E8E5F0;border-radius:5px;transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .b-pcard.entering{animation:bIn 0.4s cubic-bezier(0.22,1,0.36,1)}
  .b-pcard.hl{border-color:#F97316;box-shadow:0 0 0 2px rgba(249,115,22,0.15)}
  @keyframes bIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .b-picon{width:24px;height:24px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}
  .b-pi{flex:1;min-width:0}
  .b-pn2{font-size:8px;font-weight:600;color:#1A1A2E}
  .b-pp{font-size:6px;color:#9CA3AF;margin-top:1px}
  .b-pbadge{font-size:5px;font-weight:600;padding:1px 5px;border-radius:10px;background:#FFF7ED;color:#F97316;flex-shrink:0}
  .b-cbb{font-size:5px;font-weight:600;padding:1px 5px;border-radius:6px;background:#EDE9FE;color:#7C5CFF;margin-left:auto;flex-shrink:0}
  .b-cbb.entering{animation:bIn 0.3s ease}
  .b-bcard{display:flex;align-items:center;gap:6px;padding:6px 8px;background:#FFF;border:1px solid #E8E5F0;border-radius:5px;transition:all 0.3s}
  .b-bcard.entering{animation:bIn 0.4s ease}
  .b-bcard.sel{border-color:#F97316;box-shadow:0 0 0 2px rgba(249,115,22,0.1)}
  .b-bico{font-size:12px;flex-shrink:0}
  .b-bci{flex:1;min-width:0}
  .b-bcn{font-size:8px;font-weight:600;color:#1A1A2E}
  .b-bcp{font-size:6px;color:#9CA3AF;margin-top:1px}
  .b-modalbg{position:absolute;inset:26px 0 0 0;background:rgba(255,255,255,0.85);backdrop-filter:blur(4px);z-index:40;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s}
  .b-modalbg.open{opacity:1;pointer-events:all}
  .b-modal{width:240px;background:#FFF;border-radius:7px;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid #E8E5F0;transform:translateY(6px) scale(0.97);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1)}
  .b-modalbg.open .b-modal{transform:translateY(0) scale(1)}
  .b-mt{font-size:10px;font-weight:700;color:#1A1A2E;margin-bottom:2px}
  .b-ms{font-size:7px;color:#9CA3AF;margin-bottom:6px}
  .b-fg{margin-bottom:5px}
  .b-fl{font-size:6px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:2px}
  .b-fi{width:100%;padding:3px 5px;border:1px solid #E8E5F0;border-radius:3px;font-size:8px;color:#1A1A2E;background:#FAFAFE;transition:border-color 0.2s;min-height:17px}
  .b-fi.ed{border-color:#F97316;box-shadow:0 0 0 2px rgba(249,115,22,0.1)}
  .b-mbtn{width:100%;padding:4px;background:#F97316;color:#fff;border:none;border-radius:3px;font-size:8px;font-weight:600;cursor:pointer;margin-top:4px}
  .b-sel{width:100%;padding:3px 5px;border:1px solid #E8E5F0;border-radius:3px;font-size:8px;color:#9CA3AF;background:#FAFAFE;display:flex;align-items:center;justify-content:space-between;cursor:pointer;min-height:17px}
  .b-dd{position:absolute;top:100%;left:0;right:0;background:#FFF;border:1px solid #E8E5F0;border-radius:3px;box-shadow:0 4px 10px rgba(0,0,0,0.08);z-index:5;display:none;margin-top:1px}
  .b-dd.open{display:block}
  .b-do{padding:3px 5px;font-size:7px;color:#1A1A2E;cursor:pointer;transition:background 0.15s}
  .b-do:hover{background:#FFF7ED}
  /* Brief editor */
  .b-beditor{display:none;padding:6px;border-top:1px solid #E8E5F0;margin-top:4px}
  .b-beditor.vis{display:block;animation:bIn 0.3s ease}
  .b-bf{background:#FAFAFE;border:1px solid #E8E5F0;border-radius:4px;padding:5px 6px;margin-bottom:4px;opacity:0;transform:translateY(4px);transition:all 0.35s cubic-bezier(0.22,1,0.36,1)}
  .b-bf.vis{opacity:1;transform:translateY(0)}
  .b-bfh{display:flex;align-items:center;gap:4px;margin-bottom:3px}
  .b-bft{width:14px;height:14px;border-radius:2px;background:#FFF7ED;display:flex;align-items:center;justify-content:center;font-size:6px;color:#F97316;flex-shrink:0}
  .b-bfl{font-size:7px;font-weight:600;color:#1A1A2E;flex:1}
  .b-bfr{font-size:5px;font-weight:600;color:#F97316;background:#FFF7ED;padding:1px 4px;border-radius:6px}
  .b-bfin{width:100%;padding:3px 5px;border:1px solid #E8E5F0;border-radius:3px;font-size:7px;color:#1A1A2E;background:#FFF;min-height:15px;transition:border-color 0.2s}
  .b-bfin.ed{border-color:#F97316;box-shadow:0 0 0 1px rgba(249,115,22,0.1)}
  .b-bfta{width:100%;padding:3px 5px;border:1px solid #E8E5F0;border-radius:3px;font-size:7px;color:#1A1A2E;background:#FFF;min-height:24px;line-height:1.3}
  .b-bfta.ed{border-color:#F97316;box-shadow:0 0 0 1px rgba(249,115,22,0.1)}
  .b-bfdate{width:100%;padding:3px 5px;border:1px solid #E8E5F0;border-radius:3px;font-size:7px;color:#9CA3AF;background:#FFF;display:flex;align-items:center;gap:3px;min-height:15px;cursor:pointer}
  .b-upf{display:flex;align-items:center;gap:4px;padding:3px 5px;border-bottom:1px solid #F0EDF7}
  .b-upf:last-child{border-bottom:none}
  .b-upf.entering{animation:bIn 0.3s ease}
  .b-upt{width:16px;height:16px;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:7px;flex-shrink:0}
  .b-upn{font-size:6px;font-weight:500;color:#1A1A2E;flex:1}
  .b-ups{font-size:5px;color:#9CA3AF}
  .b-bfsel{width:100%;padding:3px 5px;border:1px solid #E8E5F0;border-radius:3px;font-size:7px;color:#9CA3AF;background:#FFF;display:flex;align-items:center;justify-content:space-between;cursor:pointer}
  .b-seldrop{position:absolute;top:50%;left:50%;transform:translate(-50%,-40%);width:110px;background:#FFF;border:1px solid #E8E5F0;border-radius:4px;box-shadow:0 6px 18px rgba(0,0,0,0.1);z-index:50;display:none;overflow:hidden}
  .b-seldrop.vis{display:block}
  .b-selopt{padding:4px 6px;font-size:7px;color:#1A1A2E;cursor:pointer;transition:background 0.15s}
  .b-selopt:hover{background:#FFF7ED}
  .b-calpop{position:absolute;top:45%;left:50%;transform:translate(-50%,-50%);width:120px;background:#FFF;border:1px solid #E8E5F0;border-radius:5px;box-shadow:0 6px 18px rgba(0,0,0,0.1);padding:5px;z-index:50;display:none}
  .b-calpop.vis{display:block}
  .b-calh{font-size:7px;font-weight:600;color:#1A1A2E;text-align:center;margin-bottom:3px}
  .b-calg{display:grid;grid-template-columns:repeat(7,1fr);gap:1px}
  .b-cald{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:5px;color:#6B7280;border-radius:2px;cursor:pointer}
  .b-cald.sel{background:#F97316;color:#fff;font-weight:600}
  .b-cald.hd{font-weight:700;color:#9CA3AF;font-size:4px}
  /* Inspector */
  .b-insp{width:170px;background:#FFF;border-left:1px solid #E8E5F0;margin-top:30px;overflow-y:auto;opacity:0;transform:translateX(6px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1);padding:6px;font-size:7px}
  .b-insp.vis{opacity:1;transform:translateX(0)}
  .b-irow{display:flex;align-items:center;justify-content:space-between;padding:3px 0;border-bottom:1px solid #F0EDF7}
  .b-il{color:#9CA3AF}
  .b-iv{font-weight:600;color:#1A1A2E}
  /* Inspector product detail */
  .b-ipd{display:none;padding:0}
  .b-ipd.vis{display:block}
  .b-idsec{opacity:0;transform:translateY(4px);transition:all 0.35s cubic-bezier(0.22,1,0.36,1);margin-bottom:6px}
  .b-idsec.vis{opacity:1;transform:translateY(0)}
  .b-idh{display:flex;align-items:center;gap:6px;margin-bottom:6px}
  .b-idico{width:28px;height:28px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:12px;background:#FFF7ED;flex-shrink:0}
  .b-idn{font-size:9px;font-weight:700;color:#1A1A2E}
  .b-idp{font-size:7px;color:#F97316;font-weight:600}
  .b-idf{display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:5px}
  .b-idfc{padding:4px 5px;background:#FAFAFE;border-radius:3px;border:1px solid #F0EDF7}
  .b-idfl{font-size:5px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:1px}
  .b-idfv{font-size:7px;font-weight:600;color:#1A1A2E}
  .b-abtn2{width:100%;padding:4px 5px;border:1px dashed #E8E5F0;border-radius:4px;font-size:7px;color:#9CA3AF;cursor:pointer;text-align:center;background:#FAFAFE;display:flex;align-items:center;justify-content:center;gap:3px;transition:all 0.2s}
  .b-abtn2.linked{border:1px solid #7C5CFF;background:#EDE9FE;color:#7C5CFF;font-weight:600;border-style:solid}
  .b-add{position:absolute;bottom:100%;left:0;right:0;background:#FFF;border:1px solid #E8E5F0;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.08);display:none;margin-bottom:1px;overflow:hidden}
  .b-add.vis{display:block}
  .b-ado{padding:4px 6px;font-size:7px;color:#1A1A2E;cursor:pointer;display:flex;align-items:center;gap:4px;transition:background 0.15s}
  .b-ado:hover{background:#EDE9FE}
  .b-bbdg{display:none;font-size:5px;font-weight:600;padding:1px 5px;border-radius:6px;background:#EDE9FE;color:#7C5CFF;margin-top:3px;text-align:center}
  .b-bbdg.vis{display:block;animation:bIn 0.3s ease}
  /* Builder view */
  .b-bview{display:none;flex:1;margin-top:30px;background:#F1EFF7;overflow:hidden;padding:8px;flex-direction:column;gap:6px}
  .b-bview.vis{display:flex}
  .b-bcanvas{flex:1;background:#FFF;border:1px solid #E8E5F0;border-radius:6px;overflow:hidden;opacity:0;transform:translateY(5px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1);padding:6px}
  .b-bcanvas.vis{opacity:1;transform:translateY(0)}
  .b-cblock{padding:6px 8px;background:#FAFAFE;border:1px solid #E8E5F0;border-radius:4px;margin-bottom:3px;transition:all 0.3s}
  .b-cblock.entering{animation:bIn 0.4s ease}
  .b-cblock.linked{border-color:#F97316;background:#FFF7ED}
  .b-cblabel{font-size:8px;font-weight:600;color:#1A1A2E}
  .b-cbsub{font-size:6px;color:#9CA3AF;margin-top:1px}
  .b-cbprice{font-size:7px;color:#F97316;font-weight:600;margin-top:1px}
  .b-cbbtn{display:inline-block;padding:2px 8px;background:#F97316;color:#fff;border-radius:3px;font-size:6px;font-weight:600;margin-top:3px}
  .b-btbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
  .b-blib{position:absolute;inset:26px 0 0 0;background:rgba(255,255,255,0.9);backdrop-filter:blur(3px);z-index:35;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s}
  .b-blib.open{opacity:1;pointer-events:all}
  .b-blmod{width:260px;background:#FFF;border-radius:7px;padding:10px;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid #E8E5F0;transform:translateY(5px) scale(0.97);transition:transform 0.35s cubic-bezier(0.22,1,0.36,1)}
  .b-blib.open .b-blmod{transform:translateY(0) scale(1)}
  .b-bcat{display:flex;gap:2px;margin-bottom:6px}
  .b-bcati{padding:3px 8px;border-radius:3px;font-size:7px;font-weight:600;color:#9CA3AF;cursor:pointer;transition:all 0.2s}
  .b-bcati.act{background:#FFF7ED;color:#F97316}
  .b-blitem{display:flex;align-items:center;gap:5px;padding:5px 6px;border:1px solid #E8E5F0;border-radius:4px;margin-bottom:3px;cursor:pointer;transition:all 0.2s}
  .b-blitem:hover{border-color:#F97316;background:#FFF7ED}
  .b-blico{width:20px;height:20px;border-radius:4px;background:#FFF7ED;display:flex;align-items:center;justify-content:center;font-size:9px}
  .b-bln{font-size:7px;font-weight:600;color:#1A1A2E}
  .b-bld{font-size:6px;color:#9CA3AF}
  .b-venteb{display:none}.b-venteb.vis{display:block}
  /* Block settings */
  .b-bset{display:none;padding:0}
  .b-bset.vis{display:block}
  .b-bshead{opacity:0;transform:translateY(4px);transition:all 0.3s;margin-bottom:5px}
  .b-bshead.vis{opacity:1;transform:translateY(0)}
  .b-bsf{opacity:0;transform:translateY(4px);transition:all 0.3s}
  .b-bsf.vis{opacity:1;transform:translateY(0)}
  .b-pdbsel{width:100%;padding:3px 5px;border:1px solid #E8E5F0;border-radius:3px;font-size:7px;color:#9CA3AF;background:#FAFAFE;display:flex;align-items:center;justify-content:space-between;cursor:pointer;min-height:17px}
  .b-pdbd{position:absolute;top:100%;left:0;right:0;background:#FFF;border:1px solid #E8E5F0;border-radius:3px;box-shadow:0 4px 10px rgba(0,0,0,0.08);z-index:5;display:none;margin-top:1px}
  .b-pdbd.vis{display:block}
  .b-savebtn{width:100%;padding:4px;background:#F97316;color:#fff;border:none;border-radius:3px;font-size:8px;font-weight:600;cursor:pointer;margin-top:6px;transition:all 0.3s}
  .b-savebtn.ok{background:#10B981}
  .b-pubbtn{padding:3px 10px;background:#8B5CF6;color:#fff;border:none;border-radius:3px;font-size:8px;font-weight:600;cursor:pointer;transition:all 0.3s}
  .b-pubbtn.ld{background:#6D28D9}
  .b-pubbtn.ok{background:#10B981}
  .b-pubconf{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#FFF;border-radius:8px;padding:12px 18px;box-shadow:0 10px 30px rgba(0,0,0,0.12);border:1px solid #E8E5F0;text-align:center;z-index:45;display:none}
  .b-pubconf.vis{display:block;animation:bIn 0.3s ease}
  /* Client shell */
  .b-cs{width:100%;height:100%;background:#F8F7FC;overflow:hidden;position:relative;opacity:0;transform:scale(0.96);transition:transform 0.5s cubic-bezier(0.22,1,0.36,1),opacity 0.4s ease;display:none}
  .b-cs.vis{opacity:1;transform:scale(1)}
  .b-cc{padding:12px 16px;max-width:420px;margin:0 auto}
  .b-cprod{display:flex;align-items:center;gap:8px;padding:8px;background:#FFF;border:1px solid #E8E5F0;border-radius:6px;margin-bottom:10px;opacity:0;transform:translateY(5px);transition:all 0.4s cubic-bezier(0.22,1,0.36,1)}
  .b-cprod.vis{opacity:1;transform:translateY(0)}
  .b-cform{background:#FFF;border:1px solid #E8E5F0;border-radius:6px;padding:8px;opacity:0;transform:translateY(6px);transition:all 0.5s cubic-bezier(0.22,1,0.36,1)}
  .b-cform.vis{opacity:1;transform:translateY(0)}
  .b-cft{font-size:8px;font-weight:700;color:#1A1A2E;margin-bottom:1px}
  .b-cfs{font-size:6px;color:#9CA3AF;margin-bottom:6px}
  .b-cfg{margin-bottom:4px}
  .b-cfl{font-size:6px;font-weight:600;color:#6B7280;margin-bottom:1px}
  .b-cfi{width:100%;padding:3px 5px;border:1px solid #E8E5F0;border-radius:3px;font-size:7px;color:#1A1A2E;background:#FAFAFE;min-height:15px;transition:border-color 0.2s}
  .b-cfi.ed{border-color:#F97316;box-shadow:0 0 0 1px rgba(249,115,22,0.1)}
  .b-obtn{width:100%;padding:5px;background:#F97316;color:#fff;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;margin-top:6px;transition:all 0.3s}
  .b-obtn.ld{background:#EA580C}
  .b-obtn.ok{background:#10B981}
  .b-ook{display:none;margin-top:6px;padding:6px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:5px;text-align:center}
  .b-ook.vis{display:block;animation:bIn 0.3s ease}
  .b-ookico{font-size:14px;margin-bottom:1px}
  .b-ookt{font-size:8px;font-weight:700;color:#10B981}
  .b-ooks{font-size:6px;color:#6B7280;margin-top:1px}
  /* Overlay */
  .b-ov{position:absolute;inset:0;background:rgba(255,255,255,0.95);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:50;opacity:0;pointer-events:none;transition:opacity 0.5s}
  .b-ov.vis{opacity:1;pointer-events:all}
  .b-okico{width:36px;height:36px;border-radius:50%;background:#10B981;display:flex;align-items:center;justify-content:center;margin-bottom:10px;transform:scale(0);transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1)}
  .b-ov.vis .b-okico{transform:scale(1)}
  .b-okt{font-size:13px;font-weight:700;color:#1A1A2E;margin-bottom:3px;text-align:center}
  .b-oks{font-size:9px;color:#6B7280;margin-bottom:6px;text-align:center}
  .b-oku{font-size:9px;color:#F97316;background:#FFF7ED;padding:3px 10px;border-radius:12px;font-weight:500}
  /* Cursor */
  .b-cur{position:absolute;width:12px;height:15px;z-index:100;pointer-events:none;opacity:0;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.2));transition:opacity 0.3s}
  .b-cur.vis{opacity:1}
  .b-clk{position:absolute;width:16px;height:16px;border-radius:50%;background:rgba(249,115,22,0.3);transform:translate(-2px,-1px) scale(0);pointer-events:none;z-index:99}
  .b-clk.pop{animation:bPop 0.35s ease-out forwards}
  @keyframes bPop{0%{transform:translate(-2px,-1px) scale(0);opacity:1}100%{transform:translate(-2px,-1px) scale(2);opacity:0}}
</style>

<div class="b-root">

<!-- ═══ ADMIN SHELL ═══ -->
<div class="b-shell" data-el="shell">
  <div class="b-bar"><div class="b-dot" style="background:#FF6159"></div><div class="b-dot" style="background:#FFBF2F"></div><div class="b-dot" style="background:#2ACB42"></div><div class="b-url" data-el="barUrl"><span style="margin-right:3px">🔒</span>app.jestly.fr/offres</div></div>

  <div class="b-main">
    <div class="b-tb">
      <div class="b-tbl"><span class="b-logo">Jestly</span><div class="b-div"></div><span class="b-pn" data-el="pageTitle">Produits & Briefs</span></div>
      <div class="b-tbl">
        <button class="b-pubbtn" data-el="publishBtn"><span data-el="pubLabel">Publier</span></button>
        <button class="b-abtn" data-el="addProdBtn">+ Nouvelle offre</button>
      </div>
    </div>

    <div class="b-side">
      <div class="b-st">Navigation</div>
      <div class="b-si"><div class="b-sic">⌂</div>Dashboard</div>
      <div class="b-si act" data-el="sideProd"><div class="b-sic">🏷</div>Produits</div>
      <div class="b-si" data-el="sideBuilder"><div class="b-sic">✎</div>Créateur</div>
      <div class="b-si"><div class="b-sic">☰</div>Commandes</div>
      <div class="b-si"><div class="b-sic">♦</div>Clients</div>
    </div>

    <!-- Products/Briefs view -->
    <div class="b-canvas" data-el="prodView">
      <div class="b-tabbar" data-el="tabs">
        <div class="b-tab act">🏷 Produits</div>
        <div class="b-tab">📋 Briefs</div>
      </div>
      <div data-el="scrollArea" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:4px">
        <div style="font-size:7px;font-weight:600;color:#9CA3AF;margin-bottom:1px">OFFRES ACTIVES</div>
        <div class="b-plist" data-el="prodList">
          <div class="b-pcard"><div class="b-picon" style="background:#EDE9FE">🎨</div><div class="b-pi"><div class="b-pn2">Logo Professionnel</div><div class="b-pp">120 € · Service</div></div><div class="b-pbadge" style="background:#EDE9FE;color:#7C5CFF">Populaire</div></div>
          <div class="b-pcard"><div class="b-picon" style="background:#DBEAFE">🖼</div><div class="b-pi"><div class="b-pn2">Bannière réseaux sociaux</div><div class="b-pp">35 € · Digital</div></div></div>
        </div>
        <div data-el="briefSec" style="margin-top:6px;border-top:1px solid #E8E5F0;padding-top:6px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px">
            <div style="font-size:7px;font-weight:600;color:#9CA3AF">BRIEFS</div>
            <button class="b-abtn" data-el="addBriefBtn" style="padding:2px 6px;font-size:7px">+ Créer un brief</button>
          </div>
          <div data-el="briefList">
            <div class="b-bcard"><div class="b-bico">📋</div><div class="b-bci"><div class="b-bcn">Brief Logo Standard</div><div class="b-bcp">3 champs · Utilisé 12 fois</div></div></div>
          </div>
          <!-- Brief editor (inline, expanded when brief clicked) -->
          <div class="b-beditor" data-el="briefEditor">
            <div style="font-size:7px;font-weight:600;color:#1A1A2E;margin-bottom:4px">📋 Brief Miniature YouTube — Champs</div>
            <div data-el="bf1" class="b-bf"><div class="b-bfh"><div class="b-bft">Aa</div><div class="b-bfl">Titre du projet</div><div class="b-bfr">Requis</div></div><div class="b-bfin" data-el="bf1val"></div></div>
            <div data-el="bf2" class="b-bf"><div class="b-bfh"><div class="b-bft">¶</div><div class="b-bfl">Briefing créatif</div><div class="b-bfr">Requis</div></div><div class="b-bfta" data-el="bf2val"></div></div>
            <div data-el="bf3" class="b-bf"><div class="b-bfh"><div class="b-bft">📅</div><div class="b-bfl">Deadline</div><div class="b-bfr">Requis</div></div><div class="b-bfdate" data-el="bf3val"><span style="font-size:7px">📅</span><span data-el="bf3date">Choisir…</span></div></div>
            <div data-el="bf4" class="b-bf"><div class="b-bfh"><div class="b-bft">📎</div><div class="b-bfl">Fichiers / références</div></div><div data-el="bf4zone" style="border:1px dashed #E8E5F0;border-radius:3px;padding:4px;text-align:center;font-size:6px;color:#9CA3AF">Glisser ou cliquer</div></div>
            <div data-el="bf5" class="b-bf"><div class="b-bfh"><div class="b-bft">▾</div><div class="b-bfl">Type de création</div><div class="b-bfr">Requis</div></div><div class="b-bfsel" data-el="bf5sel"><span data-el="bf5text">Choisir…</span><span style="font-size:6px">▾</span></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Builder view (hidden by default) -->
    <div class="b-bview" data-el="builderView">
      <div class="b-btbar">
        <div style="font-size:7px;font-weight:600;color:#9CA3AF">APERÇU DU SITE</div>
        <button class="b-abtn" data-el="addBlockBtn" style="padding:2px 8px;font-size:7px">+ Ajouter un bloc</button>
      </div>
      <div class="b-bcanvas" data-el="builderCanvas">
        <div class="b-cblock"><div class="b-cblabel">🌟 Hero</div><div class="b-cbsub">Titre principal du site</div></div>
        <div class="b-cblock"><div class="b-cblabel">ℹ️ À propos</div><div class="b-cbsub">Présentation de l'activité</div></div>
        <div class="b-cblock"><div class="b-cblabel">📧 Contact</div><div class="b-cbsub">Formulaire de contact</div></div>
        <div data-el="builderBlocks"></div>
      </div>
    </div>

    <!-- Inspector -->
    <div class="b-insp" data-el="insp">
      <div data-el="inspDefault">
        <div class="b-fl" style="margin-bottom:4px">Résumé</div>
        <div class="b-irow"><span class="b-il">Offres</span><span class="b-iv">2</span></div>
        <div class="b-irow"><span class="b-il">Briefs</span><span class="b-iv">1</span></div>
        <div class="b-irow"><span class="b-il">Commandes</span><span class="b-iv">14</span></div>
      </div>
      <!-- Product detail -->
      <div class="b-ipd" data-el="inspProd">
        <div class="b-idsec" data-el="ipHead">
          <div class="b-idh"><div class="b-idico">🎨</div><div><div class="b-idn">Miniature YouTube Premium</div><div class="b-idp">50 €</div></div></div>
        </div>
        <div class="b-idsec" data-el="ipFields">
          <div class="b-idf">
            <div class="b-idfc"><div class="b-idfl">Type</div><div class="b-idfv">Service</div></div>
            <div class="b-idfc"><div class="b-idfl">Statut</div><div class="b-idfv">Actif</div></div>
          </div>
          <div class="b-fl" style="margin-top:4px;margin-bottom:2px">Brief associé</div>
          <div style="position:relative">
            <button class="b-abtn2" data-el="assocBtn">+ Associer un brief</button>
            <div class="b-add" data-el="assocDrop"><div class="b-ado" data-el="assocOpt">📋 Brief Miniature YouTube</div><div class="b-ado">📋 Brief Logo Standard</div></div>
          </div>
          <div class="b-bbdg" data-el="briefBadge">📋 Brief requis à la commande</div>
        </div>
      </div>
      <!-- Block settings -->
      <div class="b-bset" data-el="blockSettings">
        <div class="b-bshead" data-el="bsHead">
          <div style="font-size:8px;font-weight:700;color:#1A1A2E;margin-bottom:1px">🏷 Bloc Service</div>
          <div style="font-size:6px;color:#9CA3AF">Configurez le produit à afficher</div>
        </div>
        <div class="b-bsf" data-el="bsFields">
          <div class="b-fl" style="margin-top:6px;margin-bottom:2px">Produit BD</div>
          <div style="position:relative">
            <div class="b-pdbsel" data-el="prodDbSelect"><span data-el="prodDbVal">Choisir un produit…</span><span style="font-size:6px">▾</span></div>
            <div class="b-pdbd" data-el="prodDbDrop">
              <div class="b-do" data-el="prodDbOpt">🎨 Miniature YouTube Premium — 50 €</div>
              <div class="b-do">🎨 Logo Professionnel — 120 €</div>
              <div class="b-do">🖼 Bannière réseaux sociaux — 35 €</div>
            </div>
          </div>
          <div class="b-fl" style="margin-top:5px;margin-bottom:2px">Style du bloc</div>
          <div class="b-fi" style="font-size:7px;color:#1A1A2E">Carte avec CTA</div>
          <button class="b-savebtn" data-el="saveBlockBtn"><span data-el="saveBlockLabel">Enregistrer</span></button>
        </div>
      </div>
    </div>
  </div>

  <!-- Product creation modal -->
  <div class="b-modalbg" data-el="modalProd">
    <div class="b-modal">
      <div class="b-mt">Nouvelle offre</div>
      <div class="b-ms">Créez un produit ou service à vendre.</div>
      <div class="b-fg"><div class="b-fl">Nom du produit</div><div class="b-fi" data-el="pName"></div></div>
      <div class="b-fg"><div class="b-fl">Prix</div><div class="b-fi" data-el="pPrice"></div></div>
      <div class="b-fg"><div class="b-fl">Description</div><div class="b-fi" data-el="pDesc" style="min-height:24px"></div></div>
      <div class="b-fg" style="position:relative"><div class="b-fl">Type</div><div class="b-sel" data-el="pType"><span data-el="pTypeVal" style="color:#9CA3AF">Choisir…</span><span style="font-size:6px">▾</span></div><div class="b-dd" data-el="pTypeDrop"><div class="b-do" data-el="pTypeSvc">Service</div><div class="b-do">Pack</div><div class="b-do">Digital</div></div></div>
      <button class="b-mbtn" data-el="prodSubmit">Créer le produit</button>
    </div>
  </div>

  <!-- Brief creation modal -->
  <div class="b-modalbg" data-el="modalBrief">
    <div class="b-modal">
      <div class="b-mt">Nouveau brief</div>
      <div class="b-ms">Définissez les infos à collecter.</div>
      <div class="b-fg"><div class="b-fl">Nom du template</div><div class="b-fi" data-el="bName"></div></div>
      <button class="b-mbtn" data-el="briefCreateBtn">Créer avec champs par défaut</button>
    </div>
  </div>

  <!-- Block library -->
  <div class="b-blib" data-el="blockLib">
    <div class="b-blmod">
      <div style="font-size:9px;font-weight:700;color:#1A1A2E;margin-bottom:4px">Ajouter un bloc</div>
      <div class="b-bcat">
        <div class="b-bcati act" data-el="catContenu">Contenu</div>
        <div class="b-bcati" data-el="catVente">Vente</div>
        <div class="b-bcati">Formulaire</div>
      </div>
      <div data-el="contenuBlocks">
        <div class="b-blitem"><div class="b-blico">🌟</div><div><div class="b-bln">Hero</div><div class="b-bld">Bannière principale</div></div></div>
        <div class="b-blitem"><div class="b-blico">📝</div><div><div class="b-bln">Texte</div><div class="b-bld">Paragraphe libre</div></div></div>
      </div>
      <div class="b-venteb" data-el="venteBlocks">
        <div class="b-blitem" data-el="blockSvc"><div class="b-blico">🏷</div><div><div class="b-bln">Bloc Service</div><div class="b-bld">Vente d'un service avec CTA</div></div></div>
        <div class="b-blitem"><div class="b-blico">📦</div><div><div class="b-bln">Pack Offres</div><div class="b-bld">Grille d'offres comparative</div></div></div>
        <div class="b-blitem"><div class="b-blico">💳</div><div><div class="b-bln">Checkout rapide</div><div class="b-bld">Paiement en ligne direct</div></div></div>
      </div>
    </div>
  </div>

  <!-- Calendar popup -->
  <div class="b-calpop" data-el="calPop">
    <div class="b-calh">Mars 2026</div>
    <div class="b-calg">
      <div class="b-cald hd">L</div><div class="b-cald hd">M</div><div class="b-cald hd">M</div><div class="b-cald hd">J</div><div class="b-cald hd">V</div><div class="b-cald hd">S</div><div class="b-cald hd">D</div>
      <div class="b-cald"></div><div class="b-cald"></div><div class="b-cald"></div><div class="b-cald"></div><div class="b-cald"></div><div class="b-cald"></div><div class="b-cald">1</div>
      <div class="b-cald">2</div><div class="b-cald">3</div><div class="b-cald">4</div><div class="b-cald">5</div><div class="b-cald">6</div><div class="b-cald">7</div><div class="b-cald">8</div>
      <div class="b-cald">9</div><div class="b-cald">10</div><div class="b-cald">11</div><div class="b-cald">12</div><div class="b-cald">13</div><div class="b-cald">14</div><div class="b-cald">15</div>
      <div class="b-cald">16</div><div class="b-cald">17</div><div class="b-cald">18</div><div class="b-cald">19</div><div class="b-cald">20</div><div class="b-cald">21</div><div class="b-cald">22</div>
      <div class="b-cald">23</div><div class="b-cald">24</div><div class="b-cald sel" data-el="cal25">25</div><div class="b-cald">26</div><div class="b-cald">27</div><div class="b-cald">28</div><div class="b-cald">29</div>
      <div class="b-cald">30</div><div class="b-cald">31</div>
    </div>
  </div>

  <!-- Select field dropdown -->
  <div class="b-seldrop" data-el="bf5drop">
    <div class="b-selopt" data-el="bf5optMini">Miniature YouTube</div>
    <div class="b-selopt">Logo</div>
    <div class="b-selopt">Bannière</div>
  </div>

  <!-- Publish confirmation -->
  <div class="b-pubconf" data-el="pubConfirm">
    <div style="font-size:14px;margin-bottom:3px">✅</div>
    <div style="font-size:9px;font-weight:700;color:#10B981">Site en ligne !</div>
    <div style="font-size:7px;color:#6B7280;margin-top:1px">Vos clients peuvent commander.</div>
  </div>
</div>

<!-- ═══ CLIENT SHELL ═══ -->
<div class="b-cs" data-el="clientShell">
  <div class="b-bar"><div class="b-dot" style="background:#FF6159"></div><div class="b-dot" style="background:#FFBF2F"></div><div class="b-dot" style="background:#2ACB42"></div><div class="b-url"><span style="margin-right:3px">🔒</span>jestly.fr/s/monsite/miniature-youtube-premium</div></div>
  <div class="b-cc">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><span class="b-logo">Jestly</span><span style="font-size:7px;color:#9CA3AF">Page de commande</span></div>
    <div class="b-cprod" data-el="cProduct">
      <div style="width:28px;height:28px;border-radius:5px;background:#FFF7ED;display:flex;align-items:center;justify-content:center;font-size:12px">🎨</div>
      <div style="flex:1"><div style="font-size:9px;font-weight:600;color:#1A1A2E">Miniature YouTube Premium</div><div style="font-size:7px;color:#F97316;font-weight:600">50 €</div></div>
    </div>
    <div class="b-cform" data-el="cForm">
      <div class="b-cft">📋 Brief à compléter</div>
      <div class="b-cfs">Remplissez le brief pour finaliser votre commande.</div>
      <div class="b-cfg"><div class="b-cfl">Titre du projet</div><div class="b-cfi" data-el="cF1"></div></div>
      <div class="b-cfg"><div class="b-cfl">Briefing créatif</div><div class="b-cfi" data-el="cF2" style="min-height:20px"></div></div>
      <div class="b-cfg"><div class="b-cfl">Deadline</div><div class="b-cfi" data-el="cF3" style="color:#9CA3AF">Choisir…</div></div>
      <div class="b-cfg"><div class="b-cfl">Fichiers</div><div class="b-cfi" data-el="cF4" style="min-height:18px"></div></div>
      <div class="b-cfg"><div class="b-cfl">Type de création</div><div class="b-cfi" data-el="cF5" style="color:#9CA3AF">Choisir…</div></div>
      <button class="b-obtn" data-el="orderBtn"><span data-el="orderLabel">Commander · 50 €</span></button>
      <div class="b-ook" data-el="orderOk"><div class="b-ookico">✅</div><div class="b-ookt">Commande reçue !</div><div class="b-ooks">Brief complété · Vous serez notifié.</div></div>
    </div>
  </div>
</div>

<!-- Overlay -->
<div class="b-ov" data-el="overlay">
  <div class="b-okico"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M5 13l4 4L19 7"/></svg></div>
  <div class="b-okt">Chaque offre devient claire, commandable et structurée</div>
  <div class="b-oks">Moins d'allers-retours, plus de commandes prêtes à produire.</div>
  <div style="height:3px"></div>
  <div class="b-oku">Produit → Brief → Bloc → Publier → Commande</div>
</div>

<!-- Cursor -->
<div class="b-cur" data-el="cur"><svg viewBox="0 0 24 24" fill="none" width="12" height="15"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="#1A1A2E" stroke-width="1.5" stroke-linejoin="round"/></svg><div class="b-clk" data-el="clk"></div></div>

</div>
`;
