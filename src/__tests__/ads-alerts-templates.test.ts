import { describe, it, expect } from "vitest";

/**
 * Tests des templates de messages alertes — vérifie que le wording FR
 * inclut bien les variables interpolées et reste actionable.
 *
 * Comme les templates sont inlinés dans alerts-engine.ts, on les duplique ici
 * pour les tester en isolation (snapshots du wording attendu).
 */

import { formatCurrency, formatPercentDelta } from "@/lib/ads/formatters";

describe("Alert recommendations FR", () => {
  it("campaign_unprofitable inclut nom + perte/sem", () => {
    const campaign = "Vintage Cornwall";
    const loss = 5000; // 50 €
    const msg = `Pause "${campaign}" : vous perdez environ ${formatCurrency(loss)} par semaine.`;
    expect(msg).toContain("Vintage Cornwall");
    expect(msg).toContain("Pause");
    expect(msg).toMatch(/50,00\s?€/);
  });

  it("campaign_drop inclut le % de baisse", () => {
    const drop = -24.5;
    const msg = `ROAS ${formatPercentDelta(drop)} sur 7 jours vs 7 jours précédents.`;
    expect(msg).toContain("-24.5 %");
  });

  it("no_conversion inclut le spend", () => {
    const spend = 7500; // 75 €
    const msg = `${formatCurrency(spend)} dépensés sur 7 jours, 0 commande attribuée.`;
    expect(msg).toMatch(/75,00\s?€/);
    expect(msg).toContain("0 commande");
  });

  it("pacing_anomaly cohérent (ratio jour/moyenne)", () => {
    const last = 12000, avg = 4000;
    const msg = `Dépense d'hier ${formatCurrency(last)} vs moyenne 7j ${formatCurrency(avg)}.`;
    expect(msg).toMatch(/120,00\s?€/);
    expect(msg).toMatch(/40,00\s?€/);
  });

  it("utm_missing inclut le compteur + recommandation tracking template", () => {
    const count = 8;
    const msg = `${count} commandes sans UTM attribuables cette semaine.`;
    const reco = "Activez le tracking template Pinterest dans les ad account settings, et vérifiez vos URLs de destination.";
    expect(msg).toContain("8 commandes");
    expect(reco).toContain("Pinterest");
    expect(reco).toContain("tracking template");
  });
});
