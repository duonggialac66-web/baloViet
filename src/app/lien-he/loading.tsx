export default function LienHeLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0B0D0E] text-white">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 space-y-12 animate-pulse">
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="h-12 bg-[#14171C] rounded-xl w-3/4 mx-auto" />
          <div className="h-4 bg-[#14171C] rounded-md w-1/2 mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 h-96 bg-[#121417] rounded-3xl border border-[#22242B]" />
          <div className="lg:col-span-7 h-96 bg-[#121417] rounded-3xl border border-[#22242B]" />
        </div>
      </div>
    </div>
  );
}
