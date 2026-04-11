export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 skeleton-shimmer" />
      <div className="h-4 w-72 skeleton-shimmer" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 skeleton-shimmer" />
        ))}
      </div>
      <div className="h-64 skeleton-shimmer" />
    </div>
  );
}

/** Skeleton shimmer pour une ligne de tableau */
export function RowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className={`h-4 skeleton-shimmer ${i === 0 ? "w-32" : "w-20"}`} />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton shimmer pour des cartes KPI */
export function CardSkeleton({ h = "h-24" }: { h?: string }) {
  return <div className={`${h} skeleton-shimmer rounded-lg`} />;
}
