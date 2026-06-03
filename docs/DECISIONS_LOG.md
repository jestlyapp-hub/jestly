# Journal des décisions (ADR) · Jestly Ecommerce V3

Format ADR léger. Chaque entrée : contexte, décision, conséquences.

---

## ADR-001 · Numérotation des migrations V3 à partir de 087

**Contexte.** Le méga-prompt réservait 081-090 pour la V3, mais les migrations
081 à 086 sont déjà occupées par le module Ads V2 (campaign_performance_daily,
attribution_touches, ad_creative_performance, ads_alerts, lifecycle_status).

**Décision.** Les migrations V3 démarrent à **087**. Mapping :
- 087 stores (multi-boutiques)
- 088 pixel_events
- 089 attribution_results
- 090 product_costs + store_financial_settings
- 091 ltv_cohorts
- 092 ai_insights

**Conséquences.** Aucune collision avec le V2. La numérotation du méga-prompt
(082-090) est obsolète et remplacée par celle-ci.

---

## ADR-002 · Refactor multi-store additif, jamais big-bang

**Contexte.** Le V2 fonctionne en mono-store (table `integrations` scopée par
`user_id`). Le garde-fou 2.3 impose la non-régression.

**Décision.** La colonne `integrations.store_id` est **NULLABLE** avec backfill
d'une "Boutique principale" par utilisateur, et non `NOT NULL` immédiat. Le code
V2 continue de tourner pendant la transition ; le passage en `NOT NULL` sera fait
dans une migration ultérieure une fois tout le code lecteur migré.

**Conséquences.** Migration idempotente et réversible. Pas de fenêtre de casse.

---

## ADR-003 · Moteurs métier en logique pure, séparés des accès base

**Contexte.** Cible de couverture ≥ 95 % sur les modules critiques (attribution,
profit, LTV, anomalies). Ces modules sont difficiles à tester s'ils sont couplés
à Supabase.

**Décision.** Chaque moteur est une fonction **pure** dans `src/lib/<domaine>/` :
- `lib/attribution/` : 5 modèles + engine (répartition exacte des centimes)
- `lib/profit/` : calculator + csv-importer
- `lib/ltv/` : cohorts + cac
- `lib/insights/` : anomaly-detector (10 règles)

L'orchestration base (chargement orders, upsert résultats) reste une couche fine
au-dessus, testée séparément avec des mocks. Les fonctions pures sont couvertes à
100 % par 49 tests Vitest.

**Conséquences.** Tests rapides (< 20 ms), déterministes, sans accès réseau. Le
cœur différenciateur du produit est validé indépendamment de l'infrastructure.

---

## ADR-004 · Répartition des centimes par plus grand reste

**Contexte.** L'attribution multi-touch répartit le revenu d'une commande sur N
touchpoints selon des poids fractionnaires. Un arrondi naïf perd ou crée des
centimes (la somme ne vaut plus le total commande).

**Décision.** `distributeCents()` utilise la méthode du **plus grand reste** :
floor de chaque part, puis distribution du reliquat aux plus grandes parties
fractionnaires. Garantie testée : `sum(attributed_cents) === order_total_cents`.

**Conséquences.** Aucune fuite de centimes, agrégats par canal exacts.

---

## ADR-005 · Détection d'anomalies rules-based avant l'appel Claude

**Contexte.** Les AI Insights combinent un brief rédigé (Claude API) et des
anomalies. Faire détecter les anomalies par le LLM serait coûteux et non
déterministe.

**Décision.** Les 10 règles d'anomalies sont implémentées en TypeScript pur
(`anomaly-detector.ts`). Le résultat est injecté dans le prompt Claude pour la
rédaction. Le LLM rédige, il ne calcule pas.

**Conséquences.** Détection déterministe et testable. L'appel Claude (et donc la
clé `ANTHROPIC_API_KEY`) n'est requis que pour la mise en forme, pas pour la
logique métier.
