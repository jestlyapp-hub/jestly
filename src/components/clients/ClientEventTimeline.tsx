"use client";

import type { ClientEvent } from "@/types";

interface Props {
  events: ClientEvent[];
}

const eventConfig: Record<string, { label: string; color: string }> = {
  note_added: { label: "Note ajoutée", color: "bg-blue-400" },
  order_created: { label: "Commande créée", color: "bg-[#4F46E5]" },
  order_delivered: { label: "Commande livrée", color: "bg-emerald-500" },
  order_cancelled: { label: "Commande annulée", color: "bg-red-400" },
  status_changed: { label: "Statut modifié", color: "bg-amber-400" },
  client_created: { label: "Client créé", color: "bg-[#4F46E5]" },
  client_updated: { label: "Client mis à jour", color: "bg-gray-400" },
  payment_received: { label: "Paiement reçu", color: "bg-emerald-500" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function eventDescription(event: ClientEvent): string {
  const p = event.payload;
  switch (event.type) {
    case "note_added":
      return (p.preview as string) || "Note ajoutée";
    case "order_created":
      return `${p.title || "Commande"} — ${p.amount || 0}€`;
    case "order_delivered":
      return `${p.title || "Commande"} livrée`;
    case "order_cancelled":
      return `${p.title || "Commande"} annulée`;
    case "status_changed":
      return `Statut : ${p.from || "?"} → ${p.to || "?"}`;
    case "payment_received":
      return `Paiement de ${p.amount || 0}€ reçu`;
    default:
      return eventConfig[event.type]?.label || event.type;
  }
}

export default function ClientEventTimeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <p className="text-[13px] text-[#BBB] py-6 text-center">
        Aucun événement pour le moment.
      </p>
    );
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#E6E6E4]" />

      <div className="space-y-4">
        {events.map((event) => {
          const cfg = eventConfig[event.type] || { label: event.type, color: "bg-gray-400" };
          return (
            <div key={event.id} className="relative flex gap-3">
              {/* Dot */}
              <div className={`absolute -left-6 top-1.5 w-[10px] h-[10px] rounded-full ${cfg.color} ring-2 ring-white`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[12px] font-medium text-[#191919]">{cfg.label}</span>
                  <span className="text-[11px] text-[#999]">{formatDate(event.createdAt)}</span>
                </div>
                <p className="text-[12px] text-[#666] truncate">{eventDescription(event)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
