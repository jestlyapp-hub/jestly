import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// ── Constantes admin ──────────────────────────────────────────────
export const ADMIN_EMAILS = new Set([
  "jestlyapp@gmail.com",
]);

export const ADMIN_EMAIL = "jestlyapp@gmail.com";

// ID admin lu depuis l'env pour double vérification (optionnel)
export const ADMIN_USER_ID: string | null =
  process.env.ADMIN_USER_ID || null;

// ── Types de retour ───────────────────────────────────────────────

type AdminContext = {
  user: User;
  adminClient: ReturnType<typeof createAdminClient>;
  error?: undefined;
};

type AdminFailure = {
  error: NextResponse;
  user?: undefined;
  adminClient?: undefined;
};

// ── Vérification admin ────────────────────────────────────────────

/**
 * Vérifie si un utilisateur est admin.
 * Check l'email ET optionnellement le user_id pour double sécurité.
 * Utilisé dans les layouts/pages SSR où requireAdmin() n'est pas applicable.
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user?.email) return false;
  if (!ADMIN_EMAILS.has(user.email.toLowerCase())) return false;
  return true;
}

/**
 * Retourne true si ADMIN_USER_ID est configuré dans l'env.
 * Utile pour la page sécurité / status.
 */
export function adminUserIdConfigured(): boolean {
  return !!ADMIN_USER_ID;
}

// ── Logging admin ─────────────────────────────────────────────────

/**
 * Log une action admin dans la table admin_audit_logs.
 * Utilise le client admin (service_role) pour bypasser RLS.
 */
export async function logAdminAction(
  userId: string,
  action: string,
  target?: string,
  metadata?: Record<string, unknown>,
) {
  try {
    const adminClient = createAdminClient();
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Récupérer l'email de l'acteur
    const { data: actor } = await adminClient.auth.admin.getUserById(userId);
    const actorEmail = actor?.user?.email || "unknown";

    await (adminClient.from("admin_audit_logs") as any).insert({
      actor_id: userId,
      actor_email: actorEmail,
      action,
      target_type: target ? "account" : "system",
      target_id: target || null,
      metadata: metadata || {},
      ip_address: ip,
      user_agent: headersList.get("user-agent") || null,
      result: action.includes("denied") ? "denied" : "success",
    });
  } catch {
    // Ne pas bloquer l'exécution si le log échoue
    console.error("[admin] Erreur lors du log audit");
  }
}

// ── Guard principal pour les routes API admin ─────────────────────

/**
 * THE guard principal pour toutes les routes API admin.
 *
 * 1. Authentifie l'utilisateur via getAuthUser()
 * 2. Vérifie isAdmin()
 * 3. Log la tentative d'accès (accordé/refusé) avec IP + user-agent
 * 4. Retourne { user, adminClient } — le adminClient est prêt à l'emploi
 *
 * Usage:
 *   const auth = await requireAdmin();
 *   if (auth.error) return auth.error;
 *   const { user, adminClient } = auth;
 */
export async function requireAdmin(): Promise<AdminContext | AdminFailure> {
  const auth = await getAuthUser();

  if (auth.error) {
    return { error: auth.error };
  }

  const { user } = auth;

  if (!isAdmin(user)) {
    // Log la tentative d'accès non autorisée
    await logAdminAction(user.id, "access_denied", undefined, {
      email: user.email,
    });

    return {
      error: NextResponse.json(
        { error: "Forbidden — admin access required" },
        { status: 403 },
      ),
    };
  }

  // Log l'accès admin réussi
  await logAdminAction(user.id, "access_granted");

  // Créer le client admin pour que la route n'ait pas à le faire
  const adminClient = createAdminClient();

  return { user, adminClient };
}
