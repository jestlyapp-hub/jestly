/**
 * Queries GraphQL Shopify Admin API 2026-01.
 * Fragmentées par entité, réutilisables, paginées via cursor.
 */

// ── Shop info (test connexion) ───────────────────────────────────
export const QUERY_SHOP_INFO = /* GraphQL */ `
  query ShopInfo {
    shop {
      id
      name
      myshopifyDomain
      primaryDomain { host url }
      currencyCode
      email
      contactEmail
      timezoneAbbreviation
      ianaTimezone
      plan { displayName }
    }
  }
`;

// ── Orders (cursor pagination) ───────────────────────────────────
export const QUERY_ORDERS = /* GraphQL */ `
  query Orders($first: Int!, $after: String, $query: String) {
    orders(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          name
          createdAt
          updatedAt
          processedAt
          cancelledAt
          displayFinancialStatus
          displayFulfillmentStatus
          email
          phone
          tags
          sourceName
          customerJourneySummary {
            firstVisit { landingPage referrerUrl source utmParameters { source medium campaign } }
          }
          totalPriceSet { shopMoney { amount currencyCode } }
          subtotalPriceSet { shopMoney { amount currencyCode } }
          totalTaxSet { shopMoney { amount currencyCode } }
          totalShippingPriceSet { shopMoney { amount currencyCode } }
          totalDiscountsSet { shopMoney { amount currencyCode } }
          currencyCode
          customer { id email firstName lastName }
          shippingAddress {
            firstName lastName address1 address2
            city province country countryCodeV2 zip phone
          }
          billingAddress {
            firstName lastName address1 address2
            city province country countryCodeV2 zip phone
          }
          lineItems(first: 50) {
            edges {
              node {
                id title variantTitle quantity sku vendor
                product { id }
                variant { id image { url } }
                originalUnitPriceSet { shopMoney { amount } }
                totalDiscountSet { shopMoney { amount } }
              }
            }
          }
        }
      }
    }
  }
`;

// ── Products ─────────────────────────────────────────────────────
export const QUERY_PRODUCTS = /* GraphQL */ `
  query Products($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query, sortKey: UPDATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          handle
          description
          productType
          vendor
          status
          tags
          createdAt
          updatedAt
          publishedAt
          totalInventory
          priceRangeV2 {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          featuredImage { url altText }
          images(first: 10) { edges { node { url altText } } }
          variants(first: 50) {
            edges {
              node {
                id title sku
                price compareAtPrice
                inventoryQuantity
                inventoryManagement
                position
              }
            }
          }
        }
      }
    }
  }
`;

// ── Customers ────────────────────────────────────────────────────
export const QUERY_CUSTOMERS = /* GraphQL */ `
  query Customers($first: Int!, $after: String, $query: String) {
    customers(first: $first, after: $after, query: $query, sortKey: UPDATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          email firstName lastName phone
          numberOfOrders
          amountSpent { amount currencyCode }
          tags
          emailMarketingConsent { marketingState }
          createdAt updatedAt
          defaultAddress {
            firstName lastName address1 address2
            city province country countryCodeV2 zip phone
          }
          addresses {
            firstName lastName address1 address2
            city province country countryCodeV2 zip phone
          }
        }
      }
    }
  }
`;

// ── ShopifyQL — analytics journalières ───────────────────────────
export const QUERY_SHOPIFYQL = /* GraphQL */ `
  query ShopifyQL($query: String!) {
    shopifyqlQuery(query: $query) {
      __typename
      ... on TableResponse {
        tableData {
          columns { name dataType }
          rowData
        }
      }
      ... on ParseError { code message }
    }
  }
`;

// ── Webhook subscriptions (list + create + delete) ───────────────
export const QUERY_WEBHOOK_SUBSCRIPTIONS = /* GraphQL */ `
  query WebhookSubscriptions {
    webhookSubscriptions(first: 50) {
      edges {
        node {
          id
          topic
          endpoint {
            __typename
            ... on WebhookHttpEndpoint { callbackUrl }
          }
        }
      }
    }
  }
`;

export const MUTATION_WEBHOOK_CREATE = /* GraphQL */ `
  mutation WebhookCreate($topic: WebhookSubscriptionTopic!, $callbackUrl: URL!) {
    webhookSubscriptionCreate(
      topic: $topic
      webhookSubscription: { callbackUrl: $callbackUrl, format: JSON }
    ) {
      webhookSubscription { id topic }
      userErrors { field message }
    }
  }
`;

export const MUTATION_WEBHOOK_DELETE = /* GraphQL */ `
  mutation WebhookDelete($id: ID!) {
    webhookSubscriptionDelete(id: $id) {
      deletedWebhookSubscriptionId
      userErrors { field message }
    }
  }
`;
