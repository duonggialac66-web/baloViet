export default function BlogLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0B0D0E] text-white">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 space-y-12 animate-pulse">
        {/* Header Skeleton */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="h-10 bg-[#14171C] rounded-xl w-2/3 mx-auto" />
          <div className="h-4 bg-[#14171C] rounded-md w-1/2 mx-auto" />
        </div>

        {/* Categories Bar Skeleton */}
        <div className="h-14 bg-[#121417] border border-[#22242B] rounded-2xl p-3 flex items-center justify-between">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-[#1D2027] rounded-xl w-24" />
            ))}
          </div>
          <div className="h-8 bg-[#1D2027] rounded-xl w-48" />
        </div>

        {/* Featured Hero Article Skeleton */}
        <div className="rounded-2xl border border-[#22242B] bg-[#121417] p-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 h-52 bg-[#1C2028] rounded-xl" />
          <div className="w-full md:w-2/3 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-4 bg-[#1C2028] rounded w-28" />
              <div className="h-7 bg-[#1C2028] rounded-md w-3/4" />
              <div className="h-4 bg-[#1C2028] rounded w-1/2" />
            </div>
            <div className="h-8 bg-[#1C2028] rounded-lg w-36" />
          </div>
        </div>

        {/* Regular Articles Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#121417] border border-[#22242B] rounded-2xl p-5 space-y-4 shadow-md">
              <div className="aspect-[16/10] bg-[#1C2028] rounded-xl w-full" />
              <div className="space-y-2">
                <div className="h-3 bg-[#1C2028] rounded w-1/4" />
                <div className="h-5 bg-[#1C2028] rounded w-5/6" />
                <div className="h-3 bg-[#1C2028] rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
