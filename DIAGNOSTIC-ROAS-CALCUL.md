# DIAGNOSTIC — Le ROAS calculé diverge de Shopify (5,78 vs 1,14) : grain jour vs fenêtre

> Diagnostic mené le 2026-06-12 (lecture seule, base de production + code de la branche `feature/roas-visuel-pinterest`).
> Aucune correction appliquée. Suite de `DIAGNOSTIC-ROAS-ZERO.md`.

---

## 1. Cause exacte (une phrase)

**Le `real_roas` stocké dans `campaign_performance_daily` rapproche le revenue des commandes du jour J avec le spend de ce seul jour J — alors qu'une vente provient des clics/dépenses des jours précédents — et ce ROAS journalier contamine les statuts de rentabilité affichés partout (le tableau agrège les statuts en « pire des jours ») ; en revanche, le chiffre ROAS affiché dans le tableau et les KPIs est déjà calculé en SUM(revenue)/SUM(spend) sur la période, ce qui est la bonne méthode.**

L'hypothèse du brief est confirmée, avec une précision : le 5,78 vit dans la **ligne journalière** (en base, dans la courbe timeline, et dans le rapport de diagnostic précédent qui l'a cité) — le tableau campagnes affiche, lui, ~1,03 sur 7 j pour cette campagne. Le dégât le plus visible du grain jour n'est pas le chiffre ROAS du tableau mais le **badge « Perte »** et les compteurs de statuts.

---

## 2. Calcul reconstitué (vente de 61,95 €, campagne « Conversions | 2026-05-10 », id …498604)

Spend réel de la campagne (lecture `pinterest_metrics_daily`, `entity_type='campaign'`) :

| Fenêtre | Spend | ROAS = 61,95 € / spend |
|---|---|---|
| **Le 6 juin seul** (jour de la commande) | **10,71 €** | **5,78** ← le chiffre Jestly (ligne daily : `61,95 / 10,71 = 5,784`) |
| Fenêtre d'attribution Jestly (31 mai → 6 juin, 7 j avant commande) | 44,71 € | **1,39** ← le « bon » ROAS au sens fenêtre d'attribution |
| Période dashboard 7 j (5 → 12 juin) | 60,45 € | 1,02 ← ce que le tableau affiche réellement (avec la même vente) |
| Durée de vie (22 mai → 11 juin) | 123,52 € | 0,50 |

- Le **5,78 = 61,95 / 10,71** : confirmé au centime près (`shopify_revenue_cents 6195 / ads_spend_cents 1071`).
- Le **1,14 de Shopify** (dénominateur 54,45 €) n'a pas pu être reproduit exactement (la fenêtre de consultation Shopify et son périmètre de coût ne sont pas connus), mais il correspond à un spend **multi-jours** (entre la fenêtre 7 j ≈ 44,71 € et la période courante ≈ 60,45 €), pas au spend d'un seul jour. L'ordre de grandeur cohérent est ~1,0-1,4 : l'écart 5,78 ↔ 1,14 est donc entièrement expliqué par le dénominateur jour-seul ; l'écart résiduel 1,39 ↔ 1,14 est une divergence normale de modèle/fenêtre.

**Contre-exemple symétrique découvert (preuve que la période courte trompe aussi dans l'autre sens)** — campagne « Conversions | 2026-05-01 » (…420271), vente de 47,95 € le 6 juin :
- spend le 6 juin : 0 € (ligne synthétique de la correction 2) ; spend sur la période dashboard 7 j : 4,20 € (uniquement les 11-12 juin).
- ROAS « 7 j » du tableau : **47,95 / 4,20 = 11,4** — énorme et trompeur : la vente vient de dépenses antérieures à la période, le spend récent n'a encore rien produit. Sur 30 j : 47,95 / 42,85 = **1,12**, cohérent avec Shopify.

---

## 3. Où le grain est figé dans le code

| Endroit | Fichier / fonction | Effet |
|---|---|---|
| **Rattachement du revenue au jour de la commande** | `src/lib/ads/roas-engine.ts` → `aggregateRevenueByCampaignDay()` : `dayIso = order.created_at.slice(0, 10)` puis clé `campaign|jour` | Le revenue tombe sur le jour J de l'achat (pas du clic — la date de clic n'existe pas dans les données) |
| **ROAS journalier** | `roas-engine.ts`, étape 4 : `realRoas = computeRoas(revenueCents, m.spend_cents)` où `m.spend_cents` = spend du même jour | Produit le 5,78 stocké dans `campaign_performance_daily.real_roas` |
| **Statut journalier** | même bloc : `determineProfitStatus(realRoas, …)` par ligne daily | 1 jour avec spend sans vente = ligne « unprofitable » |
| **Agrégation des statuts = pire des jours** | `src/lib/ads/aggregator.ts` → `getCampaignsList()` : `profit_status` agrégé = max de sévérité des statuts daily (`unprofitable > warning > profitable > unmatched`) | La campagne A (ROAS période 1,02, fenêtre 1,39) est badgée **« Perte »** parce que 6 jours sur 7 n'ont pas de vente — mécaniquement le cas dès que la cadence d'achat est inférieure à 1/jour |
| **Compteurs de badges** | `aggregator.ts` → `getOverviewKpis()` : chaque ligne daily ajoute la campagne au set de SON statut du jour | Une même campagne peut compter dans « rentables » ET « en perte » ; les compteurs affichés sont faux |
| **Courbe ROAS** | `getTimeline()` + `SpendRevenueChart` : `roas` par jour | Courbe en dents de scie (0 partout, pic le jour d'une vente) sans valeur décisionnelle |

**Là où la méthode est déjà correcte** : `getCampaignsList()` et `getOverviewKpis()` calculent le **chiffre** ROAS en `SUM(revenue)/SUM(spend)` sur la période (pas une moyenne de ROAS journaliers) ; `getCampaignDetail()` idem ; `alerts-engine.ts` agrège SUM/SUM sur 7 j glissants. La réponse à Q2 est donc : agrégation période = somme/somme ✓.

**Q3 — la correction 2 (lignes spend 0) n'a rien aggravé** : l'agrégat de période reste SUM/SUM et la ligne synthétique y AJOUTE le revenue qui était perdu. Elle illustre simplement le grain (revenue le 6 juin, spend les 11-12 juin → ROAS journalier ininterprétable, agrégat correct). Son statut daily « profitable » ne peut pas dégrader le pire-des-jours.

---

## 4. Réponse à Q5 : qu'est-ce qui est réellement faux dans le dashboard actuel ?

| Élément affiché | État |
|---|---|
| Chiffre ROAS du tableau campagnes / KPI global / détail campagne | ✅ Méthode correcte (SUM/SUM période) — mais **instable sur 7 j** (cas campagne B : 11,4) car la période courte désynchronise spend et ventes |
| Badge statut (Rentable/Limite/Perte) par campagne | 🔴 **Faux** — pire-des-jours : quasi toute campagne avec < 1 vente/jour finit « Perte » |
| Compteurs « x rentables / y en perte » + donut | 🔴 **Faux** — une campagne compte dans plusieurs statuts |
| Top « rentables » / « à pauser » | 🔴 Contaminés (filtrent sur le statut agrégé pire-des-jours) |
| Courbe ROAS de la timeline | 🟠 Trompeuse (valeur journalière) |
| Alertes (`campaign_unprofitable`, etc.) | ✅ SUM/SUM 7 j — méthode correcte, sensible au même effet de bord de fenêtre courte |
| `real_roas` des lignes daily en base | 🔴 Ininterprétable par construction (5,78) — ne devrait jamais être montré seul |

---

## 5. Correction recommandée (NON appliquée — à valider)

Principe : **le détail journalier reste en base pour les courbes ; tout ce qui est décisionnel (chiffre mis en avant, statut, compteurs, tops) se calcule sur la période en SUM/SUM** — ce que le chiffre du tableau fait déjà.

1. **Statut agrégé recalculé depuis le ROAS de période** *(le cœur du fix, petit diff)* — dans `getCampaignsList()` : remplacer le « pire des statuts daily » par `determineProfitStatus(real_roas_agrégé, seuils)`. Dans `getOverviewKpis()` : compter chaque campagne une seule fois, selon ce même statut agrégé. Effet immédiat : la campagne A passe de « Perte » à « Limite » (1,02) sur 7 j, et les compteurs redeviennent exacts. Aucun changement de schéma ni de moteur.
2. **Garde-fou « volume faible »** — sur le range 7 j, le ROAS période peut être absurde (11,4 de la campagne B). Proposition simple : badge « données partielles » (ou statut « unmatched ») quand `spend_période < seuil` (ex. réutiliser `alert_min_spend_cents`, 50 € par défaut) ou `orders = 0`, et défaut du dashboard à 30 j. Alternative plus exacte mais plus lourde (option avancée, pas nécessaire en V1) : ROAS « fenêtre traînante » = revenue des commandes de la période / spend de `[période − attribution_window_days, période]`.
3. **Courbe ROAS lissée** — dans la timeline, remplacer le ROAS du jour par un ROAS glissant 7 j (SUM/SUM sur fenêtre mobile), ou retirer la ligne ROAS du graphe et garder spend/revenue.
4. **`real_roas` daily en base** — le conserver (historique, debug) mais le documenter comme « intensité du jour, non décisionnel » ; ne plus l'afficher tel quel. Pas de migration nécessaire.

Impact : corrections 1 à 3 = uniquement `aggregator.ts` (+ éventuellement le composant timeline) ; le moteur, la base et le schéma ne bougent pas. Les statuts stockés par jour restent inchangés.

**Séquencement avec la mise en production** : appliquer ce fix AVANT de déclencher la checklist `CHECKLIST-DEPLOIEMENT-ADS.md` (déployer le cron avec des badges « Perte » erronés pousserait à couper des campagnes saines). La checklist reste valide telle quelle.
