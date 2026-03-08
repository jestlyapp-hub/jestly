import type { User } from "@supabase/supabase-js";

const ADMIN_EMAIL = "jestlyapp@gmail.com";

/**
 * Check if a user is the Jestly admin.
 * Single source of truth for admin authorization.
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user?.email) return false;
  return user.email.toLowerCase() === ADMIN_EMAIL;
}
