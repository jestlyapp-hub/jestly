import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// ─── GET /api/projects — list user's projects ───────────────
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { data, error } = await (supabase.from("projects") as any)
    .select("*, clients(name, email, company), project_items!project_items_project_id_fkey(count), project_folders(count)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    // Missing table (PGRST205 = table not found, 42P01 = PostgreSQL undefined_table)
    if (error.code === "PGRST205" || error.code === "42P01") {
      return NextResponse.json(
        { error: "La table 'projects' n'existe pas encore. Exécutez la migration 028_projects_system.sql dans le SQL Editor de Supabase.", errorType: "migration" },
        { status: 503 }
      );
    }
    // Missing FK relationship (PGRST200)
    if (error.code === "PGRST200") {
      console.error("[projects] FK relationship missing:", error.details);
      return NextResponse.json(
        { error: "Relation manquante en base de données. Exécutez la migration 031_projects_brief_fk.sql.", errorType: "migration" },
        { status: 503 }
      );
    }
    console.error("[projects] list error:", error);
    return NextResponse.json({ error: error.message, errorType: "database" }, { status: 500 });
  }

  const projects = (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description || "",
    projectType: row.project_type,
    color: row.color,
    status: row.status,
    priority: row.priority || "normal",
    budget: Number(row.budget || 0),
    currency: row.currency || "EUR",
    tags: row.tags || [],
    coverUrl: row.cover_url,
    clientId: row.client_id,
    clientName: row.clients?.name ?? null,
    clientEmail: row.clients?.email ?? null,
    clientCompany: row.clients?.company ?? null,
    productId: row.product_id,
    orderId: row.order_id,
    isPortfolio: row.is_portfolio || false,
    portfolioDescription: row.portfolio_description,
    shareToken: row.share_token,
    deadline: row.deadline,
    startDate: row.start_date,
    itemsCount: row.project_items?.[0]?.count ?? 0,
    foldersCount: row.project_folders?.[0]?.count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return NextResponse.json(projects);
}

// ─── POST /api/projects — create project ────────────────────
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { name, description, projectType, color, status, budget, currency, tags, clientId, productId, orderId, deadline, startDate, priority } = body as any;

  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: "Le nom du projet est requis" }, { status: 400 });
  }

  const ALLOWED_TYPES = ["thumbnail", "video", "branding", "development", "design", "content", "custom"];
  const ALLOWED_STATUSES = ["draft", "in_progress", "review", "completed", "archived"];
  const ALLOWED_PRIORITIES = ["low", "normal", "high", "urgent"];

  const insertData: Record<string, unknown> = {
    user_id: user.id,
    name: String(name).trim().slice(0, 200),
    description: String(description || "").slice(0, 5000),
    project_type: ALLOWED_TYPES.includes(projectType) ? projectType : "custom",
    color: String(color || "#4F46E5").slice(0, 20),
    status: ALLOWED_STATUSES.includes(status) ? status : "draft",
    priority: ALLOWED_PRIORITIES.includes(priority) ? priority : "normal",
    budget: Math.max(0, Number(budget) || 0),
    currency: String(currency || "EUR").slice(0, 5),
    tags: Array.isArray(tags) ? tags.slice(0, 20).map((t: string) => String(t).slice(0, 50)) : [],
    client_id: clientId || null,
    product_id: productId || null,
    order_id: orderId || null,
  };

  // Optional date fields
  if (deadline) insertData.deadline = deadline;
  if (startDate) insertData.start_date = startDate;

  const { data, error } = await (supabase.from("projects") as any)
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    if (error.code === "PGRST205" || error.code === "42P01") {
      return NextResponse.json(
        { error: "La table 'projects' n'existe pas encore. Exécutez la migration 028_projects_system.sql dans le SQL Editor de Supabase.", errorType: "migration" },
        { status: 503 }
      );
    }
    console.error("[projects] create error:", error);
    return NextResponse.json({ error: error.message, errorType: "database" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
