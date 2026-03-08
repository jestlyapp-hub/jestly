import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "jestly.fr";
const ROOT_DOMAINS = [baseDomain, "jestly.site"]
  .map((d) => d.trim().toLowerCase());
const RESERVED = new Set(["www", "app", "api", "admin", "dashboard"]);

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // ── 1. Detect root domain ──
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isRootDomain = ROOT_DOMAINS.some(
    (d) => hostname === d || hostname === `www.${d}`
  );

  // Root domain or localhost → serve app normally (landing + dashboard)
  if (isRootDomain || isLocalhost) {
    // Refresh Supabase session for protected + auth routes
    const needsSession =
      url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/site-web") ||
      url.pathname.startsWith("/clients") ||
      url.pathname.startsWith("/commandes") ||
      url.pathname.startsWith("/produits") ||
      url.pathname.startsWith("/facturation") ||
      url.pathname.startsWith("/abonnements") ||
      url.pathname.startsWith("/analytics") ||
      url.pathname.startsWith("/parametres") ||
      url.pathname.startsWith("/taches") ||
      url.pathname.startsWith("/briefs") ||
      url.pathname.startsWith("/calendrier") ||
      url.pathname === "/login";

    if (needsSession) {
      try {
        return await updateSession(req);
      } catch {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // ── 2. Wildcard subdomain: {sub}.jestly.site or {sub}.jestly.fr ──
  const parts = hostname.split(".");
  const subdomain = parts[0];
  const rest = parts.slice(1).join(".");

  const matchedRoot = ROOT_DOMAINS.find((d) => rest === d);
  if (matchedRoot && subdomain && !RESERVED.has(subdomain)) {
    // Rewrite to /s/{subdomain}{path}
    const pathname = url.pathname === "/" ? "" : url.pathname;
    url.pathname = `/s/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ── 3. Custom domain support ──
  const isSubdomainOfRoot = ROOT_DOMAINS.some((d) => hostname.endsWith(`.${d}`));
  if (!isSubdomainOfRoot && !isLocalhost) {
    // Future: query supabase for custom domain → rewrite to /s/{slug}
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
