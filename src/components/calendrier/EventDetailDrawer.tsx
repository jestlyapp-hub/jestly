"use client";

import { useState } from "react";
import SlidePanel from "@/components/ui/SlidePanel";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RelationBadge from "@/components/ui/RelationBadge";
import {
  CATEGORY_CONFIG,
  PRIORITY_CONFIG,
  getEventDisplayColor,
  formatDateFr,
  type CalendarEvent,
} from "@/lib/calendar-utils";

interface EventDetailDrawerProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

export default function EventDetailDrawer({ event, open, onClose, onEdit, onDelete }: EventDetailDrawerProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!event) return null;

  const cat = CATEGORY_CONFIG[event.category];
  const priority = PRIORITY_CONFIG[event.priority];
  const isOrder = event.source === "order";
  const eventDate = new Date(event.date + "T00:00:00");

  return (
    <><ConfirmDialog open={showDeleteConfirm} title="Supprimer l'événement" message="Supprimer cet événement ? Cette action est irréversible." variant="danger" confirmLabel="Supprimer" cancelLabel="Annuler" onConfirm={() => { setShowDeleteConfirm(false); onDelete(event.id); }} onCancel={() => setShowDeleteConfirm(false)} />
    <SlidePanel open={open} onClose={onClose} title="Détail de l'événement">
      <div className="space-y-6">
        {/* Color bar */}
        <div className="h-2 -mx-6 -mt-6 rounded-t-lg" style={{ backgroundColor: getEventDisplayColor(event) }} />

        {/* ─── Identity ─── */}
        <section>
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: getEventDisplayColor(event) }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-semibold text-[#191919] leading-tight break-words">
                {event.title || "Sans titre"}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white"
              style={{ backgroundColor: getEventDisplayColor(event) }}
            >
              {cat.label}
            </span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F7F7F5] text-[#666]"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priority.color }} />
              {priority.label}
            </span>
            {isOrder && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-600">
                Commande
              </span>
            )}
          </div>
        </section>

        <div className="h-px bg-[#E6E6E4]" />

        {/* ─── Metadata ─── */}
        <section className="space-y-3">
          <h4 className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">
            Details
          </h4>
          <div className="space-y-2.5">
            <DetailRow
              label="Date"
              value={formatDateFr(eventDate)}
            />
            {!event.allDay && event.startTime && (
              <DetailRow
                label="Horaire"
                value={`${event.startTime} — ${event.endTime || "..."}`}
              />
            )}
            {event.allDay && (
              <DetailRow label="Horaire" value="Toute la journee" />
            )}
          </div>
        </section>

        {/* ─── Context (client / order) ─── */}
        {(event.clientName || event.clientEmail || isOrder) && (
          <>
            <div className="h-px bg-[#E6E6E4]" />
            <section className="space-y-3">
              <h4 className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">
                Contexte
              </h4>
              <div className="space-y-2.5">
                {event.clientName && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#999]">Client</span>
                    <RelationBadge type="client" label={event.clientName} href="/clients" />
                  </div>
                )}
                {event.clientEmail && (
                  <DetailRow label="Email" value={event.clientEmail} />
                )}
                {isOrder && event.productName && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#999]">Produit</span>
                    <RelationBadge type="product" label={event.productName} />
                  </div>
                )}
                {isOrder && event.orderStatus && (
                  <DetailRow label="Statut commande" value={event.orderStatus} />
                )}
                {isOrder && event.orderPrice != null && (
                  <DetailRow label="Prix" value={`${event.orderPrice} \u20AC`} />
                )}
                {isOrder && event.orderId && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#999]">Commande</span>
                    <RelationBadge
                      type="order"
                      label="Voir la commande"
                      href={`/commandes?id=${event.orderId}`}
                    />
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ─── Notes ─── */}
        {event.notes && (
          <>
            <div className="h-px bg-[#E6E6E4]" />
            <section className="space-y-2">
              <h4 className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">
                Notes
              </h4>
              <p className="text-[13px] text-[#191919] leading-relaxed whitespace-pre-wrap bg-[#F7F7F5] rounded-lg p-3">
                {event.notes}
              </p>
            </section>
          </>
        )}

        {/* ─── Actions ─── */}
        <div className="h-px bg-[#E6E6E4]" />
        <section className="space-y-2">
          <h4 className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-3">
            Actions
          </h4>
          {!isOrder && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(event)}
                className="flex-1 bg-[#4F46E5] text-white rounded-md px-4 py-2.5 text-[13px] font-medium hover:bg-[#4338CA] transition-colors cursor-pointer"
              >
                Modifier
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                }}
                className="px-4 py-2.5 rounded-md text-[13px] font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          )}
          {isOrder && (
            <p className="text-[12px] text-[#999] italic">
              Cet evenement est genere automatiquement depuis une commande. Modifiez la commande pour mettre a jour la deadline.
            </p>
          )}
        </section>
      </div>
    </SlidePanel>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[#999]">{label}</span>
      <span className="text-[13px] font-medium text-[#191919]">{value}</span>
    </div>
  );
}
