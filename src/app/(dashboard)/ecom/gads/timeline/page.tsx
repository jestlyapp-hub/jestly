import { redirectPreservingQuery, type SearchParams } from "../_redirect";

/** Le Détail temporel est devenu la section « Vue journalière » du Dashboard. */
export default async function GadsTimelineRedirect({ searchParams }: { searchParams: SearchParams }) {
  await redirectPreservingQuery("/ecom", searchParams, { view: "daily" });
}
