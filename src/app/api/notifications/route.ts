import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { listNotifications } from "@/lib/notifications/service";
import type { NotificationCategory } from "@/lib/notifications/types";

/** GET /api/notifications — liste paginée des notifications */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user } = auth;

  const params = req.nextUrl.searchParams;
  const category = (params.get("category") || "all") as NotificationCategory | "all";
  const unreadOnly = params.get("unread") === "true";
  const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 30));
  const offset = Math.max(0, Number(params.get("offset")) || 0);

  const { data, count } = await listNotifications(user.id, {
    category,
    unreadOnly,
    limit,
    offset,
  });

  return NextResponse.json({ notifications: data, total: count });
}
