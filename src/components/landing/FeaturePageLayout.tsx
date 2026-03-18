"use client";

import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";
import VideoPlaceholder from "./VideoPlaceholder";
import BuilderDemoPlayer from "./BuilderDemoPlayer";

/* ═══════════════════════════════════════════════════════════════════════
   FeaturePageLayout — Premium high-contrast feature pages
   Alternating white / #F3F0FF backgrounds. Strong card shadows.
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

/* Card styles */
const CARD = "rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1";
const CARD_BORDER = "1px solid #E5E7EB";
const CARD_SHADOW = "0 10px 30px rgba(124,58,237,0.08)";
const CARD_HOVER_SHADOW = "0 16px 40px rgba(124,58,237,0.14)";

/* ── Types ── */

interface BenefitCard { icon: string; title: string; description: string }
interface ShowcaseItem { icon: string; label: string; description?: string }
interface BeforeAfterItem { label: string; icon?: string }
interface IntegrationModule { label: string; icon: string; color: string }

export interface FeaturePageData {
  badge: string; title: string; titleGradient: string; subtitle: string;
  videoLabel: string; accentColor: string;
  benefitsTitle: string; benefitsTitleGradient: string; benefits: BenefitCard[];
  showcaseTitle: string; showcaseTitleGradient: string; showcaseSubtitle?: string; showcaseItems: ShowcaseItem[];
  beforeAfterTitle: string; beforeAfterTitleGradient: string;
  beforeItems: BeforeAfterItem[]; afterItems: BeforeAfterItem[];
  beforeLabel?: string; afterLabel?: string;
  integrationTitle: string; integrationTitleGradient: string;
  integrationSubtitle: string; integrationModules: IntegrationModule[];
  ctaTitle: string; ctaTitleGradient: string; ctaSubtitle: string;
  useBuilderDemo?: boolean;
}

/* ── Section wrapper ── */
function Section({ bg, children, className = "" }: { bg: "white" | "purple"; children: React.ReactNode; className?: string }) {
  return (
    <section className={`relative py-24 sm:py-32 px-6 overflow-hidden ${className}`} style={{ background: bg === "white" ? "#FFFFFF" : "#F3F0FF" }}>
      {children}
    </section>
  );
}

/* ── Title block ── */
function SectionTitle({ title, gradient, accent, subtitle }: { title: string; gradient: string; accent: string; subtitle?: string }) {
  return (
    <div className="text-center mb-16">
      <motion.h2
        className="text-[28px] sm:text-[36px] md:text-[44px] font-extrabold leading-[1.08] tracking-[-0.03em] mb-4"
        style={{ color: "#111118" }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease }}
      >
        {title}{" "}
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${accent}, ${accent}BB)` }}>
          {gradient}
        </span>
      </motion.h2>
      {subtitle && (
        <motion.p className="text-[15px] sm:text-[17px] leading-relaxed max-w-2xl mx-auto" style={{ color: "#6B7280" }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1, ease }}>
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* ── Main Layout ── */
export default function FeaturePageLayout({ data: d }: { data: FeaturePageData }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-24" />

      {/* ════════ HERO (white) ════════ */}
      <Section bg="white" className="!pb-16">
        <div className="max-w-[1200px] mx-auto">
          <motion.div className="text-center mb-6" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold" style={{ background: `${d.accentColor}12`, color: d.accentColor, border: `1px solid ${d.accentColor}20` }}>
              {d.badge}
            </span>
          </motion.div>

          <motion.h1 className="text-center text-[34px] sm:text-[46px] md:text-[56px] lg:text-[64px] font-extrabold leading-[1.06] tracking-[-0.035em] mb-6 max-w-4xl mx-auto" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease }}>
            <span style={{ color: "#111118" }}>{d.title}</span>{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${d.accentColor}, ${d.accentColor}BB)` }}>{d.titleGradient}</span>
          </motion.h1>

          <motion.p className="text-center text-[16px] sm:text-[18px] leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: "#6B7280" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease }}>
            {d.subtitle}
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3, ease }}>
            <TextSwapButton label="Commencer gratuitement" href="/login" variant="primary" size="lg" />
            <TextSwapButton label="Voir la démo" href="#demo" variant="ghost" size="md" />
          </motion.div>

          {d.useBuilderDemo ? (
            <BuilderDemoPlayer label={d.videoLabel} accentColor={d.accentColor} />
          ) : (
            <VideoPlaceholder label={d.videoLabel} accentColor={d.accentColor} />
          )}
        </div>
      </Section>

      {/* ════════ BENEFITS (purple bg) ════════ */}
      <Section bg="purple">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle title={d.benefitsTitle} gradient={d.benefitsTitleGradient} accent={d.accentColor} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {d.benefits.map((b, i) => (
              <motion.div
                key={b.title}
                className={`${CARD} p-7 sm:p-8`}
                style={{ border: CARD_BORDER, boxShadow: CARD_SHADOW }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                whileHover={{ boxShadow: CARD_HOVER_SHADOW }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${d.accentColor}10` }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={d.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={b.icon} /></svg>
                </div>
                <h3 className="text-[16px] font-bold mb-2" style={{ color: "#111118" }}>{b.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "#6B7280" }}>{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════ SHOWCASE (white) ════════ */}
      <Section bg="white">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle title={d.showcaseTitle} gradient={d.showcaseTitleGradient} accent={d.accentColor} subtitle={d.showcaseSubtitle} />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {d.showcaseItems.map((item, i) => (
              <motion.div
                key={item.label}
                className={`${CARD} p-6 text-center`}
                style={{ border: CARD_BORDER, boxShadow: CARD_SHADOW }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease }}
                whileHover={{ boxShadow: CARD_HOVER_SHADOW }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: `${d.accentColor}10` }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={d.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                </div>
                <div className="text-[14px] font-bold mb-1" style={{ color: "#111118" }}>{item.label}</div>
                {item.description && <div className="text-[12px] leading-relaxed" style={{ color: "#9CA3AF" }}>{item.description}</div>}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════ BEFORE / AFTER (purple bg) ════════ */}
      <Section bg="purple">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle title={d.beforeAfterTitle} gradient={d.beforeAfterTitleGradient} accent={d.accentColor} />

          <motion.div
            className="rounded-2xl overflow-hidden bg-white"
            style={{ border: CARD_BORDER, boxShadow: "0 12px 40px rgba(124,58,237,0.1)" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              {/* Before */}
              <div className="p-8 sm:p-10" style={{ background: "#FAFAFA" }}>
                <div className="flex items-center gap-3 mb-8 pb-5 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-red-600">{d.beforeLabel || "Avant"}</div>
                    <div className="text-[12px] text-gray-400">Sans Jestly</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {d.beforeItems.map((item, i) => (
                    <motion.div key={item.label} className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-100" initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.15 + i * 0.05, ease }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon || "M18 6L6 18M6 6l12 12"} /></svg>
                      </div>
                      <span className="text-[14px] font-medium text-gray-400">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* After */}
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-8 pb-5" style={{ borderBottom: `2px solid ${d.accentColor}20` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${d.accentColor}12` }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={d.accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold" style={{ color: d.accentColor }}>{d.afterLabel || "Avec Jestly"}</div>
                    <div className="text-[12px] text-gray-400">1 plateforme</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {d.afterItems.map((item, i) => (
                    <motion.div key={item.label} className="flex items-center gap-3 px-4 py-3.5 rounded-xl" style={{ background: `${d.accentColor}06`, border: `1px solid ${d.accentColor}12` }} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.25 + i * 0.05, ease }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.1)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon || "M9 12l2 2 4-4"} /></svg>
                      </div>
                      <span className="text-[14px] font-semibold" style={{ color: "#111118" }}>{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ════════ INTEGRATION (white) ════════ */}
      <Section bg="white">
        <div className="max-w-[1200px] mx-auto">
          <SectionTitle title={d.integrationTitle} gradient={d.integrationTitleGradient} accent={d.accentColor} subtitle={d.integrationSubtitle} />

          <div className="flex flex-wrap items-center justify-center gap-5 max-w-3xl mx-auto">
            {d.integrationModules.map((mod, i) => (
              <motion.div
                key={mod.label}
                className={`${CARD} px-6 py-5 flex items-center gap-4`}
                style={{ border: CARD_BORDER, boxShadow: CARD_SHADOW }}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease }}
                whileHover={{ boxShadow: CARD_HOVER_SHADOW }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${mod.color}12` }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mod.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={mod.icon} /></svg>
                </div>
                <span className="text-[14px] font-semibold" style={{ color: "#111118" }}>{mod.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════ CTA FINAL (purple bg) ════════ */}
      <Section bg="purple">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="rounded-2xl p-10 sm:p-14 lg:p-16 text-center bg-white"
            style={{ border: CARD_BORDER, boxShadow: "0 16px 50px rgba(124,58,237,0.12)" }}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
          >
            <h2 className="text-[28px] sm:text-[38px] md:text-[46px] font-extrabold leading-[1.08] tracking-[-0.03em] mb-5" style={{ color: "#111118" }}>
              {d.ctaTitle}{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${d.accentColor}, ${d.accentColor}BB)` }}>{d.ctaTitleGradient}</span>
            </h2>
            <p className="text-[16px] sm:text-[18px] leading-relaxed max-w-lg mx-auto mb-10" style={{ color: "#6B7280" }}>
              {d.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <TextSwapButton label="Créer mon espace" href="/login" variant="primary" size="lg" />
              <TextSwapButton label="Voir la démo" href="#demo" variant="ghost" size="md" />
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
