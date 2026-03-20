type LogLevel = "info" | "warn" | "error" | "debug";

type LogContext = {
  userId?: string;
  route?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  duration?: number;
  [key: string]: unknown;
};

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  // En production, JSON structuré pour Vercel logs
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

export const logger = {
  info: (msg: string, ctx?: LogContext) => log("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext) => log("error", msg, ctx),
  debug: (msg: string, ctx?: LogContext) => {
    if (process.env.NODE_ENV !== "production") log("debug", msg, ctx);
  },
};
