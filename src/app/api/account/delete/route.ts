import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export async function DELETE() {
  // 1. Get authenticated user
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = user.id;

  // 2. Use service role to delete all user data + auth user
  const adminClient = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    // Delete user data from tables (cascade should handle most, but be explicit)
    const tables = [
      { table: "task_comments", column: "user_id" },
      { table: "task_activity_log", column: "user_id" },
      { table: "tasks", column: "user_id" },
      { table: "orders", column: "user_id" },
      { table: "clients", column: "user_id" },
      { table: "calendar_events", column: "user_id" },
      { table: "sites", column: "user_id" },
      { table: "products", column: "owner_id" },
      { table: "brief_templates", column: "owner_id" },
      { table: "task_templates", column: "user_id" },
      { table: "search_documents", column: "user_id" },
    ];

    for (const { table, column } of tables) {
      await (adminClient.from(table) as any).delete().eq(column, userId).throwOnError().catch(() => {});
    }

    // Delete profile
    await (adminClient.from("profiles") as any).delete().eq("id", userId).catch(() => {});

    // Delete auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      return NextResponse.json({ error: "Erreur lors de la suppression du compte" }, { status: 500 });
    }

    // Sign out current session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
