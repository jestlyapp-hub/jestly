import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy /landing → / (permanent redirect pour SEO)
      { source: "/landing", destination: "/", permanent: true },
    ];
  },
  async rewrites() {
    return [
      // ── Hubs marketing ──
      { source: "/fonctionnalites", destination: "/landing/fonctionnalites" },
      { source: "/pour-qui", destination: "/landing/pour-qui" },
      { source: "/ressources", destination: "/landing/ressources" },
      { source: "/faq", destination: "/landing/faq" },
      { source: "/a-propos", destination: "/landing/a-propos" },
      { source: "/roadmap", destination: "/landing/roadmap" },
      { source: "/blog", destination: "/landing/blog" },
      { source: "/blog/:slug", destination: "/landing/blog/:slug" },
      { source: "/centre-aide", destination: "/landing/centre-aide" },
      { source: "/centre-aide/categorie/:slug", destination: "/landing/centre-aide/categorie/:slug" },
      { source: "/centre-aide/article/:slug", destination: "/landing/centre-aide/article/:slug" },
      { source: "/centre-aide/guide/:slug", destination: "/landing/centre-aide/guide/:slug" },
      { source: "/demo", destination: "/landing/demo" },
      { source: "/integrations", destination: "/landing/integrations" },
      { source: "/cookies", destination: "/landing/cookies" },
      { source: "/comparatifs", destination: "/landing/comparatifs" },
      { source: "/contact", destination: "/landing/contact" },
      { source: "/templates", destination: "/landing/templates" },
      // ── Sous-pages fonctionnalités ──
      { source: "/fonctionnalites/site-vitrine", destination: "/landing/site-web" },
      { source: "/fonctionnalites/crm", destination: "/landing/crm" },
      { source: "/fonctionnalites/calendrier", destination: "/landing/agenda" },
      { source: "/fonctionnalites/facturation", destination: "/landing/facturation" },
      { source: "/fonctionnalites/commandes", destination: "/landing/commandes" },
      { source: "/fonctionnalites/analytics", destination: "/landing/analytics" },
      { source: "/fonctionnalites/portfolio", destination: "/landing/portfolio" },
      { source: "/fonctionnalites/paiements", destination: "/landing/paiements" },
      { source: "/fonctionnalites/briefs", destination: "/landing/briefs" },
      // ── Sous-pages personas ──
      { source: "/pour-qui/createurs", destination: "/landing/pour-qui/createurs" },
      { source: "/pour-qui/developpeurs", destination: "/landing/pour-qui/developpeurs" },
      { source: "/pour-qui/designers", destination: "/landing/pour-qui/designers" },
      { source: "/pour-qui/agences", destination: "/landing/pour-qui/agences" },
      { source: "/pour-qui/consultants", destination: "/landing/pour-qui/consultants" },
      // ── Comparatifs ──
      { source: "/comparatifs/jestly-vs-notion", destination: "/landing/comparatifs/jestly-vs-notion" },
      { source: "/comparatifs/jestly-vs-trello", destination: "/landing/comparatifs/jestly-vs-trello" },
      { source: "/comparatifs/jestly-vs-clickup", destination: "/landing/comparatifs/jestly-vs-clickup" },
      { source: "/comparatifs/jestly-vs-google-sheets", destination: "/landing/comparatifs/jestly-vs-google-sheets" },
      { source: "/comparatifs/jestly-vs-google-agenda", destination: "/landing/comparatifs/jestly-vs-google-agenda" },
      { source: "/comparatifs/jestly-vs-hubspot", destination: "/landing/comparatifs/jestly-vs-hubspot" },
      // ── Légal ──
      { source: "/mentions-legales", destination: "/legal/mentions-legales" },
      { source: "/confidentialite", destination: "/legal/confidentialite" },
      { source: "/cgu", destination: "/legal/cgu" },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https: data: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.sentry.io wss://*.supabase.co",
              "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      {
        // No caching on API routes and protected pages
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/dashboard/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
