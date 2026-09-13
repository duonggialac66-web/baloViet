export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0B0D0E] text-white">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 space-y-12 animate-pulse">
        <div className="h-6 bg-[#14171C] rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 h-[500px] bg-[#121417] rounded-3xl border border-[#22242B]" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-10 bg-[#14171C] rounded-xl w-3/4" />
            <div className="h-6 bg-[#14171C] rounded-md w-1/3" />
            <div className="h-24 bg-[#14171C] rounded-xl w-full" />
            <div className="h-12 bg-[#14171C] rounded-xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
