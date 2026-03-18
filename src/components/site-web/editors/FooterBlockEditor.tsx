"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

interface FooterLink {
  label: string;
  url?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterSocials {
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  github?: string;
}

export default function FooterBlockEditor({ block }: { block: Extract<Block, { type: "footer-block" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const c = block.content as {
    siteName?: string;
    description?: string;
    columns?: FooterColumn[];
    copyright?: string;
    showSocials?: boolean;
    socials?: FooterSocials;
  };

  const columns: FooterColumn[] = c.columns ?? [];
  const socials: FooterSocials = c.socials ?? {};

  /* Column helpers */
  const updateColumn = (index: number, patch: Partial<FooterColumn>) => {
    const next = columns.map((col, i) => (i === index ? { ...col, ...patch } : col));
    update({ columns: next });
  };

  const addColumn = () => {
    update({ columns: [...columns, { title: "", links: [] }] });
  };

  const removeColumn = (index: number) => {
    update({ columns: columns.filter((_, i) => i !== index) });
  };

  /* Link helpers */
  const updateLink = (colIndex: number, linkIndex: number, patch: Partial<FooterLink>) => {
    const next = columns.map((col, ci) => {
      if (ci !== colIndex) return col;
      return {
        ...col,
        links: col.links.map((lk, li) => (li === linkIndex ? { ...lk, ...patch } : lk)),
      };
    });
    update({ columns: next });
  };

  const addLink = (colIndex: number) => {
    const next = columns.map((col, ci) => {
      if (ci !== colIndex) return col;
      return { ...col, links: [...col.links, { label: "", url: "" }] };
    });
    update({ columns: next });
  };

  const removeLink = (colIndex: number, linkIndex: number) => {
    const next = columns.map((col, ci) => {
      if (ci !== colIndex) return col;
      return { ...col, links: col.links.filter((_, li) => li !== linkIndex) };
    });
    update({ columns: next });
  };

  /* Social helper */
  const updateSocial = (key: keyof FooterSocials, value: string) => {
    update({ socials: { ...socials, [key]: value } });
  };

  const socialFields: { key: keyof FooterSocials; label: string; placeholder: string }[] = [
    { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
    { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/..." },
    { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
    { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@..." },
    { key: "github", label: "GitHub", placeholder: "https://github.com/..." },
  ];

  return (
    <div className="space-y-4">
      {/* Site Name */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Nom du site</label>
        <input
          type="text"
          value={c.siteName ?? ""}
          onChange={(e) => update({ siteName: e.target.value })}
          placeholder="Mon site"
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Description</label>
        <textarea
          value={c.description ?? ""}
          onChange={(e) => update({ description: e.target.value })}
          rows={2}
          placeholder="Une courte description de votre activité..."
          className={inputClass}
        />
      </div>

      {/* Copyright */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Copyright</label>
        <input
          type="text"
          value={c.copyright ?? ""}
          onChange={(e) => update({ copyright: e.target.value })}
          placeholder="© 2026 Mon site. Tous droits reserves."
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
        <span className="text-[11px] text-[#999]">Afficher les reseaux sociaux</span>
      </label>

      {/* Social URLs */}
      {c.showSocials && (
        <div className="space-y-2 pl-2 border-l-2 border-[#E6E6E4]">
          {socialFields.map((sf) => (
            <div key={sf.key}>
              <label className="block text-[10px] text-[#BBB] mb-0.5">{sf.label}</label>
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

      {/* Columns */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-2">Colonnes de liens</label>

        <div className="space-y-3">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="bg-white border border-[#E6E6E4] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-[#BBB]">Colonne {colIndex + 1}</span>
                <button
                  onClick={() => removeColumn(colIndex)}
                  className="text-[10px] font-medium text-red-400 hover:text-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>

              {/* Column title */}
              <input
                type="text"
                value={col.title}
                onChange={(e) => updateColumn(colIndex, { title: e.target.value })}
                placeholder="Titre de la colonne"
                className={inputClass}
              />

              {/* Links inside column */}
              <div className="space-y-2 pl-2 border-l-2 border-[#EFEFEF]">
                {col.links.map((lk, lkIndex) => (
                  <div key={lkIndex} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-[#BBB]">Lien {lkIndex + 1}</span>
                      <button
                        onClick={() => removeLink(colIndex, lkIndex)}
                        className="text-[9px] font-medium text-red-400 hover:text-red-600 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                    <input
                      type="text"
                      value={lk.label}
                      onChange={(e) => updateLink(colIndex, lkIndex, { label: e.target.value })}
                      placeholder="Label"
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={lk.url ?? ""}
                      onChange={(e) => updateLink(colIndex, lkIndex, { url: e.target.value })}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                ))}

                <button
                  onClick={() => addLink(colIndex)}
                  className="w-full py-1 rounded-md border border-dashed border-[#EFEFEF] text-[10px] font-medium text-[#BBB] hover:border-[#4F46E5]/30 hover:text-[#4F46E5] transition-colors"
                >
                  + Ajouter un lien
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addColumn}
          className="mt-2 w-full py-1.5 rounded-lg border border-dashed border-[#E6E6E4] text-[11px] font-medium text-[#999] hover:border-[#4F46E5]/30 hover:text-[#4F46E5] transition-colors"
        >
          + Ajouter une colonne
        </button>
      </div>
    </div>
  );
}
