"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, ChevronLeft, ChevronRight, BookOpen,
  GraduationCap, Trophy, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SPOTLIGHT_STEPS, TOTAL_STEPS } from "../data";

// ─── Keys ──────────────────────────────────────────────────────────────────────

const DISMISSED_KEY = "bizify-tour-dismissed";
const STARTED_KEY   = "bizify-tour-started";
const COMPLETED_KEY = "bizify-tour-completed";
const STEP_KEY      = "bizify-tour-step";

type TourStatus = "idle" | "welcome" | "touring" | "done" | "minimized";

// ─── Progress dots ─────────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full transition-all duration-200",
            i === current  ? "w-4 h-1.5 bg-cyan-500"
            : i < current  ? "w-1.5 h-1.5 bg-cyan-300 dark:bg-cyan-700"
            :                 "w-1.5 h-1.5 bg-white/30"
          )}
        />
      ))}
    </div>
  );
}

// ─── Floating trigger ─────────────────────────────────────────────────────────

function FloatingTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Open guide"
      className={cn(
        "fixed bottom-6 inset-e-6 z-50",
        "w-12 h-12 rounded-full",
        "bg-linear-to-br from-cyan-500 to-cyan-600",
        "shadow-lg shadow-cyan-500/30",
        "flex items-center justify-center text-white cursor-pointer"
      )}
    >
      <BookOpen size={20} />
    </button>
  );
}

// ─── Welcome modal ────────────────────────────────────────────────────────────

function WelcomeModal({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <GraduationCap size={32} className="text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Welcome to Bizify! 🎉</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Take a quick guided tour to learn how the platform works and make the most of every feature.
          </p>
        </div>
        <div className="w-full flex flex-col gap-3">
          <button type="button" onClick={onStart}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-linear-to-r from-cyan-500 to-cyan-600 shadow-md shadow-cyan-500/20 cursor-pointer">
            Start Tour
          </button>
          <button type="button" onClick={onSkip}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 bg-neutral-100 dark:bg-neutral-700 cursor-pointer">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Done card ────────────────────────────────────────────────────────────────

function DoneOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Trophy size={32} className="text-white" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tour Complete! 🎉</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">You&apos;re all set to start building with Bizify.</p>
        </div>
        <button type="button" onClick={onClose}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-linear-to-r from-cyan-500 to-cyan-600 cursor-pointer">
          Let&apos;s go!
        </button>
      </div>
    </div>
  );
}

// ─── Spotlight + info card ─────────────────────────────────────────────────────

interface SpotlightViewProps {
  stepIndex: number;
  targetRect: DOMRect | null;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

function SpotlightView({ stepIndex, targetRect, onBack, onNext, onSkip }: SpotlightViewProps) {
  const step = SPOTLIGHT_STEPS[stepIndex];
  const isLast = stepIndex === TOTAL_STEPS - 1;
  const PAD = 12;
  const CARD_W = 384;
  const CARD_H = 260;

  // Position info card
  let cardStyle: React.CSSProperties;
  let arrowUp = false;
  let arrowDown = false;

  if (!targetRect) {
    cardStyle = {
      position: "fixed",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: CARD_W,
      zIndex: 202,
    };
  } else {
    const spaceBelow = (typeof window !== "undefined" ? window.innerHeight : 800) - targetRect.bottom - 20;
    const showBelow  = spaceBelow >= CARD_H;
    const top = showBelow ? targetRect.bottom + 16 : targetRect.top - CARD_H - 16;
    const vw  = typeof window !== "undefined" ? window.innerWidth : 1200;
    const idealLeft = targetRect.left + targetRect.width / 2 - CARD_W / 2;
    const left = Math.max(16, Math.min(idealLeft, vw - CARD_W - 16));

    cardStyle = { position: "fixed", top, left, width: CARD_W, zIndex: 202 };
    if (showBelow) arrowUp = true;
    else arrowDown = true;
  }

  return (
    <>
      {/* Full-screen dim */}
      <div className="fixed inset-0 z-199 pointer-events-none" style={{ background: "rgba(0,0,0,0.65)" }} />

      {/* Spotlight lens — creates the visible "hole" via box-shadow */}
      {targetRect && (
        <div
          style={{
            position: "fixed",
            left:   targetRect.left - PAD,
            top:    targetRect.top  - PAD,
            width:  targetRect.width  + PAD * 2,
            height: targetRect.height + PAD * 2,
            borderRadius: 14,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
            border: "2px solid rgba(6,182,212,0.7)",
            zIndex: 200,
            pointerEvents: "none",
            transition: "all 0.3s ease",
          }}
        />
      )}

      {/* Info card */}
      <div style={cardStyle} className="animate-in fade-in zoom-in-95 duration-200">
        {/* Arrow pointing up (card is below target) */}
        {arrowUp && (
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0
            border-l-10 border-l-transparent
            border-r-10 border-r-transparent
            border-b-10 border-b-white dark:border-b-neutral-800" />
        )}

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Card header */}
          <div className="px-5 pt-4 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-cyan-500" />
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">
                {step.stage} · {stepIndex + 1}/{TOTAL_STEPS}
              </span>
            </div>
            <button type="button" onClick={onSkip}
              className="w-7 h-7 flex items-center justify-center text-gray-400 rounded-lg cursor-pointer">
              <X size={14} />
            </button>
          </div>

          {/* Card body */}
          <div className="px-5 pt-3 pb-4 space-y-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{step.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>

            {step.helpText && (
              <div className="rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/30 px-3.5 py-3">
                <p className="text-xs text-cyan-700 dark:text-cyan-300 leading-relaxed">
                  🚀 {step.helpText}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <ProgressDots total={TOTAL_STEPS} current={stepIndex} />
              <div className="flex items-center gap-2">
                <button type="button" onClick={onBack} disabled={stepIndex === 0}
                  className={cn(
                    "w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-600",
                    "flex items-center justify-center text-gray-500 dark:text-gray-400",
                    "disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  )}>
                  <ChevronLeft size={14} />
                </button>
                <button type="button" onClick={onNext}
                  className="px-4 h-8 rounded-lg bg-linear-to-r from-cyan-500 to-cyan-600 text-white text-xs font-medium flex items-center gap-1 cursor-pointer">
                  {isLast ? "Finish" : "Next"}{!isLast && <ChevronRight size={12} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow pointing down (card is above target) */}
        {arrowDown && (
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0
            border-l-10 border-l-transparent
            border-r-10 border-r-transparent
            border-t-10 border-t-white dark:border-t-neutral-800" />
        )}
      </div>
    </>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function GuidanceTour() {
  const [status, setStatus]       = useState<TourStatus>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [mounted, setMounted]     = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  // Init from localStorage — instant
  useEffect(() => {
    if (!mounted) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY) === "true";
    const completed = localStorage.getItem(COMPLETED_KEY) === "true";
    const started   = localStorage.getItem(STARTED_KEY)   === "true";
    if (dismissed || completed) { setStatus("minimized"); return; }
    if (!started)               { setStatus("welcome");   return; }
    const saved = parseInt(localStorage.getItem(STEP_KEY) ?? "0", 10);
    setStepIndex(Math.min(saved, TOTAL_STEPS - 1));
    setStatus("touring");
  }, [mounted]);

  // Find & track the spotlight target whenever step changes
  useEffect(() => {
    if (status !== "touring") { setTargetRect(null); return; }

    const step = SPOTLIGHT_STEPS[stepIndex];
    if (!step?.target) { setTargetRect(null); return; }

    const findTarget = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (!el) { setTargetRect(null); return; }
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Wait for scroll to settle, then measure
      if (rectTimerRef.current) clearTimeout(rectTimerRef.current);
      rectTimerRef.current = setTimeout(() => {
        setTargetRect(el.getBoundingClientRect());
      }, 300);
    };

    findTarget();

    const onUpdate = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) setTargetRect(el.getBoundingClientRect());
    };
    window.addEventListener("scroll", onUpdate, { passive: true });
    window.addEventListener("resize", onUpdate);
    return () => {
      window.removeEventListener("scroll", onUpdate);
      window.removeEventListener("resize", onUpdate);
      if (rectTimerRef.current) clearTimeout(rectTimerRef.current);
    };
  }, [status, stepIndex]);

  const handleStart = useCallback(() => {
    localStorage.setItem(STARTED_KEY, "true");
    localStorage.setItem(STEP_KEY, "0");
    setStepIndex(0);
    setStatus("touring");
  }, []);

  const handleSkip = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setStatus("minimized");
  }, []);

  const handleNext = useCallback(() => {
    const next = stepIndex + 1;
    if (next >= TOTAL_STEPS) {
      localStorage.setItem(COMPLETED_KEY, "true");
      setStatus("done");
    } else {
      setStepIndex(next);
      localStorage.setItem(STEP_KEY, String(next));
    }
  }, [stepIndex]);

  const handleBack = useCallback(() => {
    if (stepIndex > 0) {
      const prev = stepIndex - 1;
      setStepIndex(prev);
      localStorage.setItem(STEP_KEY, String(prev));
    }
  }, [stepIndex]);

  const handleReopen = useCallback(() => {
    const started = localStorage.getItem(STARTED_KEY) === "true";
    setStatus(started ? "touring" : "welcome");
  }, []);

  if (!mounted || status === "idle")    return null;
  if (status === "minimized")           return <FloatingTrigger onClick={handleReopen} />;
  if (status === "welcome")             return <WelcomeModal onStart={handleStart} onSkip={handleSkip} />;
  if (status === "done")                return <DoneOverlay onClose={() => setStatus("minimized")} />;

  return (
    <SpotlightView
      stepIndex={stepIndex}
      targetRect={targetRect}
      onBack={handleBack}
      onNext={handleNext}
      onSkip={handleSkip}
    />
  );
}
