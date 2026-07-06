/**
 * Skeleton — shimmer teinté module, dimensions FIXES (aucun layout shift).
 * Toujours réserver la hauteur réelle du contenu asynchrone.
 */
export function Skeleton({ className = "", w, h }: { className?: string; w?: string | number; h?: string | number }) {
  return (
    <span
      className={`ecom-skeleton block ${className}`}
      style={{ width: w, height: h }}
      aria-hidden
    />
  );
}
