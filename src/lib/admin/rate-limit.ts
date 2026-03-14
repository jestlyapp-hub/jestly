// Rate limiter en mémoire pour les routes admin
// En production, remplacer par @upstash/ratelimit + Redis

import { NextResponse } from "next/server";

const windowMs = 60_000; // 1 minute
const adminRequests = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limit par user ID + endpoint.
 * Retourne null si OK, ou un NextResponse 429 si dépassé.
 */
export function checkAdminRateLimit(
  userId: string,
  endpoint: string,
  maxRequests: number = 30,
): NextResponse | null {
  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  const entry = adminRequests.get(key);

  if (!entry || now >= entry.resetAt) {
    adminRequests.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= maxRequests) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } },
    );
  }

  entry.count++;
  return null;
}

// Nettoyage périodique des entrées expirées (toutes les 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of adminRequests.entries()) {
    if (now >= entry.resetAt) adminRequests.delete(key);
  }
}, 5 * 60_000);
