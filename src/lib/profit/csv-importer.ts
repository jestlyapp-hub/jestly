/**
 * Importateur CSV des COGS (coût des marchandises vendues).
 *
 * Colonnes acceptées (ordre libre, en-tête insensible à la casse) :
 *  - `product_id` ou `sku`  (au moins un requis)
 *  - `variant_id`           (optionnel)
 *  - `cogs`                 (requis, en unité monétaire : "12.50")
 *  - `shipping_cost`        (optionnel, en unité monétaire)
 *  - `effective_from`       (optionnel, YYYY-MM-DD, défaut = aujourd'hui)
 *
 * Fonction pure : parsing + validation uniquement, aucune écriture en base.
 */
import { z } from "zod";

export interface ParsedCostRow {
  product_id: string | null;
  sku: string | null;
  variant_id: string | null;
  cogs_cents: number;
  shipping_cost_cents: number;
  effective_from: string; // YYYY-MM-DD
}

export interface CsvRowError {
  line: number; // numéro de ligne dans le fichier (1-indexé, en-tête = 1)
  message: string;
}

export interface CsvParseResult {
  rows: ParsedCostRow[];
  errors: CsvRowError[];
}

/** Convertit un montant monétaire ("12,50" ou "12.50") en centimes entiers. */
export function moneyToCents(raw: string): number | null {
  const normalized = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

/** Parser CSV minimal gérant les champs entre guillemets et les virgules échappées. */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields.map((f) => f.trim());
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const rowSchema = z
  .object({
    product_id: z.string().nullable(),
    sku: z.string().nullable(),
    variant_id: z.string().nullable(),
    cogs_cents: z.number().int().nonnegative(),
    shipping_cost_cents: z.number().int().nonnegative(),
    effective_from: z.string().regex(ISO_DATE, "Date invalide (attendu YYYY-MM-DD)"),
  })
  .refine((r) => r.product_id !== null || r.sku !== null, {
    message: "product_id ou sku requis",
  });

export function parseCogsCsv(text: string, today = "1970-01-01"): CsvParseResult {
  const rows: ParsedCostRow[] = [];
  const errors: CsvRowError[] = [];

  const lines = text.split(/\r?\n/).filter((l, i) => !(i > 0 && l.trim() === ""));
  if (lines.length === 0 || lines[0]!.trim() === "") {
    return { rows, errors: [{ line: 1, message: "Fichier vide" }] };
  }

  const header = parseCsvLine(lines[0]!).map((h) => h.toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const idxProduct = col("product_id");
  const idxSku = col("sku");
  const idxVariant = col("variant_id");
  const idxCogs = col("cogs");
  const idxShipping = col("shipping_cost");
  const idxEffective = col("effective_from");

  if (idxCogs === -1) {
    return { rows, errors: [{ line: 1, message: "Colonne cogs manquante" }] };
  }
  if (idxProduct === -1 && idxSku === -1) {
    return { rows, errors: [{ line: 1, message: "Colonne product_id ou sku requise" }] };
  }

  for (let i = 1; i < lines.length; i += 1) {
    const lineNo = i + 1;
    const raw = lines[i]!;
    if (raw.trim() === "") continue;
    const cells = parseCsvLine(raw);

    const cogsCents = moneyToCents(cells[idxCogs] ?? "");
    if (cogsCents === null) {
      errors.push({ line: lineNo, message: "cogs invalide" });
      continue;
    }
    const shippingCents =
      idxShipping !== -1 && (cells[idxShipping] ?? "").trim() !== ""
        ? moneyToCents(cells[idxShipping]!)
        : 0;
    if (shippingCents === null) {
      errors.push({ line: lineNo, message: "shipping_cost invalide" });
      continue;
    }

    const candidate = {
      product_id: idxProduct !== -1 && cells[idxProduct]?.trim() ? cells[idxProduct]!.trim() : null,
      sku: idxSku !== -1 && cells[idxSku]?.trim() ? cells[idxSku]!.trim() : null,
      variant_id: idxVariant !== -1 && cells[idxVariant]?.trim() ? cells[idxVariant]!.trim() : null,
      cogs_cents: cogsCents,
      shipping_cost_cents: shippingCents,
      effective_from:
        idxEffective !== -1 && cells[idxEffective]?.trim()
          ? cells[idxEffective]!.trim()
          : today,
    };

    const parsed = rowSchema.safeParse(candidate);
    if (!parsed.success) {
      errors.push({ line: lineNo, message: parsed.error.issues[0]?.message ?? "Ligne invalide" });
      continue;
    }
    rows.push(parsed.data);
  }

  return { rows, errors };
}
