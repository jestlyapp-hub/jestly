import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// POST /api/orders/bulk — bulk operations: delete, duplicate, move
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {
    const body = await req.json();
    const { action, ids, status } = body as {
      action: "delete" | "duplicate" | "move";
      ids: string[];
      status?: string;
    };

    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "action and ids[] required" }, { status: 400 });
    }

    switch (action) {
      case "delete": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("orders") as any)
          .delete()
          .in("id", ids)
          .eq("user_id", user.id);
        if (error) {
          console.error("[BULK delete]", error.code, error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ deleted: ids.length });
      }

      case "duplicate": {
        // 1. Fetch originals (only the fields we need)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: originals, error: fetchErr } = await (supabase.from("orders") as any)
          .select("*")
          .in("id", ids)
          .eq("user_id", user.id);
        if (fetchErr) {
          console.error("[BULK duplicate] fetch:", fetchErr.code, fetchErr.message);
          return NextResponse.json({ error: fetchErr.message }, { status: 500 });
        }
        if (!originals || originals.length === 0) {
          return NextResponse.json({ error: "No orders found" }, { status: 404 });
        }

        // 2. Build clean copies — whitelist fields, handle nulls, reset state
        //    Only include optional columns (checklist/tags/custom_fields) if they
        //    exist on the source row (migration may not have been applied yet).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const copies = originals.map((o: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const copy: Record<string, any> = {
            user_id: user.id,
            client_id: o.client_id,
            product_id: o.product_id || null,
            title: `${o.title || "Sans titre"} (copie)`,
            description: o.description || "",
            amount: o.amount ?? 0,
            status: "new",
            priority: o.priority || "normal",
            deadline: o.deadline || null,
            notes: o.notes || null,
            paid: false,
          };
          // Only include if column exists on source (i.e. migration was applied)
          if ("checklist" in o) copy.checklist = o.checklist ?? [];
          if ("tags" in o) copy.tags = o.tags ?? [];
          if ("custom_fields" in o) copy.custom_fields = o.custom_fields ?? {};
          if ("briefing" in o) copy.briefing = o.briefing ?? null;
          if ("resources" in o) copy.resources = o.resources ?? [];
          if ("category" in o) copy.category = o.category ?? null;
          if ("external_ref" in o) copy.external_ref = o.external_ref ?? null;
          return copy;
        });

        // 3. Insert — same select as GET /api/orders list
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: created, error: insertErr } = await (supabase.from("orders") as any)
          .insert(copies)
          .select("*, clients(name, email, phone), products(name)");
        if (insertErr) {
          console.error("[BULK duplicate] insert:", insertErr.code, insertErr.message, insertErr.details);
          return NextResponse.json({ error: insertErr.message }, { status: 500 });
        }
        return NextResponse.json({ duplicated: created?.length ?? 0, orders: created });
      }

      case "move": {
        if (!status) {
          return NextResponse.json({ error: "status required for move action" }, { status: 400 });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("orders") as any)
          .update({ status })
          .in("id", ids)
          .eq("user_id", user.id);
        if (error) {
          console.error("[BULK move]", error.code, error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ moved: ids.length, status });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[BULK] fatal:", msg);
    return NextResponse.json({ error: `Server: ${msg}` }, { status: 500 });
  }
}
