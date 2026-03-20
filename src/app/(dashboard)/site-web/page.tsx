import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * /site-web — Server-side redirect to /site-web/[siteId].
 * Finds the user's most recent site, or creates a draft if none exists.
 */
export default async function SiteWebRedirectPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");
  const user = session.user;

  // Find most recent site
  const { data: sites } = await (supabase.from("sites") as any)
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (sites && sites.length > 0) {
    redirect(`/site-web/${sites[0].id}`);
  }

  // No site — redirect to template selection
  redirect("/site-web/nouveau");
}
