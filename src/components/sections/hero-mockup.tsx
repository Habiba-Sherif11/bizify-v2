"use client";

// External libraries
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { X, RotateCcw, RotateCw, Menu } from "lucide-react";

interface HeroMockupProps {
  imageSrc: string | StaticImageData;
  imageAlt?: string;
}

export function HeroMockup({
  imageSrc,
  imageAlt = "Bizify Dashboard",
}: HeroMockupProps) {
  return (
    <div className="w-full flex justify-center">
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          aspectRatio: "800/544.81",
          position: "relative",
        }}
      >
        {/* Blur layer 1 */}
        <div
          style={{
            width: "88.49%",
            height: "88.38%",
            left: "5.75%",
            top: "18.84%",
            position: "absolute",
            background: "rgba(255, 255, 255, 0.32)",
            borderRadius: 8,
            backdropFilter: "blur(9.50px)",
          }}
        />

        {/* Blur layer 2 - bottom bar */}
        <div
          style={{
            width: "95.44%",
            height: "4.76%",
            left: "2.28%",
            top: "98.88%",
            position: "absolute",
            background: "rgba(255, 255, 255, 0.42)",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.07)",
            borderRadius: 8,
            backdropFilter: "blur(13.50px)",
          }}
        />

        {/* Main container */}
        <div
          style={{
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            position: "absolute",
            background: "rgba(255, 255, 255, 0.30)",
            boxShadow:
              "0px 5px 19px rgba(0, 0, 0, 0.12), 0px 1px 0px rgba(255, 255, 255, 0.70) inset",
            borderRadius: 8,
            backdropFilter: "blur(54px)",
          }}
        />

        {/* Top bar accent */}
        <div
          style={{
            width: "40.95%",
            height: "2.78%",
            left: "29.26%",
            top: "1.39%",
            position: "absolute",
            opacity: 0.2,
            background: "#716D8E",
            borderRadius: 4,
          }}
        />

        {/* Close button */}
        <div
          style={{
            width: "3%",
            height: "1.8%",
            left: "26.86%",
            top: "1.94%",
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={14} strokeWidth={2} />
        </div>

        {/* Logo section */}
        <div
          style={{
            width: "7.7%",
            left: "45.68%",
            top: "1.72%",
            position: "absolute",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 8,
            display: "flex",
          }}
        >
          <div style={{ width: "0.57%", height: "1.25%", background: "black", borderRadius: 2 }} />
          <div
            style={{
              fontSize: "10px",
              fontFamily: "Mulish, sans-serif",
              fontWeight: "600",
              color: "black",
            }}
          >
            Bizify.com
          </div>
        </div>

        {/* Traffic light indicators */}
        <div
          style={{
            width: "0.76%",
            height: "1.11%",
            left: "1.14%",
            top: "2.22%",
            position: "absolute",
            background: "#D8695B",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            width: "0.76%",
            height: "1.11%",
            left: "2.37%",
            top: "2.22%",
            position: "absolute",
            background: "#EAC213",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            width: "0.76%",
            height: "1.11%",
            left: "3.59%",
            top: "2.22%",
            position: "absolute",
            background: "#79C743",
            borderRadius: "50%",
          }}
        />

        {/* Top right icons */}
        <div
          style={{
            width: "2.5%",
            height: "1.95%",
            left: "97.05%",
            top: "1.67%",
            transform: "translateX(-100%)",
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Menu size={14} strokeWidth={2} />
        </div>
        <div
          style={{
            width: "1.14%",
            height: "1.67%",
            left: "94.21%",
            top: "1.81%",
            transform: "translateX(-100%)",
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RotateCw size={12} strokeWidth={2} />
        </div>
        <div
          style={{
            width: "1.01%",
            height: "2.04%",
            left: "91.43%",
            top: "1.67%",
            transform: "translateX(-100%)",
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RotateCcw size={12} strokeWidth={2} />
        </div>

        {/* Screenshot */}
        <div
          style={{
            width: "99.98%",
            height: "94.49%",
            left: 0,
            top: "5.55%",
            position: "absolute",
            boxShadow: "0px -3px 18px -6px rgba(0, 0, 0, 0.25) inset",
            borderBottomRightRadius: 8,
            borderBottomLeftRadius: 8,
            overflow: "hidden",
          }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
          />
        </div>
      </div>
    </div>
  );
}