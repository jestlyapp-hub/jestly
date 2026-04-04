import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Toaster from "@/components/ui/Toaster";
import ProductEventTracker from "@/components/ProductEventTracker";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import GuideRoot from "@/features/onboarding-v3/ui/GuideRoot";
import { PreferencesProvider } from "@/lib/hooks/use-preferences";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  let supabaseClient;
  try {
    supabaseClient = await createClient();
    const { data: { session } } = await supabaseClient.auth.getSession();
    user = session?.user;
  } catch {
    // Supabase unreachable or session corrupted → redirect to login
  }
  if (!user) redirect("/login");

  // Vérifier si l'onboarding est complété
  // Les comptes créés avant le 2026-04-03 sont considérés comme déjà onboardés
  const ONBOARDING_LAUNCH = "2026-04-03T00:00:00Z";
  try {
    if (supabaseClient) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabaseClient.from("profiles") as any)
        .select("settings, created_at")
        .eq("id", user.id)
        .single();

      const onboarding = profile?.settings?.onboarding;
      if (!onboarding?.completed) {
        // Comptes anciens → skip onboarding
        const createdAt = profile?.created_at;
        if (createdAt && createdAt < ONBOARDING_LAUNCH) {
          // Auto-marquer comme complété pour ne plus vérifier
          const currentSettings = profile?.settings || {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabaseClient.from("profiles") as any)
            .update({ settings: { ...currentSettings, onboarding: { completed: true, skipped_legacy: true } } })
            .eq("id", user.id);
        } else {
          redirect("/onboarding");
        }
      }
    }
  } catch (e) {
    // redirect() throws NEXT_REDIRECT — rethrow it
    if (e && typeof e === "object" && "digest" in e) throw e;
    // Other errors: let user through (don't block dashboard for a settings read failure)
  }

  return (
    <PreferencesProvider>
    <GuideRoot>
      <div className="flex h-screen bg-[#F7F7F5] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          <Toaster />
          <ProductEventTracker />
        </div>
      </div>
    </GuideRoot>
    </PreferencesProvider>
  );
}
