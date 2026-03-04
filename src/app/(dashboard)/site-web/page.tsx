import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * /site-web — Server-side redirect to /site-web/[siteId].
 * Finds the user's most recent site, or creates a draft if none exists.
 */
export default async function SiteWebRedirectPage() {
  const supabase = await createClient();
  const user = await ensureProfile(supabase);
  if (!user) redirect("/login");

  // Find most recent site
  const { data: sites } = await (supabase.from("sites") as any)
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (sites && sites.length > 0) {
    redirect(`/site-web/${sites[0].id}`);
  }

  // No site — create a draft
  const slug = `site-${Date.now().toString(36)}`;
  const { data: newSite, error } = await (supabase.from("sites") as any)
    .insert({ owner_id: user.id, slug, name: "Mon site", status: "draft" })
    .select("id")
    .single();

  if (error || !newSite) {
    redirect("/dashboard");
  }

  redirect(`/site-web/${newSite.id}`);
}
