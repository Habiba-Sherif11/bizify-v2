"use client";

// External libraries
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

// Internal components
import { Button } from "@/components/ui/button";
import SVGComponent from "@/components/sections/logo";
import { useAuth } from "@/features/auth/context/AuthContext";

const NAV_LINKS = [
  { href: "#problems", label: "Why Bizify" },
  { href: "#features", label: "Features" },
  { href: "#hiw", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  // ---- State ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, loading } = useAuth();

  // ---- Effects ----
  // Scroll state
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // ---- Handlers ----
  const handleLinkClick = () => setIsMenuOpen(false);

  // ---- Render ----
  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-neutral-200 shadow-lg"
            : "bg-white border-neutral-200 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 relative">
            {/* Logo */}
            <Link
              href="#"
              className="flex items-center gap-2 group shrink-0"
              onClick={handleLinkClick}
            >
              <SVGComponent className="h-8 w-auto transition-transform group-hover:scale-105 duration-200" />
              <span
                className="text-xl font-semibold text-neutral-900"
                style={{ fontFamily: "var(--font-cormorant-sc)" }}
              >
                Bizify
              </span>
            </Link>

            {/* Desktop Navigation Links (centered) */}
            <div className="hidden lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:flex items-center gap-6 lg:gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-neutral-600 text-sm font-medium hover:text-neutral-900 transition-colors relative group whitespace-nowrap"
                >
                  {link.label}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-amber-500 to-yellow-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                </Link>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex gap-3 shrink-0">
              {!loading && user ? (
                <Link href="/dashboard">
                  <Button variant="primary-gradient" size="sm" className="min-w-32">
                    Dashboard
                  </Button>
                </Link>
              ) : !loading ? (
                <>
                  <Link href="/signup">
                    <Button variant="primary-gradient" size="sm" className="min-w-32">
                      Start Now
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-32 border-cyan-600 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-700"
                    >
                      Start free trial
                    </Button>
                  </Link>
                </>
              ) : null}
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-neutral-700" />
              ) : (
                <Menu className="h-6 w-6 text-neutral-700" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <Link href="#" className="flex items-center gap-2" onClick={handleLinkClick}>
              <SVGComponent className="h-8 w-auto" />
              <span
                className="text-xl font-semibold text-neutral-900"
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
              <X className="h-5 w-5 text-neutral-700" />
            </Button>
          </div>

          {/* Mobile Nav Links */}
          <div className="flex-1 overflow-y-auto py-6">
            <div className="flex flex-col space-y-1 px-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile CTA Buttons */}
          <div className="p-6 border-t border-neutral-200 space-y-3">
            {!loading && user ? (
              <Link href="/dashboard" onClick={handleLinkClick} className="block">
                <Button variant="primary-gradient" size="lg" className="w-full">
                  Dashboard
                </Button>
              </Link>
            ) : !loading ? (
              <>
                <Link href="/signup" onClick={handleLinkClick} className="block">
                  <Button variant="primary-gradient" size="lg" className="w-full">
                    Start Now
                  </Button>
                </Link>
                <Link href="/login" onClick={handleLinkClick} className="block">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-cyan-600 text-cyan-600 hover:bg-cyan-50"
                  >
                    Start free trial
                  </Button>
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}