import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes: redirect to /login if not authenticated
  const protectedPrefixes = ["/dashboard", "/admin", "/clients", "/commandes", "/produits", "/facturation", "/abonnements", "/analytics", "/parametres", "/site-web", "/taches", "/briefs", "/calendrier", "/onboarding"];
  const isProtectedRoute = protectedPrefixes.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Allow reset-password and forgot-password even if authenticated
  // (user clicked recovery link while logged in, or recovery session is active)
  const authBypassRoutes = ["/reset-password", "/forgot-password"];
  const isAuthBypass = authBypassRoutes.some((r) => request.nextUrl.pathname.startsWith(r));

  // Redirect authenticated users away from /login (but NOT from reset/forgot)
  if (user && request.nextUrl.pathname === "/login" && !isAuthBypass) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
