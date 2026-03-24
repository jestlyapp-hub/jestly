import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders, error } = await (supabase.from("orders") as any)
    .select("amount, status, paid, created_at")
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let caMonth = 0;
  let enProduction = 0;
  let attentePaiement = 0;
  const total = orders?.length ?? 0;

  for (const o of orders ?? []) {
    const amount = Number(o.amount);

    // CA this month = paid orders created this month
    if (o.paid && o.created_at >= monthStart) {
      caMonth += amount;
    }

    // En production = brief_received, in_progress, in_review (PAS "new" qui est "à faire")
    if (["brief_received", "in_progress", "in_review"].includes(o.status)) {
      enProduction += amount;
    }

    // Attente paiement = validated or invoiced and not paid
    if (["validated", "invoiced"].includes(o.status) && !o.paid) {
      attentePaiement += amount;
    }
  }

  return NextResponse.json({ caMonth, enProduction, attentePaiement, total });
}
