/**
 * Parser CSV Google Ads — export standard "vue Campagnes, segmenté par jour".
 *
 * Robuste aux réalités des exports Google :
 *  - lignes d'en-tête parasites avant le header (titre du rapport, plage de dates)
 *  - lignes de total / sous-total ("Total : toutes les campagnes", "Total: Search"…)
 *  - noms de colonnes FR/EN (Jour/Day, Campagne/Campaign, Coût/Cost,
 *    Valeur de conv./Conv. value…)
 *  - formats de nombre FR (virgule décimale, espaces milliers, symbole €)
 *    et EN (point décimal, virgules milliers entre guillemets)
 *  - séparateur virgule, point-virgule ou tabulation (détection automatique)
 *  - doublons (campagne, jour) — ex. export segmenté par réseau — sommés
 */

export interface GadsCsvRow {
  campaign_name: string;
  date: string; // YYYY-MM-DD
  cost_cents: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversion_value_cents: number;
}

export interface GadsCsvParseResult {
  rows: GadsCsvRow[];
  skipped_totals: number;
  warnings: string[];
}

// ── Normalisation des en-têtes (minuscules, sans accents) ────────
function normalizeHeader(cell: string): string {
  return cell
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const DATE_HEADERS = new Set(["jour", "day", "date"]);
const CAMPAIGN_HEADERS = new Set(["campagne", "campaign", "nom de la campagne", "campaign name"]);
const CLICKS_HEADERS = new Set(["clics", "clicks"]);
const IMPRESSIONS_HEADERS = new Set(["impressions", "impr.", "impr"]);
const CONVERSIONS_HEADERS = new Set(["conversions", "toutes les conversions", "all conversions"]);
const CONV_VALUE_HEADERS = new Set([
  "valeur de conv.", "valeur de conv", "valeur de conversion", "valeur des conversions",
  "valeur de toutes les conversions", "conv. value", "conv value", "conversion value",
  "all conv. value", "total conv. value",
]);

function isCostHeader(h: string): boolean {
  // "coût", "cost", "coût (eur)", "cost (eur)" — mais PAS "coût / conv."
  return h === "cout" || h === "cost" || h.startsWith("cout (") || h.startsWith("cost (");
}

// ── Parsing d'une ligne CSV (guillemets gérés) ───────────────────
function parseCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      cells.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

// ── Nombres localisés FR/EN ──────────────────────────────────────
/**
 * "1 234,56 €" → 1234.56 ; "1,234.56" → 1234.56 ; "12,34" → 12.34 ;
 * "1,234" (EN milliers, 3 chiffres après l'unique virgule) → 1234 ;
 * "--" / "—" / "" → 0. Renvoie null si non numérique.
 */
export function parseLocaleNumber(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s || s === "--" || s === "—" || s === "-") return 0;
  // Devise, %, espaces (y compris insécables   et fines  ), guillemets.
  s = s.replace(/["']/g, "").replace(/(eur|€|%)/gi, "").replace(/[\s  ]/g, "");
  if (!s) return 0;

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    // Le dernier séparateur rencontré est le décimal, l'autre fait les milliers.
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (hasComma) {
    const parts = s.split(",");
    // Plusieurs virgules, ou une seule suivie d'exactement 3 chiffres → milliers EN.
    // Google FR affiche les décimales sur 2 chiffres ("12,34"), jamais 3.
    if (parts.length > 2 || (parts.length === 2 && /^\d{3}$/.test(parts[1]))) s = s.replace(/,/g, "");
    else s = s.replace(",", ".");
  } else if (hasDot) {
    const parts = s.split(".");
    if (parts.length > 2) s = s.replace(/\./g, ""); // "1.234.567" → milliers
  }

  const v = parseFloat(s);
  return Number.isFinite(v) ? v : null;
}

// ── Dates : YYYY-MM-DD (standard Google) ou DD/MM/YYYY ───────────
export function parseCsvDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return null;
}

interface HeaderMap {
  delimiter: string;
  headerIndex: number;
  date: number;
  campaign: number;
  cost: number;
  clicks: number;
  impressions: number;
  conversions: number;
  convValue: number;
}

function findHeader(lines: string[]): HeaderMap | null {
  const delimiters = ["\t", ";", ","];
  const scanLimit = Math.min(lines.length, 15);
  for (let i = 0; i < scanLimit; i++) {
    for (const delimiter of delimiters) {
      const cells = parseCsvLine(lines[i], delimiter).map(normalizeHeader);
      if (cells.length < 3) continue;
      const date = cells.findIndex((c) => DATE_HEADERS.has(c));
      const campaign = cells.findIndex((c) => CAMPAIGN_HEADERS.has(c));
      const cost = cells.findIndex((c) => isCostHeader(c));
      if (date === -1 || campaign === -1 || cost === -1) continue;
      return {
        delimiter,
        headerIndex: i,
        date,
        campaign,
        cost,
        clicks: cells.findIndex((c) => CLICKS_HEADERS.has(c)),
        impressions: cells.findIndex((c) => IMPRESSIONS_HEADERS.has(c)),
        conversions: cells.findIndex((c) => CONVERSIONS_HEADERS.has(c)),
        convValue: cells.findIndex((c) => CONV_VALUE_HEADERS.has(c)),
      };
    }
  }
  return null;
}

// ── Parse complet ────────────────────────────────────────────────
export function parseGadsCsv(content: string): GadsCsvParseResult {
  const warnings: string[] = [];
  const text = content.replace(/^﻿/, ""); // BOM UTF-8
  const lines = text.split(/\r\n|\r|\n/);

  const header = findHeader(lines);
  if (!header) {
    return {
      rows: [],
      skipped_totals: 0,
      warnings: [
        "En-tête introuvable : le CSV doit contenir au minimum les colonnes Jour/Day, Campagne/Campaign et Coût/Cost (export Google Ads, vue Campagnes segmentée par jour).",
      ],
    };
  }
  if (header.clicks === -1) warnings.push("Colonne Clics/Clicks absente — clics à 0.");
  if (header.impressions === -1) warnings.push("Colonne Impressions absente — impressions à 0.");
  if (header.conversions === -1) warnings.push("Colonne Conversions absente — conversions à 0.");
  if (header.convValue === -1) warnings.push("Colonne Valeur de conv./Conv. value absente — valeur de conversion à 0.");

  const byKey = new Map<string, GadsCsvRow>();
  let skippedTotals = 0;

  for (let i = header.headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cells = parseCsvLine(line, header.delimiter);

    const campaignRaw = (cells[header.campaign] ?? "").trim();
    const dateRaw = (cells[header.date] ?? "").trim();

    // Lignes de total / sous-total Google ("Total : toutes les campagnes", "Total: Search"…)
    if (/^total\b/i.test(normalizeHeader(campaignRaw)) || /^total\b/i.test(normalizeHeader(dateRaw))) {
      skippedTotals++;
      continue;
    }

    const date = parseCsvDate(dateRaw);
    if (!date) {
      if (campaignRaw || dateRaw) {
        warnings.push(`Ligne ${i + 1} ignorée : date illisible ("${dateRaw}").`);
      }
      continue;
    }
    if (!campaignRaw) {
      warnings.push(`Ligne ${i + 1} ignorée : nom de campagne vide.`);
      continue;
    }

    const num = (idx: number): number => {
      if (idx === -1) return 0;
      const v = parseLocaleNumber(cells[idx]);
      if (v == null) {
        warnings.push(`Ligne ${i + 1} : valeur numérique illisible ("${cells[idx]}") — remplacée par 0.`);
        return 0;
      }
      return v;
    };

    const row: GadsCsvRow = {
      campaign_name: campaignRaw,
      date,
      cost_cents: Math.round(num(header.cost) * 100),
      clicks: Math.round(num(header.clicks)),
      impressions: Math.round(num(header.impressions)),
      conversions: num(header.conversions),
      conversion_value_cents: Math.round(num(header.convValue) * 100),
    };

    // Doublons (campagne, jour) dans le même fichier (ex. segmenté par réseau) : sommés.
    const key = `${row.campaign_name}|${row.date}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.cost_cents += row.cost_cents;
      existing.clicks += row.clicks;
      existing.impressions += row.impressions;
      existing.conversions = Math.round((existing.conversions + row.conversions) * 100) / 100;
      existing.conversion_value_cents += row.conversion_value_cents;
    } else {
      byKey.set(key, row);
    }
  }

  const rows = [...byKey.values()].sort((a, b) =>
    a.date === b.date ? a.campaign_name.localeCompare(b.campaign_name) : a.date.localeCompare(b.date),
  );
  return { rows, skipped_totals: skippedTotals, warnings };
}
