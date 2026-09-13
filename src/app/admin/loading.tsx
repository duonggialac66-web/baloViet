export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#121417] border border-[#22242B] space-y-3">
        <div className="h-8 bg-[#1D2026] rounded-xl w-1/3" />
        <div className="h-4 bg-[#1D2026] rounded-md w-1/2" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-[#121417] border border-[#22242B] space-y-3">
            <div className="h-4 bg-[#1D2026] rounded w-1/2" />
            <div className="h-8 bg-[#1D2026] rounded-lg w-3/4" />
          </div>
        ))}
      </div>

      {/* Content Table Skeleton */}
      <div className="bg-[#121417] border border-[#22242B] rounded-2xl p-6 space-y-4">
        <div className="h-6 bg-[#1D2026] rounded-lg w-1/4" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-[#1D2026] rounded-xl w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
