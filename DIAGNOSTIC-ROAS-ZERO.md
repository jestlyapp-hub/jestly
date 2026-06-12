# DIAGNOSTIC — Revenue attribué à 0 dans Jestly malgré des ventes Pinterest réelles

> Diagnostic mené le 2026-06-12 sur la base de production (lecture seule + relance contrôlée du moteur),
> branche `feature/roas-visuel-pinterest`. Données client anonymisées (derniers chiffres des IDs uniquement).

---

## 1. Cause racine

**Deux causes cumulées, toutes deux confirmées sur la vraie donnée :**

1. **Bug de code (bloquant, corrigé)** — `loadOrdersInWindow()` dans `src/lib/ads/roas-engine.ts` sélectionnait les colonnes `utm_content` et `utm_term` qui **n'existent pas** dans `shopify_orders` (le schéma 072 n'a que `utm_source/medium/campaign`, aucune migration ne les a ajoutées). PostgREST renvoyait l'erreur `42703 — column shopify_orders.utm_content does not exist`, et le code ne vérifiait pas `error` : le moteur tournait donc avec **0 commande**, écrivait spend + revenue 0 sur toutes les campagnes, sans aucune trace d'erreur. Erreur reproduite à l'identique en rejouant la requête exacte sur la base.
2. **Cause structurelle (à trancher)** — le recompute ne tournait **plus du tout** depuis le 25 mai 06:41 : `campaign_performance_daily` et `order_attribution_touches` étaient gelées à cette date pour les deux comptes. Le cron `/api/cron/refresh-campaign-performance` (vercel.json, `30 */6 * * *`) n'existe que sur la branche `feature/v3-ecom-platform` — **`origin/main` est figé au 25 avril** (commit `61bff50`), sans le module ads ni ces crons. Les crons Vercel ne s'exécutant que sur le déploiement de production, ils n'ont jamais tourné. Les données sources restaient à jour uniquement grâce aux syncs manuels déclenchés par l'UI (`DashboardHeader` → `POST /api/ecom/sync`, `IntegrationsTab` → `POST /api/integrations/pinterest/sync`), d'où le paradoxe « dépense OK, revenue 0 ».

Le « 132,16 € de dépense » affiché correspondait aux lignes figées du 13-25 mai du compte actif — vestiges du dernier run du 25 mai, qui pour ce compte n'avait rien matché.

**Hors de cause** : les UTM Pinterest (parfaites en base), le matcher (testé unitairement sur la vente réelle : match exact, confiance 0.98), la fenêtre d'attribution, et le pixel Pinterest.

---

## 2. Chiffres à l'appui

### Q1 — Les commandes sont bien là
- 12 commandes `shopify_orders` sur 30 j (10 sur l'intégration active `64c5d368…`, 2 anciennes sur l'intégration du premier compte `d75938b0…` — le même shop est connecté sur **deux comptes Jestly**, `ef7a948f…` créé le 24/05 et `b13177ae…` créé le 25/05, le second étant le compte utilisé).
- Dernière synchro : aujourd'hui 18:28 UTC. Le sync fonctionne.

### Q2 — Les UTM sont bons (l'hypothèse « dernier clic non direct » est écartée)
Sur 12 commandes : 7 avec UTM renseignés, dont **5 Pinterest** :

| Commande | Date | Total | utm_source | utm_campaign |
|---|---|---|---|---|
| …306964 | 06/06 | 47,95 € | `Pinterest` | `626758420271` |
| …694164 | 06/06 | 61,95 € | `Pinterest` | `626758498604` |
| …319188 | 30/05 | 71,95 € | `Pinterest` | `626758586803` |
| …664276 | 23/05 | 71,95 € | `Pinterest` | `626758586803` |
| (+1 doublon ancien compte) | | | | |

Les deux ventes citées dans le symptôme (61,95 € et 47,95 €) sont les commandes du 6 juin, avec `utm_campaign` = **ID numérique exact** des campagnes présentes dans `pinterest_campaigns` (Q5 : aucun mismatch de format). 2 commandes Google (`utm_campaign="Google Shopping"` — non matchables, Google Ads non intégré), 5 sans aucun UTM (direct).

### Q3/Q4 — Le moteur n'écrivait plus
- `order_attribution_touches` : 2 lignes au total avant le diagnostic, datées du **25 mai 06:10** (1 `utm_campaign_exact`, 1 `unmatched`).
- `campaign_performance_daily` : `computed_at` max = **25 mai 06:41** ; pour le compte actif : 20 lignes, spend 132,16 €, 0 commande, 0 revenue.
- Requête exacte de `loadOrdersInWindow` rejouée le 12 juin : **erreur 42703** (preuve directe de la cause n°1).

### Q5 — Correspondance campagnes : OK
`utm_campaign` des commandes = `pinterest_campaign_id` exact (string égalité stricte). Les campagnes existent sous les deux intégrations Pinterest. Spend synchronisé jusqu'au 12 juin (`pinterest_metrics_daily`, 754 lignes/30 j sur l'intégration active).

### Q6 — Fenêtre : sans objet
`ecom_settings` est **vide** → defaults (fenêtre 7 j, seuils 2.0/1.5). Les ventes du 6 juin sont à J-6 du clic au pire : dans la fenêtre.

---

## 3. Correction appliquée (fix trivial autorisé) et vérification

**Commit `9253d92`** sur `feature/roas-visuel-pinterest` :
- retrait de `utm_content, utm_term` du select de `loadOrdersInWindow` (les champs restent à `null` dans l'objet, l'heuristique visuels reste en sommeil jusqu'à la migration dédiée) ;
- ajout du **check d'erreur** sur la requête (log `roas_load_orders_failed` + retour vide explicite) ;
- ajout de 2 logs de comptage (`roas_orders_loaded`, `roas_orders_matched`) pour rendre ce type de panne visible à l'avenir.

**Relance contrôlée du moteur** (autorisée par le brief) pour le compte actif, résultat vérifié en base :
- `roas_orders_loaded: 7` (fenêtre de matching 29/05 → 12/06), `roas_orders_matched: 3`.
- Touches écrites : …306964 et …694164 en `utm_campaign_exact` (poids 1.0) ; …962836 (Google) et …671252 (direct) en `unmatched` — comportement attendu.
- `campaign_performance_daily` du 06/06, campagne « Conversions 2026-05-10 » : 1 commande, **61,95 € de revenue, ROAS réel 5.78**.

Le dashboard `/ecom/ads` affichera désormais du revenue attribué dès le prochain chargement (et le restera **si** le recompute est planifié — voir n°4.1).

---

## 4. Corrections restantes à valider (non appliquées)

### 4.1 Activer le recompute automatique (cause n°2 — décision de déploiement)
Aucun cron Ads ne tourne tant que la branche n'est pas en production. Options : merger `feature/v3-ecom-platform`/`feature/roas-visuel-pinterest` vers `main`, ou changer la « production branch » du projet Vercel. Sans ça, le revenue se fige à chaque fois jusqu'au prochain clic sur « Actualiser ». **Décision de déploiement → feu vert nécessaire.**

### 4.2 Vente perdue quand la campagne n'a pas de spend le jour J (bug secondaire découvert)
L'agrégation (étape 4 du moteur) n'écrit une ligne que pour les couples (campagne, jour) **présents dans les metrics Ads**. La vente …306964 (47,95 €, campagne « Conversions 2026-05-01 ») est bien attribuée dans les touches mais **n'apparaît pas** au tableau : sa campagne n'a pas dépensé le 6 juin, donc pas de ligne metrics ce jour-là → revenue ignoré. C'est pour cela que Shopify dit « 2 ventes Pinterest » et que le tableau n'en montre qu'une. Correction proposée : créer aussi les lignes (campagne, jour) issues des commandes matchées même sans metrics (spend 0). Changement de logique → **à valider**.

### 4.3 Migration `utm_content`/`utm_term` (prérequis du ROAS par visuel)
Ajouter les colonnes à `shopify_orders` (migration 094) **et** les remplir dans le sync (`src/lib/shopify/sync.ts` lit déjà `customerJourneySummary.firstVisit.utmParameters` qui expose `content`/`term` — 2 lignes à ajouter), puis réintégrer les colonnes dans le select du moteur. Sans ça, l'heuristique `utm_content_exact` du chantier visuels ne s'activera jamais. Schéma → **à valider**.

### 4.4 Appliquer la migration 093
Non appliquée pendant ce diagnostic (interdit par le brief) : les upserts du grain ad échouent proprement dans les logs (`ad_roas_upsert_failed: column attribution_confidence does not exist`) sans affecter le grain campagne. À appliquer avec le déploiement du chantier visuels.

### 4.5 Hygiène : doublon de comptes
Le premier compte (`ef7a948f…`, intégrations du 24/05, données figées au 25/05) duplique le shop et le compte Pinterest du compte actif. À archiver/désactiver pour éviter les doubles lignes et la confusion dans les diagnostics futurs.

### 4.6 `ecom_settings` vide
Fonctionne sur les defaults — créer la ligne à la première visite des réglages serait plus propre (mineur).
