// ── Module admin unifié ──────────────────────────────────────────────
// Re-exports pour compatibilité ascendante : import { x } from "@/lib/admin"

export {
  ADMIN_EMAIL,
  ADMIN_USER_ID,
  isAdmin,
  adminUserIdConfigured,
  requireAdmin,
  logAdminAction,
} from "./auth";

export {
  escapeIlike,
  validateUuid,
  validateSort,
  validatePagination,
  sanitizeSearchTerm,
} from "./validation";

export { ADMIN_ACTIONS, VALID_FLAG_TYPES } from "./constants";
export type { AdminAction, FlagType } from "./constants";

export { checkAdminRateLimit } from "./rate-limit";
