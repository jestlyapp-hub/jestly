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
      url.pathname.startsWith("/reset-password") ||
      url.pathname.startsWith("/forgot-password") ||
      url.pathname === "/login";

    if (needsSession) {
      try {
        return await updateSession(req);
      } catch (err) {
        console.error("[middleware] updateSession failed:", err instanceof Error ? err.message : err);
        // API routes : 401 explicite au lieu de laisser passer sans auth
        if (url.pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Session invalide" }, { status: 401 });
        }
        // Pages protégées : redirect login plutôt que laisser passer sans session
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
      }
    }
    return NextResponse.next();
  }

  // ── 2. Wildcard subdomain: {sub}.jestly.fr (or legacy {sub}.jestly.site) ──
  const parts = hostname.split(".");
  const subdomain = parts[0];
  const rest = parts.slice(1).join(".");

  const matchedRoot = ROOT_DOMAINS.find((d) => rest === d);
  if (matchedRoot && subdomain && !RESERVED.has(subdomain)) {
    // Strip redundant /s/{subdomain} prefix → redirect to clean URL
    const sPrefix = `/s/${subdomain}`;
    if (url.pathname.startsWith(sPrefix)) {
      const clean = url.pathname.slice(sPrefix.length) || "/";
      url.pathname = clean;
      return NextResponse.redirect(url, 301);
    }

    // Rewrite to /s/{subdomain}{path} (internal, invisible to user)
    const pathname = url.pathname === "/" ? "" : url.pathname;
    url.pathname = `/s/${subdomain}${pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-subdomain-mode", "1");
    return response;
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
