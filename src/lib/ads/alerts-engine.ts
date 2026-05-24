/**
 * Alerts Engine — détecte automatiquement les anomalies sur les campagnes
 * et stocke des alertes actionables dans `ads_alerts`.
 *
 * Déduplication : pour un même (user, type, campaign_id, jour), on évite
 * de créer une 2e alerte active. Si conditions changent, on resolve l'ancienne
 * et on en crée une nouvelle.
 *
 * 5 types détectés (cf brief §10) :
 *   1. campaign_unprofitable : ROAS < seuil + spend > min_spend sur 7j
 *   2. campaign_drop         : baisse > X% (settings) sur 7j vs 7j précédents
 *   3. campaign_no_conversion: spend > min_spend mais 0 conversion Shopify
 *   4. budget_pacing_anomaly : daily spend > 2× moyenne 7j
 *   5. utm_missing           : N commandes unmatched sur 7j
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { getEcomSettings } from "./roas-engine";
import { formatCurrency, formatPercentDelta } from "./formatters";

interface AlertCandidate {
  alert_type: "campaign_unprofitable" | "campaign_drop" | "campaign_no_conversion" | "budget_pacing_anomaly" | "utm_missing";
  severity: "info" | "warning" | "critical";
  provider: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  title: string;
  message: string;
  recommendation: string;
  metric_value: number;
  metric_label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export async function detectAlerts(userId: string): Promise<{ new_alerts: number; resolved_alerts: number }> {
  const settings = await getEcomSettings(userId);
  if (!settings.alerts_enabled) {
    return { new_alerts: 0, resolved_alerts: 0 };
  }

  const supabase = createAdminClient();

  // Bornes
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  // Charge la performance 14j (suffit pour les comparaisons 7j vs 7j)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: perfRows } = await (supabase.from("campaign_performance_daily") as any)
    .select("date, provider, campaign_id, campaign_name, ads_spend_cents, shopify_revenue_cents, shopify_orders_count, real_roas")
    .eq("user_id", userId)
    .gte("date", fourteenDaysAgo)
    .lte("date", today)
    .order("date");
  const rows = (perfRows ?? []) as Array<{
    date: string; provider: string; campaign_id: string; campaign_name: string;
    ads_spend_cents: number; shopify_revenue_cents: number; shopify_orders_count: number; real_roas: number | null;
  }>;

  // Agrège par campagne sur 7j / 7j précédents
  type CampaignAgg = {
    spend_7d: number; revenue_7d: number; orders_7d: number; roas_7d: number | null;
    spend_prev: number; revenue_prev: number;
    daily_spends_7d: number[];
  };
  const byCampaign = new Map<string, CampaignAgg & { provider: string; campaign_id: string; campaign_name: string }>();
  for (const r of rows) {
    const key = `${r.provider}|${r.campaign_id}`;
    const cur = byCampaign.get(key) ?? {
      provider: r.provider, campaign_id: r.campaign_id, campaign_name: r.campaign_name,
      spend_7d: 0, revenue_7d: 0, orders_7d: 0, roas_7d: null,
      spend_prev: 0, revenue_prev: 0, daily_spends_7d: [],
    };
    if (r.date >= sevenDaysAgo) {
      cur.spend_7d += r.ads_spend_cents;
      cur.revenue_7d += r.shopify_revenue_cents;
      cur.orders_7d += r.shopify_orders_count;
      cur.daily_spends_7d.push(r.ads_spend_cents);
    } else {
      cur.spend_prev += r.ads_spend_cents;
      cur.revenue_prev += r.shopify_revenue_cents;
    }
    byCampaign.set(key, cur);
  }
  // Calcul ROAS 7j par campagne
  for (const c of byCampaign.values()) {
    c.roas_7d = c.spend_7d > 0 ? c.revenue_7d / c.spend_7d : null;
  }

  // ── Génération des alertes candidates ────────────────────────
  const candidates: AlertCandidate[] = [];

  for (const c of byCampaign.values()) {
    // 1. campaign_unprofitable
    if (c.spend_7d >= settings.alert_min_spend_cents && c.roas_7d != null && c.roas_7d < settings.roas_warning_threshold) {
      const lossPerWeek = c.spend_7d - c.revenue_7d * (settings.net_margin_percent / 100);
      candidates.push({
        alert_type: "campaign_unprofitable",
        severity: "critical",
        provider: c.provider,
        campaign_id: c.campaign_id,
        campaign_name: c.campaign_name,
        title: `${c.campaign_name} non rentable`,
        message: `ROAS ${c.roas_7d.toFixed(2)} sur 7 jours (seuil ${settings.roas_warning_threshold}).`,
        recommendation: `Pause "${c.campaign_name}" : vous perdez environ ${formatCurrency(lossPerWeek)} par semaine.`,
        metric_value: c.roas_7d,
        metric_label: "ROAS 7j",
      });
    }

    // 2. campaign_drop
    if (c.spend_prev > 0 && c.spend_7d >= settings.alert_min_spend_cents) {
      const prevRoas = c.spend_prev > 0 ? c.revenue_prev / c.spend_prev : 0;
      if (prevRoas > 0 && c.roas_7d != null) {
        const dropPct = ((prevRoas - c.roas_7d) / prevRoas) * 100;
        if (dropPct >= settings.alert_drop_threshold_percent) {
          candidates.push({
            alert_type: "campaign_drop",
            severity: "warning",
            provider: c.provider,
            campaign_id: c.campaign_id,
            campaign_name: c.campaign_name,
            title: `${c.campaign_name} en baisse`,
            message: `ROAS ${formatPercentDelta(-dropPct)} sur 7 jours vs 7 jours précédents.`,
            recommendation: `Vérifiez les creatives ou la cible de "${c.campaign_name}" — la performance se dégrade.`,
            metric_value: -dropPct,
            metric_label: "Variation ROAS",
          });
        }
      }
    }

    // 3. campaign_no_conversion
    if (c.spend_7d >= settings.alert_min_spend_cents && c.orders_7d === 0) {
      candidates.push({
        alert_type: "campaign_no_conversion",
        severity: "warning",
        provider: c.provider,
        campaign_id: c.campaign_id,
        campaign_name: c.campaign_name,
        title: `${c.campaign_name} sans conversion`,
        message: `${formatCurrency(c.spend_7d)} dépensés sur 7 jours, 0 commande attribuée.`,
        recommendation: `Vérifiez le tracking Shopify (UTMs Pinterest) ou pause "${c.campaign_name}".`,
        metric_value: c.spend_7d,
        metric_label: "Spend sans conversion",
      });
    }

    // 4. budget_pacing_anomaly
    if (c.daily_spends_7d.length >= 4) {
      const avg = c.daily_spends_7d.reduce((s, v) => s + v, 0) / c.daily_spends_7d.length;
      const lastDay = c.daily_spends_7d[c.daily_spends_7d.length - 1] ?? 0;
      if (avg > 0 && lastDay >= avg * 2 && lastDay >= settings.alert_min_spend_cents / 7) {
        candidates.push({
          alert_type: "budget_pacing_anomaly",
          severity: "info",
          provider: c.provider,
          campaign_id: c.campaign_id,
          campaign_name: c.campaign_name,
          title: `${c.campaign_name} : pic de dépense`,
          message: `Dépense d'hier ${formatCurrency(lastDay)} vs moyenne 7j ${formatCurrency(avg)}.`,
          recommendation: `Vérifiez que le budget de "${c.campaign_name}" n'a pas été augmenté par erreur.`,
          metric_value: lastDay / avg,
          metric_label: "Ratio spend/moyenne",
        });
      }
    }
  }

  // 5. utm_missing (global, pas par campagne)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: unmatched } = await (supabase.from("order_attribution_touches") as any)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("attribution_method", "unmatched")
    .gte("touch_at", sevenDaysAgo + "T00:00:00");
  if ((unmatched ?? 0) >= 3) {
    candidates.push({
      alert_type: "utm_missing",
      severity: "info",
      provider: null,
      campaign_id: null,
      campaign_name: null,
      title: "UTMs manquantes",
      message: `${unmatched} commandes sans UTM attribuables cette semaine.`,
      recommendation: "Activez le tracking template Pinterest dans les ad account settings, et vérifiez vos URLs de destination.",
      metric_value: Number(unmatched),
      metric_label: "Commandes unmatched",
    });
  }

  // ── Dedup + persist ─────────────────────────────────────────
  let newCount = 0;
  let resolvedCount = 0;

  // Charge les alertes actives existantes pour comparer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingActive } = await (supabase.from("ads_alerts") as any)
    .select("id, alert_type, campaign_id, detected_at")
    .eq("user_id", userId)
    .eq("status", "active");
  const existingByKey = new Map<string, { id: string; detected_at: string }>();
  for (const e of (existingActive ?? []) as Array<{ id: string; alert_type: string; campaign_id: string | null; detected_at: string }>) {
    const key = `${e.alert_type}|${e.campaign_id ?? ""}`;
    existingByKey.set(key, { id: e.id, detected_at: e.detected_at });
  }

  const seenKeys = new Set<string>();
  for (const c of candidates) {
    const key = `${c.alert_type}|${c.campaign_id ?? ""}`;
    seenKeys.add(key);
    if (existingByKey.has(key)) continue; // déjà active, skip

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("ads_alerts") as any).insert({
      user_id: userId,
      alert_type: c.alert_type,
      severity: c.severity,
      provider: c.provider,
      campaign_id: c.campaign_id,
      campaign_name: c.campaign_name,
      title: c.title,
      message: c.message,
      recommendation: c.recommendation,
      metric_value: c.metric_value,
      metric_label: c.metric_label,
      metadata: c.metadata ?? {},
    });
    if (error) {
      logger.warn("alert_insert_failed", { error: error.message, key });
    } else {
      newCount += 1;
    }
  }

  // Resolve les anciennes alertes qui ne s'appliquent plus
  const toResolve = [...existingByKey.entries()]
    .filter(([key]) => !seenKeys.has(key))
    .map(([, v]) => v.id);
  if (toResolve.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("ads_alerts") as any)
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .in("id", toResolve);
    resolvedCount = toResolve.length;
  }

  logger.info("alerts_detection_done", { userId, new_alerts: newCount, resolved_alerts: resolvedCount });
  return { new_alerts: newCount, resolved_alerts: resolvedCount };
}
