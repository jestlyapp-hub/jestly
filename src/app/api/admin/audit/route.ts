import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, validateSort, validatePagination } from "@/lib/admin";

// GET — List admin audit logs with filters + pagination
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const supabase = auth.adminClient;
  const url = new URL(req.url);

  const action = url.searchParams.get("action") || "";
  const result = url.searchParams.get("result") || "";
  const targetType = url.searchParams.get("target_type") || "";
  const sort = validateSort(url.searchParams.get("sort") || "created_at", ["created_at", "action", "actor_email"]);
  const order = url.searchParams.get("order") || "desc";
  const { limit, offset } = validatePagination({
    limit: url.searchParams.get("limit") || "50",
    offset: url.searchParams.get("offset") || "0",
  });

  // ── Build query ──
  let query = (supabase.from("admin_audit_logs") as any).select(
    "id, actor_id, actor_email, action, target_type, target_id, metadata, ip_address, user_agent, result, created_at",
    { count: "exact" },
  );

  if (action) {
    query = query.eq("action", action);
  }

  if (result) {
    query = query.eq("result", result);
  }

  if (targetType) {
    query = query.eq("target_type", targetType);
  }

  // Sort (validé par validateSort ci-dessus)
  query = query.order(sort, { ascending: order === "asc" });
  query = query.range(offset, offset + limit - 1);

  const { data: logs, count, error } = await query;

  if (error) {
    console.error("[admin/audit] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ data: logs || [], total: count || 0 });
}
