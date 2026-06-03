# Architecture · Jestly Ecommerce V3

## Vue d'ensemble

Plateforme analytics ecommerce DTC : attribution multi-touch, profit net, LTV,
AI Insights, branchée sur Shopify + régies (Pinterest, Google Ads, GA4, Klaviyo)
et un pixel propriétaire first-party.

Stack : Next.js 16 (App Router) + TypeScript strict + Tailwind 4 + Supabase
(Postgres + Auth + Storage) + Vercel. Chiffrement applicatif AES-256-GCM pour les
secrets des intégrations.

## Couches

```
UI /ecom/[storeId]/*  (dashboard, profit, attribution, ltv, insights, connectors)
        │
API /api/ecom/*       (routes scopées user_id + store_id)
        │
Moteurs métier (lib/, logique pure testée)
  ├─ lib/attribution/  5 modèles MTA + engine (répartition exacte des centimes)
  ├─ lib/profit/       calculator (marge nette) + csv-importer (COGS)
  ├─ lib/ltv/          cohorts + cac
  ├─ lib/insights/     anomaly-detector (10 règles) + generator (Claude API)
  ├─ lib/ads/          matcher, roas-engine, aggregator (V2, conservé)
  ├─ lib/shopify/      admin, sync, webhooks (V2, conservé)
  └─ lib/pinterest/    client, sync (V2, conservé)
        │
Supabase Postgres (RLS scoped user_id + store_id)
  stores · integrations · pixel_events · attribution_results
  product_costs · store_financial_settings · ltv_cohorts · ai_insights
  + tables V2 (shopify_orders, pinterest_*, campaign_performance_daily, ...)
```

## Moteurs métier (cœur différenciateur)

### Attribution multi-touch (`lib/attribution/`)
Une commande porte une timeline de touchpoints. 5 modèles répartissent 100 % du
revenu : `last_click`, `first_click`, `linear`, `time_decay` (demi-vie 7j),
`position_based` (40/20/40 en U). `distributeCents()` garantit une somme exacte
en centimes (méthode du plus grand reste). Résultats persistés dans
`attribution_results`, une ligne par (store, order, modèle) pour comparer les
modèles côte à côte.

### Profit Engine (`lib/profit/`)
`Net = Revenu - COGS - Port - Pub attribuée - Remboursements - Frais paiement
- Frais transaction`. Tout en centimes entiers. Les COGS sont saisis manuellement
ou importés par CSV (`csv-importer.ts`, parsing + validation Zod, erreurs ligne
par ligne). Les frais proviennent de `store_financial_settings`.

### LTV / cohortes (`lib/ltv/`)
Cohorte = mois de première commande du client. LTV à 30/60/90/180/365 jours
(moyenne par client), repeat rate, CAC, ratio LTV:CAC, payback en mois.

### AI Insights (`lib/insights/`)
`anomaly-detector.ts` applique 10 règles déterministes (pic de dépense, chute de
conversion, ROAS < 1x, rupture de stock diffusée, etc.). Les anomalies alimentent
le brief quotidien rédigé par Claude (vouvoiement, sans em-dash, sans mots
blacklistés). Le LLM rédige, il ne calcule pas (ADR-005).

## Multi-tenancy et sécurité

RLS Postgres sur toutes les tables, scopée `user_id` (via `stores`) ou
`store_id ∈ stores du user`. Insertions pixel via service_role (Edge Function).
Secrets des intégrations chiffrés AES-256-GCM (`lib/encryption.ts`).

## État d'avancement

Voir `CHANGELOG.md` (racine) et `docs/BLOCKED.md`. Ce commit livre les moteurs
métier purs (testés, 49 tests verts) + le schéma SQL V3 (migrations 087-092).
L'orchestration base, les connecteurs Google Ads/GA4/Klaviyo, le pixel et l'UI
sont les chantiers suivants.
