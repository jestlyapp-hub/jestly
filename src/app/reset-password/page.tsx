import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResetPasswordForm from "./ResetPasswordForm";

/* ═══════════════════════════════════════════════════════════════════════
   RESET PASSWORD — Server Component
   Exchanges the PKCE code from Supabase email link, then renders form.
   ═══════════════════════════════════════════════════════════════════════ */

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const supabase = await createClient();

  // Exchange the recovery code for a temporary session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      redirect("/login?error=reset-expired");
    }
  }

  // Verify we have a valid session (from code exchange or existing recovery session)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=reset-expired");
  }

  return <ResetPasswordForm />;
}
