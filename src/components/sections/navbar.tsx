"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import SVGComponent from "@/components/sections/logo";
import { useAuth } from "@/features/auth/context/AuthContext";

const NAV_LINKS = [
  { href: "#problems", label: "Why Bizify", id: "problems" },
  { href: "#features", label: "Features", id: "features" },
  { href: "#hiw", label: "How it works", id: "hiw" },
  { href: "#pricing", label: "Pricing", id: "pricing" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-spy: track which section is in the upper portion of viewport
  useEffect(() => {
    const sections = NAV_LINKS.map((l) =>
      document.getElementById(l.id)
    ).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { threshold: 0.25, rootMargin: "-72px 0px -40% 0px" }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLinkClick = () => setIsMenuOpen(false);

  return (
    <>
      {/* Floating pill navbar */}
      <motion.div
        aria-label="Main navigation"
        className="fixed top-4 left-0 right-0 z-50 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav
          className={`max-w-5xl mx-auto flex items-center justify-between rounded-xl py-2.5 px-5 transition-all duration-300 ${
            isScrolled
              ? "bg-[#FAFAFA]/96 backdrop-blur-md border border-[#E9E9E9] shadow-[0_4px_24px_-4px_rgba(28,28,30,0.09),0_0_0_1px_rgba(28,28,30,0.04)]"
              : "bg-[#FAFAFA] border border-[#E9E9E9] shadow-[0_2px_12px_-2px_rgba(28,28,30,0.07),0_0_0_1px_rgba(28,28,30,0.03)]"
          }`}
        >
          {/* Logo */}
          <Link
            href="#"
            className="flex items-center gap-2 shrink-0"
            onClick={handleLinkClick}
          >
            <SVGComponent className="h-6 w-auto" />
            <span
              className="text-[1.5rem] tracking-wide leading-none text-[#1C1C1E]"
              style={{ fontFamily: "var(--font-cormorant-sc)" }}
            >
              Bizify
            </span>
          </Link>

          {/* Desktop nav links — absolute center */}
          <div className="hidden lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors duration-150 ${
                    isActive
                      ? "text-[#1C1C1E] bg-[#F5F5F5]"
                      : "text-[#8C8C8C] hover:text-[#1C1C1E] hover:bg-[#F5F5F5]"
                  }`}
                >
                  {link.label}
                  {/* Amber active dot */}
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500 transition-all duration-200"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: `translateX(-50%) scale(${isActive ? 1 : 0.4})`,
                    }}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {!loading && user ? (
              <Link href="/dashboard">
                <Button variant="primary-gradient" size="sm" className="px-4 h-8">
                  Dashboard
                </Button>
              </Link>
            ) : !loading ? (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-4 h-8 text-[#8C8C8C] hover:text-[#1C1C1E]"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary-gradient" size="sm" className="px-4 h-8">
                    Get started
                  </Button>
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile toggle */}
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 text-[#1C1C1E]" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5 text-[#1C1C1E]" aria-hidden="true" />
            )}
          </Button>
        </nav>
      </motion.div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMenuOpen(false)}
            role="presentation"
          />
        )}
      </AnimatePresence>

      {/* Mobile slide panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-full max-w-xs bg-[#FAFAFA] shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onKeyDown={(e) => e.key === "Escape" && setIsMenuOpen(false)}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9E9E9]">
          <Link
            href="#"
            className="flex items-center gap-2"
            onClick={handleLinkClick}
          >
            <SVGComponent className="h-7 w-auto" />
            <span
              className="text-[1.75rem] font-semibold tracking-wide leading-none text-[#1C1C1E]"
              style={{ fontFamily: "var(--font-cormorant-sc)" }}
            >
              Bizify
            </span>
          </Link>
          <Button
            onClick={() => setIsMenuOpen(false)}
            variant="ghost"
            size="icon"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-[#1C1C1E]" aria-hidden="true" />
          </Button>
        </div>

        {/* Panel nav links */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-amber-50 text-[#1C1C1E]"
                      : "text-[#8C8C8C] hover:text-[#1C1C1E] hover:bg-[#F5F5F5]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                      isActive ? "bg-amber-500" : "bg-transparent"
                    }`}
                    aria-hidden="true"
                  />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Panel CTAs */}
        <div className="px-5 py-6 border-t border-[#E9E9E9] space-y-2.5">
          {!loading && user ? (
            <Link href="/dashboard" onClick={handleLinkClick} className="block">
              <Button variant="primary-gradient" size="lg" className="w-full h-11">
                Dashboard
              </Button>
            </Link>
          ) : !loading ? (
            <>
              <Link href="/signup" onClick={handleLinkClick} className="block">
                <Button variant="primary-gradient" size="lg" className="w-full h-11">
                  Get started
                </Button>
              </Link>
              <Link href="/login" onClick={handleLinkClick} className="block">
                <Button variant="outline" size="lg" className="w-full h-11 text-[#8C8C8C]">
                  Log in
                </Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
