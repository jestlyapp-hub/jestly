// ═══════════════════════════════════════════════════════════
// Analytics Export Utilities — CSV, PDF, PNG
// Uses html2canvas (robust) + jsPDF
// ═══════════════════════════════════════════════════════════

// ── Format helpers ──

export function fmtEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
export function fmtPct(n: number): string { return `${Math.round(n * 10) / 10}%`; }
export function fmtDate(): string { return new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); }

const RANGE_LABELS: Record<string, string> = {
  today: "Aujourd'hui", "7d": "7 jours", "30d": "30 jours",
  "90d": "90 jours", "12m": "12 mois", all: "Tout",
};
export function rangeLabel(range: string): string { return RANGE_LABELS[range] || range; }

export function exportFileName(ext: string, range: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const slug = rangeLabel(range).toLowerCase().replace(/\s+/g, "-").replace(/['']/g, "");
  return `jestly-analytics-${slug}-${date}.${ext}`;
}

// ── Types ──

export interface ExportProduct { name: string; revenue: number; orders: number; avgPrice: number; revenueShare: number; }
export interface ExportClient { name: string; email: string; revenue: number; orders: number; }
export interface ExportGrowth { month: string; revenue: number; orders: number; revenueGrowth: number; }
export interface ExportTimePoint { label: string; revenue: number; orders: number; }

export interface ExportData {
  range: string;
  kpis: {
    totalRevenue: number; netProfit: number; totalOrders: number;
    conversionRate: number; avgOrderValue: number; returningRate: number;
    refundRate: number; activeClients: number;
    revenueChange: number; profitChange: number; ordersChange: number;
    conversionChange: number; aovChange: number; clientsChange: number;
  };
  pipeline: {
    totalRevenue: number; totalCount: number;
    inProgressRevenue: number; inProgressCount: number;
    readyRevenue: number; readyCount: number;
  };
  timeSeries: ExportTimePoint[];
  topProducts: ExportProduct[];
  topClients: ExportClient[];
  customerAnalytics: { newCustomers: number; returningCustomers: number; segments: { segment: string; count: number; revenue: number }[] };
  monthlyGrowth: ExportGrowth[];
  forecast: { nextMonth: number; trend: string; confidence: number; avgGrowthRate?: number };
  bestMonth: { month: string; revenue: number } | null;
  worstMonth: { month: string; revenue: number } | null;
  insights: string[];
  revenueByDay: { name: string; revenue: number; orders: number }[];
}

// ═══════════════════════════════════════
// CSV EXPORT
// ═══════════════════════════════════════

export function downloadCsv(d: ExportData): void {
  const s = ";";
  const L: string[] = [];

  L.push("Rapport Analytics Jestly");
  L.push(`Période${s}${rangeLabel(d.range)}`);
  L.push(`Date d'export${s}${fmtDate()}`);
  L.push("");

  L.push("Pipeline de commandes");
  L.push(`Métrique${s}Montant${s}Détail`);
  L.push(`CA total${s}${fmtEur(d.pipeline.totalRevenue)}${s}${d.pipeline.totalCount} commandes`);
  L.push(`En cours${s}${fmtEur(d.pipeline.inProgressRevenue)}${s}${d.pipeline.inProgressCount} en production`);
  L.push(`Prêtes${s}${fmtEur(d.pipeline.readyRevenue)}${s}${d.pipeline.readyCount} à facturer`);
  L.push("");

  L.push("Indicateurs clés");
  L.push(`Métrique${s}Valeur${s}Évolution`);
  L.push(`Revenu net${s}${fmtEur(d.kpis.netProfit)}${s}${d.kpis.profitChange > 0 ? "+" : ""}${Math.round(d.kpis.profitChange)}%`);
  L.push(`Commandes finalisées${s}${d.kpis.totalOrders}${s}${d.kpis.ordersChange > 0 ? "+" : ""}${Math.round(d.kpis.ordersChange)}%`);
  L.push(`Taux de conversion${s}${fmtPct(d.kpis.conversionRate)}${s}${d.kpis.conversionChange > 0 ? "+" : ""}${d.kpis.conversionChange}pts`);
  L.push(`Panier moyen${s}${fmtEur(d.kpis.avgOrderValue)}${s}${d.kpis.aovChange > 0 ? "+" : ""}${Math.round(d.kpis.aovChange)}%`);
  L.push(`Clients récurrents${s}${fmtPct(d.kpis.returningRate)}${s}`);
  L.push(`Taux de remboursement${s}${fmtPct(d.kpis.refundRate)}${s}`);
  L.push(`Clients actifs${s}${d.kpis.activeClients}${s}${d.kpis.clientsChange > 0 ? "+" : ""}${Math.round(d.kpis.clientsChange)}%`);
  L.push("");

  if (d.timeSeries.length > 0) {
    L.push("Évolution des revenus");
    L.push(`Période${s}Revenu${s}Commandes`);
    for (const p of d.timeSeries) L.push(`${p.label}${s}${fmtEur(p.revenue)}${s}${p.orders}`);
    L.push("");
  }
  if (d.revenueByDay.length > 0) {
    L.push("Revenu par jour de la semaine");
    L.push(`Jour${s}Revenu${s}Commandes`);
    for (const p of d.revenueByDay) L.push(`${p.name}${s}${fmtEur(p.revenue)}${s}${p.orders}`);
    L.push("");
  }
  if (d.topProducts.length > 0) {
    L.push("Performance des produits");
    L.push(`Produit${s}Revenu${s}Commandes${s}Prix moyen${s}Part CA`);
    for (const p of d.topProducts) L.push(`${p.name}${s}${fmtEur(p.revenue)}${s}${p.orders}${s}${fmtEur(p.avgPrice)}${s}${p.revenueShare}%`);
    L.push("");
  }
  if (d.topClients.length > 0) {
    L.push("Meilleurs clients");
    L.push(`Client${s}Email${s}Revenu${s}Commandes`);
    for (const c of d.topClients) L.push(`${c.name}${s}${c.email}${s}${fmtEur(c.revenue)}${s}${c.orders}`);
    L.push("");
  }
  if (d.customerAnalytics.segments.length > 0) {
    L.push("Segments clients");
    L.push(`Segment${s}Clients${s}Revenu`);
    for (const seg of d.customerAnalytics.segments) L.push(`${seg.segment}${s}${seg.count}${s}${fmtEur(seg.revenue)}`);
    L.push("");
  }
  if (d.monthlyGrowth.length > 0) {
    L.push("Croissance mensuelle");
    L.push(`Mois${s}Revenu${s}Commandes${s}Croissance`);
    for (const m of d.monthlyGrowth) L.push(`${m.month}${s}${fmtEur(m.revenue)}${s}${m.orders}${s}${m.revenueGrowth > 0 ? "+" : ""}${m.revenueGrowth}%`);
    L.push("");
  }
  if (d.forecast.confidence > 0 && d.forecast.nextMonth > 0) {
    L.push("Prévision");
    L.push(`Revenu estimé prochain mois${s}${fmtEur(d.forecast.nextMonth)}`);
    L.push(`Confiance${s}${d.forecast.confidence}%`);
    L.push("");
  }
  if (d.bestMonth) L.push(`Meilleur mois${s}${d.bestMonth.month}${s}${fmtEur(d.bestMonth.revenue)}`);
  if (d.worstMonth) L.push(`Pire mois${s}${d.worstMonth.month}${s}${fmtEur(d.worstMonth.revenue)}`);
  if (d.insights.length > 0) { L.push(""); L.push("Insights"); for (const i of d.insights) L.push(i); }

  const csv = "\uFEFF" + L.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = exportFileName("csv", d.range);
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════
// CAPTURE ENGINE (html2canvas — much more robust than html-to-image)
// ═══════════════════════════════════════

/**
 * Captures a DOM node as a canvas using html2canvas.
 *
 * Strategy:
 * 1. Temporarily move the node into the viewport (position:fixed, inset:0)
 * 2. Wait for browser paint (double rAF + timeout)
 * 3. Capture with html2canvas
 * 4. Restore original position
 *
 * This ensures the browser has ACTUALLY painted the content.
 */
const EXPORT_W = 794; // A4 portrait at 96dpi

async function captureNode(node: HTMLElement): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default;

  // Save original styles of node AND its parent wrapper
  const origStyle = node.style.cssText;
  const parent = node.parentElement;
  const origParentStyle = parent?.style.cssText ?? "";

  // Move parent wrapper into viewport so the node gets painted
  if (parent) {
    parent.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: ${EXPORT_W}px !important;
      z-index: -9999 !important;
      pointer-events: none !important;
      overflow: visible !important;
    `;
  }

  // Ensure node itself is fully visible
  node.style.cssText = `
    width: ${EXPORT_W}px !important;
    background: #ffffff !important;
    padding: 36px !important;
    box-sizing: border-box !important;
    color: #111111 !important;
    overflow: visible !important;
    opacity: 1 !important;
  `;

  // Force reflow + wait for paint
  void node.offsetHeight;
  await new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 600);
      });
    });
  });

  const rect = node.getBoundingClientRect();
  console.log(`[EXPORT] Capture: ${rect.width}x${rect.height}, children: ${node.childElementCount}`);

  try {
    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: "#FFFFFF",
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: EXPORT_W,
      height: Math.ceil(rect.height),
      windowWidth: EXPORT_W,
      windowHeight: Math.ceil(rect.height),
    });
    return canvas;
  } finally {
    // Restore
    node.style.cssText = origStyle;
    if (parent) parent.style.cssText = origParentStyle;
  }
}

// ═══════════════════════════════════════
// PNG EXPORT
// ═══════════════════════════════════════

export async function downloadPng(node: HTMLElement, range: string): Promise<void> {
  const canvas = await captureNode(node);
  const dataUrl = canvas.toDataURL("image/png", 1.0);
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = exportFileName("png", range);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ═══════════════════════════════════════
// PDF EXPORT
// ═══════════════════════════════════════

export async function downloadPdf(node: HTMLElement, range: string): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const canvas = await captureNode(node);
  const imgData = canvas.toDataURL("image/png", 1.0);

  // A4 portrait
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth(); // 210mm
  const pageH = pdf.internal.pageSize.getHeight(); // 297mm
  const margin = 6;
  const footerH = 8;
  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2 - footerH;

  // Scale image to fit page width
  const scale = usableW / (canvas.width / 2); // canvas is at 2x
  const imgWmm = usableW;
  const imgHmm = (canvas.height / 2) * scale;

  if (imgHmm <= usableH) {
    // Fits on one page
    pdf.addImage(imgData, "PNG", margin, margin, imgWmm, imgHmm);
  } else {
    // Multi-page: slice the image
    const pxPerPage = Math.floor(usableH / scale * 2); // pixels per page at 2x
    let yPx = 0;
    let pageNum = 0;

    while (yPx < canvas.height) {
      if (pageNum > 0) pdf.addPage();
      const sliceH = Math.min(pxPerPage, canvas.height - yPx);

      // Create a slice canvas
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      const ctx = sliceCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(canvas, 0, yPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      }
      const sliceData = sliceCanvas.toDataURL("image/png", 1.0);
      const sliceHmm = (sliceH / 2) * scale;
      pdf.addImage(sliceData, "PNG", margin, margin, imgWmm, sliceHmm);

      yPx += sliceH;
      pageNum++;
    }
  }

  // Footer on last page
  pdf.setFontSize(7);
  pdf.setTextColor(153, 153, 153);
  pdf.text(`Généré par Jestly — jestly.fr — ${new Date().toLocaleDateString("fr-FR")}`, pageW / 2, pageH - 4, { align: "center" });
  pdf.save(exportFileName("pdf", range));
}
