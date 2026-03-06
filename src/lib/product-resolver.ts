import { createClient } from "@/lib/supabase/server";
import { dbToProduct } from "@/lib/adapters";
import type { Product } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Fetch active products by their IDs (for public site rendering).
 */
export async function getPublicProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("services") as any)
      .select("*")
      .in("id", ids)
      .eq("is_active", true);

    if (error || !data) return [];
    return data.map((row: any) => dbToProduct(row));
  } catch {
    return [];
  }
}

/**
 * Fetch a single product by ID.
 */
export async function getPublicProductById(id: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("services") as any)
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) return null;
    return dbToProduct(data);
  } catch {
    return null;
  }
}

/**
 * Fetch a product by slug within a site owner's scope.
 */
export async function getPublicProductBySlug(slug: string, siteOwnerId: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("services") as any)
      .select("*")
      .eq("slug", slug)
      .eq("user_id", siteOwnerId)
      .eq("is_active", true)
      .single();

    if (error || !data) return null;
    return dbToProduct(data);
  } catch {
    return null;
  }
}

/**
 * Fetch all active products for a site owner.
 */
export async function getPublicProductsBySiteId(siteId: string): Promise<Product[]> {
  try {
    const supabase = await createClient();

    // Get site owner
    const { data: site } = await (supabase.from("sites") as any)
      .select("owner_id")
      .eq("id", siteId)
      .single();

    if (!site) return [];

    const { data, error } = await (supabase.from("services") as any)
      .select("*")
      .eq("user_id", site.owner_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((row: any) => dbToProduct(row));
  } catch {
    return [];
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */
