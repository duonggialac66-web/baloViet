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
        <table className="w-full text-xs text-left font-sans block sm:table">
          <thead className="text-[11px] text-[#9CA3AF] font-mono uppercase tracking-wider bg-[#181A1F] border-b border-[#22242B] hidden sm:table-header-group">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 font-bold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2228] text-gray-200 block sm:table-row-group">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-[#181A1F]/70 transition-colors block sm:table-row mb-4 sm:mb-0 border sm:border-none border-[#22242B] rounded-xl overflow-hidden sm:rounded-none">
                {columns.map((col) => (
                  <td key={col.key} className="block sm:table-cell px-4 py-3 sm:px-6 sm:py-4 border-b border-[#1E2228] sm:border-none last:border-none relative">
                    <div className="flex sm:block justify-between items-center gap-4 w-full">
                      <span className="sm:hidden font-bold text-[#9CA3AF] uppercase text-[10px] shrink-0">{col.header}</span>
                      <div className="text-right sm:text-left text-wrap sm:whitespace-nowrap flex-1 flex justify-end sm:block min-w-0 break-words">
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </div>
                    </div>
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
