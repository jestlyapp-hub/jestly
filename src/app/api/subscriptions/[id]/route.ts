import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { normalizeDomain } from "@/lib/utils/domain";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Ctx = { params: Promise<{ id: string }> };

// ── GET — Détail d'un abonnement ──
export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { id } = await params;

  const { data, error } = await (supabase.from("subscriptions") as any)
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// ── PATCH — Mettre à jour ──
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { id } = await params;
  const body = await req.json();

  // Normaliser domaine + re-detect logo si domaine changé
  if (body.domain) {
    body.domain = normalizeDomain(body.domain);
    if (!body.logo_url) {
      body.logo_url = `https://logo.clearbit.com/${body.domain}`;
    }
  }

  const { data, error } = await (supabase.from("subscriptions") as any)
    .update(body)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// ── DELETE — Supprimer ──
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { id } = await params;

  const { error } = await (supabase.from("subscriptions") as any)
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
