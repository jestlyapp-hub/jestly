import { redirectPreservingQuery, type SearchParams } from "./_redirect";

/** L'ancienne Vue d'ensemble a fusionné dans le Dashboard. */
export default async function GadsRedirect({ searchParams }: { searchParams: SearchParams }) {
  await redirectPreservingQuery("/ecom", searchParams);
}
