/**
 * Formatters spécifiques au module Ads (FR-first, cents → display).
 */

export function formatCurrency(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency, maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatNumberFr(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function formatPercent(value: number, digits = 2): string {
  return `${value.toFixed(digits)} %`;
}

/** Variation en %, avec signe et couleur sémantique (positif vert). */
export function formatPercentDelta(percent: number | null): string {
  if (percent == null) return "—";
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(1)} %`;
}

export function formatRoas(roas: number | null): string {
  if (roas == null) return "—";
  return `${roas.toFixed(2)}×`;
}

/** Score de confidence 0-1 → label FR. */
export function formatConfidence(c: number | null): string {
  if (c == null) return "—";
  if (c >= 0.9) return "Très haute";
  if (c >= 0.7) return "Haute";
  if (c >= 0.5) return "Moyenne";
  return "Faible";
}

export function formatAttributionMethod(method: string | null): string {
  switch (method) {
    case "utm_content_exact": return "UTM visuel exact";
    case "utm_campaign_exact": return "UTM exact";
    case "utm_source_prorata": return "Source prorata";
    case "referring_site": return "Domaine référent";
    case "unmatched": return "Non attribuée";
    default: return "—";
  }
}

export function formatProvider(provider: string | null | undefined): string {
  switch (provider) {
    case "pinterest": return "Pinterest";
    case "google_ads": return "Google Ads";
    case "meta_ads": return "Meta Ads";
    case "tiktok_ads": return "TikTok Ads";
    case "organic": return "Organique";
    case "direct": return "Direct";
    default: return provider ?? "—";
  }
}

export function providerEmoji(provider: string | null | undefined): string {
  switch (provider) {
    case "pinterest": return "📌";
    case "google_ads": return "🔵";
    case "meta_ads": return "📘";
    case "tiktok_ads": return "🎵";
    default: return "🎯";
  }
}
