"use client";

import { useRef, useEffect } from "react";
import { useReducedMotion } from "framer-motion";

const PALETTE = {
  deepSaffron:  "#FB941A",
  amberGlow:    "#FDA424",
  orange:       "#FCA91B",
  antiqueWhite: "#FBEAD8",
  sunlitClay:   "#FDB96C",
};

// ─── Marching squares lookup tables (identical to original lava pen) ──────────
const PLX = [0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0];
const PLY = [0,0,0,0,0,0,1,0,0,1,1,1,0,1,0,1];
const MSC = [0,3,0,3,1,3,0,3,2,2,0,2,1,1,0];
const IX  = [1,0,-1,0, 0,1,0,-1, -1,0,1,0, 0,1,1,0, 0,0,1,1];
const STEP     = 5;
const REPEL_R  = 190;
const MAX_SPD  = 3;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Pt {
  x: number; y: number;
  mag: number;       // x²+y², precomputed
  computed: number;  // last iteration this point was visited
  force: number;
}

interface Ball {
  x: number; y: number;
  mag: number;       // pos.x²+pos.y², kept in sync
  vx: number; vy: number;
  nvx: number; nvy: number; // natural velocity (spring target)
  size: number;
}

interface Meta {
  w: number; h: number;
  sx: number; sy: number;
  grid: Pt[];
  balls: Ball[];
  iter: number; sign: number;
  paint: boolean;
  fill: CanvasGradient;
}

type Cursor = [number, number, number | false];

// ─── Factory helpers ──────────────────────────────────────────────────────────
function mkPt(x: number, y: number): Pt {
  return { x, y, mag: x * x + y * y, computed: 0, force: 0 };
}

function mkBall(w: number, h: number, wh: number): Ball {
  const x  = 0.1 * w + Math.random() * w * 0.8;
  // Spawn in the upper half so blobs stay floating, not sinking to the bottom.
  const y  = 0.08 * h + Math.random() * h * 0.45;
  const vx = (Math.random() > 0.5 ? 1 : -1) * (0.2 + 0.25 * Math.random());
  // Upward bias: 70 % chance of drifting up, 30 % down
  const vy = (Math.random() > 0.7 ? 1 : -1) * (0.15 + 0.4 * Math.random());
  const size = wh / 14 + (Math.random() * 0.8 + 0.1) * (wh / 14);
  return { x, y, mag: x * x + y * y, vx, vy, nvx: vx, nvy: vy, size };
}

function createMeta(
  w: number, h: number, n: number,
  ctx: CanvasRenderingContext2D,
): Meta {
  const wh = Math.min(w, h);
  const sx = Math.floor(w / STEP);
  const sy = Math.floor(h / STEP);

  const grid: Pt[] = [];
  for (let o = 0; o < (sx + 2) * (sy + 2); o++)
    grid.push(mkPt((o % (sx + 2)) * STEP, Math.floor(o / (sx + 2)) * STEP));

  const balls = Array.from({ length: n }, () => mkBall(w, h, wh));

  // Centred radial gradient using the orange palette
  const r    = Math.max(w, h) * 0.75;
  const fill = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r);
  fill.addColorStop(0,    PALETTE.deepSaffron);
  fill.addColorStop(0.25, PALETTE.orange);
  fill.addColorStop(0.5,  PALETTE.amberGlow);
  fill.addColorStop(0.75, PALETTE.sunlitClay);
  fill.addColorStop(1,    PALETTE.antiqueWhite);

  return { w, h, sx, sy, grid, balls, iter: 0, sign: 1, paint: false, fill };
}

// ─── Metaball force field ─────────────────────────────────────────────────────
function getForce(m: Meta, t: number, i: number, idx?: number): number {
  const e = idx ?? t + i * (m.sx + 2);
  let h: number;
  if (t === 0 || i === 0 || t === m.sx || i === m.sy) {
    h = 0.6 * m.sign;
  } else {
    h = 0;
    const n = m.grid[e];
    for (const b of m.balls)
      h += (b.size * b.size) / (-2 * n.x * b.x - 2 * n.y * b.y + b.mag + n.mag);
    h *= m.sign;
  }
  m.grid[e].force = h;
  return h;
}

// ─── Marching squares path step ───────────────────────────────────────────────
function marchStep(m: Meta, ctx: CanvasRenderingContext2D, cur: Cursor): Cursor | false {
  const [t, i, prevR] = cur;
  const e = t + i * (m.sx + 2);
  if (m.grid[e].computed === m.iter) return false;

  let n = 0, r = 0;
  for (let a = 0; a < 4; a++) {
    const l = t + IX[a + 12] + (i + IX[a + 16]) * (m.sx + 2);
    let d = m.grid[l].force;
    if ((d > 0 && m.sign < 0) || (d < 0 && m.sign > 0) || !d)
      d = getForce(m, t + IX[a + 12], i + IX[a + 16], l);
    if (Math.abs(d) > 1) n += Math.pow(2, a);
  }

  if (n === 15) return [t, i - 1, false];
  if (n === 5)        r = prevR === 2 ? 3 : 1;
  else if (n === 10)  r = prevR === 3 ? 0 : 2;
  else { r = MSC[n]; m.grid[e].computed = m.iter; }

  const g0 = m.grid[t + PLX[4 * r + 2] + (i + PLY[4 * r + 2]) * (m.sx + 2)];
  const g1 = m.grid[t + PLX[4 * r + 3] + (i + PLY[4 * r + 3]) * (m.sx + 2)];
  const p  = STEP / (Math.abs(Math.abs(g0.force) - 1) / Math.abs(Math.abs(g1.force) - 1) + 1);

  ctx.lineTo(
    m.grid[t + PLX[4 * r]     + (i + PLY[4 * r])     * (m.sx + 2)].x + IX[r]     * p,
    m.grid[t + PLX[4 * r + 1] + (i + PLY[4 * r + 1]) * (m.sx + 2)].y + IX[r + 4] * p,
  );
  m.paint = true;
  return [t + IX[r + 4], i + IX[r + 8], r];
}

// ─── Per-frame update: physics + render ───────────────────────────────────────
function frame(m: Meta, ctx: CanvasRenderingContext2D, mx: number, my: number) {
  for (const b of m.balls) {
    const dx = b.x - mx, dy = b.y - my;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Cursor repulsion
    if (dist > 0 && dist < REPEL_R) {
      const f = ((REPEL_R - dist) / REPEL_R) * 4;
      b.vx += (dx / dist) * f * 0.12;
      b.vy += (dy / dist) * f * 0.12;
    }

    // Speed cap
    const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (spd > MAX_SPD) { b.vx = (b.vx / spd) * MAX_SPD; b.vy = (b.vy / spd) * MAX_SPD; }

    // Spring return to natural velocity when outside repel zone
    if (dist >= REPEL_R) {
      b.vx += (b.nvx - b.vx) * 0.04;
      b.vy += (b.nvy - b.vy) * 0.04;
    }

    // Wall bounce — lower ceiling at 62 % keeps blobs floating in the upper hero.
    const lowerWall = m.h * 0.62 - b.size;
    if      (b.x >= m.w - b.size) { if (b.vx > 0) b.vx = -b.vx; b.x = m.w - b.size; }
    else if (b.x <= b.size)        { if (b.vx < 0) b.vx = -b.vx; b.x = b.size; }
    if      (b.y >= lowerWall)     { if (b.vy > 0) b.vy = -b.vy; b.y = lowerWall; }
    else if (b.y <= b.size)        { if (b.vy < 0) b.vy = -b.vy; b.y = b.size; }

    b.x += b.vx; b.y += b.vy;
    b.mag = b.x * b.x + b.y * b.y;
  }

  // Marching squares render
  m.iter++; m.sign = -m.sign; m.paint = false;
  ctx.fillStyle = m.fill;
  ctx.beginPath();

  for (const b of m.balls) {
    let cur: Cursor = [Math.round(b.x / STEP), Math.round(b.y / STEP), false];
    let next: Cursor | false;
    do {
      next = marchStep(m, ctx, cur);
      if (next) cur = next;
    } while (next);
    if (m.paint) {
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      m.paint = false;
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LiquidBlobBackground() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef     = useRef({ x: -9999, y: -9999 });
  const reduced      = useReducedMotion() ?? false;

  useEffect(() => {
    if (reduced) return;
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let meta: Meta;
    let canvasLeft = 0, canvasTop = 0;

    const rebuild = () => {
      const r       = container.getBoundingClientRect();
      canvas.width  = r.width;
      canvas.height = r.height;
      const cr = canvas.getBoundingClientRect();
      canvasLeft = cr.left;
      canvasTop  = cr.top;
      meta = createMeta(canvas.width, canvas.height, 7, ctx);
    };
    const syncRect = () => {
      const cr = canvas.getBoundingClientRect();
      canvasLeft = cr.left;
      canvasTop  = cr.top;
    };
    rebuild();

    let raf: number;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame(meta, ctx, mouseRef.current.x - canvasLeft, mouseRef.current.y - canvasTop);
    };
    raf = requestAnimationFrame(animate);

    const onMove  = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    window.addEventListener("resize",    rebuild,  { passive: true });
    window.addEventListener("scroll",    syncRect, { passive: true });
    window.addEventListener("mousemove", onMove,   { passive: true });
    document.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    rebuild);
      window.removeEventListener("scroll",    syncRect);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-white" />

      {!reduced && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.72 }}
        />
      )}

      {/* Soft centre vignette keeps headline legible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 38%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.45) 55%, transparent 100%)",
        }}
      />
    </div>
  );
}
