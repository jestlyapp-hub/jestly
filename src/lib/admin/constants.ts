// ── Actions admin auditées ──────────────────────────────────────────
export const ADMIN_ACTIONS = {
  ACCESS_GRANTED: "access_granted",
  ACCESS_DENIED: "access_denied",
  VIEW_ACCOUNT: "view_account",
  ADD_NOTE: "add_note",
  TOGGLE_PIN_NOTE: "toggle_pin_note",
  ADD_FLAG: "add_flag",
  REMOVE_FLAG: "remove_flag",
  EXPORT_DATA: "export_data",
  SEND_EMAIL: "send_email",
  UPDATE_WAITLIST: "update_waitlist",
  DELETE_WAITLIST: "delete_waitlist",
  RATE_LIMIT_HIT: "rate_limit_hit",
} as const;

export type AdminAction = (typeof ADMIN_ACTIONS)[keyof typeof ADMIN_ACTIONS];

// ── Types de flags valides pour les comptes ─────────────────────────
export const VALID_FLAG_TYPES = [
  "watch",
  "support_issue",
  "churn_risk",
  "high_value",
  "blocked",
  "vip",
] as const;

export type FlagType = (typeof VALID_FLAG_TYPES)[number];
