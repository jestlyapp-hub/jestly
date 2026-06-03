# Changelog · Jestly Ecommerce

## [V3 · en cours] — branche `feature/v3-ecom-platform`

### Ajouté — Moteurs métier (logique pure, 49 tests verts)
- **Attribution multi-touch** (`lib/attribution/`) : 5 modèles (last_click,
  first_click, linear, time_decay, position_based) + engine avec répartition
  exacte des centimes (méthode du plus grand reste).
- **Profit Engine** (`lib/profit/`) : calcul de marge nette complète
  (revenu, COGS, port, pub, remboursements, frais paiement/transaction) +
  importateur CSV des COGS (validation Zod, erreurs ligne par ligne).
- **LTV / cohortes** (`lib/ltv/`) : cohortes mensuelles, LTV 30/60/90/180/365j,
  repeat rate, CAC, ratio LTV:CAC, payback.
- **Détecteur d'anomalies** (`lib/insights/`) : 10 règles rules-based
  déterministes alimentant les AI Insights.

### Ajouté — Schéma V3 (migrations idempotentes 087-092)
- 087 `stores` (multi-boutiques) + `integrations.store_id` (nullable, backfill).
- 088 `pixel_events` (Jestly Pixel, RLS, email/IP hachés).
- 089 `attribution_results` (1 ligne par store/order/modèle).
- 090 `product_costs` + `store_financial_settings`.
- 091 `ltv_cohorts`.
- 092 `ai_insights`.

### Documentation
- `docs/ARCHITECTURE.md`, `docs/DECISIONS_LOG.md` (5 ADR), `docs/BLOCKED.md`.

### Non régressé
- Module Ads V2 et ses 53 tests intacts. Migrations additives, aucun big-bang.

### Reporté (voir docs/BLOCKED.md)
- Connecteurs Google Ads (dev token en attente), GA4, Klaviyo.
- Jestly Pixel (Edge Function + domaine pixel.jestly.fr).
- Génération du brief Claude (logique d'anomalies déjà livrée).
- UI /ecom/[storeId]/* (profit, attribution, ltv, insights), store switcher.
