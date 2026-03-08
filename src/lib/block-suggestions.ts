import type { BlockType, Block } from "@/types";
import { blockRegistry, type BlockCategory } from "@/lib/block-registry";

/**
 * Map block categories to suggested next categories.
 * Order matters — first suggestions appear first.
 */
const categoryFlow: Record<string, BlockCategory[]> = {
  hero:       ["services", "social", "portfolio", "content", "conversion"],
  services:   ["portfolio", "social", "conversion", "process", "faq"],
  portfolio:  ["social", "conversion", "cta", "contact", "services"],
  conversion: ["faq", "contact", "social", "footer"],
  social:     ["conversion", "cta", "portfolio", "faq", "contact"],
  content:    ["services", "portfolio", "social", "conversion", "cta"],
  media:      ["content", "social", "conversion", "cta"],
  contact:    ["footer", "faq", "cta", "social"],
  faq:        ["contact", "cta", "conversion", "footer"],
  cta:        ["contact", "faq", "footer", "social"],
  process:    ["conversion", "services", "social", "cta"],
  vente:      ["social", "faq", "conversion", "cta"],
  about:      ["services", "social", "portfolio", "cta"],
  footer:     [],
  creative:   ["contact", "footer"],
};

/**
 * Get block category from its type.
 */
function getBlockCategory(type: BlockType): BlockCategory | undefined {
  return blockRegistry.find((b) => b.type === type)?.category;
}

/**
 * Suggest next block types based on the current page composition.
 * Returns up to `limit` suggestions, prioritized by:
 * 1. What naturally follows the last block's category
 * 2. What categories are missing from the page
 * 3. Avoiding duplicates of existing block types
 */
export function suggestNextBlocks(blocks: Block[], limit = 6): BlockType[] {
  const existingTypes = new Set(blocks.map((b) => b.type));
  const existingCategories = new Set(blocks.map((b) => getBlockCategory(b.type)).filter(Boolean));

  // Determine flow from the last block
  const lastBlock = blocks[blocks.length - 1];
  const lastCategory = lastBlock ? getBlockCategory(lastBlock.type) : undefined;
  const suggestedCategories = lastCategory
    ? categoryFlow[lastCategory] || []
    : ["hero", "services", "content", "portfolio"];

  // Prioritize categories not yet on the page
  const prioritized = [
    ...suggestedCategories.filter((c: string) => !existingCategories.has(c as BlockCategory)),
    ...suggestedCategories.filter((c: string) => existingCategories.has(c as BlockCategory)),
  ];

  const suggestions: BlockType[] = [];
  const seen = new Set<BlockType>();

  for (const category of prioritized) {
    if (suggestions.length >= limit) break;
    // Pick blocks from this category that aren't already on the page
    const candidates = blockRegistry
      .filter((b) => b.category === category && !existingTypes.has(b.type) && !seen.has(b.type));

    // Take at most 2 from each category to maintain diversity
    for (const candidate of candidates.slice(0, 2)) {
      if (suggestions.length >= limit) break;
      suggestions.push(candidate.type);
      seen.add(candidate.type);
    }
  }

  // If we still need more, fill with popular blocks not yet added
  if (suggestions.length < limit) {
    const fallbacks: BlockType[] = [
      "testimonials", "pricing-table", "faq-accordion", "cta-premium",
      "contact-form", "feature-grid", "stats-counter", "footer-simple-premium",
    ];
    for (const fb of fallbacks) {
      if (suggestions.length >= limit) break;
      if (!existingTypes.has(fb) && !seen.has(fb)) {
        suggestions.push(fb);
        seen.add(fb);
      }
    }
  }

  return suggestions;
}
