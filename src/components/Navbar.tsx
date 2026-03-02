"use client";

import { motion } from "framer-motion";
import Button from "./ui/Button";

const links = [
  { label: "Fonctionnalites", href: "#features" },
  { label: "Tarifs", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a12]/60 backdrop-blur-2xl border-b border-white/[0.04]"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="text-[22px] font-extrabold tracking-tight text-white"
        >
          Jestly
        </a>

        {/* Nav links — centre */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions — droite */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="hidden sm:inline text-sm text-white/50 hover:text-white transition-colors font-medium"
          >
            Se connecter
          </a>
          <Button className="!py-2.5 !px-5 !text-[13px]">Commencer</Button>
        </div>
      </div>
    </motion.nav>
  );
}
