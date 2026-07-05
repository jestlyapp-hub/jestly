import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

/** Dépenses récurrentes — Net Profit uniquement, jamais dans le BE-ROAS. */

const CreateBody = z.object({
  label: z.string().trim().min(2).max(120),
  amount_cents: z.number().int().min(0),
  period: z.enum(["monthly", "yearly"]).default("monthly"),
  starts_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ends_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("ecom_custom_expenses") as any)
    .select("id, label, amount_cents, period, starts_on, ends_on, created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ expenses: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Body invalide" }, { status: 400 });
  }

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("ecom_custom_expenses") as any)
    .insert({
      user_id: auth.user.id,
      label: parsed.data.label,
      amount_cents: parsed.data.amount_cents,
      period: parsed.data.period,
      starts_on: parsed.data.starts_on ?? new Date().toISOString().slice(0, 10),
      ends_on: parsed.data.ends_on ?? null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, expense: data }, { status: 201 });
}
