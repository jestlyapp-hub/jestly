const limiters = new Map<string, Map<string, { count: number; resetAt: number }>>();

export function rateLimit(name: string, maxRequests: number, windowMs: number = 60000) {
  if (!limiters.has(name)) limiters.set(name, new Map());
  const store = limiters.get(name)!;

  return (ip: string): boolean => {
    const now = Date.now();
    const entry = store.get(ip);
    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return true;
    }
    entry.count++;
    return entry.count <= maxRequests;
  };
}

export function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
