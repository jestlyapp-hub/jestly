import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ email: null, is_admin: false });
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
      avatar_url: profile?.avatar_url || null,
      plan: profile?.plan || "free",
      subdomain: profile?.subdomain || null,
      is_admin: isAdmin(user),
    });
  } catch {
    return NextResponse.json({ email: null, is_admin: false });
  }
}
