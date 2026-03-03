import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

function generateKey(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    + "_" + Date.now().toString(36);
}

// POST /api/orders/board/fields — create a custom field
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { label, field_type, options, is_required, is_visible_on_card } = body;

  if (!label) return NextResponse.json({ error: "label is required" }, { status: 400 });

  // Block reserved labels (base column names)
  const BASE_LABELS = new Set(["Titre", "Client", "Prix", "Statut", "Deadline", "Date"]);
  if (BASE_LABELS.has(label.trim())) {
    return NextResponse.json({ error: "Ce nom est reserve (colonne de base)" }, { status: 400 });
  }

  // Get max position
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from("order_fields") as any)
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1);

  const maxPos = existing?.[0]?.position ?? -1;

  // Don't include is_system/config — they have DB defaults if migration 012 applied,
  // and won't cause errors if the columns don't exist yet.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("order_fields") as any)
    .insert({
      user_id: user.id,
      key: generateKey(label),
      label,
      field_type: field_type || "text",
      options: options || [],
      is_required: is_required ?? false,
      is_visible_on_card: is_visible_on_card ?? false,
      position: maxPos + 1,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
