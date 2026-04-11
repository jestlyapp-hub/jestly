import type { SupabaseClient } from "@supabase/supabase-js";
import type { TimelineEventType } from "@/types/timeline";
import { logger } from "@/lib/logger";

interface InsertTimelineEventParams {
  supabase: SupabaseClient;
  user_id: string;
  event_type: TimelineEventType;
  entity_type: string;
  entity_id: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  icon?: string;
  color?: string;
  is_important?: boolean;
}

/**
 * Insère un événement dans la timeline depuis le code applicatif.
 * Fire-and-forget — ne bloque pas le flow appelant.
 */
export async function insertTimelineEvent({
  supabase,
  user_id,
  event_type,
  entity_type,
  entity_id,
  title,
  description,
  metadata = {},
  icon,
  color,
  is_important = false,
}: InsertTimelineEventParams): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("timeline_events") as any).insert({
      user_id,
      event_type,
      entity_type,
      entity_id,
      title,
      description: description || null,
      metadata,
      icon: icon || null,
      color: color || null,
      is_important,
      created_by: user_id,
    });
  } catch (err) {
    // Fire-and-forget : on log mais on ne throw pas
    logger.warn("timeline_insert_failed", {
      userId: user_id,
      action: "insert_timeline_event",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
