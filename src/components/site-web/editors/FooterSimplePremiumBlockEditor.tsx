"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

interface FooterLink {
  label: string;
  url?: string;
}

export default function FooterSimplePremiumBlockEditor({ block }: { block: Extract<Block, { type: "footer-simple-premium" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const c = block.content as {
    siteName?: string;
    links?: FooterLink[];
    copyright?: string;
    showSocials?: boolean;
    socials?: Record<string, string>;
  };

  const links: FooterLink[] = c.links ?? [];
  const socials: Record<string, string> = c.socials ?? {};

  /* Link helpers */
  const updateLink = (index: number, patch: Partial<FooterLink>) => {
    const next = links.map((lk, i) => (i === index ? { ...lk, ...patch } : lk));
    update({ links: next });
  };

  const addLink = () => {
    update({ links: [...links, { label: "", url: "" }] });
  };

  const removeLink = (index: number) => {
    update({ links: links.filter((_, i) => i !== index) });
  };

  /* Social helper */
  const updateSocial = (key: string, value: string) => {
    update({ socials: { ...socials, [key]: value } });
  };

  const socialFields = [
    { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/..." },
    { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
    { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
    { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@..." },
  ];

  return (
    <div className="space-y-4">
      {/* Site Name */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Nom du site</label>
        <input
          type="text"
          value={c.siteName ?? ""}
          onChange={(e) => update({ siteName: e.target.value })}
          placeholder="Mon site"
          className={inputClass}
        />
      </div>

      {/* Copyright */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Copyright</label>
        <input
          type="text"
          value={c.copyright ?? ""}
          onChange={(e) => update({ copyright: e.target.value })}
          placeholder="© 2026 Mon site. Tous droits réservés."
          className={inputClass}
        />
      </div>

      {/* Show Socials */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={c.showSocials ?? false}
          onChange={(e) => update({ showSocials: e.target.checked })}
          className="w-3.5 h-3.5 rounded border-[#E6E6E4] text-[#4F46E5] focus:ring-[#4F46E5]/20"
        />
        <span className="text-[12px] font-medium text-[#5A5A58]">Afficher les réseaux sociaux</span>
      </label>

      {/* Social URLs */}
      {c.showSocials && (
        <div className="space-y-2 pl-2 border-l-2 border-[#E6E6E4]">
          {socialFields.map((sf) => (
            <div key={sf.key}>
              <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">{sf.label}</label>
              <input
                type="text"
                value={socials[sf.key] ?? ""}
                onChange={(e) => updateSocial(sf.key, e.target.value)}
                placeholder={sf.placeholder}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      )}

      {/* Links */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-2">Liens</label>

        <div className="space-y-2">
          {links.map((lk, index) => (
            <div key={index} className="bg-white border border-[#E6E6E4] rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-[#BBB]">Lien {index + 1}</span>
                <button
                  onClick={() => removeLink(index)}
                  className="text-[10px] font-medium text-red-400 hover:text-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
              <input
                type="text"
                value={lk.label}
                onChange={(e) => updateLink(index, { label: e.target.value })}
                placeholder="Label"
                className={inputClass}
              />
              <input
                type="text"
                value={lk.url ?? ""}
                onChange={(e) => updateLink(index, { url: e.target.value })}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <button
          onClick={addLink}
          className="mt-2 w-full py-1.5 rounded-lg border border-dashed border-[#E6E6E4] text-[11px] font-medium text-[#999] hover:border-[#4F46E5]/30 hover:text-[#4F46E5] transition-colors"
        >
          + Ajouter un lien
        </button>
      </div>
    </div>
  );
}
