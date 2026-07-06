import type { ReactNode } from "react";

/**
 * Card — surface de base du module premium. Trois élévations dérivées des
 * tokens (--ecom-shadow-*). `interactive` ajoute le lift au survol (transform
 * only, --ecom-t-fast).
 */
export function Card({
  children,
  className = "",
  elevation = "sm",
  interactive = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  elevation?: "sm" | "md" | "lg";
  interactive?: boolean;
  as?: "div" | "section" | "article";
}) {
  const shadow = elevation === "lg"
    ? "shadow-[var(--ecom-shadow-lg)]"
    : elevation === "md"
      ? "shadow-[var(--ecom-shadow-md)]"
      : "shadow-[var(--ecom-shadow-sm)]";
  const hover = interactive
    ? "transition-[transform,box-shadow,border-color] duration-[var(--ecom-t-fast)] ease-[var(--ecom-ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--ecom-shadow-md)] hover:border-[var(--ecom-violet-mid)]"
    : "";
  return (
    <Tag className={`bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] ${shadow} ${hover} ${className}`}>
      {children}
    </Tag>
  );
}
