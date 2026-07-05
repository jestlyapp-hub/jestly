/**
 * Layout du module Analytics — fond signature Jestly (#f0eff5, Phase 5),
 * appliqué à toutes les vues du module sans toucher au reste du dashboard.
 */
export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f0eff5] rounded-2xl p-4 md:p-5 -mx-2">
      {children}
    </div>
  );
}
