"use client";

import Link from "next/link";
import { Globe, Share2, Camera, ScreenShare } from "lucide-react";
import SVGComponent from "@/components/sections/logo";

const NAV_GROUPS = [
  {
    label: "Product",
    links: [
      { href: "#problems", label: "Why Bizify" },
      { href: "#features", label: "Features" },
      { href: "#hiw",      label: "How It Works" },
      { href: "#pricing",  label: "Pricing" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Contact" },
    ],
  },
];

const SOCIALS = [
  { icon: Globe,       label: "LinkedIn",   bg: "#0a66c2" },
  { icon: Share2,      label: "Twitter / X", bg: "#101419" },
  { icon: Camera,      label: "Instagram",  bg: "#d62976" },
  { icon: ScreenShare, label: "YouTube",    bg: "#ff0000" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand — spans 2 cols on lg */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="#" className="inline-flex items-center gap-2">
              <SVGComponent className="h-8 w-auto" />
              <span
                className="text-[2rem] font-semibold leading-none text-neutral-900"
                style={{ fontFamily: "var(--font-cormorant-sc)" }}
              >
                Bizify
              </span>
            </Link>
            <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
              The AI-powered platform that guides early-stage entrepreneurs from
              first idea to first customer.
            </p>

            {/* Animated social icons */}
            <ul className="flex gap-2 pt-1" aria-label="Social media links">
              {SOCIALS.map(({ icon: Icon, label, bg }) => (
                <li key={label} className="relative group">
                  {/* Tooltip */}
                  <span
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-0.5 text-xs text-white opacity-0 invisible transition-all duration-300 group-hover:opacity-100 group-hover:visible"
                    style={{
                      bottom: "calc(100% + 8px)",
                      background: bg,
                    }}
                    aria-hidden="true"
                  >
                    {label}
                  </span>

                  {/* Circle icon with fill-from-bottom */}
                  <a
                    href="#"
                    aria-label={label}
                    className="relative flex size-9 items-center justify-center rounded-full border border-neutral-200 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{ ["--social-bg" as string]: bg }}
                  >
                    {/* Rising fill */}
                    <span
                      className="absolute inset-x-0 bottom-0 h-0 group-hover:h-full transition-all duration-300 ease-in-out"
                      style={{ background: bg }}
                      aria-hidden="true"
                    />
                    {/* Icon */}
                    <Icon className="relative z-10 size-3.5 text-neutral-500 group-hover:text-white transition-colors duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav groups */}
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-4">
              <h4 className="text-sm font-semibold text-neutral-900">{group.label}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal row */}
        <div className="border-t border-neutral-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-neutral-400">
          <p>&copy; 2025 Bizify. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-neutral-700 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-neutral-700 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-neutral-700 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
