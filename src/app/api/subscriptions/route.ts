import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { normalizeDomain } from "@/lib/utils/domain";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── GET — Liste des abonnements ──
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { data, error } = await (supabase.from("subscriptions") as any)
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// ── POST — Créer un abonnement ──
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const {
    name, domain, amount_cents, billing_frequency, billing_day,
    category, is_tax_deductible, status, notes,
  } = body;

  if (!name || amount_cents == null) {
    return NextResponse.json({ error: "name et amount_cents requis" }, { status: 400 });
  }

  // Normaliser le domaine et générer l'URL logo
  const normalizedDomain = domain ? normalizeDomain(domain) : null;
  const logo_url = normalizedDomain ? `https://logo.clearbit.com/${normalizedDomain}` : null;

  // Generate color tag if not provided
  const color_tag = body.color_tag || generateColorFromName(name);

  const { data, error } = await (supabase.from("subscriptions") as any)
    .insert({
      owner_id: user.id,
      name,
      domain: normalizedDomain || null,
      logo_url,
      color_tag,
      amount_cents: Number(amount_cents),
      billing_frequency: billing_frequency || "monthly",
      billing_day: billing_day || 1,
      category: category || "other",
      is_tax_deductible: is_tax_deductible ?? false,
      status: status || "active",
      notes: notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

function generateColorFromName(name: string): string {
  const colors = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#6366F1"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
