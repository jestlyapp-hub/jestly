# Jestly Ecom V1 — Setup

Documentation de mise en route de la section E-commerce (tour de pilotage Shopify).

---

## 1. Migrations Supabase à appliquer

Dans l'ordre, via Supabase SQL Editor ou `supabase db push` :

1. `070_enable_pgsodium.sql` — active l'extension (optionnel, non utilisée en V1)
2. `071_create_integrations_table.sql` — table multi-tenant des intégrations
3. `072_create_shopify_cache_tables.sql` — cache local (orders, products, customers, sessions, analytics)
4. `073_create_webhook_events_table.sql` — audit log des webhooks
5. `074_rls_policies_ecom.sql` — Row Level Security stricte
6. `075_sync_state_table.sql` — état de sync delta + initial

Tout est idempotent (`IF NOT EXISTS`, `IF EXISTS`). Les migrations peuvent être rejouées sans danger.

---

## 2. Variables d'environnement requises

À ajouter dans `.env.local` (dev) et Vercel env vars (prod) :

```
ENCRYPTION_MASTER_KEY=<chaîne aléatoire 32+ caractères>
CRON_SECRET=<chaîne aléatoire>
```

- `ENCRYPTION_MASTER_KEY` chiffre les access tokens Shopify (AES-256-GCM, lib/encryption.ts).
  Générer : `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
  **Ne jamais le changer** après création — les tokens existants deviendraient illisibles.
- `CRON_SECRET` protège l'endpoint `GET /api/ecom/sync` appelé par Vercel Cron.

---

## 3. Création de la Custom App Shopify (boutique Lhorlogemurale)

> Procédure à exécuter par Gabriel dans l'admin Shopify de `lhorlogemurale.myshopify.com`.

1. **Admin Shopify** → `Apps` → `Develop apps` → `Create an app`
   - Nom : `Jestly Dashboard`
   - Developer : Gabriel
2. **Configure Admin API scopes** — cocher :
   - `read_orders`, `read_all_orders`
   - `read_products`, `read_product_listings`
   - `read_customers`
   - `read_inventory`, `read_locations`
   - `read_analytics`, `read_reports`
   - `read_fulfillments`, `read_shipping`
   - `read_marketing_events`, `read_publications`
   - `read_price_rules`, `read_discounts`
   - `read_checkouts`
3. **Install app** → Confirmer
4. **API credentials** → `Reveal Admin API access token` → copier la valeur `shpat_...`
5. **Webhooks** (optionnel V1) :
   - Webhook URL : `https://jestly.fr/api/ecom/webhooks/shopify`
   - Format : JSON
   - Topics : `orders/create`, `orders/updated`, `orders/paid`, `orders/fulfilled`, `orders/cancelled`,
     `products/create`, `products/update`, `products/delete`,
     `customers/create`, `inventory_levels/update`, `app/uninstalled`
   - Webhook secret : noter la valeur pour le signing

---

## 4. Connexion initiale (Gabriel)

Une fois les migrations appliquées + env vars en place :

1. Se connecter à Jestly → onglet **E-commerce** dans la sidebar
2. Le SetupModal s'affiche → 5 étapes :
   - Intro → Domaine `lhorlogemurale.myshopify.com` → Token `shpat_...` → Webhook secret (optionnel) → Connexion
3. Vérification automatique de la connectivité Shopify (shop info via GraphQL)
4. L'initial full sync se déclenche en background (90 jours d'historique) :
   - Commandes
   - Produits
   - Clients
   - Analytics journalières (ShopifyQL)
   - Sessions journalières (ShopifyQL)
5. La barre de progression s'auto-rafraîchit toutes les 2s
6. À 100%, redirection vers le dashboard

---

## 5. Synchronisation continue

### Sync delta (automatique, toutes les 4h)
Configuré dans `vercel.json` :
```json
{ "path": "/api/ecom/sync", "schedule": "0 */4 * * *" }
```

> **Note plan Vercel Hobby** : limité à 1 cron par jour. Pour du sync plus fréquent
> (recommandé : toutes les 5 min), upgrader vers Vercel Pro ou utiliser un cron externe
> (cron-job.org, etc.) qui appelle `GET /api/ecom/sync` avec `Authorization: Bearer $CRON_SECRET`.

### Sync manuel
Dashboard → bouton **Actualiser** (top right) déclenche `POST /api/ecom/sync` immédiat.

### Webhooks (temps réel — optionnel)
Si configurés côté Shopify (voir étape 3), chaque event push une update minimaliste du cache via
`POST /api/ecom/webhooks/shopify`. Sinon le sync delta de 4h suffit.

---

## 6. Architecture

### Frontend
- `app/(dashboard)/ecom/layout.tsx` — guard : modal setup si pas d'intégration, progress bar si initial sync en cours, sinon shell normal
- `app/(dashboard)/ecom/page.tsx` — Tour de pilotage (5 KPI + revenue timeline + sources + top produits + funnel + commandes récentes + géo + alertes)
- `app/(dashboard)/ecom/orders/` — liste paginée + détail (line items, attribution, adresse)
- `app/(dashboard)/ecom/products/` — grille + détail (variantes, images, infos)
- `app/(dashboard)/ecom/customers/` — liste triée par LTV
- `app/(dashboard)/ecom/analytics/` — KPIs + revenue timeline détaillé
- `app/(dashboard)/ecom/settings/` — info intégration, resync manuel, déconnexion

### Backend
- `lib/shopify/client.ts` — client GraphQL avec retries exponential backoff sur 429/5xx
- `lib/shopify/queries.ts` — queries Admin API 2026-01 + ShopifyQL + webhook mutations
- `lib/shopify/sync.ts` — sync delta + initial pour orders/products/customers/analytics/sessions
- `lib/shopify/webhooks.ts` — verif HMAC SHA-256 + dispatch
- `lib/shopify/formatters.ts` — devises, dates, statuts FR
- `lib/encryption.ts` — AES-256-GCM côté Node pour les tokens (V1, sans pgsodium)

### API routes
- `POST /api/integrations/shopify/test` — verif connectivité (n'écrit rien)
- `POST /api/integrations/shopify/connect` — persist chiffré + déclenche initial sync
- `POST /api/integrations/shopify/disconnect` — supprime intégration + cache (CASCADE)
- `GET  /api/integrations/shopify/sync-state` — état pour le frontend
- `POST /api/ecom/sync` — sync delta manuel (user)
- `GET  /api/ecom/sync` — sync delta cron (toutes intégrations, header Bearer)
- `POST /api/ecom/webhooks/shopify` — endpoint webhooks Shopify
- `GET  /api/ecom/dashboard` — agrégats principaux (KPIs + timeline + top produits + …)
- `GET  /api/ecom/orders[/:id]` — liste + détail
- `GET  /api/ecom/products[/:id]` — liste + détail
- `GET  /api/ecom/customers` — liste
- `GET  /api/ecom/export?type=…` — CSV stream

---

## 7. Procédures opérationnelles

### Révoquer un token Shopify
1. Admin Shopify → Apps → Develop apps → Jestly Dashboard → Uninstall
2. Le webhook `app/uninstalled` (si configuré) marque automatiquement l'intégration en `status='disconnected'`
3. Sinon : page `/ecom/settings` → bouton **Déconnecter la boutique**

### Regénérer un token
1. Admin Shopify → Apps → Develop apps → Jestly Dashboard → API credentials → `Revoke` puis nouveau `Reveal token`
2. Sur Jestly → `/ecom/settings` → déconnecter → re-flow SetupModal avec le nouveau token

### Ajouter une nouvelle boutique (multi-tenant)
V1 = 1 intégration Shopify par user (contrainte UNIQUE sur `user_id + provider + shop_domain`).
Pour ajouter une 2e boutique au même user : V2 — le code est déjà multi-tenant ready côté DB.

---

## 8. STOPs / limites V1

- **V1 = read-only** sur Shopify. Aucune mutation (modif produits/commandes/clients) depuis Jestly.
- **Single integration** par user. Multi-shops = V2.
- **ShopifyQL sessions** : la décomposition par device/country/referrer n'est pas remplie en V1
  (le format GraphQL diffère selon le plan Shopify, à raffiner).
- **Analytics avancées** (cohort, heatmap, ROAS détaillé) : prévues V2, placeholder pour l'instant.
- **Edge Functions Deno** : non implémentées en V1, on utilise des API routes Next.js + Vercel Cron à la place
  (plus simple à shipper). Migration possible en V2 si scalabilité requise.

---

## 9. Token Lhorlogemurale (à remplir par Gabriel)

Voir `JESTLY_ECOM_HANDOVER.md` (gitignored). Contient le token réel, le webhook signing secret,
les dates de création, et les procédures de rotation.
