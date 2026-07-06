/**
 * Sparkline — mini-aire dégradée avec dernière valeur marquée d'un point.
 * SVG pur, sans dépendance. La couleur par défaut suit l'accent violet.
 */
export function Sparkline({
  values,
  color = "var(--ecom-violet-mid)",
  className = "h-6 w-full",
}: {
  values: number[];
  color?: string;
  className?: string;
}) {
  if (values.length < 2 || values.every((v) => v === values[0])) {
    return <span className={className} aria-hidden />;
  }
  const w = 100;
  const h = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pt = (v: number, i: number): [number, number] => [
    (i / (values.length - 1)) * w,
    h - ((v - min) / span) * (h - 3) - 1.5,
  ];
  const pts = values.map(pt);
  const line = pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${pts[0][0]},${h} ${line} ${pts[pts.length - 1][0]},${h}`;
  const [lx, ly] = pts[pts.length - 1];
  const gid = `spark-${values.length}-${Math.round(max)}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lx} cy={ly} r="2" fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
