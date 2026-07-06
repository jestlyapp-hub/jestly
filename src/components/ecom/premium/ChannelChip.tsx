import { DISPLAY_CHANNEL_META, type DisplayChannel } from "@/lib/gads/channels";
import { channelColor } from "@/lib/ecom/design-tokens";

/**
 * ChannelChip premium — pastille pleine couleur-canal + label, taille unique,
 * réutilisé PARTOUT (tableaux, donuts, légendes). Couleur = token de canal figé
 * (une seule source de vérité). Le ghost/non-attribué est rendu en pointillé.
 */
export function ChannelChip({ channel, muted = false }: { channel: DisplayChannel; muted?: boolean }) {
  const label = DISPLAY_CHANNEL_META[channel].label;
  const color = channelColor[channel] ?? channelColor.other;
  const isGhost = channel === "unattributed";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--ecom-r-full)] text-[var(--ecom-fs-caption)] font-medium whitespace-nowrap"
      style={{
        color: muted ? "var(--ecom-muted)" : color,
        background: `color-mix(in srgb, ${color} 10%, white)`,
        border: `1px ${isGhost ? "dashed" : "solid"} color-mix(in srgb, ${color} 28%, white)`,
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: color, ...(isGhost ? { background: "transparent", border: `1.5px dashed ${color}` } : {}) }}
      />
      {label}
    </span>
  );
}
