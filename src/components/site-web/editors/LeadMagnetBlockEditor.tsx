"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import LeadConfigEditor from "./shared/LeadConfigEditor";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function LeadMagnetBlockEditor({ block }: { block: Extract<Block, { type: "lead-magnet" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Description</label>
        <textarea value={block.content.description} onChange={(e) => update({ description: e.target.value })} rows={2} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">URL du fichier</label>
        <input type="text" value={block.content.fileUrl} onChange={(e) => update({ fileUrl: e.target.value })} placeholder="https://..." className={inputClass} />
        <p className="text-[10px] text-[#BBB] mt-0.5">PDF, ZIP, etc. Le lien sera envoyé par email.</p>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input type="text" value={block.content.buttonLabel} onChange={(e) => update({ buttonLabel: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Message de succès</label>
        <input type="text" value={block.content.successMessage} onChange={(e) => update({ successMessage: e.target.value })} className={inputClass} />
      </div>
      <LeadConfigEditor
        config={{
          saveAsLead: block.content.saveAsLead,
          successMessage: block.content.successMessage,
          notifyEmail: block.content.notifyEmail,
          leadSource: block.content.leadSource,
          leadTags: block.content.leadTags,
        }}
        onChange={(cfg) => update({ ...cfg })}
        showSource={false}
        showTags={true}
        defaultSource="lead-magnet"
      />
    </div>
  );
}
