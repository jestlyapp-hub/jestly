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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ownership check
  const { data: site } = await (supabase.from("sites") as any)
    .select("id")
    .eq("id", siteId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("site_blocks") as any)
    .select("*")
    .eq("page_id", pageId)
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/sites/[id]/pages/[pageId]/blocks — bulk upsert blocks
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const { id: siteId, pageId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Ownership check
  const { data: site } = await (supabase.from("sites") as any)
    .select("id")
    .eq("id", siteId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  const { blocks } = await req.json();

  if (!Array.isArray(blocks)) {
    return NextResponse.json({ error: "blocks array required" }, { status: 400 });
  }

  // Delete existing blocks and re-insert (simpler than individual upserts for ordering)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: deleteError } = await (supabase.from("site_blocks") as any)
    .delete()
    .eq("page_id", pageId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (blocks.length === 0) {
    return NextResponse.json([]);
  }

  const blocksToInsert = blocks.map((block: Record<string, unknown>, index: number) => ({
    id: block.id as string | undefined,
    page_id: pageId,
    type: block.type,
    sort_order: index,
    content: block.content || {},
    style: block.style || {},
    settings: block.settings || {},
    visible: block.visible !== false,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("site_blocks") as any)
    .insert(blocksToInsert)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
