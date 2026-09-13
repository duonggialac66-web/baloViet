export default function GlobalLoading() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#0B0D0E] text-white flex flex-col justify-center items-center relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#F5B800]/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 w-full space-y-10 relative z-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="h-10 bg-[#16181D] rounded-xl w-3/4 mx-auto border border-[#22242B]" />
          <div className="h-4 bg-[#16181D] rounded-lg w-1/2 mx-auto border border-[#22242B]" />
        </div>

        {/* Hero Card Skeleton */}
        <div className="h-80 bg-[#121417] rounded-3xl border border-[#22242B] w-full p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-6 bg-[#1D2026] rounded-md w-1/4" />
            <div className="h-8 bg-[#1D2026] rounded-lg w-2/3" />
            <div className="h-4 bg-[#1D2026] rounded-md w-1/2" />
          </div>
          <div className="h-12 bg-[#1D2026] rounded-xl w-40" />
        </div>

        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-[#121417] rounded-2xl border border-[#22242B] p-6 space-y-4 flex flex-col justify-between">
              <div className="h-36 bg-[#1D2026] rounded-xl w-full" />
              <div className="space-y-2">
                <div className="h-5 bg-[#1D2026] rounded w-3/4" />
                <div className="h-4 bg-[#1D2026] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
