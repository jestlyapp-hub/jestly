import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user;
  } catch {
    // Session error → login
  }
  if (!user) redirect("/login");

  return <>{children}</>;
}
