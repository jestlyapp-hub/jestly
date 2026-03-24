import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Normalize V1 fields (id-based) → V2 (key-based) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFields(schema: any[]): any[] {
  if (!Array.isArray(schema)) return [];
  const V1_TYPE_MAP: Record<string, string> = {
    short_text: "text", long_text: "textarea", multi_select: "checkbox",
    boolean: "checkbox", address: "textarea", info: "text", divider: "text",
  };
  return schema.map((f) => {
    if (f.key) return f;
    const key = f.id || `field_${Math.random().toString(36).slice(2, 8)}`;
    const type = V1_TYPE_MAP[f.type] || f.type || "text";
    let options = f.options;
    if (Array.isArray(options) && options.length > 0 && typeof options[0] === "object" && options[0].label) {
      options = options.map((o: { label: string }) => o.label);
    }
    return { ...f, key, type, options, pinned: f.pinned ?? f.pinToOrder ?? false, id: undefined, pinToOrder: undefined };
  });
}

// GET /api/public/brief?product_id=xxx[&brief_template_id=yyy]
// Resolution: explicit brief_template_id > product default brief > none
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("product_id");
  const explicitTemplateId = req.nextUrl.searchParams.get("brief_template_id");

  if (!productId) {
    return NextResponse.json({ error: "product_id est requis" }, { status: 400 });
  }

  const supabase = await createClient();

  // If block specifies a direct brief_template_id, use that
  if (explicitTemplateId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: template, error } = await (supabase.from("brief_templates") as any)
      .select("id, name, version, schema")
      .eq("id", explicitTemplateId)
      .maybeSingle();

    if (error || !template) return NextResponse.json(null);

    return NextResponse.json({
      template_id: template.id,
      template_name: template.name,
      template_version: template.version,
      fields: normalizeFields(template.schema || []),
      is_required: true,
    });
  }

  // Otherwise find product's default brief via product_briefs M:N
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links, error } = await (supabase.from("product_briefs") as any)
    .select("is_default, brief_templates(id, name, version, schema)")
    .eq("product_id", productId)
    .order("is_default", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!links || links.length === 0) return NextResponse.json(null);

  // Pick the default, or first if no default
  const defaultLink = links.find((l: { is_default: boolean }) => l.is_default) || links[0];
  const template = defaultLink.brief_templates;
  if (!template) return NextResponse.json(null);

  return NextResponse.json({
    template_id: template.id,
    template_name: template.name,
    template_version: template.version,
    fields: normalizeFields(template.schema || []),
    is_required: true,
  });
}
