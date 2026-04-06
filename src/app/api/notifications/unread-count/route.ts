import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getUnreadCount } from "@/lib/notifications/service";

/** GET /api/notifications/unread-count */
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const count = await getUnreadCount(auth.user.id);
  return NextResponse.json({ count });
}
