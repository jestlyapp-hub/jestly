import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { markAllAsRead } from "@/lib/notifications/service";

/** POST /api/notifications/mark-all-read */
export async function POST() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const ok = await markAllAsRead(auth.user.id);
  if (!ok) {
    return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
