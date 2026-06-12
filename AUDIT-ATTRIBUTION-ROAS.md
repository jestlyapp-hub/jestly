# AUDIT — Attribution & ROAS produit / campagne / visuel dans Jestly

> Audit en lecture seule réalisé le 2026-06-12 sur la branche `feature/v3-ecom-platform` (commit `40742a8`).
> Aucun code modifié. Ce fichier est le seul livrable.

---

## 0. Synthèse exécutive

1. **Le ROAS par campagne Pinterest fonctionne de bout en bout** : dépense synchronisée depuis l'API Pinterest, commandes Shopify attribuées par heuristiques UTM, ROAS réel calculé et affiché dans le dashboard `/ecom/ads`.
2. **Découverte structurante : il existe DEUX systèmes d'attribution parallèles.**
   - **V2 (opérationnel)** : matcher heuristique `src/lib/ads/matcher.ts` + `src/lib/ads/roas-engine.ts` → tables `order_attribution_touches` (083) et `campaign_performance_daily` (082) → UI `/ecom/ads`.
   - **V3 (orphelin)** : moteur MTA 5 modèles `src/lib/attribution/engine.ts`, Profit Engine, LTV cohortes, détecteur d'anomalies + migrations 087-092 (`stores`, `pixel_events`, `attribution_results`, `product_costs`, `ltv_cohorts`, `ai_insights`). **Ces moteurs ne sont appelés que par les tests unitaires** (`src/__tests__/`) et **aucune table V3 n'est référencée dans `src/`** en dehors des migrations. Ce sont des briques pures livrées par le commit `40742a8`, pas encore câblées (ni route API, ni cron, ni UI).
3. **La dépense par visuel/pin Pinterest est DÉJÀ stockée** (table `pinterest_metrics_daily`, `entity_type='ad'`), contrairement à ce qu'on pourrait croire. Ce qui manque pour le ROAS par visuel, c'est le **numérateur** : aucun lien commande Shopify ↔ ad/pin n'est construit (l'attribution s'arrête au grain campagne).
4. **Google Ads n'est PAS intégré** : OAuth Google configuré (scope `adwords` présent), mais zéro client API, zéro table, zéro sync, zéro dépendance npm. Les types (`google_ads`) et les stubs existent partout, prêts à être branchés.
5. La table `ad_creative_performance_daily` (migration 084) **existe mais n'est jamais ni alimentée ni lue** : aucune occurrence dans `src/`.

---

## 1. Carte du modèle de données

### 1.1 Chaîne commande → source → campagne → produit → visuel

```
shopify_orders (072)                         pinterest_metrics_daily (079)
  shopify_order_id (text)                      entity_type: campaign | ad_group | ad
  utm_source / utm_medium / utm_campaign  ◄─┐   entity_id (text)
  landing_site, referring_site, source_name │   spend_cents, impressions, clicks,
  line_items (JSONB — produits non         │   conversions, conversion_value_cents,
  relationnels : product_id Shopify en     │   pinterest_reported_roas
  texte dans le JSON)                       │   UNIQUE (integration_id, entity_type,
       │                                    │           entity_id, date)
       ▼ matcher heuristique                │        │
order_attribution_touches (083)             │        │ (grain "ad" = créatif)
  order_id (text, lien logique)             │        ▼
  provider, campaign_id, campaign_name      │   pinterest_ads (079)
  utm_* (dont utm_content, stocké mais      │     pinterest_ad_id, ad_group_id
  NON exploité pour matcher l'ad)           │     pin_id ──► pinterest_pins (079)
  attribution_weight, attribution_method,   │                  pinterest_pin_id, title,
  confidence                                │                  media_url, link, is_promoted
       │                                    │                  = LE VISUEL
       ▼ agrégation jour × campagne         │
campaign_performance_daily (082)  ◄─────────┘ (spend côté Ads)
  UNIQUE (user_id, date, provider, campaign_id)
  ads_spend_cents, ads_impressions, ads_clicks, ads_conversions,
  ads_reported_roas
  shopify_orders_count, shopify_revenue_cents,
  shopify_attributable_order_ids (text[])   ← commandes réelles attribuées
  real_roas, roas_delta, marginal_roas, is_profitable,
  profit_status, campaign_status (086), attribution_method, attribution_confidence
```

### 1.2 Tables par domaine

| Domaine | Table | Migration | Grain | Points clés |
|---|---|---|---|---|
| Ventes | `shopify_orders` | 072 | commande | `utm_source/medium/campaign` dénormalisés, `line_items` JSONB (pas de table relationnelle), `landing_site`, `referring_site` |
| Ventes | `shopify_products` | 072 | produit | `shopify_product_id` (text) ; les `line_items` des commandes n'ont **pas** de FK vers cette table |
| Ventes | `shopify_customers` | 072 | client | `total_spent`, `orders_count` |
| Attribution V2 | `order_attribution_touches` | 083 | touchpoint × commande | `order_id` text (lien logique, pas de FK), `campaign_id`, `attribution_weight`, `attribution_method`, `utm_content` stocké mais inexploité |
| Attribution V2 | `campaign_performance_daily` | 082 | jour × provider × campagne | **table pivot du ROAS** : spend Ads + revenue Shopify attribué + `real_roas` |
| Ads Pinterest | `pinterest_ad_accounts`, `pinterest_campaigns`, `pinterest_ad_groups`, `pinterest_ads`, `pinterest_pins` | 079 | hiérarchie complète | `pinterest_ads.pin_id → pinterest_pins.pinterest_pin_id` (jointure texte) relie créatif → visuel |
| Ads Pinterest | `pinterest_metrics_daily` | 079 | jour × entité (campaign/ad_group/**ad**) | **la dépense par créatif individuel est déjà là** (`entity_type='ad'`) |
| Ads multi-provider | `ad_creative_performance_daily` | 084 | jour × provider × ad | **jamais alimentée, jamais lue** (zéro occurrence dans `src/`) ; pas de colonnes revenue Shopify |
| Alertes | `ads_alerts` | 085 | alerte | 5 types (unprofitable, drop, no_conversion, pacing, utm_missing), déduplication |
| Config | `ecom_settings` | 081 | user | seuils ROAS, `attribution_window_days` (défaut 7 j), `attribution_model` |
| V3 (orphelines) | `stores` | 087 | store | multi-boutiques, backfill « Boutique principale » |
| V3 (orphelines) | `pixel_events` | 088 | événement pixel | `session_id`, `utm_*`, `email_hash` SHA-256, `product_id` (text), `value_cents` — **aucun code d'ingestion ni de lecture dans `src/`** |
| V3 (orphelines) | `attribution_results` | 089 | store × order × modèle | 5 modèles (CHECK `last_click/first_click/linear/time_decay/position_based`), `touchpoints` et `attributed_channels` en JSONB — **jamais écrite** |
| V3 (orphelines) | `product_costs`, `store_financial_settings` | 090 | produit/variante ; store | COGS historisés (`effective_from/to`, source manual/csv_upload) — **jamais lues** |
| V3 (orphelines) | `ltv_cohorts` | 091 | store × mois | ltv_30/60/90/180/365, repeat_rate — **jamais écrite** |
| V3 (orphelines) | `ai_insights` | 092 | insight | daily_summary / anomaly / recommendation — **jamais écrite** |

### 1.3 Ce que chaque migration récente a introduit

| Migration | Contenu |
|---|---|
| 082 | `campaign_performance_daily` : croisement spend Ads × commandes Shopify attribuées, multi-provider (CHECK pinterest/google_ads/meta_ads/tiktok_ads), `real_roas`, `roas_delta` |
| 083 | `order_attribution_touches` : trace de chaque touchpoint attribué (provider, campaign, UTM, poids, méthode) |
| 084 | `ad_creative_performance_daily` : drill-down ad-level multi-provider — **coquille vide à ce jour** |
| 085 | `ads_alerts` : historique des alertes du moteur ROAS |
| 086 | `campaign_status` (ACTIVE/PAUSED/ARCHIVED) sur `campaign_performance_daily` + index partiel |
| 087 | `stores` (multi-boutiques) + `store_id` nullable sur `integrations` |
| 088 | `pixel_events` (pixel first-party Jestly) |
| 089 | `attribution_results` (sorties du moteur MTA 5 modèles) |
| 090 | `product_costs` + `store_financial_settings` (base du profit net) |
| 091 | `ltv_cohorts` (recalcul nightly prévu, non implémenté) |
| 092 | `ai_insights` (briefs/anomalies via Claude API, non implémenté) |

---

## 2. Tableau de capacité ROAS

Légende : ✅ déjà calculable en l'état · 🟠 partiellement (maillon manquant indiqué) · 🔴 pas possible en l'état.

| Niveau | Pinterest | Google Ads |
|---|---|---|
| **Campagne** | ✅ Opérationnel : `campaign_performance_daily.real_roas`, alimenté par `roas-engine.ts`, affiché dans `/ecom/ads` | 🔴 Intégration absente (OAuth seul ; pas de client API, pas de tables `google_ads_*`, pas de sync) |
| **Produit** | 🟠 Revenue par produit reconstituable en parsant `shopify_orders.line_items` (JSONB) et en réutilisant l'attribution commande→campagne existante. **Manques** : pas de table `line_items` relationnelle ; pas de règle de répartition de la dépense d'une campagne entre les produits qu'elle promeut (une campagne porte N produits) | 🔴 Dépend de l'intégration Google Ads |
| **Visuel / pin** | 🟠 **Dénominateur déjà présent** : dépense par ad dans `pinterest_metrics_daily` (`entity_type='ad'`) + chaîne `pinterest_ads.pin_id → pinterest_pins` (visuel, `media_url`). **Manque le numérateur** : aucun lien commande ↔ ad ; le matcher s'arrête au grain campagne ; `utm_content` est capturé dans `order_attribution_touches` mais jamais exploité pour identifier l'ad | 🔴 Dépend de l'intégration Google Ads |
| **Source globale (UTM)** | ✅ Via heuristiques du matcher (exact / prorata / referring_site) | 🔴 (les commandes avec `utm_source=google` tombent en `utm_source_prorata` sans campagne à matcher → unmatched) |

Précision importante sur le niveau « visuel » : Pinterest expose les analytics par ad via `/ad_accounts/{id}/ads/analytics` et Jestly les synchronise déjà (`syncMetricsInitial`/`runDeltaSync` couvrent les trois niveaux campaign/ad_group/ad). **Il n'y a donc rien à ajouter côté collecte de dépense Pinterest** ; tout le manque est côté attribution du revenue.

---

## 3. Fichiers clés

### 3.1 Attribution & ROAS (V2, opérationnel)

| Fichier | Rôle |
|---|---|
| `src/lib/ads/matcher.ts` | `matchOrderToCampaign()` : 4 heuristiques en cascade — `utm_campaign_exact` (confiance 0.85-0.98), `utm_source_prorata` (0.7, multi-touch jusqu'à 3 campagnes au prorata du spend), `referring_site` (0.5), `unmatched`. V1 = Pinterest uniquement (commentaire explicite ligne ~73 : « google_ads, meta_ads, tiktok_ads à brancher quand les tables existeront ») |
| `src/lib/ads/utm-parser.ts` | `extractUtmsFromOrder()` : consolide 4 sources (colonnes `utm_*` Shopify, query string de `landing_site`, `note_attributes`, `referring_site`) |
| `src/lib/ads/roas-engine.ts` | `refreshUserCampaignPerformance()` : orchestre tout (load orders → match → persist touches → load metrics Pinterest → agrégation jour×campagne → upsert `campaign_performance_daily` → `detectAlerts()`). `computeRoas()`, `computeMarginalRoas()`, `determineProfitStatus()` |
| `src/lib/ads/alerts-engine.ts` | `detectAlerts()` : 5 règles (campaign_unprofitable, campaign_drop, campaign_no_conversion, budget_pacing_anomaly, utm_missing) avec déduplication |
| `src/lib/ads/aggregator.ts` | Requêtes d'agrégation sur `campaign_performance_daily` pour les KPIs |
| `src/lib/ads/types.ts` | `AdsProvider = "pinterest" \| "google_ads" \| "meta_ads" \| "tiktok_ads"` |
| `src/lib/attribution.ts` | Capture client-side (localStorage first/last touch, UTM + gclid/fbclid/ttclid) → `POST /api/public/attribution` (orienté leads, distinct du flux e-commerce) |

### 3.2 Moteurs V3 (purs, testés, NON branchés)

| Fichier | Rôle | État |
|---|---|---|
| `src/lib/attribution/engine.ts` | `attributeOrder()` : applique un des 5 modèles à une liste de touchpoints, distribue les centimes sans perte (méthode du plus grand reste) | Appelé uniquement par `src/__tests__/attribution-engine.test.ts` |
| `src/lib/attribution/models/{last-click, first-click, linear, time-decay, position-based}.ts` | Les 5 modèles MTA. Grain : **la commande entière** (pas le produit, pas la session). Time-decay : demi-vie 7 j ; position-based : 40/20/40 | Idem |
| `src/lib/profit/calculator.ts` | `computeOrderProfit()` : revenue − COGS − shipping − ad spend − refunds − frais processeur/transaction | Tests uniquement ; `product_costs` jamais lue |
| `src/lib/ltv/cohorts.ts`, `src/lib/ltv/cac.ts` | `computeCohorts()` (LTV 30/60/90/180/365 par mois de 1ʳᵉ commande), `computeCAC()`, ratio LTV/CAC, payback | Tests uniquement ; `ltv_cohorts` jamais écrite |
| `src/lib/insights/anomaly-detector.ts` | `detectAnomalies()` : 10 règles (pic spend sans conversions, chute conversion 24 h, AOV −20 %, ROAS<1 3 j, bounce +20 %, nouvelle source, pic remboursements, rupture en ads, LTV en baisse, objectif retardé) | Tests uniquement |

### 3.3 Sync Pinterest (opérationnel)

| Fichier | Rôle |
|---|---|
| `src/lib/pinterest/client.ts` | Client HTTP API v5 + retry |
| `src/lib/pinterest/queries.ts` | Endpoints : `/campaigns`, `/ad_groups`, `/ads`, `/pins` + `/…/analytics` aux 3 niveaux ; colonnes `SPEND_IN_DOLLAR`, `TOTAL_CHECKOUT_VALUE_IN_MICRO_DOLLAR`, `CHECKOUT_ROAS`, etc. |
| `src/lib/pinterest/sync.ts` | `runFullSync()` (90 j d'historique) et `runDeltaSync()` (3 derniers jours rejoués) ; upsert `pinterest_metrics_daily` sur `(integration_id, entity_type, entity_id, date)` |
| `src/lib/pinterest/formatters.ts` | ⚠️ deux unités Pinterest : micro-units (budgets) vs unités devise (analytics) → `microToCents()` / `currencyUnitsToCents()` |
| `src/app/api/cron/pinterest-sync/route.ts` | Cron Vercel (30 min) → delta sync |
| `src/lib/oauth/{pinterest,google,manager}.ts` | OAuth ; multi-comptes via `integrations.external_account_id` (commits `60094ed`, `ca0f630`) |

### 3.4 API & UI (opérationnels, grain campagne)

| Élément | Détail |
|---|---|
| `src/app/api/ecom/ads/*` | 14 routes : `overview`, `timeline`, `top`, `campaigns`, `campaigns/[id]/orders`, `alerts`, `attribution/audit`, `attribution/order/[order_id]`, `refresh`… |
| `src/app/(dashboard)/ecom/ads/page.tsx` | Dashboard Performance Ads : 6 KPIs, graphe spend/revenue/ROAS, top rentables/déficitaires, alertes, tableau campagnes (tri, filtres, export CSV, comparaison 2-5) |
| `src/app/(dashboard)/ecom/ads/campaigns/[id]/page.tsx` | Détail campagne : funnel, ad groups, ads, commandes attribuées avec méthode + confiance |
| `src/app/(dashboard)/ecom/ads/{alerts,comparison,heatmap,attribution/audit}/page.tsx` | Pages annexes |
| `src/components/ecom/ads/` (11 composants) | `AdsKpiGrid`, `CampaignsTable`, `SpendRevenueChart` (Recharts), `TopCampaignsList`, `AdsStatusBadges`, `AdsAlertsPanel`, `CampaignStatusBadge`, `CampaignFunnel`, `AdsHeatmap`, `PeriodSelector`, `InsightsBar` |
| Réutilisables tels quels pour une vue unifiée | `AdsKpiGrid`, `SpendRevenueChart`, `PeriodSelector`, `CampaignStatusBadge`, `CampaignFunnel`, `KpiCard`, `RevenueTimeline`, `TopProductsTable` |
| À généraliser | `CampaignsTable` → `DataTable` générique (colonnes configurables) ; `TopCampaignsList` → `TopItemsList` |

**Aucune UI n'existe au grain produit ou visuel/pin** (le détail campagne liste les ads mais sans spend/revenue par ad).

---

## 4. Les manques précis pour la vue unifiée produit / campagne / visuel (Pinterest + Google)

### M1 — Lien commande ↔ ad/pin (le maillon le plus critique côté Pinterest)
- L'attribution s'arrête au grain campagne. `utm_content` est extrait et stocké dans `order_attribution_touches` mais jamais comparé aux `pinterest_ads.pinterest_ad_id`.
- Action : configurer le tracking template Pinterest pour injecter l'ID de l'ad (ex. `utm_content={adid}` — macro disponible côté Pinterest Ads), puis étendre `matchOrderToCampaign()` avec une heuristique `utm_content_exact` → ad_id. La dépense par ad est déjà en base ; le ROAS par ad (et donc par pin via `pin_id`) devient calculable.
- Alternative/complément : répartition proportionnelle du revenue campagne sur ses ads au prorata du spend (approximation, confiance faible — à étiqueter comme telle).

### M2 — Persistance du ROAS par créatif
- `ad_creative_performance_daily` (084) est prête mais orpheline : ni colonnes revenue Shopify (`shopify_attributable_order_ids`, `shopify_revenue_cents`), ni code d'écriture.
- Action : soit étendre cette table avec les colonnes revenue et l'alimenter depuis le roas-engine, soit la remplacer (les métriques ad-level Pinterest vivent déjà dans `pinterest_metrics_daily`).

### M3 — Line items relationnels (pour le ROAS produit)
- `shopify_orders.line_items` est un JSONB opaque ; `product_id` y est un texte Shopify sans FK vers `shopify_products`.
- Action : créer une table `shopify_order_line_items` (ou une vue matérialisée) déstructurant le JSONB, puis répartir le revenue attribué d'une commande sur ses lignes. Définir la règle de répartition de la dépense (par campagne→produits promus, ou au prorata du revenue).

### M4 — Google Ads : intégration à construire entièrement
- Existant : OAuth (`src/lib/oauth/google.ts`, scope `https://www.googleapis.com/auth/adwords`), gestion de tokens, provider `google_ads` dans les types/CHECK constraints, stubs dans matcher/roas-engine.
- Manquant : client API Google Ads (zéro dépendance npm), tables `google_ads_campaigns` / `google_ads_metrics_daily` (+ ad groups / ads pour le grain créatif), sync + cron, branchement des stubs. Blocker externe rappelé dans le brief : **dev token Google Ads en attente**.
- Pour le grain visuel côté Google : les métriques par annonce/asset existent dans l'API (reports `ad_group_ad` / asset) — à prévoir dès la conception des tables.

### M5 — Câblage des moteurs V3
- Les 5 modèles MTA, le Profit Engine, les cohortes LTV et le détecteur d'anomalies sont des fonctions pures testées, sans aucun point d'entrée (route, cron, UI). Les tables 087-092 sont vides de tout usage.
- Action : décider si la vue unifiée s'appuie sur le pipeline V2 (matcher heuristique, éprouvé) ou sur le pipeline V3 (multi-modèles, plus riche mais à câbler : ingestion `pixel_events`, écriture `attribution_results`, recalculs planifiés). Les deux coexistent sans se parler aujourd'hui.

### M6 — Pixel first-party non raccordé
- `pixel_events` (088) prévoit `session_id`, `utm_*`, `email_hash`, `product_id` — exactement ce qu'il faut pour relier session → produit vu → commande — mais aucun code d'ingestion (script pixel, endpoint de collecte) ni de réconciliation `email_hash` ↔ `shopify_customers` n'existe dans `src/`.

---

## 5. Recommandation de séquencement

**Principe : data d'abord, UI ensuite. Et Pinterest d'abord, Google ensuite** (le grain visuel Pinterest est à un seul maillon d'être débloqué, alors que Google part de zéro et reste suspendu au dev token).

1. **ROAS par visuel Pinterest (gain rapide, le plus proche du but)**
   a. Activer un tracking template Pinterest injectant l'ID d'ad dans `utm_content`.
   b. Ajouter l'heuristique `utm_content_exact` dans `matcher.ts` (ad_id → ad → pin).
   c. Persister le revenue par ad (extension de `ad_creative_performance_daily` ou nouvelle agrégation) ; la dépense est déjà dans `pinterest_metrics_daily`.
   d. Limite à documenter : seules les commandes postérieures à l'activation du template seront attribuables au grain ad.
2. **ROAS par produit**
   a. Déstructurer `line_items` (table ou vue matérialisée `shopify_order_line_items`).
   b. Répartir le revenue attribué commande→campagne sur les lignes produits ; croiser avec `product_costs` (090) si le Profit Engine est câblé.
3. **Vue unifiée — UI**
   - Réutiliser `AdsKpiGrid`, `SpendRevenueChart`, `PeriodSelector`, `CampaignFunnel` tels quels ; généraliser `CampaignsTable` en `DataTable` à colonnes configurables avec onglets Produit / Campagne / Visuel et filtre par source. L'architecture API (`/api/ecom/ads/*`) se prête à l'ajout de routes `products` et `creatives` symétriques.
4. **Google Ads (dès le dev token obtenu)**
   - Répliquer le pattern Pinterest : tables `google_ads_*` calquées sur 079, client + sync + cron, branchement des stubs existants de `matcher.ts` / `roas-engine.ts` (ils attendent exactement ces tables). Prévoir le grain annonce/asset dès le schéma.
5. **Décision d'architecture V2 vs V3 (transverse, à trancher tôt)**
   - Option A : continuer sur le pipeline V2 et enrichir son grain (chemin le plus court vers la vue unifiée).
   - Option B : câbler le pipeline V3 (pixel + `attribution_results` multi-modèles) et y migrer le ROAS — plus puissant (5 modèles, multi-touch réel par session) mais représente un chantier d'ingestion complet (script pixel, endpoint de collecte, jobs de recalcul).
   - Recommandation : A pour livrer la vue unifiée, en gardant B comme évolution — les moteurs V3 étant purs, ils pourront consommer plus tard les mêmes touchpoints sans réécriture.

---

## 6. Limites de l'audit

- Audit statique du code et des migrations uniquement : l'état réel des données en production (tables V3 réellement vides, volumes de `pinterest_metrics_daily`) n'a pas été vérifié en base, conformément aux règles du brief.
- La disponibilité de la macro d'ID d'annonce dans le tracking template Pinterest (M1) est à confirmer dans la documentation Pinterest Ads au moment de l'implémentation.
- `lead_attribution_touches` (flux leads via `POST /api/public/attribution`) est un système distinct du flux e-commerce ; il n'a pas été audité en profondeur.
