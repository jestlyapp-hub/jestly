import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

/**
 * GET /api/settings/export?format=json|csv
 * Exports all user data (profile, clients, orders, products, tasks) as JSON or CSV.
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const format = req.nextUrl.searchParams.get("format") || "json";
  if (format !== "json" && format !== "csv") {
    return NextResponse.json({ error: "Format must be json or csv" }, { status: 400 });
  }

  // Fetch all user data in parallel
  const [profileRes, clientsRes, ordersRes, productsRes, tasksRes] = await Promise.all([
    (supabase.from("profiles") as any).select("*").eq("id", user.id).single(),
    (supabase.from("clients") as any).select("*").eq("user_id", user.id),
    (supabase.from("orders") as any).select("*").eq("user_id", user.id),
    (supabase.from("products") as any).select("*").eq("owner_id", user.id),
    (supabase.from("tasks") as any).select("*").eq("user_id", user.id),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    profile: profileRes.data || null,
    clients: clientsRes.data || [],
    orders: ordersRes.data || [],
    products: productsRes.data || [],
    tasks: tasksRes.data || [],
  };

  if (format === "json") {
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=jestly-export.json",
      },
    });
  }

  // CSV: flatten each table into rows
  const sections: string[] = [];

  for (const [tableName, rows] of Object.entries(exportData)) {
    if (tableName === "exported_at" || !Array.isArray(rows) || rows.length === 0) continue;

    const allKeys = [...new Set(rows.flatMap(r => Object.keys(r)))];
    const header = allKeys.map(k => `"${k}"`).join(",");
    const dataRows = rows.map(row =>
      allKeys.map(k => {
        const val = row[k];
        if (val === null || val === undefined) return "";
        if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    );
    sections.push(`# ${tableName}\n${header}\n${dataRows.join("\n")}`);
  }

  const csv = sections.join("\n\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=jestly-export.csv",
    },
  });
}
