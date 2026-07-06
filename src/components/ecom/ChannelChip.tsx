import { DISPLAY_CHANNEL_META, type DisplayChannel } from "@/lib/gads/channels";

/**
 * Chip canal unifié — mêmes libellés et couleurs partout (Dashboard, Commandes).
 * Une seule vérité d'attribution : le fantôme est rendu « Non attribué », jamais
 * fondu dans « Direct ».
 */
export default function ChannelChip({ channel }: { channel: DisplayChannel }) {
  const meta = DISPLAY_CHANNEL_META[channel];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${meta.chip}`}>
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
      {meta.label}
    </span>
  );
}
