import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };

// ─── GET /api/projects/[id] — project detail ────────────────
export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id } = await ctx.params;

  const { data, error } = await (supabase.from("projects") as any)
    .select("*, clients(id, name, email, company, phone), project_items(count), brief_templates:brief_template_id(id, name, schema)")
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error?.message?.includes("schema cache") || error?.code === "PGRST205") {
      return NextResponse.json({ error: "Table 'projects' manquante. Exécutez la migration." }, { status: 503 });
    }
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  // Fetch folders
  const { data: folders } = await (supabase.from("project_folders") as any)
    .select("*, project_items(count)")
    .eq("project_id", id)
    .order("position", { ascending: true });

  // Fetch items
  const { data: items } = await (supabase.from("project_items") as any)
    .select("*")
    .eq("project_id", id)
    .order("position", { ascending: true });

  return NextResponse.json({
    project: {
      id: data.id,
      name: data.name,
      description: data.description || "",
      projectType: data.project_type,
      color: data.color,
      status: data.status,
      priority: data.priority || "normal",
      budget: Number(data.budget || 0),
      currency: data.currency || "EUR",
      tags: data.tags || [],
      coverUrl: data.cover_url,
      clientId: data.client_id,
      client: data.clients ?? null,
      productId: data.product_id,
      orderId: data.order_id,
      isPortfolio: data.is_portfolio || false,
      portfolioDescription: data.portfolio_description,
      shareToken: data.share_token,
      shareEnabled: data.share_enabled || false,
      deadline: data.deadline,
      startDate: data.start_date,
      briefTemplateId: data.brief_template_id,
      briefTemplate: data.brief_templates ?? null,
      portfolioImages: data.portfolio_images || [],
      portfolioCategory: data.portfolio_category || "",
      portfolioExternalUrl: data.portfolio_external_url,
      itemsCount: data.project_items?.[0]?.count ?? 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    folders: (folders ?? []).map((f: any) => ({
      id: f.id,
      projectId: f.project_id,
      parentId: f.parent_id,
      name: f.name,
      color: f.color || "#8A8A88",
      position: f.position,
      itemsCount: f.project_items?.[0]?.count ?? 0,
    })),
    items: (items ?? []).map((i: any) => ({
      id: i.id,
      projectId: i.project_id,
      folderId: i.folder_id,
      itemType: i.item_type,
      title: i.title,
      description: i.description || "",
      content: i.content || "",
      url: i.url,
      filePath: i.file_path,
      fileSize: i.file_size,
      mimeType: i.mime_type,
      thumbnailUrl: i.thumbnail_url,
      tags: i.tags || [],
      metadata: i.metadata || {},
      position: i.position,
      isPinned: i.is_pinned || false,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
    })),
  });
}

// ─── PATCH /api/projects/[id] — update project ──────────────
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const allowed: Record<string, string> = {
    name: "name",
    description: "description",
    projectType: "project_type",
    color: "color",
    status: "status",
    priority: "priority",
    budget: "budget",
    currency: "currency",
    tags: "tags",
    coverUrl: "cover_url",
    clientId: "client_id",
    productId: "product_id",
    orderId: "order_id",
    isPortfolio: "is_portfolio",
    portfolioDescription: "portfolio_description",
    deadline: "deadline",
    startDate: "start_date",
    briefTemplateId: "brief_template_id",
    portfolioImages: "portfolio_images",
    portfolioCategory: "portfolio_category",
    portfolioExternalUrl: "portfolio_external_url",
    shareToken: "share_token",
    shareEnabled: "share_enabled",
  };

  const updates: Record<string, unknown> = {};
  for (const [key, col] of Object.entries(allowed)) {
    if (key in body) updates[col] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucun champ à modifier" }, { status: 400 });
  }

  const { error } = await (supabase.from("projects") as any)
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("[projects] update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// ─── DELETE /api/projects/[id] — delete project ─────────────
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id } = await ctx.params;

  const { error } = await (supabase.from("projects") as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[projects] delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
