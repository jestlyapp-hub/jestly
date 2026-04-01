import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SitesHub from "@/components/site-web/SitesHub";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * /site-web — Hub multi-sites.
 * Affiche tous les sites de l'utilisateur, ou un état vide si aucun.
 */
export default async function SiteWebHubPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect("/login");

  return <SitesHub />;
}
