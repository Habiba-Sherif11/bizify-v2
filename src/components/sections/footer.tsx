"use client";

// External libraries
import Link from "next/link";

// Internal components
import { Button } from "@/components/ui/button";
import SVGComponent from "@/components/sections/logo";

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SVGComponent className="h-8 w-auto" />
              <span
                className="text-xl font-semibold text-neutral-900"
                style={{ fontFamily: "var(--font-cormorant-sc)" }}
              >
                Bizify
              </span>
            </div>
            <p className="text-sm text-neutral-600">
              The AI-powered platform guiding entrepreneurs from idea to thriving business.
            </p>
            <div className="flex gap-3 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <Button
                  key={i}
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="bg-neutral-200 hover:bg-neutral-300"
                  aria-label={`Social link ${i}`}
                />
              ))}
            </div>
          </div>

          {/* Pages */}
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-900">Pages</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-neutral-600 hover:text-neutral-900 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-600 hover:text-neutral-900 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-600 hover:text-neutral-900 transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-600 hover:text-neutral-900 transition">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-900">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-neutral-600 hover:text-neutral-900 transition">
                  AI Consultation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-600 hover:text-neutral-900 transition">
                  Business Planning
                </Link>
              </li>
              <li>
                <Link href="#" className="text-neutral-600 hover:text-neutral-900 transition">
                  Market Research
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-neutral-900">Contact</h4>
            <div className="space-y-2 text-sm">
              <p className="text-neutral-600">(406) 555-0120</p>
              <p className="text-neutral-600">contact@bizify.com</p>
              <p className="text-neutral-600">
                2972 Westheimer Rd.
                <br />
                Santa Ana, Illinois 85486
              </p>
            </div>
          </div>
        </div>

        {/* Divider & Legal */}
        <div className="border-t border-neutral-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-neutral-600">
            <p>&copy; 2024 Bizify. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <Link href="#" className="hover:text-neutral-900 transition">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-neutral-900 transition">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-neutral-900 transition">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}