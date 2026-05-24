/**
 * GET /api/ecom/export?type=orders|products|customers&format=csv
 * Streame un CSV des données ecom de l'user.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const type = req.nextUrl.searchParams.get("type") ?? "orders";
  if (!["orders", "products", "customers"].includes(type)) {
    return NextResponse.json({ error: "type invalide" }, { status: 400 });
  }

  // Récupérer l'intégration active
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", user.id)
    .eq("provider", "shopify")
    .eq("status", "active")
    .maybeSingle();
  if (!integration) return NextResponse.json({ error: "Aucune intégration" }, { status: 404 });

  let csv = "";
  let filename = "";

  if (type === "orders") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from("shopify_orders") as any)
      .select("name, created_at, financial_status, fulfillment_status, email, total_price, currency, source_name, utm_source, utm_medium, utm_campaign")
      .eq("integration_id", integration.id)
      .order("created_at", { ascending: false })
      .limit(10000);
    csv = toCsv(["Commande", "Date", "Statut paiement", "Statut envoi", "Email", "Montant", "Devise", "Source", "UTM source", "UTM medium", "UTM campaign"], data ?? []);
    filename = `commandes-${todayIso()}.csv`;
  } else if (type === "products") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from("shopify_products") as any)
      .select("title, handle, status, vendor, product_type, total_inventory, price_min, price_max")
      .eq("integration_id", integration.id)
      .order("title")
      .limit(10000);
    csv = toCsv(["Titre", "Handle", "Statut", "Vendeur", "Type", "Stock", "Prix min", "Prix max"], data ?? []);
    filename = `produits-${todayIso()}.csv`;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from("shopify_customers") as any)
      .select("email, first_name, last_name, orders_count, total_spent, currency, accepts_marketing, created_at")
      .eq("integration_id", integration.id)
      .order("total_spent", { ascending: false })
      .limit(10000);
    csv = toCsv(["Email", "Prénom", "Nom", "Commandes", "Total dépensé", "Devise", "Marketing", "Inscrit le"], data ?? []);
    filename = `clients-${todayIso()}.csv`;
  }

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const escape = (v: unknown): string => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const head = headers.join(",");
  const body = rows.map((r) => Object.values(r).map(escape).join(",")).join("\n");
  return "﻿" + head + "\n" + body;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
