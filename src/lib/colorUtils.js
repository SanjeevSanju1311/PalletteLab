import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import colorNamer from "color-namer";
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
export function getLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
export function getContrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
export function getContrastColor(r, g, b) {
  const luminance = getLuminance(r, g, b);
  const whiteLuminance = 1;
  const blackLuminance = 0;
  const ratioWithWhite = getContrastRatio(luminance, whiteLuminance);
  const ratioWithBlack = getContrastRatio(luminance, blackLuminance);
  const ratio = Math.max(ratioWithWhite, ratioWithBlack);
  const text = ratioWithWhite > ratioWithBlack ? "white" : "black";
  return {
    ratio: Number(ratio.toFixed(2)),
    text
  };
}
export function getColorName(hex) {
  try {
    const names = colorNamer(hex);
    return names.ntc[0].name;
  } catch {
    return "Unknown";
  }
}
export function getTailwindSuggestion(hex) {
  const name = getColorName(hex).toLowerCase().replace(/\s+/g, "-");
  const luminance = getLuminance(...Object.values(hexToRgb(hex)));
  const weight = luminance > 0.5 ? "600" : "400";
  return `bg-${name}-${weight}`;
}
export function detectGradient(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const w = canvas.width;
  const h = canvas.height;
  const samples = [
    ctx.getImageData(0, 0, 1, 1).data,
    // top-left
    ctx.getImageData(w - 1, 0, 1, 1).data,
    // top-right
    ctx.getImageData(0, h - 1, 1, 1).data,
    // bottom-left
    ctx.getImageData(w - 1, h - 1, 1, 1).data,
    // bottom-right
    ctx.getImageData(Math.floor(w / 2), 0, 1, 1).data,
    // top-center
    ctx.getImageData(Math.floor(w / 2), h - 1, 1, 1).data
    // bottom-center
  ];
  const hexes = samples.map((c) => rgbToHex(c[0], c[1], c[2]));
  const uniqueHexes = Array.from(new Set(hexes));
  if (uniqueHexes.length < 2) return null;
  const tl = hexes[0], tr = hexes[1], bl = hexes[2], br = hexes[3], tc = hexes[4], bc = hexes[5];
  let direction = "to right";
  let gradientColors = [tl, br];
  const isVertical = tl === tr && bl === br || tc !== bc;
  const isHorizontal = tl === bl && tr === br || tl !== tr;
  if (isVertical && !isHorizontal) {
    direction = "to bottom";
    gradientColors = [tl, bl];
  } else if (isHorizontal && !isVertical) {
    direction = "to right";
    gradientColors = [tl, tr];
  } else {
    direction = "to bottom right";
    gradientColors = [tl, br];
  }
  const finalColors = Array.from(new Set(gradientColors));
  if (finalColors.length < 2) {
    finalColors.push(uniqueHexes[uniqueHexes.length - 1]);
  }
  return {
    colors: finalColors,
    direction,
    css: `linear-gradient(${direction}, ${finalColors.join(", ")})`
  };
}
