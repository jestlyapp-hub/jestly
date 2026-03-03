"use client";

import { useState } from "react";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { clientNoteFromRecord, clientEventFromRecord } from "@/lib/adapters";
import ClientEventTimeline from "./ClientEventTimeline";
import type { ClientNote, ClientEvent } from "@/types";

interface Props {
  clientId: string;
}

export default function ClientNotesTab({ clientId }: Props) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawNotes, mutate: refreshNotes } = useApi<any[]>(`/api/clients/${clientId}/notes`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawEvents, mutate: refreshEvents } = useApi<any[]>(`/api/clients/${clientId}/events?limit=30`);

  const notes: ClientNote[] = (rawNotes || []).map(clientNoteFromRecord);
  const events: ClientEvent[] = (rawEvents || []).map(clientEventFromRecord);

  const handleSave = async () => {
    if (!content.trim() || saving) return;
    setSaving(true);
    try {
      await apiFetch(`/api/clients/${clientId}/notes`, { body: { content: content.trim() } });
      setContent("");
      refreshNotes();
      refreshEvents();
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add note */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Ajouter une note</h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrire une note..."
          className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg p-3 text-[13px] text-[#1A1A1A] placeholder-[#BBB] min-h-[100px] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className="px-4 py-2 bg-[#4F46E5] text-white text-[13px] font-medium rounded-md hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Notes list */}
      {notes.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
          <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Notes ({notes.length})</h3>
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-3 bg-[#F7F7F5] rounded-lg">
                <p className="text-[13px] text-[#1A1A1A] whitespace-pre-wrap">{note.content}</p>
                <p className="text-[11px] text-[#999] mt-2">
                  {new Date(note.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-4">Historique</h3>
        <ClientEventTimeline events={events} />
      </div>
    </div>
  );
}
