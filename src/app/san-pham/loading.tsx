export default function ProductsLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0B0D0E] text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12 animate-pulse">
        {/* Products Hero Banner Skeleton */}
        <div className="relative rounded-3xl bg-[#121417] border border-[#22242B] p-8 md:p-12 min-h-[420px] flex flex-col justify-between overflow-hidden shadow-2xl">
          <div className="space-y-4 max-w-xl">
            <div className="h-6 bg-[#1C1F26] rounded-md w-32" />
            <div className="h-10 bg-[#1C1F26] rounded-xl w-3/4" />
            <div className="h-4 bg-[#1C1F26] rounded-md w-2/3" />
          </div>
          <div className="flex gap-4 pt-6">
            <div className="h-12 bg-[#1C1F26] rounded-xl w-36" />
            <div className="h-12 bg-[#1C1F26] rounded-xl w-36" />
          </div>
        </div>

        {/* Filters & Category Chips Skeleton */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#121417] border border-[#22242B]">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-[#1C1F26] rounded-xl w-28 shrink-0" />
            ))}
          </div>
          <div className="h-10 bg-[#1C1F26] rounded-xl w-64" />
        </div>

        {/* Product Cards Shimmer Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-[#121417] border border-[#22242B] rounded-2xl p-4 space-y-4 shadow-lg">
              <div className="aspect-[4/5] bg-[#1C1F26] rounded-xl w-full" />
              <div className="space-y-2">
                <div className="h-3 bg-[#1C1F26] rounded w-1/3" />
                <div className="h-5 bg-[#1C1F26] rounded-md w-4/5" />
                <div className="h-6 bg-[#1C1F26] rounded-md w-1/2 pt-2" />
              </div>
              <div className="h-10 bg-[#1C1F26] rounded-xl w-full pt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
