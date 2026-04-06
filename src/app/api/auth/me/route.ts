import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { normalizeStorageUrl } from "@/lib/storage-utils";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Fetch profile for sidebar display
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("full_name, business_name, avatar_url, plan, subdomain")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      email: user.email,
      full_name: profile?.full_name || null,
      business_name: profile?.business_name || null,
      avatar_url: normalizeStorageUrl(profile?.avatar_url) || null,
      plan: profile?.plan || "free",
      subdomain: profile?.subdomain || null,
      is_admin: isAdmin(user),
    });
  } catch (err) {
    console.error("[/api/auth/me] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
