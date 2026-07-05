# Ticket — Cleanup V3 et orphelins (reporté volontairement au déploiement du 5 juillet 2026)

Décision prise lors de l'assainissement branches + déploiement prod : on n'a PAS
fait le grand nettoyage en même temps que le gros merge (trop risqué). Les
éléments ci-dessous sont partis en prod tels quels, **inertes** (aucun code ne
les appelle), et restent à traiter dans une passe dédiée.

## À nettoyer

1. **Système V3 orphelin** (jamais câblé : ni route, ni cron, ni UI) :
   - `src/lib/attribution/` (moteur MTA 5 modèles), `src/lib/profit/`,
     `src/lib/ltv/`, `src/lib/insights/anomaly-detector.ts`
   - migrations `087` à `092` (`stores`, `pixel_events`, `attribution_results`,
     `product_costs`, `store_financial_settings`, `ltv_cohorts`, `ai_insights`)
   - **Non appliquées en prod** (décision d'audit : ne pas créer 7 tables mortes).
     Le cleanup devra supprimer fichiers de migration + code + tests associés,
     ou trancher pour les câbler un jour (peu probable).
2. **`src/lib/ecom/`** (parcours gamifié : data/hooks/types/path-config) —
   jamais importé nulle part.
3. **Chantier « ROAS par visuel » dormant** : `utm_content`/`utm_term` jamais
   collectés (migration « 094 utm_content » jamais créée — le numéro 094 a été
   réutilisé par le flag de traçabilité). `refreshAdCreativePerformance()`
   tourne avec revenue = 0. Trancher : collecter utm_content ou débrancher.
4. **Références mortes multi-provider** : tables `google_ads_campaigns` /
   `meta_ads_*` / `tiktok_ads_*` référencées dans `src/lib/ads/matcher.ts`
   mais inexistantes (gardées par `provider !== "pinterest"`). Le module gads
   (CSV/API → `gads_daily`) a pris une autre voie — nettoyer ces références.
5. **Route de diagnostic** `/api/cron/env-check` (booléens, protégée
   CRON_SECRET) — créée pendant le déploiement, à garder ou supprimer.
6. **17 tests rouges préexistants** : `src/tests/adapters.test.ts` +
   `src/features/onboarding-v3/engine/__tests__/` — à réparer ou à retirer.

## Contraintes

- Aucun DROP sans backup ; vérifier `supabase.from()` avant toute suppression.
- Ne pas toucher au pipeline V2 opérationnel (matcher/roas-engine/aggregator)
  ni au module gads/pixel.
