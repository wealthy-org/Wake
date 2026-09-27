import React from "react";

interface WakeLogoProps {
  className?: string;
}

export function WakeLogo({ className = "" }: WakeLogoProps) {
  return (
    <div className={`group inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Bespoke Geometric Wake Logomark: A minimalist technical aperture with subtle hover micro-interaction */}
      <div className="relative flex items-center justify-center size-7 rounded-md bg-zinc-950 text-white shadow-2xs transition-all duration-200 ease-out group-hover:-translate-y-[1px] group-hover:rotate-[1.5deg] group-hover:shadow-xs">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 text-zinc-100"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8.5" strokeWidth="1" strokeDasharray="2 2" className="opacity-35" />
          <path d="M6.5 8L9.5 16.5L12 11.5L14.5 16.5L17.5 8" strokeWidth="1.8" />
          <circle cx="12" cy="11.5" r="1.2" fill="currentColor" />
        </svg>
      </div>

      {/* Pure wordmark: Wake */}
      <span className="font-semibold text-lg tracking-[-0.03em] text-zinc-950 font-sans transition-colors duration-200 group-hover:text-black">
        Wake
      </span>
    </div>
  );
}
