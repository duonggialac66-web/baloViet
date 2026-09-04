const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";

interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif";
  crop?: "fill" | "fit" | "thumb";
  removeBackground?: boolean;
}

export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryOptions = {}
): string {
  const { width, height, quality = "auto", format = "auto", crop = "fill", removeBackground = false } = options;
  
  const transforms = [
    `f_${format}`,
    `q_${quality}`,
    width && `w_${width}`,
    height && `h_${height}`,
    (width || height) && `c_${crop}`,
    removeBackground && `e_background_removal`,
  ].filter(Boolean).join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

export function buildSrcSet(publicId: string, widths = [400, 800, 1200]) {
  return widths
    .map(w => `${buildCloudinaryUrl(publicId, { width: w })} ${w}w`)
    .join(", ");
}
