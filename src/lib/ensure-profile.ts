import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Guarantee that a profile row exists for the current user.
 * Happy path = 1 SELECT by PK (<1ms).
 * If absent → upsert from user_metadata.
 * Returns the User or null if not authenticated.
 */
export async function ensureProfile(
  supabase: SupabaseClient
): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Fast check: does the profile already exist?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from("profiles") as any)
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return user;

  // Profile missing — build one from user metadata
  const meta = user.user_metadata || {};
  const fullName =
    meta.full_name || meta.name || user.email?.split("@")[0] || "User";
  const businessName = meta.business_name || null;

  // Generate subdomain
  let subdomain = meta.subdomain as string | undefined;
  if (!subdomain) {
    const base = (businessName || user.email?.split("@")[0] || "user")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    subdomain = `${base || "user"}-${user.id.slice(0, 4)}`;
  }

  // Upsert — ON CONFLICT (id) so it's idempotent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("profiles") as any).upsert(
    {
      id: user.id,
      email: user.email,
      full_name: fullName,
      business_name: businessName,
      subdomain,
    },
    { onConflict: "id" }
  );

  if (error) {
    // Subdomain collision — retry with longer suffix
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any).upsert(
      {
        id: user.id,
        email: user.email,
        full_name: fullName,
        business_name: businessName,
        subdomain: `${subdomain}-${user.id.slice(4, 8)}`,
      },
      { onConflict: "id" }
    );
  }

  return user;
}
