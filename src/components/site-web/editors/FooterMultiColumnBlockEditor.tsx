"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

interface FooterLink {
  label: string;
  url?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export default function FooterMultiColumnBlockEditor({ block }: { block: Extract<Block, { type: "footer-multi-column" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const c = block.content as {
    siteName?: string;
    description?: string;
    columns?: FooterColumn[];
    copyright?: string;
    contact?: { email?: string; phone?: string; address?: string };
    showSocials?: boolean;
    socials?: Record<string, string>;
  };

  const columns: FooterColumn[] = c.columns ?? [];
  const socials: Record<string, string> = c.socials ?? {};
  const contact = c.contact ?? {};

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

  /* Contact helper */
  const updateContact = (key: string, value: string) => {
    update({ contact: { ...contact, [key]: value } });
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

      {/* Description */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Description</label>
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
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Copyright</label>
        <input
          type="text"
          value={c.copyright ?? ""}
          onChange={(e) => update({ copyright: e.target.value })}
          placeholder="© 2026 Mon site. Tous droits réservés."
          className={inputClass}
        />
      </div>

      {/* Contact */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-2">Contact</label>
        <div className="space-y-2 pl-2 border-l-2 border-[#E6E6E4]">
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Email</label>
            <input
              type="text"
              value={contact.email ?? ""}
              onChange={(e) => updateContact("email", e.target.value)}
              placeholder="contact@monsite.fr"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Téléphone</label>
            <input
              type="text"
              value={contact.phone ?? ""}
              onChange={(e) => updateContact("phone", e.target.value)}
              placeholder="+33 1 23 45 67 89"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Adresse</label>
            <input
              type="text"
              value={contact.address ?? ""}
              onChange={(e) => updateContact("address", e.target.value)}
              placeholder="123 Rue Exemple, 75001 Paris"
              className={inputClass}
            />
          </div>
        </div>
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

      {/* Columns */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-2">Colonnes de liens</label>

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
