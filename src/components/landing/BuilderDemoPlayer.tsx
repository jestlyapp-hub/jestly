"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;
const TOTAL_DURATION = 30; // seconds

interface BuilderDemoPlayerProps {
  label?: string;
  accentColor?: string;
}

/* ═══════════════════════════════════════════════════════════
   TIMELINE KEYFRAME SYSTEM
   Each keyframe = { t: seconds, apply: (root) => void }
   The engine captures DOM snapshots at each keyframe so we
   can seek forward/backward instantly.
   ═══════════════════════════════════════════════════════════ */

interface Keyframe {
  t: number; // time in seconds
  apply: (ctx: DemoCtx) => void;
}

interface DemoCtx {
  root: HTMLElement;
  q: (s: string) => HTMLElement;
  /** Move cursor to center of a data-el target, relative to the shell */
  cursorTo: (dataEl: string, offsetX?: number, offsetY?: number) => void;
  clickAt: () => void;
  applyColor: (c: string) => void;
  addSideBlock: (name: string, color: string) => void;
  setTab: (tab: string) => void;
}

function buildTimeline(): Keyframe[] {
  const K: Keyframe[] = [];
  const k = (t: number, apply: (ctx: DemoCtx) => void) => K.push({ t, apply });

  // ── SCENE 1: INTRO (0 → 3.5s) ──
  k(0, ctx => {
    ctx.q("shell").classList.add("vis");
  });
  k(0.8, ctx => {
    ctx.cursorTo("hero");
    ctx.q("cur").classList.add("vis");
  });
  k(1.2, ctx => {
    ctx.q("insp").classList.add("vis");
  });
  k(1.6, ctx => {
    ctx.q("hero").classList.add("sel");
  });

  // ── SCENE 2: ADD BLOCKS (3.5 → 8s) ──
  k(3.5, ctx => {
    ctx.cursorTo("addBtn");
  });
  k(4.0, ctx => {
    ctx.clickAt();
    ctx.q("lib").classList.add("open");
  });

  // Services
  k(4.6, ctx => { ctx.cursorTo("libSvc"); });
  k(4.9, ctx => {
    ctx.clickAt();
    ctx.addSideBlock("Services", "#F97316");
    const svc = document.createElement("div"); svc.className = "d-block vis"; svc.setAttribute("data-el", "bSvc");
    svc.innerHTML = `<div class="d-btitle">Services premium</div><div class="d-sgrid"><div class="d-scard"><div class="d-sicon">🎬</div><div class="d-sname">Montage vidéo</div><div class="d-sdesc">Post-production</div></div><div class="d-scard"><div class="d-sicon">✨</div><div class="d-sname">Motion design</div><div class="d-sdesc">Animations</div></div><div class="d-scard"><div class="d-sicon">🎨</div><div class="d-sname">Étalonnage</div><div class="d-sdesc">Color grading</div></div></div>`;
    ctx.q("dynBlocks").appendChild(svc);
  });

  // Témoignages
  k(5.6, ctx => { ctx.cursorTo("libTst"); });
  k(5.9, ctx => {
    ctx.clickAt();
    ctx.addSideBlock("Témoignages", "#A855F7");
    const tst = document.createElement("div"); tst.className = "d-block vis";
    tst.innerHTML = `<div class="d-btitle">Témoignages</div><div class="d-tcards"><div class="d-tcard"><div class="d-tstars">★★★★★</div><div class="d-ttext">"Montage impeccable, livré en avance !"</div><div class="d-tauth">Marie L.</div><div class="d-trole">CEO, Studio Bloom</div></div><div class="d-tcard"><div class="d-tstars">★★★★★</div><div class="d-ttext">"Créatif, réactif et professionnel."</div><div class="d-tauth">Thomas D.</div><div class="d-trole">Fondateur, TechFlow</div></div></div>`;
    ctx.q("dynBlocks").appendChild(tst);
  });

  // CTA
  k(6.6, ctx => { ctx.cursorTo("libCta"); });
  k(6.9, ctx => {
    ctx.clickAt();
    ctx.addSideBlock("CTA", "#10B981");
    const cta = document.createElement("div"); cta.className = "d-block vis";
    cta.innerHTML = `<div class="d-ctabl"><div class="d-ctat">Prêt à démarrer ?</div><div class="d-ctad">Devis gratuit sous 24h.</div><span class="d-ctab">Demander un devis</span></div>`;
    ctx.q("dynBlocks").appendChild(cta);
  });

  k(7.4, ctx => { ctx.q("lib").classList.remove("open"); });

  // ── SCENE 3: EDIT TEXT (8 → 15s) ──
  k(8.0, ctx => {
    // Click the first block item in sidebar
    const first = ctx.root.querySelector(".d-bitem") as HTMLElement;
    if (first) ctx.cursorTo("blist", -30, -10);
    ctx.clickAt();
    ctx.root.querySelectorAll(".d-bitem").forEach(b => b.classList.remove("sel"));
    ctx.root.querySelector(".d-bitem")?.classList.add("sel");
  });

  // Badge
  k(8.5, ctx => { ctx.cursorTo("fBadge"); });
  k(8.8, ctx => {
    ctx.clickAt();
    ctx.q("fBadge").classList.add("ed");
  });
  k(9.0, ctx => {
    ctx.q("fBadge").textContent = "Monteur";
    ctx.q("badge").textContent = "Monteur";
  });
  k(9.3, ctx => {
    ctx.q("fBadge").textContent = "Monteur vidéo";
    ctx.q("badge").textContent = "Monteur vidéo";
    ctx.q("fBadge").classList.remove("ed");
  });

  // Title
  k(9.6, ctx => { ctx.cursorTo("fTitle"); });
  k(9.9, ctx => {
    ctx.clickAt();
    ctx.q("fTitle").classList.add("ed");
    ctx.q("fTitle").textContent = "Des vidéos";
    ctx.q("htitle").textContent = "Des vidéos";
  });
  k(10.3, ctx => {
    ctx.q("fTitle").textContent = "Des vidéos qui marquent";
    ctx.q("htitle").textContent = "Des vidéos qui marquent";
  });
  k(10.7, ctx => {
    ctx.q("fTitle").textContent = "Des vidéos qui marquent les esprits";
    ctx.q("htitle").textContent = "Des vidéos qui marquent les esprits";
    ctx.q("fTitle").classList.remove("ed");
  });

  // Subtitle
  k(11.0, ctx => { ctx.cursorTo("fSub"); });
  k(11.3, ctx => {
    ctx.clickAt();
    ctx.q("fSub").classList.add("ed");
    ctx.q("fSub").textContent = "Montage, motion design";
    ctx.q("hsub").textContent = "Montage, motion design";
  });
  k(11.7, ctx => {
    ctx.q("fSub").textContent = "Montage, motion design et post-production";
    ctx.q("hsub").textContent = "Montage, motion design et post-production";
  });
  k(12.1, ctx => {
    const t = "Montage, motion design et post-production premium.";
    ctx.q("fSub").textContent = t;
    ctx.q("hsub").textContent = t;
    ctx.q("fSub").classList.remove("ed");
  });

  // CTA button
  k(12.4, ctx => { ctx.cursorTo("fCta"); });
  k(12.7, ctx => {
    ctx.clickAt();
    ctx.q("fCta").classList.add("ed");
    ctx.q("fCta").textContent = "Voir le";
    ctx.q("hcta").textContent = "Voir le";
  });
  k(13.0, ctx => {
    ctx.q("fCta").textContent = "Voir le showreel";
    ctx.q("hcta").textContent = "Voir le showreel";
    ctx.q("fCta").classList.remove("ed");
  });

  // ── SCENE 4: DESIGN (15 → 21s) ──
  k(15.0, ctx => { ctx.cursorTo("tabD"); });
  k(15.3, ctx => {
    ctx.clickAt();
    ctx.setTab("tabD");
    ctx.q("cFields").style.display = "none";
    ctx.q("dPanel").classList.add("vis");
  });

  // Orange preset
  k(16.0, ctx => { ctx.cursorTo("prOrange"); });
  k(16.3, ctx => {
    ctx.clickAt();
    ctx.root.querySelectorAll(".d-pcard").forEach(p => p.classList.remove("act"));
    ctx.q("prOrange").classList.add("act");
    ctx.applyColor("#F97316");
    ctx.q("pVal").textContent = "#F97316";
  });

  // Teal preset
  k(17.2, ctx => { ctx.cursorTo("prTeal"); });
  k(17.5, ctx => {
    ctx.clickAt();
    ctx.root.querySelectorAll(".d-pcard").forEach(p => p.classList.remove("act"));
    ctx.q("prTeal").classList.add("act");
    ctx.applyColor("#0EA5E9");
    ctx.q("pVal").textContent = "#0EA5E9";
  });

  // Back to purple
  k(18.3, ctx => { ctx.cursorTo("prPurple"); });
  k(18.6, ctx => {
    ctx.clickAt();
    ctx.root.querySelectorAll(".d-pcard").forEach(p => p.classList.remove("act"));
    ctx.q("prPurple").classList.add("act");
    ctx.applyColor("#7C5CFF");
    ctx.q("pVal").textContent = "#7C5CFF";
  });

  // Font change
  k(19.0, ctx => { ctx.cursorTo("fFont"); });
  k(19.3, ctx => {
    ctx.clickAt();
    ctx.q("fFont").classList.add("ed");
  });
  k(19.7, ctx => {
    ctx.q("fFont").textContent = "Space Grotesk — Bold";
    ctx.q("htitle").style.fontFamily = "'Segoe UI',sans-serif";
    ctx.q("htitle").style.letterSpacing = "-0.7px";
    ctx.q("fFont").classList.remove("ed");
  });

  // ── SCENE 5: NAVIGATION (21 → 26s) ──
  k(21.0, ctx => { ctx.cursorTo("tabN"); });
  k(21.3, ctx => {
    ctx.clickAt();
    ctx.setTab("tabN");
    ctx.q("dPanel").classList.remove("vis");
    ctx.q("nPanel").classList.add("vis");
  });

  // Edit Contact → Devis gratuit
  k(22.0, ctx => { ctx.cursorTo("nContact"); });
  k(22.3, ctx => {
    ctx.clickAt();
    ctx.q("nContact").classList.add("ed");
    (ctx.q("nContact").querySelector("input") as HTMLInputElement).value = "Devis";
  });
  k(22.7, ctx => {
    (ctx.q("nContact").querySelector("input") as HTMLInputElement).value = "Devis gratuit";
    ctx.q("navCta").textContent = "Devis gratuit";
    ctx.q("nContact").classList.remove("ed");
  });

  // Add Showreel link
  k(23.2, ctx => { ctx.cursorTo("nAddBtn"); });
  k(23.5, ctx => {
    ctx.clickAt();
    const nn = document.createElement("div");
    nn.className = "d-nitem ed";
    nn.setAttribute("data-el", "nShowreel");
    nn.innerHTML = `<span class="d-ndrag">⠿</span><input class="d-ninput" value="" readonly><span class="d-ntype">Lien</span>`;
    ctx.q("nList").insertBefore(nn, ctx.q("nContact"));
  });
  k(23.9, ctx => {
    const inp = ctx.q("nShowreel")?.querySelector("input") as HTMLInputElement;
    if (inp) inp.value = "Showreel";
    const sl = document.createElement("span");
    sl.className = "d-pnlink";
    sl.textContent = "Showreel";
    sl.setAttribute("data-el", "navShowreel");
    ctx.q("navLinks").insertBefore(sl, ctx.q("navCta"));
  });
  k(24.3, ctx => {
    ctx.q("nShowreel")?.classList.remove("ed");
  });

  // ── SCENE 6: PUBLISH (26 → 30s) ──
  k(26.0, ctx => {
    ctx.q("hero").classList.remove("sel");
    ctx.cursorTo("pub");
  });
  k(26.5, ctx => {
    ctx.clickAt();
    ctx.q("pub").classList.add("ld");
    ctx.q("pubLabel").textContent = "Publication...";
  });
  k(27.8, ctx => {
    ctx.q("pub").classList.remove("ld");
    ctx.q("pub").classList.add("ok");
    ctx.q("pubLabel").style.display = "none";
    ctx.q("pubCheck").style.display = "inline";
  });
  k(28.3, ctx => {
    ctx.q("overlay").classList.add("vis");
  });
  k(29.5, ctx => {
    ctx.q("cur").classList.remove("vis");
  });

  return K.sort((a, b) => a.t - b.t);
}

/* ═══════════════════════════════════════════════════════════
   REACT COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function BuilderDemoPlayer({
  label = "Voir le builder en action",
  accentColor = "#FF8A3D",
}: BuilderDemoPlayerProps) {
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

  // Build context helpers for a given root
  const makeCtx = useCallback((root: HTMLElement): DemoCtx => {
    const q = (s: string) => root.querySelector<HTMLElement>(`[data-el="${s}"]`)!;
    const shell = root.querySelector<HTMLElement>("[data-el='shell']");
    return {
      root,
      q,
      cursorTo(dataEl, offsetX = 0, offsetY = 0) {
        const target = q(dataEl);
        const cur = q("cur");
        if (!target || !cur || !shell) return;
        // Force layout so getBoundingClientRect works after innerHTML changes
        void shell.offsetHeight;
        const shellRect = shell.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        // If target has no dimensions yet (not laid out), use offsetLeft/offsetTop walk
        let x: number, y: number;
        if (targetRect.width > 0 && shellRect.width > 0) {
          x = targetRect.left - shellRect.left + targetRect.width / 2 + offsetX;
          y = targetRect.top - shellRect.top + targetRect.height / 2 + offsetY;
        } else {
          // Fallback: walk up offsetParent chain relative to shell
          let el: HTMLElement | null = target;
          x = target.offsetWidth / 2 + offsetX;
          y = target.offsetHeight / 2 + offsetY;
          while (el && el !== shell) {
            x += el.offsetLeft;
            y += el.offsetTop;
            el = el.offsetParent as HTMLElement | null;
          }
        }
        cur.style.transition = "left 0.4s cubic-bezier(0.22,1,0.36,1), top 0.4s cubic-bezier(0.22,1,0.36,1)";
        cur.style.left = x + "px";
        cur.style.top = y + "px";
      },
      clickAt() {
        const cur = q("cur");
        const clk = q("clk");
        if (!cur || !clk) return;
        clk.style.left = cur.style.left;
        clk.style.top = cur.style.top;
        clk.classList.remove("pop");
        void clk.offsetWidth;
        clk.classList.add("pop");
      },
      applyColor(c) {
        root.querySelectorAll<HTMLElement>(".d-hcta,.d-pndot,.d-pncta,.d-ctab,.d-badge").forEach(el => {
          if (el.classList.contains("d-badge")) { el.style.color = c; el.style.background = c + "18"; }
          else if (el.classList.contains("d-pndot")) { el.style.background = c; }
          else { el.style.background = c; }
        });
        q("pSwatch").style.background = c;
      },
      addSideBlock(name, color) {
        const el = document.createElement("div");
        el.className = "d-bitem";
        el.innerHTML = `<div class="d-bdot" style="background:${color}"></div>${name}`;
        q("blist").appendChild(el);
      },
      setTab(tab) {
        root.querySelectorAll(".d-tab").forEach(t => t.classList.remove("act"));
        q(tab).classList.add("act");
      },
    };
  }, []);

  // Seek to a specific time: rebuild DOM from initial + replay all keyframes up to t
  const seekTo = useCallback((t: number) => {
    const root = containerRef.current;
    if (!root) return;

    // Find the nearest snapshot before t
    const snapTimes = [...snapshotsRef.current.keys()].sort((a, b) => a - b);
    let restoreFrom = -1;
    for (const st of snapTimes) {
      if (st <= t) restoreFrom = st;
      else break;
    }

    if (restoreFrom >= 0 && snapshotsRef.current.has(restoreFrom)) {
      // Restore from snapshot
      const dRoot = root.querySelector(".d-root");
      if (dRoot) dRoot.innerHTML = snapshotsRef.current.get(restoreFrom)!;
    } else {
      // Full reset from initial HTML
      root.innerHTML = initialHtmlRef.current;
      restoreFrom = -1;
    }

    // Force layout reflow before applying keyframes so getBoundingClientRect works
    void root.offsetHeight;

    // Apply all keyframes from restoreFrom to t
    const ctx = makeCtx(root);
    const timeline = timelineRef.current;
    for (const kf of timeline) {
      if (kf.t <= restoreFrom) continue;
      if (kf.t > t) break;
      try { kf.apply(ctx); } catch {}
    }

    lastAppliedRef.current = t;
    setCurrentTime(t);
  }, [makeCtx]);

  // Initialize: render HTML, build timeline, take initial snapshot
  const initialize = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;

    root.innerHTML = DEMO_HTML;
    initialHtmlRef.current = DEMO_HTML;
    timelineRef.current = buildTimeline();
    snapshotsRef.current.clear();
    lastAppliedRef.current = -1;

    // Force layout before any keyframe application
    void root.offsetHeight;
    const ctx = makeCtx(root);

    // Apply frame 0
    for (const kf of timelineRef.current) {
      if (kf.t > 0) break;
      try { kf.apply(ctx); } catch {}
    }

    // Only snapshot at t=0 initially, others built on the fly
    const dRoot = root.querySelector(".d-root");
    if (dRoot) snapshotsRef.current.set(0, dRoot.innerHTML);
  }, [makeCtx]);

  // Play/pause toggle
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      // Pause
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setIsPlaying(false);
    } else {
      // Play
      let t = currentTime >= TOTAL_DURATION - 0.5 ? 0 : currentTime;
      if (t === 0) seekTo(0);

      setIsPlaying(true);
      const TICK = 100; // ms
      timerRef.current = setInterval(() => {
        t += TICK / 1000;
        if (t >= TOTAL_DURATION) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setIsPlaying(false);
          setCurrentTime(TOTAL_DURATION);
          return;
        }

        // Apply any keyframes between lastApplied and t
        const root = containerRef.current;
        if (!root) return;
        const ctx = makeCtx(root);
        const timeline = timelineRef.current;
        for (const kf of timeline) {
          if (kf.t <= lastAppliedRef.current) continue;
          if (kf.t > t) break;
          try { kf.apply(ctx); } catch {}

          // Take snapshot at scene boundaries
          const dRoot = root.querySelector(".d-root");
          if (dRoot && [3.5, 8, 15, 21, 26].includes(kf.t)) {
            snapshotsRef.current.set(kf.t, dRoot.innerHTML);
          }
        }
        lastAppliedRef.current = t;
        setCurrentTime(t);
      }, TICK);
    }
  }, [isPlaying, currentTime, seekTo, makeCtx]);

  // Handle start
  const handleStart = useCallback(() => {
    setStarted(true);
    setShowControls(true);
    setTimeout(() => {
      initialize();
      // Small delay then autoplay
      setTimeout(() => {
        seekTo(0);
        // Trigger play via effect
        setCurrentTime(0);
        setIsPlaying(true);
      }, 200);
    }, 100);
  }, [initialize, seekTo]);

  // Start playing when isPlaying turns true from handleStart
  useEffect(() => {
    if (!started || !isPlaying || timerRef.current) return;

    let t = currentTime;
    const TICK = 100;
    timerRef.current = setInterval(() => {
      t += TICK / 1000;
      if (t >= TOTAL_DURATION) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setIsPlaying(false);
        setCurrentTime(TOTAL_DURATION);
        return;
      }

      const root = containerRef.current;
      if (!root) return;
      const ctx = makeCtx(root);
      for (const kf of timelineRef.current) {
        if (kf.t <= lastAppliedRef.current) continue;
        if (kf.t > t) break;
        try { kf.apply(ctx); } catch {}
        const dRoot = root.querySelector(".d-root");
        if (dRoot && [3.5, 8, 15, 21, 26].includes(kf.t)) {
          snapshotsRef.current.set(kf.t, dRoot.innerHTML);
        }
      }
      lastAppliedRef.current = t;
      setCurrentTime(t);
    }, TICK);

    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, isPlaying]);

  // Cleanup
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Scrubber handler
  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const t = pct * TOTAL_DURATION;

    // Pause if playing
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsPlaying(false);

    // Reset and replay to target time
    const root = containerRef.current;
    if (!root) return;
    root.innerHTML = initialHtmlRef.current;
    snapshotsRef.current.clear();
    lastAppliedRef.current = -1;
    void root.offsetHeight; // force reflow

    const ctx = makeCtx(root);
    for (const kf of timelineRef.current) {
      if (kf.t > t) break;
      try { kf.apply(ctx); } catch {}
    }
    lastAppliedRef.current = t;

    // Re-snapshot
    const dRoot = root.querySelector(".d-root");
    if (dRoot) snapshotsRef.current.set(0, dRoot.innerHTML);

    setCurrentTime(t);
  }, [makeCtx]);

  // Skip forward/backward
  const skip = useCallback((delta: number) => {
    const t = Math.max(0, Math.min(TOTAL_DURATION, currentTime + delta));
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsPlaying(false);

    const root = containerRef.current;
    if (!root) return;
    root.innerHTML = initialHtmlRef.current;
    lastAppliedRef.current = -1;
    void root.offsetHeight; // force reflow

    const ctx = makeCtx(root);
    for (const kf of timelineRef.current) {
      if (kf.t > t) break;
      try { kf.apply(ctx); } catch {}
    }
    lastAppliedRef.current = t;
    setCurrentTime(t);
  }, [currentTime, makeCtx]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Scene labels for visual indicator
  const scenes = [
    { t: 0, label: "Intro" },
    { t: 3.5, label: "Blocs" },
    { t: 8, label: "Texte" },
    { t: 15, label: "Design" },
    { t: 21, label: "Navigation" },
    { t: 26, label: "Publication" },
  ];
  const currentScene = [...scenes].reverse().find(s => currentTime >= s.t)?.label ?? "Intro";

  return (
    <motion.div
      className="relative w-full max-w-[1100px] mx-auto rounded-2xl overflow-hidden"
      style={{
        aspectRatio: "16/9",
        background: started ? "#0F0E17" : `linear-gradient(135deg, ${accentColor}08, ${accentColor}15)`,
        border: "1px solid #E5E7EB",
        boxShadow: "0 20px 60px rgba(124,58,237,0.12), 0 4px 16px rgba(0,0,0,0.04)",
      }}
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease }}
      onMouseEnter={() => started && setShowControls(true)}
      onMouseLeave={() => started && setShowControls(false)}
    >
      {/* Idle — thumbnail + play button */}
      <AnimatePresence>
        {!started && (
          <motion.div
            className="absolute inset-0 z-10 cursor-pointer group"
            onClick={handleStart}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Blurred builder thumbnail */}
            <div className="absolute inset-0 overflow-hidden" style={{ filter: "blur(2px)", transform: "scale(1.02)" }}>
              <div style={{ width: "100%", height: "100%", background: "#F8F7FC", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif", fontSize: "9px" }}>
                {/* Browser bar */}
                <div style={{ height: "5%", background: "#FAFAFE", borderBottom: "1px solid #E8E5F0", display: "flex", alignItems: "center", padding: "0 10px", gap: "4px" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6159" }} />
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFBF2F" }} />
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2ACB42" }} />
                  <div style={{ marginLeft: 8, flex: 1, height: 14, background: "#F3F2F8", borderRadius: 3 }} />
                </div>
                {/* Builder body */}
                <div style={{ display: "flex", height: "95%" }}>
                  {/* Toolbar */}
                  <div style={{ position: "absolute", top: "5%", left: 0, right: 0, height: "6%", background: "#FFF", borderBottom: "1px solid #E8E5F0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", zIndex: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, background: "linear-gradient(135deg,#7C5CFF,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Jestly</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <span style={{ fontSize: 7, padding: "2px 6px", background: "#EDE9FE", color: "#7C5CFF", borderRadius: 3, fontWeight: 600 }}>Desktop</span>
                      <span style={{ fontSize: 7, padding: "2px 6px", color: "#9CA3AF" }}>Tablette</span>
                      <span style={{ fontSize: 7, padding: "2px 6px", color: "#9CA3AF" }}>Mobile</span>
                    </div>
                    <div style={{ padding: "3px 10px", background: "#7C5CFF", color: "#fff", borderRadius: 4, fontSize: 8, fontWeight: 600 }}>Publier</div>
                  </div>
                  {/* Sidebar */}
                  <div style={{ width: "15%", background: "#FFF", borderRight: "1px solid #E8E5F0", marginTop: "6%", padding: 8 }}>
                    <div style={{ fontSize: 6, fontWeight: 700, textTransform: "uppercase" as const, color: "#9CA3AF", marginBottom: 5, letterSpacing: "0.5px" }}>Pages</div>
                    <div style={{ padding: "3px 5px", background: "#EDE9FE", borderRadius: 3, fontSize: 8, color: "#7C5CFF", fontWeight: 600, marginBottom: 2 }}>⌂ Accueil</div>
                    <div style={{ padding: "3px 5px", fontSize: 8, color: "#1A1A2E", marginBottom: 2 }}>★ Portfolio</div>
                    <div style={{ padding: "3px 5px", fontSize: 8, color: "#1A1A2E", marginBottom: 8 }}>✉ Contact</div>
                    <div style={{ fontSize: 6, fontWeight: 700, textTransform: "uppercase" as const, color: "#9CA3AF", marginBottom: 5, letterSpacing: "0.5px" }}>Blocs</div>
                    <div style={{ padding: "3px 5px", border: "1px solid #7C5CFF", borderRadius: 3, fontSize: 7, color: "#7C5CFF", fontWeight: 500, marginBottom: 2 }}>● Hero</div>
                    <div style={{ padding: "3px 5px", fontSize: 7, color: "#6B7280", marginBottom: 2 }}>● Services</div>
                    <div style={{ padding: "3px 5px", fontSize: 7, color: "#6B7280", marginBottom: 2 }}>● Témoignages</div>
                  </div>
                  {/* Canvas */}
                  <div style={{ flex: 1, marginTop: "6%", background: "#F1EFF7", display: "flex", justifyContent: "center", padding: 12 }}>
                    <div style={{ width: "70%", background: "#FFF", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #E8E5F0", overflow: "hidden" }}>
                      {/* Nav */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 12px", borderBottom: "1px solid #F0EDF7" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 5, height: 5, borderRadius: 2, background: "#7C5CFF" }} />
                          <span style={{ fontSize: 8, fontWeight: 700, color: "#1A1A2E" }}>Mon site</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 7, color: "#6B7280" }}>Services</span>
                          <span style={{ fontSize: 7, color: "#6B7280" }}>Portfolio</span>
                          <span style={{ fontSize: 7, fontWeight: 600, color: "#fff", background: "#7C5CFF", padding: "2px 7px", borderRadius: 3 }}>Contact</span>
                        </div>
                      </div>
                      {/* Hero preview */}
                      <div style={{ padding: "20px 14px", textAlign: "center" as const }}>
                        <div style={{ display: "inline-block", fontSize: 6, fontWeight: 600, color: "#7C5CFF", background: "#EDE9FE", padding: "2px 7px", borderRadius: 10, marginBottom: 6 }}>Monteur vidéo</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#1A1A2E", lineHeight: 1.15, marginBottom: 4, letterSpacing: "-0.3px" }}>Des vidéos qui marquent les esprits</div>
                        <div style={{ fontSize: 7, color: "#6B7280", lineHeight: 1.5, marginBottom: 8 }}>Montage, motion design et post-production premium.</div>
                        <div style={{ display: "inline-block", padding: "4px 12px", background: "#7C5CFF", color: "#fff", borderRadius: 3, fontSize: 7, fontWeight: 600 }}>Voir le showreel</div>
                      </div>
                      {/* Services preview */}
                      <div style={{ padding: "10px 14px", borderTop: "1px solid #F0EDF7" }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: "#1A1A2E", marginBottom: 6, textAlign: "center" as const }}>Services premium</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                          {["🎬 Montage", "✨ Motion", "🎨 Étalonnage"].map(s => (
                            <div key={s} style={{ padding: "6px 3px", border: "1px solid #E8E5F0", borderRadius: 5, textAlign: "center" as const }}>
                              <div style={{ fontSize: 5, fontWeight: 600, color: "#1A1A2E" }}>{s}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Inspector */}
                  <div style={{ width: "17%", background: "#FFF", borderLeft: "1px solid #E8E5F0", marginTop: "6%", padding: 6 }}>
                    <div style={{ display: "flex", borderBottom: "1px solid #E8E5F0", marginBottom: 6 }}>
                      <span style={{ flex: 1, fontSize: 7, fontWeight: 600, textAlign: "center" as const, padding: "5px 0", color: "#7C5CFF", borderBottom: "2px solid #7C5CFF" }}>Contenu</span>
                      <span style={{ flex: 1, fontSize: 7, fontWeight: 600, textAlign: "center" as const, padding: "5px 0", color: "#9CA3AF" }}>Design</span>
                      <span style={{ flex: 1, fontSize: 7, fontWeight: 600, textAlign: "center" as const, padding: "5px 0", color: "#9CA3AF" }}>Nav</span>
                    </div>
                    {[["Badge", "Monteur vidéo"], ["Titre", "Des vidéos qui..."], ["Sous-titre", "Montage, motion..."], ["CTA", "Voir le showreel"]].map(([l, v]) => (
                      <div key={l} style={{ marginBottom: 5 }}>
                        <div style={{ fontSize: 5, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" as const, letterSpacing: "0.3px", marginBottom: 2 }}>{l}</div>
                        <div style={{ padding: "3px 5px", border: "1px solid #E8E5F0", borderRadius: 3, fontSize: 7, color: "#1A1A2E", background: "#FAFAFE" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dark overlay for contrast */}
            <div className="absolute inset-0" style={{ background: "rgba(15,14,23,0.35)" }} />

            {/* Subtle grid on top */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            {/* Center play button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`, boxShadow: `0 12px 40px ${accentColor}40` }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <span className="text-[12px] sm:text-[13px] font-medium text-white/70">{label}</span>
              <span className="text-[10px] text-white/40">0:30</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* ── VIDEO CONTROLS ── */}
      {started && (
        <div
          className="absolute bottom-0 left-0 right-0 z-40 transition-opacity duration-300"
          style={{ opacity: showControls ? 1 : 0 }}
        >
          {/* Gradient fade */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }} />

          <div className="relative px-4 pb-3 pt-8">
            {/* Progress bar */}
            <div
              className="w-full h-[6px] rounded-full cursor-pointer mb-3 group/bar relative"
              style={{ background: "rgba(255,255,255,0.2)" }}
              onClick={handleScrub}
            >
              {/* Scene markers */}
              {scenes.map(s => (
                <div
                  key={s.t}
                  className="absolute top-0 w-[2px] h-full rounded-full"
                  style={{ left: `${(s.t / TOTAL_DURATION) * 100}%`, background: "rgba(255,255,255,0.25)" }}
                />
              ))}
              {/* Filled bar */}
              <div
                className="h-full rounded-full transition-[width] duration-100"
                style={{
                  width: `${(currentTime / TOTAL_DURATION) * 100}%`,
                  background: "linear-gradient(90deg, #7C5CFF, #A78BFA)",
                }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md transition-[left] duration-100 opacity-0 group-hover/bar:opacity-100"
                style={{ left: `${(currentTime / TOTAL_DURATION) * 100}%`, transform: "translate(-50%, -50%)" }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-3">
              {/* Skip back */}
              <button onClick={() => skip(-5)} className="text-white/70 hover:text-white transition-colors" title="Reculer 5s">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  <text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7" fontWeight="700">5</text>
                </svg>
              </button>

              {/* Play/Pause */}
              <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                {isPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>

              {/* Skip forward */}
              <button onClick={() => skip(5)} className="text-white/70 hover:text-white transition-colors" title="Avancer 5s">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  <text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7" fontWeight="700">5</text>
                </svg>
              </button>

              {/* Time */}
              <span className="text-[11px] text-white/60 font-mono tabular-nums ml-1">
                {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
              </span>

              {/* Scene label */}
              <span className="text-[10px] text-white/40 font-medium ml-auto mr-1">
                {currentScene}
              </span>

              {/* Restart */}
              <button onClick={() => { seekTo(0); setIsPlaying(false); }} className="text-white/50 hover:text-white transition-colors" title="Recommencer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click anywhere to pause/play when started */}
      {started && !showControls && (
        <div className="absolute inset-0 z-30 cursor-pointer" onClick={togglePlay} />
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DEMO HTML (static template)
   ═══════════════════════════════════════════════════════════ */

const DEMO_HTML = `
<style>
  .d-root { width:100%; height:100%; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif; background:#0F0E17; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; }
  .d-root *,.d-root *::before,.d-root *::after { margin:0; padding:0; box-sizing:border-box; }
  .d-shell { width:100%; height:100%; background:#F8F7FC; overflow:hidden; position:relative; opacity:0; transform:scale(0.96); transition:transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease; }
  .d-shell.vis { opacity:1; transform:scale(1); }
  .d-bar { height:28px; background:#FAFAFE; border-bottom:1px solid #E8E5F0; display:flex; align-items:center; padding:0 10px; gap:6px; }
  .d-dot { width:8px; height:8px; border-radius:50%; }
  .d-bar-url { flex:1; margin-left:8px; height:17px; background:#F3F2F8; border-radius:4px; display:flex; align-items:center; padding:0 8px; font-size:9px; color:#9CA3AF; }
  .d-builder { display:flex; height:calc(100% - 28px); position:relative; }
  .d-toolbar { position:absolute; top:0; left:0; right:0; height:34px; background:#FFF; border-bottom:1px solid #E8E5F0; display:flex; align-items:center; justify-content:space-between; padding:0 12px; z-index:20; }
  .d-logo { font-size:11px; font-weight:800; background:linear-gradient(135deg,#7C5CFF,#A78BFA); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .d-divider { width:1px; height:16px; background:#E8E5F0; margin:0 8px; }
  .d-pagename { font-size:9px; color:#6B7280; padding:2px 7px; background:#F5F3FA; border-radius:4px; }
  .d-tbl { display:flex; align-items:center; gap:6px; }
  .d-dbtn { padding:3px 7px; border-radius:4px; font-size:8px; color:#9CA3AF; border:none; background:none; }
  .d-dbtn.act { background:#EDE9FE; color:#7C5CFF; font-weight:600; }
  .d-pub { padding:4px 12px; background:#7C5CFF; color:#fff; border:none; border-radius:4px; font-size:10px; font-weight:600; cursor:pointer; transition:all 0.3s; display:flex; align-items:center; gap:5px; }
  .d-pub.ld { background:#5B3FD9; }
  .d-pub.ok { background:#10B981; }
  .d-spinner { width:10px; height:10px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:d-spin 0.6s linear infinite; display:none; }
  .d-pub.ld .d-spinner { display:block; }
  @keyframes d-spin { to { transform:rotate(360deg); } }
  .d-side { width:170px; background:#FFF; border-right:1px solid #E8E5F0; margin-top:34px; overflow:hidden; padding:8px; }
  .d-stitle { font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:0.7px; color:#9CA3AF; margin-bottom:6px; margin-top:6px; }
  .d-pitem { display:flex; align-items:center; gap:6px; padding:4px 6px; border-radius:4px; font-size:10px; color:#1A1A2E; }
  .d-pitem.act { background:#EDE9FE; color:#7C5CFF; font-weight:600; }
  .d-picon { width:14px; height:14px; border-radius:3px; background:#F0EDF7; display:flex; align-items:center; justify-content:center; font-size:7px; color:#9CA3AF; }
  .d-pitem.act .d-picon { background:rgba(124,92,255,0.15); color:#7C5CFF; }
  .d-bitem { display:flex; align-items:center; gap:6px; padding:4px 6px; border-radius:4px; font-size:9px; color:#6B7280; border:1px solid transparent; margin-bottom:2px; }
  .d-bitem.sel { border-color:#7C5CFF; color:#7C5CFF; font-weight:500; background:#F8F6FF; }
  .d-bdot { width:5px; height:5px; border-radius:2px; }
  .d-addb { display:flex; align-items:center; gap:4px; padding:5px 7px; background:none; border:1px dashed #E8E5F0; border-radius:4px; font-size:9px; color:#7C5CFF; cursor:pointer; width:100%; font-weight:500; margin-top:4px; }
  .d-lib { position:absolute; left:170px; top:34px; width:200px; background:#FFF; border-right:1px solid #E8E5F0; box-shadow:0 12px 40px rgba(0,0,0,0.1); z-index:30; padding:8px; opacity:0; transform:translateX(-8px); pointer-events:none; transition:all 0.3s cubic-bezier(0.22,1,0.36,1); height:calc(100% - 34px); }
  .d-lib.open { opacity:1; transform:translateX(0); pointer-events:all; }
  .d-libt { font-size:10px; font-weight:700; color:#1A1A2E; margin-bottom:2px; }
  .d-libs { font-size:8px; color:#9CA3AF; margin-bottom:8px; }
  .d-lgrid { display:grid; grid-template-columns:1fr 1fr; gap:5px; }
  .d-lblock { padding:7px; border:1px solid #E8E5F0; border-radius:7px; cursor:pointer; text-align:center; transition:all 0.15s; }
  .d-lbi { font-size:14px; margin-bottom:2px; }
  .d-lbn { font-size:8px; font-weight:600; color:#1A1A2E; }
  .d-canvas { flex:1; margin-top:34px; background:#F1EFF7; overflow-y:auto; padding:12px; display:flex; justify-content:center; }
  .d-page { width:420px; background:#FFF; border-radius:8px; box-shadow:0 4px 16px rgba(0,0,0,0.08); overflow:hidden; border:1px solid #E8E5F0; }
  .d-pnav { display:flex; align-items:center; justify-content:space-between; padding:7px 14px; border-bottom:1px solid #F0EDF7; }
  .d-pnlogo { font-size:10px; font-weight:700; color:#1A1A2E; display:flex; align-items:center; gap:5px; }
  .d-pndot { width:6px; height:6px; border-radius:2px; background:#7C5CFF; transition:background 0.4s; }
  .d-pnlinks { display:flex; align-items:center; gap:10px; }
  .d-pnlink { font-size:8px; color:#6B7280; }
  .d-pncta { font-size:8px; font-weight:600; color:#fff; background:#7C5CFF; padding:3px 9px; border-radius:4px; transition:background 0.4s; }
  .d-phero { padding:22px 16px; text-align:center; border:2px solid transparent; transition:border-color 0.3s; min-height:100px; }
  .d-phero.sel { border-color:#7C5CFF; border-radius:3px; margin:3px; }
  .d-badge { display:inline-block; font-size:7px; font-weight:600; color:#7C5CFF; background:#EDE9FE; padding:2px 8px; border-radius:12px; margin-bottom:7px; transition:all 0.4s; }
  .d-htitle { font-size:17px; font-weight:800; color:#1A1A2E; line-height:1.15; margin-bottom:5px; letter-spacing:-0.4px; transition:font-family 0.4s; }
  .d-hsub { font-size:9px; color:#6B7280; line-height:1.5; max-width:300px; margin:0 auto 10px; }
  .d-hcta { display:inline-block; padding:6px 14px; background:#7C5CFF; color:#fff; border-radius:4px; font-size:9px; font-weight:600; transition:all 0.4s; }
  .d-hcta2 { display:inline-block; padding:6px 10px; color:#6B7280; font-size:9px; font-weight:500; margin-left:4px; }
  .d-block { padding:16px; border-top:1px solid #F0EDF7; opacity:0; transform:translateY(8px); transition:all 0.4s cubic-bezier(0.22,1,0.36,1); }
  .d-block.vis { opacity:1; transform:translateY(0); }
  .d-btitle { font-size:10px; font-weight:700; color:#1A1A2E; margin-bottom:8px; text-align:center; }
  .d-sgrid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px; }
  .d-scard { padding:8px 5px; border:1px solid #E8E5F0; border-radius:7px; text-align:center; }
  .d-sicon { font-size:14px; margin-bottom:3px; }
  .d-sname { font-size:7px; font-weight:600; color:#1A1A2E; }
  .d-sdesc { font-size:6px; color:#9CA3AF; margin-top:1px; }
  .d-tcards { display:flex; gap:5px; }
  .d-tcard { flex:1; padding:7px; border:1px solid #E8E5F0; border-radius:7px; }
  .d-tstars { font-size:6px; color:#FBBF24; margin-bottom:2px; }
  .d-ttext { font-size:7px; color:#6B7280; line-height:1.4; margin-bottom:4px; font-style:italic; }
  .d-tauth { font-size:6px; font-weight:600; color:#1A1A2E; }
  .d-trole { font-size:5.5px; color:#9CA3AF; }
  .d-ctabl { text-align:center; padding:14px; background:linear-gradient(135deg,rgba(124,92,255,0.04),rgba(124,92,255,0.08)); border-radius:7px; }
  .d-ctat { font-size:11px; font-weight:700; color:#1A1A2E; margin-bottom:4px; }
  .d-ctad { font-size:8px; color:#6B7280; margin-bottom:7px; }
  .d-ctab { display:inline-block; padding:5px 13px; background:#7C5CFF; color:#fff; border-radius:4px; font-size:8px; font-weight:600; transition:all 0.4s; }
  .d-insp { width:190px; background:#FFF; border-left:1px solid #E8E5F0; margin-top:34px; overflow-y:auto; opacity:0; transform:translateX(8px); transition:all 0.4s cubic-bezier(0.22,1,0.36,1); }
  .d-insp.vis { opacity:1; transform:translateX(0); }
  .d-tabs { display:flex; border-bottom:1px solid #E8E5F0; }
  .d-tab { flex:1; padding:7px 5px; font-size:8px; font-weight:600; text-align:center; color:#9CA3AF; border-bottom:2px solid transparent; cursor:pointer; }
  .d-tab.act { color:#7C5CFF; border-bottom-color:#7C5CFF; }
  .d-icont { padding:8px; }
  .d-fg { margin-bottom:7px; }
  .d-fl { font-size:7px; font-weight:600; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:3px; }
  .d-fi { width:100%; padding:4px 6px; border:1px solid #E8E5F0; border-radius:4px; font-size:9px; color:#1A1A2E; background:#FAFAFE; transition:border-color 0.2s; outline:none; }
  .d-fi.ed { border-color:#7C5CFF; box-shadow:0 0 0 2px rgba(124,92,255,0.1); }
  .d-dpanel { display:none; }
  .d-dpanel.vis { display:block; }
  .d-pgrid { display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-bottom:8px; }
  .d-pcard { padding:5px; border:1px solid #E8E5F0; border-radius:4px; cursor:pointer; transition:all 0.2s; }
  .d-pcard.act { border-color:#7C5CFF; background:#EDE9FE; }
  .d-pcolors { display:flex; gap:2px; margin-bottom:2px; }
  .d-psw { width:10px; height:10px; border-radius:2px; }
  .d-pname { font-size:7px; font-weight:600; color:#1A1A2E; }
  .d-crow { display:flex; align-items:center; gap:6px; margin-bottom:6px; }
  .d-csw { width:18px; height:18px; border-radius:4px; border:1px solid #E8E5F0; transition:background 0.4s; }
  .d-clabel { font-size:8px; color:#6B7280; flex:1; }
  .d-cval { font-size:8px; color:#9CA3AF; font-family:monospace; }
  .d-npanel { display:none; }
  .d-npanel.vis { display:block; }
  .d-nitem { display:flex; align-items:center; gap:4px; padding:4px 6px; border:1px solid #E8E5F0; border-radius:4px; margin-bottom:3px; transition:all 0.2s; }
  .d-nitem.ed { border-color:#7C5CFF; background:#FAFAFF; }
  .d-ndrag { color:#9CA3AF; font-size:8px; }
  .d-ninput { flex:1; border:none; background:transparent; font-size:9px; color:#1A1A2E; outline:none; }
  .d-ntype { font-size:6px; color:#9CA3AF; padding:1px 4px; background:#F0EDF7; border-radius:2px; }
  .d-naddbtn { display:flex; align-items:center; gap:3px; padding:4px 6px; border:1px dashed #E8E5F0; border-radius:4px; background:none; font-size:8px; color:#7C5CFF; cursor:pointer; width:100%; margin-top:4px; }
  .d-cur { position:absolute; width:14px; height:17px; z-index:100; pointer-events:none; opacity:0; filter:drop-shadow(0 1px 3px rgba(0,0,0,0.2)); transition:opacity 0.3s; }
  .d-cur.vis { opacity:1; }
  .d-click { position:absolute; width:18px; height:18px; border-radius:50%; background:rgba(124,92,255,0.3); transform:translate(-2px,-1px) scale(0); pointer-events:none; z-index:99; }
  .d-click.pop { animation:d-pop 0.35s ease-out forwards; }
  @keyframes d-pop { 0%{transform:translate(-2px,-1px) scale(0);opacity:1} 100%{transform:translate(-2px,-1px) scale(2);opacity:0} }
  .d-overlay { position:absolute; inset:28px 0 0 0; background:rgba(255,255,255,0.95); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; flex-direction:column; z-index:50; opacity:0; pointer-events:none; transition:opacity 0.5s; }
  .d-overlay.vis { opacity:1; pointer-events:all; }
  .d-okicon { width:42px; height:42px; border-radius:50%; background:#10B981; display:flex; align-items:center; justify-content:center; margin-bottom:12px; transform:scale(0); transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1); }
  .d-overlay.vis .d-okicon { transform:scale(1); }
  .d-okt { font-size:16px; font-weight:700; color:#1A1A2E; margin-bottom:4px; }
  .d-oku { font-size:10px; color:#7C5CFF; background:#EDE9FE; padding:4px 12px; border-radius:14px; font-weight:500; }
</style>
<div class="d-root">
  <div class="d-shell" data-el="shell">
    <div class="d-bar"><div class="d-dot" style="background:#FF6159"></div><div class="d-dot" style="background:#FFBF2F"></div><div class="d-dot" style="background:#2ACB42"></div><div class="d-bar-url"><span style="margin-right:3px">🔒</span>app.jestly.fr/builder</div></div>
    <div class="d-builder">
      <div class="d-toolbar">
        <div class="d-tbl"><span class="d-logo">Jestly</span><div class="d-divider"></div><span class="d-pagename">Accueil</span></div>
        <div class="d-tbl"><button class="d-dbtn act">Desktop</button><button class="d-dbtn">Tablette</button><button class="d-dbtn">Mobile</button></div>
        <div class="d-tbl"><button class="d-pub" data-el="pub"><span class="d-spinner"></span><span data-el="pubLabel">Publier</span><span data-el="pubCheck" style="display:none">✓ En ligne</span></button></div>
      </div>
      <div class="d-side">
        <div class="d-stitle">Pages</div>
        <div class="d-pitem act"><div class="d-picon">⌂</div>Accueil</div>
        <div class="d-pitem"><div class="d-picon">★</div>Portfolio</div>
        <div class="d-pitem"><div class="d-picon">✉</div>Contact</div>
        <div class="d-stitle" style="margin-top:10px">Blocs</div>
        <div data-el="blist"><div class="d-bitem sel"><div class="d-bdot" style="background:#7C5CFF"></div>Hero</div></div>
        <button class="d-addb" data-el="addBtn">+ Ajouter un bloc</button>
      </div>
      <div class="d-lib" data-el="lib">
        <div class="d-libt">Bibliothèque de blocs</div><div class="d-libs">Cliquez pour ajouter</div>
        <div class="d-lgrid">
          <div class="d-lblock"><div class="d-lbi">🏠</div><div class="d-lbn">Hero</div></div>
          <div class="d-lblock" data-el="libSvc"><div class="d-lbi">⚡</div><div class="d-lbn">Services</div></div>
          <div class="d-lblock" data-el="libTst"><div class="d-lbi">💬</div><div class="d-lbn">Témoignages</div></div>
          <div class="d-lblock" data-el="libCta"><div class="d-lbi">🎯</div><div class="d-lbn">CTA</div></div>
          <div class="d-lblock"><div class="d-lbi">🖼</div><div class="d-lbn">Portfolio</div></div>
          <div class="d-lblock"><div class="d-lbi">💎</div><div class="d-lbn">Tarifs</div></div>
        </div>
      </div>
      <div class="d-canvas"><div class="d-page">
        <div class="d-pnav"><div class="d-pnlogo"><div class="d-pndot" data-el="navDot"></div><span>Mon site</span></div><div class="d-pnlinks" data-el="navLinks"><span class="d-pnlink">Services</span><span class="d-pnlink">Portfolio</span><span class="d-pncta" data-el="navCta">Contact</span></div></div>
        <div class="d-phero" data-el="hero"><div class="d-badge" data-el="badge">Freelance</div><div class="d-htitle" data-el="htitle">Votre titre ici</div><div class="d-hsub" data-el="hsub">Décrivez votre activité en quelques mots pour attirer vos clients.</div><div><span class="d-hcta" data-el="hcta">En savoir plus</span><span class="d-hcta2">Voir les projets →</span></div></div>
        <div data-el="dynBlocks"></div>
      </div></div>
      <div class="d-insp" data-el="insp">
        <div class="d-tabs"><div class="d-tab act" data-el="tabC">Contenu</div><div class="d-tab" data-el="tabD">Design</div><div class="d-tab" data-el="tabN">Navigation</div></div>
        <div class="d-icont" data-el="cFields">
          <div class="d-fg"><div class="d-fl">Badge</div><div class="d-fi" data-el="fBadge">Freelance</div></div>
          <div class="d-fg"><div class="d-fl">Titre</div><div class="d-fi" data-el="fTitle">Votre titre ici</div></div>
          <div class="d-fg"><div class="d-fl">Sous-titre</div><div class="d-fi" data-el="fSub" style="min-height:32px;line-height:1.3">Décrivez votre activité en quelques mots pour attirer vos clients.</div></div>
          <div class="d-fg"><div class="d-fl">Bouton CTA</div><div class="d-fi" data-el="fCta">En savoir plus</div></div>
        </div>
        <div class="d-dpanel" data-el="dPanel"><div class="d-icont">
          <div class="d-fl" style="margin-bottom:6px">Thèmes rapides</div>
          <div class="d-pgrid">
            <div class="d-pcard act" data-el="prPurple"><div class="d-pcolors"><div class="d-psw" style="background:#7C5CFF"></div><div class="d-psw" style="background:#EDE9FE"></div><div class="d-psw" style="background:#1A1A2E"></div></div><div class="d-pname">Créatif</div></div>
            <div class="d-pcard" data-el="prOrange"><div class="d-pcolors"><div class="d-psw" style="background:#F97316"></div><div class="d-psw" style="background:#FFF7ED"></div><div class="d-psw" style="background:#1A1A2E"></div></div><div class="d-pname">Audacieux</div></div>
            <div class="d-pcard" data-el="prTeal"><div class="d-pcolors"><div class="d-psw" style="background:#0EA5E9"></div><div class="d-psw" style="background:#F0F9FF"></div><div class="d-psw" style="background:#0C4A6E"></div></div><div class="d-pname">Studio</div></div>
            <div class="d-pcard" data-el="prRose"><div class="d-pcolors"><div class="d-psw" style="background:#E11D48"></div><div class="d-psw" style="background:#FFF1F2"></div><div class="d-psw" style="background:#1A1A2E"></div></div><div class="d-pname">Bold</div></div>
          </div>
          <div class="d-fl" style="margin-bottom:6px">Couleur primaire</div>
          <div class="d-crow"><div class="d-csw" data-el="pSwatch" style="background:#7C5CFF"></div><span class="d-clabel">Primaire</span><span class="d-cval" data-el="pVal">#7C5CFF</span></div>
          <div class="d-fl" style="margin-bottom:6px;margin-top:8px">Typographie titres</div>
          <div class="d-fi" data-el="fFont">Inter — Bold</div>
        </div></div>
        <div class="d-npanel" data-el="nPanel"><div class="d-icont">
          <div class="d-fl" style="margin-bottom:6px">Liens de navigation</div>
          <div data-el="nList">
            <div class="d-nitem"><span class="d-ndrag">⠿</span><input class="d-ninput" value="Services" readonly><span class="d-ntype">Lien</span></div>
            <div class="d-nitem"><span class="d-ndrag">⠿</span><input class="d-ninput" value="Portfolio" readonly><span class="d-ntype">Lien</span></div>
            <div class="d-nitem" data-el="nContact"><span class="d-ndrag">⠿</span><input class="d-ninput" value="Contact" readonly><span class="d-ntype">Bouton</span></div>
          </div>
          <button class="d-naddbtn" data-el="nAddBtn">+ Ajouter un lien</button>
        </div></div>
      </div>
    </div>
    <div class="d-cur" data-el="cur"><svg viewBox="0 0 24 24" fill="none" width="14" height="17"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="#1A1A2E" stroke-width="1.5" stroke-linejoin="round"/></svg><div class="d-click" data-el="clk"></div></div>
    <div class="d-overlay" data-el="overlay"><div class="d-okicon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M5 13l4 4L19 7"/></svg></div><div class="d-okt">Site publié !</div><div style="height:6px"></div><div class="d-oku">alex-montage.jestly.fr</div></div>
  </div>
</div>`;
