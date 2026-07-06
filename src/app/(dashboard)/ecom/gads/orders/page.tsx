import { redirectPreservingQuery, type SearchParams } from "../_redirect";

/** La vue attribution par commande a fusionné dans Commandes. */
export default async function GadsOrdersRedirect({ searchParams }: { searchParams: SearchParams }) {
  await redirectPreservingQuery("/ecom/orders", searchParams);
}
