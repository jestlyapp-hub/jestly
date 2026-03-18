"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProduitsRedirect() {
  const router = useRouter();
  useEffect(() => {
    const siteId = localStorage.getItem("jestly_last_site_id");
    if (siteId) {
      router.replace(`/site-web/${siteId}/offres`);
    } else {
      router.replace("/site-web");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-[13px] text-[#8A8A88]">Redirection...</div>
    </div>
  );
}
