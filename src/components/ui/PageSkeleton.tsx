export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 w-48 bg-[#F0F0EE] rounded-md" />
      <div className="h-4 w-72 bg-[#F0F0EE] rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-[#F0F0EE] rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-[#F0F0EE] rounded-lg" />
    </div>
  );
}
