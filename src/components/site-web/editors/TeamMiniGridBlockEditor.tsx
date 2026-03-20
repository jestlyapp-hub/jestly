"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function TeamMiniGridBlockEditor({ block }: { block: Extract<Block, { type: "team-mini-grid" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const updateMember = (index: number, field: string, value: string) => {
    const members = [...block.content.members];
    members[index] = { ...members[index], [field]: value };
    update({ members });
  };

  const addMember = () => {
    update({ members: [...block.content.members, { name: "Nouveau membre", role: "Rôle", bio: "", imageUrl: "" }] });
  };

  const removeMember = (index: number) => {
    const members = block.content.members.filter((_, i) => i !== index);
    update({ members });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
        <input type="text" value={block.content.subtitle ?? ""} onChange={(e) => update({ subtitle: e.target.value })} className={inputClass} />
      </div>
      {block.content.members.map((m, i) => (
        <div key={i} className="p-2 rounded-lg border border-[#E6E6E4] space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold text-[#999] uppercase">Membre {i + 1}</div>
            <button onClick={() => removeMember(i)} className="text-[11px] text-red-400 hover:text-red-600">Supprimer</button>
          </div>
          <input type="text" value={m.name} onChange={(e) => updateMember(i, "name", e.target.value)} placeholder="Nom" className={inputClass} />
          <input type="text" value={m.role} onChange={(e) => updateMember(i, "role", e.target.value)} placeholder="Rôle" className={inputClass} />
          <textarea value={m.bio} onChange={(e) => updateMember(i, "bio", e.target.value)} rows={2} placeholder="Bio" className={inputClass} />
          <ImageUploader value={m.imageUrl ?? ""} onChange={(url) => updateMember(i, "imageUrl", url)} label="Image" />
        </div>
      ))}
      <button onClick={addMember} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter un membre</button>
    </div>
  );
}
