import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Metadata } from "next";

// Fonts
import { Inter, Cormorant_SC, Geist } from "next/font/google";

// Styles
import "@/styles/globals.css";
import "@/styles/animations.css";

// Utilities
import { cn } from "@/lib/utils";

// Providers
import { AnimationProvider } from "@/components/providers/AnimationProvider";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { ThemeProvider } from "@/features/dashboard/context/ThemeContext";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorantSC = Cormorant_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant-sc",
});

export const metadata: Metadata = {
  title: "Bizify - AI-Powered Platform for Startup Founders",
  description:
    "From idea to launch with an AI co-founder by your side. Bizify guides entrepreneurs through every step of building a startup with AI at every step.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased font-sans",
        geist.variable,
        inter.variable,
        cormorantSC.variable
      )}
    >
      <body className="min-h-screen flex flex-col">
        <ReactQueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <AnimationProvider>
                {children}
                <ToastContainer position="top-right" />
              </AnimationProvider>
            </AuthProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}