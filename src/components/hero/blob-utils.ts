export function organicRadius(): string {
  const n = () => Math.floor(Math.random() * 40 + 30);
  const [a, b, c] = [n(), n(), n()];
  const [e, f] = [n(), n()];
  return `${a}% ${100 - a}% ${100 - c}% ${c}% / ${e}% ${f}% ${100 - f}% ${100 - e}%`;
}

export function morphKeyframes(count: number): string[] {
  return Array.from({ length: count }, organicRadius);
}

export interface BlobDef {
  id: number;
  xPct: number;
  yPct: number;
  size: number;
  colorA: string;
  colorB: string;
  blurPx: number;
  opacity: number;
  floatDur: number;
  floatDelay: number;
  morphDur: number;
  morphDelay: number;
}

export function createBlobDefs(palette: string[]): BlobDef[] {
  const p = Array.from({ length: 8 }, (_, i) => palette[i % palette.length]);
  return [
    { id: 0, xPct: 12, yPct: 20, size: 560, colorA: p[0], colorB: p[1], blurPx: 90, opacity: 0.55, floatDur: 20, floatDelay: 0,   morphDur: 14, morphDelay: 0   },
    { id: 1, xPct: 88, yPct: 28, size: 500, colorA: p[3], colorB: p[4], blurPx: 85, opacity: 0.50, floatDur: 24, floatDelay: 3,   morphDur: 16, morphDelay: 2   },
    { id: 2, xPct: 52, yPct: 5,  size: 360, colorA: p[2], colorB: p[0], blurPx: 70, opacity: 0.42, floatDur: 18, floatDelay: 1.5, morphDur: 12, morphDelay: 4   },
    { id: 3, xPct: 22, yPct: 78, size: 320, colorA: p[6], colorB: p[3], blurPx: 65, opacity: 0.40, floatDur: 22, floatDelay: 2,   morphDur: 15, morphDelay: 1   },
    { id: 4, xPct: 78, yPct: 80, size: 300, colorA: p[7], colorB: p[5], blurPx: 60, opacity: 0.45, floatDur: 17, floatDelay: 4,   morphDur: 13, morphDelay: 3   },
    { id: 5, xPct: 62, yPct: 52, size: 220, colorA: p[1], colorB: p[2], blurPx: 50, opacity: 0.50, floatDur: 14, floatDelay: 0.5, morphDur: 10, morphDelay: 5   },
    { id: 6, xPct: 8,  yPct: 58, size: 200, colorA: p[4], colorB: p[3], blurPx: 45, opacity: 0.42, floatDur: 16, floatDelay: 2.5, morphDur: 11, morphDelay: 2   },
    { id: 7, xPct: 44, yPct: 92, size: 160, colorA: p[0], colorB: p[5], blurPx: 40, opacity: 0.38, floatDur: 12, floatDelay: 1,   morphDur: 9,  morphDelay: 6   },
  ];
}
