"use client";

import { motion } from "framer-motion";
import SiteWebNav from "@/components/site-web/SiteWebNav";

export default function SiteWebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <motion.h1
        className="text-2xl font-bold text-[#1A1A1A] mb-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Site web
      </motion.h1>
      <SiteWebNav />
      {children}
    </div>
  );
}
