import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { parseGadsCsv } from "@/lib/gads/csv-parser";
import { importGadsRows } from "@/lib/gads/importer";
import { resolveShopifyIntegration, requestedIntegrationId } from "@/lib/shopify/resolve-integration";

/**
 * POST /api/ecom/gads/import
 * Import incrémental d'un export CSV Google Ads (vue Campagnes, segmenté par jour).
 * Accepte multipart/form-data (champ "file") ou JSON { csv, filename }.
 * Le CSV le plus récent fait foi : upsert par (campagne, jour).
 */
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  let csv: string | null = null;
  let filename = "import.csv";

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (file instanceof File) {
      csv = await file.text();
      filename = file.name || filename;
    }
  } else {
    const body = await req.json().catch(() => null) as { csv?: string; filename?: string } | null;
    if (body?.csv && typeof body.csv === "string") {
      csv = body.csv;
      if (typeof body.filename === "string" && body.filename.trim()) filename = body.filename.trim();
    }
  }

  if (!csv || !csv.trim()) {
    return NextResponse.json(
      { error: "Aucun fichier CSV reçu (champ multipart \"file\" ou JSON { csv, filename })." },
      { status: 400 },
    );
  }

  const parsed = parseGadsCsv(csv);
  if (parsed.rows.length === 0) {
    return NextResponse.json(
      { error: "Aucune ligne exploitable dans ce CSV.", warnings: parsed.warnings },
      { status: 422 },
    );
  }

  // Import rattaché à la boutique sélectionnée (sinon principale).
  const resolved = await resolveShopifyIntegration(auth.supabase, auth.user.id, requestedIntegrationId(req));
  if (!resolved) {
    return NextResponse.json({ error: "Aucune boutique pour rattacher l'import." }, { status: 404 });
  }

  try {
    const recap = await importGadsRows(auth.user.id, resolved.integration.id, parsed, filename);
    return NextResponse.json({ ok: true, recap });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
