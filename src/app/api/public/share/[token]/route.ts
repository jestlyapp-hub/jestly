import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ token: string }> };

// GET /api/public/share/[token] — public shared project view
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const supabaseAdmin = createAdminClient();

  if (!token || token.length < 8) {
    return NextResponse.json({ error: "Token invalide" }, { status: 400 });
  }

  // Fetch project by share token — only if sharing is enabled
  const { data: project, error } = await (supabaseAdmin.from("projects") as any)
    .select("id, name, description, project_type, color, status, tags, cover_url, portfolio_description, portfolio_images, portfolio_category, portfolio_external_url, budget, currency, deadline, start_date, clients(name, company), created_at, updated_at")
    .eq("share_token", token)
    .eq("share_enabled", true)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Projet introuvable ou partage désactivé" }, { status: 404 });
  }

  // Fetch folders
  const { data: folders } = await (supabaseAdmin.from("project_folders") as any)
    .select("id, name, color, position")
    .eq("project_id", project.id)
    .order("position", { ascending: true });

  // Fetch items — exclude private notes content for safety
  const { data: items } = await (supabaseAdmin.from("project_items") as any)
    .select("id, item_type, title, description, url, thumbnail_url, tags, position, is_pinned, folder_id, created_at")
    .eq("project_id", project.id)
    .order("position", { ascending: true });

  // Map to safe public format
  return NextResponse.json({
    project: {
      name: project.name,
      description: project.portfolio_description || project.description || "",
      type: project.project_type,
      color: project.color,
      status: project.status,
      tags: project.tags || [],
      coverUrl: project.cover_url,
      images: project.portfolio_images || [],
      category: project.portfolio_category || "",
      externalUrl: project.portfolio_external_url,
      budget: Number(project.budget || 0),
      currency: project.currency || "EUR",
      deadline: project.deadline,
      startDate: project.start_date,
      clientName: project.clients?.name || null,
      clientCompany: project.clients?.company || null,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    },
    folders: (folders ?? []).map((f: any) => ({
      id: f.id,
      name: f.name,
      color: f.color,
      position: f.position,
    })),
    items: (items ?? []).map((i: any) => ({
      id: i.id,
      type: i.item_type,
      title: i.title,
      description: i.description || "",
      url: i.url,
      thumbnailUrl: i.thumbnail_url,
      tags: i.tags || [],
      position: i.position,
      isPinned: i.is_pinned || false,
      folderId: i.folder_id,
    })),
  }, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}
