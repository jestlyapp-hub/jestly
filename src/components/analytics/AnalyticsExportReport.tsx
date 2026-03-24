"use client";

import { forwardRef, useEffect, useState } from "react";
import type { ExportData } from "@/lib/analytics/export-utils";
import { fmtEur, rangeLabel } from "@/lib/analytics/export-utils";

/**
 * AnalyticsExportReport — Rapport premium A4 portrait.
 *
 * Dimensionné à 794px de large (A4 à 96dpi).
 * Capturé à scale 2 = 1588px réels → PDF net en A4.
 * Multi-section, dense, bien occupé.
 * Tous styles inline — aucune dépendance CSS externe.
 */

const W = 794; // A4 portrait width at 96dpi
const PAD = 36;
const CW = W - PAD * 2; // content width

function pct(n: number): string { return `${Math.round(n * 10) / 10}%`; }
function date(): string { return new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); }

// ── Shared sub-components ──

function Chg({ v, suffix = "%" }: { v: number; suffix?: string }) {
  if (!v) return null;
  return <span style={{ fontSize: 11, color: v > 0 ? "#10B981" : "#EF4444", fontWeight: 700 }}>{v > 0 ? "▲" : "▼"} {Math.abs(Math.round(v))}{suffix}</span>;
}

function PipelineCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div style={{
      flex: "1 1 0", padding: "18px 20px",
      background: accent ? "linear-gradient(135deg, #7C5CFF, #6D4FE8)" : "#F9F8FD",
      border: accent ? "none" : "1px solid #E8E5F0", borderRadius: 12,
      color: accent ? "#fff" : "#111",
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, opacity: accent ? 0.8 : 0.5, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: accent ? 0.7 : 0.5, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function KpiMini({ label, value, change, changeSuffix }: { label: string; value: string; change?: number; changeSuffix?: string }) {
  return (
    <div style={{ flex: "1 1 0", padding: "12px 14px", background: "#F9F8FD", border: "1px solid #E8E5F0", borderRadius: 10, minWidth: 90 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{value}</div>
      {change !== undefined && change !== 0 && <div style={{ marginTop: 3 }}><Chg v={change} suffix={changeSuffix} /></div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>{children}</div>;
}

function Divider() {
  return <div style={{ height: 1, background: "#E8E5F0", margin: "20px 0" }} />;
}

// ── Table helpers ──
const TH: React.CSSProperties = { textAlign: "left", padding: "8px 10px", fontWeight: 600, color: "#888", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: "2px solid #E8E5F0" };
const THR: React.CSSProperties = { ...TH, textAlign: "right" };
const TD: React.CSSProperties = { padding: "7px 10px", fontSize: 12, color: "#222", borderBottom: "1px solid #F0EEF5" };
const TDR: React.CSSProperties = { ...TD, textAlign: "right" };
const TDM: React.CSSProperties = { ...TDR, color: "#888" };
const TDB: React.CSSProperties = { ...TDR, fontWeight: 600 };

const AnalyticsExportReport = forwardRef<HTMLDivElement, { data: ExportData }>(({ data }, ref) => {
  const { kpis, pipeline, timeSeries, topProducts, topClients, customerAnalytics, monthlyGrowth, forecast, bestMonth, worstMonth, insights, revenueByDay } = data;
  const barMax = Math.max(...timeSeries.map(p => p.revenue), 1);
  const dayMax = Math.max(...(revenueByDay || []).map(p => p.revenue), 1);

  // Load logo as data URL so html2canvas can render it
  const [logoSrc, setLogoSrc] = useState<string>("");
  useEffect(() => {
    fetch("/logo-color.png")
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoSrc(reader.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(() => {});
  }, []);

  const Logo = ({ size }: { size: number }) => logoSrc
    ? <img src={logoSrc} width={size} height={size} style={{ objectFit: "contain", borderRadius: size > 30 ? 14 : 6 }} alt="" />
    : <div style={{ width: size, height: size, borderRadius: size > 30 ? 14 : 6, background: "linear-gradient(135deg, #7C5CFF, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.45, fontWeight: 800, color: "#fff" }}>J</div>;

  return (
    <div ref={ref} style={{
      width: W, background: "#FFFFFF", color: "#111111",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif",
      padding: PAD, boxSizing: "border-box", lineHeight: 1.45,
    }}>

      {/* ════════════════════════════════════
          HEADER — Premium branded
          ════════════════════════════════════ */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 6 }}>
        <div style={{ flexShrink: 0 }}><Logo size={48} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#111", letterSpacing: -0.7, lineHeight: 1.1 }}>Rapport Analytics</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Vue complète de l&apos;activité — Jestly</div>
        </div>
        <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#7C5CFF", background: "#EDE9FE", padding: "6px 18px", borderRadius: 20, display: "inline-block", marginBottom: 6 }}>{rangeLabel(data.range)}</div>
          <div style={{ fontSize: 11, color: "#999" }}>Exporté le {date()}</div>
        </div>
      </div>
      <div style={{ height: 2, background: "linear-gradient(90deg, #7C5CFF, #A78BFA, #E8E5F0)", borderRadius: 1, margin: "16px 0 24px" }} />

      {/* ════════════════════════════════════
          PIPELINE — 3 big cards
          ════════════════════════════════════ */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <PipelineCard accent label="CA total" value={fmtEur(pipeline.totalRevenue)} sub={`${pipeline.totalCount} commandes`} />
        <PipelineCard label="En cours" value={fmtEur(pipeline.inProgressRevenue)} sub={`${pipeline.inProgressCount} en production`} />
        <PipelineCard label="Prêtes" value={fmtEur(pipeline.readyRevenue)} sub={`${pipeline.readyCount} à facturer`} />
      </div>

      {/* ════════════════════════════════════
          KPIs GRID — 2 rows of 3
          ════════════════════════════════════ */}
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <KpiMini label="Revenu net" value={fmtEur(kpis.netProfit)} change={kpis.profitChange} />
        <KpiMini label="Commandes finalisées" value={String(kpis.totalOrders)} change={kpis.ordersChange} />
        <KpiMini label="Taux de conversion" value={pct(kpis.conversionRate)} change={kpis.conversionChange} changeSuffix="pts" />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <KpiMini label="Panier moyen" value={fmtEur(kpis.avgOrderValue)} change={kpis.aovChange} />
        <KpiMini label="Clients récurrents" value={pct(kpis.returningRate)} />
        <KpiMini label="Clients actifs" value={String(kpis.activeClients)} change={kpis.clientsChange} />
      </div>

      {/* ════════════════════════════════════
          MAIN CHART — Revenue evolution (BIG)
          ════════════════════════════════════ */}
      {timeSeries.length > 0 && (
        <div style={{ background: "#FAFAFE", border: "1px solid #E8E5F0", borderRadius: 14, padding: "22px 24px", marginBottom: 24 }}>
          <SectionTitle>📊 Évolution des revenus</SectionTitle>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", marginTop: 8 }}>
            {timeSeries.slice(-12).map((p, i) => (
              <div key={i} style={{ flex: "1 1 0", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", height: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  <div style={{ width: "55%", height: Math.max(6, (p.revenue / barMax) * 200), background: "linear-gradient(180deg, #7C5CFF, #A78BFA)", borderRadius: "5px 5px 0 0" }} />
                </div>
                <div style={{ fontSize: 9, color: "#999", whiteSpace: "nowrap" as const }}>{p.label}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: "#333" }}>{fmtEur(p.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          INSIGHTS
          ════════════════════════════════════ */}
      {insights.length > 0 && (
        <div style={{ padding: "18px 22px", background: "linear-gradient(135deg, #F5F3FF, #EDE9FE)", border: "1px solid #DDD6FE", borderRadius: 14, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#7C5CFF", marginBottom: 10 }}>💡 Insights</div>
          {insights.map((ins, i) => (
            <div key={i} style={{ fontSize: 12, color: "#444", lineHeight: 1.6, marginBottom: 4 }}>• {ins}</div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════
          2-COL: Revenue by day + Forecast
          ════════════════════════════════════ */}
      {(revenueByDay?.some(d => d.revenue > 0) || (forecast.confidence > 0 && forecast.nextMonth > 0) || bestMonth) && (
        <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
          {/* Revenue by day */}
          {revenueByDay && revenueByDay.some(d => d.revenue > 0) && (
            <div style={{ flex: "1 1 0", background: "#FAFAFE", border: "1px solid #E8E5F0", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 10 }}>Revenu par jour</div>
              <div style={{ display: "flex", gap: 5, alignItems: "flex-end" }}>
                {revenueByDay.map((p, i) => (
                  <div key={i} style={{ flex: "1 1 0", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 2 }}>
                    <div style={{ width: "100%", height: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <div style={{ width: "60%", height: Math.max(4, (p.revenue / dayMax) * 60), background: "#A78BFA", borderRadius: "3px 3px 0 0" }} />
                    </div>
                    <div style={{ fontSize: 9, color: "#999" }}>{p.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Forecast + Best/Worst */}
          <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {forecast.confidence > 0 && forecast.nextMonth > 0 && (
              <div style={{ padding: "14px 18px", background: "#F9F8FD", border: "1px solid #E8E5F0", borderRadius: 12, flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase" as const, marginBottom: 4 }}>Prévision</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#111" }}>{fmtEur(forecast.nextMonth)}</div>
                <div style={{ fontSize: 10, color: "#999", marginTop: 3 }}>Confiance {forecast.confidence}%</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              {bestMonth && (
                <div style={{ flex: 1, padding: "12px 14px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "#10B981", textTransform: "uppercase" as const }}>Meilleur</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginTop: 2 }}>{bestMonth.month}</div>
                  <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>{fmtEur(bestMonth.revenue)}</div>
                </div>
              )}
              {worstMonth && (
                <div style={{ flex: 1, padding: "12px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "#EF4444", textTransform: "uppercase" as const }}>Plus faible</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginTop: 2 }}>{worstMonth.month}</div>
                  <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 600 }}>{fmtEur(worstMonth.revenue)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Divider />

      {/* ════════════════════════════════════
          TOP PRODUCTS TABLE
          ════════════════════════════════════ */}
      {topProducts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionTitle>🏆 Performance des produits</SectionTitle>
          <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
            <thead><tr><th style={TH}>Produit</th><th style={THR}>Revenu</th><th style={THR}>Commandes</th><th style={THR}>Prix moy.</th><th style={THR}>Part CA</th></tr></thead>
            <tbody>{topProducts.slice(0, 6).map((p, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#FAFAFE" : "#fff" }}>
                <td style={{ ...TD, fontWeight: 500 }}>{i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : ""}{p.name}</td>
                <td style={TDB}>{fmtEur(p.revenue)}</td><td style={TDM}>{p.orders}</td><td style={TDM}>{fmtEur(p.avgPrice)}</td>
                <td style={{ ...TDR, color: "#7C5CFF", fontWeight: 700 }}>{p.revenueShare}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* ════════════════════════════════════
          TOP CLIENTS TABLE
          ════════════════════════════════════ */}
      {topClients.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionTitle>👤 Meilleurs clients</SectionTitle>
          <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
            <thead><tr><th style={{ ...TH, width: 30 }}>#</th><th style={TH}>Client</th><th style={THR}>Revenu</th><th style={THR}>Commandes</th></tr></thead>
            <tbody>{topClients.slice(0, 8).map((c, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#FAFAFE" : "#fff" }}>
                <td style={TD}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</td>
                <td style={TD}><span style={{ fontWeight: 500 }}>{c.name}</span> <span style={{ fontSize: 10, color: "#999" }}>· {c.email}</span></td>
                <td style={TDB}>{fmtEur(c.revenue)}</td><td style={TDM}>{c.orders}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* ════════════════════════════════════
          SEGMENTS
          ════════════════════════════════════ */}
      {customerAnalytics.segments.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionTitle>📊 Segments clients</SectionTitle>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, padding: "12px 16px", background: "#F9F8FD", border: "1px solid #E8E5F0", borderRadius: 10, textAlign: "center" as const }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#111" }}>{customerAnalytics.newCustomers}</div>
              <div style={{ fontSize: 10, color: "#888" }}>Nouveaux</div>
            </div>
            <div style={{ flex: 1, padding: "12px 16px", background: "#F9F8FD", border: "1px solid #E8E5F0", borderRadius: 10, textAlign: "center" as const }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#111" }}>{customerAnalytics.returningCustomers}</div>
              <div style={{ fontSize: 10, color: "#888" }}>Récurrents</div>
            </div>
          </div>
          {customerAnalytics.segments.map((seg, i) => {
            const total = customerAnalytics.segments.reduce((s, x) => s + x.count, 0) || 1;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: "#666", width: 140 }}>{seg.segment}</div>
                <div style={{ flex: 1, height: 8, background: "#EEEDF5", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg, #7C5CFF, #A78BFA)", borderRadius: 4, width: `${Math.round((seg.count / total) * 100)}%` }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#111", width: 60, textAlign: "right" as const }}>{seg.count}</div>
                <div style={{ fontSize: 11, color: "#888", width: 90, textAlign: "right" as const }}>{fmtEur(seg.revenue)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════
          MONTHLY GROWTH
          ════════════════════════════════════ */}
      {monthlyGrowth.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionTitle>📈 Croissance mensuelle</SectionTitle>
          <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
            <thead><tr><th style={TH}>Mois</th><th style={THR}>Revenu</th><th style={THR}>Commandes</th><th style={THR}>Croissance</th></tr></thead>
            <tbody>{monthlyGrowth.slice(-8).map((m, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#FAFAFE" : "#fff" }}>
                <td style={TD}>{m.month}</td><td style={TDB}>{fmtEur(m.revenue)}</td><td style={TDM}>{m.orders}</td>
                <td style={{ ...TDR, fontWeight: 700, color: m.revenueGrowth >= 0 ? "#10B981" : "#EF4444" }}>{m.revenueGrowth > 0 ? "+" : ""}{m.revenueGrowth}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* ════════════════════════════════════
          FOOTER
          ════════════════════════════════════ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 18, borderTop: "2px solid #E8E5F0", marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={22} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#999" }}>Jestly</span>
        </div>
        <span style={{ fontSize: 10, color: "#CCC" }}>jestly.fr — Rapport généré le {date()}</span>
      </div>
    </div>
  );
});

AnalyticsExportReport.displayName = "AnalyticsExportReport";
export default AnalyticsExportReport;
