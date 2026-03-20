"use client";

import { useState, useEffect, useCallback } from "react";
import type { PortfolioCard } from "@/types";

interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  projectType: string;
  color: string;
  status: string;
  coverUrl?: string;
  tags: string[];
  clientName: string | null;
  isPortfolio: boolean;
  itemImages: string[];
  portfolio: {
    displayTitle?: string;
    subtitle?: string;
    result?: string;
    summary?: string;
    coverUrl?: string;
    coverItemId?: string;
    category?: string;
    images: string[];
    externalUrl?: string;
    slug?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    featured: boolean;
    displayOrder: number;
    visibility: string;
    description?: string;
  };
}

/**
 * Hook to fetch user's projects for the portfolio picker in the builder.
 * Returns project list + resolve function to get PortfolioCards for block rendering.
 */
export function usePortfolioProjects() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects/portfolio");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /**
   * Resolve linked project IDs to PortfolioCard[] with smart fallbacks.
   */
  const resolveCards = useCallback(
    (linkedIds: string[]): PortfolioCard[] => {
      return linkedIds
        .map((pid) => {
          const p = projects.find((pr) => pr.id === pid);
          if (!p) return null;

          // Cover fallback chain: explicit cover → project cover → portfolio images → item images
          const coverUrl =
            p.portfolio.coverUrl ||
            p.coverUrl ||
            (p.portfolio.images?.length ? p.portfolio.images[0] : undefined) ||
            p.itemImages[0] ||
            undefined;

          return {
            projectId: p.id,
            imageUrl: coverUrl,
            title: p.portfolio.displayTitle || p.name,
            category: p.portfolio.category || p.projectType || "",
            result: p.portfolio.result || undefined,
            summary: p.portfolio.summary || p.portfolio.description || p.description || undefined,
            ctaLabel: p.portfolio.ctaLabel || undefined,
            ctaUrl: p.portfolio.ctaUrl || p.portfolio.externalUrl || undefined,
            slug: p.portfolio.slug || undefined,
          } satisfies PortfolioCard;
        })
        .filter(Boolean) as PortfolioCard[];
    },
    [projects]
  );

  return { projects, isLoading, resolveCards, refetch: fetchProjects };
}
