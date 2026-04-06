"use client";

import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";
import SectionShell from "@/components/landing/SectionShell";

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════
   PERSONA PAGE V2 — Premium product-marketing page system
   6 sections: Hero, Pain, Transform, Features, Proof, CTA
   ═══════════════════════════════════════════════════════════════════════ */

export interface PersonaPageData {
  persona: "createurs" | "developpeurs" | "designers" | "agences" | "consultants";
  accentColor: string;
  accentBg: string;

  /* Hero */
  badge: string;
  title: string;
  titleGradient: string;
  subtitle: string;
  heroMetrics: { value: string; label: string }[];
  reassurance: string[];

  /* Pain */
  painTitle: string;
  painGradient: string;
  painSubtitle: string;
  painTools: { name: string; emoji: string }[];

  /* Transformation */
  transformTitle: string;
  transformGradient: string;
  beforeItems: string[];
  afterItems: string[];

  /* Features (alternating) */
  features: { title: string; gradient: string; description: string; bullets: string[]; icon: string; color: string }[];

  /* Social proof */
  proofTitle: string;
  proofGradient: string;
  metrics: { value: string; label: string; description: string }[];
  testimonials: { name: string; role: string; quote: string; initials: string; color: string }[];

  /* CTA */
  ctaTitle: string;
  ctaGradient: string;
  ctaSubtitle: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   PRODUCT MOCKUP SCENES — Persona-specific dashboard compositions
   ═══════════════════════════════════════════════════════════════════════ */

function MockupCard({ children, className = "", delay = 0, accent }: { children: React.ReactNode; className?: string; delay?: number; accent: string }) {
  return (
    <motion.div
      className={`rounded-2xl ${className}`}
      style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(20,20,30,0.06)", boxShadow: `0 12px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(20,20,30,0.02)` }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.6 + delay, duration: 0.7, ease }}
    >
      {children}
    </motion.div>
  );
}

function CreateursMockup({ accent, bg }: { accent: string; bg: string }) {
  return (
    <div className="relative w-full h-[380px] sm:h-[440px]">
      {/* Portfolio grid */}
      <MockupCard accent={accent} className="absolute top-0 right-0 w-[280px] p-4" delay={0}>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#8A8FA3" }}>Portfolio</div>
        <div className="grid grid-cols-2 gap-2">
          {[accent, "#EC4899", "#F59E0B", "#3B82F6"].map((c, i) => (
            <div key={i} className="aspect-[4/3] rounded-lg" style={{ background: `linear-gradient(135deg, ${c}20, ${c}08)` }}>
              <div className="h-full flex items-end p-2"><div className="h-1 rounded w-3/4" style={{ background: `${c}30` }} /></div>
            </div>
          ))}
        </div>
      </MockupCard>
      {/* Client message */}
      <MockupCard accent={accent} className="absolute top-[160px] left-0 w-[220px] p-4" delay={0.15}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: accent }}>ML</div>
          <div><div className="text-[11px] font-semibold text-[#111118]">Marie Laurent</div><div className="text-[9px]" style={{ color: "#8A8FA3" }}>Nouveau brief</div></div>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: bg }}>
          <div className="text-[10px] leading-relaxed" style={{ color: "#57534E" }}>Bonjour ! J'aurais besoin d'un montage pour...</div>
        </div>
      </MockupCard>
      {/* Invoice widget */}
      <MockupCard accent={accent} className="absolute bottom-0 right-[20px] w-[200px] p-3.5" delay={0.3}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#8A8FA3" }}>Facture #047</span>
          <span className="text-[8px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#16a34a" }}>Payée</span>
        </div>
        <div className="text-[20px] font-bold text-[#111118]">1 850 €</div>
        <div className="text-[9px] mt-1" style={{ color: "#8A8FA3" }}>Studio Krea — Motion pack</div>
      </MockupCard>
    </div>
  );
}

function DeveloppeursMockup({ accent, bg }: { accent: string; bg: string }) {
  return (
    <div className="relative w-full h-[380px] sm:h-[440px]">
      {/* Kanban board */}
      <MockupCard accent={accent} className="absolute top-0 right-0 w-[290px] p-4" delay={0}>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#8A8FA3" }}>CA projets</div>
        <div className="flex gap-2">
          {[{ title: "En cours", items: ["API REST v2", "Refacto auth"], c: accent }, { title: "Review", items: ["Landing page"], c: "#F59E0B" }].map((col) => (
            <div key={col.title} className="flex-1">
              <div className="text-[8px] font-semibold mb-2" style={{ color: col.c }}>{col.title}</div>
              {col.items.map((item) => (
                <div key={item} className="rounded-lg p-2 mb-1.5" style={{ background: "#FAFAFE", border: "1px solid #F3F4F6" }}>
                  <div className="text-[9px] font-medium text-[#111118]">{item}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </MockupCard>
      {/* Revenue chart */}
      <MockupCard accent={accent} className="absolute top-[180px] left-0 w-[210px] p-3.5" delay={0.15}>
        <div className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: "#8A8FA3" }}>Revenus</div>
        <div className="text-[22px] font-bold text-[#111118] mb-2">6 420 €</div>
        <div className="flex items-end gap-[3px] h-[40px]">
          {[30, 45, 55, 70, 60, 85, 75, 92].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i >= 6 ? accent : `${accent}20` }} />
          ))}
        </div>
      </MockupCard>
      {/* Automation */}
      <MockupCard accent={accent} className="absolute bottom-0 right-[30px] w-[190px] p-3" delay={0.3}>
        <div className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: "#8A8FA3" }}>Automation</div>
        {["Facture envoyée → relance J+7", "Projet livré → demande avis"].map((a) => (
          <div key={a} className="flex items-center gap-2 py-1.5">
            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: bg }}><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9z" /></svg></div>
            <span className="text-[8px] text-[#57534E]">{a}</span>
          </div>
        ))}
      </MockupCard>
    </div>
  );
}

function DesignersMockup({ accent, bg }: { accent: string; bg: string }) {
  return (
    <div className="relative w-full h-[380px] sm:h-[440px]">
      {/* Portfolio showcase */}
      <MockupCard accent={accent} className="absolute top-0 right-0 w-[280px] p-4" delay={0}>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#8A8FA3" }}>Portfolio</div>
        <div className="rounded-xl overflow-hidden mb-2" style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}05)` }}>
          <div className="h-[90px] flex items-center justify-center"><span className="text-[24px] font-bold" style={{ color: `${accent}40` }}>◇</span></div>
        </div>
        <div className="flex gap-2">
          {["Branding", "UI/UX", "Motion"].map((t, i) => (
            <span key={t} className="text-[8px] font-medium px-2 py-1 rounded-md" style={{ background: i === 0 ? bg : "#F5F5F5", color: i === 0 ? accent : "#8A8FA3" }}>{t}</span>
          ))}
        </div>
      </MockupCard>
      {/* Brief card */}
      <MockupCard accent={accent} className="absolute top-[170px] left-0 w-[210px] p-3.5" delay={0.15}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#8A8FA3" }}>Brief</span>
          <span className="text-[8px] font-semibold px-2 py-0.5 rounded-full" style={{ background: bg, color: accent }}>Nouveau</span>
        </div>
        <div className="text-[11px] font-semibold text-[#111118] mb-1">Refonte identité visuelle</div>
        <div className="text-[9px] text-[#8A8FA3]">Logo + charte + supports print</div>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-6 h-6 rounded-full" style={{ background: accent }} />
          <div className="text-[9px] text-[#57534E]">Sophie M. — Agence Bloom</div>
        </div>
      </MockupCard>
      {/* Approval flow */}
      <MockupCard accent={accent} className="absolute bottom-0 right-[20px] w-[200px] p-3" delay={0.3}>
        <div className="text-[9px] font-bold uppercase tracking-wider mb-2.5" style={{ color: "#8A8FA3" }}>Validation client</div>
        {[{ v: "V1", s: "Validée", ok: true }, { v: "V2", s: "En attente", ok: false }].map((r) => (
          <div key={r.v} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid #F3F4F6" }}>
            <span className="text-[10px] font-medium text-[#111118]">{r.v} — Logotype</span>
            <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded" style={{ background: r.ok ? "#D1FAE5" : bg, color: r.ok ? "#16a34a" : accent }}>{r.s}</span>
          </div>
        ))}
      </MockupCard>
    </div>
  );
}

function AgencesMockup({ accent, bg }: { accent: string; bg: string }) {
  return (
    <div className="relative w-full h-[380px] sm:h-[440px]">
      {/* Multi-client */}
      <MockupCard accent={accent} className="absolute top-0 right-0 w-[280px] p-4" delay={0}>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#8A8FA3" }}>Clients actifs</div>
        {[{ name: "Studio Nova", projects: 3, revenue: "4 200 €" }, { name: "Bloom Agency", projects: 2, revenue: "2 800 €" }, { name: "TechCorp", projects: 1, revenue: "1 500 €" }].map((c, i) => (
          <div key={c.name} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < 2 ? "1px solid #F3F4F6" : "none" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white" style={{ background: [accent, "#EC4899", "#3B82F6"][i] }}>{c.name[0]}</div>
              <div><div className="text-[10px] font-semibold text-[#111118]">{c.name}</div><div className="text-[8px] text-[#8A8FA3]">{c.projects} projets</div></div>
            </div>
            <span className="text-[10px] font-bold" style={{ color: accent }}>{c.revenue}</span>
          </div>
        ))}
      </MockupCard>
      {/* CA */}
      <MockupCard accent={accent} className="absolute top-[200px] left-0 w-[200px] p-3.5" delay={0.15}>
        <div className="text-[9px] font-bold uppercase tracking-wider mb-2.5" style={{ color: "#8A8FA3" }}>CA global</div>
        <div className="text-[20px] font-bold text-[#111118] mb-1">8 500 €</div>
        <div className="text-[9px] mb-3" style={{ color: accent }}>+24% vs mois dernier</div>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
          <div className="rounded-full" style={{ width: "45%", background: accent }} />
          <div className="rounded-full" style={{ width: "25%", background: "#F59E0B" }} />
          <div className="rounded-full" style={{ width: "15%", background: "#8A8FA3" }} />
        </div>
      </MockupCard>
      {/* Team */}
      <MockupCard accent={accent} className="absolute bottom-0 right-[30px] w-[170px] p-3" delay={0.3}>
        <div className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: "#8A8FA3" }}>Équipe</div>
        <div className="flex -space-x-2">
          {["#7C5CFF", accent, "#EC4899", "#3B82F6"].map((c, i) => (
            <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white" style={{ background: c }}>{["A", "M", "S", "J"][i]}</div>
          ))}
        </div>
        <div className="text-[9px] mt-2" style={{ color: "#57534E" }}>4 membres actifs</div>
      </MockupCard>
    </div>
  );
}

function ConsultantsMockup({ accent, bg }: { accent: string; bg: string }) {
  return (
    <div className="relative w-full h-[380px] sm:h-[440px]">
      {/* Calendar */}
      <MockupCard accent={accent} className="absolute top-0 right-0 w-[260px] p-4" delay={0}>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#8A8FA3" }}>Agenda</div>
        <div className="space-y-2">
          {[{ time: "09h", title: "Call découverte — TechStart", c: accent }, { time: "11h", title: "Point mission — DataCorp", c: "#F59E0B" }, { time: "14h", title: "Workshop stratégie", c: "#EC4899" }].map((ev) => (
            <div key={ev.title} className="flex items-center gap-3 rounded-lg p-2.5" style={{ background: "#FAFAFE" }}>
              <div className="w-1 h-8 rounded-full" style={{ background: ev.c }} />
              <div><div className="text-[9px] font-semibold" style={{ color: ev.c }}>{ev.time}</div><div className="text-[10px] font-medium text-[#111118]">{ev.title}</div></div>
            </div>
          ))}
        </div>
      </MockupCard>
      {/* Mission tracker */}
      <MockupCard accent={accent} className="absolute top-[180px] left-0 w-[200px] p-3.5" delay={0.15}>
        <div className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: "#8A8FA3" }}>Missions en cours</div>
        <div className="text-[28px] font-bold text-[#111118]">5</div>
        <div className="flex items-center gap-3 mt-2">
          <div className="text-center"><div className="text-[14px] font-bold" style={{ color: accent }}>3</div><div className="text-[7px] text-[#8A8FA3]">facturées</div></div>
          <div className="w-px h-6 bg-[#F3F4F6]" />
          <div className="text-center"><div className="text-[14px] font-bold text-[#F59E0B]">2</div><div className="text-[7px] text-[#8A8FA3]">en cours</div></div>
        </div>
      </MockupCard>
      {/* CRM snippet */}
      <MockupCard accent={accent} className="absolute bottom-0 right-[20px] w-[190px] p-3" delay={0.3}>
        <div className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: "#8A8FA3" }}>CRM</div>
        {["TechStart SAS", "DataCorp"].map((c, i) => (
          <div key={c} className="flex items-center gap-2 py-1.5" style={{ borderBottom: i === 0 ? "1px solid #F3F4F6" : "none" }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-bold text-white" style={{ background: i === 0 ? accent : "#F59E0B" }}>{c[0]}</div>
            <div><div className="text-[9px] font-semibold text-[#111118]">{c}</div><div className="text-[7px] text-[#8A8FA3]">{i === 0 ? "Mission active" : "Prospect"}</div></div>
          </div>
        ))}
      </MockupCard>
    </div>
  );
}

function PersonaMockup({ data }: { data: PersonaPageData }) {
  const props = { accent: data.accentColor, bg: data.accentBg };
  switch (data.persona) {
    case "createurs": return <CreateursMockup {...props} />;
    case "developpeurs": return <DeveloppeursMockup {...props} />;
    case "designers": return <DesignersMockup {...props} />;
    case "agences": return <AgencesMockup {...props} />;
    case "consultants": return <ConsultantsMockup {...props} />;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 1 — HERO 2-COLUMN PREMIUM
   ═══════════════════════════════════════════════════════════════════════ */
function HeroSection({ data }: { data: PersonaPageData }) {
  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 px-6 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-[10%] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${data.accentColor}08, transparent 70%)` }} />

      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — Content */}
          <div>
            <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: data.accentBg, border: `1px solid ${data.accentColor}20` }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
              <div className="w-2 h-2 rounded-full" style={{ background: data.accentColor }} />
              <span className="text-[12px] font-semibold" style={{ color: data.accentColor }}>{data.badge}</span>
            </motion.div>

            <motion.h1 className="text-[32px] sm:text-[42px] lg:text-[50px] font-bold leading-[1.08] tracking-tight mb-5" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease }}>
              <span className="text-[#111118]">{data.title} </span>
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${data.accentColor}, #7C5CFF)` }}>{data.titleGradient}</span>
            </motion.h1>

            <motion.p className="text-[16px] sm:text-[18px] leading-relaxed max-w-[480px] mb-8" style={{ color: "#6B7280" }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease }}>
              {data.subtitle}
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row items-start gap-3 mb-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease }}>
              <TextSwapButton label="Commencer gratuitement" href="/signup" variant="primary" size="lg" />
              <TextSwapButton label="Voir la démo" href="#features" variant="ghost" size="md" />
            </motion.div>

            {/* Reassurance */}
            <motion.div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.5 }}>
              {data.reassurance.map((r) => (
                <div key={r} className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={data.accentColor} strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
                  <span className="text-[11px] font-medium" style={{ color: "#8A8FA3" }}>{r}</span>
                </div>
              ))}
            </motion.div>

            {/* Metrics */}
            <motion.div className="flex items-center gap-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5, ease }}>
              {data.heroMetrics.map((m, i) => (
                <div key={m.label}>
                  {i > 0 && <div className="hidden" />}
                  <div className="text-[24px] sm:text-[28px] font-bold" style={{ color: data.accentColor }}>{m.value}</div>
                  <div className="text-[10px] font-medium" style={{ color: "#8A8FA3" }}>{m.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Product mockup */}
          <div className="hidden lg:block">
            <PersonaMockup data={data} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2 — PAIN (chaos visuel)
   ═══════════════════════════════════════════════════════════════════════ */
function PainSection({ data }: { data: PersonaPageData }) {
  return (
    <SectionShell atmosphere="contrast">
      <div className="py-14 sm:py-20">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
          <h2 className="text-[28px] sm:text-[40px] font-bold leading-tight text-[#111118]">
            {data.painTitle}{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #EF4444, #F97316)" }}>{data.painGradient}</span>
          </h2>
          <p className="text-[15px] sm:text-[17px] mt-4 max-w-[520px] mx-auto" style={{ color: "#6B7280" }}>{data.painSubtitle}</p>
        </motion.div>

        {/* Scattered tools */}
        <div className="relative max-w-[700px] mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {data.painTools.map((tool, i) => (
              <motion.div
                key={tool.name}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid #EEEFF2", transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (1 + i * 0.5)}deg)` }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4, ease }}
              >
                <span className="text-[16px]">{tool.emoji}</span>
                <span className="text-[13px] font-medium text-[#57534E]">{tool.name}</span>
              </motion.div>
            ))}
          </div>
          {/* Chaos connectors */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <svg className="w-full h-full" viewBox="0 0 700 120" fill="none">
              <path d="M100 60 Q250 20 350 80 Q450 130 600 50" stroke="#EF444420" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M150 30 Q300 90 500 40" stroke="#F9731620" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>

        <motion.p className="text-center text-[14px] font-medium mt-8" style={{ color: "#EF4444" }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.4 }}>
          Résultat : perte de temps, oublis, stress et clients mal suivis.
        </motion.p>
      </div>
    </SectionShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3 — TRANSFORMATION (Before / After)
   ═══════════════════════════════════════════════════════════════════════ */
function TransformationSection({ data }: { data: PersonaPageData }) {
  return (
    <SectionShell atmosphere="system">
      <div className="py-14 sm:py-20">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
          <h2 className="text-[28px] sm:text-[40px] font-bold leading-tight text-[#111118]">
            {data.transformTitle}{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${data.accentColor}, #7C5CFF)` }}>{data.transformGradient}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[820px] mx-auto">
          {/* Before */}
          <motion.div className="rounded-2xl p-7 sm:p-8" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid #FEE2E2" }} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FEF2F2" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <span className="text-[14px] font-bold" style={{ color: "#EF4444" }}>Avant Jestly</span>
            </div>
            <div className="space-y-3">
              {data.beforeItems.map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#EF444440" }} />
                  <span className="text-[13px] leading-relaxed" style={{ color: "#6B7280" }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* After */}
          <motion.div className="rounded-2xl p-7 sm:p-8" style={{ background: "rgba(255,255,255,0.7)", border: `1px solid ${data.accentColor}25` }} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: data.accentBg }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={data.accentColor} strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-[14px] font-bold" style={{ color: data.accentColor }}>Avec Jestly</span>
            </div>
            <div className="space-y-3">
              {data.afterItems.map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: data.accentColor }} />
                  <span className="text-[13px] leading-relaxed" style={{ color: "#111118" }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 4 — FEATURE SHOWCASE (alternating large blocks)
   ═══════════════════════════════════════════════════════════════════════ */
function FeatureShowcase({ data }: { data: PersonaPageData }) {
  return (
    <SectionShell atmosphere="warm" id="features">
      <div className="py-14 sm:py-20">
        <div className="space-y-8 sm:space-y-10">
          {data.features.map((f, i) => {
            const isReversed = i % 2 === 1;
            const isLarge = i === 0 || i === 3;
            return (
              <motion.div
                key={f.title}
                className={`rounded-2xl overflow-hidden ${isLarge ? "p-7 sm:p-10" : "p-6 sm:p-8"}`}
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #EEEFF2" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease }}
                whileHover={{ boxShadow: `0 16px 48px ${f.color}10` }}
              >
                <div className={`flex flex-col ${isReversed ? "md:flex-row-reverse" : "md:flex-row"} gap-8 items-center`}>
                  {/* Content */}
                  <div className="flex-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.color}10` }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
                    </div>
                    <h3 className="text-[18px] sm:text-[22px] font-bold leading-tight mb-3">
                      <span className="text-[#111118]">{f.title} </span>
                      <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${f.color}, #7C5CFF)` }}>{f.gradient}</span>
                    </h3>
                    <p className="text-[14px] leading-relaxed mb-5" style={{ color: "#6B7280" }}>{f.description}</p>
                    <div className="space-y-2">
                      {f.bullets.map((b) => (
                        <div key={b} className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
                          <span className="text-[13px] font-medium" style={{ color: "#57534E" }}>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Visual placeholder */}
                  <div className={`${isLarge ? "w-full md:w-[320px]" : "w-full md:w-[260px]"} flex-shrink-0`}>
                    <div className="rounded-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${f.color}08, ${f.color}03)`, border: `1px solid ${f.color}12`, aspectRatio: "4/3" }}>
                      <div className="h-full flex flex-col p-4">
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: "#FF6159" }} />
                          <div className="w-2 h-2 rounded-full" style={{ background: "#FFBF2F" }} />
                          <div className="w-2 h-2 rounded-full" style={{ background: "#2ACB42" }} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-2 rounded w-3/4" style={{ background: `${f.color}15` }} />
                          <div className="h-2 rounded w-1/2" style={{ background: `${f.color}10` }} />
                          <div className="grid grid-cols-3 gap-1.5 mt-3">
                            {[0, 1, 2].map((j) => <div key={j} className="h-10 rounded-lg" style={{ background: j === 0 ? `${f.color}12` : "#F5F5F5" }} />)}
                          </div>
                          <div className="h-6 w-20 rounded-lg mt-2" style={{ background: f.color }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 5 — SOCIAL PROOF (metrics + testimonials)
   ═══════════════════════════════════════════════════════════════════════ */
function SocialProofSection({ data }: { data: PersonaPageData }) {
  return (
    <SectionShell atmosphere="editorial">
      <div className="py-14 sm:py-20">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
          <h2 className="text-[28px] sm:text-[40px] font-bold leading-tight text-[#111118]">
            {data.proofTitle}{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${data.accentColor}, #7C5CFF)` }}>{data.proofGradient}</span>
          </h2>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[820px] mx-auto mb-10">
          {data.metrics.map((m, i) => (
            <motion.div key={m.label} className="text-center rounded-2xl p-7 sm:p-8" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #EEEFF2" }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4, ease }}>
              <div className="text-[32px] sm:text-[38px] font-bold" style={{ color: data.accentColor }}>{m.value}</div>
              <div className="text-[14px] font-semibold text-[#111118] mt-1">{m.label}</div>
              <div className="text-[12px] mt-1" style={{ color: "#8A8FA3" }}>{m.description}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[820px] mx-auto">
          {data.testimonials.map((t, i) => (
            <motion.div key={t.name} className="rounded-2xl p-7 sm:p-8" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #EEEFF2" }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4, ease }}>
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[0,1,2,3,4].map((s) => <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={data.accentColor} stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}
              </div>
              <p className="text-[14px] leading-relaxed mb-5" style={{ color: "#374151" }}>"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${t.color}, #7C5CFF)` }}>{t.initials}</div>
                <div><div className="text-[14px] font-semibold text-[#111118]">{t.name}</div><div className="text-[12px]" style={{ color: "#8A8FA3" }}>{t.role}</div></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 6 — FINAL CTA (premium)
   ═══════════════════════════════════════════════════════════════════════ */
function FinalCTASection({ data }: { data: PersonaPageData }) {
  return (
    <SectionShell atmosphere="elevated">
      <div className="py-16 sm:py-24">
        <motion.div
          className="relative text-center rounded-[28px] px-8 py-14 sm:py-20 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${data.accentColor}06, #7C5CFF06)`, border: `1px solid ${data.accentColor}12` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          {/* Ambient glows */}
          <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${data.accentColor}08, transparent 70%)` }} />
          <div className="absolute bottom-0 right-1/4 w-[200px] h-[200px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, #7C5CFF08, transparent 70%)` }} />

          <div className="relative z-10">
            <h2 className="text-[28px] sm:text-[42px] font-bold leading-tight max-w-[600px] mx-auto text-[#111118]">
              {data.ctaTitle}{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${data.accentColor}, #7C5CFF)` }}>{data.ctaGradient}</span>
            </h2>
            <p className="text-[15px] sm:text-[17px] mt-5 max-w-[460px] mx-auto" style={{ color: "#6B7280" }}>{data.ctaSubtitle}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <TextSwapButton label="Commencer gratuitement" href="/signup" variant="primary" size="lg" />
              <TextSwapButton label="Voir la démo" href="/" variant="ghost" size="md" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6">
              {["Gratuit pour commencer", "Aucun engagement", "Prêt en 2 minutes"].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={data.accentColor} strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
                  <span className="text-[11px] font-medium" style={{ color: "#8A8FA3" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN LAYOUT — 6 sections, tight premium rhythm
   ═══════════════════════════════════════════════════════════════════════ */
export default function PersonaPageLayout({ data }: { data: PersonaPageData }) {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection data={data} />
      <PainSection data={data} />
      <TransformationSection data={data} />
      <FeatureShowcase data={data} />
      <SocialProofSection data={data} />
      <FinalCTASection data={data} />
    </main>
  );
}
