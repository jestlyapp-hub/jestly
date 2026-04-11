import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { apiError, handleApiError } from "@/lib/api-error";
import { logger } from "@/lib/logger";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

// GET /api/timeline — paginated timeline with cursor + filters
// ?types=ORDER_CREATED,INVOICE_PAID
// ?entity_type=order
// ?entity_id=uuid
// ?important=true
// ?q=search
// ?from=2024-01-01
// ?to=2024-12-31
// ?cursor=ISO-date__uuid
// ?limit=30
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const params = req.nextUrl.searchParams;
    const typesRaw = params.get("types");
    const entityType = params.get("entity_type");
    const entityId = params.get("entity_id");
    const important = params.get("important") === "true";
    const search = params.get("q")?.trim();
    const dateFrom = params.get("from");
    const dateTo = params.get("to");
    const cursor = params.get("cursor");
    const limitParam = Math.min(
      Math.max(parseInt(params.get("limit") || "", 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from("timeline_events") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(limitParam + 1); // +1 pour détecter has_more

    // Filtrage par types
    if (typesRaw) {
      const types = typesRaw.split(",").filter(Boolean);
      if (types.length > 0) {
        query = query.in("event_type", types);
      }
    }

    // Filtrage par entité
    if (entityType) {
      query = query.eq("entity_type", entityType);
    }
    if (entityId) {
      query = query.eq("entity_id", entityId);
    }

    // Événements importants uniquement
    if (important) {
      query = query.eq("is_important", true);
    }

    // Recherche texte
    if (search && search.length >= 2) {
      const pattern = `%${search}%`;
      query = query.or(
        `title.ilike.${pattern},description.ilike.${pattern}`
      );
    }

    // Filtre date
    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }

    // Cursor-based pagination (created_at__id)
    if (cursor) {
      const [cursorDate, cursorId] = cursor.split("__");
      if (cursorDate && cursorId) {
        // Événements plus anciens que le curseur
        query = query.or(
          `created_at.lt.${cursorDate},and(created_at.eq.${cursorDate},id.lt.${cursorId})`
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      return apiError(500, error.message, {
        route: "/api/timeline",
        userId: user.id,
      });
    }

    const events = data || [];
    const hasMore = events.length > limitParam;
    const sliced = hasMore ? events.slice(0, limitParam) : events;

    // Construire le next_cursor
    let nextCursor: string | null = null;
    if (hasMore && sliced.length > 0) {
      const last = sliced[sliced.length - 1];
      nextCursor = `${last.created_at}__${last.id}`;
    }

    return NextResponse.json({
      events: sliced,
      next_cursor: nextCursor,
      has_more: hasMore,
    });
  } catch (err) {
    return handleApiError(err, { route: "/api/timeline" });
  }
}

// POST /api/timeline — insertion manuelle d'un événement
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await req.json();
    const {
      event_type,
      entity_type,
      entity_id,
      title,
      description,
      metadata,
      icon,
      color,
      is_important,
    } = body;

    if (!event_type || !title) {
      return apiError(400, "event_type et title sont requis");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("timeline_events") as any)
      .insert({
        user_id: user.id,
        event_type,
        entity_type: entity_type || null,
        entity_id: entity_id || null,
        title,
        description: description || null,
        metadata: metadata || {},
        icon: icon || null,
        color: color || null,
        is_important: is_important || false,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return apiError(500, error.message, {
        route: "/api/timeline",
        userId: user.id,
        action: "create_event",
      });
    }

    logger.info("timeline_event_created", {
      userId: user.id,
      entity: "timeline_event",
      entityId: data.id,
      action: "create",
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return handleApiError(err, { route: "/api/timeline" });
  }
}
