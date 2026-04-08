import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function HelpBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      className="text-sm text-[#6B6F80] mb-6 flex flex-wrap items-center gap-1"
      aria-label="Fil d'Ariane"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[#7C5CFF] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-[#111118] font-medium" : ""}>
                {item.label}
              </span>
            )}
            {!isLast && <span className="mx-1 text-[#C9C9D1]">›</span>}
          </span>
        );
      })}
    </nav>
  );
}
