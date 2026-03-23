import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = user.id;

  const adminClient = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Delete user data — ignore errors for tables that may not exist
  // Order: children first, then parents (to respect FK constraints)
  const deletions = [
    { table: "task_comments", column: "user_id" },
    { table: "task_activity_log", column: "user_id" },
    { table: "task_templates", column: "user_id" },
    { table: "search_documents", column: "user_id" },
    { table: "tasks", column: "user_id" },
    { table: "orders", column: "user_id" },
    { table: "clients", column: "user_id" },
    { table: "calendar_events", column: "user_id" },
    { table: "products", column: "owner_id" },
    { table: "brief_templates", column: "owner_id" },
    { table: "sites", column: "user_id" },
    { table: "profiles", column: "id" },
  ];

  for (const { table, column } of deletions) {
    try {
      await (adminClient.from(table) as any).delete().eq(column, userId);
    } catch {
      // Table may not exist — skip
    }
  }

  // Delete auth user
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error("[DELETE ACCOUNT] auth.admin.deleteUser failed:", deleteError.message);
    return NextResponse.json(
      { error: "Impossible de supprimer le compte. Réessaie ou contacte support@jestly.fr." },
      { status: 500 }
    );
  }

  // Sign out
  await supabase.auth.signOut().catch(() => {});

  return NextResponse.json({ success: true });
}
