"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number;
}

export default function Logo({ className, iconOnly = false, size = 40 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Ícone da Logo */}
      <div 
        className="relative flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="Evolux Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Texto da Logo */}
      {!iconOnly && (
        <span className="text-2xl font-black tracking-tight brand-gradient-text">
          Evolux
        </span>
      )}
    </div>
  );
}
