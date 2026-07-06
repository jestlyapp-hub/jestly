import { redirectPreservingQuery, type SearchParams } from "../_redirect";

/** L'Attribution Board a sa propre entrée de nav. */
export default async function GadsAttributionRedirect({ searchParams }: { searchParams: SearchParams }) {
  await redirectPreservingQuery("/ecom/attribution", searchParams);
}
