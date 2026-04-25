"use client";

import { ReactNode } from "react";
import Image from "next/image";

interface SectionWithBgProps {
  children: ReactNode;
  backgroundImage?: string;
  bgColor?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  overlayColor?: string;
  className?: string;
  contentClassName?: string;
  id?: string;
}

export function SectionWithBg({
  children,
  backgroundImage,
  bgColor = "bg-white",
  overlay = true,
  overlayOpacity = 0.5,
  overlayColor = "bg-black",
  className = "",
  contentClassName = "",
  id,
}: SectionWithBgProps) {
  return (
    <section
      id={id}
      className={`relative w-full overflow-hidden ${className}`}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={backgroundImage}
            alt="Section background"
            fill
            className="object-cover"
            priority={false}
          />
        </div>
      )}

      {/* Background Color Fallback */}
      {!backgroundImage && <div className={`absolute inset-0 ${bgColor}`} />}

      {/* Overlay */}
      {overlay && backgroundImage && (
        <div 
          className={`absolute inset-0 ${overlayColor}`}
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Content */}
      <div className={`relative z-10 w-full ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}