import { redirectPreservingQuery, type SearchParams } from "../_redirect";

/** Les Réglages coûts ont fusionné dans Réglages → onglet Coûts. */
export default async function GadsCostsRedirect({ searchParams }: { searchParams: SearchParams }) {
  await redirectPreservingQuery("/ecom/settings", searchParams, { tab: "couts" });
}
