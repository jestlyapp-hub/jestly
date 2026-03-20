import type { PipelineItem, ExportMeta } from "./facturation-types";
import { billingStatusConfig, orderStatusLabels, formatEur } from "./facturation-types";

export function computeExportMeta(items: PipelineItem[], format: "csv" | "pdf"): ExportMeta {
  const totalHt = items.reduce((s, i) => s + i.amount, 0);
  const totalTva = items.reduce((s, i) => s + (i.taxAmount || 0), 0);
  const totalTtc = items.reduce((s, i) => s + (i.totalTtc || i.amount), 0);
  const dates = items.map(i => i.createdAt?.split("T")[0]).filter(Boolean).sort();
  const clientSet = new Set(items.filter(i => i.clientId).map(i => i.clientId!));
  const ext = format === "pdf" ? "pdf" : "csv";
  const filename = `facturation-${new Date().toISOString().slice(0, 10)}.${ext}`;
  return {
    filename, format,
    itemCount: items.length,
    totalHt, totalTva, totalTtc,
    clientCount: clientSet.size,
    clientIds: Array.from(clientSet),
    itemIds: items.map(i => i.id),
    periodStart: dates[0] || null,
    periodEnd: dates[dates.length - 1] || null,
  };
}

export function downloadCsv(items: PipelineItem[]): ExportMeta {
  const headers = ["Titre", "Client", "Type", "Montant HT", "TVA %", "Montant TVA", "Total TTC", "Statut facturation", "Statut commande", "Date création", "Date livraison"];
  const rows = items.map(i => [
    i.title, i.clientName || "", i.type === "order" ? "Commande" : "Manuel",
    i.amount, i.taxRate || 0, i.taxAmount || 0, i.totalTtc || i.amount,
    billingStatusConfig[i.billingStatus]?.label || i.billingStatus,
    i.orderStatus ? (orderStatusLabels[i.orderStatus] || i.orderStatus) : "",
    i.createdAt?.split("T")[0] || "", i.deliveredAt || "",
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const meta = computeExportMeta(items, "csv");
  a.download = meta.filename;
  a.click();
  URL.revokeObjectURL(url);
  return meta;
}

export async function downloadPdf(items: PipelineItem[], periodLabel?: string): Promise<ExportMeta> {
  const jsPDF = (await import("jspdf")).default;
  await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, pageW, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Récapitulatif de facturation", 16, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const subtitle = periodLabel || new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  doc.text(subtitle.charAt(0).toUpperCase() + subtitle.slice(1), 16, 28);

  // Export date
  doc.setFontSize(9);
  doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`, pageW - 16, 28, { align: "right" });

  // Reset text color
  doc.setTextColor(26, 26, 26);

  // Summary cards
  const meta = computeExportMeta(items, "pdf");
  const y0 = 46;

  // Summary row
  doc.setFontSize(9);
  doc.setTextColor(120, 113, 108);
  const summaryPairs = [
    ["PRESTATIONS", String(meta.itemCount)],
    ["CLIENTS", String(meta.clientCount)],
    ["TOTAL HT", formatEur(meta.totalHt)],
    ["TVA", formatEur(meta.totalTva)],
    ["TOTAL TTC", formatEur(meta.totalTtc)],
  ];
  const colW = (pageW - 32) / summaryPairs.length;
  summaryPairs.forEach(([label, val], idx) => {
    const cx = 16 + idx * colW;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 113, 108);
    doc.text(label, cx, y0);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text(val, cx, y0 + 7);
  });

  // Separator
  doc.setDrawColor(230, 230, 228);
  doc.line(16, y0 + 14, pageW - 16, y0 + 14);

  // Table
  const tableY = y0 + 20;
  const tableData = items.map(i => [
    i.title.slice(0, 40),
    i.clientName || "—",
    i.type === "order" ? "Commande" : "Manuel",
    formatEur(i.amount),
    (i.taxRate || 0) > 0 ? `${i.taxRate}%` : "—",
    formatEur(i.totalTtc || i.amount),
    billingStatusConfig[i.billingStatus]?.label || "—",
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).autoTable({
    startY: tableY,
    head: [["Titre", "Client", "Type", "Montant HT", "TVA", "Total TTC", "Statut"]],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [26, 26, 26],
      lineColor: [240, 240, 238],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [250, 250, 249],
      textColor: [87, 83, 78],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 251],
    },
    columnStyles: {
      3: { halign: "right" as const, fontStyle: "bold" as const },
      4: { halign: "center" as const },
      5: { halign: "right" as const, fontStyle: "bold" as const },
    },
    margin: { left: 16, right: 16 },
    didDrawPage: () => {
      // Footer on each page
      doc.setFontSize(7);
      doc.setTextColor(168, 162, 158);
      doc.text("Jestly — Récapitulatif de facturation", 16, doc.internal.pageSize.getHeight() - 8);
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber}`,
        pageW - 16,
        doc.internal.pageSize.getHeight() - 8,
        { align: "right" }
      );
    },
  });

  // Totals row after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || tableY + 20;
  if (finalY + 30 < doc.internal.pageSize.getHeight()) {
    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(0.5);
    doc.line(pageW - 100, finalY + 6, pageW - 16, finalY + 6);
    doc.setFontSize(9);
    doc.setTextColor(87, 83, 78);
    doc.setFont("helvetica", "normal");
    doc.text("Total HT :", pageW - 100, finalY + 14);
    doc.text("TVA :", pageW - 100, finalY + 21);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text(formatEur(meta.totalHt), pageW - 16, finalY + 14, { align: "right" });
    doc.text(formatEur(meta.totalTva), pageW - 16, finalY + 21, { align: "right" });

    doc.setFontSize(11);
    doc.setTextColor(124, 58, 237);
    doc.text("Total TTC :", pageW - 100, finalY + 30);
    doc.text(formatEur(meta.totalTtc), pageW - 16, finalY + 30, { align: "right" });
  }

  doc.save(meta.filename);
  return meta;
}
