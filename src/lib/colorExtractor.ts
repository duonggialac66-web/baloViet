"use client";

import { useState, useEffect } from "react";

export interface ExtractedColorInfo {
  bgColor: string;       // HEX string e.g. "#FFFFFF" or "#0B0D0E"
  rgb: [number, number, number];
  isLight: boolean;      // luminance > 160
  textColor: string;     // "#0F172A" for light, "#FFFFFF" for dark
  subtextColor: string;  // "#475569" for light, "#9CA3AF" for dark
  badgeBg: string;       // "#0F172A" or "rgba(0,0,0,0.7)" for light, "rgba(0,0,0,0.6)" for dark
  badgeText: string;     // text color inside badge
  gradientStart: string; // color for gradient overlays
}

export function parseHexOrRgb(colorStr: string): { r: number; g: number; b: number } | null {
  if (!colorStr) return null;
  const hexMatch = colorStr.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  }
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }
  return null;
}

export function calculateLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function getColorInfoFromRgb(r: number, g: number, b: number): ExtractedColorInfo {
  const luminance = calculateLuminance(r, g, b);
  const isLight = luminance > 160;
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

  return {
    bgColor: hex,
    rgb: [r, g, b],
    isLight,
    textColor: isLight ? "#0F172A" : "#FFFFFF",
    subtextColor: isLight ? "#334155" : "#9CA3AF",
    badgeBg: isLight ? "#0F172A" : "rgba(0, 0, 0, 0.75)",
    badgeText: isLight ? "#F5B800" : "#F5B800",
    gradientStart: hex,
  };
}

/**
 * Samples outer border pixels of an image URL using canvas to extract the image's background/edge color.
 */
export async function extractImageEdgeColor(imageUrl: string): Promise<ExtractedColorInfo> {
  return new Promise((resolve) => {
    const fallback = getColorInfoFromRgb(11, 13, 14); // #0B0D0E dark default

    if (!imageUrl || typeof window === "undefined") {
      return resolve(fallback);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    // Set timeout in case image loading hangs
    const timer = setTimeout(() => {
      resolve(fallback);
    }, 2500);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(fallback);

        const width = Math.min(img.naturalWidth || 200, 100);
        const height = Math.min(img.naturalHeight || 200, 100);
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height).data;

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let count = 0;

        // Sample outer 3-pixel border (top, bottom, left, right edges)
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const isBorder = y < 3 || y >= height - 3 || x < 3 || x >= width - 3;
            if (isBorder) {
              const index = (y * width + x) * 4;
              const alpha = imgData[index + 3];
              // Ignore fully transparent pixels
              if (alpha > 30) {
                totalR += imgData[index];
                totalG += imgData[index + 1];
                totalB += imgData[index + 2];
                count++;
              }
            }
          }
        }

        if (count === 0) {
          // If outer border was transparent or empty, sample corners
          for (let i = 0; i < imgData.length; i += 4) {
            if (imgData[i + 3] > 30) {
              totalR += imgData[i];
              totalG += imgData[i + 1];
              totalB += imgData[i + 2];
              count++;
            }
          }
        }

        if (count > 0) {
          const avgR = Math.round(totalR / count);
          const avgG = Math.round(totalG / count);
          const avgB = Math.round(totalB / count);
          return resolve(getColorInfoFromRgb(avgR, avgG, avgB));
        }

        resolve(fallback);
      } catch (err) {
        // Canvas CORS security error or DOMException -> fallback
        resolve(fallback);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(fallback);
    };

    img.src = imageUrl;
  });
}

/**
 * React hook to get extracted edge color from an image URL or specified override theme color.
 */
export function useImageColor(imageUrl?: string | null, overrideThemeColor?: string | null): ExtractedColorInfo {
  const [colorInfo, setColorInfo] = useState<ExtractedColorInfo>(() => {
    if (overrideThemeColor) {
      const parsed = parseHexOrRgb(overrideThemeColor);
      if (parsed) return getColorInfoFromRgb(parsed.r, parsed.g, parsed.b);
    }
    return getColorInfoFromRgb(11, 13, 14); // #0B0D0E default
  });

  useEffect(() => {
    let isMounted = true;

    if (overrideThemeColor && overrideThemeColor !== "#0B0D0E" && overrideThemeColor !== "auto") {
      const parsed = parseHexOrRgb(overrideThemeColor);
      if (parsed) {
        setColorInfo(getColorInfoFromRgb(parsed.r, parsed.g, parsed.b));
        return;
      }
    }

    if (imageUrl) {
      extractImageEdgeColor(imageUrl).then((info) => {
        if (isMounted) {
          setColorInfo(info);
        }
      });
    } else {
      setColorInfo(getColorInfoFromRgb(11, 13, 14));
    }

    return () => {
      isMounted = false;
    };
  }, [imageUrl, overrideThemeColor]);

  return colorInfo;
}
