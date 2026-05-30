"use client";

import { useRef, useEffect, useMemo, memo } from "react";
import { motion } from "framer-motion";
import type { BlobDef } from "./blob-utils";
import { morphKeyframes } from "./blob-utils";
import { useBlobPhysics } from "./useBlobPhysics";

interface Props {
  def: BlobDef;
  mouseRef: React.RefObject<{ x: number; y: number }>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
}

export const LiquidBlob = memo(function LiquidBlob({
  def,
  mouseRef,
  containerRef,
  reducedMotion,
}: Props) {
  const centerRef = useRef({ x: -9999, y: -9999 });

  // Compute stable blob center from container dimensions + percentage position
  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      centerRef.current = {
        x: r.left + (def.xPct / 100) * r.width,
        y: r.top + (def.yPct / 100) * r.height,
      };
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [containerRef, def.xPct, def.yPct]);

  const { springX, springY } = useBlobPhysics(mouseRef, centerRef, !reducedMotion);

  // Generate morph keyframes once on mount per blob
  const morphFrames = useMemo(() => {
    const frames = morphKeyframes(5);
    return [...frames, frames[0]]; // loop back to start
  }, []);

  const gradient = `radial-gradient(ellipse at 38% 38%, ${def.colorA}DD 0%, ${def.colorB}88 52%, transparent 76%)`;

  const baseStyle = {
    left: `${def.xPct}%`,
    top: `${def.yPct}%`,
    width: def.size,
    height: def.size,
    marginLeft: -def.size / 2,
    marginTop: -def.size / 2,
  } as const;

  if (reducedMotion) {
    return (
      <div
        className="absolute pointer-events-none"
        style={{
          ...baseStyle,
          borderRadius: "50%",
          background: gradient,
          filter: `blur(${def.blurPx}px)`,
          opacity: def.opacity,
        }}
      />
    );
  }

  return (
    <motion.div
      className="absolute pointer-events-none will-change-transform"
      style={{ ...baseStyle, x: springX, y: springY }}
    >
      <motion.div
        className="w-full h-full pointer-events-none"
        style={{
          background: gradient,
          filter: `blur(${def.blurPx}px)`,
          opacity: def.opacity,
        }}
        animate={{
          borderRadius: morphFrames,
          y: [0, -14, 6, -6, 0],
          scale: [1, 1.035, 0.978, 1.02, 1],
        }}
        transition={{
          borderRadius: {
            duration: def.morphDur,
            delay: def.morphDelay,
            repeat: Infinity,
            ease: "easeInOut",
          },
          y: {
            duration: def.floatDur,
            delay: def.floatDelay,
            repeat: Infinity,
            ease: "easeInOut",
          },
          scale: {
            duration: def.floatDur * 0.85,
            delay: def.floatDelay + 0.4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />
    </motion.div>
  );
});
