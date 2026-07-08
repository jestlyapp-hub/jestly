import { DISPLAY_STATUS_META, type DisplayTrackingStatus } from "@/lib/gads/channels";

/**
 * Badge de statut de traçabilité (dérivé) — Trackée (vert) / Résolu Jestly
 * (violet) / Fantôme (rouge) / Non rattachée (ambre). Le statut est CALCULÉ
 * (tracking_status + existence d'une résolution), jamais persisté en base.
 *
 * Le tooltip peut être surchargé (`title`) pour préciser le canal/l'origine
 * sur une commande « Résolu Jestly ».
 */
export default function TrackingStatusBadge({
  status,
  title,
  className = "",
}: {
  status: DisplayTrackingStatus;
  title?: string;
  className?: string;
}) {
  const meta = DISPLAY_STATUS_META[status];
  const isResolved = status === "resolved_jestly";
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${isResolved ? "text-[#7C3AED] font-medium" : "text-[#5A5A58]"} ${title ? "cursor-help" : ""} ${className}`}
      title={title ?? meta.description}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
