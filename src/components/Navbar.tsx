"use client";

import { motion } from "framer-motion";
import Button from "./ui/Button";

const links = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Tarifs", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#EFEFEF]"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="text-[22px] font-bold tracking-tight text-[#191919]"
        >
          Jestly
        </a>

        {/* Nav links — centre */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#5A5A58] hover:text-[#191919] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions — droite */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="hidden sm:inline text-sm text-[#5A5A58] hover:text-[#191919] transition-colors font-medium"
          >
            Se connecter
          </a>
          <Button className="!py-2.5 !px-5 !text-[13px]">Commencer</Button>
        </div>
      </div>
    </motion.nav>
  );
}
