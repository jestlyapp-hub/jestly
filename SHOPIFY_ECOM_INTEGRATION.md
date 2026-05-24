# Shopify ↔ Jestly `/ecom` — Brief d'intégration (passation)

> **Pour le prochain agent / Claude qui développe l'app Jestly.**
> Ce doc explique l'état réel de l'intégration Shopify de la boutique **L'Horloge Murale**, les pièges rencontrés, et ce qu'il reste à construire. **Aucun secret ici** — les credentials sont dans `.env.local` (gitignored). Voir aussi `JESTLY_ECOM_HANDOVER.md` (gitignored) pour les valeurs en clair.

---

## TL;DR

- L'intégration **fonctionne** : on peut lire orders/products/shop de la boutique de prod via l'Admin GraphQL API.
- **Il n'y a PAS de token `shpat_` permanent.** Shopify a retiré les custom apps héritées. On utilise le **client credentials grant** : on stocke `client_id` + `client_secret`, et on **génère un token de 24 h à la demande**.
- Les creds sont dans `.env.local` (`SHOPIFY_LHORLOGEMURALE_*`). **Rien n'est encore persisté en base** (décision : différé en V1).
- Reste à coder : le **helper de mint+cache du token**, la **route webhooks**, et (plus tard) la **ligne Supabase `integrations`**.

---

## 1. Le modèle d'auth (à comprendre avant tout)

La boutique est sur le **nouveau Dev Dashboard** de Shopify (dev.shopify.com). L'app `Jestly Dashboard` y est créée (version **V2** active, 16 scopes read-only, managed install).

**Flux = client credentials grant** ([doc](https://shopify.dev/docs/apps/build/dev-dashboard/get-api-access-tokens)) :

```bash
POST https://0crvzb-fn.myshopify.com/admin/oauth/access_token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
client_id=$SHOPIFY_LHORLOGEMURALE_CLIENT_ID
client_secret=$SHOPIFY_LHORLOGEMURALE_CLIENT_SECRET
```

Réponse : `{ "access_token": "shpat_…", "scope": "read_orders,…", "expires_in": 86399 }`

- Le token vaut **24 h**. Pas de refresh token → on **re-POST** la même requête pour en obtenir un nouveau.
- Header pour les appels API : `X-Shopify-Access-Token: <access_token>`.
- Endpoint GraphQL : `https://0crvzb-fn.myshopify.com/admin/api/2025-01/graphql.json`.

### Variables d'env (déjà dans `.env.local`)
```
SHOPIFY_LHORLOGEMURALE_SHOP_DOMAIN=0crvzb-fn.myshopify.com
SHOPIFY_LHORLOGEMURALE_CLIENT_ID=<hex 32>
SHOPIFY_LHORLOGEMURALE_CLIENT_SECRET=shpss_…
SHOPIFY_LHORLOGEMURALE_API_VERSION=2025-01
SHOPIFY_LHORLOGEMURALE_WEBHOOK_SECRET=shpss_…   # == client secret
```

---

## 2. Pièges rencontrés (pour ne pas les revivre)

| Piège | Réalité |
|---|---|
| « Je vais récupérer un `shpat_` dans l'admin » | ❌ Retiré sur cette boutique. Dev Dashboard uniquement. |
| Le token `atkn_…` du Dev Dashboard | ❌ C'est un **jeton CI/CD** (« automatisation d'appli »). Il **401** sur l'Admin API. Ne pas l'utiliser pour les données. |
| Scopes définis dans la version | ⚠️ Pas suffisant. Après `Release`, il faut **ré-approuver l'install** (sinon `access_scopes:[]` et `ACCESS_DENIED`). |
| `pgsodium` pour chiffrer en base | ❌ **Déprécié par Supabase** + migrations 070/071 **jamais appliquées**. Voir §5. |
| Le secret durable | C'est le **client_secret** (`shpss_`), PAS le token (qui est éphémère). |
| Webhook HMAC secret | = le **client_secret** (pour une app Dev Dashboard). |

---

## 3. À CODER : helper token (mint + cache 24 h)

Suggestion : `src/lib/shopify/lhorlogemurale.ts`

```ts
// Mint + cache d'un access token client_credentials (TTL 24h).
type Cached = { token: string; exp: number };
let cache: Cached | null = null;

const SHOP = process.env.SHOPIFY_LHORLOGEMURALE_SHOP_DOMAIN!;
const API_VERSION = process.env.SHOPIFY_LHORLOGEMURALE_API_VERSION ?? "2025-01";

async function getToken(): Promise<string> {
  if (cache && Date.now() < cache.exp) return cache.token;
  const res = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SHOPIFY_LHORLOGEMURALE_CLIENT_ID!,
      client_secret: process.env.SHOPIFY_LHORLOGEMURALE_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) throw new Error(`Shopify token grant failed: ${res.status} ${await res.text()}`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  // marge de sécurité 5 min
  cache = { token: j.access_token, exp: Date.now() + (j.expires_in - 300) * 1000 };
  return j.access_token;
}

export async function shopifyAdmin<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await res.json();
  if (j.errors) throw new Error(`Shopify GraphQL error: ${JSON.stringify(j.errors)}`);
  return j.data as T;
}
```
> ⚠️ Le cache module-level est par-instance serverless (OK pour démarrer). Pour mutualiser entre instances, cacher le token dans Redis/Supabase avec son `exp`.

---

## 4. Scopes accordés (16, read-only)

`read_orders, read_all_orders, read_products, read_product_listings, read_customers, read_inventory, read_locations, read_analytics, read_reports, read_fulfillments, read_shipping, read_marketing_events, read_publications, read_price_rules, read_discounts, read_checkouts`

Pour modifier les scopes plus tard : Dev Dashboard → app → **Versions → Nouvelle version** → éditer scopes → **Release** → **ré-approuver l'install** (Aperçu → Installer l'application → approuver).

---

## 5. Persistance Supabase (`integrations`) — À FAIRE PROPREMENT

**État prod (inspecté 2026-05-24)** : `pgsodium` non activé (et déprécié), table `public.integrations` inexistante (migrations 070/071 jamais appliquées). User Gabriel : `rasenyafx@gmail.com` → `ef7a948f-2fab-41da-a5aa-a9f0b558adf0`.

**Recommandation** : abandonner pgsodium. Deux options propres :
- **Chiffrement applicatif AES-256-GCM** : nouvelle clé `ENCRYPTION_KEY` (32 bytes base64) en env ; stocker `ciphertext + iv + authTag`. Réécrire 070 (drop `CREATE EXTENSION pgsodium`) et 071 (colonnes `bytea`/`text` sans nonce pgsodium).
- **Supabase Vault** (`vault.create_secret` / `vault.decrypted_secrets`) : remplaçant natif de pgsodium ; stocker le secret et référencer par `uuid`.

**Ce qu'on stocke** : le **client_secret** (durable), PAS le token éphémère.
Ligne `integrations` cible : `provider='shopify'`, `shop_domain='0crvzb-fn.myshopify.com'`, `scopes=[16]`, `metadata={ auth:'client_credentials', client_id:'…', api_version:'2025-01' }`, secret chiffré.

Connexion DB pour migrer/insérer : pattern `scripts/run-migration-063.mjs` (package `postgres`, host `db.<ref>.supabase.co:5432`, user `postgres`, password `DATABASE_PASSWORD`, `ssl:'require'`).

---

## 6. Webhooks — À FAIRE (différé : la route n'existe pas encore)

1. Créer `src/app/api/ecom/webhooks/shopify/route.ts` qui **vérifie l'HMAC** (`X-Shopify-Hmac-SHA256`) avec le **client_secret** :
   ```ts
   import crypto from "crypto";
   const digest = crypto.createHmac("sha256", process.env.SHOPIFY_LHORLOGEMURALE_WEBHOOK_SECRET!)
     .update(rawBody, "utf8").digest("base64");
   // comparer en timing-safe à l'en-tête
   ```
   ⚠️ Lire le **raw body** (pas le JSON parsé) pour l'HMAC.
2. Souscrire les topics via `webhookSubscriptionCreate` (Admin GraphQL), endpoint prod `https://jestly.fr/api/ecom/webhooks/shopify`.
3. Topics : `ORDERS_CREATE, ORDERS_UPDATED, ORDERS_CANCELLED, ORDERS_PAID, ORDERS_FULFILLED, PRODUCTS_CREATE, PRODUCTS_UPDATE, PRODUCTS_DELETE, CUSTOMERS_CREATE, INVENTORY_LEVELS_UPDATE, CHECKOUTS_CREATE, CHECKOUTS_UPDATE, APP_UNINSTALLED`.

---

## 7. Forme des données (validé en live)

- **Shop** : `L'Horloge Murale`, devise `EUR`, `lhorlogemurale.fr`.
- **Orders** : 9 (#1001→#1009). ⚠️ Pour les analytics, attention aux **fausses commandes** : #1001 = test (0 €, « test product »), #1002/#1004/#1005 = commandes de Gabriel lui-même. Vraies commandes clients externes : **#1003, #1006, #1007, #1008, #1009**. Champs utiles : `name, processedAt, displayFinancialStatus, totalPriceSet.shopMoney{amount,currencyCode}, customer{displayName}, lineItems`.
- **Products** : 18, tous `ACTIVE`.

---

## 8. Révoquer / faire tourner le secret

- Rotation : Dev Dashboard → **Paramètres → Secret → « Faire pivoter »** → MAJ `.env.local`.
- Couper l'accès : désinstaller l'app (Admin store → Réglages → Applications → Jestly Dashboard → Désinstaller).

---

## 9. Checklist du reste à faire

- [ ] Helper token mint+cache (`src/lib/shopify/lhorlogemurale.ts`) — §3
- [ ] Page/route `/ecom` qui consomme `shopifyAdmin(...)`
- [ ] Route webhooks + vérif HMAC — §6
- [ ] Souscrire les 13 topics webhooks (après déploiement de la route)
- [ ] Ligne Supabase `integrations` avec chiffrement applicatif/Vault — §5
- [ ] (hygiène) « Renouveler » le token `atkn_` CI/CD (collé en chat, inutilisé)
