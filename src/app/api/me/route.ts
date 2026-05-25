/**
 * GET /api/me — renvoie l'identité de l'utilisateur connecté.
 * Utilisé côté client pour détecter un changement de compte (mémorisation
 * des intégrations ecom : Pinterest/Shopify sont scopées par user_id, donc
 * un compte différent = intégrations invisibles).
 */
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return NextResponse.json({ authenticated: false });
  return NextResponse.json({
    authenticated: true,
    user: {
      id: auth.user.id,
      email: auth.user.email ?? null,
    },
  });
}
