import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Toaster from "@/components/ui/Toaster";
import ProductEventTracker from "@/components/ProductEventTracker";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check only — ensureProfile runs once at signup, not on every navigation
  let user;
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    // Supabase unreachable or session corrupted → redirect to login
  }
  if (!user) redirect("/login");

  return (
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
  );
}
