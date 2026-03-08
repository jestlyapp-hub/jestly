import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";
import { isAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await ensureProfile(supabase);

  if (!user || !isAdmin(user)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
