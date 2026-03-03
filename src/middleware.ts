import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || "jestly.site";
const RESERVED = new Set(["www", "app", "api", "admin", "dashboard"]);

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // ── 1. Detect subdomain ──
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isRootDomain =
    hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`;

  // Root domain or localhost → serve app normally (landing + dashboard)
  if (isRootDomain || isLocalhost) {
    // Refresh Supabase session for protected + auth routes
    const needsSession =
      url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/site-web") ||
      url.pathname.startsWith("/clients") ||
      url.pathname.startsWith("/commandes") ||
      url.pathname.startsWith("/produits") ||
      url.pathname.startsWith("/facturation") ||
      url.pathname.startsWith("/abonnements") ||
      url.pathname.startsWith("/analytics") ||
      url.pathname.startsWith("/parametres") ||
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

  // ── 2. Wildcard subdomain: {sub}.jestly.site ──
  const parts = hostname.split(".");
  const subdomain = parts[0];
  const rest = parts.slice(1).join(".");

  if (rest === ROOT_DOMAIN && subdomain && !RESERVED.has(subdomain)) {
    // Rewrite to /s/{subdomain}{path}
    const pathname = url.pathname === "/" ? "" : url.pathname;
    url.pathname = `/s/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ── 3. Custom domain support ──
  // If hostname doesn't match root or wildcard, it could be a custom domain
  // Look up in DB: sites WHERE custom_domain = hostname
  // For now, fall through — will be implemented in EPIC 2 with Supabase
  if (!hostname.endsWith(`.${ROOT_DOMAIN}`) && !isLocalhost) {
    // Future: query supabase for custom domain → rewrite to /s/{slug}
    // const site = await getCustomDomainSite(hostname);
    // if (site) { url.pathname = `/s/${site.slug}${url.pathname}`; return NextResponse.rewrite(url); }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
