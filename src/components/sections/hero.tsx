"use client";

import React, { useRef, useEffect } from "react";
import { GitHubIcon } from "@/components/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

interface HeroProps {
  onOpenInstall: () => void;
}

export function Hero({ onOpenInstall }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Disable cursor reactivity on touch-only devices
    if (window.matchMedia("(hover: none)").matches) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        el.style.setProperty("--mouse-x", `${x}px`);
        el.style.setProperty("--mouse-y", `${y}px`);
        el.style.setProperty("--mouse-active", "1");
      });
    };

    const handlePointerLeave = () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      el.style.setProperty("--mouse-active", "0");
    };

    el.addEventListener("pointermove", handlePointerMove, { passive: true });
    el.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Hero Introduction"
      className="relative w-full min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-5rem)] flex flex-col justify-center items-center overflow-hidden wake-grid-pattern px-6 sm:px-8 py-10 sm:py-14 md:py-10 lg:py-12"
    >
      {/* 1. Base subtle ambient radial lighting */}
      <div
        className="pointer-events-none absolute inset-0 wake-ambient-radial wake-grid-mask select-none"
        aria-hidden="true"
      />

      {/* 2. Soft Cursor Light: Subtle radial highlight illuminating the technical surface */}
      <div
        className="pointer-events-none absolute inset-0 wake-cursor-light select-none"
        aria-hidden="true"
      />

      {/* 3. Cursor-Reactive Grid Overlay: Grid lines near cursor become slightly clearer */}
      <div
        className="pointer-events-none absolute inset-0 wake-grid-reactive select-none"
        aria-hidden="true"
      />

      {/* Hero Content Container - Vertically centered */}
      <div className="relative z-10 w-full max-w-[860px] mx-auto text-center flex flex-col items-center animate-wake-in my-auto">
        
        {/* Eyebrow Badge (shadcn UI Badge) */}
        <Badge
          variant="outline"
          className="font-mono text-[11px] sm:text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase px-3 py-1 border-zinc-200/80 bg-white/70 shadow-2xs mb-4 sm:mb-6 rounded-full"
        >
          LOCAL-FIRST ON-CHAIN OBSERVATION
        </Badge>

        {/* Main Headline - Static and elegant */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[80px] font-medium tracking-[-0.035em] text-zinc-950 leading-[1.05] text-balance mb-4 sm:mb-6 font-sans">
          Observe wallet rotations. <br />
          <span className="text-zinc-500 font-normal">Locally.</span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-600 font-normal leading-relaxed max-w-2xl text-balance mb-2.5 sm:mb-3">
          Wake is a local TypeScript terminal for observing wallet rotations on Robinhood Chain.
        </p>

        {/* Subtle Integrated Local Software Statement */}
        <p className="text-xs sm:text-sm md:text-base text-zinc-500 font-normal max-w-xl text-balance mb-6 sm:mb-8">
          Wake is local software. It runs on your own computer.
        </p>

        {/* CTAs with refined hover states */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-4 sm:mb-5">
          <Button
            size="lg"
            onClick={onOpenInstall}
            className="w-full sm:w-auto rounded-lg bg-zinc-950 hover:bg-black text-white font-medium shadow-2xs hover:shadow-xs hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 ease-out h-11 px-6 cursor-pointer border border-zinc-900"
          >
            Install Wake
          </Button>

          <a
            href="https://github.com/wealthy-org/Wake"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto rounded-lg bg-transparent hover:bg-zinc-100/90 hover:border-zinc-400/90 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 ease-out text-zinc-800 border-zinc-300 font-medium h-11 px-6 gap-2 cursor-pointer"
            )}
          >
            <GitHubIcon className="size-4 text-zinc-700" />
            <span>View on GitHub</span>
          </a>
        </div>

        {/* Small Supporting Line */}
        <p className="text-xs sm:text-sm text-zinc-500 font-normal tracking-tight text-center">
          Runs locally · No central server · No wallet connection
        </p>

      </div>
    </section>
  );
}
