import { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

export default function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  emptyMessage = "Không có dữ liệu" 
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-[#121417] rounded-2xl border border-[#22242B] p-12 text-center text-[#9CA3AF] text-sm font-sans">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-[#121417] rounded-2xl border border-[#22242B] overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left font-sans">
          <thead className="text-[11px] text-[#9CA3AF] font-mono uppercase tracking-wider bg-[#181A1F] border-b border-[#22242B]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 font-bold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2228] text-gray-200">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-[#181A1F]/70 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
