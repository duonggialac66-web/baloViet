"use client";

import { useToast } from "@/store/cartContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-enter flex items-center gap-3 bg-[#161819] border border-[#2A2C2F] text-white px-4 py-3 rounded shadow-xl min-w-[280px] max-w-[360px]"
        >
          {toast.type === "success" && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F5B800] flex items-center justify-center">
              <svg className="w-3 h-3 text-black" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
          {toast.type === "error" && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">!</span>
          )}
          {toast.type === "info" && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">i</span>
          )}
          <p className="text-sm flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#6B6E72] hover:text-white transition-colors ml-2"
            aria-label="Đóng thông báo"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
