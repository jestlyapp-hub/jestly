import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * DELETE /api/account/delete
 * Suppression définitive du compte.
 * Exige le mot de passe actuel pour confirmer l'intention.
 */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // ── Vérification d'intention : mot de passe requis ──
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  if (!body.password || typeof body.password !== "string") {
    return NextResponse.json({ error: "Le mot de passe est requis pour confirmer la suppression." }, { status: 400 });
  }

  // Vérifier le mot de passe via une tentative de sign-in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: body.password,
  });

  if (signInError) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 403 });
  }

  const userId = user.id;
  const adminClient = createAdminClient();

  console.log(`[DELETE ACCOUNT] Début suppression pour user ${userId} (${user.email})`);

  // ── Suppression des données ──
  // Ordre : enfants d'abord (respect FK), puis profil (CASCADE nettoie le reste)
  // On ne silencifie PAS les erreurs — si une suppression échoue, on s'arrête.
  const deletions = [
    { table: "notifications", column: "user_id" },
    { table: "search_documents", column: "user_id" },
    { table: "analytics_events", column: "user_id" },
    { table: "support_tickets", column: "user_id" },
    { table: "leads", column: "site_id", subquery: true },
    { table: "site_product_links", column: "site_id", subquery: true },
    { table: "calendar_events", column: "user_id" },
    { table: "tasks", column: "user_id" },
    { table: "orders", column: "user_id" },
    { table: "clients", column: "user_id" },
    { table: "products", column: "owner_id" },
    { table: "sites", column: "owner_id" },
    { table: "projects", column: "user_id" },
  ];

  for (const { table, column } of deletions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: delError } = await (adminClient.from(table) as any)
      .delete()
      .eq(column, userId);

    if (delError) {
      // Table inexistante → skip (migration pas encore appliquée)
      if (delError.message?.includes("does not exist") || delError.message?.includes("Could not find")) {
        continue;
      }
      console.error(`[DELETE ACCOUNT] Erreur suppression ${table}:`, delError.message);
      return NextResponse.json(
        { error: `Échec de suppression des données (${table}). Contactez support@jestly.fr.` },
        { status: 500 },
      );
    }
  }

  // Supprimer le profil (les FK CASCADE nettoient les dépendances restantes)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (adminClient.from("profiles") as any)
    .delete()
    .eq("id", userId);

  if (profileError) {
    console.error("[DELETE ACCOUNT] Erreur suppression profil:", profileError.message);
    return NextResponse.json(
      { error: "Échec de suppression du profil. Contactez support@jestly.fr." },
      { status: 500 },
    );
  }

  // Supprimer l'utilisateur auth
  const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
  if (deleteAuthError) {
    console.error("[DELETE ACCOUNT] auth.admin.deleteUser failed:", deleteAuthError.message);
    return NextResponse.json(
      { error: "Impossible de supprimer le compte auth. Contactez support@jestly.fr." },
      { status: 500 },
    );
  }

  // Sign out
  await supabase.auth.signOut().catch(() => {});

  console.log(`[DELETE ACCOUNT] Suppression réussie pour user ${userId}`);
  return NextResponse.json({ success: true });
}
