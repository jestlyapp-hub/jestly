import { buildComparatifMetadata, ComparatifJsonLd } from "@/lib/seo/comparatifs-metadata";

const SLUG = "jestly-vs-clickup";
export const metadata = buildComparatifMetadata(SLUG);

export default function CompLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ComparatifJsonLd slug={SLUG} />
      {children}
    </>
  );
}
