import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number; // percentage
    isPositive: boolean;
  };
}

export default function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <div className="bg-[#121417] rounded-2xl border border-[#22242B] p-5 sm:p-6 flex flex-col justify-between shadow-xl">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[#9CA3AF] text-xs font-medium font-sans uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white font-mono">{value}</h3>
        </div>
        <div className="p-3 bg-[#F5B800]/10 border border-[#F5B800]/30 rounded-xl text-[#F5B800]">
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="mt-auto flex items-center text-xs font-mono pt-1">
          <span className={`font-bold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
          <span className="text-[#9CA3AF] ml-2 font-sans">so với tháng trước</span>
        </div>
      )}
    </div>
  );
}
