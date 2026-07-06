import { redirectPreservingQuery, type SearchParams } from "../_redirect";

/** Product Analytics vit désormais sous Produits. */
export default async function GadsProductsRedirect({ searchParams }: { searchParams: SearchParams }) {
  await redirectPreservingQuery("/ecom/products", searchParams);
}
