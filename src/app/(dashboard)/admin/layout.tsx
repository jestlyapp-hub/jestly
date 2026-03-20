import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import AdminSidebar from "@/components/admin/AdminSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-full">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}
