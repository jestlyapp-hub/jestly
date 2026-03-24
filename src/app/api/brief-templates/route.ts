import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

/** Normalize V1 fields (id-based) → V2 (key-based) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFields(schema: any[]): any[] {
  if (!Array.isArray(schema)) return [];
  const V1_TYPE_MAP: Record<string, string> = {
    short_text: "text",
    long_text: "textarea",
    multi_select: "checkbox",
    boolean: "checkbox",
    address: "textarea",
    info: "text",
    divider: "text",
  };
  return schema.map((f) => {
    // Already V2 (has key)
    if (f.key) return f;
    // V1 → V2 migration
    const key = f.id || `field_${Math.random().toString(36).slice(2, 8)}`;
    const type = V1_TYPE_MAP[f.type] || f.type || "text";
    // Normalize options from {value,label}[] to string[]
    let options = f.options;
    if (Array.isArray(options) && options.length > 0 && typeof options[0] === "object" && options[0].label) {
      options = options.map((o: { label: string }) => o.label);
    }
    return {
      ...f,
      key,
      type,
      options,
      pinned: f.pinned ?? f.pinToOrder ?? false,
      id: undefined,
      pinToOrder: undefined,
    };
  });
}

// GET /api/brief-templates — list user's brief templates
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("brief_templates") as any)
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message?.includes("schema cache")) {
      return NextResponse.json({ error: "Migration manquante: brief_templates" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Normalize V1 fields in each template
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalized = (data || []).map((t: any) => ({
    ...t,
    schema: normalizeFields(t.schema),
  }));

  return NextResponse.json(normalized);
}

// POST /api/brief-templates — create a new brief template
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { name, description, fields } = body;

  if (!name) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  // Validate fields schema
  const fieldsList = Array.isArray(fields) ? fields : [];
  for (const f of fieldsList) {
    if (!f.key || !f.label || !f.type) {
      return NextResponse.json({ error: "Chaque champ doit avoir key, label et type" }, { status: 400 });
    }
    if ((f.type === "select" || f.type === "radio") && (!f.options || f.options.length === 0)) {
      return NextResponse.json({ error: `Le champ "${f.key}" (${f.type}) nécessite des options` }, { status: 400 });
    }
  }

  // Check unique keys
  const keys = fieldsList.map((f: { key: string }) => f.key);
  if (new Set(keys).size !== keys.length) {
    return NextResponse.json({ error: "Clés de champs en doublon" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("brief_templates") as any)
    .insert({
      owner_id: user.id,
      name,
      description: description || null,
      schema: fieldsList,
      version: 1,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
