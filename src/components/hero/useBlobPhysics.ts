"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";

const REPEL_RADIUS = 220;
const MAX_REPEL = 70;
const SPRING = { stiffness: 32, damping: 18, mass: 2 };

export function useBlobPhysics(
  mouseRef: React.RefObject<{ x: number; y: number }>,
  centerRef: React.RefObject<{ x: number; y: number }>,
  enabled: boolean,
): { springX: MotionValue<number>; springY: MotionValue<number> } {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, SPRING);
  const springY = useSpring(rawY, SPRING);

  useEffect(() => {
    if (!enabled) return;
    let rafId: number;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const { x: mx, y: my } = mouseRef.current;
      const { x: cx, y: cy } = centerRef.current;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0 && dist < REPEL_RADIUS) {
        const s = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * MAX_REPEL;
        rawX.set(-(dx / dist) * s);
        rawY.set(-(dy / dist) * s);
      } else {
        rawX.set(0);
        rawY.set(0);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, mouseRef, centerRef, rawX, rawY]);

  return { springX, springY };
}
