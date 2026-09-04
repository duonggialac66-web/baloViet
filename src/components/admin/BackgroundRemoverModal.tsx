"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/store/cartContext";
import {
  X,
  Sparkles,
  RotateCcw,
  Eraser,
  Paintbrush,
  Crop,
  Check,
  Download,
  Upload,
  Loader2
} from "lucide-react";

interface BackgroundRemoverModalProps {
  isOpen: boolean;
  initialImageUrl?: string;
  onClose: () => void;
  onApply: (transparentPngDataUrl: string) => void;
}

export default function BackgroundRemoverModal({
  isOpen,
  initialImageUrl,
  onClose,
  onApply,
}: BackgroundRemoverModalProps) {
  const { addToast } = useToast();

  const [originalImageSrc, setOriginalImageSrc] = useState<string>("");
  const [resultBlobUrl, setResultBlobUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [previewBg, setPreviewBg] = useState<"checker" | "dark" | "hero">("checker");
  const [brushMode, setBrushMode] = useState<"none" | "erase" | "restore">("none");
  const [brushSize, setBrushSize] = useState(25);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load initial image when modal opens
  useEffect(() => {
    if (isOpen && initialImageUrl && initialImageUrl !== originalImageSrc) {
      setOriginalImageSrc(initialImageUrl);
      setResultBlobUrl("");
      setBrushMode("none");
    }
  }, [isOpen, initialImageUrl]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    };
  }, [resultBlobUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setOriginalImageSrc(event.target.result);
        setResultBlobUrl("");
      }
    };
    reader.readAsDataURL(file);
  };

  const runAIBackgroundRemoval = async () => {
    if (!originalImageSrc) {
      addToast("Vui lòng nạp ảnh trước!", "error");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressLabel("Đang tải AI model (~40MB lần đầu)...");

    try {
      // Dynamic import to avoid loading the heavy library until needed
      const { removeBackground } = await import("@imgly/background-removal");

      setProgress(15);
      setProgressLabel("Đang xử lý ảnh bằng AI...");

      // Convert source to blob for the library
      let imageBlob: Blob;
      if (originalImageSrc.startsWith("data:")) {
        const res = await fetch(originalImageSrc);
        imageBlob = await res.blob();
      } else {
        const res = await fetch(originalImageSrc);
        imageBlob = await res.blob();
      }

      setProgress(25);

      const resultBlob = await removeBackground(imageBlob, {
        progress: (key: string, current: number, total: number) => {
          const pct = total > 0 ? Math.round((current / total) * 100) : 0;
          if (key.includes("fetch")) {
            setProgressLabel(`Đang tải model AI... ${pct}%`);
            setProgress(15 + pct * 0.4);
          } else if (key.includes("compute") || key.includes("inference")) {
            setProgressLabel(`AI đang tách chủ thể... ${pct}%`);
            setProgress(55 + pct * 0.4);
          }
        },
      });

      setProgress(95);
      setProgressLabel("Hoàn tất! Đang render kết quả...");

      // Revoke old URL
      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);

      const newUrl = URL.createObjectURL(resultBlob);
      setResultBlobUrl(newUrl);

      // Also draw to canvas for brush editing
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const origCanvas = originalCanvasRef.current;
        if (canvas && origCanvas) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          }

          // Also store original for restore brush
          origCanvas.width = img.naturalWidth;
          origCanvas.height = img.naturalHeight;

          const origImg = new Image();
          origImg.crossOrigin = "anonymous";
          origImg.onload = () => {
            const origCtx = origCanvas.getContext("2d");
            if (origCtx) {
              origCtx.drawImage(origImg, 0, 0, origCanvas.width, origCanvas.height);
            }
          };
          origImg.src = originalImageSrc;
        }
      };
      img.src = newUrl;

      setProgress(100);
      setProgressLabel("Xóa phông hoàn tất!");
      addToast("AI đã xóa phông thành công!", "success");
    } catch (err: any) {
      console.error("Background removal error:", err);
      addToast(`Lỗi xóa phông: ${err?.message || "Không xác định"}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Brush drawing (Erase / Restore) on the canvas
  const applyBrush = (clientX: number, clientY: number) => {
    if (!canvasRef.current || (brushMode !== "erase" && brushMode !== "restore")) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, brushSize * scaleX, 0, Math.PI * 2);

    if (brushMode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();
    } else if (brushMode === "restore" && originalCanvasRef.current) {
      ctx.clip();
      ctx.drawImage(originalCanvasRef.current, 0, 0);
    }
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (brushMode === "erase" || brushMode === "restore") {
      setIsDrawing(true);
      applyBrush(e.clientX, e.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) applyBrush(e.clientX, e.clientY);
  };

  const handleMouseUp = () => setIsDrawing(false);

  // Auto crop to subject bounding box
  const handleAutoCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h).data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (imgData[(y * w + x) * 4 + 3] > 10) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!found) { addToast("Không tìm thấy chủ thể", "error"); return; }

    const pad = 20;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w, maxX + pad);
    maxY = Math.min(h, maxY + pad);

    const cropW = maxX - minX, cropH = maxY - minY;
    const cropped = ctx.getImageData(minX, minY, cropW, cropH);
    canvas.width = cropW;
    canvas.height = cropH;
    ctx.putImageData(cropped, 0, 0);

    addToast(`Đã cắt sát chủ thể (${cropW}×${cropH}px)`, "success");
  };

  // Get current canvas data as data URL
  const getCanvasDataUrl = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return resultBlobUrl || "";
    return canvas.toDataURL("image/png");
  };

  const handleConfirmApply = () => {
    const dataUrl = getCanvasDataUrl();
    if (!dataUrl) {
      addToast("Chưa có ảnh kết quả!", "error");
      return;
    }
    onApply(dataUrl);
    addToast("Đã áp dụng ảnh PNG trong suốt!", "success");
    onClose();
  };

  const handleDownload = () => {
    const dataUrl = getCanvasDataUrl();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `transparent-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    addToast("Đã tải xuống PNG!", "success");
  };

  if (!isOpen) return null;

  const hasResult = !!resultBlobUrl;
  const showCanvas = hasResult && brushMode !== "none";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fadeup">
      <canvas ref={originalCanvasRef} className="hidden" />

      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">AI Xóa Phông Ảnh Thông Minh</h2>
              <p className="text-xs text-gray-500">Sử dụng mô hình AI chạy trực tiếp trên trình duyệt — không cần API key</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1 items-start">

          {/* Left Controls */}
          <div className="lg:col-span-4 space-y-4">

            {/* Upload / Change Image */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
              <span className="text-xs font-bold text-gray-800 block">1. Nạp ảnh cần xóa phông</span>

              {originalImageSrc && (
                <div className="w-full h-28 rounded border border-gray-300 bg-white flex items-center justify-center p-2 overflow-hidden">
                  <img src={originalImageSrc} alt="Ảnh gốc" className="max-h-full max-w-full object-contain" />
                </div>
              )}

              <label className="flex items-center justify-center gap-2 border border-dashed border-gray-300 hover:border-amber-500 rounded p-3 cursor-pointer bg-white text-xs font-medium text-gray-700 hover:text-amber-700 transition-colors text-center">
                <Upload className="w-4 h-4" />
                <span>{originalImageSrc ? "Đổi ảnh khác" : "Chọn ảnh từ máy tính"}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Run AI Button */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
              <span className="text-xs font-bold text-gray-800 block">2. Chạy AI xóa phông</span>

              <button
                type="button"
                onClick={runAIBackgroundRemoval}
                disabled={isProcessing || !originalImageSrc}
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white rounded-lg font-bold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Xóa phông bằng AI
                  </>
                )}
              </button>

              {/* Progress bar */}
              {isProcessing && (
                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-600 text-center">{progressLabel}</p>
                </div>
              )}

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Model AI (~40MB) sẽ được tải và cache lần đầu. Các lần sau sẽ nhanh hơn nhiều.
              </p>
            </div>

            {/* Brush Tools (only after result) */}
            {hasResult && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
                <span className="text-xs font-bold text-gray-800 block">3. Tinh chỉnh thủ công (tùy chọn)</span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBrushMode(brushMode === "erase" ? "none" : "erase")}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded text-xs font-medium border transition-colors ${
                      brushMode === "erase"
                        ? "bg-red-100 border-red-500 text-red-900 font-bold"
                        : "bg-white hover:bg-gray-100 border-gray-200 text-gray-700"
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    Cọ xóa thêm
                  </button>

                  <button
                    type="button"
                    onClick={() => setBrushMode(brushMode === "restore" ? "none" : "restore")}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded text-xs font-medium border transition-colors ${
                      brushMode === "restore"
                        ? "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold"
                        : "bg-white hover:bg-gray-100 border-gray-200 text-gray-700"
                    }`}
                  >
                    <Paintbrush className="w-3.5 h-3.5" />
                    Cọ phục hồi
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoCrop}
                    className="flex items-center justify-center gap-1.5 p-2 rounded text-xs font-medium border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    Cắt sát chủ thể
                  </button>

                  <button
                    type="button"
                    onClick={runAIBackgroundRemoval}
                    disabled={isProcessing}
                    className="flex items-center justify-center gap-1.5 p-2 rounded text-xs font-medium border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Xóa phông lại
                  </button>
                </div>

                {brushMode !== "none" && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Kích thước cọ:</span>
                      <span className="font-mono font-bold">{brushSize}px</span>
                    </div>
                    <input
                      type="range" min="5" max="80" value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Preview */}
          <div className="lg:col-span-8 space-y-3">

            {/* Background Selector */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Nền xem trước:</span>
              <div className="flex gap-1.5">
                {([
                  { key: "checker" as const, label: "Trong suốt" },
                  { key: "dark" as const, label: "Nền tối" },
                  { key: "hero" as const, label: "Nền Hero" },
                ]).map(({ key, label }) => (
                  <button key={key} type="button" onClick={() => setPreviewBg(key)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      previewBg === key ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas / Image Preview */}
            <div
              className={`relative min-h-[400px] max-h-[500px] rounded-lg border border-gray-300 flex items-center justify-center p-4 overflow-hidden select-none transition-colors ${
                previewBg === "checker"
                  ? "bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px]"
                  : previewBg === "dark"
                  ? "bg-[#0B0D0E]"
                  : "bg-[radial-gradient(ellipse_90%_70%_at_50%_40%,#542813_0%,#271207_45%,#080301_100%)]"
              }`}
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 gap-3">
                  <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
                  <p className="text-sm font-semibold text-gray-800">{progressLabel}</p>
                  <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {hasResult ? (
                <>
                  {/* Show canvas when brush mode is active, otherwise show img */}
                  {showCanvas ? (
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      className={`max-h-[400px] max-w-full object-contain rounded shadow-lg ${
                        brushMode === "erase" ? "cursor-cell" : brushMode === "restore" ? "cursor-cell" : "cursor-default"
                      }`}
                    />
                  ) : (
                    <img
                      src={resultBlobUrl}
                      alt="Kết quả xóa phông"
                      className="max-h-[400px] max-w-full object-contain rounded shadow-lg"
                    />
                  )}
                  {/* Hidden canvas for non-brush mode */}
                  {!showCanvas && <canvas ref={canvasRef} className="hidden" />}
                </>
              ) : originalImageSrc ? (
                <div className="text-center space-y-3">
                  <img src={originalImageSrc} alt="Ảnh gốc" className="max-h-[350px] max-w-full object-contain rounded opacity-50" />
                  <p className="text-xs text-gray-500">Bấm &quot;Xóa phông bằng AI&quot; để bắt đầu</p>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 space-y-2">
                  <Upload className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="text-xs">Chưa có ảnh nào được nạp</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <button type="button" onClick={handleDownload} disabled={!hasResult}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Tải về máy
          </button>

          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-md text-xs font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button type="button" onClick={handleConfirmApply} disabled={!hasResult}
              className="inline-flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Áp dụng ảnh đã xóa phông
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
