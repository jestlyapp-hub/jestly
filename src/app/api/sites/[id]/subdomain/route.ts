import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { validateSubdomain } from "@/lib/validate-subdomain";

/* eslint-disable @typescript-eslint/no-explicit-any */

// POST /api/sites/[id]/subdomain — réserver / modifier le sous-domaine
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Parse body
  let body: { subdomain?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (!body.subdomain || typeof body.subdomain !== "string") {
    return NextResponse.json({ error: "Le champ subdomain est requis." }, { status: 400 });
  }

  // Valider le format
  const result = validateSubdomain(body.subdomain);
  if (!result.valid) {
    return NextResponse.json({ error: result.error, reason: result.reason }, { status: 400 });
  }
  const { normalized } = result;

  // Vérifier ownership
  const { data: site, error: fetchErr } = await (supabase.from("sites") as any)
    .select("id, slug")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (fetchErr || !site) {
    return NextResponse.json({ error: "Site introuvable." }, { status: 404 });
  }

  // Pas de changement si même slug
  if (site.slug === normalized) {
    return NextResponse.json({
      subdomain: normalized,
      fullDomain: `https://${normalized}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || "jestly.fr"}`,
    });
  }

  // Mettre à jour le slug (la contrainte UNIQUE gère les collisions)
  const { data: updated, error: updateErr } = await (supabase.from("sites") as any)
    .update({ slug: normalized })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("slug")
    .single();

  if (updateErr) {
    if (updateErr.code === "23505") {
      return NextResponse.json(
        { error: "Ce sous-domaine est déjà pris.", reason: "taken" },
        { status: 409 }
      );
    }
    if (updateErr.code === "23514") {
      return NextResponse.json(
        { error: "Format de sous-domaine invalide.", reason: "invalid" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  console.log(`[subdomain] site=${id} user=${user.id} slug=${updated.slug}`);

  return NextResponse.json({
    subdomain: updated.slug,
    fullDomain: `https://${updated.slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || "jestly.fr"}`,
  });
}
