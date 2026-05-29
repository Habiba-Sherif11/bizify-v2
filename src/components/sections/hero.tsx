"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import mockBg from "@/assets/imgs/landing/mock-bg.png";
import heroBg from "@/assets/imgs/landing/hero-bg.png";

// ── Headline config ──────────────────────────────────────────────────────────
const HEADLINE = "From idea to launch with an AI co-founder by your side.";
const HEADLINE_WORDS = (() => {
  let offset = 0;
  return HEADLINE.split(" ").map((word) => {
    const start = offset;
    offset += word.length + 1; // +1 for the trailing space
    return { word, start };
  });
})();

// ── Three.js particle canvas ─────────────────────────────────────────────────
// Uses raw Float32Array math — no per-frame Vector3 allocations.
function WovenCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const PARTICLES = 20_000;
    const REPEL_RADIUS = 1.5;
    const REPEL_RADIUS_SQ = REPEL_RADIUS * REPEL_RADIUS;
    const RETURN_STRENGTH = 0.0008;
    const DAMPING = 0.96;
    const FORCE_SCALE = 0.012;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const clock = new THREE.Clock();
    let mouseX = 0;
    let mouseY = 0;

    // Build geometry from a TorusKnot surface
    const knot = new THREE.TorusKnotGeometry(1.5, 0.5, 200, 32);
    const knotPos = knot.attributes.position;

    const positions = new Float32Array(PARTICLES * 3);
    const originals = new Float32Array(PARTICLES * 3);
    const colors = new Float32Array(PARTICLES * 3);
    const baseColors = new Float32Array(PARTICLES * 3);
    const velocities = new Float32Array(PARTICLES * 3);
    const tempColor = new THREE.Color();

    // Hover accent: warm violet — distinct from amber and cyan
    const hoverColor = new THREE.Color();
    hoverColor.setHSL(0.77, 1.0, 0.85);
    const hr = hoverColor.r, hg = hoverColor.g, hb = hoverColor.b;
    const COLOR_LERP = 0.07;

    for (let i = 0; i < PARTICLES; i++) {
      const v = i % knotPos.count;
      const x = knotPos.getX(v);
      const y = knotPos.getY(v);
      const z = knotPos.getZ(v);
      positions[i * 3] = originals[i * 3] = x;
      positions[i * 3 + 1] = originals[i * 3 + 1] = y;
      positions[i * 3 + 2] = originals[i * 3 + 2] = z;

      // Amber (~38°) and cyan (~187°) — Bizify brand colors
      const isAmber = Math.random() > 0.4;
      tempColor.setHSL(
        isAmber ? 0.093 + Math.random() * 0.04 : 0.508 + Math.random() * 0.04,
        0.88,
        0.52 + Math.random() * 0.22,
      );
      colors[i * 3] = baseColors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = baseColors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = baseColors[i * 3 + 2] = tempColor.b;
    }
    knot.dispose();

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.022,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Input listeners
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Animation loop — no Vector3 allocations inside
    let rafId = 0;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (document.hidden) return;

      const mx = mouseX * 3.2;
      const my = mouseY * 3.2;

      for (let i = 0; i < PARTICLES; i++) {
        const ix = i * 3;
        const iy = ix + 1;
        const iz = ix + 2;

        const dx = positions[ix] - mx;
        const dy = positions[iy] - my;
        const dz = positions[iz];
        const distSq = dx * dx + dy * dy + dz * dz;

        const inRepel = distSq < REPEL_RADIUS_SQ;
        if (inRepel) {
          const dist = Math.sqrt(distSq) + 0.001;
          const force = (REPEL_RADIUS - dist) * FORCE_SCALE / dist;
          velocities[ix] += dx * force;
          velocities[iy] += dy * force;
          velocities[iz] += dz * force;
        }

        // Lerp particle color toward hover accent when repelled
        const tr = inRepel ? hr : baseColors[ix];
        const tg = inRepel ? hg : baseColors[iy];
        const tb = inRepel ? hb : baseColors[iz];
        colors[ix] += (tr - colors[ix]) * COLOR_LERP;
        colors[iy] += (tg - colors[iy]) * COLOR_LERP;
        colors[iz] += (tb - colors[iz]) * COLOR_LERP;

        velocities[ix] += (originals[ix] - positions[ix]) * RETURN_STRENGTH;
        velocities[iy] += (originals[iy] - positions[iy]) * RETURN_STRENGTH;
        velocities[iz] += (originals[iz] - positions[iz]) * RETURN_STRENGTH;

        velocities[ix] *= DAMPING;
        velocities[iy] *= DAMPING;
        velocities[iz] *= DAMPING;

        positions[ix] += velocities[ix];
        positions[iy] += velocities[iy];
        positions[iz] += velocities[iz];
      }

      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      points.rotation.y = clock.getElapsedTime() * 0.05;
      renderer.render(scene, camera);
    };

    // Defer init so the critical rendering path finishes first
    const initTimeout = setTimeout(tick, 150);

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      clearTimeout(initTimeout);
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" aria-hidden="true" />;
}

// ── Hero ─────────────────────────────────────────────────────────────────────
export function Hero() {
  const { user, loading } = useAuth();
  const letterControls = useAnimation();
  const subControls = useAnimation();
  const ctaControls = useAnimation();
  const mockupControls = useAnimation();

  useEffect(() => {
    // Character-by-character stagger
    letterControls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: (i as number) * 0.04 + 0.5,
        duration: 0.65,
        ease: [0.2, 0.65, 0.3, 0.9] as [number, number, number, number],
      },
    }));

    subControls.start({
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.6,
        duration: 0.7,
        ease: "easeOut",
      },
    });

    ctaControls.start({
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.9,
        duration: 0.7,
        ease: "easeOut",
      },
    });

    mockupControls.start({
      opacity: 1,
      y: 0,
      transition: {
        delay: 2.1,
        duration: 1.0,
        ease: "easeOut",
      },
    });
  }, [letterControls, subControls, ctaControls, mockupControls]);

  return (
    <section className="hero group relative w-full overflow-hidden flex flex-col mb-10">
      {/* Hero background image */}
      <Image
        src={heroBg}
        alt=""
        fill
        className="object-cover object-center"
        priority
        aria-hidden="true"
      />
      {/* Blur overlay */}
      <div className="absolute inset-0 z-1 backdrop-blur-sm bg-white/10 transition-all duration-500 group-hover:bg-white/5" aria-hidden="true" />
      <WovenCanvas />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-6">
        <div className="w-full max-w-5xl mx-auto text-center">
          {/* Letter-by-letter headline */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 leading-tight tracking-tight"
            aria-label={HEADLINE}
          >
            {HEADLINE_WORDS.map(({ word, start }, wi) => (
              <span key={wi} className="inline-block">
                {word.split("").map((char, ci) => (
                  <motion.span
                    key={ci}
                    custom={start + ci}
                    initial={{ opacity: 0, y: 40 }}
                    animate={letterControls}
                    style={{ display: "inline-block" }}
                  >
                    {char}
                  </motion.span>
                ))}
                {wi < HEADLINE_WORDS.length - 1 && (
                  <span style={{ display: "inline-block" }}>&nbsp;</span>
                )}
              </span>
            ))}
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={subControls}
            className="mt-6 text-base sm:text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed"
          >
            Bizify is the first AI-powered platform that guides you through every
            step of building a startup — from your first idea to your first customer.
          </motion.p>

          {/* Auth-aware CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={ctaControls}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          >
            {!loading && user ? (
              <Button asChild variant="primary-gradient" size="lg" className="min-w-44">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : !loading ? (
              <>
                <Button asChild variant="primary-gradient" size="lg" className="min-w-44">
                  <Link href="/signup">Get started now</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="min-w-44 border-cyan-600 text-cyan-600 hover:bg-cyan-50"
                >
                  <Link href="/login">Start free trial</Link>
                </Button>
              </>
            ) : null}
          </motion.div>

          {/* Dashboard screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 56 }}
            animate={mockupControls}
            className="mt-8 w-full max-w-5xl mx-auto"
          >
            <div
              className="relative w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-xl shadow-neutral-200/60"
              style={{ aspectRatio: `${mockBg.width} / ${mockBg.height / 2}` }}
            >
              <Image
                src={mockBg}
                alt="Bizify Dashboard"
                width={mockBg.width}
                height={mockBg.height}
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none bg-linear-to-t from-white to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
