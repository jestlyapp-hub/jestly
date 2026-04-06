import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/sites/[id]/pages/[pageId]/blocks — list blocks
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const { id: siteId, pageId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Ownership check
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: site } = await (supabase.from("sites") as any)
    .select("id")
    .eq("id", siteId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!site) return NextResponse.json({ error: "Site introuvable" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("site_blocks") as any)
    .select("*")
    .eq("page_id", pageId)
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/sites/[id]/pages/[pageId]/blocks — save blocks (upsert-then-prune)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const { id: siteId, pageId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Ownership check
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: site } = await (supabase.from("sites") as any)
    .select("id")
    .eq("id", siteId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!site) return NextResponse.json({ error: "Site introuvable" }, { status: 404 });

  const { blocks } = await req.json();

  if (!Array.isArray(blocks)) {
    return NextResponse.json({ error: "Le tableau blocks est requis" }, { status: 400 });
  }

  // ── Stratégie upsert-then-prune ──
  // 1. Upsert tous les blocs envoyés (crée ou met à jour)
  // 2. Supprime uniquement les blocs qui ne sont plus dans la liste
  // Avantage : si l'upsert échoue, les anciens blocs restent intacts

  if (blocks.length === 0) {
    // Cas spécial : page vidée volontairement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase.from("site_blocks") as any)
      .delete()
      .eq("page_id", pageId);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
    return NextResponse.json([]);
  }

  const blocksToUpsert = blocks.map((block: Record<string, unknown>, index: number) => ({
    id: block.id as string | undefined,
    page_id: pageId,
    type: block.type,
    sort_order: index,
    content: block.content || {},
    style: block.style || {},
    settings: block.settings || {},
    visible: block.visible !== false,
  }));

  // Étape 1 : Upsert (safe — les anciens blocs ne sont pas touchés tant que ça réussit)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("site_blocks") as any)
    .upsert(blocksToUpsert, { onConflict: "id" })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Étape 2 : Prune — supprimer les blocs qui ne sont plus dans la liste
  // Seulement après que l'upsert ait réussi
  const survivingIds = (data || []).map((b: { id: string }) => b.id);

  if (survivingIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("site_blocks") as any)
      .delete()
      .eq("page_id", pageId)
      .not("id", "in", `(${survivingIds.join(",")})`);
  }

  return NextResponse.json(data);
}
