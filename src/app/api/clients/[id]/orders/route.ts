import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { enrichOrdersWithProducts } from "@/lib/supabase-helpers";

// GET /api/clients/[id]/orders?status=&page=1&limit=20&search=
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") || "";
  const page = Math.max(1, Number(sp.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, Number(sp.get("limit") || "20")));
  const search = sp.get("search") || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("orders") as any)
    .select("*", { count: "exact" })
    .eq("client_id", id)
    .eq("user_id", user.id);

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: orders, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = count ?? 0;

  const enriched = await enrichOrdersWithProducts(supabase, orders || [], user.id);

  return NextResponse.json({
    orders: enriched,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
