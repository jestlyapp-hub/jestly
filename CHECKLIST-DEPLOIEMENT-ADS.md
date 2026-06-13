# CHECKLIST — Mise en production du module Ads + crons (correction n°1 du diagnostic ROAS)

> Préparée le 2026-06-12, mise à jour après le fix complet du calcul ROAS (commits `60de38f`, `5bf27d0`, `a355a43`).
> **Rien n'a été mergé ni déployé** : chaque étape ci-dessous est à déclencher par Gabriel.
> Objectif : que le cron `refresh-campaign-performance` tourne enfin en production, pour que le revenue attribué ne se refige plus.
>
> ✅ **Le pré-requis « ne pas déployer avant le fix du calcul » est levé** : les statuts découlent désormais du ROAS
> de période (plus de badges « Perte » erronés issus du grain journalier), le garde-fou « données partielles » neutralise
> les ROAS trompeurs à faible volume, et la courbe est lissée sur 7 jours glissants. Vérifié sur les données réelles
> (campagnes du diagnostic) + 386 tests verts + build OK. Déployer est désormais sûr : le cron recalculera des chiffres
> ET des statuts cohérents.

---

## État vérifié (préparation faite)

| Point | État |
|---|---|
| Branche à merger | `feature/roas-visuel-pinterest` (inclut `feature/v3-ecom-platform` + corrections ROAS). Poussée sur origin. |
| Conflits avec `main` | **Aucun** — merge à blanc vérifié (`git merge-tree origin/main feature/roas-visuel-pinterest` → arbre propre). `main` est strictement en retard (figé au 25/04, commit `61bff50`), la branche en descend. |
| Crons dans `vercel.json` (branche) | 4 crons : `notifications` (8 h), `/api/ecom/sync` (toutes les 4 h), `/api/cron/pinterest-sync` (toutes les 6 h), `/api/cron/refresh-campaign-performance` (`30 */6 * * *`) → appelle bien `refreshUserCampaignPerformance()` pour tous les users avec intégration Ads active, auth Bearer `CRON_SECRET`. |
| Migrations 067 → 092 | **Déjà appliquées en base de prod** (vérifié table par table le 12/06). Rien à rejouer. |
| Migration 093 | Présente en fichier, **non appliquée** (colonnes revenue de `ad_creative_performance_daily`). Sans elle : le ROAS campagne fonctionne, le grain visuel logge des erreurs bénignes (`ad_roas_upsert_failed`). À appliquer idéalement au déploiement. |
| Migration 094 (`utm_content`/`utm_term` sur `shopify_orders`) | **N'existe pas encore** (ni fichier ni base) — prévue au chantier « ROAS par visuel ». |
| Moteur ROAS | Corrigé et vérifié sur données réelles (commits `9253d92`, `761aca7`) : les 2 ventes Pinterest du 6 juin apparaissent (109,90 € au total). |
| Calcul/affichage ROAS | Fix complet appliqué (commits `60de38f` statuts période + garde-fou, `5bf27d0` courbe lissée, `a355a43` export) — cf `DIAGNOSTIC-ROAS-CALCUL.md`. Défaut 30 j : déjà en place (aucun changement requis). |
| Compte doublon | Intégrations du compte `ef7a948f…` archivées (`status='paused'`, réversible) : le cron ne traitera que le compte actif. |

⚠️ À savoir : merger cette branche met en prod **tout le travail depuis le 25 avril** (module e-commerce complet, audit CRO, onboarding v3, etc.), pas seulement le module Ads. C'est le chemin recommandé (main figé n'a plus de valeur), mais le déploiement est large : prévois un coup d'œil rapide sur les pages principales après mise en ligne.

---

## Étapes à exécuter (dans l'ordre)

### 1. Variables d'environnement Vercel (Production)
Dans **Vercel → Projet → Settings → Environment Variables**, vérifier que ces variables existent pour l'environnement **Production** (elles existent en local dans `.env.local`) :

- `CRON_SECRET` ← **indispensable** : Vercel envoie ce Bearer aux routes cron ; sans lui, 401 silencieux.
- `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ENCRYPTION_KEY` (tokens OAuth chiffrés)
- `JESTLY_PINTEREST_APP_ID`, `JESTLY_PINTEREST_APP_SECRET`, `JESTLY_PINTEREST_REDIRECT_URI`
  - ⚠️ la redirect URI de prod (`https://jestly.fr/api/integrations/pinterest/oauth/callback` ou équivalent) doit aussi être déclarée dans l'app Pinterest Developers.
- `DATABASE_PASSWORD` (routes leads/calendar), `RESEND_API_KEY` (notifications), `NEXT_PUBLIC_BASE_DOMAIN`
- Pour l'audit CRO embarqué dans la branche : `ANTHROPIC_API_KEY`, `FIRECRAWL_API_KEY` (+ limites `AUDIT_*`), sinon la page audit échouera proprement.

### 2. Appliquer la migration 093 (2 min, sans risque)
Supabase → **SQL Editor** → coller le contenu de `supabase/migrations/093_ad_creative_revenue_columns.sql` → Run.
(Uniquement des `ADD COLUMN IF NOT EXISTS` + 1 index : aucune donnée touchée, réversible.)

### 3. Merger et déployer
1. Ouvrir la PR : https://github.com/jestlyapp-hub/jestly/pull/new/feature/roas-visuel-pinterest (base `main`).
2. Merger (aucun conflit attendu).
3. Vercel déploie `main` automatiquement → vérifier que le déploiement passe au vert.

*(Alternative non recommandée : changer la « Production Branch » dans Vercel → Settings → Git vers la branche feature. Ça active les crons sans merge, mais laisse main mort et complique la suite.)*

### 4. Vérifier les crons
1. Vercel → Projet → **Settings → Cron Jobs** : les 4 crons doivent être listés après le déploiement.
2. Test manuel immédiat (sans attendre le prochain créneau `30 */6`) :
   ```
   curl -H "Authorization: Bearer <CRON_SECRET>" https://jestly.fr/api/cron/refresh-campaign-performance
   ```
   Réponse attendue : `{"ok":true,"users_processed":1,...}` (1 user depuis l'archivage du compte doublon).
3. Dans `/ecom/ads` : la date « MAJ » et le revenue doivent être à jour ; en base, `campaign_performance_daily.computed_at` doit être récent.
4. Le lendemain : vérifier qu'un run automatique a bien eu lieu (computed_at autour de 00:30/06:30/12:30/18:30 UTC).

---

## Option (non implémentée) : fallback « recompute on-load »

Pour ne pas dépendre du seul cron : au chargement de `/ecom/ads`, si `max(computed_at)` du user a plus de X heures (ex. 8 h), déclencher `refreshUserCampaignPerformance` en tâche de fond (fire-and-forget côté route `overview`). Avantage : autoréparation si un cron saute. Inconvénient : latence ajoutée au premier chargement et recomputes concurrents possibles (à protéger par un verrou simple). À demander si souhaité — non inclus dans ce chantier.
