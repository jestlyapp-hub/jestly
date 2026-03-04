"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import SiteWebNav from "@/components/site-web/SiteWebNav";
import { SiteProvider } from "@/lib/contexts/site-context";

// UUID v4 pattern (with or without dashes)
const UUID_RE = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

export default function SiteIdLayout({ children }: { children: React.ReactNode }) {
  const { siteId } = useParams<{ siteId: string }>();
  const router = useRouter();

  // Guard: if siteId is not a UUID (e.g. "domaine", "createur"), redirect to /site-web
  const isValid = UUID_RE.test(siteId);

  useEffect(() => {
    if (!isValid) {
      router.replace("/site-web");
    }
  }, [isValid, router]);

  if (!isValid) {
    return null;
  }

  return (
    <>
      <SiteWebNav />
      <SiteProvider siteId={siteId}>
        {children}
      </SiteProvider>
    </>
  );
}
