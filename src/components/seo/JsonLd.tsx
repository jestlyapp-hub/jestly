/**
 * JsonLd — injecte un objet JSON-LD dans le <head> via un <script type="application/ld+json">.
 * Server-component friendly. Aucune dépendance.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
