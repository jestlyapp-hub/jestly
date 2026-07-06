import { redirectPreservingQuery, type SearchParams } from "../gads/_redirect";

/** L'ancienne page Analytics boutique a fusionné dans le Dashboard. */
export default async function OldAnalyticsRedirect({ searchParams }: { searchParams: SearchParams }) {
  await redirectPreservingQuery("/ecom", searchParams);
}
