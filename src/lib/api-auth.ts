import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type AuthSuccess = { user: User; supabase: SupabaseClient; error?: undefined };
type AuthFailure = { error: NextResponse; user?: undefined; supabase?: undefined };

/**
 * Replaces the 3-line auth boilerplate in every API route.
 * Auth check only — ensureProfile runs once at signup (auth/callback), not on every request.
 *
 * Usage:
 *   const auth = await getAuthUser();
 *   if (auth.error) return auth.error;
 *   const { user, supabase } = auth;
 */
export async function getAuthUser(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { user, supabase };
}
