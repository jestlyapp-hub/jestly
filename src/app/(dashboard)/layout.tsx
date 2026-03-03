import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Toaster from "@/components/ui/Toaster";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Safety net: guarantee profile exists for all dashboard pages
  let user;
  try {
    const supabase = await createClient();
    user = await ensureProfile(supabase);
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
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  );
}
