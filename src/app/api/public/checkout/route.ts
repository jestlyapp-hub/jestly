import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeLabel, findExistingOption, fileToResourceItem, urlToResourceItem } from "@/lib/brief-column-compat";
import type { ResourceItem } from "@/types";

/**
 * Convert a brief field value (file uploads, links, mixed) to ResourceItem[].
 */
function briefValueToResources(val: unknown): ResourceItem[] {
  const items: ResourceItem[] = [];
  const processOne = (v: unknown) => {
    if (!v) return;
    if (typeof v === "string") {
      // It's a URL string
      if (v.startsWith("http")) items.push(urlToResourceItem(v));
    } else if (typeof v === "object" && v !== null && "url" in v) {
      const obj = v as { url: string; name?: string; type?: string };
      if (obj.type === "transfer_link") {
        items.push(urlToResourceItem(obj.url, obj.name));
      } else {
        items.push(fileToResourceItem(obj));
      }
    }
  };

  if (Array.isArray(val)) {
    for (const v of val) processOne(v);
  } else {
    processOne(val);
  }
  return items;
}

// POST /api/public/checkout — public checkout via RPC
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    site_id, product_id, name, email, phone, message, form_data,
    brief_answers, template_id, template_version, template_name,
    brief_fields, brief_pinned,
  } = body;

  if (!site_id || !product_id || !name || !email) {
    return NextResponse.json(
      { error: "site_id, product_id, name and email are required" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("fn_public_checkout", {
    p_site_id: site_id,
    p_product_id: product_id,
    p_name: name,
    p_email: email,
    p_phone: phone || null,
    p_message: message || null,
    p_form_data: form_data || {},
  });

  if (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Store brief responses if provided
  if (brief_answers && template_id && data?.order_id) {
    // Compute pinned keys from fields snapshot
    const pinnedKeys: string[] = brief_pinned || [];

    // Build field_sources map and dispatch mapped fields
    const fieldSources: Record<string, { target_kind: string; target_ref: string }> = {};
    const orderUpdates: Record<string, unknown> = {};
    const customFieldMerge: Record<string, unknown> = {};

    if (Array.isArray(brief_fields)) {
      for (const f of brief_fields) {
        if (f.target_kind && f.target_kind !== "custom_answer" && f.target_ref) {
          fieldSources[f.key] = { target_kind: f.target_kind, target_ref: f.target_ref };
          const val = brief_answers?.[f.key];
          if (val !== undefined && val !== null && val !== "") {
            if (f.target_kind === "order_field") {
              // Special handling for "resources" destination
              if (f.target_ref === "resources") {
                const resources = briefValueToResources(val);
                if (resources.length > 0) {
                  // Accumulate resources (multiple brief fields could target resources)
                  if (!orderUpdates.resources) orderUpdates.resources = [];
                  (orderUpdates.resources as unknown[]).push(...resources);
                }
              } else {
                orderUpdates[f.target_ref] = val;
              }
            } else if (f.target_kind === "order_custom_property") {
              customFieldMerge[f.target_ref] = val;
            }
          }
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("order_brief_responses").insert({
      order_id: data.order_id,
      template_id,
      template_version: template_version || 1,
      answers: brief_answers,
      brief_name: template_name || null,
      pinned: pinnedKeys,
      fields_snapshot: brief_fields || null,
      field_sources: Object.keys(fieldSources).length > 0 ? fieldSources : {},
    });

    // Dispatch mapped fields to order
    if (Object.keys(orderUpdates).length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("orders")
        .update(orderUpdates)
        .eq("id", data.order_id);
    }

    if (Object.keys(customFieldMerge).length > 0) {
      // Resolve select/multi_select columns: auto-create missing options, store labels
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: ownerFields } = await (supabase as any)
        .from("orders")
        .select("user_id")
        .eq("id", data.order_id)
        .single();
      const ownerId = ownerFields?.user_id;

      if (ownerId) {
        // Load all custom columns for this user to check field types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: allFields } = await (supabase as any)
          .from("order_fields")
          .select("id, key, field_type, options")
          .eq("user_id", ownerId);

        const fieldsByKey = new Map<string, { id: string; field_type: string; options: { label: string; color: string }[] }>();
        for (const f of allFields || []) {
          fieldsByKey.set(f.key, f);
        }

        const NOTION_COLORS = ["violet", "blue", "cyan", "emerald", "amber", "orange", "rose", "pink", "indigo", "teal"];

        for (const [key, rawVal] of Object.entries(customFieldMerge)) {
          const colDef = fieldsByKey.get(key);
          if (!colDef) continue;

          if (colDef.field_type === "select") {
            // Single select: resolve one label
            const label = String(rawVal);
            const existing = findExistingOption(label, colDef.options || []);
            if (existing) {
              customFieldMerge[key] = existing;
            } else {
              // Create the option
              const newOpt = { label: label.trim(), color: NOTION_COLORS[(colDef.options?.length || 0) % NOTION_COLORS.length] };
              const updatedOptions = [...(colDef.options || []), newOpt];
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase as any)
                .from("order_fields")
                .update({ options: updatedOptions })
                .eq("id", colDef.id);
              customFieldMerge[key] = newOpt.label;
              colDef.options = updatedOptions;
            }
          } else if (colDef.field_type === "multi_select") {
            // Multi select: resolve array of labels
            const labels: string[] = Array.isArray(rawVal) ? rawVal.map(String) : [String(rawVal)];
            const resolvedLabels: string[] = [];
            let optionsChanged = false;

            for (const label of labels) {
              if (!label.trim()) continue;
              const existing = findExistingOption(label, colDef.options || []);
              if (existing) {
                resolvedLabels.push(existing);
              } else {
                // Dedup check with already-added options in this loop
                const alreadyAdded = findExistingOption(label, colDef.options || []);
                if (alreadyAdded) {
                  resolvedLabels.push(alreadyAdded);
                } else {
                  const newOpt = { label: label.trim(), color: NOTION_COLORS[(colDef.options?.length || 0) % NOTION_COLORS.length] };
                  colDef.options = [...(colDef.options || []), newOpt];
                  resolvedLabels.push(newOpt.label);
                  optionsChanged = true;
                }
              }
            }

            if (optionsChanged) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase as any)
                .from("order_fields")
                .update({ options: colDef.options })
                .eq("id", colDef.id);
            }
            customFieldMerge[key] = resolvedLabels;
          } else if (colDef.field_type === "boolean") {
            // Ensure boolean coercion
            customFieldMerge[key] = !!rawVal;
          } else if (colDef.field_type === "number" || colDef.field_type === "money") {
            customFieldMerge[key] = Number(rawVal) || 0;
          }
          // text, date, url: keep raw value as-is
        }
      }

      // Read-merge-write custom_fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: orderRow } = await (supabase as any)
        .from("orders")
        .select("custom_fields")
        .eq("id", data.order_id)
        .single();
      const merged = { ...(orderRow?.custom_fields || {}), ...customFieldMerge };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("orders")
        .update({ custom_fields: merged })
        .eq("id", data.order_id);
    }

    // Store file references from brief answers (supports single or multi-file)
    if (typeof brief_answers === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileEntries: any[] = [];
      const addFileEntry = (fieldKey: string, fileVal: { url: string; name?: string; size?: number; type?: string }) => {
        fileEntries.push({
          order_id: data.order_id,
          field_id: fieldKey,
          field_key: fieldKey,
          file_url: fileVal.url,
          file_name: fileVal.name,
          file_size: fileVal.size,
          mime_type: fileVal.type,
        });
      };
      for (const [fieldKey, value] of Object.entries(brief_answers)) {
        if (Array.isArray(value)) {
          // Multi-file: array of {url, name, ...} or mixed items
          for (const item of value) {
            if (item && typeof item === "object" && "url" in item) {
              addFileEntry(fieldKey, item as { url: string; name?: string; size?: number; type?: string });
            }
          }
        } else if (value && typeof value === "object" && "url" in (value as Record<string, unknown>)) {
          addFileEntry(fieldKey, value as { url: string; name?: string; size?: number; type?: string });
        }
      }
      if (fileEntries.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("order_files").insert(fileEntries);
      }
    }
  }

  // Also create a lead record for CRM tracking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("leads") as any).insert({
    site_id,
    email,
    name: name || null,
    phone: phone || null,
    source: "checkout",
    status: "new",
    message: message || null,
    fields: form_data || {},
    product_name: body.product_name || null,
    amount: data?.amount ?? null,
  }).then(() => {/* fire & forget */}).catch(() => {/* non-blocking */});

  return NextResponse.json(data, { status: 201 });
}
