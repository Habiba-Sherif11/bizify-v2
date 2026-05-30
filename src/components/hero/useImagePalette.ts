"use client";

import { useState, useEffect } from "react";

// Pre-extracted from hero-bg.png: warm amber, golden amber, light gold, sky blue, pale blue, ice blue, sage, lavender
const SEED: string[] = [
  "#F7A520", "#F5B54A", "#FBCF65",
  "#7EC9E8", "#9DDBEC", "#B5E5F5",
  "#C2D5B5", "#C4C5E5",
];

function toHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function colorDist(a: number[], b: number[]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function quantize(data: Uint8ClampedArray, k: number): string[] {
  const pixels: number[][] = [];
  for (let i = 0; i < data.length; i += 12) {
    if (data[i + 3] > 200) pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (pixels.length < k) return SEED;

  const step = Math.floor(pixels.length / k);
  let centroids = Array.from({ length: k }, (_, i) => [...pixels[i * step]]);

  for (let iter = 0; iter < 8; iter++) {
    const buckets: number[][][] = Array.from({ length: k }, () => []);
    for (const px of pixels) {
      let best = 0, bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        const d = colorDist(px, centroids[c]);
        if (d < bestDist) { bestDist = d; best = c; }
      }
      buckets[best].push(px);
    }
    centroids = buckets.map((b, i) => {
      if (!b.length) return centroids[i];
      const sum = b.reduce(
        (acc, px) => [acc[0] + px[0], acc[1] + px[1], acc[2] + px[2]],
        [0, 0, 0],
      );
      return sum.map((v) => Math.round(v / b.length));
    });
  }

  return centroids.map(([r, g, b]) => toHex(r, g, b));
}

export function useImagePalette(src: string): string[] {
  const [palette, setPalette] = useState<string[]>(SEED);

  useEffect(() => {
    if (typeof window === "undefined" || !src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 80;
        canvas.height = 80;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 80, 80);
        const data = ctx.getImageData(0, 0, 80, 80).data;
        const extracted = quantize(data, 8);
        setPalette(extracted);
      } catch {
        /* Canvas blocked by security policy — keep seed palette */
      }
    };
    img.src = src;
  }, [src]);

  return palette;
}
