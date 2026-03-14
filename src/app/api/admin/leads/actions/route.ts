import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  logAdminAction,
  validateUuid,
  checkAdminRateLimit,
  ADMIN_ACTIONS,
} from "@/lib/admin";

// POST — Bulk actions on leads
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  const rateLimitResponse = checkAdminRateLimit(user.id, "leads_actions", 10);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "leads_actions" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;
  const body = await req.json();
  const { action, lead_ids, value } = body;

  if (!action) {
    return NextResponse.json({ error: "action requis" }, { status: 400 });
  }

  // Validate lead_ids if provided
  if (lead_ids && Array.isArray(lead_ids)) {
    for (const lid of lead_ids) {
      if (!validateUuid(lid)) {
        return NextResponse.json({ error: `Invalid lead ID: ${lid}` }, { status: 400 });
      }
    }
  }

  let affected = 0;

  switch (action) {
    case "update_status": {
      if (!lead_ids || lead_ids.length === 0) {
        return NextResponse.json({ error: "lead_ids requis pour update_status" }, { status: 400 });
      }
      if (!value) {
        return NextResponse.json({ error: "value (status) requis" }, { status: 400 });
      }

      const { error, count } = await (supabase.from("leads") as any)
        .update({ status: value })
        .in("id", lead_ids);

      if (error) {
        console.error("[admin/leads/actions] update_status error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }

      affected = count || lead_ids.length;
      break;
    }

    case "add_tag": {
      if (!lead_ids || lead_ids.length === 0) {
        return NextResponse.json({ error: "lead_ids requis pour add_tag" }, { status: 400 });
      }
      if (!value) {
        return NextResponse.json({ error: "value (tag) requis" }, { status: 400 });
      }

      // Process each lead individually for array_append
      for (const lid of lead_ids) {
        const { error } = await (supabase.rpc as any)("array_append_lead_tag", {
          p_lead_id: lid,
          p_tag: value,
        });
        // Fallback: direct update if RPC doesn't exist
        if (error) {
          const { data: current } = await (supabase.from("leads") as any)
            .select("tags")
            .eq("id", lid)
            .single();
          const currentTags = current?.tags || [];
          if (!currentTags.includes(value)) {
            await (supabase.from("leads") as any)
              .update({ tags: [...currentTags, value] })
              .eq("id", lid);
          }
        }
        affected++;
      }
      break;
    }

    case "remove_tag": {
      if (!lead_ids || lead_ids.length === 0) {
        return NextResponse.json({ error: "lead_ids requis pour remove_tag" }, { status: 400 });
      }
      if (!value) {
        return NextResponse.json({ error: "value (tag) requis" }, { status: 400 });
      }

      for (const lid of lead_ids) {
        const { data: current } = await (supabase.from("leads") as any)
          .select("tags")
          .eq("id", lid)
          .single();
        const currentTags = current?.tags || [];
        const newTags = currentTags.filter((t: string) => t !== value);
        if (newTags.length !== currentTags.length) {
          await (supabase.from("leads") as any)
            .update({ tags: newTags })
            .eq("id", lid);
        }
        affected++;
      }
      break;
    }

    case "assign_owner": {
      if (!lead_ids || lead_ids.length === 0) {
        return NextResponse.json({ error: "lead_ids requis pour assign_owner" }, { status: 400 });
      }
      if (!value) {
        return NextResponse.json({ error: "value (owner) requis" }, { status: 400 });
      }

      const { error, count } = await (supabase.from("leads") as any)
        .update({ owner: value })
        .in("id", lead_ids);

      if (error) {
        console.error("[admin/leads/actions] assign_owner error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }

      affected = count || lead_ids.length;
      break;
    }

    case "compute_scores": {
      if (lead_ids && lead_ids.length > 0) {
        for (const lid of lead_ids) {
          await (supabase.rpc as any)("fn_compute_lead_score", { p_lead_id: lid });
          affected++;
        }
      } else {
        // Compute for all leads
        const { data: allLeads } = await (supabase.from("leads") as any)
          .select("id");
        if (allLeads) {
          for (const lead of allLeads) {
            await (supabase.rpc as any)("fn_compute_lead_score", { p_lead_id: lead.id });
            affected++;
          }
        }
      }
      break;
    }

    case "match_users": {
      const { error } = await (supabase.rpc as any)("fn_match_leads_to_users");
      if (error) {
        console.error("[admin/leads/actions] match_users error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
      }
      affected = -1; // Unknown count
      break;
    }

    default:
      return NextResponse.json({ error: `Action inconnue: ${action}` }, { status: 400 });
  }

  await logAdminAction(user.id, "bulk_lead_action", undefined, {
    action,
    lead_ids: lead_ids?.length || "all",
    value,
    affected,
  });

  return NextResponse.json({
    success: true,
    action,
    affected,
  });
}
