import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveShopifyIntegration, requestedIntegrationId } from "@/lib/shopify/resolve-integration";
import { z } from "zod";
import { parseRange } from "../../ads/_helpers";

/**
 * Overrides manuels — commandes attribuées à Google Ads à la main.
 * Table SÉPARÉE (gads_manual_overrides), note obligatoire : les corrections
 * manuelles restent toujours distinguables des données brutes.
 */

const CreateBody = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date attendue au format YYYY-MM-DD"),
  revenue_cents: z.number().int(),
  orders_count: z.number().int().min(0).default(1),
  campaign_name: z.string().trim().min(1).nullable().optional(),
  note: z.string().trim().min(3, "Note obligatoire (3 caractères minimum) : justifiez la correction"),
});

/** GET /api/ecom/gads/manual — liste des overrides de la période. */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  const resolved = await resolveShopifyIntegration(auth.supabase, auth.user.id, requestedIntegrationId(url));
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("gads_manual_overrides") as any)
    .select("id, date, campaign_name, revenue_cents, orders_count, is_manual, note, created_at, updated_at")
    .eq("user_id", auth.user.id)
    .eq("integration_id", resolved?.integration.id ?? "")
    .gte("date", range.from)
    .lte("date", range.to)
    .order("date", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ range, overrides: data ?? [] });
}

/** POST /api/ecom/gads/manual — ajoute un override (note obligatoire). */
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Body invalide", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const resolved = await resolveShopifyIntegration(auth.supabase, auth.user.id, requestedIntegrationId(req));
  if (!resolved) return NextResponse.json({ error: "Aucune boutique pour rattacher l'override." }, { status: 404 });

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("gads_manual_overrides") as any)
    .insert({
      user_id: auth.user.id,
      integration_id: resolved.integration.id,
      date: parsed.data.date,
      revenue_cents: parsed.data.revenue_cents,
      orders_count: parsed.data.orders_count,
      campaign_name: parsed.data.campaign_name ?? null,
      note: parsed.data.note,
      is_manual: true,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, override: data }, { status: 201 });
}
