"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WakeLogo, GitHubIcon } from "@/components/icons";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenInstall: () => void;
  onOpenDocs: () => void;
}

export function Header({ onOpenInstall, onOpenDocs }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/40 bg-[#fafaf9]/90 backdrop-blur-xs transition-colors shrink-0">
      <div className="mx-auto flex h-16 sm:h-20 max-w-[1200px] items-center justify-between px-6 sm:px-8">
        {/* Left: Simply Wake */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-zinc-950 focus-visible:outline-offset-4 rounded-md"
            aria-label="Wake Home"
          >
            <WakeLogo />
          </Link>
        </div>

        {/* Right: Docs, GitHub, Install Wake */}
        <nav
          className="hidden md:flex items-center gap-7 text-sm font-normal text-zinc-600"
          aria-label="Main Navigation"
        >
          <button
            type="button"
            onClick={onOpenDocs}
            className="group relative py-1 transition-all duration-180 ease-out hover:text-zinc-950 hover:translate-x-[0.5px] focus-visible:outline-2 focus-visible:outline-zinc-950 focus-visible:outline-offset-2 rounded cursor-pointer"
          >
            <span>Docs</span>
            <span className="absolute bottom-0 left-0 right-0 h-px bg-zinc-950 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left opacity-60 pointer-events-none" />
          </button>

          <a
            href="https://github.com/wealthy-org/Wake"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative py-1 inline-flex items-center gap-1.5 transition-all duration-180 ease-out hover:text-zinc-950 hover:translate-x-[0.5px] focus-visible:outline-2 focus-visible:outline-zinc-950 focus-visible:outline-offset-2 rounded"
          >
            <GitHubIcon className="size-4 text-zinc-400 group-hover:text-zinc-800 transition-colors duration-180" />
            <span>GitHub</span>
            <span className="absolute bottom-0 left-0 right-0 h-px bg-zinc-950 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left opacity-60 pointer-events-none" />
          </a>

          <Button
            size="sm"
            onClick={onOpenInstall}
            className="rounded-lg bg-zinc-950 hover:bg-black text-white font-medium shadow-2xs hover:shadow-xs hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 ease-out h-9 px-4 cursor-pointer border border-zinc-900"
          >
            Install Wake
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="p-2 rounded-lg text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors focus-visible:outline-2 focus-visible:outline-zinc-950 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200/60 bg-[#fafaf9] px-6 py-5 shadow-xs animate-in slide-in-from-top-1 duration-150">
          <nav className="flex flex-col gap-4 text-sm font-normal text-zinc-700">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDocs();
              }}
              className="py-2 text-left hover:text-zinc-950 cursor-pointer"
            >
              Docs
            </button>

            <a
              href="https://github.com/wealthy-org/Wake"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2 hover:text-zinc-950"
            >
              <GitHubIcon className="size-4 text-zinc-400" />
              <span>GitHub</span>
            </a>

            <div className="pt-2 border-t border-zinc-200/40">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInstall();
                }}
                className="w-full rounded-lg bg-zinc-950 hover:bg-black text-white h-10 font-medium cursor-pointer"
              >
                Install Wake
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
