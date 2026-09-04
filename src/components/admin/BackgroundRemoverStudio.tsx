"use client";

import { useState, useRef, useCallback } from "react";
import { useToast } from "@/store/cartContext";
import {
  Upload,
  Download,
  Copy,
  Sparkles,
  RotateCcw,
  Eraser,
  Paintbrush,
  Crop,
  ArrowRight,
  Check,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function BackgroundRemoverStudio() {
  const { addToast } = useToast();

  const [originalImageSrc, setOriginalImageSrc] = useState<string>("");
  const [resultBlobUrl, setResultBlobUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [previewBg, setPreviewBg] = useState<"checker" | "dark" | "hero" | "white">("checker");
  const [brushMode, setBrushMode] = useState<"none" | "erase" | "restore">("none");
  const [brushSize, setBrushSize] = useState(25);
  const [isDrawing, setIsDrawing] = useState(false);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadImage = (src: string) => {
    setOriginalImageSrc(src);
    setResultBlobUrl("");
    setBrushMode("none");
    addToast("Đã nạp ảnh!", "success");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") loadImage(event.target.result);
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
      const { removeBackground } = await import("@imgly/background-removal");

      setProgress(15);
      setProgressLabel("Đang xử lý ảnh bằng AI...");

      let imageBlob: Blob;
      const res = await fetch(originalImageSrc);
      imageBlob = await res.blob();

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
      setProgressLabel("Hoàn tất!");

      if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
      const newUrl = URL.createObjectURL(resultBlob);
      setResultBlobUrl(newUrl);

      // Draw to canvas
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const origCanvas = originalCanvasRef.current;
        if (canvas) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); }
        }
        if (origCanvas) {
          origCanvas.width = img.naturalWidth;
          origCanvas.height = img.naturalHeight;
          const origImg = new Image();
          origImg.crossOrigin = "anonymous";
          origImg.onload = () => {
            const origCtx = origCanvas.getContext("2d");
            if (origCtx) origCtx.drawImage(origImg, 0, 0, origCanvas.width, origCanvas.height);
          };
          origImg.src = originalImageSrc;
        }
      };
      img.src = newUrl;

      setProgress(100);
      addToast("AI đã xóa phông thành công!", "success");
    } catch (err: any) {
      console.error(err);
      addToast(`Lỗi: ${err?.message || "Không xác định"}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Brush tools
  const applyBrush = (clientX: number, clientY: number) => {
    if (!canvasRef.current || (brushMode !== "erase" && brushMode !== "restore")) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * (canvas.height / rect.height);
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

  const handleAutoCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    const data = ctx.getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = 0, maxY = 0, found = false;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 10) {
        found = true;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    if (!found) { addToast("Không tìm thấy chủ thể", "error"); return; }
    const pad = 20;
    minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
    maxX = Math.min(w, maxX + pad); maxY = Math.min(h, maxY + pad);
    const cropW = maxX - minX, cropH = maxY - minY;
    const cropped = ctx.getImageData(minX, minY, cropW, cropH);
    canvas.width = cropW; canvas.height = cropH;
    ctx.putImageData(cropped, 0, 0);
    addToast(`Đã cắt sát (${cropW}×${cropH}px)`, "success");
  };

  const getCanvasDataUrl = () => canvasRef.current?.toDataURL("image/png") || "";

  const handleDownload = () => {
    const url = getCanvasDataUrl();
    if (!url) return;
    const link = document.createElement("a");
    link.download = `transparent-${Date.now()}.png`;
    link.href = url;
    link.click();
    addToast("Đã tải xuống PNG!", "success");
  };

  const handleCopyBase64 = () => {
    const url = getCanvasDataUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    addToast("Đã sao chép Data URL!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const hasResult = !!resultBlobUrl;
  const showCanvas = hasResult && brushMode !== "none";

  return (
    <div className="space-y-6">
      <canvas ref={originalCanvasRef} className="hidden" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-amber-600" />
            AI Studio Xóa Phông
          </h1>
          <p className="text-gray-500 mt-1">
            Xóa nền ảnh bằng AI trực tiếp trên trình duyệt — không cần API key, hoàn toàn miễn phí.
          </p>
        </div>
        {hasResult && (
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleCopyBase64}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium text-xs border border-gray-300"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Đã chép" : "Sao chép Data URL"}
            </button>
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium text-xs shadow-sm"
            >
              <Download className="w-4 h-4" /> Tải về PNG
            </button>
            <Link href="/admin/uu-dai/tao-moi"
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-md font-medium text-xs shadow-sm"
            >
              Tạo Banner Ưu Đãi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Panel */}
        <div className="lg:col-span-4 space-y-5">

          {/* Upload */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">1. Nạp ảnh cần xóa phông</h3>
            {originalImageSrc && (
              <div className="w-full h-32 rounded border bg-gray-100 flex items-center justify-center p-2">
                <img src={originalImageSrc} alt="Ảnh gốc" className="max-h-full max-w-full object-contain" />
              </div>
            )}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-amber-500 rounded-lg p-6 cursor-pointer bg-gray-50 hover:bg-amber-50/50 transition-colors text-center group">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-amber-600 mb-2" />
              <span className="text-xs font-semibold text-gray-700">Tải ảnh từ máy tính</span>
              <span className="text-[11px] text-gray-400 mt-1">JPG, PNG, WEBP</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            <div className="pt-2 border-t flex items-center justify-between">
              <span className="text-xs text-gray-500">Chưa có ảnh sẵn?</span>
              <button onClick={() => loadImage("/hero-backpack.png")} className="text-xs text-amber-600 font-semibold underline cursor-pointer">
                Nạp ảnh Balo mẫu
              </button>
            </div>
          </div>

          {/* Run AI */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">2. Chạy AI xóa phông</h3>
            <button type="button" onClick={runAIBackgroundRemoval} disabled={isProcessing || !originalImageSrc}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white rounded-lg font-bold text-sm cursor-pointer disabled:cursor-not-allowed shadow-sm"
            >
              {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</> : <><Sparkles className="w-4 h-4" /> Xóa phông bằng AI</>}
            </button>
            {isProcessing && (
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[11px] text-gray-600 text-center">{progressLabel}</p>
              </div>
            )}
            <p className="text-[11px] text-gray-400">Model AI (~40MB) được cache sau lần tải đầu. Các lần sau xử lý nhanh hơn nhiều.</p>
          </div>

          {/* Brush Tools */}
          {hasResult && (
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">3. Tinh chỉnh thủ công</h3>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setBrushMode(brushMode === "erase" ? "none" : "erase")}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded text-xs font-medium border transition-colors ${brushMode === "erase" ? "bg-red-100 border-red-500 text-red-900 font-bold" : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"}`}
                >
                  <Eraser className="w-3.5 h-3.5" /> Cọ xóa thêm
                </button>
                <button type="button" onClick={() => setBrushMode(brushMode === "restore" ? "none" : "restore")}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded text-xs font-medium border transition-colors ${brushMode === "restore" ? "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold" : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"}`}
                >
                  <Paintbrush className="w-3.5 h-3.5" /> Cọ phục hồi
                </button>
                <button type="button" onClick={handleAutoCrop}
                  className="flex items-center justify-center gap-1.5 p-2 rounded text-xs font-medium border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                >
                  <Crop className="w-3.5 h-3.5" /> Cắt sát chủ thể
                </button>
                <button type="button" onClick={runAIBackgroundRemoval} disabled={isProcessing}
                  className="flex items-center justify-center gap-1.5 p-2 rounded text-xs font-medium border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Chạy lại AI
                </button>
              </div>
              {brushMode !== "none" && (
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Kích thước cọ:</span>
                    <span className="font-mono font-bold">{brushSize}px</span>
                  </div>
                  <input type="range" min="5" max="80" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full accent-amber-600" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <h3 className="font-bold text-gray-900 text-sm">Kết quả</h3>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500 mr-1">Nền:</span>
              {([
                { key: "checker" as const, label: "Trong suốt" },
                { key: "dark" as const, label: "Đen" },
                { key: "hero" as const, label: "Hero Warm" },
              ]).map(({ key, label }) => (
                <button key={key} type="button" onClick={() => setPreviewBg(key)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${previewBg === key ? "bg-amber-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`relative min-h-[460px] max-h-[620px] rounded-lg border border-gray-300 flex items-center justify-center p-6 overflow-hidden select-none ${
              previewBg === "checker" ? "bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#ffffff_0%_50%)] bg-[length:20px_20px]"
              : previewBg === "dark" ? "bg-[#0B0D0E]"
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
              showCanvas ? (
                <canvas ref={canvasRef}
                  onMouseDown={(e) => { setIsDrawing(true); applyBrush(e.clientX, e.clientY); }}
                  onMouseMove={(e) => { if (isDrawing) applyBrush(e.clientX, e.clientY); }}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseLeave={() => setIsDrawing(false)}
                  className="max-h-[480px] max-w-full object-contain rounded shadow-lg cursor-cell"
                />
              ) : (
                <>
                  <img src={resultBlobUrl} alt="Kết quả" className="max-h-[480px] max-w-full object-contain rounded shadow-lg" />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              )
            ) : originalImageSrc ? (
              <div className="text-center space-y-3">
                <img src={originalImageSrc} alt="Ảnh gốc" className="max-h-[400px] max-w-full object-contain rounded opacity-50" />
                <p className="text-xs text-gray-500">Bấm &quot;Xóa phông bằng AI&quot; ở cột trái để bắt đầu</p>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 space-y-3">
                <Upload className="w-12 h-12 mx-auto text-gray-300" />
                <p className="text-sm">Chưa có ảnh nào được nạp</p>
                <p className="text-xs text-gray-400">Tải ảnh từ máy tính hoặc bấm &quot;Nạp ảnh Balo mẫu&quot;</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
