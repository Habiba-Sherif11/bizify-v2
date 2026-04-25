"use client";

import { useEffect, useState, useRef } from "react";

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cleanupFnsRef = useRef<(() => void)[]>([]);

  useEffect(() => setMounted(true), []);

  // ── Main animation logic ──
  useEffect(() => {
    if (!mounted) return;

    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".scroll-fade, .stagger-children").forEach(el =>
        el.classList.add("visible")
      );
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // 1. Make hero elements visible instantly
    container.querySelectorAll(".hero h1, .hero .text-neutral-600, .hero button").forEach(el =>
      el.classList.add("visible")
    );

    // 2. Add hidden state to all other animatable elements
    const animatable = container.querySelectorAll<HTMLElement>(
      "section, .card, .rounded-2xl, .grid > div, .process-card, [class*='SolutionCard'], section h2, section h3, section p"
    );
    animatable.forEach(el => {
      if (el.closest(".hero")) return; // leave hero untouched
      el.classList.add("scroll-fade");
    });

    // Force a style recalculation so the browser knows about the hidden state
    void container.offsetHeight;

    // 3. Wait for the hidden state to actually paint, then set up the observer
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // ── Scroll direction tracking ──
        let lastScrollY = window.scrollY;
        let scrollDirection: "up" | "down" = "down";
        const onScroll = () => {
          const currentY = window.scrollY;
          if (Math.abs(currentY - lastScrollY) > 5) {
            scrollDirection = currentY < lastScrollY ? "up" : "down";
          }
          lastScrollY = currentY;
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        // ── Intersection Observer ──
        const hideTimers = new Map<Element, ReturnType<typeof setTimeout>>();
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              const el = entry.target;
              if (entry.isIntersecting) {
                const pending = hideTimers.get(el);
                if (pending) {
                  clearTimeout(pending);
                  hideTimers.delete(el);
                }
                el.classList.add("visible");
              } else {
                if (scrollDirection !== "up") return;
                const pending = hideTimers.get(el);
                if (pending) clearTimeout(pending);
                hideTimers.set(
                  el,
                  setTimeout(() => {
                    el.classList.remove("visible");
                    hideTimers.delete(el);
                  }, 200)
                );
              }
            });
          },
          { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
        );

        document.querySelectorAll(".scroll-fade, .stagger-children").forEach(el =>
          observer.observe(el)
        );

        observerRef.current = observer;

        // Store cleanup for this effect
        const cleanup = () => {
          window.removeEventListener("scroll", onScroll);
          hideTimers.forEach(t => clearTimeout(t));
        };
        cleanupFnsRef.current.push(cleanup);
      });
    });

    return () => {
      cleanupFnsRef.current.forEach(fn => fn());
      cleanupFnsRef.current = [];
    };
  }, [mounted]);

  // ── Final unmount cleanup ──
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      cleanupFnsRef.current.forEach(fn => fn());
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}